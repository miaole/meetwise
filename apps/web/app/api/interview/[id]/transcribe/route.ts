import { getServerToken } from '../../../../../lib/api/server';
import { proxyInterviewTranscribe } from '../../../../../lib/api/transcribe-proxy';

/**
 * 同源语音转写代理:与 /turn 同模式——服务端读 httpOnly cookie 加 Bearer 转发到 api 的 /interview/:id/transcribe。
 * client 拿不到(也读不到)令牌,鉴权是真的。api 端 ASR 未配置/失败会回 503/502,前端据此降级回文字作答。
 * #66/API-HARDEN-A:上游网络失败/超时收敛 502 upstream_unavailable JSON(缝内 catch);超时帽可 env 覆写
 * (PROXY_TRANSCRIBE_TIMEOUT_MS,默认 60000:录音侧硬上限 60s + provider ASR 处理余量;客户端取消仍即时终止上游)。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
const TRANSCRIBE_TIMEOUT_MS = Number(process.env.PROXY_TRANSCRIBE_TIMEOUT_MS ?? 60_000) || 60_000;
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.text();
  return await proxyInterviewTranscribe({
    apiBase: API,
    interviewId: id,
    bearerToken: token,
    body,
    signal: req.signal,
    timeoutMs: TRANSCRIBE_TIMEOUT_MS,
  });
}
