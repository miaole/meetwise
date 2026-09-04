import { createHash, randomUUID } from 'node:crypto';
import { BASE, readJson } from './http.ts';
import { readSseEvents, rejectForgedProgressScores, type SseEvent } from './sse.ts';
import type { AssertFn } from './assert.ts';

export const INTERVIEW_TERMINAL_DEADLINE_MS = 420_000;
export const INTERVIEW_TERMINALS = ['report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable', 'error'] as const;
export const STALE_QUESTION_ERROR = 'stale_question';

/** Canonical server-issued questionId: q-v{stateVersion}-t{turn}-c{clarifyAttempts}. */
export const QUESTION_ID_RE = /^q-v(\d+)-t(\d+)-c(\d+)$/;

/** Domain decideNext conclude reasons. Client must not invent others. */
export const CONCLUDE_REASONS = ['budget_exhausted', 'all_resolved'] as const;
/** Domain decideNext ask modes. Client must not invent others. */
export const ASK_MODES = ['probe', 'pivot'] as const;

export type QuestionIdentity = { questionId: string; stateVersion: number; turn: number };
export type ConcludeReason = (typeof CONCLUDE_REASONS)[number];
export type AskMode = (typeof ASK_MODES)[number];

export type PracticeHint = QuestionIdentity & {
  value: number;
  source: 'answer_evaluated';
  role: 'practice_hint';
};

export type AttributableAsk = {
  kind: 'ask';
  mode: AskMode;
  competency: string;
  source: 'server_payload';
};

export type AttributableConclude = {
  kind: 'conclude';
  reason: ConcludeReason;
  source: 'server_payload';
};

export type AttributableDecision = AttributableAsk | AttributableConclude;

export type UntrustedDisplay = {
  kind: string;
  field: string;
  trust: 'untrusted_ai_output';
};

/** P0 review: server identity may be used to answer; AI text/scores/progress never become B-side evidence. */
export type InterviewProvenanceReview = {
  identities: QuestionIdentity[];
  practiceHints: PracticeHint[];
  attributions: AttributableDecision[];
  untrustedDisplay: UntrustedDisplay[];
  trustedBSideScore: null;
  forgedScores: 'none';
};

export type InterviewLoopResult = {
  terminal: string;
  questions: number;
  turns: number;
  evaluated: number;
  lastSeq: number;
  kinds: Set<string>;
  practiceHints: PracticeHint[];
  attributions: AttributableDecision[];
  provenance: InterviewProvenanceReview;
};

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/** E2E uses the identity issued on question_ready / clarification_needed. Never invent the current question. */
export function questionIdentity(payload: any): QuestionIdentity {
  if (typeof payload?.questionId !== 'string' || !isNonNegativeInt(payload?.stateVersion) || !isNonNegativeInt(payload?.turn)) {
    throw new Error('e2e_question_identity_missing');
  }
  const match = QUESTION_ID_RE.exec(payload.questionId);
  if (!match) throw new Error('e2e_question_identity_forged');
  if (Number(match[1]) !== payload.stateVersion || Number(match[2]) !== payload.turn) {
    throw new Error('e2e_question_identity_forged');
  }
  return { questionId: payload.questionId, stateVersion: payload.stateVersion, turn: payload.turn };
}

/** Progress is not an identity source. Only question_ready / clarification_needed may issue a token. */
export function questionIdentityFromEvent(event: Pick<SseEvent, 'kind' | 'payload'>): QuestionIdentity {
  if (event.kind === 'progress') throw new Error('e2e_progress_not_identity');
  if (event.kind !== 'question_ready' && event.kind !== 'clarification_needed') {
    throw new Error('e2e_question_identity_wrong_kind');
  }
  return questionIdentity(event.payload);
}

export function answerBody(identity: QuestionIdentity, answer: string) {
  return {
    ...identity,
    answer,
    answerId: randomUUID(),
    answerHash: createHash('sha256').update(answer).digest('hex'),
  };
}

/**
 * answer_evaluated.score is a practice-feedback hint only.
 * It is never a B-side overall / rank / application score.
 */
export function practiceHintFromEvaluated(payload: any): PracticeHint {
  const identity = questionIdentity(payload);
  if (typeof payload?.score !== 'number' || !Number.isFinite(payload.score)) {
    throw new Error('e2e_evaluated_score_missing');
  }
  return { ...identity, value: payload.score, source: 'answer_evaluated', role: 'practice_hint' };
}

/**
 * Interview SSE never yields a B-side score. Practice hints, progress, and
 * report_ready.overall are untrusted AI/display fields — calling this is the
 * only helper path that would mint a B-side number, and it always fails.
 */
export function refuseBSideScoreFromInterviewStream(source: {
  from: 'practice_hint' | 'answer_evaluated' | 'progress' | 'report_ready' | 'question_ready';
  value?: unknown;
}): never {
  throw new Error(`e2e_forged_score:${source.from}`);
}

