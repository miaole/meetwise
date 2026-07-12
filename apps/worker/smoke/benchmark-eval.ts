/**
 * 标准 benchmark 召回评测：C-MTEB **T2Reranking**(dev,官方 positive/negative 标注),真 text-embedding-v4。
 * 不是自造金标——拉公开测试集、用官方标签、跑准确度量(recall@k / MRR / nDCG@10)。dim 128 vs 1024 在标准集上复核。
 *   pnpm benchmark:eval [N]   (N=查询数,默认 150;需 .env MODEL_API_KEY + 联网拉数据集)
 */
import { readFileSync } from 'node:fs';
import { dashscopeEmbedder, cachingEmbedder, inMemoryEmbeddingStore, denseRank, evalRecall, dashscopeReranker } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const N = Number(process.argv[2] ?? 150);
const DS = encodeURIComponent('C-MTEB/T2Reranking');

interface Row { query: string; positive: string[]; negative: string[] }
async function fetchRows(n: number): Promise<Row[]> {
  const out: Row[] = [];
  for (let off = 0; out.length < n; off += 100) {
    const url = `https://datasets-server.huggingface.co/rows?dataset=${DS}&config=default&split=dev&offset=${off}&length=100`;
    const res = await fetch(url); if (!res.ok) throw new Error('hf_http_' + res.status);
    const j = await res.json() as { rows: { row: Row }[] };
    if (!j.rows.length) break;
    for (const r of j.rows) if (r.row.positive?.length && r.row.negative?.length) out.push(r.row);
  }
  return out.slice(0, n);
}

const truncate = (v: number[], d: number) => { const t = v.slice(0, d); const nm = Math.hypot(...t) || 1; return t.map((x) => x / nm); };
const clean = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500) || '空';   // 去 HTML + 限长(v4 输入上限)

async function main() {
  console.log(`拉取 C-MTEB/T2Reranking dev 前 ${N} 条(官方标注)…`);
  const rows = await fetchRows(N);
  console.log(`有效查询 ${rows.length},候选共 ${rows.reduce((a, r) => a + r.positive.length + r.negative.length, 0)} 条。嵌入(带缓存去重)…`);
  const emb = cachingEmbedder(dashscopeEmbedder({ dim: 1024 }), inMemoryEmbeddingStore());

  // 每查询:候选=positive+negative,相关=positive。逐查询嵌入并排序。
  const perQ: { qv: number[]; cand: { id: string; vec: number[]; text: string }[]; relevant: string[]; query: string }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const cand = [...r.positive.map((t, j) => ({ t: clean(t), id: `q${i}_p${j}`, rel: true })), ...r.negative.map((t, j) => ({ t: clean(t), id: `q${i}_n${j}`, rel: false }))];
    const vecs = await emb.embed([clean(r.query), ...cand.map((c) => c.t)]);
    perQ.push({ query: clean(r.query), qv: vecs[0], cand: cand.map((c, j) => ({ id: c.id, vec: vecs[j + 1], text: c.t })), relevant: cand.filter((c) => c.rel).map((c) => c.id) });
    if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${rows.length}`);
  }

  const golden = perQ.map((p) => ({ query: p.query, relevant: p.relevant }));
  const line = (lbl: string, r: any) => console.log(`${lbl.padEnd(22)} hit@k(≥1)=${(r.hitRate * 100).toFixed(1)}%  recall@k(全)=${(r.recall * 100).toFixed(1)}%  MRR=${r.mrr.toFixed(3)}  nDCG=${r.ndcg.toFixed(3)}`);
  console.log('─'.repeat(72));
  console.log('【向量召回 text-embedding-v4】');
  for (const d of [128, 1024]) for (const k of [5, 10]) {
    const retrieved = perQ.map((p) => denseRank(truncate(p.qv, d), p.cand.map((c) => ({ id: c.id, vec: truncate(c.vec, d) })), k));
    line(`dim=${d} k=${k}`, evalRecall(retrieved, golden, k));
  }
  console.log('【+ gte-rerank-v2 精排(向量 dim=128 召回全候选→重排)】');
  const reranker = dashscopeReranker();
  const reranked: string[][] = [];
  for (const p of perQ) reranked.push(await reranker.rerank(p.query, p.cand.map((c) => ({ id: c.id, text: c.text })), 10));
  for (const k of [5, 10]) line(`rerank k=${k}`, evalRecall(reranked, golden, k));
  console.log('─'.repeat(72));
  console.log('注:hit@k(≥1 相关入 top-k)=产品现实"召回成功率";recall@k(全)=找回全部相关的严格指标。');
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
