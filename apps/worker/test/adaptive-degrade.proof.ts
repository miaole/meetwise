/** TC-MODEL-ROUTE-04-E5: 出题模型失败 → 结构化错误 + provenance，不发明题面。 */
import { assertIsolatedTestTarget, asPrincipal, createPool } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { isQuestionGenerationFailure, normalizeQuestionGenerationResult } from '@meetwise/domain';
import { buildAdaptiveDeps, planCompetencies } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'degA';
const failingModel: ModelClient = scriptedModelClient({});

async function main() {
  await assertIsolatedTestTarget(pool);
  const nonce = Date.now();
  const threads = {
    generate: `deg-${nonce}`,
    plan: `deg-plan-${nonce}`,
    evaluate: `deg-eval-${nonce}`,
    unknown: `deg-unknown-${nonce}`,
    timeout: `deg-real-timeout-${nonce}`,
    malformed: `deg-malformed-${nonce}`,
  };
  await asPrincipal(pool, OWNER, async (c) => {
    for (const id of Object.values(threads))
      await c.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [id, OWNER]);
  });
  const deps = buildAdaptiveDeps({
    pool, owner: OWNER, threadId: threads.generate, model: failingModel, competencies: ['并发'],
    localRetrieve: async () => [], webExplore: async () => [],
  });
  let threw = false, gen: any = null;
  try { gen = normalizeQuestionGenerationResult(await deps.retrieveAndGenerate('并发', 3, 0, 0, ['限流经历'], 'fundamental')); } catch { threw = true; }
  A('出题模型失败 → 不抛错', threw === false);
  A('返回 ok:false，不发明题面', isQuestionGenerationFailure(gen) && !('question' in gen));
  A('provenance.origin=unavailable 且错误可分类',
    gen.provenance.origin === 'unavailable' && typeof gen.error === 'string' && gen.provenance.errorCode === gen.error);
  A('失败结果不含兜底题关键词', !JSON.stringify(gen).includes('请以一个具体'));

  const noModel = scriptedModelClient({});
  const comps = await planCompetencies(pool, OWNER, threads.plan, noModel, '后端', ['限流']);
  A('规划失败 → 默认能力集(面试仍可开,不卡在开局)', comps.length >= 1);

  const deps2 = buildAdaptiveDeps({ pool, owner: OWNER, threadId: threads.evaluate, model: noModel, competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [] });
  let threwE = false, ev: any = null;
  try { ev = await deps2.assess('q', 'a', '并发', 0); } catch { threwE = true; }
  A('评分失败 → 不抛错(面试不崩)', threwE === false);
  A('评分失败 → unscored+原因，不产生任何伪造分数', !!ev && ev.status === 'unscored' && typeof ev.reason === 'string' && !('score' in ev));

  const externallyUnknown = scriptedModelClient({
    'mock-interview.evaluate': () => ({ ok: false as const, kind: 'transient' as const, externalOutcome: 'unknown' as const }),
  });
  const deps3 = buildAdaptiveDeps({
    pool, owner: OWNER, threadId: threads.unknown, model: externallyUnknown,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const unknownEval: any = await deps3.assess('q', 'a', '并发', 0);
  A('评分外部结果未知 → unscored（不把超时伪造成数值分）',
    unknownEval?.status === 'unscored' && unknownEval.reason === 'evaluation_external_outcome_unknown' && !('score' in unknownEval));

  let timeoutAborts = 0;
  const hangingModel: ModelClient = {
    complete(_request, _attempt, signal) {
      signal?.addEventListener('abort', () => { timeoutAborts++; }, { once: true });
      return new Promise(() => {});
    },
  };
  const previousExecutionTimeout = process.env.MODEL_EXECUTION_TIMEOUT_MS;
  const previousTransportTimeout = process.env.MODEL_TIMEOUT_MS;
  let timedOutEval: any;
  let timedOutGen: any;
  try {
    process.env.MODEL_EXECUTION_TIMEOUT_MS = '1000';
    process.env.MODEL_TIMEOUT_MS = '1000';
    const deps4 = buildAdaptiveDeps({
      pool, owner: OWNER, threadId: threads.timeout, model: hangingModel,
      competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
    });
    timedOutEval = await deps4.assess('q', '有效答案', '并发', 0);
    timedOutGen = normalizeQuestionGenerationResult(await deps4.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  } finally {
    if (previousExecutionTimeout === undefined) delete process.env.MODEL_EXECUTION_TIMEOUT_MS;
    else process.env.MODEL_EXECUTION_TIMEOUT_MS = previousExecutionTimeout;
    if (previousTransportTimeout === undefined) delete process.env.MODEL_TIMEOUT_MS;
    else process.env.MODEL_TIMEOUT_MS = previousTransportTimeout;
  }
  A('真实 gateway 执行超时 → 图评分 unscored，AbortSignal 已传到模型适配器',
    timedOutEval?.status === 'unscored' && timedOutEval.reason === 'evaluation_external_outcome_unknown'
      && !('score' in timedOutEval) && timeoutAborts === 1);
  A('出题超时 → ok:false + timeout/unknown，不发明题',
    isQuestionGenerationFailure(timedOutGen)
    && (timedOutGen.error === 'provider_timeout' || timedOutGen.error === 'external_outcome_unknown')
    && !('question' in timedOutGen));

  const malformed = scriptedModelClient({
    'interviewer.ask': () => ({ ok: true, raw: { notAQuestion: true } }),
  });
  const depsM = buildAdaptiveDeps({
    pool, owner: OWNER, threadId: threads.malformed, model: malformed,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const bad = normalizeQuestionGenerationResult(await depsM.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('畸形 structured output → schema_invalid，不发明题',
    isQuestionGenerationFailure(bad) && bad.error === 'schema_invalid' && !('question' in bad)
    && bad.provenance.invokeError === 'schema_validation_failed');

  console.log(`\n${fail === 0 ? '✓ agent 出题 fail-closed(不发明题面)+评分 unscored 全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.stack ?? e?.message ?? e); process.exit(1); });
