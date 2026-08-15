import { getServerToken } from '@/lib/api/server';

/**
 * 同源流式 TTS 代理(全程电话模式低延迟):服务端读 httpOnly cookie 加 Bearer → 转发题面文本给 api 的流式合成端点,
 * **直通**上游 audio/mpeg chunked 流(不缓冲整段),客户端用 MSE 渐进播放,首音 ~1-2s(对比非流式整段 ~9s)。
 * 上游非 200(未配置 503 / 失败 502 / 越权 404)→ 原样透传状态码,客户端凭此干净回落非流式 /speak(无死胡同)。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.text();
  let upstream: Response;
  try {
    upstream = await fetch(`${API}/interview/${encodeURIComponent(id)}/speak/stream`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body,
      signal: req.signal,   // 客户端 barge-in/挂断 abort → 透传到 api → req.raw 'close' → 关上游 cosyvoice WS(不漏连接)
    });
  } catch {
    return Response.json({ error: 'tts_stream_unreachable' }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    return new Response(text || JSON.stringify({ error: 'tts_stream_unavailable' }), {
      status: upstream.status || 502,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }
  // 直通 ReadableStream:边收边发,首块即达即播
  return new Response(upstream.body, {
    status: 200,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'audio/mpeg', 'cache-control': 'no-cache' },
  });
}
