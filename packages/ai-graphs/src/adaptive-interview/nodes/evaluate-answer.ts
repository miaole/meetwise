import {
  clarifyHint,
  classifyTurn,
  ingestAssessment,
  isNonAnswer,
  isSkip,
  markClarify,
  markUnresolved,
  withCurrent,
} from '@meetwise/domain';
import type { AdaptiveDeps, AdaptiveInterviewGraphState } from '../state.ts';

/** interrupt 后评分；失败安全终止为 unscored，成功后清掉 pending/submitted 再进入下一次 decide。 */
export function createEvaluateAnswerNode(deps: AdaptiveDeps) {
  return async (state: AdaptiveInterviewGraphState) => {
    const pending = state.pending;
    const submitted = state.submitted;
    if (!pending || !submitted || pending.questionId !== submitted.questionId) {
      return {
        pending: null,
        submitted: null,
        concluded: true,
        degraded: { reason: 'question_answer_identity_mismatch', turn: state.mind.turn },
      };
    }

    const { question, competency, turn } = pending;
    let answer: string;
    try {
      answer = await deps.loadAnswer({ answerId: submitted.answerId });
    } catch {
      return {
        pending: null,
        submitted: null,
        concluded: true,
        clarify: null,
        degraded: { reason: 'answer_artifact_unavailable', turn },
        transcript: [{
          questionId: pending.questionId,
          stateVersion: pending.stateVersion,
          q: question,
          competency,
          score: null,
          sources: pending.sources,
          critique: pending.critique,
          outcome: 'unscored' as const,
          relevant: false,
          kind: pending.kind,
          reason: 'answer_artifact_unavailable',
        }],
      };
    }
    const mind = withCurrent(state.mind, competency);
    const skipped = isSkip(answer);
    const deterministicNonAnswer = isNonAnswer(answer);
    // billing P1（BILL1-TOPIC-FIELDS 修法⑤）：assess 显式 cause 透传位（quote_repair_exhausted 源
    // =『quote_unverifiable』/剥离后非作答源=『non_answer』，均由 assess 返回；纯附加字段，
    // score/relevant/evidence/dispositions 既有值逐位不变）。图侧 deterministicNonAnswer 臂不经 assess，
    // 在合流点拆分时直派『non_answer』。
    let assessClarifyCause: 'non_answer' | 'quote_unverifiable' | undefined;
    let score = 0;
    let evidence: string[] = ['未正面作答(空答/跳过/套话)'];
    let relevant = false;
    let hasHook = false;
    let dispositions: import('@meetwise/domain').ScoredCriterionDisposition[] = [];

    if (!deterministicNonAnswer) {
      const assessment = await deps.assess(question, answer, competency, turn, {
        questionId: pending.questionId,
        stateVersion: pending.stateVersion,
        topicId: pending.topicId,   // billing P1 修法⑦：归集行 topic 维度随 identity 透传（additive 可选）。
      });
      if (assessment.status === 'unscored') {
        return {
          pending: null,
          submitted: null,
          concluded: true,
          clarify: null,
          degraded: { reason: assessment.reason, turn },
          transcript: [
            {
              questionId: pending.questionId,
              stateVersion: pending.stateVersion,
              q: question,
              competency,
              score: null,
              sources: pending.sources,
              critique: pending.critique,
              outcome: 'unscored' as const,
              relevant: false,
              kind: pending.kind,
              reason: assessment.reason,
            },
          ],
        };
      }
      score = assessment.score;
      evidence = assessment.evidence;
      relevant = assessment.relevant;
      hasHook = assessment.hasHook === true;
      // #52 v6：0103 契约档位证据（派生物，无答案原文）随 turn 透传（checkpoint 审计投影）。
      dispositions = assessment.dispositions ?? [];
      assessClarifyCause = assessment.clarifyCause;
    }

    const verdict = classifyTurn(mind, {
      skipped,
      nonAnswer: deterministicNonAnswer || relevant === false,
    });
    if (verdict === 'clarify') {
      const hint = clarifyHint(competency);
      // billing P1（BILL1-TOPIC-FIELDS 修法⑤）：两因在合流点（classifyTurn 的 nonAnswer 输入）拆分——
      // deterministicNonAnswer=true 直派『non_answer』；否则 assess 显式 cause（quote_repair_exhausted→
      // 『quote_unverifiable』/剥离后非作答→『non_answer』/模型判跑题无钉因→undefined）。随澄清指令
      // 流转至 pending（generate-question 拷贝）→ persist 落 interview_question.clarify_cause。
      const clarifyCause = deterministicNonAnswer
        ? ('non_answer' as const)
        : assessClarifyCause;
      return {
        mind: markClarify(mind),
        pending: null,
        submitted: null,
        clarify: {
          competency,
          question,
          hint,
          sources: pending.sources,
          critique: pending.critique,
          qkind: pending.kind,
          clarifyCause,
        },
        transcript: [
          {
            questionId: pending.questionId,
            stateVersion: pending.stateVersion,
            q: question,
            competency,
            score: 0,
            sources: pending.sources,
            critique: pending.critique,
            outcome: 'clarify' as const,
            relevant: false,
            kind: pending.kind,
            hint,
          },
        ],
      };
    }
    if (verdict === 'unresolved') {
      return {
        mind: markUnresolved(mind, competency),
        pending: null,
        submitted: null,
        clarify: null,
        transcript: [
          {
            questionId: pending.questionId,
            stateVersion: pending.stateVersion,
            q: question,
            competency,
            score: 0,
            sources: pending.sources,
            critique: pending.critique,
            outcome: 'unresolved' as const,
            relevant: false,
            kind: pending.kind,
          },
        ],
      };
    }
    return {
      mind: ingestAssessment(mind, competency, score, evidence, hasHook),
      pending: null,
      submitted: null,
      clarify: null,
      transcript: [
        {
          questionId: pending.questionId,
          stateVersion: pending.stateVersion,
          q: question,
          competency,
          score,
          sources: pending.sources,
          critique: pending.critique,
          outcome: 'answered' as const,
          relevant: true,
          kind: pending.kind,
          dispositions,
          // EVIDENCE-DELIVERY S1(C2)：模型判据(criterion 列表)直投影入 transcript（非用户原文；
          // quote 永不入投影）。clarify/unresolved/unscored 分支沿现状不写（键缺省）。
          evidence,
        },
      ],
    };
  };
}
