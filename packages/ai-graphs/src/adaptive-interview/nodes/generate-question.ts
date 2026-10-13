import {
  critiqueQuestion,
  isQuestionGenerationFailure,
  normalizeQuestionGenerationResult,
  QUESTION_GENERATION_REROLL_FAMILY,
  type CompetencySpec,
  type QuestionGenerationProvenance,
  type QuestionKind,
} from '@meetwise/domain';
import type { AdaptiveDeps, AdaptiveInterviewGraphState } from '../state.ts';

function issueQuestionId(stateVersion: number, turn: number, clarifyAttempts: number): string {
  return `q-v${stateVersion}-t${turn}-c${clarifyAttempts}`;
}

/**
 * AG-F(刀F·裁决②a·可调):连续 competency 耗尽帽——顺延换序至多 2 次（=第 3 个连续耗尽的
 * competency 到达即真终场）,防模型持续劣化面无界循环放大（EXPERT §七 :65「耗尽换 competency
 * 不终场」+裁决②a「连续耗尽帽(如 2)」原文）。全序耗尽/族外失败不受本帽影响（原 failClosed）。
 */
const MAX_COMPETENCY_EXHAUST_SWITCH = 2;

/** planner 序下一 competency(deps.competencies 声明序顺延;末位/缺席=无序可换 → 真终场)。 */
function nextCompetencyAfter(sequence: readonly (string | CompetencySpec)[], current: string): string | null {
  const names = sequence.map((c) => (typeof c === 'string' ? c : c.name));
  const idx = names.indexOf(current);
  if (idx < 0 || idx + 1 >= names.length) return null;
  return names[idx + 1] ?? null;
}

function failClosed(
  state: AdaptiveInterviewGraphState,
  provenance: QuestionGenerationProvenance,
  reason: string,
) {
  return {
    stateVersion: state.stateVersion + 1,
    pending: null,
    concluded: true,
    degraded: { reason, turn: state.mind.turn },
    generationProvenance: provenance,
  };
}

