/**
 * 完全本地语料的真实 embedding 对抗评测。它测候选排序，不冒充端到端回答、授权或安全评测。
 * 用法：pnpm rag:adversarial:eval（脚本从根 .env 读取模型配置；不打印密钥）。
 */
import { readFileSync } from 'node:fs';
import { cosine, dashscopeEmbedder, dashscopeReranker, denseRank, buildBm25, evalRecall, rrf, weightedRrf } from '@meetwise/ai-runtime';
import { classifyInterviewResearchBoundary, gradeRetrieval } from '@meetwise/domain';
import {
  ADVERSARIAL_CORPUS,
  ADVERSARIAL_QUERIES,
  ADVERSARIAL_STRESSORS,
  validateAdversarialFixture,
} from './retrieval-adversarial-golden.ts';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const K = 5;
const BASELINE_CANDIDATE_K = K * 2;
// `hybridQbankSearch()` currently over-fetches at least k*8 candidates. The local corpus is smaller, so this
// represents the exact candidate-pool shape the production RRF would see rather than hiding tail candidates.
const PRODUCTION_CANDIDATE_K = Math.min(40, ADVERSARIAL_CORPUS.length);
const ENABLE_RERANK = process.env.RAG_ADVERSARIAL_RERANK === '1';
const answerable = ADVERSARIAL_QUERIES.filter((q) => !q.noAnswer);
const buckets = [...new Set(answerable.map((q) => q.bucket))];
type Strategy = 'dense' | 'bm25' | 'rrf_top10' | 'rrf_production' | 'rrf_dense_1_bm25_0_5' | 'rerank_rrf_production';

function pct(x: number): string { return `${(x * 100).toFixed(1)}%`; }
function wilsonLower(successes: number, n: number, z = 1.96): number {
  if (!n) return 0;
  const p = successes / n; const z2 = z * z;
  return (p + z2 / (2 * n) - z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) / (1 + z2 / n);
}
function printStressCoverage(): void {
  console.log('【样本构成（同一 query 可属于多个压力标签）】');
  console.log(`  corpus=${ADVERSARIAL_CORPUS.length}; release=${ADVERSARIAL_QUERIES.length}; answerable=${answerable.length}; no_answer=${ADVERSARIAL_QUERIES.length - answerable.length}`);
  for (const [tag, ids] of Object.entries(ADVERSARIAL_STRESSORS)) console.log(`  ${tag.padEnd(20)} n=${ids.length} ids=${ids.join(',')}`);
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1))];
}

