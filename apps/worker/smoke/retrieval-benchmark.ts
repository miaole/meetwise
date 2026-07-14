/**
 * 全局池检索评测(不掺水)+ **维度对比**：C-MTEB T2Reranking 全部候选汇成大库,每查询从整库检索。
 *   嵌一次 1024(Matryoshka)→ 截断扫 dim {128,512,1024} 看大库下维度影响 → 最优维跑全管线(加权hybrid / 两段式rerank)。
 *   pnpm retrieval:benchmark [N]   (N 默认 100;需 .env+联网;嵌入持久化 scratch,迭代不重算)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dashscopeEmbedder, cachingEmbedder, dashscopeReranker, buildBm25, denseRank, weightedRrf, evalRecall, type EmbeddingStore } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL|RERANK_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const N = Number(process.argv[2] ?? 100);
const DS = encodeURIComponent('C-MTEB/T2Reranking');
const CACHE = process.env.SMOKE_CACHE ?? './.smoke/emb1024.json';   // 嵌入缓存(默认 .smoke/,gitignored;可置 SMOKE_CACHE 覆盖)
const clean = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500) || '空';
const truncate = (v: number[], d: number) => { const t = v.slice(0, d); const nm = Math.hypot(...t) || 1; return t.map((x) => x / nm); };

function fileStore(): EmbeddingStore {
  const m: Record<string, number[]> = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
  return { async getMany(keys) { return keys.map((k) => m[k] ?? null); }, async putMany(items) { for (const it of items) m[it.key] = it.vec; writeFileSync(CACHE, JSON.stringify(m)); } };
}
async function fetchRows(n: number) {
  const out: any[] = [];
  for (let off = 0; out.length < n; off += 100) {
    const res = await fetch(`https://datasets-server.huggingface.co/rows?dataset=${DS}&config=default&split=dev&offset=${off}&length=100`);
    if (!res.ok) throw new Error('hf_' + res.status);
    const j = await res.json() as any; if (!j.rows.length) break;
    for (const r of j.rows) if (r.row.positive?.length && r.row.negative?.length) out.push(r.row);
  }
  return out.slice(0, n);
}

async function main() {
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
  const cVecs = await emb.embed(corpus.map((c) => c.text));
  const qVecs = await emb.embed(golden.map((g) => g.query));
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
      const candIds = weightedRrf([{ ids: denseRank(truncate(qVecs[i], D), cD, 30), weight: 1 }, { ids: bm25.rank(golden[i].query, 30), weight: 0.4 }], 30);
      const cand = candIds.map((id) => corpus.find((c) => c.id === id)!).filter(Boolean);
      rer.push(await reranker.rerank(golden[i].query, cand.map((c) => ({ id: c.id, text: c.text })), k));
    }
    line(`两段式 rerank k=${k}`, evalRecall(rer, golden, k));
  }
  console.log('─'.repeat(78) + '\n注:全局池=整库检索无小池红利;hit@k=产品召回成功率,目标≥90%。');
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
