/**
 * UC-INT-LENGTH-01：动态长度（早停 / 加深 / 软预算上调 / 高位绝对杀开关 / 出处）。
 * 纯域、确定性；16 不是产品硬顶。pnpm adaptive-length:prove
 */
import {
  initMind, ingestAssessment, decideNext, withCurrent, markUnresolved, rememberDecision,
  interviewCoverage, boundedSoftBudget, boundedAbsoluteMaxTurns, derivedSoftBudget,
  DEFAULT_ABSOLUTE_MAX_TURNS, PLATFORM_ABSOLUTE_CEILING_TURNS, SOFT_BUDGET_RAISE_STEP,
  LONG_INTERVIEW_ABSOLUTE_BANDS,
  type InterviewMind, type NextAction, type DecisionProvenance,
} from '../src/index.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const ask = (a: NextAction) => (a.kind === 'ask' ? a : null);
const conclude = (a: NextAction) => (a.kind === 'conclude' ? a : null);

function sameDecision(a: NextAction, b: NextAction): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function provenanceClean(p: DecisionProvenance, forbidden: string[]): boolean {
  const blob = JSON.stringify(p);
  return !forbidden.some((s) => blob.includes(s))
    && p.coverage.evidenceItems >= 0
    && p.turn >= 0
    && p.absoluteMaxTurns === p.safetyCeiling
    && Array.isArray(p.citedCompetencies);
}

function strongCore(name = '系统设计'): InterviewMind {
  return withCurrent(initMind([{ name, core: true }, { name: '缓存' }]), name);
}

/* ───── 特 TC-INT-LENGTH-01-S1：软预算 vs 绝对杀开关 ───── */
A('S1 默认绝对杀开关=120(长时面试档),不是 16', DEFAULT_ABSOLUTE_MAX_TURNS === 120 && LONG_INTERVIEW_ABSOLUTE_BANDS.includes(120));
A('S1 未指定绝对 → 120；999 夹到平台天花板 180(杀开关的杀开关)',
  boundedAbsoluteMaxTurns(undefined) === 120 && boundedAbsoluteMaxTurns(999) === PLATFORM_ABSOLUTE_CEILING_TURNS);
A('S1 60/90/120 档可配置', boundedAbsoluteMaxTurns(60) === 60 && boundedAbsoluteMaxTurns(90) === 90 && boundedAbsoluteMaxTurns(120) === 120);
A('S1 派生软预算=各能力 probeCap 之和', derivedSoftBudget([{ name: 'A', core: true }, { name: 'B' }]) === 5);
A('S1 显式软预算 8 不夹到 16', initMind(['x'], 8).maxTurns === 8 && initMind(['x'], 8).absoluteMaxTurns === 120);
A('S1 未指定软预算 → 按覆盖计划派生,不是 16', initMind(['x']).maxTurns === derivedSoftBudget(['x']) && initMind(['x']).maxTurns !== 16);
A('S1 软预算 999 只能涨到绝对杀开关,不能无界', boundedSoftBudget(999, 120, 8) === 120);

/* ───── 正 TC-INT-LENGTH-01-main：强答+钩子加深（无钩子仍一次结算）───── */
{
  let m = strongCore();
  m = ingestAssessment(m, '系统设计', 92, ['讲清了限流与降级'], true);
  const first = ask(decideNext(m));
  A('main 核心强答+钩子 → 同能力加深(probe_deepen_strong)，不是立刻收尾',
    first?.mode === 'probe' && first.competency === '系统设计' && first.reason === 'probe_deepen_strong');
  A('main 加深出处引用该能力；钩子封顶故核心尚未算结算证据够强',
    first !== null && first.provenance.code === 'probe_deepen_strong'
    && first.provenance.citedCompetencies.includes('系统设计')
    && first.provenance.coverage.resolvedStrong === 0);
  let resolved = withCurrent(strongCore(), '系统设计');
  resolved = ingestAssessment(resolved, '系统设计', 92, ['讲透了'], false);
  const noHook = decideNext(resolved);
  A('main 无钩子高分仍一次结算(不过度追问)，换覆盖或收尾',
    noHook.kind === 'conclude' || (noHook.kind === 'ask' && noHook.competency !== '系统设计'));
}

/* ───── 复 TC-INT-LENGTH-01-M1：早停 turn<8 / 深挖过 8 / 软预算上调 ───── */
{
  let weak: InterviewMind = withCurrent(initMind(['并发', '缓存', '可靠性']), '并发');
  weak = markUnresolved(weak, '并发');
  weak = withCurrent(weak, '缓存');
  weak = markUnresolved(weak, '缓存');
  const early = conclude(decideNext(weak));
  A('M1 两次未决 → early_weak，且 turn<8',
    early?.reason === 'early_weak' && weak.turn < 8 && early.provenance.code === 'early_weak');
  A('M1 早停出处引用被放弃的能力',
    !!early && early.provenance.citedCompetencies.includes('并发') && early.provenance.signals.unresolvedCount === 2);
  A('M1 早停 provenance 不含答案/证据全文',
    !!early && provenanceClean(early.provenance, ['未正面作答', '讲清了', '@', '1[3-9]']));
}

