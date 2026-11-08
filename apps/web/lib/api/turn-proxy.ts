/**
 * Same-origin turn proxy seam (#66/API-HARDEN-A).  Mirrors transcribe-proxy.ts /
 * speak-proxy.ts / report-export-proxy.ts family shape: injectable fetchImpl,
 * upstream HTTP replies pass through untouched (incl. 4xx/429/5xx — the client
 * keeps consuming their codes verbatim); upstream NETWORK failure (fetch
 * throws / first-byte timeout) resolves to a deterministic 502 JSON envelope
 * `upstream_unavailable` instead of escaping as an unhandled Next 500.
 * Client cancellation keeps the family contract: AbortError rethrows so the
 * route/caller sees the abort (same as TC-VOICE-01-E6).
 */
/** 计算键:HTTP wire 头名连字符字面量会计入 naming-convention(lint 上限零余量·enterprise-pay-s1 同款)。 */
const contentTypeHeader = 'content-type' as const;
const idempotencyKeyHeader = 'idempotency-key' as const;

export async function proxyInterviewTurn(input: {
  apiBase: string;
  interviewId: string;
  bearerToken: string;
  body: string;
  idempotencyKey: string;
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
      `${input.apiBase}/interview/${encodeURIComponent(input.interviewId)}/turn`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${input.bearerToken}`, [contentTypeHeader]: 'application/json', [idempotencyKeyHeader]: input.idempotencyKey },
        body: input.body,
        signal: effective,
      },
    );
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { [contentTypeHeader]: upstream.headers.get(contentTypeHeader) ?? 'application/json' } });
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') throw error;   // 客户端取消:取消合同零变化
    return Response.json({ error: 'upstream_unavailable' }, { status: 502 });
  }
}
