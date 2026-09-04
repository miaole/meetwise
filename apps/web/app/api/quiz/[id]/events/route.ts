import { getServerToken } from '../../../../../lib/api/server';
import { sseProxyFailureResponse } from '../../../../../lib/stream/sse-cursor';

/**
 * 同源 SSE 代理(押题事件流)。浏览器同源自动带 httpOnly cookie → 本路由服务端读令牌 → 加 Bearer 透传上游 api 的 SSE 流。
 * client 因此无需(也读不到)令牌,鉴权是真的。对齐 /api/interview/[id]/events。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return new Response('unauthorized', { status: 401 });
  const headers: Record<string, string> = { authorization: `Bearer ${token}`, accept: 'text/event-stream' };
  const lastEventId = req.headers.get('last-event-id');
  if (lastEventId) headers['last-event-id'] = lastEventId;     // 续传水位透传
  const upstream = await fetch(`${API}/quiz/${encodeURIComponent(id)}/events`, { headers, signal: req.signal });
  if (!upstream.ok || !upstream.body) return sseProxyFailureResponse(upstream);
  return new Response(upstream.body, {                          // 透传 SSE 流(ReadableStream)
    status: 200,
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
  });
}
