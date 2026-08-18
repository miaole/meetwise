/** agent 优雅降级证明:出题模型失败(重试耗尽)→ retrieveAndGenerate 返兜底题、不抛错崩面试。 */
import { assertIsolatedTestTarget, asPrincipal, createPool } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveDeps, planCompetencies } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'degA';
// 模型对 interviewer.ask/evaluate 无 handler → invoke 重试耗尽 → error
const failingModel: ModelClient = scriptedModelClient({});

async function main() {
  await assertIsolatedTestTarget(pool);
  // Every invoke passes a privacy interview id.  Seed actual owner-scoped
  // parents so this proof exercises model failure/timeout rather than taking
  // the unrelated pre-dispatch privacy-fence branch.
  const nonce = Date.now();
  const threads = {
    generate: `deg-${nonce}`,
    plan: `deg-plan-${nonce}`,
    evaluate: `deg-eval-${nonce}`,
    unknown: `deg-unknown-${nonce}`,
    timeout: `deg-real-timeout-${nonce}`,
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
  try { gen = await deps.retrieveAndGenerate('并发', 3, 0, 0, ['限流经历'], 'grounded'); } catch { threw = true; }
  A('出题模型失败 → 不抛错(面试不崩)', threw === false);
  A('返回确定性兜底题(含目标能力「并发」,可继续)', !!gen && typeof gen.question === 'string' && gen.question.includes('并发') && gen.question.length > 10);
  A('兜底题无伪造来源(sources 空,诚实)', Array.isArray(gen.sources) && gen.sources.length === 0);

  // 规划路径降级:规划模型失败 → 默认能力集(面试仍可开)
  const noModel = scriptedModelClient({});
  const comps = await planCompetencies(pool, OWNER, threads.plan, noModel, '后端', ['限流']);
  A('规划失败 → 默认能力集(面试仍可开,不卡在开局)', comps.length >= 1);

  // 评分路径降级:评分模型失败 → 显式 unscored，不抛错也不伪造 50 分
  const deps2 = buildAdaptiveDeps({ pool, owner: OWNER, threadId: threads.evaluate, model: noModel, competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [] });
  let threwE = false, ev: any = null;
  try { ev = await deps2.assess('q', 'a', '并发', 0); } catch { threwE = true; }
  A('评分失败 → 不抛错(面试不崩)', threwE === false);
  A('评分失败 → unscored+原因，不产生任何伪造分数', !!ev && ev.status === 'unscored' && typeof ev.reason === 'string' && !('score' in ev));

  // UC-E2E-012 E4: 供应商调用已越过派发边界后超时，不能重试/编分。
  // 这里的 fake 仅复刻 gateway 已经持久化的 external-outcome-unknown；真实
  // 永不 settle Promise 的边界与并发幂等由 ai-runtime 的隔离 proof 验证。
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

  // Graph-level route: use the real invoke gateway with a non-settling model,
  // rather than hand-crafting an unknown result.  The graph must receive the
  // timeout as unscored and the adapter must observe the AbortSignal.
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
  try {
    // Environment configuration uses the same production-safe >=1s floor;
    // millisecond values are available only through the direct runtime seam.
    process.env.MODEL_EXECUTION_TIMEOUT_MS = '1000';
    process.env.MODEL_TIMEOUT_MS = '1000';
    const deps4 = buildAdaptiveDeps({
      pool, owner: OWNER, threadId: threads.timeout, model: hangingModel,
      competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
    });
    timedOutEval = await deps4.assess('q', '有效答案', '并发', 0);
  } finally {
    if (previousExecutionTimeout === undefined) delete process.env.MODEL_EXECUTION_TIMEOUT_MS;
    else process.env.MODEL_EXECUTION_TIMEOUT_MS = previousExecutionTimeout;
    if (previousTransportTimeout === undefined) delete process.env.MODEL_TIMEOUT_MS;
    else process.env.MODEL_TIMEOUT_MS = previousTransportTimeout;
  }
  A('真实 gateway 执行超时 → 图评分 unscored，AbortSignal 已传到模型适配器',
    timedOutEval?.status === 'unscored' && timedOutEval.reason === 'evaluation_external_outcome_unknown'
      && !('score' in timedOutEval) && timeoutAborts === 1);

  console.log(`\n${fail === 0 ? '✓ agent 优雅降级(出题失败→兜底题继续,不崩面试)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.stack ?? e?.message ?? e); process.exit(1); });
