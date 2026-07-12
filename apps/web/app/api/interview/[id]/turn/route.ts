import { getServerToken } from '../../../../../lib/api/server';

/**
 * 同源答题代理(修审计 P0/#2:原来裸 fetch /turn 带 x-user-id:'demo'、无幂等键)。
 * 服务端读 cookie 加 Bearer + 透传 idempotency-key(client 传稳定键 = resultId:turn:N → 重试不重复评估)。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.text();
  const idem = req.headers.get('idempotency-key') ?? `${id}:turn`;   // client 应传稳定键;兜底
  const upstream = await fetch(`${API}/interview/${encodeURIComponent(id)}/turn`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'idempotency-key': idem },
    body,
  });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' } });
}
