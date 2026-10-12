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
    let score = 0;
    let evidence: string[] = ['未正面作答(空答/跳过/套话)'];
    let relevant = false;
    let hasHook = false;
    let dispositions: import('@meetwise/domain').ScoredCriterionDisposition[] = [];

    if (!deterministicNonAnswer) {
      const assessment = await deps.assess(question, answer, competency, turn, {
        questionId: pending.questionId,
        stateVersion: pending.stateVersion,
      });
      if (assessment.status === 'unscored') {
        // AG-F(刀F·修法③/裁决③(a)·沿计费裁决「该话题 0 分其余照计」家族先例·可调):
        // 单点评分模型失败不再作废整场——本题落 unscored 轨迹**按 0 计**（score:null→0·outcome
        // 'unscored' 与 reason 原样保留·relevant=false）,**不 ingest 该题证据**（mind 只推进
        // current 指针,能力画像零新增证据）,concluded 禁置（Ban:只在真终场置位）→ 条件边回
        // decide 继续后续 competency/turn。**不 re-invoke 评分模型**（§3-6 零触 invokeEvaluationOnce
        // 键面）;账本计费零字节（该题计分归 0 系图内后果·非账本操作）。答案工件缺失臂（:29-51
        // answer_artifact_unavailable·非模型失败）零触维持原判。degraded 不置位:unscored 轨迹
        // 随 transcript 审计投影,避免陈旧 reason 污染后续 conclude 面。
        return {
          mind,
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
    }

    const verdict = classifyTurn(mind, {
      skipped,
      nonAnswer: deterministicNonAnswer || relevant === false,
    });
    if (verdict === 'clarify') {
      const hint = clarifyHint(competency);
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
