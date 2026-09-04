import { createHash, randomUUID } from 'node:crypto';
import { tagE2EFailure } from './failure.ts';
import { BASE, readJson } from './http.ts';
import { readSseEvents } from './sse.ts';
import type { AssertFn } from './assert.ts';

export const INTERVIEW_TERMINAL_DEADLINE_MS = 420_000;
export const INTERVIEW_TERMINALS = ['report_ready', 'report_unavailable', 'assessment_unavailable', 'interview_unavailable'] as const;
export const STALE_QUESTION_ERROR = 'stale_question';

export type QuestionIdentity = { questionId: string; stateVersion: number; turn: number };

export type InterviewLoopResult = {
  terminal: string;
  questions: number;
  turns: number;
  evaluated: number;
  lastSeq: number;
  kinds: Set<string>;
};

/** E2E uses the identity issued on question_ready / clarification_needed. Never invent the current question. */
export function questionIdentity(payload: any): QuestionIdentity {
  if (typeof payload?.questionId !== 'string' || !Number.isInteger(payload?.stateVersion) || !Number.isInteger(payload?.turn)) {
    throw tagE2EFailure('data_or_permission', 'question_identity_missing');
  }
  return { questionId: payload.questionId, stateVersion: payload.stateVersion, turn: payload.turn };
}

export function answerBody(identity: QuestionIdentity, answer: string) {
  return {
    ...identity,
    answer,
    answerId: randomUUID(),
    answerHash: createHash('sha256').update(answer).digest('hex'),
  };
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
 * Answers bind the server-issued question identity; the client does not score.
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
  const kinds = new Set<string>();
  const started = Date.now();

  while (Date.now() - started < deadlineMs) {
    const events = await readSseEvents(`/interview/${options.interviewId}/events`, options.token, lastSeq);
    for (const event of events) {
      if (event.seq <= lastSeq) continue;
      lastSeq = event.seq;
      kinds.add(event.kind);
      if (event.kind === 'question_ready') {
        questions++;
        currentQuestion = questionIdentity(event.payload);
        const submitted = await submitTurn(
          options.interviewId,
          options.headers,
          currentQuestion,
          options.questionAnswer,
          `${options.interviewId}:question:${currentQuestion.questionId}:answer:${turn}`,
        );
        options.assert(submitted.status === 202, options.questionAcceptedLabel(turn + 1));
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
        evaluated++;
      } else if (event.kind === 'clarification_needed') {
        const staleQuestion = currentQuestion;
        currentQuestion = questionIdentity(event.payload);
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
        turn++;
      } else if ((INTERVIEW_TERMINALS as readonly string[]).includes(event.kind)) {
        terminal = event.kind;
      }
    }
    if (terminal) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return { terminal, questions, turns: turn, evaluated, lastSeq, kinds };
}
