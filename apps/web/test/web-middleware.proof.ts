/**
 * Web 中间件行为性证明（审计：原 ecs-preview-config.proof.mjs 只做字符串存在性断言=假绿）。
 * 真实构造 NextRequest 调 middleware()，断言：预览只读(非安全方法 503 / 非展示路径 404)、
 * 身份头剥离、正常模式鉴权重定向、非法预览值 fail-closed 抛错、matcher 全量。
 *   pnpm -C apps/web prove:middleware
 */
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { middleware, resolvePublicPreview, stripClientIdentityHeaders, config } from '../middleware.ts';

let assertions = 0;
function equal(actual: unknown, expected: unknown, label: string) {
  assertions += 1;
  assert.equal(actual, expected, label);
}

function req(method: string, path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`https://preview.test${path}`, { method, headers });
}

async function main() {
  // 1. fail-closed 解析
  equal(resolvePublicPreview(undefined), false, 'missing env → non-preview');
  equal(resolvePublicPreview('0'), false, "'0' → non-preview");
  equal(resolvePublicPreview('1'), true, "'1' → preview");
  for (const invalid of ['', '01', 'true', ' 1', '1 ', '2']) {
    assertions += 1;
    assert.throws(() => resolvePublicPreview(invalid), /invalid_meetwise_public_preview/, `invalid preview env '${invalid}' throws`);
  }

  // 2. 身份头剥离（纯函数行为）
  const stripped = stripClientIdentityHeaders(new Headers({
    authorization: 'Bearer x',
    cookie: 'mw_token=t',
    'x-forwarded-for': '1.2.3.4',
    'x-forwarded-host': 'evil.test',
    'x-forwarded-proto': 'https',
    'x-forwarded-port': '443',
    'x-real-ip': '5.6.7.8',
    forwarded: 'for=1.2.3.4',
    'cf-connecting-ip': '9.9.9.9',
    'true-client-ip': '8.8.8.8',
    'x-custom-keep': 'kept',
  }));
  equal([...stripped.keys()].sort().join(','), 'x-custom-keep', 'all spoofable identity headers removed, innocuous header kept');

  // 3. matcher 全量（否则非受保护路径会绕过只读门）
  equal(config.matcher, '/:path*', 'matcher is full-path');

  // 4. 预览模式：只读 + 路径门
  process.env.MEETWISE_PUBLIC_PREVIEW = '1';
  let res = middleware(req('POST', '/'));
  equal(res.status, 503, 'preview POST → 503');
  equal((await res.json()).error, 'public_preview_read_only', 'preview POST uses the fixed read-only error');
  for (const m of ['PUT', 'PATCH', 'DELETE']) {
    equal(middleware(req(m, '/')).status, 503, `preview ${m} → 503`);
  }
  res = middleware(req('GET', '/api/interview'));
  equal(res.status, 404, 'preview GET non-display /api → 404');
  equal((await res.json()).error, 'public_preview_path_unavailable', 'preview non-display path uses the fixed error');
  equal(middleware(req('GET', '/')).status, 200, 'preview GET / (display path) passes');
  equal(middleware(req('GET', '/features')).status, 200, 'preview GET /features passes');
  equal(middleware(req('OPTIONS', '/')).status, 200, 'preview OPTIONS passes');

  // 5. 正常模式：鉴权重定向 + 未受保护放行
  process.env.MEETWISE_PUBLIC_PREVIEW = '0';
  const auth = middleware(req('GET', '/dashboard'));
  equal(auth.status, 307, 'normal GET /dashboard without cookie → redirect');
  const location = new URL(auth.headers.get('location')!, 'http://x');
  equal(location.pathname, '/login', 'redirects to /login');
  equal(location.searchParams.get('next'), '/dashboard', 'preserves next path');
  equal(middleware(req('GET', '/')).status, 200, 'normal GET / passes');
  equal(middleware(req('GET', '/api/interview')).status, 200, 'normal GET /api passes (page auth is cookie-based, API has its own gate)');

  // 6. 非法预览值 fail-closed（绝不静默回退完整写应用）
  process.env.MEETWISE_PUBLIC_PREVIEW = 'true';
  assertions += 1;
  assert.throws(() => middleware(req('GET', '/')), /invalid_meetwise_public_preview/, 'invalid preview env makes middleware fail closed');

  delete process.env.MEETWISE_PUBLIC_PREVIEW;
  console.log(`✓ web middleware behavioral proof passed (${assertions} assertions; releaseEvidence=false)`);
}

main().catch((error) => { console.error(error); process.exit(1); });
