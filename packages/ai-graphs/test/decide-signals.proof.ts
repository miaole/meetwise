/** 图 decide hook：concludeReason 透传控制信号；预算先赢、信号不抬 maxTurns。pnpm adaptive-signals-graph:prove */
import { MemorySaver, Command } from '@langchain/langgraph';
import { decideNext, initMind, ingestAssessment, withCurrent } from '@meetwise/domain';
import { buildAdaptiveInterviewGraph, createEphemeralAnswerVault } from '../src/index.ts';
import { decideNode } from '../src/adaptive-interview/nodes/decide.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

function weakMind() {
  let m = initMind([{ name: '并发' }, { name: '缓存' }, { name: '可靠性' }], 16);
  for (const name of ['并发', '缓存']) {
    m = withCurrent(m, name);
    m = ingestAssessment(m, name, 30, ['弱']);
    m = ingestAssessment(m, name, 25, ['仍弱']);
  }
  return m;
}

{
  const mind = weakMind();
  A('域侧已是 early_weak（图 hook 的前置）', decideNext(mind).kind === 'conclude' && decideNext(mind).reason === 'early_weak');
  const out = decideNode({ mind, clarify: null } as any);
  A('图 decide：weak → route=conclude 且 concludeReason=early_weak',
    out.route === 'conclude' && out.concludeReason === 'early_weak');
}

{
  let m = initMind([{ name: 'A', core: true }, { name: 'B' }], 16);
  for (const [name, s] of [['A', 90], ['B', 25], ['A', 88], ['B', 22]] as const) {
    m = withCurrent(m, name);
    m = ingestAssessment(m, name, s, ['翻'], true);
  }
  const out = decideNode({ mind: m, clarify: null } as any);
  A('图 decide：thrashing → concludeReason=early_thrashing',
    out.route === 'conclude' && out.concludeReason === 'early_thrashing');
}

{
  const mind = { ...weakMind(), turn: 8, maxTurns: 8 };
  const out = decideNode({ mind, clarify: null } as any);
  A('图 decide：预算覆盖信号 → concludeReason=budget_exhausted',
    out.route === 'conclude' && out.concludeReason === 'budget_exhausted');
}

{
  const clarify = { competency: '并发', question: 'Q', hint: 'h', sources: [], critique: [], qkind: 'grounded' as const };
  const out = decideNode({ mind: initMind(['并发'], 8), clarify } as any);
  A('图 decide：clarify 续问时 concludeReason=null（不伪造成 early_*）',
    out.route && typeof out.route === 'object' && out.concludeReason === null);
}

{
  const mind = weakMind();
  A('前置: 无 clarify 时域侧已是 early_weak',
    decideNext(mind).kind === 'conclude' && decideNext(mind).reason === 'early_weak');
  const clarify = { competency: '并发', question: 'Q', hint: 'h', sources: [], critique: [], qkind: 'grounded' as const };
  const out = decideNode({ mind, clarify } as any);
  A('图 decide：已满足 weak 的 mind + clarify 仍续问，concludeReason=null（不消费信号）',
    out.route && typeof out.route === 'object' && (out.route as { competency: string }).competency === '并发'
    && out.concludeReason === null);
}

async function hardMax() {
  const vault = createEphemeralAnswerVault();
  const g = buildAdaptiveInterviewGraph(new MemorySaver(), {
    competencies: ['容量'], maxTurns: 999,
    retrieveAndGenerate: async () => ({ question: '容量题', sources: [] }),
    assess: async () => ({ score: 88, evidence: ['ok'], relevant: true }),
    loadAnswer: vault.loadAnswer,
  });
  const res: any = await g.invoke({}, { configurable: { thread_id: 'signal-hard-max' } });
  A('信号不抬预算：外部 maxTurns=999 仍被 plan 钳成有限值（本树现实现为 8；数值属时长策略，非 SIGNAL-01 产品硬顶）',
    res.mind.maxTurns >= 1 && res.mind.maxTurns < 999 && res.mind.maxTurns === 8);
}

async function concludeReasonPersists() {
  const vault = createEphemeralAnswerVault();
  let n = 0;
  const g = buildAdaptiveInterviewGraph(new MemorySaver(), {
    competencies: [{ name: '并发' }, { name: '缓存' }, { name: '可靠性' }], maxTurns: 8,
    retrieveAndGenerate: async (competency) => ({ question: `Q:${competency}`, sources: [] }),
    assess: async () => { n++; return { score: 30, evidence: ['弱'], relevant: true }; },
    loadAnswer: vault.loadAnswer,
  });
  const cfg = { configurable: { thread_id: 'signal-early-weak' } };
  let res: any = await g.invoke({}, cfg);
  let guard = 0;
  while (res.__interrupt__ && guard++ < 20) {
    res = await g.invoke(new Command({ resume: vault.issue('我在项目里做了限流但讲不清取舍和回滚') }), cfg);
  }
  A('装配图：持续弱答在预算内提前收尾且 concludeReason=early_weak',
    res.concluded === true && res.concludeReason === 'early_weak' && res.mind.turn < res.mind.maxTurns && n >= 4);
}

async function main() {
  await hardMax();
  await concludeReasonPersists();
  console.log(`\n${fail === 0 ? '✓ 图 decide 控制信号 hook（concludeReason；预算先赢）全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
