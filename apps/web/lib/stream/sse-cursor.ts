/**
 * SSE Last-Event-ID fail-closed (HC-GAP-014).
 *
 * HTTP 400 `invalid_last_event_id` is a cursor/request error, never a disconnect.
 * Retrying the same Last-Event-ID cannot repair it and would loop the illegal header.
 * Drivers must stop / enter degraded and surface a fail-closed exit.
 *
 * The Next proxy currently forwards upstream 400 (body may be JSON or `stream_unavailable`).
 * Any 400 on SSE open is therefore fatal. 502/401/404 still look like a dropped connection.
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

/** HTTP 410 on the interview SSE open is a privacy fence: fatal, no reconnect (F6, status-based). */
export function throwIfPrivacyFencedStatus(status: number): void {
  if (status === 410) throw new InterviewPrivacyFencedError();
}

/** Read an opened SSE Response: 400 → fatal; other non-OK → empty (driver reconnects). */
export async function* iterateSseBody(res: Response): AsyncGenerator<string> {
  throwIfInvalidLastEventIdStatus(res.status);
  if (!res.ok || !res.body) return;
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