async function main() {
  validateAdversarialFixture();
  printStressCoverage();
  const embedder = dashscopeEmbedder({ dim: 1024 });
  const [docVecs, queryVecs] = await Promise.all([
    embedder.embed(ADVERSARIAL_CORPUS.map((d) => d.text)),
    embedder.embed(ADVERSARIAL_QUERIES.map((q) => q.query)),
  ]);
  const denseDocs = ADVERSARIAL_CORPUS.map((d, i) => ({ id: d.id, vec: docVecs[i] }));
  const bm25 = buildBm25(ADVERSARIAL_CORPUS);
  const denseCandidates = ADVERSARIAL_QUERIES.map((q, i) => denseRank(queryVecs[i], denseDocs, PRODUCTION_CANDIDATE_K));
  const lexicalCandidates = ADVERSARIAL_QUERIES.map((q) => bm25.rank(q.query, PRODUCTION_CANDIDATE_K));
  const rankings: Record<Strategy, string[][]> = {
    dense: denseCandidates.map((ids) => ids.slice(0, K)),
    bm25: lexicalCandidates.map((ids) => ids.slice(0, K)),
    // Retained exactly as the prior published local baseline: each channel contributes only top-10 candidates.
    rrf_top10: denseCandidates.map((ids, i) => rrf([ids.slice(0, BASELINE_CANDIDATE_K), lexicalCandidates[i].slice(0, BASELINE_CANDIDATE_K)], K)),
    // Mirrors the current qbank RRF candidate-pool semantics, but not yet a production quality claim.
    rrf_production: denseCandidates.map((ids, i) => rrf([ids, lexicalCandidates[i]], K)),
    // Exploratory candidate fusion only. It must beat a frozen holdout before becoming a qbank default.
    rrf_dense_1_bm25_0_5: denseCandidates.map((ids, i) => weightedRrf([{ ids, weight: 1 }, { ids: lexicalCandidates[i], weight: 0.5 }], K)),
    rerank_rrf_production: [],
  };

  const report = (name: Strategy, qs = answerable) => {
    const retrieved = qs.map((q) => rankings[name][ADVERSARIAL_QUERIES.indexOf(q)] ?? []);
    const golden = qs.map((q) => ({ query: q.query, relevant: q.relevant }));
    const r = evalRecall(retrieved, golden, K);
    const fullHits = qs.filter((q, i) => retrieved[i].slice(0, K).filter((id) => q.relevant.includes(id)).length === q.relevant.length).length;
    return { ...r, fullHits, lcb: wilsonLower(fullHits, qs.length) };
  };
  const printAnswerableReport = (title: string, qs: typeof answerable) => {
    console.log(`\n【${title}：真实 embedding 候选排序，非端到端回答】`);
    for (const mode of ['dense', 'bm25', 'rrf_top10', 'rrf_production', 'rrf_dense_1_bm25_0_5'] as const) {
      const r = report(mode, qs);
      console.log(`${mode.padEnd(6)} hit@${K}=${pct(r.hitRate)} recall@${K}=${pct(r.recall)} strict-all=${pct(r.successRate)} (${r.fullHits}/${r.n}, Wilson95%下界=${pct(r.lcb)}) MRR=${r.mrr.toFixed(3)} nDCG=${r.ndcg.toFixed(3)} MAP=${r.map.toFixed(3)}`);
      for (const bucket of buckets) {
        const q = qs.filter((x) => x.bucket === bucket); if (!q.length) continue;
        const b = report(mode, q);
        console.log(`  ${bucket.padEnd(18)} n=${b.n} hit=${pct(b.hitRate)} recall=${pct(b.recall)} strict-all=${pct(b.successRate)} MRR=${b.mrr.toFixed(3)} nDCG=${b.ndcg.toFixed(3)}`);
      }
    }
  };
  printAnswerableReport(`当前 ${answerable.length} 条可回答异常 query`, answerable);

  const candidateGold = answerable.map((q) => ({ query: q.query, relevant: q.relevant }));
  const candidateCoverage = evalRecall(answerable.map((q) => rrf([
    denseCandidates[ADVERSARIAL_QUERIES.indexOf(q)],
    lexicalCandidates[ADVERSARIAL_QUERIES.indexOf(q)],
  ], PRODUCTION_CANDIDATE_K)), candidateGold, PRODUCTION_CANDIDATE_K);
  console.log(`\n【两阶段上限】当前 production-shaped RRF top-${PRODUCTION_CANDIDATE_K} 候选的 evidence Recall=${pct(candidateCoverage.recall)}；任何 rerank 都不能找回候选池外证据。`);

  if (ENABLE_RERANK) {
    const reranker = dashscopeReranker();
    const byId = new Map(ADVERSARIAL_CORPUS.map((d) => [d.id, d.text]));
    const latencies: number[] = [];
    console.log(`\n【两阶段 rerank：真实 ${reranker.id}，RRF top-${PRODUCTION_CANDIDATE_K} → top-${K}】`);
    for (const q of answerable) {
      const qi = ADVERSARIAL_QUERIES.indexOf(q);
      const candidateIds = rrf([denseCandidates[qi], lexicalCandidates[qi]], PRODUCTION_CANDIDATE_K);
      const started = performance.now();
      const ordered = await reranker.rerank(q.query, candidateIds.flatMap((id) => {
        const text = byId.get(id);
        return text ? [{ id, text }] : [];
      }), K);
      latencies.push(performance.now() - started);
      rankings.rerank_rrf_production[qi] = ordered;
      if ((latencies.length % 10) === 0) console.log(`  rerank ${latencies.length}/${answerable.length}`);
    }
    const r = report('rerank_rrf_production');
    console.log(`rerank_rrf_production hit@${K}=${pct(r.hitRate)} recall@${K}=${pct(r.recall)} strict-all=${pct(r.successRate)} (${r.fullHits}/${r.n}, Wilson95%下界=${pct(r.lcb)}) MRR=${r.mrr.toFixed(3)} nDCG=${r.ndcg.toFixed(3)} MAP=${r.map.toFixed(3)} rerank_latency_ms(p50/p95)=${percentile(latencies, 0.5).toFixed(1)}/${percentile(latencies, 0.95).toFixed(1)}`);
  } else {
    console.log('\n【两阶段 rerank】未执行。设置 RAG_ADVERSARIAL_RERANK=1 后才调用真实 reranker；默认评测不产生额外模型成本。');
  }

  console.log('\n【无答案：当前 CRAG 默认阈值的真实行为，不等于安全拒答】');
  let wrongUseLocal = 0;
  const actionCounts = new Map<string, number>();
  const mustRejectOrClarify = ADVERSARIAL_QUERIES.filter((x) => x.noAnswer && x.noAnswerBoundary === 'reject_or_clarify');
  let rejectOrClarifyCovered = 0;
  for (const q of ADVERSARIAL_QUERIES.filter((x) => x.noAnswer)) {
    const qi = ADVERSARIAL_QUERIES.indexOf(q);
    const top = ADVERSARIAL_CORPUS.map((d, i) => ({ ref: d.id, score: Math.max(0, cosine(queryVecs[qi], docVecs[i])) })).sort((a, b) => b.score - a.score)[0];
    const boundary = classifyInterviewResearchBoundary(q.query);
    const action = boundary.action === 'allow' ? gradeRetrieval([top]).action : boundary.action;
    if (action === 'use_local') wrongUseLocal++;
    // `deny_external` is also a safe terminal: zero local retrieval and zero web/deep-research egress.
    if (q.noAnswerBoundary === 'reject_or_clarify' && (action === 'refuse' || action === 'deny_external')) rejectOrClarifyCovered++;
    actionCounts.set(action, (actionCounts.get(action) ?? 0) + 1);
    console.log(`  ${q.id}: expected=${q.noAnswerBoundary} top=${top.ref}@${top.score.toFixed(3)} boundary=${boundary.action} → ${action}`);
  }
  const noAnswerN = ADVERSARIAL_QUERIES.filter((x) => x.noAnswer).length;
  console.log(`  action counts: ${[...actionCounts.entries()].map(([action, n]) => `${action}=${n}`).join(', ')}`);
  console.log(`  local-suppression=${noAnswerN - wrongUseLocal}/${noAnswerN} (${pct((noAnswerN - wrongUseLocal) / noAnswerN)}); erroneous-use_local=${wrongUseLocal}/${noAnswerN} (${pct(wrongUseLocal / noAnswerN)})`);
  console.log(`  reject-or-clarify contract coverage=${rejectOrClarifyCovered}/${mustRejectOrClarify.length} (${pct(rejectOrClarifyCovered / (mustRejectOrClarify.length || 1))}): research boundary 在 local/web 之前运行；它是 interview research 的窄 egress policy，不是通用 RAG intent classifier。`);
  console.log('\n结论：此集是本地合成对抗回归集，不是公开 benchmark，也不等于生产回答、授权、拒答或 web/skill 安全质量。发布前仍需要真实脱敏语料、盲标、多标注者一致性、权限隔离和端到端接地评测。');
}
main().catch((e: unknown) => {
  // A real-provider outage must be diagnosable without printing MODEL_API_KEY, request bodies, or endpoint URLs.
  const err = e as { name?: unknown; message?: unknown; cause?: { code?: unknown; name?: unknown; message?: unknown } };
  const cause = err.cause;
  console.error('✗', JSON.stringify({
    kind: 'real_embedding_eval_failed',
    name: typeof err.name === 'string' ? err.name : 'Error',
    message: typeof err.message === 'string' ? err.message : String(e),
    causeCode: typeof cause?.code === 'string' ? cause.code : undefined,
    causeName: typeof cause?.name === 'string' ? cause.name : undefined,
  }));
  process.exit(1);
});
