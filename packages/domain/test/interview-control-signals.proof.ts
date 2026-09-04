/** INT-LEVEL 控制信号地基（UC-INT-LEVEL-SIGNAL-01）：weak/thrashing → decideNext。pnpm adaptive-signals:prove */
import {
  initMind, ingestAssessment, decideNext, withCurrent, markUnresolved, markClarify,
  observeInterviewSignals, INTERVIEW_CONTROL_SIGNAL_KINDS, INTERVIEW_CONCLUDE_REASONS,
  WEAK_MIN_PROBED, WEAK_MIN_TURNS, WEAK_CONFIDENCE_CEILING, SIGNAL_CONF_ENOUGH,
  THRASH_MIN_SAMPLES, THRASH_MIN_FLIPS, type InterviewMind,
} from '../src/index.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

function weakAcross(names: string[], maxTurns = 16): InterviewMind {
  let m = initMind(names.map((name) => ({ name })), maxTurns);
  for (const name of names.slice(0, WEAK_MIN_PROBED)) {
    m = withCurrent(m, name);
    m = ingestAssessment(m, name, 30, ['含糊']);
    m = ingestAssessment(m, name, 28, ['仍弱']);
  }
  return m;
}

function thrashMind(): InterviewMind {
  let m = initMind([{ name: 'A', core: true }, { name: 'B' }], 16);
  const seq: Array<[string, number]> = [['A', 90], ['B', 25], ['A', 88], ['B', 22]];
  for (const [name, s] of seq) {
    m = withCurrent(m, name);
    m = ingestAssessment(m, name, s, ['翻转'], true);
  }
  return m;
}

/* ── 正 TC-INT-LEVEL-SIGNAL-01-main ── */
{
  A('enum 锁定 none/weak/thrashing（非布尔汤）',
    INTERVIEW_CONTROL_SIGNAL_KINDS.join(',') === 'none,weak,thrashing');
  A('conclude reason 含 early_weak/early_thrashing，且保留预算与 all_resolved',
    INTERVIEW_CONCLUDE_REASONS.includes('early_weak') && INTERVIEW_CONCLUDE_REASONS.includes('early_thrashing')
    && INTERVIEW_CONCLUDE_REASONS.includes('budget_exhausted') && INTERVIEW_CONCLUDE_REASONS.includes('all_resolved'));

  const w = weakAcross(['并发', '缓存', '可靠性']);
  const ws = observeInterviewSignals(w);
  const wa = decideNext(w);
  A('正: 两能力持续弱且 turn≥4 → signal.weak',
    ws.kind === 'weak' && w.turn >= WEAK_MIN_TURNS && ws.probedCount >= WEAK_MIN_PROBED);
  A('正: decideNext 消费 weak → early_weak（第三门未探也停）',
    wa.kind === 'conclude' && wa.reason === 'early_weak'
    && w.competencies.some((c) => c.name === '可靠性' && c.depthProbed === 0));

  const t = thrashMind();
  const ts = observeInterviewSignals(t);
  const ta = decideNext(t);
  A('正: 跨能力 hasHook 高/低翻转≥3 且 pivot≥3 且无人够强 → thrashing',
    ts.kind === 'thrashing' && ts.scoreFlips >= THRASH_MIN_FLIPS && ts.pivotCount >= 3
    && t.recentScores?.length === THRASH_MIN_SAMPLES
    && t.competencies.every((c) => c.confidence < SIGNAL_CONF_ENOUGH));
  A('正: decideNext 消费 thrashing → early_thrashing',
    ta.kind === 'conclude' && ta.reason === 'early_thrashing');

  const dual = {
    ...t,
    competencies: [
      ...t.competencies.map((c) => ({ ...c, confidence: 0.2 })),
      { name: 'C', confidence: 0, depthProbed: 0, evidence: [], core: false, behavioral: false },
    ],
  };
  A('正: weak 与 thrashing 同真 → 观察为 weak，decideNext=early_weak',
    observeInterviewSignals(dual).kind === 'weak'
    && observeInterviewSignals(dual).scoreFlips >= THRASH_MIN_FLIPS
    && (dual.pivotCount ?? 0) >= 3
    && decideNext(dual).kind === 'conclude' && decideNext(dual).reason === 'early_weak');
}

