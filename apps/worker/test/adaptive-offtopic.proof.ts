/**
 * 旗舰能力证明:**答非所问 / 没答** 的正确处置(确定性、可解释、可 gate)。
 * 跑真自适应图(buildAdaptiveInterviewGraph)+ MemorySaver + 可控 fake deps(无 DB);assess 的 relevant 由答案内容驱动。
 * 断言:(a) 非作答→clarify(重发**同一题**、难度不变、depthProbed 不增、非更深题);(b) 二次非作答/跳过→pivot 换能力(不循环、难度不升);
 *       (c) 好答→move on 下一能力(不过度追问);(d) 长篇跑题(模型 relevant=false)→当非作答处置(非弱答加深);(e) 整场必在预算内收尾。
 * pnpm adaptive-offtopic:prove
 */
import { MemorySaver, Command } from '@langchain/langgraph';
import { buildAdaptiveInterviewGraph, createEphemeralAnswerVault, type AdaptiveDeps, type SubmittedAnswerRef } from '@meetwise/ai-graphs';

let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const OFFTOPIC = '__OFFTOPIC__';
const answerVault = createEphemeralAnswerVault();
// No graph node is a command target during a resume.  Keeping `never` here
// prevents this test helper from widening `goto` to arbitrary strings, which
// would hide accidental routing to an undeclared node.
const resume = (answer: string) => new Command<Pick<SubmittedAnswerRef, 'answerId'>, Record<never, never>, never>({ resume: answerVault.issue(answer) });
// 题:能力+持久 turn+难度 编码进题面 → 可判"同一题/更深题/换能力"。clarify 复用原题(图不重出),故串相等=同一题。
function makeDeps(comps: string[], maxTurns = 12): AdaptiveDeps {
  return {
    competencies: comps, maxTurns,
    retrieveAndGenerate: async (competency, difficulty, _attempt, turn) => ({ question: `Q:${competency}:t${turn}:d${difficulty}`, sources: [] }),
    assess: async (_q, a, _comp) => a.includes(OFFTOPIC)
      ? { score: 0, evidence: ['答非所问(模型判跑题)'], relevant: false }   // 长篇但跑题:模型层判非作答
      : { score: 82, evidence: ['讲清了取舍'], relevant: true },             // 真实作答
    loadAnswer: answerVault.loadAnswer,
  };
}
const TID = (s: string) => ({ configurable: { thread_id: `${s}-${Date.now()}-${Math.random().toString(36).slice(2)}` } });
const pendingQ = (snap: any): string | undefined => snap.tasks?.[0]?.interrupts?.[0]?.value?.value?.question ?? snap.tasks?.[0]?.interrupts?.[0]?.value?.question;
const routeComp = (snap: any): string | undefined => snap.values?.route?.competency;
const compOf = (snap: any, name: string) => snap.values.mind.competencies.find((c: any) => c.name === name);
const lastTurn = (snap: any) => snap.values.transcript?.[snap.values.transcript.length - 1];

