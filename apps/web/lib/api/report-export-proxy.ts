/**
 * 同源报告导出代理 seam(#257):浏览器 GET 无法带 Authorization(API 端只认 Bearer),
 * 由服务端路由读 httpOnly cookie 把令牌转成 Bearer 转发上游,markdown 附件原样透传。
 * fetchImpl 注入沿 transcribe-proxy 形——proof 可离线断言代理合同(不真连上游)。
 */
export async function proxyReportExport(input: {
  apiBase: string;
  interviewId: string;
  bearerToken: string | undefined;
  fetchImpl?: typeof fetch;
}): Promise<Response> {
  // 无 token(未登录/令牌缺失)→ 401 fail-closed:绝不无凭转发上游(与 privacy/export 壳内判同语义,单一出处收进 lib 便于离线证明)。
  if (!input.bearerToken) return new Response('unauthorized', { status: 401 });
  const upstream = await (input.fetchImpl ?? fetch)(
    `${input.apiBase}/interview/${encodeURIComponent(input.interviewId)}/report/export`,
    { headers: { authorization: `Bearer ${input.bearerToken}` } },
  );
  // 上游 !ok(未就绪 404 report_not_ready / 429 等)→ status 透传,不吞不降级(页面如实呈现失败面)。
  if (!upstream.ok) return new Response('report_export_unavailable', { status: upstream.status || 502 });
  const body = await upstream.text();
  return new Response(body, {
    status: 200,
    headers: { 'content-type': 'text/markdown; charset=utf-8', 'content-disposition': 'attachment; filename="meetwise-interview-report.md"' },
  });
}
