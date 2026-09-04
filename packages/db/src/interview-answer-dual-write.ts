/**
 * @meetwise/db · 答题正文双写互斥（INT-P0-RAW-QUEUE 围栏，不是 INT-TRANSCRIPT-01）。
 *
 * Legacy `/turn` 仍写 interview_job.payload.answer。ledger `submitInterviewAnswer`
 * 可被预览 `POST /interview/:id/answers` 调用，仍不是 INT-TRANSCRIPT-01 生产 HTTP。
 * 本模块只调用 0126 的 SECURITY DEFINER 断言，使仓储与触发器共用同一错误码。
 * 不得把成功调用解释成 01 已开放。
 *
 * 明文判定与触发器一致：顶层 `answer` 键存在即进入互斥（含 "" / null / 非 string）。
 * kind 不豁免。questionId / stateVersion 与 SQL 同一套 trim + `^[0-9]+$` 规范。
 */
import type { Client } from './principal.ts';

export const INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED = 'interview_answer_legacy_plaintext_fenced';
export const INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED = 'interview_answer_ledger_dual_write_fenced';
export const INTERVIEW_EVENT_RAW_ANSWER_FENCED = 'interview_event_raw_answer_fenced';

const DUAL_WRITE_CODES = [
  INTERVIEW_ANSWER_LEGACY_PLAINTEXT_FENCED,
  INTERVIEW_ANSWER_LEDGER_DUAL_WRITE_FENCED,
  INTERVIEW_EVENT_RAW_ANSWER_FENCED,
] as const;

export function remapInterviewAnswerDualWriteError(error: unknown): never {
  const message = String((error as { message?: string } | null)?.message ?? error);
  for (const code of DUAL_WRITE_CODES) {
    if (message.includes(code)) throw Object.assign(new Error(code), { code });
  }
  throw error;
}

/** payload 带顶层 answer 键时进入互斥；返回 null 表示本行不是明文正文写入。 */
export function plaintextAnswerIdentity(payload: unknown): { questionId: string | null; stateVersion: number | null } | null {
  if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) return null;
  if (!Object.prototype.hasOwnProperty.call(payload, 'answer')) return null;
  const record = payload as { questionId?: unknown; stateVersion?: unknown };
  const questionId = typeof record.questionId === 'string' && record.questionId.trim() ? record.questionId.trim() : null;
  const rawVersion = record.stateVersion == null ? '' : String(record.stateVersion).trim();
  const stateVersion = /^[0-9]+$/.test(rawVersion) ? Number(rawVersion) : null;
  return { questionId, stateVersion };
}

export function eventPayloadHasRawAnswer(payload: unknown): boolean {
  if (payload == null) return false;
  if (Array.isArray(payload)) return payload.includes('answer');
  return typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'answer');
}

export async function assertInterviewAnswerLegacyPlaintextAllowed(
  c: Client, interviewId: string, questionId: string | null, stateVersion: number | null,
): Promise<void> {
  try {
    await c.query('SELECT assert_interview_answer_legacy_plaintext_allowed($1,$2,$3)', [interviewId, questionId, stateVersion]);
  } catch (error) {
    remapInterviewAnswerDualWriteError(error);
  }
}

export async function assertInterviewAnswerLedgerWriteAllowed(
  c: Client, interviewId: string, questionId: string, stateVersion: number,
): Promise<void> {
  try {
    await c.query('SELECT assert_interview_answer_ledger_write_allowed($1,$2,$3)', [interviewId, questionId, stateVersion]);
  } catch (error) {
    remapInterviewAnswerDualWriteError(error);
  }
}
