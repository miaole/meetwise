import { getServerToken, upstreamUrl } from '../../../../../lib/api/server';
import { sseProxyFailureResponse } from '../../../../../lib/stream/sse-cursor';
import { openInterviewEventsUpstream } from '../../../../../lib/api/events-proxy';

/**
 * 同源 SSE 代理(修审计 P0:面试流原来硬编码 x-user-id:'demo' 未鉴权)。
 * 浏览器同源自动带 httpOnly cookie → 本路由服务端读令牌 → 加 Bearer 透传上游 api 的 SSE 流。
 * client 因此无需(也读不到)令牌,鉴权是真的。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
// #66/API-HARDEN-A:上游打开首包超时帽(仅到响应头;SSE 流体不设整体超时)。
const SSE_TTFB_TIMEOUT_MS = Number(process.env.PROXY_SSE_TTFB_TIMEOUT_MS ?? 10_000) || 10_000;
  if (!upstream.ok || !upstream.body) return sseProxyFailureResponse(upstream);
  return new Response(upstream.body, {                          // 透传 SSE 流(ReadableStream)
    status: 200,
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
  });
}
