import { getServerToken } from '../../../../lib/api/server';

/**
 * 同源 GET 代理(简历诊断详情)。浏览器同源自动带 httpOnly cookie → 本路由服务端读令牌 → 加 Bearer 透传上游 api 的 GET /diagnosis/:id(report jsonb 整体返回,RLS: 越权→404)。镜像同目录 events/route.ts 形制。
 * #213 diag-honesty 修法①:SSE 事件族/终态只带摘要计数(无 rejectedCount),panel ready 后经本路由取报告详情,补「已剔除 N 条无依据结论」如实展示。零后端 API 改(透传既有 diagnosis.service.get)。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getServerToken();
  if (!token) return new Response('unauthorized', { status: 401 });
  const upstream = await fetch(`${API}/diagnosis/${encodeURIComponent(id)}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    cache: 'no-store',   // 用户态数据不缓存
  });
  if (!upstream.ok) return new Response(upstream.statusText || 'upstream_unavailable', { status: upstream.status });
  return new Response(upstream.body, { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