export function assertPracticeHintNotBSide(hint: PracticeHint): void {
  if (hint.role !== 'practice_hint' || hint.source !== 'answer_evaluated') {
    throw new Error('e2e_forged_score');
  }
}

export function sameQuestionIdentity(left: QuestionIdentity, right: QuestionIdentity): boolean {
  return left.questionId === right.questionId && left.stateVersion === right.stateVersion && left.turn === right.turn;
}

/**
 * Probe/pivot is attributable only when the server emitted a legal mode + competency.
 * Same-competency inference is not an attribution — that would forge 出处.
 */
export function attributableAsk(payload: any): AttributableAsk | null {
  if (payload?.mode === undefined) return null;
  if (!(ASK_MODES as readonly string[]).includes(payload.mode)) {
    throw new Error('e2e_ask_attribution_forged');
  }
  if (typeof payload.competency !== 'string' || payload.competency.length === 0) {
    throw new Error('e2e_ask_attribution_missing');
  }
  return { kind: 'ask', mode: payload.mode, competency: payload.competency, source: 'server_payload' };
}

/**
 * Conclude is attributable only on a dedicated conclude event.
 * Progress / waiting_user / terminal SSE kinds are never conclude sources.
 */
function concludeMarked(event: Pick<SseEvent, 'kind' | 'payload'>): boolean {
  if (event.kind === 'progress' || event.kind === 'waiting_user') return false;
  if ((INTERVIEW_TERMINALS as readonly string[]).includes(event.kind)) return false;
  return event.kind === 'conclude';
}

/**
 * Conclude reason is attributable only when the event kind is conclude and
 * the reason is a domain enum. Terminal SSE reasons (assessment_unavailable,
 * report_unavailable, …) and progress.route are not conclude reasons.
 */
export function attributableConclude(event: Pick<SseEvent, 'kind' | 'payload'>): AttributableConclude | null {
  if (!concludeMarked(event)) return null;
  const reason = event.payload?.concludeReason ?? event.payload?.reason;
  if (typeof reason !== 'string' || reason.length === 0) {
    throw new Error('e2e_conclude_attribution_missing');
  }
  if (!(CONCLUDE_REASONS as readonly string[]).includes(reason)) {
    throw new Error('e2e_conclude_attribution_forged');
  }
  return { kind: 'conclude', reason, source: 'server_payload' };
}

export function unscoredReason(payload: any): { identity: QuestionIdentity; reason: string; source: 'server_payload' } {
  const identity = questionIdentity(payload);
  if (typeof payload?.reason !== 'string' || payload.reason.length === 0) {
    throw new Error('e2e_unscored_reason_missing');
  }
  return { identity, reason: payload.reason, source: 'server_payload' };
}

/**
 * P0 provenance review. Trusted: server-issued question identity.
 * Untrusted: question text, practice hint scores, report overall.
 * Rejected: scores on progress/question frames; identity or conclude from progress.
 * Does not invent probe/conclude when the server omitted them. Does not cap rounds.
 */
export function reviewInterviewProvenance(events: SseEvent[]): InterviewProvenanceReview {
  rejectForgedProgressScores(events);
  const identities: QuestionIdentity[] = [];
  const practiceHints: PracticeHint[] = [];
  const attributions: AttributableDecision[] = [];
  const untrustedDisplay: UntrustedDisplay[] = [];
  for (const event of events) {
    if (event.kind === 'progress') {
      if (event.payload?.questionId !== undefined) throw new Error('e2e_progress_not_identity');
      continue;
    }
    if (event.kind === 'question_ready' || event.kind === 'clarification_needed') {
      identities.push(questionIdentityFromEvent(event));
      const ask = attributableAsk(event.payload);
      if (ask) attributions.push(ask);
      if (typeof event.payload?.question === 'string') {
        untrustedDisplay.push({ kind: event.kind, field: 'question', trust: 'untrusted_ai_output' });
      }
    } else if (event.kind === 'answer_evaluated') {
      const hint = practiceHintFromEvaluated(event.payload);
      assertPracticeHintNotBSide(hint);
      practiceHints.push(hint);
      untrustedDisplay.push({ kind: 'answer_evaluated', field: 'score', trust: 'untrusted_ai_output' });
    } else if (event.kind === 'answer_unscored') {
      unscoredReason(event.payload);
    } else if (event.kind === 'report_ready' && event.payload?.overall !== undefined) {
      untrustedDisplay.push({ kind: 'report_ready', field: 'overall', trust: 'untrusted_ai_output' });
    }
    const conclude = attributableConclude(event);
    if (conclude) attributions.push(conclude);
  }
  return {
    identities,
    practiceHints,
    attributions,
    untrustedDisplay,
    trustedBSideScore: null,
    forgedScores: 'none',
  };
}

/** Inspect a batch: reject forged scores; collect only server-attributed decisions and practice hints. */
export function inspectInterviewProvenance(events: SseEvent[]): {
  practiceHints: PracticeHint[];
  attributions: AttributableDecision[];
} {
  const review = reviewInterviewProvenance(events);
  return { practiceHints: review.practiceHints, attributions: review.attributions };
}

