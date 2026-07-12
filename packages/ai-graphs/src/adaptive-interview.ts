/**
 * 自适应面试 agent 图（纯拓扑,把"脑子"接上"身体"）。换掉固定 ask-loop,跑真 agent 回合:
 *   plan(规划能力) → decide(策略决策) → [ask: CRAG检索+出题 → interrupt 等答 → 评估 → 更新能力模型]* → conclude(报告)
 * 决策用 domain 纯逻辑(decideNext/ingestAssessment);IO(CRAG 检索+出题 / 评估 / 报告)是注入 deps。
 * 与旧 mock-interview 的本质区别:**下一题由能力模型+策略动态决定(追问/换题/调难度/收尾),非 questions[i] 顺序**。
 */
import { StateGraph, Annotation, START, END, interrupt } from '@langchain/langgraph';
import {
  initMind, decideNext, ingestAssessment, withCurrent, critiqueQuestion,
  isSkip, isNonAnswer, classifyTurn, markClarify, markUnresolved, clarifyHint,
  type InterviewMind, type CompetencySpec, type QuestionKind,
} from '@meetwise/domain';

/** 一轮转写。outcome 区分:answered(真实作答,已并入能力模型)/ clarify(非作答,已引导重答同题)/ unresolved(探尽未决,换题)。
 *  relevant=该答是否正面回应本题(确定性层 ∨ 模型层)。hint 仅 clarify 轮携带引导语。kind=本题题型。 */
export interface Turn { q: string; a: string; competency: string; score: number; sources: string[]; critique: string[]; outcome: 'answered' | 'clarify' | 'unresolved'; relevant: boolean; kind: QuestionKind; hint?: string }
/** 待澄清指令(持久进图状态):非作答后挂起,decide 据此重发**同一题**(同能力、难度不变),不另判追问/换题。 */
export interface ClarifyDirective { competency: string; question: string; hint: string; sources: string[]; critique: string[]; qkind: QuestionKind }
export interface AdaptiveDeps {
  competencies: (string | CompetencySpec)[];   // 目标能力(来自岗位匹配 + 简历);CompetencySpec 携带 core/behavioral
  resumeFacts?: string[];   // 简历事实:出题个性化用(durable 进图状态,resume 后仍在)
  maxTurns?: number;
  competencyKeywords?: Record<string, string[]>;   // 反思跑题判定用
  /** CRAG 检索 + 出题。kind=题型(grounded 接简历 / fundamental 通用原理 / scenario 开放场景 / behavioral 软技能)。facts=简历事实;turn=持久轮次(幂等键);attempt 供反思重生成。 */
  retrieveAndGenerate: (competency: string, difficulty: number, attempt: number, turn: number, facts: string[], kind: QuestionKind) => Promise<{ question: string; sources: string[] }>;
  /** 评估 + **是否正面回应本题(relevant)** + **hasHook(有无可深挖钩子)**:跑题/答非所问 → relevant=false(score 0);hasHook=true → 同能力多挖一轮。 */
  assess: (question: string, answer: string, competency: string, turn: number) => Promise<{ score: number; evidence: string[]; relevant: boolean; hasHook?: boolean }>;
  // 注:报告**不在图内出**——走舱壁 report-worker(失败隔离、不连累面试、可重试)。conclude 只 finalize。
}

