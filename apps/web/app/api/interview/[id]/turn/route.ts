import { getServerToken } from '../../../../../lib/api/server';
import { proxyInterviewTurn } from '../../../../../lib/api/turn-proxy';

/**
 * 同源答题代理(修审计 P0/#2:原来裸 fetch /turn 带 x-user-id:'demo'、无幂等键)。
 * 服务端读 cookie 加 Bearer + 透传客户端稳定幂等键。缺 key fail-closed，绝不生成按 resultId 的共享兜底键。
 * #66/API-HARDEN-A:上游网络失败/超时收敛 502 upstream_unavailable JSON(缝内 catch,不再漏成 Next 500);
 * 上游 HTTP 应答(含 429/409)原样透传零改写。超时帽可 env 覆写(PROXY_TURN_TIMEOUT_MS,默认 15000:
 * /turn 为 202 入队快路径,正常亚秒返回,15s 已含慢库/慢队列余量;客户端取消仍即时终止上游)。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
const TURN_TIMEOUT_MS = Number(process.env.PROXY_TURN_TIMEOUT_MS ?? 15_000) || 15_000;
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.text();
  const idem = req.headers.get('idempotency-key');
  if (!idem) return Response.json({ error: 'missing_idempotency_key' }, { status: 400 });
  return await proxyInterviewTurn({
    apiBase: API,
    interviewId: id,
    bearerToken: token,
    body,
    idempotencyKey: idem,
    signal: req.signal,
    timeoutMs: TURN_TIMEOUT_MS,
  });
}
