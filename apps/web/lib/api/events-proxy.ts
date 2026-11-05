/**
 * Same-origin interview events (SSE) upstream-open seam (#66/API-HARDEN-A).
 * The route keeps its existing non-OK mapping (sseProxyFailureResponse); this
 * seam only owns the OPEN phase:
 *   - upstream replies (any status) resolve as-is;
 *   - upstream network failure / TTFB timeout resolve to a 502 plain-text
 *     `stream_unavailable` Response — the same envelope sseProxyFailureResponse
 *     emits for upstream 5xx, so the client's existing classification
 *     (SSE-RESILIENCE #56) treats both identically;
 *   - client cancellation still rejects with AbortError (existing semantics:
 *     browser navigation/cancel must tear down the upstream fetch).
 * The TTFB timer is cleared the moment headers arrive; the SSE body stream
 * itself is never time-limited (long-lived by design, 10min pump deadline
 * lives server-side).
 */
export async function openInterviewEventsUpstream(input: {
  apiBase: string;
  interviewId: string;
  bearerToken: string;
  lastEventId?: string;
  clientSignal: AbortSignal;
  /** Time-to-first-header cap in ms; the body stream is not covered. */
  ttfbTimeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<Response> {
  const controller = new AbortController();
  const onClientAbort = () => controller.abort(input.clientSignal.reason);
  if (input.clientSignal.aborted) onClientAbort();
  else input.clientSignal.addEventListener('abort', onClientAbort, { once: true });
  const timer = input.ttfbTimeoutMs && input.ttfbTimeoutMs > 0
    ? setTimeout(() => controller.abort(new DOMException('The operation was timed out.', 'TimeoutError')), input.ttfbTimeoutMs)
    : undefined;
  try {
    const headers: Record<string, string> = { authorization: `Bearer ${input.bearerToken}`, accept: 'text/event-stream' };
    if (input.lastEventId) headers['last-event-id'] = input.lastEventId;     // 续传水位透传(与 route 既有形逐字同)
    return await (input.fetchImpl ?? fetch)(
      `${input.apiBase}/interview/${encodeURIComponent(input.interviewId)}/events`,
      { headers, signal: controller.signal },
    );
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') throw error;   // 客户端取消:取消合同零变化
    return new Response('stream_unavailable', { status: 502 });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    input.clientSignal.removeEventListener('abort', onClientAbort);
  }
}
