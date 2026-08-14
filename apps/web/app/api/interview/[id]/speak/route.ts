import { getServerToken } from '@/lib/api/server';
import { proxyInterviewSpeak } from '@/lib/api/speak-proxy';

/** 同源 TTS 代理(全程电话模式):服务端读 httpOnly cookie 加 Bearer → 转发题目文本给 api 合成语音。 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.text();
  return await proxyInterviewSpeak({
    apiBase: API,
    interviewId: id,
    bearerToken: token,
    body,
    signal: req.signal,
  });
}
