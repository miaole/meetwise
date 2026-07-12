/**
 * 检索管线（生产）：把"召回→融合→精排→多查询"组合成可冲 90% 的两段式检索。各原语在 retrieval/embedder/reranker。
 *   召回:dense(向量) + BM25(词法) → **加权 RRF**(非等权——实测稠密强时等权会被 BM25 拖累) → top-N
 *   精排:gte-rerank cross-encoder 把 top-N 精排到 top-k
 *   多查询:LLM 把口语 query 改写成多检索式,各自召回并集融合(提模糊 query 召回)
 * 所有外部能力经 seam 注入,可 gate(fake embedder/reranker)。
 */
import type { Embedder } from './embedder.ts';
import type { Reranker } from './reranker.ts';
import type { ModelClient } from './model-client.ts';
import { buildBm25, denseRank } from './retrieval.ts';

/** 加权 RRF:每路给权重,倒数秩加权和。dense 通常权重 > bm25。 */
export function weightedRrf(lists: { ids: string[]; weight: number }[], k: number, c = 60): string[] {
  const score = new Map<string, number>();
  for (const { ids, weight } of lists) ids.forEach((id, r) => score.set(id, (score.get(id) ?? 0) + weight / (c + r + 1)));
  return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map((e) => e[0]);
}

export interface SearchDoc { id: string; text: string }
export interface SearchOpts {
  k?: number;
  mode?: 'dense' | 'hybrid' | 'rerank';
  recallN?: number;                       // 召回阶段捞多少(精排前)
  weights?: { dense: number; bm25: number };
  reranker?: Reranker;
}

export interface SearchIndex {
  search(query: string, opts?: SearchOpts): Promise<string[]>;
  readonly size: number;
}

/** 建索引:语料一次性嵌入(配合 cachingEmbedder 不重算)+ BM25。生产大库换 pgvector ANN,search 接口不变。 */
export async function buildSearchIndex(docs: SearchDoc[], embedder: Embedder): Promise<SearchIndex> {
  const vecs = await embedder.embed(docs.map((d) => d.text));
  const corpus = docs.map((d, i) => ({ id: d.id, text: d.text, vec: vecs[i] }));
  const bm25 = buildBm25(docs);
  return {
    size: docs.length,
    async search(query, opts = {}) {
      const k = opts.k ?? 5, N = opts.recallN ?? Math.max(20, k * 4), mode = opts.mode ?? 'rerank';
      const w = opts.weights ?? { dense: 1, bm25: 0.5 };
      const [qv] = await embedder.embed([query]);
      const dense = denseRank(qv, corpus.map((c) => ({ id: c.id, vec: c.vec })), N);
      if (mode === 'dense') return dense.slice(0, k);
      const lex = bm25.rank(query, N);
      const fused = weightedRrf([{ ids: dense, weight: w.dense }, { ids: lex, weight: w.bm25 }], mode === 'hybrid' ? k : N);
      if (mode === 'hybrid' || !opts.reranker) return fused.slice(0, k);
      const cand = fused.map((id) => corpus.find((c) => c.id === id)!).filter(Boolean); // 融合候选 → 精排
      return opts.reranker.rerank(query, cand.map((c) => ({ id: c.id, text: c.text })), k);
    },
  };
}

/** 多查询扩展:LLM 把 query 改写成 n 个等价检索式,逐个 dense 召回后 RRF 并集——提模糊/口语 query 召回。 */
export async function expandQuery(query: string, model: ModelClient, n = 3): Promise<string[]> {
  const res = await model.complete({
    system: '你是检索查询改写器。把用户问题改写成不同措辞的等价检索式以提升召回,只输出 JSON。',
    data: `原问题：${query}\n输出 {"queries": string[]}（${n} 条，措辞各异、保留核心检索意图）`,
    responseFormat: 'json',
  }, 0);
  if (!res.ok) return [];
  try { const v = JSON.parse(res.raw as string); return Array.isArray(v.queries) ? v.queries.slice(0, n) : []; } catch { return []; }
}

export async function multiQuerySearch(query: string, index: SearchIndex, model: ModelClient, opts: SearchOpts = {}): Promise<string[]> {
  const variants = await expandQuery(query, model);
  const lists = await Promise.all([query, ...variants].map((q) => index.search(q, { ...opts, mode: 'dense', k: opts.recallN ?? 20 })));
  return weightedRrf(lists.map((ids) => ({ ids, weight: 1 })), opts.k ?? 5);
}