{
  const specs = [
    { name: 'A', core: true }, { name: 'B', core: true },
    { name: 'C', core: false }, { name: '协作与沟通', behavioral: true },
  ];
  let deep = initMind(specs, 8);
  let guard = 0;
  let sawRaise = false;
  while (decideNext(deep).kind === 'ask' && guard++ < 40) {
    const action = decideNext(deep);
    if (action.kind === 'ask' && action.reason === 'raise_soft_budget') sawRaise = true;
    const a = ask(action)!;
    deep = rememberDecision(deep, action);
    deep = withCurrent(deep, a.competency);
    deep = ingestAssessment(deep, a.competency, 95, [`钩子-${a.competency}`], true);
  }
  const done = conclude(decideNext(deep));
  A('M1 软预算 8 + 全程 hasHook → turn>8 且发生 raise_soft_budget',
    deep.turn > 8 && sawRaise && (deep.budgetRaises ?? 0) >= 1 && deep.maxTurns > 8 && guard < 40);
  A('M1 深挖收尾不是 safety_ceiling,也不是被 16 砍断',
    done !== null && done.reason !== 'safety_ceiling' && done.reason !== 'early_weak'
    && deep.turn !== 16 && done.provenance.absoluteMaxTurns === 120);
}

/* ───── 逃 TC-INT-LENGTH-01-E5：16 不是墙；只有高位绝对杀开关是墙 ───── */
{
  let at16 = withCurrent(initMind([{ name: 'A', core: true }], 16, 120), 'A');
  at16 = { ...at16, turn: 16, maxTurns: 16 };
  const mid = decideNext(at16);
  A('E5 turn=16 且仍可探 → 上调软预算,不是 safety_ceiling',
    mid.kind === 'ask' && mid.reason === 'raise_soft_budget' && (mid.softBudget ?? 0) === 16 + SOFT_BUDGET_RAISE_STEP);
}

{
  let cap = withCurrent(initMind([{ name: 'A', core: true }], 8, 120), 'A');
  cap = { ...cap, turn: DEFAULT_ABSOLUTE_MAX_TURNS, maxTurns: DEFAULT_ABSOLUTE_MAX_TURNS };
  const stop = conclude(decideNext(cap));
  A('E5 只有 turn≥120 才 safety_ceiling', stop?.reason === 'safety_ceiling' && stop.provenance.safetyCeiling === 120);
}

{
  let locked = withCurrent(initMind(['x', 'y'], 1, 1), 'x');
  locked = ingestAssessment(locked, 'x', 50, ['中等']);
  A('E5 测试可将绝对杀开关压到 1(控费),那时才硬收尾',
    conclude(decideNext(locked))?.reason === 'safety_ceiling');
}

/* ───── 并 TC-INT-LENGTH-01-E1：同 mind 决策幂等 ───── */
{
  let m = withCurrent(initMind([{ name: 'A', core: true }]), 'A');
  m = ingestAssessment(m, 'A', 88, ['稳定证据'], false);
  const a1 = decideNext(m);
  const a2 = decideNext(m);
  A('E1 同 mind 两次 decideNext 全等（含 provenance）', sameDecision(a1, a2));
  const remembered = rememberDecision(m, a1);
  A('E1 rememberDecision 不改变下一次决策', sameDecision(decideNext(remembered), a1));
}

/* ───── 刁 TC-INT-LENGTH-01-T1：不信任模型停续信号 ───── */
{
  const poisoned = {
    ...strongCore(),
    lastDecision: {
      code: 'early_weak' as const,
      turn: 0, maxTurns: 8, softBudget: 8, absoluteMaxTurns: 120, safetyCeiling: 120, budgetRaises: 9,
      coverage: interviewCoverage(strongCore()),
      citedCompetencies: ['伪造'],
      signals: { consecutiveLow: 0, consecutivePivots: 9, unresolvedCount: 9, offRampCount: 9 },
    },
  };
  const scored = ingestAssessment(poisoned, '系统设计', 91, ['真实证据'], true);
  const act = decideNext({ ...scored, ...{ shouldConclude: true, stop: true } as object });
  A('T1 伪造 lastDecision + shouldConclude 不能单独收尾', act.kind === 'ask' && act.reason === 'probe_deepen_strong');
  A('T1 决策出处不回放伪造 cited「伪造」作为控制输入（以当前能力为准）',
    act.kind === 'ask' && act.provenance.citedCompetencies.includes('系统设计'));
}

{
  let bounce = initMind([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }]);
  for (const name of ['A', 'B', 'C'] as const) {
    bounce = withCurrent(bounce, name);
    bounce = ingestAssessment(bounce, name, 30, ['含糊']);
    bounce = ingestAssessment(bounce, name, 45, ['仍浅']);
  }
  const thrash = conclude(decideNext(bounce));
  A('T1/逃 三连弱探后换题空转 → thrashing 或 early_weak，且 turn<8',
    thrash !== null && (thrash.reason === 'thrashing' || thrash.reason === 'early_weak') && bounce.turn < 8);
}

{
  const raw = '我的邮箱是user@example.com，电话13800138000，全文证据禁止入库出处';
  let m = withCurrent(initMind([{ name: '泄漏', core: true }]), '泄漏');
  m = ingestAssessment(m, '泄漏', 93, [raw], true);
  const p = decideNext(m);
  A('T1 出处 JSON 不得含答案式证据全文/PII',
    p.kind === 'ask' && provenanceClean(p.provenance, [raw, 'user@example.com', '13800138000']));
}

{
  let m = withCurrent(initMind([{ name: '唯一核心', core: true }]), '唯一核心');
  m = ingestAssessment(m, '唯一核心', 90, ['证据A'], false);
  const done = conclude(decideNext(m));
  A('覆盖：核心无钩子高分即结算且有计分证据 → coverage_met', done?.reason === 'coverage_met');
}

console.log(`\n${fail === 0 ? '✓ 动态面试长度(早停/加深/软预算上调/高位杀开关/出处)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
