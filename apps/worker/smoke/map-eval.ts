/**
 * 官方口径对齐:C-MTEB T2Reranking 的 **MAP**(MTEB 重排官方指标),per-query 重排全部候选。
 * 用来回答"为啥跟网上不一样"——MAP 才是 leaderboard 上的数,看它是否落在 text-embedding-v4 公开 ~0.66 附近。
 *   pnpm map:eval [N]
 */
import { readFileSync } from 'node:fs';
import { dashscopeEmbedder, cachingEmbedder, inMemoryEmbeddingStore, denseRank, evalRecall } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const N = Number(process.argv[2] ?? 150);
const DS = encodeURIComponent('C-MTEB/T2Reranking');
const clean = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1500) || '空';
const truncate = (v: number[], d: number) => { const t = v.slice(0, d); const nm = Math.hypot(...t) || 1; return t.map((x) => x / nm); };

async function fetchRows(n: number) {
  const out: any[] = [];
  for (let off = 0; out.length < n; off += 100) {
    const r = await fetch(`https://datasets-server.huggingface.co/rows?dataset=${DS}&config=default&split=dev&offset=${off}&length=100`);
    const j = await r.json() as any; if (!j.rows.length) break;
    for (const x of j.rows) if (x.row.positive?.length && x.row.negative?.length) out.push(x.row);
  }
  return out.slice(0, n);
}

async function main() {
  const rows = await fetchRows(N);
  const base = cachingEmbedder(dashscopeEmbedder({ dim: 1024 }), inMemoryEmbeddingStore());
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const emb = { async embed(texts: string[]): Promise<number[][]> { for (let a = 0; ; a++) { try { return await base.embed(texts); } catch (e) { if (a >= 3) throw e; await sleep(1500 * (a + 1)); } } } };
  const perQ: { qv: number[]; cand: { id: string; vec: number[] }[]; relevant: string[] }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const cand = [...r.positive.map((t: string, j: number) => ({ t: clean(t), id: `p${j}`, rel: true })), ...r.negative.map((t: string, j: number) => ({ t: clean(t), id: `n${j}`, rel: false }))];
    const vs = await emb.embed([clean(r.query), ...cand.map((c) => c.t)]);
    perQ.push({ qv: vs[0], cand: cand.map((c, j) => ({ id: c.id, vec: vs[j + 1] })), relevant: cand.filter((c) => c.rel).map((c) => c.id) });
    if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${rows.length}`);
  }
  const golden = perQ.map((p) => ({ query: '', relevant: p.relevant }));
  console.log('─'.repeat(60));
  for (const d of [512, 1024]) {
    // per-query 全候选排名(MAP 用完整排名)
    const full = perQ.map((p) => denseRank(truncate(p.qv, d), p.cand.map((c) => ({ id: c.id, vec: truncate(c.vec, d) })), p.cand.length));
    const r = evalRecall(full, golden, full[0].length);
    console.log(`dim=${d}  MAP=${r.map.toFixed(4)}  MRR=${r.mrr.toFixed(4)}  nDCG=${r.ndcg.toFixed(4)}  (n=${r.n})`);
  }
  console.log('─'.repeat(60));
  console.log('对照:text-embedding-v4 / gte 系在 T2Reranking 公开 MAP ~0.66-0.69。落在区间内=我没测错,之前的 hit@k 只是另一个(更宽松)指标。');
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
