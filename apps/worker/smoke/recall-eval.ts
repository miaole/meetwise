/**
 * 召回率综合对比（真 text-embedding-v4）：维度 × 策略 的矩阵,定位"打到 90%+ 的最小成本配置"。
 *   维度 {64,128,256,512,768,1024}（Matryoshka 截断+归一,一次嵌入多维复用）× 策略 {BM25, Dense, Hybrid-RRF}。
 *   pnpm recall:eval   (需 .env MODEL_API_KEY)
 */
import { readFileSync } from 'node:fs';
import { dashscopeEmbedder, denseRank, buildBm25, rrf, evalRecall } from '@meetwise/ai-runtime';
import { CORPUS, QUERIES } from './retrieval-golden.ts';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const DIMS = [64, 128, 256, 512, 768, 1024];
const KS = [3, 5];
const truncate = (v: number[], d: number) => { const t = v.slice(0, d); const n = Math.hypot(...t) || 1; return t.map((x) => x / n); };

async function main() {
  const emb = dashscopeEmbedder();
  console.log(`嵌入 ${CORPUS.length} chunk + ${QUERIES.length} query @1024(随后截断复用)…`);
  const cVecs = await emb.embed(CORPUS.map((c) => c.text));
  const qVecs = await emb.embed(QUERIES.map((q) => q.q));
  const bm25 = buildBm25(CORPUS.map((c) => ({ id: c.id, text: c.text })));
  const golden = QUERIES.map((q) => ({ query: q.q, relevant: q.relevant }));

  // BM25(维度无关)基线
  for (const k of KS) {
    const r = evalRecall(QUERIES.map((q) => bm25.rank(q.q, k)), golden, k);
    console.log(`BM25            k=${k}  召回率=${(r.recall * 100).toFixed(1)}%  成功率=${(r.successRate * 100).toFixed(1)}%  MRR=${r.mrr.toFixed(3)}`);
  }
  console.log('─'.repeat(72));
  const best = { recall: 0, label: '' };
  for (const d of DIMS) {
    const cD = cVecs.map((v) => ({ id: '', vec: truncate(v, d) }));
    CORPUS.forEach((c, i) => (cD[i].id = c.id));
    for (const k of KS) {
      const dense = QUERIES.map((q, i) => denseRank(truncate(qVecs[i], d), cD, k));
      const hybrid = QUERIES.map((q, i) => rrf([denseRank(truncate(qVecs[i], d), cD, 10), bm25.rank(q.q, 10)], k));
      const rd = evalRecall(dense, golden, k);
      const rh = evalRecall(hybrid, golden, k);
      console.log(`dim=${String(d).padStart(4)} k=${k}  Dense 召回=${(rd.recall * 100).toFixed(1)}% 成功=${(rd.successRate * 100).toFixed(1)}%   Hybrid 召回=${(rh.recall * 100).toFixed(1)}% 成功=${(rh.successRate * 100).toFixed(1)}%`);
      for (const [lbl, r] of [[`Dense d=${d} k=${k}`, rd], [`Hybrid d=${d} k=${k}`, rh]] as const)
        if (r.recall > best.recall) { best.recall = r.recall; best.label = lbl; }
    }
  }
  console.log('─'.repeat(72));
  console.log(`最佳:${best.label} 召回率=${(best.recall * 100).toFixed(1)}%`);
  // 目标:找"≥90% 的最小维度"
  console.log(`目标 ≥90%:${best.recall >= 0.9 ? '已达到 ✓(下方挑最小维度配置)' : '未达到,需优化(改写/扩召回/rerank)'}`);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
