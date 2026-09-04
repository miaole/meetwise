/**
 * UC-INT-LENGTH-01：动态长度政策（早停 / 加深 / 安全天花板 / 出处）。
 * 纯域、确定性；模型字段不得驱动停续。pnpm adaptive-length:prove
 */
import {
  initMind, ingestAssessment, decideNext, withCurrent, markUnresolved, rememberDecision,
  interviewCoverage, boundedInterviewTurns, SAFETY_CEILING_TURNS, DEFAULT_MAX_TURNS,
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
    && p.safetyCeiling === SAFETY_CEILING_TURNS
    && Array.isArray(p.citedCompetencies);
}

function strongCore(name = '系统设计'): InterviewMind {
  return withCurrent(initMind([{ name, core: true }, { name: '缓存' }], 16), name);
}

/* ───── 特 TC-INT-LENGTH-01-S1：预算夹紧 ───── */
A('S1 undefined → 默认预算=安全天花板 16（不再是产品硬顶 8）', boundedInterviewTurns(undefined) === DEFAULT_MAX_TURNS && DEFAULT_MAX_TURNS === 16);
A('S1 NaN / 非整数 → 默认 16', boundedInterviewTurns(Number.NaN) === 16 && boundedInterviewTurns(8.5) === 16);
A('S1 -1 / 0 → 至少 1', boundedInterviewTurns(-1) === 1 && boundedInterviewTurns(0) === 1);
A('S1 999 → 夹到 16，不能无界', boundedInterviewTurns(999) === SAFETY_CEILING_TURNS);
A('S1 显式 8 仍被尊重（调用方预算，不是图硬顶）', boundedInterviewTurns(8) === 8 && initMind(['x'], 8).maxTurns === 8);
A('S1 initMind(999) 也夹到 16', initMind(['x'], 999).maxTurns === 16);

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

/* ───── 复 TC-INT-LENGTH-01-M1：早停 turn<8 与深挖 turn>8 ───── */
{
  let weak: InterviewMind = withCurrent(initMind(['并发', '缓存', '可靠性'], 16), '并发');
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
  let deep = initMind(specs, 16);
  let guard = 0;
  const reasons: string[] = [];
  while (decideNext(deep).kind === 'ask' && guard++ < 40) {
    const a = ask(decideNext(deep))!;
    reasons.push(a.reason);
    deep = withCurrent(deep, a.competency);
    deep = ingestAssessment(deep, a.competency, 95, [`钩子-${a.competency}`], true);
  }
  const done = conclude(decideNext(deep));
  A('M1 全程 hasHook 多核心 → turn>8 仍继续后收尾（不再被 8 砍断）',
    deep.turn > 8 && deep.turn <= 16 && done !== null && guard < 40);
  A('M1 深挖路径 reason 不是 early_weak，且带出处',
    done !== null && done.reason !== 'early_weak' && done.provenance.turn === deep.turn
    && (done.reason === 'all_resolved' || done.reason === 'coverage_met' || done.reason === 'budget_exhausted' || done.reason === 'safety_ceiling'));
}

/* ───── 逃 TC-INT-LENGTH-01-E5：天花板优先于「还可探」───── */
{
  const specs = [{ name: 'A', core: true }, { name: 'B', core: true }, { name: 'C', core: true }];
  let m = initMind(specs, 16);
  for (let i = 0; i < SAFETY_CEILING_TURNS; i++) {
    const a = ask(decideNext(m));
    if (!a) break;
    m = withCurrent(m, a.competency);
    m = ingestAssessment(m, a.competency, 99, ['钩子'], true);
  }
  m = { ...m, turn: SAFETY_CEILING_TURNS, maxTurns: 16 };
  const cap = conclude(decideNext(m));
  A('E5 turn=16 即便仍有钩子可探 → safety_ceiling', cap?.reason === 'safety_ceiling');
  A('E5 天花板优先于预算耗尽文案（同刻也触顶时仍是 safety_ceiling）', cap?.provenance.code === 'safety_ceiling');
}

{
  let m = withCurrent(initMind(['x', 'y'], 1), 'x');
  m = ingestAssessment(m, 'x', 50, ['中等']);
  const budget = conclude(decideNext(m));
  A('E5 调用方预算 1 先耗尽 → budget_exhausted（未到 16）', budget?.reason === 'budget_exhausted' && m.turn === 1);
}

/* ───── 并 TC-INT-LENGTH-01-E1：同 mind 决策幂等 ───── */
{
  let m = withCurrent(initMind([{ name: 'A', core: true }], 16), 'A');
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
      turn: 0, maxTurns: 16, safetyCeiling: 16,
      coverage: interviewCoverage(strongCore()),
      citedCompetencies: ['伪造'],
      signals: { consecutiveLow: 0, consecutivePivots: 9, unresolvedCount: 9, offRampCount: 9 },
    },
  };
  const scored = ingestAssessment(poisoned, '系统设计', 91, ['真实证据'], true);
  const act = decideNext({ ...scored, /* 模型想塞的控制字段必须被忽略 */ ...{ shouldConclude: true, stop: true } as object });
  A('T1 伪造 lastDecision + shouldConclude 不能单独收尾', act.kind === 'ask' && act.reason === 'probe_deepen_strong');
  A('T1 决策出处不回放伪造 cited「伪造」作为控制输入（以当前能力为准）',
    act.kind === 'ask' && act.provenance.citedCompetencies.includes('系统设计'));
}

{
  let bounce = initMind([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }], 16);
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
  let m = withCurrent(initMind([{ name: '泄漏', core: true }], 16), '泄漏');
  m = ingestAssessment(m, '泄漏', 93, [raw], true);
  const p = decideNext(m);
  A('T1 出处 JSON 不得含答案式证据全文/PII',
    p.kind === 'ask' && provenanceClean(p.provenance, [raw, 'user@example.com', '13800138000']));
}

/* ───── 覆盖结算：有核心+证据 → coverage_met ───── */
{
  let m = withCurrent(initMind([{ name: '唯一核心', core: true }], 16), '唯一核心');
  m = ingestAssessment(m, '唯一核心', 90, ['证据A'], false);
  const done = conclude(decideNext(m));
  A('覆盖：核心无钩子高分即结算且有计分证据 → coverage_met', done?.reason === 'coverage_met');
}

console.log(`\n${fail === 0 ? '✓ 动态面试长度(早停/加深/天花板/出处)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
