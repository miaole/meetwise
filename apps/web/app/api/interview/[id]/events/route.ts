import { getServerToken } from '../../../../../lib/api/server';
import { sseProxyFailureResponse } from '../../../../../lib/stream/sse-cursor';

/**
 * 同源 SSE 代理(修审计 P0:面试流原来硬编码 x-user-id:'demo' 未鉴权)。
 * 浏览器同源自动带 httpOnly cookie → 本路由服务端读令牌 → 加 Bearer 透传上游 api 的 SSE 流。
 * client 因此无需(也读不到)令牌,鉴权是真的。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

const STRESS_ID = '__e2e_stream_stress__';
const STRESS_TURNS = 10_000;

/**
 * Hermetic browser-only pressure source. It is unavailable unless the e2e runner explicitly enables it, still
 * requires the normal httpOnly session, and contains no production/user data. It exercises the actual SSE decoder,
 * reducer, rAF bridge and InterviewPanel DOM window instead of calling a helper in isolation.
 */
function e2eStressStream(lastEventId: number, duplicateFrames: boolean): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const start = Math.max(1, lastEventId + 1);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (let batchStart = start; batchStart <= STRESS_TURNS; batchStart += 100) {
        const batchEnd = Math.min(STRESS_TURNS, batchStart + 99);
        let payload = '';
        for (let id = batchStart; id <= batchEnd; id++) {
          payload += `id: ${id}\nevent: question_ready\ndata: ${JSON.stringify({ question: `压力回放题 ${id}`, competency: 'stream-stress' })}\n\n`;
        }
        // Browser transport, proxies and reconnect glue may redeliver an
        // already persisted SSE frame.  The E2E-only source makes that race
        // reproducible without changing any production event semantics.
        controller.enqueue(encoder.encode(duplicateFrames ? payload + payload : payload));
      }
      if (lastEventId < STRESS_TURNS + 1) {
        const terminal = `id: ${STRESS_TURNS + 1}\nevent: report_ready\ndata: {"overall":88}\n\n`;
        controller.enqueue(encoder.encode(duplicateFrames ? terminal + terminal : terminal));
      }
      controller.close();
    },
  });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return new Response('unauthorized', { status: 401 });
  const lastEventId = Number(req.headers.get('last-event-id') ?? '0') || 0;
  if (id === STRESS_ID && process.env.E2E_UI_STRESS === '1') {
    const duplicateFrames = new URL(req.url).searchParams.get('duplicateFrames') === '1';
    return new Response(e2eStressStream(lastEventId, duplicateFrames), {
      status: 200,
      headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
    });
  }
  const headers: Record<string, string> = { authorization: `Bearer ${token}`, accept: 'text/event-stream' };
  const lastEventIdHeader = req.headers.get('last-event-id');
  if (lastEventIdHeader) headers['last-event-id'] = lastEventIdHeader;     // 续传水位透传
  const upstream = await fetch(`${API}/interview/${encodeURIComponent(id)}/events`, { headers, signal: req.signal });
  if (!upstream.ok || !upstream.body) return sseProxyFailureResponse(upstream);
  return new Response(upstream.body, {                          // 透传 SSE 流(ReadableStream)
    status: 200,
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
  });
}