export async function submitTurn(
  interviewId: string,
  headers: Record<string, string>,
  identity: QuestionIdentity,
  answer: string,
  idempotencyKey: string,
): Promise<{ status: number; body: any }> {
  const response = await fetch(`${BASE}/interview/${interviewId}/turn`, {
    method: 'POST',
    headers: { ...headers, 'idempotency-key': idempotencyKey },
    body: JSON.stringify(answerBody(identity, answer)),
  });
  return { status: response.status, body: await readJson(response) };
}

export type InterviewLoopOptions = {
  interviewId: string;
  token: string;
  headers: Record<string, string>;
  assert: AssertFn;
  deadlineMs?: number;
  questionAnswer: string;
  clarificationAnswer?: string;
  questionAcceptedLabel: (turn: number) => string;
  clarificationAcceptedLabel: string;
  /** When set, replay a consumed identity and assert 409 stale_question. */
  staleReplayLabel?: string;
  /** Replay after the first accepted /turn so the check does not depend on a live clarification event. */
  replayConsumedAfterFirstTurn?: boolean;
};

/**
 * Drive one interview from issued questions to a terminal SSE event.
 * Answers bind the server-issued question identity; the client does not score
 * and does not invent conclude/probe reasons. Length follows the server; this
 * loop does not cap turns.
 */
export async function driveInterviewToTerminal(options: InterviewLoopOptions): Promise<InterviewLoopResult> {
  const deadlineMs = options.deadlineMs ?? INTERVIEW_TERMINAL_DEADLINE_MS;
  const clarificationAnswer = options.clarificationAnswer ?? '跳过';
  let lastSeq = 0;
  let turn = 0;
  let questions = 0;
  let evaluated = 0;
  let terminal = '';
  let currentQuestion: QuestionIdentity | null = null;
  let lastSubmitted: QuestionIdentity | null = null;
  const kinds = new Set<string>();
  const seen: SseEvent[] = [];
  const started = Date.now();

  while (Date.now() - started < deadlineMs) {
    const events = await readSseEvents(`/interview/${options.interviewId}/events`, options.token, lastSeq);
    reviewInterviewProvenance(events);
    for (const event of events) {
      if (event.seq <= lastSeq) continue;
      lastSeq = event.seq;
      kinds.add(event.kind);
      seen.push(event);
      if (event.kind === 'question_ready') {
        questions++;
        currentQuestion = questionIdentityFromEvent(event);
        const submitted = await submitTurn(
          options.interviewId,
          options.headers,
          currentQuestion,
          options.questionAnswer,
          `${options.interviewId}:question:${currentQuestion.questionId}:answer:${turn}`,
        );
        options.assert(submitted.status === 202, options.questionAcceptedLabel(turn + 1));
        lastSubmitted = currentQuestion;
        if (options.staleReplayLabel && options.replayConsumedAfterFirstTurn && questions === 1) {
          const stale = await submitTurn(
            options.interviewId,
            options.headers,
            currentQuestion,
            '这是一条已消费身份的重放答案',
            `${options.interviewId}:stale:${currentQuestion.questionId}`,
          );
          options.assert(stale.status === 409 && stale.body.error === STALE_QUESTION_ERROR, options.staleReplayLabel);
        }
        turn++;
      } else if (event.kind === 'answer_evaluated') {
        const hint = practiceHintFromEvaluated(event.payload);
        if (lastSubmitted && !sameQuestionIdentity(hint, lastSubmitted)) {
          throw new Error('e2e_evaluated_identity_mismatch');
        }
        evaluated++;
      } else if (event.kind === 'answer_unscored') {
        unscoredReason(event.payload);
      } else if (event.kind === 'clarification_needed') {
        const staleQuestion = currentQuestion;
        currentQuestion = questionIdentityFromEvent(event);
        if (options.staleReplayLabel && staleQuestion) {
          const stale = await submitTurn(
            options.interviewId,
            options.headers,
            staleQuestion,
            '这是一条已消费身份的重放答案',
            `${options.interviewId}:stale:${staleQuestion.questionId}`,
          );
          options.assert(stale.status === 409 && stale.body.error === STALE_QUESTION_ERROR, options.staleReplayLabel);
        }
        const submitted = await submitTurn(
          options.interviewId,
          options.headers,
          currentQuestion,
          clarificationAnswer,
          `${options.interviewId}:question:${currentQuestion.questionId}:answer:${turn}`,
        );
        options.assert(submitted.status === 202, options.clarificationAcceptedLabel);
        lastSubmitted = currentQuestion;
        turn++;
      } else if ((INTERVIEW_TERMINALS as readonly string[]).includes(event.kind)) {
        terminal = event.kind;
      }
    }
    if (terminal) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const provenance = reviewInterviewProvenance(seen);
  return {
    terminal, questions, turns: turn, evaluated, lastSeq, kinds,
    practiceHints: provenance.practiceHints,
    attributions: provenance.attributions,
    provenance,
  };
}
