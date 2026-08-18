/**
 * 实验/离线检索管线：把"召回→融合→精排→多查询"组合成可评测的两段式检索。
 *
 * 当前生产 QBank 走 generation-aware PostgreSQL dense 检索，只有显式 rrf
 * 模式会附加 PostgreSQL FTS；本文件没有 API 或 Worker 的生产调用方。各原语在
 * retrieval/embedder/reranker，不能把这里的 BM25、rerank 或 query expansion
 * 当作已接线的 serving 能力。
 *   召回:dense(向量) + BM25(词法) → **加权 RRF**(非等权——实测稠密强时等权会被 BM25 拖累) → top-N
 *   精排:gte-rerank cross-encoder 把 top-N 精排到 top-k
 *   多查询:LLM 把口语 query 改写成多检索式,各自召回并集融合(提模糊 query 召回)
 * 所有外部能力经 seam 注入,可 gate(fake embedder/reranker)。
 */
import type { Embedder } from './embedder.ts';
import type { Reranker } from './reranker.ts';
import { z } from 'zod';
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

/** 离线/实验索引：语料一次性嵌入（配合 cachingEmbedder 不重算）+ 内存 BM25。 */
export async function buildSearchIndex(docs: SearchDoc[], embedder: Embedder): Promise<SearchIndex> {
  const vecs = await embedder.embed(docs.map((d) => d.text));
  if (vecs.length !== docs.length || vecs.some((vec) => !vec)) {
    throw new Error(`embedding_batch_mismatch:expected=${docs.length}:actual=${vecs.length}`);
  }
  const corpus = docs.map((d, i) => ({ id: d.id, text: d.text, vec: vecs[i]! }));
  const bm25 = buildBm25(docs);
  return {
    size: docs.length,
    async search(query, opts = {}) {
      const k = opts.k ?? 5, N = opts.recallN ?? Math.max(20, k * 4), mode = opts.mode ?? 'rerank';
      const w = opts.weights ?? { dense: 1, bm25: 0.5 };
      const [qv] = await embedder.embed([query]);
      if (!qv) throw new Error('embedding_query_missing');
      const dense = denseRank(qv, corpus.map((c) => ({ id: c.id, vec: c.vec })), N);
      if (mode === 'dense') return dense.slice(0, k);
      const lex = bm25.rank(query, N);
      const fused = weightedRrf([{ ids: dense, weight: w.dense }, { ids: lex, weight: w.bm25 }], mode === 'hybrid' ? k : N);
      if (mode === 'hybrid' || !opts.reranker) return fused.slice(0, k);
      const cand = fused.flatMap((id) => {
        const doc = corpus.find((c) => c.id === id);
        return doc ? [doc] : [];
      }); // 融合候选 → 精排
      return opts.reranker.rerank(query, cand.map((c) => ({ id: c.id, text: c.text })), k);
    },
  };
}

/**
 * Transport seam for query expansion.  Production code must implement this
 * through `invoke` (durable idempotency, admission, cost reservation and
 * post-dispatch unknown handling); accepting `ModelClient` here used to let a
 * seemingly harmless retrieval helper bypass that boundary.
 */
export interface QueryExpansionInvoker {
  invokeQueryExpansion(input: { service: 'rag.query_expand'; system: string; userData: string }): Promise<unknown>;
}

const queryExpansionOutput = z.object({ queries: z.array(z.string().min(1).max(512)).max(5) }).strict();

function boundedVariantCount(n: number): number | undefined {
  return Number.isSafeInteger(n) && n >= 1 && n <= 5 ? n : undefined;
}

function normalizeVariant(value: string): string | undefined {
  const normalized = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  return normalized.length >= 1 && normalized.length <= 512 && !/[\u0000-\u001f\u007f]/.test(normalized)
    ? normalized : undefined;
}

/**
 * 多查询扩展:模型把 query 改写成 n 个等价检索式，逐个 dense 召回后 RRF 并集。
 * 模型输出是不可信数据：对象与 JSON 字符串都严格校验、去重、去掉原 query；
 * 格式异常或调用失败只退化为原 query 检索，绝不抛出或把未校验内容送去 embedding。
 */
export async function expandQuery(query: string, invoker: QueryExpansionInvoker, n = 3): Promise<string[]> {
  const count = boundedVariantCount(n);
  const original = normalizeVariant(query);
  if (!count || !original) return [];
  let raw: unknown;
  try {
    raw = await invoker.invokeQueryExpansion({
      service: 'rag.query_expand',
      system: '你是检索查询改写器。把用户问题改写成不同措辞的等价检索式以提升召回,只输出 JSON。',
      userData: `原问题：${original}\n输出 {"queries": string[]}（最多 ${count} 条，措辞各异、保留核心检索意图）`,
    });
  } catch { return []; }
  let value = raw;
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw); } catch { return []; }
  }
  const parsed = queryExpansionOutput.safeParse(value);
  if (!parsed.success) return [];
  const seen = new Set<string>([original]);
  const variants: string[] = [];
  for (const candidate of parsed.data.queries) {
    const variant = normalizeVariant(candidate);
    if (!variant || seen.has(variant) || variants.length === count) continue;
    seen.add(variant);
    variants.push(variant);
  }
  return variants;
}

export async function multiQuerySearch(query: string, index: SearchIndex, invoker: QueryExpansionInvoker, opts: SearchOpts = {}): Promise<string[]> {
  const variants = await expandQuery(query, invoker);
  const lists = await Promise.all([query, ...variants].map((q) => index.search(q, { ...opts, mode: 'dense', k: opts.recallN ?? 20 })));
  return weightedRrf(lists.map((ids) => ({ ids, weight: 1 })), opts.k ?? 5);
}
