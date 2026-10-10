/**
 * #257 同源报告导出代理合同证明(离线·注入 fetchImpl,沿 transcribe-proxy.proof 形):
 *   ① 无 token → 401 fail-closed(不无凭转发上游);
 *   ② 有 token → 上游 URL = apiBase + /interview/{id}/report/export 且带 authorization: Bearer 头;
 *   ③ 上游 200 markdown → 200 + text/markdown + attachment 透传;上游 404 → 404 透传(不吞不降级)。
 *   pnpm -C apps/web prove:report-export-proxy
 */
import { proxyReportExport } from '../lib/api/report-export-proxy.ts';

let failures = 0;
const assert = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

type Observed = { url: string; headers: Record<string, string> };

async function main() {
  // ① 无 token → 401,且上游零调用(fetchImpl 注入 spy:被调用即记录)。
  const spyNever: { calls: Observed[] } = { calls: [] };
  const r401 = await proxyReportExport({
    apiBase: 'http://api.internal',
    interviewId: 'iv-1',
    bearerToken: undefined,
    fetchImpl: (async (url: string | URL | Request, init?: RequestInit) => {
      spyNever.calls.push({ url: String(url), headers: (init?.headers ?? {}) as Record<string, string> });
      return new Response('{}', { status: 200 });
    }) as typeof fetch,
  });
  assert('无 token → 401 fail-closed(上游零调用,不无凭转发)', r401.status === 401 && spyNever.calls.length === 0);

  // ② 有 token → 上游收到 Bearer 头,URL = 内部 base + /interview/{id}/report/export(id 经 encodeURIComponent)。
  const observed: Observed[] = [];
  const r200 = await proxyReportExport({
    apiBase: 'http://api.internal',
    interviewId: 'iv 42',
    bearerToken: 'test-token',
    fetchImpl: (async (url: string | URL | Request, init?: RequestInit) => {
      observed.push({ url: String(url), headers: (init?.headers ?? {}) as Record<string, string> });
      return new Response('# 报告\n正文', { status: 200, headers: { 'content-type': 'text/markdown; charset=utf-8' } });
    }) as typeof fetch,
  });
  const up = observed[0];
  assert('上游 URL=内部 base+/interview/{id}/report/export(id 编码)', up?.url === 'http://api.internal/interview/iv%2042/report/export');
  assert('上游收到 authorization: Bearer 头(cookie→Bearer 转换)', up?.headers['authorization'] === 'Bearer test-token');

  // ③a 上游 200 markdown → 200 + text/markdown + attachment + body 原样透传。
  const body200 = await r200.text();
  assert('上游 200 → 200 + text/markdown; charset=utf-8 + attachment 附件头',
    r200.status === 200
    && r200.headers.get('content-type') === 'text/markdown; charset=utf-8'
    && (r200.headers.get('content-disposition') ?? '').startsWith('attachment;'));
  assert('markdown body 原样透传', body200 === '# 报告\n正文');

  // ③b 上游 404(report_not_ready 未就绪)→ 404 透传。
  const r404 = await proxyReportExport({
    apiBase: 'http://api.internal',
    interviewId: 'iv-1',
    bearerToken: 'test-token',
    fetchImpl: (async () => new Response(JSON.stringify({ error: 'report_not_ready' }), { status: 404 })) as typeof fetch,
  });
  assert('上游 404 report_not_ready → 404 透传(不吞不降级)', r404.status === 404);

  console.log(`\n${failures === 0 ? '✓ 报告导出同源代理合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();
