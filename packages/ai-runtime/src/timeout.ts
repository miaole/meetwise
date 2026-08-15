/**
 * 超时原语（北极星:快速恢复)。外部依赖慢/挂 → 不无限等,到点中断 → 降级。
 *  - withTimeout: 给任意 Promise 加超时(到点 reject + 回调清理)。
 *  - timeoutSignal: 给 fetch 用的 AbortSignal,到点 abort(连接真断,不只逻辑放弃)。
 */
export async function withTimeout<T>(p: Promise<T>, ms: number, onTimeout?: () => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => { onTimeout?.(); reject(new Error('timeout')); }, ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

/**
 * Applies one deadline to an operation and aborts the operation's own signal
 * when the deadline elapses.  `withTimeout` alone only stops the caller from
 * waiting; this helper additionally tells fetch/SDK adapters and queue waits
 * to stop their underlying work.  A non-cooperative adapter may still settle
 * later, so callers must never attach a success continuation after timeout.
 */
export async function withAbortTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>, ms: number, onTimeout?: () => void,
): Promise<T> {
  const ctrl = new AbortController();
  return withTimeout(operation(ctrl.signal), ms, () => {
    ctrl.abort();
    onTimeout?.();
  });
}

/** fetch 超时:返回 { signal, clear }。到 ms 自动 abort(底层连接断)。用完 clear() 清定时器。 */
export function timeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(t) };
}

/** Combines abort sources without relying on a Node-version-specific `AbortSignal.any`. */
export function combineAbortSignals(signals: readonly (AbortSignal | undefined)[]): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const active = signals.filter((signal): signal is AbortSignal => Boolean(signal));
  const listeners = new Map<AbortSignal, () => void>();
  for (const signal of active) {
    const abort = () => {
      if (!ctrl.signal.aborted) ctrl.abort(signal.reason);
    };
    listeners.set(signal, abort);
    if (signal.aborted) { abort(); break; }
    signal.addEventListener('abort', abort, { once: true });
  }
  return {
    signal: ctrl.signal,
    clear: () => {
      for (const signal of active) {
        const listener = listeners.get(signal);
        if (listener) signal.removeEventListener('abort', listener);
      }
    },
  };
}

export class ExternalRequestTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super('external_request_timeout');
    this.name = 'ExternalRequestTimeoutError';
  }
}

/**
 * The direct caller cancelled the request.  This is deliberately distinct
 * from a provider/transport `AbortError`: only the former maps to a client
 * disconnect (HTTP 499) in voice adapters.
 */
export class ExternalRequestAbortedError extends Error {
  constructor() {
    super('external_request_aborted');
    this.name = 'ExternalRequestAbortedError';
  }
}

export class ExternalHttpStatusError extends Error {
  constructor(public readonly status: number) {
    super(`external_http_${status}`);
    this.name = 'ExternalHttpStatusError';
  }
}

export class ExternalResponseBodyTooLargeError extends Error {
  constructor(public readonly maxBytes: number) {
    super('external_response_body_too_large');
    this.name = 'ExternalResponseBodyTooLargeError';
  }
}

export class ExternalResponseContentTypeError extends Error {
  constructor() {
    super('external_response_content_type_invalid');
    this.name = 'ExternalResponseContentTypeError';
  }
}

export class ExternalResponseJsonError extends Error {
  constructor() {
    super('external_response_json_invalid');
    this.name = 'ExternalResponseJsonError';
  }
}

/**
 * Transport cleanup is never part of the business completion path.  Some
 * broken streams never settle `cancel()`; awaiting them would pin a caller's
 * admission slot forever after we have already decided to reject the body.
 */
function cancelResponseBody(response: Response): void {
  try { void response.body?.cancel().catch(() => undefined); }
  catch { /* cleanup is best-effort after a remote failure */ }
}

function cancelReader(reader: ReadableStreamDefaultReader<Uint8Array>, reason: unknown): void {
  try { void reader.cancel(reason).catch(() => undefined); }
  catch { /* cleanup is best-effort after a remote failure */ }
}

