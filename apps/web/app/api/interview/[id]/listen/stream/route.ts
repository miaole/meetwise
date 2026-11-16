import { getServerToken, upstreamUrl } from '@/lib/api/server';

/**
 * 同源流式 ASR 代理(全程电话模式低延迟·预览):浏览器 AudioWorklet 16k mono PCM 块经
 * **请求体流式直通**(fetch duplex half)转发给 api 的流式转写端点,**直通**上游
 * application/x-ndjson 事件流(不缓冲整段),客户端边录边收 partial/final,末句转写即所见。
 * 上游非 200(未配置/缺双旗 503 streaming_asr_not_configured / 失败 502 / 越权 404 / 无同意 403)
 * → 原样透传状态码,客户端凭此干净回落批量 /transcribe(无死胡同)。
 * 服务端不在本代理持久化任何音频或转写。
 */
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl(`/interview/${encodeURIComponent(id)}/listen/stream`), {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/octet-stream' },
      body: req.body,            // 请求体流式直通(duplex half):边录边传,不整段缓冲
      duplex: 'half',
      signal: req.signal,        // 客户端挂断/抢话 abort → 透传到 api → req.raw 'close' → 关上游 paraformer WS(不漏连接)
    } as RequestInit);
  } catch {
    return Response.json({ error: 'asr_stream_unreachable' }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    return new Response(text || JSON.stringify({ error: 'asr_stream_unavailable' }), {
      status: upstream.status || 502,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }
  // 直通 ReadableStream:边转写边发,partial 即达即显
  return new Response(upstream.body, {
    status: 200,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/x-ndjson', 'cache-control': 'no-cache' },
  });
}
