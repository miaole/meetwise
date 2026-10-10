/**
 * SSE Last-Event-ID fail-closed (HC-GAP-014).
 *
 * HTTP 400 `invalid_last_event_id` is a cursor/request error, never a disconnect.
 * Retrying the same Last-Event-ID cannot repair it and would loop the illegal header.
 * Drivers must stop / enter degraded and surface a fail-closed exit.
 *
 * The Next proxy currently forwards upstream 400 (body may be JSON or `stream_unavailable`).
 * Any 400 on SSE open is therefore fatal. Other non-OK statuses surface as `SseOpenStatusError`
 * so the driver can classify (SSE-RESILIENCE #56) instead of faking a dropped connection.
 */
export const INVALID_LAST_EVENT_ID = 'invalid_last_event_id' as const;

export class InvalidLastEventIdError extends Error {
  readonly code = INVALID_LAST_EVENT_ID;
  constructor() {
    super(INVALID_LAST_EVENT_ID);
    this.name = 'InvalidLastEventIdError';
  }
}

export function isInvalidLastEventIdError(err: unknown): err is InvalidLastEventIdError {
  if (err instanceof InvalidLastEventIdError) return true;
  if (!(err instanceof Error)) return false;
  return err.name === 'InvalidLastEventIdError'
    || (err as { code?: string }).code === INVALID_LAST_EVENT_ID
    || err.message === INVALID_LAST_EVENT_ID;
}

/**
 * FENCE-REFLOW F6/#243: HTTP 410 on the interview SSE stream means the interview is
 * privacy-fenced (`interview_privacy_fenced`).  The Next proxy passes 410 through with a
 * swapped body (`stream_unavailable`), so the fence is only observable as a **status** —
 * the criterion is status-based, never body-code-based.  Retrying/reconnecting cannot
 * repair a permanent fence: drivers must stop (no reconnect) and surface the fenced exit.
 * Quiz/diagnosis streams are out of audit scope for #243 and keep the unchanged
 * `iterateSseBody` (410 = empty end = bounded reconnect there).
 */
export const INTERVIEW_PRIVACY_FENCED = 'interview_privacy_fenced' as const;

export class InterviewPrivacyFencedError extends Error {
  readonly code = INTERVIEW_PRIVACY_FENCED;
  constructor() {
    super(INTERVIEW_PRIVACY_FENCED);
    this.name = 'InterviewPrivacyFencedError';
  }
}

export function isInterviewPrivacyFencedError(err: unknown): err is InterviewPrivacyFencedError {
  if (err instanceof InterviewPrivacyFencedError) return true;
  if (!(err instanceof Error)) return false;
  return err.name === 'InterviewPrivacyFencedError'
    || (err as { code?: string }).code === INTERVIEW_PRIVACY_FENCED
    || err.message === INTERVIEW_PRIVACY_FENCED;
}

/**
 * Encode the resumable cursor. 0 / absent → no header (full replay from seq>0).
 * Non-safe integers (`Infinity`, decimals, negatives, NaN) must never become `Last-Event-ID`.
 */
export function lastEventIdHeaderValue(lastEventId: number): string | undefined {
  if (lastEventId === 0) return undefined;
  if (!Number.isSafeInteger(lastEventId) || lastEventId < 0) {
    throw new InvalidLastEventIdError();
  }
  return String(lastEventId);
}

/** HTTP 400 on SSE open is an illegal cursor. Do not treat it as a clean disconnect. */
export function throwIfInvalidLastEventIdStatus(status: number): void {
  if (status === 400) throw new InvalidLastEventIdError();
}

/**
 * SSE-RESILIENCE #56：SSE 打开非 OK 不再静默空结束（旧实现把 401/404/429/5xx 都扮成"空流结束"→假断线）。
 * 驱动按 status 分类消费：401→停转跳登录、404→fail-closed、429→慢速重试、5xx→计失败退避（见各驱动）。
 * 代理 `sseProxyFailureResponse` 已透传原 status，这里是客户端把分类信息真正用起来。
 */
export const SSE_OPEN_STATUS_ERROR = 'sse_open_status_error' as const;

export class SseOpenStatusError extends Error {
  readonly code = SSE_OPEN_STATUS_ERROR;
  readonly status: number;
  constructor(status: number) {
    super(`sse_open_status_${status}`);
    this.name = 'SseOpenStatusError';
    this.status = status;
  }
}

export function isSseOpenStatusError(err: unknown): err is SseOpenStatusError {
  if (err instanceof SseOpenStatusError) return true;
  if (!(err instanceof Error)) return false;
  return err.name === 'SseOpenStatusError' || (err as { code?: string }).code === SSE_OPEN_STATUS_ERROR;
}

/** 打开状态 → 驱动消费分类。400 已在上游走 InvalidLastEventIdError 既有语义（零改）；410 围栏在 interview 入口先行拦截（F6）；此处不涉 400/410。 */
export type SseOpenClass = 'auth' | 'rate_limited' | 'server' | 'not_found' | 'transport';
export function classifySseOpenStatus(status: number): SseOpenClass {
  if (status === 401) return 'auth';
  if (status === 404) return 'not_found';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server';
  return 'transport';   // 其余 4xx（403 等）按传输失败计退避，不无限同游标重试语义之外加戏
}

/** HTTP 410 on the interview SSE open is a privacy fence: fatal, no reconnect (F6, status-based).
 *  先于 `iterateSseBody` 的 SseOpenStatusError 分类执行——410 fence=终态停转不重连，绝不落入退避/重连臂。 */
export function throwIfPrivacyFencedStatus(status: number): void {
  if (status === 410) throw new InterviewPrivacyFencedError();
}

/** Read an opened SSE Response: 400 → fatal（既有语义零改）; other non-OK → SseOpenStatusError(status)（驱动分类）。 */
export async function* iterateSseBody(res: Response): AsyncGenerator<string> {
  throwIfInvalidLastEventIdStatus(res.status);
  if (!res.ok || !res.body) throw new SseOpenStatusError(res.status);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    yield dec.decode(value, { stream: true });
  }
}

/** Interview-flow entry: adds the 410 fence stop channel on top of `iterateSseBody` (F6).
 *  Quiz/diagnosis keep `iterateSseBody` unchanged (#243 audit scope = interview stream). */
export async function* iterateInterviewSseBody(res: Response): AsyncGenerator<string> {
  throwIfPrivacyFencedStatus(res.status);
  yield* iterateSseBody(res);
}

/** Next SSE proxy: keep 400 visible to the browser; other failures stay generic unavailable. */
export async function sseProxyFailureResponse(upstream: Response): Promise<Response> {
  if (upstream.status === 400) {
    const text = await upstream.text().catch(() => '');
    return new Response(text || INVALID_LAST_EVENT_ID, {
      status: 400,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }
  return new Response('stream_unavailable', { status: upstream.status || 502 });
}
