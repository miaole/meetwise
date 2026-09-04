/**
 * Web 侧评分展示闸，与 `@meetwise/domain` `scoring-honesty` 合同对齐（不引入 domain 包）。
 * answer_evaluated.score 只可当 practice hint，且必须绑 canonical question identity。
 * 缺身份、弱绑定、字段漂移 → 不展示分数（不是 0）。B 端分不在本层产生。
 */

export const WEB_QUESTION_ID_RE = /^q-v(\d+)-t(\d+)-c(\d+)$/;
const WEB_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WEB_ANSWER_HASH_RE = /^[a-f0-9]{64}$/;

export type WebQuestionIdentity = { questionId: string; stateVersion: number; turn: number };

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function webTrustedQuestionIdentity(payload: unknown): WebQuestionIdentity | undefined {
  const p = payload as { questionId?: unknown; stateVersion?: unknown; turn?: unknown } | null;
  if (typeof p?.questionId !== 'string' || !isNonNegativeInt(p.stateVersion) || !isNonNegativeInt(p.turn)) return undefined;
  const match = WEB_QUESTION_ID_RE.exec(p.questionId);
  if (!match) return undefined;
  if (Number(match[1]) !== p.stateVersion || Number(match[2]) !== p.turn) return undefined;
  return { questionId: p.questionId, stateVersion: p.stateVersion, turn: p.turn };
}

export function sameWebQuestionIdentity(left: WebQuestionIdentity, right: WebQuestionIdentity): boolean {
  return left.questionId === right.questionId && left.stateVersion === right.stateVersion && left.turn === right.turn;
}

/** Practice-hint score for display. Missing/forged identity or non-integer score → undefined (not 0).
 *  Aligns with domain `practiceHintFromEvaluated`: question identity + answer claim. */
export function practiceHintScore(
  payload: {
    score?: unknown; questionId?: unknown; stateVersion?: unknown; turn?: unknown;
    answerId?: unknown; answerHash?: unknown; competency?: unknown;
  },
  issued?: WebQuestionIdentity,
): number | undefined {
  const identity = webTrustedQuestionIdentity(payload);
  if (!identity) return undefined;
  if (issued && !sameWebQuestionIdentity(identity, issued)) return undefined;
  if (typeof payload.answerId !== 'string' || !WEB_UUID_RE.test(payload.answerId)) return undefined;
  if (typeof payload.answerHash !== 'string' || !WEB_ANSWER_HASH_RE.test(payload.answerHash)) return undefined;
  if (typeof payload.competency !== 'string' || payload.competency.length === 0) return undefined;
  const score = payload.score;
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 100) return undefined;
  return score;
}
