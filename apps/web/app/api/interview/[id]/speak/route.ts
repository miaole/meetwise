import { getServerToken } from '@/lib/api/server';

/** 同源 TTS 代理(全程电话模式):服务端读 httpOnly cookie 加 Bearer → 转发题目文本给 api 合成语音。 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.text();
  const upstream = await fetch(`${API}/interview/${encodeURIComponent(id)}/speak`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body,
  });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' } });
}
