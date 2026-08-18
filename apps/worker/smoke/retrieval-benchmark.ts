/**
 * 全局池检索评测(不掺水)+ **维度对比**：C-MTEB T2Reranking 全部候选汇成大库,每查询从整库检索。
 *   嵌一次 1024(Matryoshka)→ 截断扫 dim {128,512,1024} 看大库下维度影响 → 最优维跑全管线(加权hybrid / 两段式rerank)。
 *   pnpm retrieval:benchmark [N]   (N 默认 100;需 .env+联网;嵌入持久化 scratch,迭代不重算)
 *
 * offline benchmark，不作发布证据；发布阈值须冻结数据集预注册（见 ai-docs/testing/rag-retrieval-evaluation-baseline.md）。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { dashscopeEmbedder, cachingEmbedder, dashscopeReranker, buildBm25, denseRank, weightedRrf, evalRecall, fetchWithTimeout, type Embedder, type EmbeddingStore } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL|RERANK_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const N = Number(process.argv[2] ?? 100);
const DS = encodeURIComponent('C-MTEB/T2Reranking');
const CACHE = process.env.SMOKE_CACHE ?? './.smoke/emb1024.json';   // 嵌入缓存(默认 .smoke/,gitignored;可置 SMOKE_CACHE 覆盖)
const REQUEST_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS ?? 10_000);
const MAX_WALL_MS = Number(process.env.RETRIEVAL_BENCHMARK_MAX_MS ?? 10 * 60_000);
const startedAt = Date.now();
const clean = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500) || '空';
const truncate = (v: number[], d: number) => { const t = v.slice(0, d); const nm = Math.hypot(...t) || 1; return t.map((x) => x / nm); };

function assertBudget(stage: string): void {
  const elapsed = Date.now() - startedAt;
  if (elapsed > MAX_WALL_MS) throw new Error(`benchmark_wall_timeout:${stage}:elapsed_ms=${elapsed}:budget_ms=${MAX_WALL_MS}`);
}

async function embedBatched(embedder: Embedder, texts: string[], label: string): Promise<number[][]> {
  const out: number[][] = [];
  const sliceSize = 100; // 每段至多 10 个 provider 请求，既能报进度，也能在段间检查全局预算。
  for (let i = 0; i < texts.length; i += sliceSize) {
    assertBudget(`embed:${label}:${i}/${texts.length}`);
    out.push(...await embedder.embed(texts.slice(i, i + sliceSize)));
    console.log(`  ${label} ${Math.min(i + sliceSize, texts.length)}/${texts.length}; elapsed=${Date.now() - startedAt}ms`);
  }
  return out;
}

function fileStore(): EmbeddingStore {
  mkdirSync(dirname(CACHE), { recursive: true });
  const m: Record<string, number[]> = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
  return { async getMany(keys) { return keys.map((k) => m[k] ?? null); }, async putMany(items) { for (const it of items) m[it.key] = it.vec; writeFileSync(CACHE, JSON.stringify(m)); } };
}
async function fetchRows(n: number) {
  const out: any[] = [];
  for (let off = 0; out.length < n; off += 100) {
    assertBudget(`dataset:${off}`);
    const res = await fetchWithTimeout(`https://datasets-server.huggingface.co/rows?dataset=${DS}&config=default&split=dev&offset=${off}&length=100`, {}, REQUEST_TIMEOUT_MS);
    if (!res.ok) throw new Error('hf_' + res.status);
    const j = await res.json() as any; if (!j.rows.length) break;
    for (const r of j.rows) if (r.row.positive?.length && r.row.negative?.length) out.push(r.row);
  }
  return out.slice(0, n);
}

async function main() {
  if (!Number.isSafeInteger(N) || N < 1) throw new Error(`benchmark_invalid_query_count:${N}`);
  // 公开评测也必须有请求和全局时限；不能以无界调用换取一个漂亮但不可运营的数字。
  if (!process.env.HTTP_TIMEOUT_MS) process.env.HTTP_TIMEOUT_MS = String(REQUEST_TIMEOUT_MS);
  const rows = await fetchRows(N);
  const corpus: { id: string; text: string }[] = [];
  const golden: { query: string; relevant: string[] }[] = [];
  rows.forEach((r, i) => {
    const rel: string[] = [];
    r.positive.forEach((t: string, j: number) => { const id = `q${i}_p${j}`; corpus.push({ id, text: clean(t) }); rel.push(id); });
    r.negative.forEach((t: string, j: number) => corpus.push({ id: `q${i}_n${j}`, text: clean(t) }));
    golden.push({ query: clean(r.query), relevant: rel });
  });
  console.log(`全局语料 ${corpus.length} 篇,查询 ${golden.length} 条(从整库检索)。嵌入 @1024(文件缓存)…`);
  const emb = cachingEmbedder(dashscopeEmbedder({ dim: 1024 }), fileStore());
  const cVecs = await embedBatched(emb, corpus.map((c) => c.text), 'corpus');
  const qVecs = await embedBatched(emb, golden.map((g) => g.query), 'queries');
  const line = (lbl: string, r: any) => console.log(`${lbl.padEnd(24)} hit@k=${(r.hitRate * 100).toFixed(1)}%  recall@k(全)=${(r.recall * 100).toFixed(1)}%  MRR=${r.mrr.toFixed(3)}  nDCG=${r.ndcg.toFixed(3)}`);

  console.log('─'.repeat(78) + '\n【维度对比 · 纯向量召回 · 大库】');
  for (const d of [128, 512, 1024]) {
    const cD = cVecs.map((v, i) => ({ id: corpus[i].id, vec: truncate(v, d) }));
    for (const k of [5, 10]) line(`dim=${d} k=${k}`, evalRecall(golden.map((g, i) => denseRank(truncate(qVecs[i], d), cD, k)), golden, k));
  }

  // 最优维(512)跑全管线
  const D = 512;
  const cD = cVecs.map((v, i) => ({ id: corpus[i].id, vec: truncate(v, D) }));
  const bm25 = buildBm25(corpus);
  const reranker = dashscopeReranker();
  console.log('─'.repeat(78) + `\n【全管线 @dim${D}】`);
  for (const k of [5, 10]) {
    const dense = golden.map((g, i) => denseRank(truncate(qVecs[i], D), cD, k));
    const hybrid = golden.map((g, i) => weightedRrf([{ ids: denseRank(truncate(qVecs[i], D), cD, 30), weight: 1 }, { ids: bm25.rank(g.query, 30), weight: 0.4 }], k));
    line(`Dense k=${k}`, evalRecall(dense, golden, k));
    line(`Hybrid(加权) k=${k}`, evalRecall(hybrid, golden, k));
    // 两段式:hybrid 召回 top-30 → rerank → top-k
    const rer: string[][] = [];
    for (let i = 0; i < golden.length; i++) {
      assertBudget(`rerank:k${k}:${i}/${golden.length}`);
      const candIds = weightedRrf([{ ids: denseRank(truncate(qVecs[i], D), cD, 30), weight: 1 }, { ids: bm25.rank(golden[i].query, 30), weight: 0.4 }], 30);
      const cand = candIds.map((id) => corpus.find((c) => c.id === id)!).filter(Boolean);
      rer.push(await reranker.rerank(golden[i].query, cand.map((c) => ({ id: c.id, text: c.text })), k));
      if ((i + 1) % 20 === 0) console.log(`  rerank k=${k} ${i + 1}/${golden.length}; elapsed=${Date.now() - startedAt}ms`);
    }
    line(`两段式 rerank k=${k}`, evalRecall(rer, golden, k));
  }
  console.log('─'.repeat(78) + '\n注:全局池=整库检索无小池红利；hit@k 是“至少命中一个”的运营指标，发布阈值必须按冻结数据集预注册。');
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
