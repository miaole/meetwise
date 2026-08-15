import { getServerToken } from '../../../../../lib/api/server';
import { proxyInterviewTranscribe } from '../../../../../lib/api/transcribe-proxy';

/**
 * 同源语音转写代理:与 /turn 同模式——服务端读 httpOnly cookie 加 Bearer 转发到 api 的 /interview/:id/transcribe。
 * client 拿不到(也读不到)令牌,鉴权是真的。api 端 ASR 未配置/失败会回 503/502,前端据此降级回文字作答。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
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
  });
}
