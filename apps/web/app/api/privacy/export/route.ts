import { getServerToken } from '@/lib/api/server';

/** 同源数据导出代理(PIPL 可携权):服务端读 httpOnly cookie 加 Bearer → 拉 /privacy/export → 以附件 JSON 返回下载。 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function GET() {
  const token = await getServerToken();
  if (!token) return new Response('unauthorized', { status: 401 });
  const upstream = await fetch(`${API}/privacy/export`, { headers: { authorization: `Bearer ${token}` } });
  if (!upstream.ok) return new Response('export_unavailable', { status: upstream.status || 502 });
  const body = await upstream.text();
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': 'attachment; filename="meetwise-my-data.json"' },
  });
}