const State = Annotation.Root({
  mind: Annotation<InterviewMind>({ reducer: (_, b) => b, default: () => initMind([]) }),
  facts: Annotation<string[]>({ reducer: (_, b) => b, default: () => [] }),   // 简历事实(plan 时存,durable,resume 后仍在)
  transcript: Annotation<Turn[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  route: Annotation<{ competency: string; difficulty: number; qkind: QuestionKind } | 'conclude' | null>({ reducer: (_, b) => b, default: () => null }),
  clarify: Annotation<ClarifyDirective | null>({ reducer: (_, b) => b, default: () => null }),   // 非 null = 下一 ask 是澄清重答
  concluded: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
});

export function buildAdaptiveInterviewGraph(checkpointer: any, deps: AdaptiveDeps) {
  const plan = () => ({ mind: initMind(deps.competencies, deps.maxTurns ?? 8), facts: deps.resumeFacts ?? [] });

  const decide = (s: typeof State.State) => {
    // 待澄清:不进 decideNext(不另判追问/换题),原地重发同一题(同能力,难度不变,题型沿用)。
    // 但**预算硬闸照样生效**:clarify 已烧过一轮 turn,若已到 maxTurns 则收尾,绝不让澄清绕过总轮上限(终止不变式)。
    if (s.clarify) return s.mind.turn >= s.mind.maxTurns
      ? { route: 'conclude' as const }
      : { route: { competency: s.clarify.competency, difficulty: s.mind.difficulty, qkind: s.clarify.qkind } };
    const a = decideNext(s.mind);
    return { route: a.kind === 'conclude' ? ('conclude' as const) : { competency: a.competency, difficulty: a.difficulty, qkind: a.qkind } };
  };

  const ask = async (s: typeof State.State) => {
    const r = s.route as { competency: string; difficulty: number; qkind: QuestionKind };
    const turn = s.mind.turn;            // 持久轮次:幂等键用(跨进程 resume 不碰撞;clarify 也烧 turn → 键不碰撞)
    const clarifying = s.clarify;        // 非 null = 重发同一题(不重新出题,直接复用)
    let question: string, sources: string[], critiqueIssues: string[], hint: string | undefined;
    if (clarifying) {
      ({ question, sources } = clarifying); critiqueIssues = clarifying.critique; hint = clarifying.hint;
    } else {
      const asked = s.transcript.map((t) => t.q);
      // 出题 + **反思自检**:坏题(太短/重复/诱导/跑题)挡下重生成,有界(≤2 次重生成),防坏题问到候选人。题型 r.qkind 由确定性策略定。
      let gen = await deps.retrieveAndGenerate(r.competency, r.difficulty, 0, turn, s.facts, r.qkind);
      let critique = critiqueQuestion(gen.question, r.competency, asked, deps.competencyKeywords ?? {});
      for (let attempt = 1; attempt < 3 && !critique.ok; attempt++) {
        gen = await deps.retrieveAndGenerate(r.competency, r.difficulty, attempt, turn, s.facts, r.qkind);
        critique = critiqueQuestion(gen.question, r.competency, asked, deps.competencyKeywords ?? {});
      }
      question = gen.question; sources = gen.sources; critiqueIssues = critique.issues;
    }
    const mind1 = withCurrent(s.mind, r.competency);
    const answer = String(interrupt({ question, competency: r.competency, kind: r.qkind, hint }));  // 持久化等待用户(澄清轮带 hint;题型随事件外发)

    // 感知第一层(确定性,免模型):空/跳过/过短/套话 = 非作答。命中则**不打模型**(省钱省时,且天然不会被当弱答)。
    const skipped = isSkip(answer);
    const detNonAnswer = isNonAnswer(answer);
    // 感知第二层(模型):仅在确定性未判非作答时才评估;模型还判 relevant(长篇跑题=答非所问)+ hasHook(可深挖钩子)。
    let score = 0, evidence: string[] = ['未正面作答(空答/跳过/套话)'], relevant = false, hasHook = false;
    if (!detNonAnswer) {
      const a = await deps.assess(question, answer, r.competency, turn);
      score = a.score; evidence = a.evidence; relevant = a.relevant; hasHook = a.hasHook === true;
    }
    const nonAnswer = detNonAnswer || relevant === false;                                         // 确定性 ∨ 模型显式判跑题 → 非作答(relevant 缺省/undefined=按 on-topic,对齐 EvalSchema default(true),不误触澄清环)
    const verdict = classifyTurn(mind1, { skipped, nonAnswer });                                  // 承重纯决策(clarify/unresolved/ingest)。**hasHook/off-ramp 只在 ingest(真实作答)后生效,绝不让模型驱动澄清环**

    if (verdict === 'clarify') {
      // 非作答且还可澄清:**不评分入模型、不加深、不调难度**,重发同题 + 引导。
      const hintText = clarifyHint(r.competency);
      return {
        mind: markClarify(mind1),
        clarify: { competency: r.competency, question, hint: hintText, sources, critique: critiqueIssues, qkind: r.qkind },
        transcript: [{ q: question, a: answer, competency: r.competency, score: 0, sources, critique: critiqueIssues, outcome: 'clarify' as const, relevant: false, kind: r.qkind, hint: hintText }],
      };
    }
    if (verdict === 'unresolved') {
      // 已澄清仍非作答 / 主动跳过:标弱、探尽(不再追)、难度不变,换题 pivot。
      return {
        mind: markUnresolved(mind1, r.competency), clarify: null,
        transcript: [{ q: question, a: answer, competency: r.competency, score: 0, sources, critique: critiqueIssues, outcome: 'unresolved' as const, relevant: false, kind: r.qkind }],
      };
    }
    // 真实作答(好/弱皆 valid)→ 正常并入能力模型(只有这里会调难度/加深;hasHook 折进 confidence → 既有 probe 路径多挖一轮)。
    const mind2 = ingestAssessment(mind1, r.competency, score, evidence, hasHook);
    return { mind: mind2, clarify: null, transcript: [{ q: question, a: answer, competency: r.competency, score, sources, critique: critiqueIssues, outcome: 'answered' as const, relevant: true, kind: r.qkind }] };
  };

  const conclude = () => ({ concluded: true });   // 只 finalize;报告由舱壁 report-worker 异步出(失败隔离)

  return new StateGraph(State)
    .addNode('plan', plan).addNode('decide', decide).addNode('ask', ask).addNode('conclude', conclude)
    .addEdge(START, 'plan').addEdge('plan', 'decide')
    .addConditionalEdges('decide', (s) => (s.route === 'conclude' ? 'conclude' : 'ask'), { ask: 'ask', conclude: 'conclude' })
    .addEdge('ask', 'decide')               // 答完回到决策(动态下一步,非固定顺序)
    .addEdge('conclude', END)
    .compile({ checkpointer });
}
