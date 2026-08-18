/**
 * One small, testable boundary for the non-streaming TTS same-origin proxy.
 * The browser request signal is deliberately forwarded; omitting it turns a
 * user barge-in into a server-side paid request that continues after playback
 * has stopped.
 */
export async function proxyInterviewSpeak(input: {
  apiBase: string;
  interviewId: string;
  bearerToken: string;
  body: string;
  signal: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<Response> {
  const upstream = await (input.fetchImpl ?? fetch)(
    `${input.apiBase}/interview/${encodeURIComponent(input.interviewId)}/speak`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${input.bearerToken}`, 'content-type': 'application/json' },
      body: input.body,
      signal: input.signal,
    },
  );
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
