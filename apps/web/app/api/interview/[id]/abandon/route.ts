import { getServerToken } from '../../../../../lib/api/server';

/**
 * 同源放弃代理（UC-E2E-018 §1b #5 · GAP-UC018-UI）：
 * 浏览器点「放弃」→ 本路由读 httpOnly cookie 加 Bearer → 转发 API POST /interview/:id/abandon。
 * 合同与 HTTP prove 相同：abandoned + released（released|noop）· irreversible · 不可 resume。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const upstream = await fetch(`${API}/interview/${encodeURIComponent(id)}/abandon`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: '{}',
  });
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
