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
