/**
 * @meetwise/domain · SCOR-00 消费面诚实闸（纯域，零 IO、零模型、零 db）。
 *
 * 对齐面试出处规则：只信服务端发放的 question/answer identity；AI 事件分只可当
 * practice_hint；证据不足必须 assessment_unavailable / overall=null，不得伪造 0/50/68，
 * 也不得把 event/report 分映射成 B 端 overall / 排名。
 *
 * 本闸不替代 ScoreCard 写路径（SCOR-01…08），也不改变 worker 完成判定计数。
 */
import { isScoreCardScorable, type ScoreCardStatus } from './scoring-fact-root.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/** Canonical server-issued questionId: q-v{stateVersion}-t{turn}-c{clarifyAttempts}. */
export const TRUSTED_QUESTION_ID_RE = /^q-v(\d+)-t(\d+)-c(\d+)$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ANSWER_HASH_RE = /^[a-f0-9]{64}$/;

export type TrustedQuestionIdentity = { questionId: string; stateVersion: number; turn: number };

export type LedgerScoreIdentity = TrustedQuestionIdentity & {
  answerId: string;
  answerHash: string;
  competency: string;
};

export type PracticeHint = LedgerScoreIdentity & {
  value: number;
  source: 'answer_evaluated';
  role: 'practice_hint';
};

export type InsufficientEvidenceVerdict = {
  status: 'assessment_unavailable';
  reason: 'insufficient_evidence';
  overall: null;
  trustedBSideScore: null;
};

export type MappedScoreSource =
  | 'practice_hint'
  | 'answer_evaluated'
  | 'progress'
  | 'report_ready'
  | 'question_ready'
  | 'event_average';

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** Issued-question identity only. Weak ids (q-ready) and version/turn drift are forged. */
export function trustedQuestionIdentity(payload: unknown): TrustedQuestionIdentity {
  const p = payload as { questionId?: unknown; stateVersion?: unknown; turn?: unknown } | null;
  if (typeof p?.questionId !== 'string' || !isNonNegativeInt(p.stateVersion) || !isNonNegativeInt(p.turn)) {
    fail('score_question_identity_missing');
  }
  const match = TRUSTED_QUESTION_ID_RE.exec(p.questionId);
  if (!match) fail('score_question_identity_forged');
  if (Number(match[1]) !== p.stateVersion || Number(match[2]) !== p.turn) {
    fail('score_question_identity_forged');
  }
  return { questionId: p.questionId, stateVersion: p.stateVersion, turn: p.turn };
}

export function sameQuestionIdentity(left: TrustedQuestionIdentity, right: TrustedQuestionIdentity): boolean {
  return left.questionId === right.questionId
    && left.stateVersion === right.stateVersion
    && left.turn === right.turn;
}

/**
 * Ledger-bound answer identity: the worker claimed this answer to a server-issued question.
 * Does not read payload.score — event numbers are never the score authority.
 */
export function isTrustedScoreIdentity(payload: unknown): payload is LedgerScoreIdentity {
  try {
    trustedScoreIdentity(payload);
    return true;
  } catch {
    return false;
  }
}

export function trustedScoreIdentity(payload: unknown): LedgerScoreIdentity {
  const question = trustedQuestionIdentity(payload);
  const p = payload as { answerId?: unknown; answerHash?: unknown; competency?: unknown };
  if (typeof p.answerId !== 'string' || !UUID_RE.test(p.answerId)) fail('score_answer_identity_missing');
  if (typeof p.answerHash !== 'string' || !ANSWER_HASH_RE.test(p.answerHash)) fail('score_answer_identity_missing');
  if (typeof p.competency !== 'string' || p.competency.length === 0) fail('score_answer_identity_missing');
  return { ...question, answerId: p.answerId, answerHash: p.answerHash, competency: p.competency };
}

/** Integer 0..100 only. Missing / NaN / out of range are not scores. */
export function finiteScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 100) {
    fail('score_value_invalid');
  }
  return value;
}

/**
 * answer_evaluated.score is a C-end practice hint only, and only when bound to
 * a trusted question+answer identity. Never a B-side overall / rank.
 */
export function practiceHintFromEvaluated(payload: unknown): PracticeHint {
  const identity = trustedScoreIdentity(payload);
  const value = finiteScore((payload as { score?: unknown }).score);
  return { ...identity, value, source: 'answer_evaluated', role: 'practice_hint' };
}

/** Attach a practice hint only to the matching issued identity. Mismatch = forged mapping. */
export function mapPracticeHintToIdentity(
  hint: PracticeHint,
  issued: TrustedQuestionIdentity,
): PracticeHint {
  if (hint.role !== 'practice_hint' || hint.source !== 'answer_evaluated') fail('forged_mapped_score');
  if (!sameQuestionIdentity(hint, issued)) fail('forged_mapped_score');
  return hint;
}

/**
 * Interview / event / report numbers never become a B-side score.
 * The only helper that would mint one always fails.
 */
export function refuseMappedBSideScore(source: { from: MappedScoreSource; value?: unknown }): never {
  fail(`forged_mapped_score:${source.from}`);
}

export function insufficientEvidenceVerdict(): InsufficientEvidenceVerdict {
  return {
    status: 'assessment_unavailable',
    reason: 'insufficient_evidence',
    overall: null,
    trustedBSideScore: null,
  };
}

export function isInsufficientEvidence(overall: number | null | undefined): boolean {
  return overall == null || (typeof overall === 'number' && !Number.isFinite(overall));
}

/** Ready assessment overall that career/growth may consume. Null/non-finite → unavailable, not 0. */
export function requireTrustedPracticeOverall(overall: unknown): number {
  if (isInsufficientEvidence(overall as number | null | undefined)) fail('insufficient_evidence');
  return finiteScore(overall);
}

export interface HonestyScoreCard {
  questionId: string;
  deterministicTotal: number;
  status: ScoreCardStatus;
}

/**
 * C-end practice overall from ScoreCards only. Empty / non-scorable → insufficient
 * evidence (null), never a forged 0 and never an event-average fallback.
 */
export function practiceOverallFromScoreCards(cards: readonly HonestyScoreCard[]): number | null {
  const eligible = (cards ?? []).filter((c) => c && isScoreCardScorable(c.status));
  if (eligible.length === 0) return null;
  if (eligible.some((c) => !Number.isInteger(c.deterministicTotal) || c.deterministicTotal < 0 || c.deterministicTotal > 100)) {
    fail('score_value_invalid');
  }
  return Math.round(eligible.reduce((sum, c) => sum + c.deterministicTotal, 0) / eligible.length);
}
