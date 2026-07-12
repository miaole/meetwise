/**
 * 检索引擎：稠密(向量 cosine) + 稀疏(BM25 词法) + RRF 混合融合,及召回度量(recall@k / 成功率 / MRR / nDCG)。
 * 混合的理由:稠密抗改写/同义,稀疏抗专有名词/缩写;单路都有盲区,RRF 融合把召回率顶上去(这是冲 90% 的关键手段)。
 * 生产索引用 pgvector HNSW(packages/db);此处 brute-force 同样的排序数学,供离线召回评测与小库。
 */
import { cosine } from './embedder.ts';

export interface Doc { id: string; text: string }
export interface Labeled { query: string; relevant: string[] }   // 金标:查询 → 相关文档 id

// ── 分词:中文 bigram + ASCII 词(检索/度量共用,保证一致）──
export function tokenize(s: string): string[] {
  const cleaned = s.toLowerCase().replace(/[，。、,.?？!！:：；;()（）\[\]「」"'`]/g, ' ');
  const out: string[] = [];
  for (const w of cleaned.split(/\s+/).filter(Boolean)) {
    if (/^[a-z0-9+#.]+$/.test(w)) out.push(w);
    else { const cn = w.replace(/[^一-龥]/g, ''); for (let i = 0; i < Math.max(1, cn.length - 1); i++) out.push(cn.slice(i, i + 2)); }
  }
  return out;
}

// ── 稠密：查询向量 vs 语料向量 cosine top-k ──
export function denseRank(qVec: number[], corpus: { id: string; vec: number[] }[], k: number): string[] {
  return corpus.map((c) => ({ id: c.id, s: cosine(qVec, c.vec) })).sort((a, b) => b.s - a.s).slice(0, k).map((x) => x.id);
}

// ── 稀疏：BM25 ──
export function buildBm25(corpus: Doc[]) {
  const docToks = corpus.map((d) => tokenize(d.text));
  const df = new Map<string, number>();
  docToks.forEach((ts) => new Set(ts).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
  const avgdl = docToks.reduce((a, t) => a + t.length, 0) / (corpus.length || 1);
  const N = corpus.length;
  return { rank(query: string, k: number, k1 = 1.5, b = 0.75): string[] {
    const qts = new Set(tokenize(query));
    return corpus.map((d, i) => {
      const ts = docToks[i]; const tf = new Map<string, number>(); ts.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
      let score = 0;
      for (const q of qts) {
        const f = tf.get(q); if (!f) continue;
        const idf = Math.log(1 + (N - (df.get(q) ?? 0) + 0.5) / ((df.get(q) ?? 0) + 0.5));
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * ts.length / avgdl));
      }
      return { id: d.id, score };
    }).sort((a, b) => b.score - a.score).slice(0, k).map((x) => x.id);
  } };
}

// ── RRF 融合:多路排名倒数和(c=60 经验值),稳健且无需分数归一 ──
export function rrf(lists: string[][], k: number, c = 60): string[] {
  const score = new Map<string, number>();
  for (const list of lists) list.forEach((id, rank) => score.set(id, (score.get(id) ?? 0) + 1 / (c + rank + 1)));
  return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map((x) => x[0]);
}

// ── 召回度量 ──
export interface RecallReport { recall: number; successRate: number; hitRate: number; mrr: number; ndcg: number; map: number; n: number; k: number }
export function evalRecall(retrievedPerQuery: string[][], golden: Labeled[], k: number): RecallReport {
  let relHit = 0, relTotal = 0, success = 0, hitAny = 0, mrrSum = 0, ndcgSum = 0, mapSum = 0;
  golden.forEach((g, i) => {
    const top = retrievedPerQuery[i].slice(0, k);
    const rel = new Set(g.relevant);
    const hit = top.filter((id) => rel.has(id)).length;
    relHit += hit; relTotal += rel.size;
    if (hit === rel.size) success++;                                    // 严格:所有相关项都进 top-k
    if (hit >= 1) hitAny++;                                             // 产品现实:至少召回 1 个相关(命中率)
    // MAP(MTEB 重排官方指标):AP = (1/|rel|) Σ_k rel(k)·precision@k,在完整排名上算
    let apHits = 0, ap = 0;
    retrievedPerQuery[i].forEach((id, r) => { if (rel.has(id)) { apHits++; ap += apHits / (r + 1); } });
    mapSum += rel.size ? ap / rel.size : 0;
    const firstRank = top.findIndex((id) => rel.has(id));
    if (firstRank >= 0) mrrSum += 1 / (firstRank + 1);
    let dcg = 0; top.forEach((id, r) => { if (rel.has(id)) dcg += 1 / Math.log2(r + 2); });
    let idcg = 0; for (let r = 0; r < rel.size && r < k; r++) idcg += 1 / Math.log2(r + 2);
    ndcgSum += idcg ? dcg / idcg : 0;
  });
  return { recall: relHit / (relTotal || 1), successRate: success / (golden.length || 1), hitRate: hitAny / (golden.length || 1), mrr: mrrSum / golden.length, ndcg: ndcgSum / golden.length, map: mapSum / golden.length, n: golden.length, k };
}
