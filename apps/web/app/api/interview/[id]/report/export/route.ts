import { getServerToken } from '@/lib/api/server';
import { proxyReportExport } from '@/lib/api/report-export-proxy';

/**
 * 同源报告导出代理(#257):服务端读 httpOnly cookie 加 Bearer 转发 /interview/:id/report/export,
 * 以 markdown 附件返回下载。修浏览器直拼 API base 的导出 <a>(GET 无 Authorization 头 → API 401)。
 * 逐形先例:privacy/export/route.ts;处理体抽 lib(形 A)沿 transcribe-proxy 注入 fetchImpl 可证。
 */
const API = process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8787';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return await proxyReportExport({ apiBase: API, interviewId: id, bearerToken: await getServerToken() });
}