/** 只生成/反思并 checkpoint pending question；失败不发明题面，resume 也不会重调模型。 */
export function createGenerateQuestionNode(deps: AdaptiveDeps) {
  return async (state: AdaptiveInterviewGraphState) => {
    const route = state.route as {
      competency: string; difficulty: number; qkind: QuestionKind;
      mode?: 'pivot' | 'probe' | 'clarify';
    };
    // C14(RESUME-GROUNDING):facts 输入仅在 worker deps 闭包内经 `<data-nonce>` 围栏直达模型 seam
    // (buildAdaptiveDeps.retrieveAndGenerate 渲染进 interviewer.ask 的 <data>),禁入图
    // state/checkpoint/interrupt/SSE/episode。节点结果/question 会被 checkpoint 并重放——因此图拓扑
    // 从 deps.resumeFacts 只派生授权位(下方 grounded→fundamental 降级判定),facts 形参恒传空数组;
    // 模型产出的 grounded 题面属派生内容可持久化,其擦除残差登记 Non-claims 归 #183/#153 PRIVACY-FACE。
    const resumeProfileAvailable = deps.resumeProfileAvailable === true
      || (deps.resumeFacts ?? []).some((fact) => fact.trim());
    // `grounded` means a candidate-specific claim is safe only when there is at
    // least one authorized parsed resume fact.  An empty profile is not permission for a
    // model to imagine a project; make the routing decision explicit before any
    // model dependency can see the request.
    const effectiveKind: QuestionKind = route.qkind === 'grounded' && !resumeProfileAvailable
      ? 'fundamental'
      : route.qkind;
    const turn = state.mind.turn;
    const clarifying = state.clarify;
    let question: string;
    let sources: string[];
    let critiqueIssues: string[];
    let hint: string | undefined;
    let provenance: QuestionGenerationProvenance = state.generationProvenance ?? { origin: 'model' };
    // AG-37(检索 weighted-deficit 归零·修法③·裁决③a 写位=genQuestion 返回即写):本题 rag.retrieve
    // 更新后的 deficit（seam 出参回流）。clarify 分支零 seam 调用 → 恒 undefined=不写（通道原值经
    // checkpoint 原样继承·现状字节）;失败臂（耗尽换序/failClosed）亦不写（state 位保持上一题值）。
    let weightedDeficitOut: number[] | null | undefined;

    if (clarifying) {
      ({ question, sources } = clarifying);
      critiqueIssues = clarifying.critique;
      hint = clarifying.hint;
    } else {
      const asked = state.transcript.map((entry) => entry.q);
      // C14(RESUME-GROUNDING):graph 侧 facts 形参恒空——选定事实(2-4 条)由 worker deps 闭包
      // (buildAdaptiveDeps)直接渲染进模型请求的 <data-nonce> 围栏,不经本节点参数/state。
      // grounded 题面可引用事实所指经历,但 refs 须为事实原文子串且过 worker 侧组合闸
      // (refsGroundedInFacts,不过则丢弃重试/回退固定模板);fact 子串 refs 仅作闸料,禁入 sources。
      // AG-37(修法③·裁决②a):第 8 additive 参=图 state 位 `weightedDeficit` 持久化值（上一题写下的
      // DRR deficit·旧 checkpoint 缺省 null=worker 闭包全 0 起跑现状字节）——下一题读上一题值,不再归零。
      const generated = normalizeQuestionGenerationResult(
        await deps.retrieveAndGenerate(route.competency, route.difficulty, 0, turn, [], effectiveKind, asked, state.weightedDeficit ?? null),
      );
      if (isQuestionGenerationFailure(generated)) {
        // AG-F(刀F·修法②/裁决②a):族内确定性失败（seam 有界 re-roll 预算已耗尽后才到达本节点）
        // → 不 failClosed 整场——顺延 planner 序下一 competency 重新出题（换序轨迹落 degraded/
        // generationProvenance 可审计）;concluded 禁置（Ban 列表:只在真终场置位）。连续耗尽帽内
        // 才换序;帽满/族外失败（timeout/not_configured/duplicate_question/attempt_replay 等）/无序
        // 可换 → 既有 failClosed 原样（全序耗尽才真终场,assessment_unavailable 形状字节不变）。
        const exhaustedBefore = state.competencyExhaustions ?? 0;
        if (QUESTION_GENERATION_REROLL_FAMILY.includes(generated.error) && exhaustedBefore < MAX_COMPETENCY_EXHAUST_SWITCH) {
          const nextCompetency = nextCompetencyAfter(deps.competencies, route.competency);
          if (nextCompetency) {
            return {
              stateVersion: state.stateVersion + 1,
              route: { competency: nextCompetency, difficulty: route.difficulty, qkind: effectiveKind },
              pending: null,
              degraded: { reason: 'question_competency_exhausted', turn },
              generationProvenance: generated.provenance,
              competencyExhaustions: exhaustedBefore + 1,
            };
          }
        }
        return failClosed(state, generated.provenance, `generation_${generated.error}`);
      }
      const critique = critiqueQuestion(generated.question, route.competency, asked, deps.competencyKeywords ?? {});
      // A critique miss used to invent a same-competency shell and emit it as
      // question_ready.  That silently fabricates interview content after a
      // provider or quality failure.  Fail-closed: no pending, no invented stem.
      if (!critique.ok) {
        return failClosed(state, {
          origin: 'unavailable',
          errorCode: 'business_invalid',
          invokeError: 'question_critique_failed',
          operationId: generated.provenance.operationId,
          idempotencyKey: generated.provenance.idempotencyKey,
        }, 'generation_business_invalid');
      }
      question = generated.question;
      sources = generated.sources;
      critiqueIssues = critique.issues;
      provenance = generated.provenance;
      // AG-37(修法③):deficit 出参只取成功形（undefined=旧 scripted deps/无 holder→键缺席不写）。
      weightedDeficitOut = generated.weightedDeficit;
    }

    const stateVersion = state.stateVersion + 1;
    // billing P1（BILL1-TOPIC-FIELDS 修法④）：topic_id 派生（纯标识符·蓝本 §6.1 语义）——
    // pivot 主问题 topic_id=新发 questionId 自己；probe 追问/clarify 澄清重发=继承主问题 id
    // （state.topicMainQuestionId，本节点 pivot 发射时写自己、probe/clarify 原样保留）。
    // 旧 checkpoint（route.mode 缺省/主 id 尚未落位）→ topic 字段缺省 undefined，持久化层写
    // NULL=不按话题计费（旧行为空语义保留，零回填零发明）。
    const newQuestionId = issueQuestionId(stateVersion, turn, state.mind.clarifyAttempts);
    const askMode = clarifying ? ('clarify' as const) : route.mode;
    const topicId = askMode === undefined
      ? undefined
      : askMode === 'pivot'
        ? newQuestionId
        : (state.topicMainQuestionId ?? undefined);
    return {
      stateVersion,
      pending: {
        questionId: newQuestionId,
        stateVersion,
        turn,
        question,
        competency: route.competency,
        difficulty: route.difficulty,
        kind: effectiveKind,
        sources,
        critique: critiqueIssues,
        hint,
        askMode,
        topicId,
        clarifyCause: clarifying?.clarifyCause,
        // #256 形制 A：decide 节点已经 rememberDecision 写回 mind（maxTurns=nextSoft，含 raise 后现值，
        // domain adaptive-interview.ts rememberDecision/:400-404 raise 臂）——此处直读即发射时点软预算约数。
        plannedTurns: state.mind.maxTurns,
      },
      // pivot=话题起点（主问题 id 落位）；probe/clarify 继承现值；旧 checkpoint 缺省维持 null。
      topicMainQuestionId: askMode === 'pivot' ? newQuestionId : (state.topicMainQuestionId ?? null),
      generationProvenance: provenance,
      degraded: null,
      // AG-F(刀F):出题成功 → 连续耗尽计数归零（裁决②a「连续」语义只跨失败链存活）。
      competencyExhaustions: 0,
      // AG-37(修法③·裁决③a):deficit 写位=genQuestion 返回即写（rag.retrieve 一出·更新值当场落
      // checkpoint·间隙最小）。键条件缺席=旧 scripted deps/clarify/非检索成功臂不写——通道经 checkpoint
      // 原值保留（reducer (_,b)=>b 只在键在场时生效·沿 topicMainQuestionId 「继承不写」同形语义）。
      ...(weightedDeficitOut !== undefined ? { weightedDeficit: weightedDeficitOut } : {}),
    };
  };
}
