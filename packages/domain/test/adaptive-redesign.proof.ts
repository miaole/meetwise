/**
 * 旗舰自适应面试 MVP 重设计证明(纯逻辑、确定性、可 gate):专证审计裁剪后的 MVP 每一条新行为。
 *  A. hasHook 折进 confidence → 硬问题继续追问同一能力(多回合);hasHook=false+高分 → resolved 换题(不过钻)。
 *  B. core 能力追问上限 3 / 非 core 2。 C. warmup 难度从 2 起。 D. off-ramp:连续 2 次低分 → pivot + 降难度一档(反车轮战)。
 *  E. 题型(qkind)确定性规则:首问 grounded → 深追 fundamental/scenario 交替;行为槽恒 behavioral。 F. 全程 hasHook 仍在预算内终止(无黑洞)。
 *  G. toCompetencySpecs:top 1-2 标 core + 确定性附加 1 个行为槽。  pnpm adaptive-redesign:prove
 */
import { initMind, ingestAssessment, decideNext, withCurrent, markUnresolved, toCompetencySpecs, BEHAVIORAL_COMPETENCY, type InterviewMind, type NextAction } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const ask = (a: NextAction) => (a.kind === 'ask' ? a : null);

/* ───── C. warmup:难度从 2 起 ───── */
A('C 初始难度=2(warmup 暖场,不一上来最难)', initMind(['A']).difficulty === 2);

/* ───── A. hasHook 是"继续深挖硬问题"的唯一杠杆(零新分支) ───── */
{
  // hasHook=true + 高分 → confidence 被封顶(<0.7)→ decideNext 继续 probe 同一能力
  let m = withCurrent(initMind([{ name: 'A', core: true }, { name: 'B' }]), 'A');
  m = ingestAssessment(m, 'A', 92, ['提到读写分离的取舍'], true);
  const cA = m.competencies.find((c) => c.name === 'A')!;
  A('A hasHook=true:即便 92 分,confidence 被封顶 <0.7(算"还可深挖")', cA.confidence < 0.7);
  const a1 = ask(decideNext(m))!;
  A('A hasHook=true → 继续追问**同一能力**(probe,不换题)', a1.mode === 'probe' && a1.competency === 'A');

  // hasHook=false + 高分 → confidence 达标 → resolved → pivot 换题(不过度钻)
  let m2 = withCurrent(initMind([{ name: 'A', core: true }, { name: 'B' }]), 'A');
  m2 = ingestAssessment(m2, 'A', 92, ['讲透了'], false);
  const cA2 = m2.competencies.find((c) => c.name === 'A')!;
  A('A hasHook=false+高分 → confidence≥0.7(够强)', cA2.confidence >= 0.7);
  const a2 = ask(decideNext(m2))!;
  A('A hasHook=false+高分 → 换能力(pivot),且 A 只问 1 次(不过钻)', a2.mode === 'pivot' && a2.competency === 'B' && cA2.depthProbed === 1);
}

/* ───── B. core 能力追问上限 3 / 非 core 2(全程 hasHook 高分,confidence 永封顶 → 靠 depthProbed 终止) ───── */
function drillAllHook(spec: { name: string; core?: boolean }): { probes: number; mind: InterviewMind } {
  let m = withCurrent(initMind([spec], 16), spec.name); let probes = 0;
  for (let i = 0; i < 10; i++) {
    const a = ask(decideNext(m)); if (!a) break;                // conclude → 停
    probes++; m = withCurrent(m, a.competency);
    m = ingestAssessment(m, a.competency, 95, ['可深挖钩子'], true);   // 每轮都有钩子 + 高分
  }
  return { probes, mind: m };
}
A('B core 能力 → 恰好追问 3 次(硬问题多挖一轮)', drillAllHook({ name: 'C', core: true }).probes === 3);
A('B 非 core 能力 → 恰好追问 2 次', drillAllHook({ name: 'N', core: false }).probes === 2);
A('B 全程 hasHook 仍收敛终止(depthProbed 顶到 cap → all_resolved,非黑洞)', decideNext(drillAllHook({ name: 'C', core: true }).mind).kind === 'conclude');

