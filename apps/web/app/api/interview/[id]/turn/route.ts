import { getServerToken } from '../../../../../lib/api/server';

/**
 * 同源答题代理(修审计 P0/#2:原来裸 fetch /turn 带 x-user-id:'demo'、无幂等键)。
 * 服务端读 cookie 加 Bearer + 透传客户端稳定幂等键。缺 key fail-closed，绝不生成按 resultId 的共享兜底键。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.text();
  const idem = req.headers.get('idempotency-key');
  if (!idem) return Response.json({ error: 'missing_idempotency_key' }, { status: 400 });
  const upstream = await fetch(`${API}/interview/${encodeURIComponent(id)}/turn`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'idempotency-key': idem },
    body,
  });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' } });
}
