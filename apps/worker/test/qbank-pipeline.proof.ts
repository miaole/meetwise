/**
 * Current qbank read-path proof:
 * approved source → immutable generation → raw hits → complete question
 * artifact.  This is deliberately not an Agent or model-quality test.  It
 * executes the same database resolver used by the worker so a legacy bare
 * chunk cannot become an interview question merely because a test fixture
 * injected it into a graph dependency.
 */
import {
  assertIsolatedTestTarget,
  asPrincipal,
  createPool,
  hybridQbankSearch,
  qbankQuestionResultsForHits,
} from '@meetwise/db';
import { fakeEmbedder } from '@meetwise/ai-runtime';
import {
  ingestQbank,
  ingestQuestionBankArtifacts,
  type QbankQuestionArtifact,
} from '../src/qbank-ingest.ts';
import { ensureActiveQbankGeneration } from '../src/qbank-generation.ts';

const pool = createPool();
const embedder = fakeEmbedder(512);
const OWNER = 'qbank-pipeline-reader';
const METADATA = { taxonomyVersion: 'v1', servingScopeId: 'backend/general', annotationSource: 'curator_reviewed' as const };
const RAW_HELPER = {
  refId: 'qpipe:auxiliary-limit-note',
  text: '限流辅助说明：令牌桶需要容量和补充速率。这个辅助材料不是一条可直接出题的题目。',
  ...METADATA,
};
const QUESTION: QbankQuestionArtifact = {
  id: 'question:qpipe-token-bucket',
  competency: '限流与过载保护',
  difficulty: 2,
  ...METADATA,
  chunks: [
    { refId: 'qpipe:prompt', role: 'prompt', ordinal: 0, required: true, text: '请设计令牌桶限流，明确容量、补充速率和原子扣减。' },
    { refId: 'qpipe:rubric', role: 'rubric', ordinal: 0, required: true, text: '评分锚点：容量、补充速率、原子扣减、过载降级和可观测指标。' },
    { refId: 'qpipe:follow-up', role: 'follow_up', ordinal: 0, text: '追问：Redis 故障或主从切换时怎样限定超发上界？' },
    { refId: 'qpipe:anti-pattern', role: 'anti_pattern', ordinal: 0, text: '常见失分：只说 Lua 脚本，却没有容量、失败语义和监控。' },
  ],
};

let failed = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
};

async function hitsFor(query: string, recipeId: string) {
  const [embedding] = await embedder.embed([query]);
  if (!embedding) throw new Error('qbank_pipeline_query_embedding_missing');
  return asPrincipal(pool, OWNER, (client) => hybridQbankSearch(client, {
    query,
    embedding,
    k: 12,
    expectedRecipeId: recipeId,
    retrievalMode: 'dense',
  }));
}

async function main() {
  // The isolated runner, rather than this proof, owns all schema DDL.  Refuse
  // an arbitrary DATABASE_URL before even the first qbank source write.
  await assertIsolatedTestTarget(pool);

  const rawCount = await ingestQbank(pool, [RAW_HELPER], embedder);
  const g0 = await ensureActiveQbankGeneration(pool, embedder);
  if (!g0 || g0.status !== 'activated') throw new Error('qbank_pipeline_first_generation_not_activated');
  const rawHits = await hitsFor('令牌桶 限流 容量 补充速率', g0.recipe.id);
  const rawResults = await asPrincipal(pool, OWNER, (client) =>
    qbankQuestionResultsForHits(client, g0.recipe.id, rawHits));
  check('① 受审核辅助 chunk 可进入 generation，但不能单独提升为完整业务题目工件',
    rawCount === 1 && rawHits.some((hit) => hit.refId === RAW_HELPER.refId) && rawResults.length === 0);

  const ingested = await ingestQuestionBankArtifacts(pool, [QUESTION], embedder);
  const g1 = await ensureActiveQbankGeneration(pool, embedder);
  if (!g1 || g1.status !== 'activated') throw new Error('qbank_pipeline_artifact_generation_not_activated');
  const artifactHits = await hitsFor('令牌桶 限流 原子扣减 过载降级', g1.recipe.id);
  const results = await asPrincipal(pool, OWNER, (client) =>
    qbankQuestionResultsForHits(client, g1.recipe.id, artifactHits));
  const result = results.find((item) => item.ref === QUESTION.id);
  check('② 新批准的完整题目工件提升内容 epoch，并重建为新的活动 generation',
    ingested.questionCount === 1 && ingested.chunkCount === QUESTION.chunks.length
    && g1.generationId !== g0.generationId && g1.chunkCount === 1 + QUESTION.chunks.length);
  check('③ Worker 同一 resolver 只返回完整题目 ID、四个角色证据和真实距离派生排序信号',
    result !== undefined
    && Number.isFinite(result.score)
    && result.evidence.includes('[prompt]')
    && result.evidence.includes('[rubric]')
    && result.evidence.includes('[follow_up]')
    && result.evidence.includes('[anti_pattern]')
    && !results.some((item) => item.ref === RAW_HELPER.refId));

  const secondIngest = await ingestQuestionBankArtifacts(pool, [QUESTION], embedder);
  const reused = await ensureActiveQbankGeneration(pool, embedder);
  check('④ 相同完整工件重放不原地改题，也不创建第二个活动 generation',
    secondIngest.questionCount === 1 && secondIngest.chunkCount === QUESTION.chunks.length
    && reused?.status === 'reused' && reused.generationId === g1.generationId
    && Number((await pool.query("SELECT count(*)::int AS n FROM qbank_vector_generation WHERE state='active'")).rows[0]?.n) === 1);

  let mismatchRejected = false;
  try {
    await hitsFor('令牌桶 限流', 'qrecipe-00000000000000000000000000000000');
  } catch (error) { mismatchRejected = String(error).includes('qbank_generation_recipe_mismatch'); }
  check('⑤ query recipe 不匹配时拒绝，不在旧向量空间或裸 chunk 路径降级搜索', mismatchRejected);

  console.log(`\n${failed === 0
    ? '✓ qbank current read path: raw helper exclusion / immutable generation / complete artifact resolver passed'
    : `✗ ${failed} qbank current read-path assertions failed`}`);
  await pool.end();
  process.exit(failed ? 1 : 0);
}

main().catch(async (error) => {
  console.error('✗', error instanceof Error ? error.stack : error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
