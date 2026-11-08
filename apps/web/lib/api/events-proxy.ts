/**
 * Same-origin interview events (SSE) upstream-open seam (#66/API-HARDEN-A).
 * The route keeps its existing non-OK mapping (sseProxyFailureResponse); this
 * seam owns the OPEN phase plus full-lifetime cancellation:
 *   - upstream replies (any status) resolve as-is;
 *   - upstream network failure / TTFB timeout resolve to a 502 plain-text
 *     `stream_unavailable` Response — the same envelope sseProxyFailureResponse
 *     emits for upstream 5xx, so the client's existing classification
 *     (SSE-RESILIENCE #56) treats both identically;
 *   - client cancellation is bound for the seam's whole lifetime: before open
 *     it rejects with AbortError (existing semantics); after open (rev r1,
 *     falsification pre-2 P2-1) the abort listener stays attached so the
 *     upstream fetch signal aborts synchronously and undici tears the socket
 *     down — the pre-fix seam removed this listener in `finally`, so a client
 *     disconnect after open left the orphaned upstream stream alive up to the
 *     api-side 10min pump deadline (probe: upstream socket closed=0).
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
    // rev r1:abort 监听不摘——{ once: true } 单次触发,clientSignal(req.signal)随请求生命周期回收;
    // 流建立后取消经它同步中止上游 fetch(undici 撤 socket),弃置流不再挂到 api 侧 10min deadline。
  }
}