/* ── 特 TC-INT-LEVEL-SIGNAL-01-S1 ── */
{
  A('特: null/undefined/空清单 → none',
    observeInterviewSignals(null).kind === 'none'
    && observeInterviewSignals(undefined).kind === 'none'
    && observeInterviewSignals(initMind([])).kind === 'none');
  A('特: turn=0 初始 mind → none，decideNext 仍 pivot 开局',
    observeInterviewSignals(initMind(['并发'])).kind === 'none'
    && decideNext(initMind(['并发'])).kind === 'ask');
  const legacy = { ...initMind(['缓存']), recentScores: undefined, recentDifficulties: undefined, pivotCount: undefined };
  A('特: 旧 checkpoint 缺轨迹字段 → none（不补造、不提前终止）',
    observeInterviewSignals(legacy).kind === 'none');
  const legacyWeak = {
    ...weakAcross(['并发', '缓存', '可靠性']),
    recentScores: undefined, recentDifficulties: undefined, pivotCount: undefined,
  };
  A('特: 旧 checkpoint 即使 turn≥4 且两门已弱 → 仍 none（不按缺轨迹开火）',
    legacyWeak.turn >= WEAK_MIN_TURNS && observeInterviewSignals(legacyWeak).kind === 'none'
    && decideNext(legacyWeak).kind === 'ask');
  const cjk = weakAcross(['系统设计', '一致性哈希']);
  A('特: CJK 能力名同样可触发 weak', observeInterviewSignals(cjk).kind === 'weak');
  const before = cjk.maxTurns;
  observeInterviewSignals(cjk); decideNext(cjk);
  A('特: 观察/决策不改写 maxTurns', cjk.maxTurns === before);
}

/* ── 异 TC-INT-LEVEL-SIGNAL-01-E1 ── */
{
  const m = weakAcross(['A', 'B', 'C']);
  const a = JSON.stringify(observeInterviewSignals(m));
  const b = JSON.stringify(observeInterviewSignals(m));
  const c = JSON.stringify(observeInterviewSignals(m));
  const d1 = JSON.stringify(decideNext(m));
  const d2 = JSON.stringify(decideNext(m));
  A('异: 同一 mind 重放 3 次信号 JSON 全等（纯函数幂等）', a === b && b === c);
  A('异: 同一 mind 重放 decideNext JSON 全等', d1 === d2 && JSON.parse(d1).reason === 'early_weak');
}

/* ── 并 TC-INT-LEVEL-SIGNAL-01-E2 ── */
{
  const frozen = Object.freeze(weakAcross(['P', 'Q', 'R']));
  const first = JSON.stringify(observeInterviewSignals(frozen));
  const all = Array.from({ length: 20 }, () => JSON.stringify(observeInterviewSignals(frozen)));
  A('并: 20 次并行观察同一冻结 mind 结果全等', all.every((x) => x === first));
}

/* ── 逃 TC-INT-LEVEL-SIGNAL-01-E3 ── */
{
  const w = weakAcross(['X', 'Y', 'Z'], 4);
  A('逃: 构造后 turn 已达 maxTurns 且信号为 weak', w.turn >= w.maxTurns && observeInterviewSignals(w).kind === 'weak');
  A('逃: turn>=maxTurns 覆盖 weak → 仍 budget_exhausted（预算先赢）',
    decideNext(w).kind === 'conclude' && decideNext(w).reason === 'budget_exhausted');
  const t = { ...thrashMind(), turn: 16, maxTurns: 16 };
  A('逃: turn>=maxTurns 覆盖 thrashing → 仍 budget_exhausted',
    observeInterviewSignals(t).kind === 'thrashing'
    && decideNext(t).kind === 'conclude' && decideNext(t).reason === 'budget_exhausted');
  A('逃: 缺 competencies 的残缺 mind → none（fail-closed 不抛）',
    observeInterviewSignals({ turn: 4 } as never).kind === 'none');
}

