/**
 * 新建 qbank artifact holdout：真实 512-d embedding，按线上“chunk 命中 → 完整 question artifact”聚合。
 * 它测 bootstrap qbank 的检索排序，不代替真实企业语料、全格式解析、用户多轮状态或生产容量评测。
 *
 * ⚠️ 本脚本是 worker-shaped 近似评测（内存 buildBm25/denseRank/rrf），不调用 production `hybridQbankSearch`，
 * 不作 serving/RRF 发布证据。PRD-TEST-003 的真实路径评测已迁到
 * `apps/worker/test/qbank-retrieval-eval-pg.proof.ts`（经
 * `node scripts/run-e2e-isolated.mjs qbank-retrieval-eval:prove:raw` 在隔离 PG 上跑真实路径），在完整迁移库上跑
 * 真实 `hybridQbankSearch`（dense + rrf）+ `qbankQuestionResultsForHits` 聚合。
 */
import { readFileSync } from 'node:fs';
import { buildBm25, dashscopeEmbedder, denseRank, evalRecall, rrf } from '@meetwise/ai-runtime';
import { QBANK_ARTIFACTS } from '../src/qbank-seed.ts';
import { QBANK_RETRIEVAL_RELEASE, validateQbankRetrievalRelease } from './qbank-retrieval-release.ts';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const K = 5;
// `hybridQbankSearch` uses max(k * 8, candidateK ?? 40); worker k=12 means a 96-chunk channel pool.
const CANDIDATE_K = 96;
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

function collapseQuestionIds(chunkIds: string[], chunkToQuestion: Map<string, string>, k: number): string[] {
  const questions: string[] = [];
  const seen = new Set<string>();
  for (const chunkId of chunkIds) {
    const questionId = chunkToQuestion.get(chunkId);
    if (questionId && !seen.has(questionId)) { seen.add(questionId); questions.push(questionId); }
    if (questions.length === k) break;
  }
  return questions;
}

async function main(): Promise<void> {
  validateQbankRetrievalRelease();
  const chunks = QBANK_ARTIFACTS.flatMap((artifact) => artifact.chunks.map((chunk) => ({ id: chunk.refId, text: chunk.text, questionId: artifact.id })));
  const chunkToQuestion = new Map(chunks.map((chunk) => [chunk.id, chunk.questionId]));
  const embedder = dashscopeEmbedder({ dim: 512 });
  const [chunkVectors, queryVectors] = await Promise.all([
    embedder.embed(chunks.map((chunk) => chunk.text)),
    embedder.embed(QBANK_RETRIEVAL_RELEASE.map((item) => item.query)),
  ]);
  const vectorChunks = chunks.map((chunk, index) => ({ id: chunk.id, vec: chunkVectors[index] }));
  const bm25 = buildBm25(chunks);
  const strategies = {
    // The worker asks retrieval for 12 chunks, then SQL collapses them into at most five business question artifacts.
    // This fixture copies only those cardinalities; lexical ranking is in-memory BM25,
    // not the production PostgreSQL plainto_tsquery + ts_rank_cd implementation.
    dense_worker_shaped: QBANK_RETRIEVAL_RELEASE.map((_, index) =>
      collapseQuestionIds(denseRank(queryVectors[index], vectorChunks, CANDIDATE_K).slice(0, 12), chunkToQuestion, K)),
    lexical_worker_shaped: QBANK_RETRIEVAL_RELEASE.map((item) =>
      collapseQuestionIds(bm25.rank(item.query, CANDIDATE_K).slice(0, 12), chunkToQuestion, K)),
    rrf_worker_shaped: QBANK_RETRIEVAL_RELEASE.map((item, index) =>
      collapseQuestionIds(rrf([
        denseRank(queryVectors[index], vectorChunks, CANDIDATE_K),
        bm25.rank(item.query, CANDIDATE_K),
      ], CANDIDATE_K).slice(0, 12), chunkToQuestion, K)),
  };
  const golden = QBANK_RETRIEVAL_RELEASE.map((item) => ({ query: item.query, relevant: item.relevantQuestionIds }));
  console.log(`【qbank artifact 新建 holdout】questions=${QBANK_ARTIFACTS.length}; chunks=${chunks.length}; queries=${golden.length}; embedding=${embedder.id}; dim=${embedder.dim}; topK=${K}`);
  for (const [name, retrieved] of Object.entries(strategies)) {
    const report = evalRecall(retrieved, golden, K);
    console.log(`${name.padEnd(8)} hit@${K}=${pct(report.hitRate)} recall@${K}=${pct(report.recall)} strict-all=${pct(report.successRate)} MRR=${report.mrr.toFixed(3)} nDCG=${report.ndcg.toFixed(3)} MAP=${report.map.toFixed(3)}`);
  }
  for (const tag of ['paraphrase', 'typo', 'mixed_language', 'multi_evidence', 'constraint', 'ambiguous'] as const) {
    const selected = QBANK_RETRIEVAL_RELEASE.map((item, index) => ({ item, index })).filter(({ item }) => item.tags.includes(tag));
    const qrels = selected.map(({ item }) => ({ query: item.query, relevant: item.relevantQuestionIds }));
    const rrfHits = selected.map(({ index }) => strategies.rrf_worker_shaped[index]);
    const report = evalRecall(rrfHits, qrels, K);
    console.log(`  rrf/${tag.padEnd(14)} n=${selected.length} recall@${K}=${pct(report.recall)} strict-all=${pct(report.successRate)} nDCG=${report.ndcg.toFixed(3)}`);
  }
  console.log('结论：这是 worker-shaped 的自有 QBank holdout。它不调用 production hybridQbankSearch，也不覆盖 PostgreSQL lexical、generation/ACL、真实 C/B 脱敏语料、授权切片或全格式文档，不能作为 serving/RRF 发布证据。');
}

main().catch((error: unknown) => {
  const e = error as { name?: unknown; message?: unknown; cause?: { code?: unknown; name?: unknown } };
  console.error('✗', JSON.stringify({
    kind: 'qbank_release_eval_failed',
    name: typeof e.name === 'string' ? e.name : 'Error',
    message: typeof e.message === 'string' ? e.message : String(error),
    causeCode: typeof e.cause?.code === 'string' ? e.cause.code : undefined,
  }));
  process.exit(1);
});
