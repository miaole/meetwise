/**
 * context-budget.proof — CTX-02 派发前预算器的承重证明（纯、确定性，无 DB / 无真模型）。
 *
 * 断言覆盖任务测试计划 6 区：
 *   (1) 确定性总额：availableInput = contextWindow − maxOutput − toolReserve − safetyMargin；
 *       renderedInput = Σ 各项；估算器语义锁定（UTF-8 字节上界）。
 *   (2) 超预算 → 按 trimOrder 确定性降级（summary→rag→recent_turns）；裁无可裁仍超 → rejected + 错误码；
 *       不可约组件永不被裁；allowDegrade=false 直接 rejected；自定义 trimOrder 被精确遵守。
 *   (3) 估算器版本化稳定：同版本同输入同输出；未知版本 fail-closed。
 *   (4) usage 校准方向正确：因子版本内容稳定；refineEstimate 恒 ≥ 已观测 usage；宽松估算更紧；
 *       低估观测把上界顶回；plan.calibrated 反映校准生效。
 *   (5) 请求显式带 max_output：openAICompatibleClient 实发 body.max_tokens === maxOutputTokens。
 *   (6) 绝不静默截断：任何 trimmed 非空 ⇒ status=degraded（非 within_budget）；超预算不可降级 ⇒ rejected；
 *       估算器返回 token 数、绝不返回被截字符串。
 *   (7) 审计回归（MEDIUM-1/2）：recent_turns 多轮降级逐轮裁到 fit 或裁到底才 rejected；safetyMargin=0 fail-closed。
 * 用法：pnpm --filter @meetwise/ai-runtime prove:context-budget
 */