/* ── 复 TC-INT-LEVEL-SIGNAL-01-M1 ── */
{
  let m = withCurrent(initMind([{ name: 'A' }, { name: 'B' }], 12), 'A');
  m = ingestAssessment(m, 'A', 30, ['弱1']);
  A('复: 单次弱答 → 仍 probe 同能力，不 early_weak',
    observeInterviewSignals(m).kind === 'none'
    && decideNext(m).kind === 'ask' && decideNext(m).mode === 'probe' && decideNext(m).competency === 'A');
  m = ingestAssessment(m, 'A', 28, ['弱2']);
  const afterOff = decideNext(m);
  A('复: 单能力 off-ramp 后 pivot，不 conclude',
    afterOff.kind === 'ask' && afterOff.mode === 'pivot' && afterOff.competency === 'B'
    && observeInterviewSignals(m).kind === 'none');

  let done = withCurrent(initMind([{ name: '独' }], 8), '独');
  done = ingestAssessment(done, '独', 90, ['讲清']);
  A('复: 唯一能力够强 → all_resolved 优先于信号',
    decideNext(done).kind === 'conclude' && decideNext(done).reason === 'all_resolved'
    && observeInterviewSignals(done).kind === 'none');

  const exhausted = weakAcross(['并发', '缓存']);
  A('复: 两门均 off-ramp 探尽、观察仍为 weak → all_resolved（探尽优先于 early_*）',
    observeInterviewSignals(exhausted).kind === 'weak'
    && exhausted.competencies.every((c) => c.depthProbed >= 2)
    && decideNext(exhausted).kind === 'conclude' && decideNext(exhausted).reason === 'all_resolved');
}

/* ── 刁 TC-INT-LEVEL-SIGNAL-01-T1 ── */
{
  const base = weakAcross(['并发', '缓存', '可靠性']);
  const poisoned = {
    ...base,
    observedBand: 'senior',
    yearsOfExperience: 12,
    gender: 'x',
    school: '某校',
    weight: 99,
    clientBand: 'L7',
  } as InterviewMind & Record<string, unknown>;
  A('刁: 注入 band/年限/性别/学校/权重不改变信号',
    JSON.stringify(observeInterviewSignals(poisoned)) === JSON.stringify(observeInterviewSignals(base)));
  A('刁: 注入字段不能让 decideNext 改写成等级/band',
    decideNext(poisoned).kind === 'conclude' && decideNext(poisoned).reason === 'early_weak');

  let hook = withCurrent(initMind([{ name: 'A', core: true }, { name: 'B' }], 16), 'A');
  for (const s of [99, 20, 95, 22]) hook = ingestAssessment(hook, 'A', s, ['钩子'], true);
  A('刁: 单能力 hasHook 深挖高/低翻转不标 thrashing（无跨能力 pivot）',
    (hook.recentScores?.length ?? 0) >= 4 && observeInterviewSignals(hook).scoreFlips >= 3
    && observeInterviewSignals(hook).kind === 'none'
    && decideNext(hook).kind === 'ask' && decideNext(hook).reason === undefined);
  A('刁: hasHook 高分 confidence 封顶，不标 weak',
    (hook.competencies[0]?.confidence ?? 1) >= WEAK_CONFIDENCE_CEILING
    && (hook.competencies[0]?.confidence ?? 1) < SIGNAL_CONF_ENOUGH);

  let rotate = initMind([{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }], 16);
  for (const name of ['A', 'B', 'C', 'D']) {
    rotate = withCurrent(rotate, name);
    rotate = ingestAssessment(rotate, name, 50, ['中档']);
  }
  A('刁: 平稳换题 pivot≥3 但无高/低翻转 → 不标 thrashing',
    (rotate.pivotCount ?? 0) >= 3 && observeInterviewSignals(rotate).scoreFlips === 0
    && observeInterviewSignals(rotate).kind === 'none' && decideNext(rotate).kind === 'ask');

  let one = withCurrent(initMind(['单题'], 8), '单题');
  one = ingestAssessment(one, '单题', 100, ['满分']);
  A('刁: 单题 100 分不单独提前终止（够强则 all_resolved，不是 early_*）',
    decideNext(one).kind === 'conclude' && decideNext(one).reason === 'all_resolved');

  let skip = withCurrent(initMind(['M', 'N', 'P'], 12), 'M');
  skip = markClarify(skip);
  skip = markUnresolved(skip, 'M');
  skip = withCurrent(skip, 'N');
  skip = markClarify(skip);
  skip = markUnresolved(skip, 'N');
  A('刁: 仅 clarify/unresolved 烧 turn≥4 且两门已探、无 ingest → none（不靠假分开火）',
    skip.turn >= WEAK_MIN_TURNS && skip.competencies.filter((c) => c.depthProbed >= 1).length >= 2
    && (skip.recentScores?.length ?? 0) === 0 && observeInterviewSignals(skip).kind === 'none'
    && decideNext(skip).kind === 'ask');
}

console.log(`\n${fail === 0 ? '✓ INT-LEVEL 控制信号(weak/thrashing → decideNext，预算先赢，非等级)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
