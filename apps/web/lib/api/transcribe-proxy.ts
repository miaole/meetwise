/**
 * Same-origin ASR proxy seam.  The incoming browser signal is an ephemeral
 * request capability; forwarding it is what lets navigation/cancel close the
 * API response socket and abort an in-flight provider transcription.
 */
export async function proxyInterviewTranscribe(input: {
  apiBase: string;
  interviewId: string;
  bearerToken: string;
  body: string;
  signal: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<Response> {
  const upstream = await (input.fetchImpl ?? fetch)(
    `${input.apiBase}/interview/${encodeURIComponent(input.interviewId)}/transcribe`,
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