async function readJsonBodyBounded<T>(response: Response, signal: AbortSignal, maxBytes: number): Promise<T> {
  const declared = response.headers.get('content-length');
  if (declared !== null) {
    const length = Number(declared);
    if (!Number.isSafeInteger(length) || length < 0 || length > maxBytes) {
      cancelResponseBody(response);
      throw new ExternalResponseBodyTooLargeError(maxBytes);
    }
  }
  const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (contentType !== 'application/json' && contentType !== 'application/problem+json') {
    cancelResponseBody(response);
    throw new ExternalResponseContentTypeError();
  }
  if (!response.body) throw new ExternalResponseJsonError();

  const reader = response.body.getReader();
  let removeAbortListener: (() => void) | undefined;
  const aborted = new Promise<never>((_resolve, reject) => {
    const abort = () => reject(signal.reason instanceof Error ? signal.reason : new DOMException('aborted', 'AbortError'));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    removeAbortListener = () => signal.removeEventListener('abort', abort);
  });
  try {
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const item = await Promise.race([reader.read(), aborted]);
      if (item.done) break;
      bytes += item.value.byteLength;
      if (bytes > maxBytes) throw new ExternalResponseBodyTooLargeError(maxBytes);
      chunks.push(item.value);
    }
    const merged = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(merged)) as T; }
    catch { throw new ExternalResponseJsonError(); }
  } catch (error) {
    cancelReader(reader, error);
    throw error;
  } finally {
    removeAbortListener?.();
    reader.releaseLock();
  }
}

/**
 * A whole JSON exchange guard: the same absolute deadline and caller signal
 * cover headers *and* body consumption.  Do not replace this with
 * `fetchWithTimeout(...); response.json()`; that would clear the timer at
 * headers and let a chunked JSON body pin a paid admission slot forever.
 */
export async function fetchJsonWithTimeout<T>(
  url: string,
  init: RequestInit = {},
  options: { timeoutMs?: number; maxBytes?: number } = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? Number(process.env.HTTP_TIMEOUT_MS ?? 30_000);
  const maxBytes = options.maxBytes ?? 256 * 1024;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || !Number.isSafeInteger(maxBytes) || maxBytes < 1)
    throw new Error('external_json_guard_config_invalid');
  // Preserve the abort *cause* across the whole exchange.  Checking only
  // `init.signal.aborted` in catch is unsafe: a provider may reject first and
  // a browser disconnect can arrive in the same event-loop turn before the
  // rejection continuation runs.  Native fetch rejects with signal.reason,
  // so dedicated error objects make caller/timeout cancellation provable
  // without rewriting an earlier provider/transport failure.
  const callerAbort = new AbortController();
  const callerError = new ExternalRequestAbortedError();
  const deadlineAbort = new AbortController();
  const deadlineError = new ExternalRequestTimeoutError(timeoutMs);
  const forwardCallerAbort = () => callerAbort.abort(callerError);
  if (init.signal?.aborted) forwardCallerAbort();
  else init.signal?.addEventListener('abort', forwardCallerAbort, { once: true });
  const deadlineTimer = setTimeout(() => deadlineAbort.abort(deadlineError), timeoutMs);
  const combined = combineAbortSignals([callerAbort.signal, deadlineAbort.signal]);
  try {
    const response = await fetch(url, { ...init, signal: combined.signal });
    if (!response.ok) {
      cancelResponseBody(response);
      throw new ExternalHttpStatusError(response.status);
    }
    return await readJsonBodyBounded<T>(response, combined.signal, maxBytes);
  } catch (error) {
    if (error === deadlineError) throw deadlineError;
    if (error === callerError) throw callerError;
    throw error;
  } finally {
    combined.clear();
    clearTimeout(deadlineTimer);
    init.signal?.removeEventListener('abort', forwardCallerAbort);
  }
}

/**
 * Header-only compatibility helper. Callers that consume a response body must
 * use `fetchJsonWithTimeout` (or an equally bounded reader) instead.
 */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = Number(process.env.HTTP_TIMEOUT_MS ?? 30_000)): Promise<Response> {
  const to = timeoutSignal(ms);
  const combined = combineAbortSignals([init.signal ?? undefined, to.signal]);
  try { return await fetch(url, { ...init, signal: combined.signal }); }
  finally {
    combined.clear();
    to.clear();
  }
}
