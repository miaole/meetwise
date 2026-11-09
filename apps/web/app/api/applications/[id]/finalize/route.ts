import { getServerToken, upstreamUrl } from '../../../../../lib/api/server';

export const dynamic = 'force-dynamic';

/**
 * 同源岗位结果确认代理。浏览器只给 applicationId；上游 strict DTO 拒绝 interviewId，
 * 因此无法把任意 C 端历史会话塞给招聘岗位。
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const upstream = await fetch(upstreamUrl(`/applications/${encodeURIComponent(id)}/finalize`), {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: '{}',
  });
  const text = await upstream.text();
  return new Response(text, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' } });
}
