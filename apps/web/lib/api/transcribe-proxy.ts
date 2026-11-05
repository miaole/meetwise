/**
 * Same-origin ASR proxy seam.  The incoming browser signal is an ephemeral
 * request capability; forwarding it is what lets navigation/cancel close the
 * API response socket and abort an in-flight provider transcription.
 *
 * #66/API-HARDEN-A: upstream NETWORK failure (fetch throws / whole-request
 * timeout) resolves to a deterministic 502 JSON envelope `upstream_unavailable`
 * instead of escaping as an unhandled Next 500; upstream HTTP replies pass
 * through untouched; client cancellation keeps rejecting with AbortError, and
 * when `timeoutMs` is absent the forwarded signal is the caller's instance
 * itself (identity contract of TC-VOICE-01-E6 unchanged).
 */
export async function proxyInterviewTranscribe(input: {
  apiBase: string;
  interviewId: string;
  bearerToken: string;
  body: string;
  signal: AbortSignal;
  /** Whole-request cap in ms; combined with the client signal when present. */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<Response> {
  const effective = input.timeoutMs && input.timeoutMs > 0
    ? AbortSignal.any([input.signal, AbortSignal.timeout(input.timeoutMs)])
    : input.signal;
  try {
    const upstream = await (input.fetchImpl ?? fetch)(
      `${input.apiBase}/interview/${encodeURIComponent(input.interviewId)}/transcribe`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${input.bearerToken}`, 'content-type': 'application/json' },
        body: input.body,
        signal: effective,
      },
    );
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') throw error;   // 客户端取消:取消合同零变化
    return Response.json({ error: 'upstream_unavailable' }, { status: 502 });
  }
}