import {
  DEFAULT_TRIM_ORDER,
  estimateContextTokens,
  contextBudgetPolicyFromCostPolicy,
  planDispatchBudget,
  openAICompatibleClient,
  reconcileUsage,
  refineEstimate,
  type ContextBudgetComponents,
  type ContextBudgetPlan,
  type ContextBudgetPolicy,
  type EstimatorVersion,
  type ModelCostPolicy,
  type UsageObservation,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

function policy(overrides: Partial<ContextBudgetPolicy> = {}): ContextBudgetPolicy {
  return {
    contextWindowTokens: 1000, maxOutputTokens: 100, maxInputTokens: 2000,
    safetyMarginTokens: 50, toolReserveTokens: 0, estimator: 'utf8-bytes-v1',
    trimOrder: [...DEFAULT_TRIM_ORDER], allowDegrade: true, ...overrides,
  };
}
function components(overrides: Partial<ContextBudgetComponents> = {}): ContextBudgetComponents {
  return {
    system: 'S', permissionSnapshot: 'P', schema: 'C', tools: '', userData: 'U',
    rag: '', recentTurns: [], summary: '', ...overrides,
  };
}
function entry(plan: ContextBudgetPlan, id: string) {
  return plan.components.find((c) => c.component === id);
}

section('1. 确定性总额 + 估算器语义（UTF-8 字节保守上界）');
A('ASCII 3 字符 = 3 token 估算', estimateContextTokens('abc', 'utf8-bytes-v1') === 3);
A('单 CJK 字符 = 3 字节估算（保守 ≥ 真实 token）', estimateContextTokens('中', 'utf8-bytes-v1') === 3);
A('空字符串 = 0 token（不套校准因子）', estimateContextTokens('', 'utf8-bytes-v1') === 0);
{
  const p = policy({ contextWindowTokens: 1000, maxOutputTokens: 100, toolReserveTokens: 20, safetyMarginTokens: 50 });
  const d = planDispatchBudget(components(), p);
  A('availableInput = window − maxOutput − toolReserve − safetyMargin（精确）',
    d.ok && d.plan.availableInputTokens === 1000 - 100 - 20 - 50);
  A('renderedInput = Σ 各项（自洽）', d.ok && d.plan.renderedInputTokens === d.plan.components.reduce((s, c) => s + c.tokens, 0));
  // 5 个非空组件：S/P/C/U 各 1 字节，summary 空、rag 空、tools 空、recentTurns 空 → 4 字节。
  A('renderedInput = 手动字节和（system+permission+schema+user_data=4）', d.ok && d.plan.renderedInputTokens === 4);
}

section('2. 确定性降级（trimOrder）与拒绝');
{
  const p = policy({ contextWindowTokens: 1000, maxOutputTokens: 100, safetyMarginTokens: 50 }); // availableInput = 850
  const c = components({
    rag: 'R'.repeat(400),                          // 400 字节
    recentTurns: ['t'.repeat(400), 'o'.repeat(400), 'e'.repeat(400)], // 1200 字节
    summary: 'M'.repeat(300),                      // 300 字节
  }); // 总 1904 > 850
  const d = planDispatchBudget(c, p);
  A('超预算且可降级 → status=degraded', d.ok && d.plan.status === 'degraded');
  A('trimOrder 顺序：summary→rag→recent_turns 均被裁', d.ok
    && JSON.stringify(d.plan.trimmedComponents) === JSON.stringify(['summary', 'rag', 'recent_turns']));
  A('summary 被裁：tokens=0 / trimmed / original=300',
    d.ok && entry(d.plan, 'summary')?.tokens === 0 && entry(d.plan, 'summary')?.trimmed === true && entry(d.plan, 'summary')?.originalTokens === 300);
  A('rag 被裁：tokens=0 / trimmed / original=400',
    d.ok && entry(d.plan, 'rag')?.tokens === 0 && entry(d.plan, 'rag')?.trimmed === true && entry(d.plan, 'rag')?.originalTokens === 400);
  A('recent_turns 减一轮：tokens=800 / trimmed / original=1200',
    d.ok && entry(d.plan, 'recent_turns')?.tokens === 800 && entry(d.plan, 'recent_turns')?.trimmed === true && entry(d.plan, 'recent_turns')?.originalTokens === 1200);
  A('不可约组件（system/permission/schema/user_data）永不被裁', d.ok
    && entry(d.plan, 'system')?.trimmed === false && entry(d.plan, 'permission_snapshot')?.trimmed === false
    && entry(d.plan, 'schema')?.trimmed === false && entry(d.plan, 'user_data')?.trimmed === false);
  A('降级后 renderedInput 恰好落回 availableInput 内', d.ok && d.plan.renderedInputTokens === 804 && d.plan.renderedInputTokens <= d.plan.availableInputTokens);
}
{
  // 裁无可裁仍超 → rejected：不可约组件本身 > availableInput。
  const p = policy({ contextWindowTokens: 200, maxOutputTokens: 10, safetyMarginTokens: 0 }); // availableInput = 190
  const c = components({ system: 'S'.repeat(500), summary: '', rag: '', recentTurns: [] });
  const d = planDispatchBudget(c, p);
  A('不可约组件超窗 → status=rejected + 明确错误码',
    d.ok && d.plan.status === 'rejected' && d.plan.error === 'context_budget_exceeded');
  A('rejected 时未裁任何组件（trimmedComponents 空、system 未裁）',
    d.ok && d.plan.trimmedComponents.length === 0 && entry(d.plan, 'system')?.trimmed === false && entry(d.plan, 'system')?.tokens === 500);
}
{
  // allowDegrade=false：超预算直接 rejected，不静默裁 summary。
  const p = policy({ contextWindowTokens: 1000, maxOutputTokens: 100, safetyMarginTokens: 50, allowDegrade: false }); // availableInput=850
  const c = components({ summary: 'M'.repeat(300), rag: 'R'.repeat(400), recentTurns: ['t'.repeat(400), 'o'.repeat(400)] });
  const d = planDispatchBudget(c, p);
  A('allowDegrade=false 超预算 → rejected（非 degraded）', d.ok && d.plan.status === 'rejected' && d.plan.error === 'context_budget_exceeded');
  A('allowDegrade=false 不静默裁 summary（tokens=300 原样保留、trimmed=false）',
    d.ok && entry(d.plan, 'summary')?.tokens === 300 && entry(d.plan, 'summary')?.trimmed === false);
}
{
  // 自定义 trimOrder 被精确遵守：只允许裁 rag，summary 存在但不在 trimOrder → 不被裁。
  const p = policy({ contextWindowTokens: 500, maxOutputTokens: 10, safetyMarginTokens: 0, trimOrder: ['rag'] }); // availableInput=490
  const c = components({ rag: 'R'.repeat(400), summary: 'M'.repeat(300) }); // 704 > 490
  const d = planDispatchBudget(c, p);
  A('自定义 trimOrder 只裁 rag → degraded', d.ok && d.plan.status === 'degraded' && JSON.stringify(d.plan.trimmedComponents) === JSON.stringify(['rag']));
  A('summary 不在 trimOrder → 不被裁（tokens=300）', d.ok && entry(d.plan, 'summary')?.trimmed === false && entry(d.plan, 'summary')?.tokens === 300);
}

section('3. 估算器版本化稳定 + fail-closed');
{
  const text = '同一个中文输入样本，用于验证确定性。'.repeat(100);
  A('同版本同输入同输出（两次相等）', estimateContextTokens(text, 'utf8-bytes-v1') === estimateContextTokens(text, 'utf8-bytes-v1'));
  let threw = false;
  try { estimateContextTokens('x', 'utf8-bytes-v2' as EstimatorVersion); } catch (e) { threw = (e as Error).message === 'context_estimator_unknown'; }
  A('未知估算器版本 → throw context_estimator_unknown', threw);
}
{
  // fail-closed 策略校验。
  const badTrim = planDispatchBudget(components(), policy({ trimOrder: ['system'] }));
  A('不可约组件入 trimOrder → policy_invalid', badTrim.ok === false && badTrim.error === 'context_budget_policy_invalid');
  const badEstimator = planDispatchBudget(components(), policy({ estimator: 'utf8-bytes-v2' as EstimatorVersion }));
  A('未知 estimator 策略 → policy_invalid', badEstimator.ok === false && badEstimator.error === 'context_budget_policy_invalid');
  const badWindow = planDispatchBudget(components(), policy({ contextWindowTokens: 100, maxOutputTokens: 100, safetyMarginTokens: 1 }));
  A('窗口 < 输出+余量 → policy_invalid', badWindow.ok === false && badWindow.error === 'context_budget_policy_invalid');
  const dupTrim = planDispatchBudget(components(), policy({ trimOrder: ['rag', 'rag'] }));
  A('trimOrder 重复组件 → policy_invalid', dupTrim.ok === false && dupTrim.error === 'context_budget_policy_invalid');
}

section('4. usage 校准方向正确（版本化因子）');
{
  const observations: UsageObservation[] = [
    { estimator: 'utf8-bytes-v1', estimateInputTokens: 1000, providerInputTokens: 200, providerOutputTokens: 50, service: 'proof.svc', model: 'qwen-plus', batch: 'b1', observedAtMs: 1 },
    { estimator: 'utf8-bytes-v1', estimateInputTokens: 1000, providerInputTokens: 250, providerOutputTokens: 60, service: 'proof.svc', model: 'qwen-plus', batch: 'b1', observedAtMs: 2 },
  ];
  const rec = reconcileUsage(observations);
  const calibration = rec.ok ? rec.calibration : null;
  A('reconcileUsage ok 且导出因子', rec.ok === true && calibration !== null);
  A('宽松估算（provider<estimate）→ factor<1', calibration !== null && calibration.factor < 1);
  A('refineEstimate 恒 ≥ 已观测最大 usage（上界不破）', calibration !== null && refineEstimate(1000, calibration) >= 250);
  A('refineEstimate < 原始估算（更紧、更精确）', calibration !== null && refineEstimate(1000, calibration) < 1000);
  const rec2 = reconcileUsage(observations);
  A('同观测 → 同 factorVersion（内容派生，顺序无关稳定）',
    rec.ok && rec2.ok && rec.calibration?.factorVersion === rec2.calibration?.factorVersion);
  const under: UsageObservation[] = [{ estimator: 'utf8-bytes-v1', estimateInputTokens: 10, providerInputTokens: 30, providerOutputTokens: 5, service: 's', model: 'm', batch: 'b', observedAtMs: 1 }];
  const underRec = reconcileUsage(under);
  A('低估观测 → hasUnderEstimate + factor>1（上界顶回）',
    underRec.ok && underRec.calibration !== null && underRec.calibration.hasUnderEstimate && underRec.calibration.factor > 1);
  A('低估后 refineEstimate 仍支配 provider usage', underRec.ok && underRec.calibration !== null && refineEstimate(10, underRec.calibration) >= 30);
}
{
  // 预算器接入校准：calibrated 标志 + 更紧的 renderedInput。
  const costPolicy: ModelCostPolicy = {
    scopeId: 'ctx-02-proof', provider: 'proof', model: 'qwen-plus', region: 'cn-proof', priceRevision: 'r1',
    maxInputTokens: 200_000, maxOutputTokens: 1234, contextWindowTokens: 200_000,
    contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 1000,
  };
  const obs: UsageObservation[] = [{ estimator: 'utf8-bytes-v1', estimateInputTokens: 1000, providerInputTokens: 250, providerOutputTokens: 60, service: 's', model: 'qwen-plus', batch: 'b', observedAtMs: 1 }];
  const cal = reconcileUsage(obs);
  const c = components({ system: '系统指令', permissionSnapshot: '授权快照', schema: '{"type":"object"}', userData: '用户数据', rag: '检索素材', recentTurns: ['最近一轮'], summary: '' });
  const uncal = planDispatchBudget(c, contextBudgetPolicyFromCostPolicy(costPolicy));
  const calibrated = planDispatchBudget(c, contextBudgetPolicyFromCostPolicy(costPolicy, { calibration: cal.ok ? cal.calibration ?? undefined : undefined }));
  A('校准接入后 plan.calibrated=true', calibrated.ok && calibrated.plan.calibrated === true);
  A('未校准 plan.calibrated=false', uncal.ok && uncal.plan.calibrated === false);
  A('校准后 renderedInput ≤ 未校准（更紧、不越上界）',
    uncal.ok && calibrated.ok && calibrated.plan.renderedInputTokens <= uncal.plan.renderedInputTokens);
}

section('5. 请求显式带 max_output（真实传递到供应商）');
{
  const costPolicy: ModelCostPolicy = {
    scopeId: 'ctx-02-proof', provider: 'proof', model: 'qwen-plus', region: 'cn-proof', priceRevision: 'r1',
    maxInputTokens: 200_000, maxOutputTokens: 1234, contextWindowTokens: 200_000,
    contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 1000,
  };
  const fromPolicy = contextBudgetPolicyFromCostPolicy(costPolicy, { service: 'proof.maxoutput' });
  A('budgetPolicy.maxOutputTokens 与授权根一致（catalog 即授权根）', fromPolicy.maxOutputTokens === costPolicy.maxOutputTokens);
  A('budgetPolicy 窗口/余量/估算器均取自授权根',
    fromPolicy.contextWindowTokens === costPolicy.contextWindowTokens
    && fromPolicy.safetyMarginTokens === costPolicy.contextSafetyMarginTokens
    && fromPolicy.estimator === costPolicy.contextEstimator);

  process.env.NODE_ENV = 'test';
  process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';
  const bodies: Array<Record<string, unknown>> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (_i: string | URL | Request, init?: RequestInit) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ ok: true }) } }], usage: { prompt_tokens: 5, completion_tokens: 1 } }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  try {
    const client = openAICompatibleClient({ baseUrl: 'https://model.invalid', apiKey: 'test-only', model: costPolicy.model, costPolicy });
    const result = await client.complete({ service: 'proof.maxoutput', system: '系统指令', userData: '用户答案' }, 1);
    A('请求确实派发（fake transport 收到 1 请求）', result.ok === true && bodies.length === 1);
    A('实发 body.max_tokens === maxOutputTokens（显式输出上限）', bodies[0]?.max_tokens === costPolicy.maxOutputTokens);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

section('6. 绝不静默截断');
{
  // 任何 trimmed ⇒ degraded（绝不能「裁了却标 within_budget」）。
  const p = policy({ contextWindowTokens: 1000, maxOutputTokens: 100, safetyMarginTokens: 50 });
  const c = components({ summary: 'M'.repeat(300), rag: 'R'.repeat(400), recentTurns: ['t'.repeat(400), 'o'.repeat(400), 'e'.repeat(400)] });
  const d = planDispatchBudget(c, p);
  // 状态是 3 值 enum：degraded 已排除 within_budget（「裁了却标完整」被类型层面排除）。
  A('有裁剪 ⇒ status 必为 degraded（非 within_budget）', d.ok && d.plan.status === 'degraded');
  const clean = planDispatchBudget(components(), p);
  A('未裁剪 ⇒ status=within_budget', clean.ok && clean.plan.status === 'within_budget');
  // 估算器返回数字，绝不返回被截字符串（类型+值双重：estimateContextTokens 输出是 number）。
  const estimate = estimateContextTokens('不会返回截断字符串的内容', 'utf8-bytes-v1');
  A('估算器返回 token 数字、非截断字符串', typeof estimate === 'number' && Number.isSafeInteger(estimate) && estimate > 0);
  // 超预算且不可降级 ⇒ rejected（非悄悄丢内容后假装完整）。
  const noDegrade = planDispatchBudget(c, { ...p, allowDegrade: false });
  A('不可降级超预算 ⇒ rejected（非静默截断）', noDegrade.ok && noDegrade.plan.status === 'rejected' && noDegrade.plan.error === 'context_budget_exceeded');
}

section('7. 审计修复：多轮 recent_turns 降级 + safetyMargin 口径一致');
{
  // MEDIUM-1：10×300B turn、availableInput=900。旧实现 trimOrder 只走一遍 → recent_turns 最多裁一轮（3000→2700 仍 2704>900）即 rejected；
  // 修复后外层 while 反复遍历 trimOrder，逐轮裁到 fit（余 2 轮 600B，共裁 8 轮）→ degraded，绝非「只裁 1 轮即拒」。
  const p = policy({ contextWindowTokens: 1000, maxOutputTokens: 100, safetyMarginTokens: 0 }); // availableInput = 1000−100 = 900
  const c = components({ recentTurns: Array.from({ length: 10 }, () => 't'.repeat(300)) }); // 10×300=3000B + 底座 4B = 3004 > 900
  const d = planDispatchBudget(c, p);
  A('多轮降级：10×300B turn 逐轮裁到 fit → degraded（非只裁 1 轮即 rejected）', d.ok && d.plan.status === 'degraded');
  A('多轮降级：recent_turns 从 10 轮裁到 2 轮（tokens=600 / original=3000，裁了 8 轮 >1）',
    d.ok && entry(d.plan, 'recent_turns')?.tokens === 600 && entry(d.plan, 'recent_turns')?.originalTokens === 3000);
  A('多轮降级：renderedInput 落回 availableInput 内（604 ≤ 900）',
    d.ok && d.plan.renderedInputTokens === 604 && d.plan.renderedInputTokens <= d.plan.availableInputTokens);
}
{
  // MEDIUM-1（裁无可裁分支）：availableInput=3 时底座 4B 本身超窗，recent_turns 必须被逐轮裁到 0 才拒绝——
  // 证明多轮尝试到底（裁了全部 10 轮），而非只裁 1 轮即拒。
  const p = policy({ contextWindowTokens: 103, maxOutputTokens: 100, safetyMarginTokens: 0 }); // availableInput = 3
  const c = components({ recentTurns: Array.from({ length: 10 }, () => 't'.repeat(300)) }); // 3004 > 3
  const d = planDispatchBudget(c, p);
  A('多轮裁到底仍超 → rejected + context_budget_exceeded（非只裁 1 轮）',
    d.ok && d.plan.status === 'rejected' && d.plan.error === 'context_budget_exceeded');
  A('多轮裁到底：recent_turns 被裁空（tokens=0 / original=3000 / trimmed）',
    d.ok && entry(d.plan, 'recent_turns')?.tokens === 0 && entry(d.plan, 'recent_turns')?.originalTokens === 3000 && entry(d.plan, 'recent_turns')?.trimmed === true);
}
{
  // MEDIUM-2：同一 catalog 字段 contextSafetyMarginTokens=0 → contextBudgetPolicyFromCostPolicy 必须 throw（fail-closed），
  // 与 transport 层 planContextBudget 的 validPositive(≥1) 口径一致，绝不产生「预算器放行、transport 拒绝」的分裂。
  const zeroMarginCost: ModelCostPolicy = {
    scopeId: 'ctx-02-proof', provider: 'proof', model: 'qwen-plus', region: 'cn-proof', priceRevision: 'r1',
    maxInputTokens: 200_000, maxOutputTokens: 1234, contextWindowTokens: 200_000,
    contextEstimator: 'utf8-bytes-v1', contextSafetyMarginTokens: 0,
  };
  let threw = false;
  try { contextBudgetPolicyFromCostPolicy(zeroMarginCost); } catch (e) { threw = (e as Error).message === 'context_budget_policy_invalid'; }
  A('safetyMargin=0 → contextBudgetPolicyFromCostPolicy throw context_budget_policy_invalid（与 transport 口径一致）', threw);
}

console.log(`\n${failures === 0 ? '✓ context-budget（CTX-02 派发前预算器）全部通过' : `✗ ${failures} 条失败`}`);
process.exit(failures === 0 ? 0 : 1);