/* ───── E. 题型 qkind 确定性规则:首问 grounded → 深追 fundamental/scenario 交替;行为槽 behavioral ───── */
{
  const kinds: string[] = []; let m = withCurrent(initMind([{ name: 'C', core: true }], 16), 'C');
  for (let i = 0; i < 4; i++) {
    const a = ask(decideNext(m)); if (!a) break;
    kinds.push(a.qkind); m = withCurrent(m, a.competency);
    m = ingestAssessment(m, a.competency, 95, ['钩子'], true);
  }
  A('E 题型序列(core,全 hasHook)= grounded→fundamental→scenario', JSON.stringify(kinds) === JSON.stringify(['grounded', 'fundamental', 'scenario']));

  const mb = withCurrent(initMind([{ name: BEHAVIORAL_COMPETENCY, behavioral: true }]), BEHAVIORAL_COMPETENCY);
  A('E 行为槽能力 → 题型恒 behavioral(与简历解耦)', ask(decideNext(mb))!.qkind === 'behavioral');
}

/* ───── D. off-ramp:连续 2 次低分 → 强制 pivot + 降难度一档(反车轮战) ───── */
{
  let m: InterviewMind = { ...initMind([{ name: 'A', core: true }, { name: 'B' }], 12), difficulty: 5 };
  m = withCurrent(m, 'A');
  m = ingestAssessment(m, 'A', 35, ['含糊1']);        // 第 1 次低分:难度 5→4(常规 -1),未 off-ramp
  const diffAfter1 = m.difficulty;
  A('D 单次低分:难度常规下调一档(5→4)', diffAfter1 === 4 && m.consecutiveLow === 1);
  const probeAgain = ask(decideNext(m))!;
  A('D 单次低分(未触发 off-ramp)→ 仍追问同一能力', probeAgain.mode === 'probe' && probeAgain.competency === 'A');
  m = withCurrent(m, 'A');
  m = ingestAssessment(m, 'A', 35, ['含糊2']);        // 第 2 次连续低分 → off-ramp
  const cA = m.competencies.find((c) => c.name === 'A')!;
  A('D off-ramp:难度比上一轮**额外**再降一档(4→2,共 -2)', m.difficulty === 2);
  A('D off-ramp:该能力被探尽(depthProbed=core cap 3)→ 不再追', cA.depthProbed === 3);
  const off = ask(decideNext(m))!;
  A('D off-ramp → 强制换能力(pivot 到 B,绝不把候选人逼到墙角)', off.mode === 'pivot' && off.competency === 'B');
  A('D off-ramp:consecutiveLow 清零(换能力后重新计)', m.consecutiveLow === 0);
}

/* ───── F. 全程 hasHook 高分(最易"无限深挖")也必在 maxTurns 内终止 ───── */
{
  let m = initMind(toCompetencySpecs(['并发', '缓存', '可靠性']), 8); let guard = 0;
  while (decideNext(m).kind === 'ask' && guard++ < 50) {
    const a = ask(decideNext(m))!; m = withCurrent(m, a.competency);
    m = ingestAssessment(m, a.competency, 99, ['钩子'], true);   // 每答都有钩子 + 满分(最不易收敛)
  }
  A('F 全程 hasHook+满分 → 仍在预算内终止(turn≤maxTurns,无预算黑洞)', decideNext(m).kind === 'conclude' && m.turn <= m.maxTurns && guard < 50);
}

/* ───── G. toCompetencySpecs:top 1-2 标 core + 确定性附加 1 个行为槽 ───── */
{
  const specs = toCompetencySpecs(['并发', '缓存', '数据库']);
  A('G top 1-2 标 core(并发/缓存 core,数据库非 core)', specs[0]?.core === true && specs[1]?.core === true && specs[2]?.core === false);
  A('G 确定性附加 1 个行为槽(behavioral=true,题型与简历解耦)', specs.some((s) => s.name === BEHAVIORAL_COMPETENCY && s.behavioral === true));
  // 重名防御:规划官恰好产出同名能力时,**提升**为行为槽(behavioral=true、非 core),绝不静默丢失保证维度(否则降级成技术题)
  const collide = toCompetencySpecs([BEHAVIORAL_COMPETENCY, '后端']);
  A('G 行为槽与规划能力重名 → 提升为行为槽(behavioral=true、core=false),不丢维度', collide.filter((s) => s.name === BEHAVIORAL_COMPETENCY).length === 1 && collide.some((s) => s.name === BEHAVIORAL_COMPETENCY && s.behavioral === true && s.core === false));
}

console.log(`\n${fail === 0 ? '✓ 自适应面试 MVP 重设计(hasHook 深挖 / core 追问上限 / warmup / off-ramp / 题型确定性 / 终止性)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