async function main() {
  /* ───── (a) 非作答 → clarify:重发同一题、难度不变、depthProbed 不增、非更深题 ───── */
  {
    const g = buildAdaptiveInterviewGraph(new MemorySaver(), makeDeps(['并发', '缓存', '可靠性']));
    const cfg = TID('a');
    await g.invoke({}, cfg);
    let snap = await g.getState(cfg);
    const q1 = pendingQ(snap)!; const comp1 = routeComp(snap)!; const diff0 = snap.values.mind.difficulty;
    A('(a) 开局出首题(有题、有所探能力、难度2 warmup)', !!q1 && !!comp1 && diff0 === 2);

    await g.invoke(resume('不知道'), cfg);   // 确定性非作答(套话)
    snap = await g.getState(cfg);
    const q2 = pendingQ(snap)!;
    A('(a) 非作答 → 重发**同一题**(非更深/换题)', q2 === q1);
    A('(a) 非作答 → 难度不变(未因"弱答"下调,也未升)', snap.values.mind.difficulty === diff0);
    A('(a) 非作答 → 该能力 depthProbed 不增(没被当一次有效追问)', compOf(snap, comp1).depthProbed === 0);
    A('(a) 非作答 → 该能力 confidence 仍为 0(没被并入弱分)', compOf(snap, comp1).confidence === 0);
    A('(a) 非作答 → 转写标 outcome=clarify + 携带引导语', lastTurn(snap).outcome === 'clarify' && typeof lastTurn(snap).hint === 'string' && lastTurn(snap).hint.length > 10);
    A('(a) clarify 完成态转写不复制原始回答', !Object.hasOwn(lastTurn(snap), 'a'));
    A('(a) clarifyAttempts=1(澄清已计数,不会无限澄清)', snap.values.mind.clarifyAttempts === 1);

    /* ───── (b) 二次非作答 → pivot 换能力(不循环、难度不升) ───── */
    await g.invoke(resume('还是不会'), cfg);
    snap = await g.getState(cfg);
    const comp2 = routeComp(snap)!;
    A('(b) 澄清后仍非作答 → 换一个能力(pivot,不死缠同题)', comp2 !== comp1);
    A('(b) pivot 后难度未被非作答抬升', snap.values.mind.difficulty <= diff0);
    A('(b) 原能力被标弱且探尽(depthProbed=非核心cap 2,confidence≤0.2 → 不会再追问)', compOf(snap, comp1).depthProbed === 2 && compOf(snap, comp1).confidence <= 0.2);
    A('(b) 新题确是另一能力的题(非原题复读)', (pendingQ(snap) ?? '').startsWith(`Q:${comp2}:`) && comp2 !== comp1);
  }

  /* ───── (c) 好答 → move on 下一能力(不过度追问) ───── */
  {
    const g = buildAdaptiveInterviewGraph(new MemorySaver(), makeDeps(['A', 'B', 'C']));
    const cfg = TID('c');
    await g.invoke({}, cfg);
    let snap = await g.getState(cfg); const first = routeComp(snap)!;
    await g.invoke(resume('我在项目里用读写分离+本地缓存抗住了峰值,权衡了一致性与延迟,最终选最终一致'), cfg);
    snap = await g.getState(cfg);
    A('(c) 好答(score≥阈) → 该能力只问 1 次(不过度追问)', compOf(snap, first).depthProbed === 1 && compOf(snap, first).confidence >= 0.7);
    const second = routeComp(snap);
    A('(c) 好答 → move on 到**另一**能力(或已收尾),绝不在同能力反复钻', snap.values.concluded === true || (second !== undefined && second !== first));
  }

  /* ───── (d) 长篇跑题(模型 relevant=false)→ 当非作答处置(非弱答加深) ───── */
  {
    const g = buildAdaptiveInterviewGraph(new MemorySaver(), makeDeps(['X', 'Y']));
    const cfg = TID('d');
    await g.invoke({}, cfg);
    let snap = await g.getState(cfg); const qd = pendingQ(snap)!; const cd = routeComp(snap)!; const dd = snap.values.mind.difficulty;
    // 长答案(远超 8 字、不含套话),但模型判 relevant=false
    await g.invoke(resume(`让我聊聊我的家乡和我最喜欢的电影以及周末爱做的事情,反正跟题目无关 ${OFFTOPIC} 巴拉巴拉一大段`), cfg);
    snap = await g.getState(cfg);
    A('(d) 长篇跑题(模型 relevant=false)→ 重发同一题 clarify(非当弱答加深)', pendingQ(snap) === qd && lastTurn(snap).outcome === 'clarify');
    A('(d) 跑题 clarify 转写不复制原始回答', !Object.hasOwn(lastTurn(snap), 'a'));
    A('(d) 长篇跑题 → 难度不变 + depthProbed 不增(没被当一次有效追问)', snap.values.mind.difficulty === dd && compOf(snap, cd).depthProbed === 0);
  }

  /* ───── 跳过即换题(显式 skip 不澄清、不 penalty-loop)───── */
  {
    const g = buildAdaptiveInterviewGraph(new MemorySaver(), makeDeps(['P', 'Q']));
    const cfg = TID('skip');
    await g.invoke({}, cfg);
    let snap = await g.getState(cfg); const cp = routeComp(snap)!; const dp = snap.values.mind.difficulty;
    await g.invoke(resume('跳过'), cfg);   // 显式跳过(首次即换题,不先澄清)
    snap = await g.getState(cfg);
    A('(skip) 显式跳过 → 直接换能力(不先澄清、不循环)', routeComp(snap) !== cp && lastTurn(snap).outcome === 'unresolved');
    A('(skip) unresolved 转写不复制原始回答', !Object.hasOwn(lastTurn(snap), 'a'));
    A('(skip) 跳过不抬难度(不罚不奖)', snap.values.mind.difficulty <= dp);
    A('(skip) 跳过未被当 answered 并入(relevant=false,outcome=unresolved)', lastTurn(snap).relevant === false);
  }

  /* ───── (e) 整场必在预算内收尾:全程非作答也不死循环 ───── */
  {
    const g = buildAdaptiveInterviewGraph(new MemorySaver(), makeDeps(['M', 'N', 'O'], 8));
    const cfg = TID('e');
    let res: any = await g.invoke({}, cfg); let guard = 0;
    while (res.__interrupt__ && guard++ < 40) res = await g.invoke(resume('不知道'), cfg);   // 每轮都非作答
    const snap = await g.getState(cfg);
    A('(e) 全程非作答仍收尾(不无限循环/不死等)', snap.values.concluded === true && (snap.next?.length ?? 0) === 0);
    A('(e) 收尾在预算内(guard 未触顶)', guard < 40);
  }

  console.log(`\n${fail === 0 ? '✓ 答非所问/没答 处置(非作答≠弱答:引导→重答→换题,绝不加深,确定可解释)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
