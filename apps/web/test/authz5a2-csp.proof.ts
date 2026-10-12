/**
 * AUTHZ-HARDEN 5A-2 #67 CSP 证明(两形·席2 R3 处方:静态源断言+响应头探针):
 *   ①静态源形——next.config.mjs 无 script-src 'unsafe-inline'(静态 CSP 头整体移除·注释如实化);
 *     middleware.ts nonce 形在位;page.tsx 自持内联脚本(JSON-LD)x-nonce 接线在位。
 *   ②响应头探针形——真实构造 NextRequest 调 middleware(),断言全部出口(放行/重定向/preview 503/404)
 *     响应均携带 Content-Security-Policy,值为 nonce 形(script-src 'nonce-…' 'strict-dynamic'·无
 *     unsafe-inline),且每请求 nonce 唯一;x-nonce 请求头随 NextResponse.next 下发(自持内联脚本取用)。
 * est live=0(纯本地单测·零外呼)。
 *   pnpm -C apps/web prove:authz5a2-csp
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { NextRequest } from 'next/server';
import { buildContentSecurityPolicy, middleware } from '../middleware.ts';

const here = dirname(fileURLToPath(import.meta.url));
const read = (p: string) => readFileSync(join(here, '..', p), 'utf8');

let assertions = 0;
function ok(cond: boolean, label: string) {
  assertions += 1;
  assert.ok(cond, label);
  console.log(`PASS  ${label}`);
}

function req(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://127.0.0.1:3000${path}`, {
    method: 'GET',
    headers: { host: 'csp.test', 'x-forwarded-host': 'csp.test', 'x-forwarded-proto': 'https', ...headers },
  });
}

async function main() {
  // ── 形一:静态源断言 ──
  const nextConfig = read('next.config.mjs');
  ok(!nextConfig.includes("'unsafe-inline'"), 'static: next.config.mjs 全文零 unsafe-inline(script-src 旧静态 CSP 已移除)');
  ok(!/Content-Security-Policy.*value:/.test(nextConfig), 'static: next.config.mjs 不再静态设置 CSP 响应头(防双头交集击穿)');
  ok(nextConfig.includes('#67'), 'static: next.config.mjs 失实注释已如实化(#67 勘误注在位)');

  const middlewareSrc = read('middleware.ts');
  ok(middlewareSrc.includes("'strict-dynamic'"), 'static: middleware nonce 形在位(strict-dynamic)');
  ok(!middlewareSrc.includes('script-src') || !/script-src[^;\n]*'unsafe-inline'/.test(middlewareSrc), 'static: middleware script-src 无 unsafe-inline');
  ok(middlewareSrc.includes('x-nonce'), 'static: x-nonce 请求头接线在位(自持内联脚本取用)');

  const pageSrc = read('app/page.tsx');
  ok(/<script[^>]*application\/ld\+json[^>]*nonce=\{nonce\}/.test(pageSrc), 'static: page.tsx JSON-LD 内联脚本 nonce 接线在位');

  // ── 形二:响应头探针(真 NextRequest → middleware 全出口) ──
  delete process.env.MEETWISE_PUBLIC_PREVIEW;   // 正常模式(空串是非法 preview 值·fail-closed)

  const pass = middleware(req('/'));   // 公开路径放行出口
  let csp = pass.headers.get('content-security-policy');
  ok(!!csp, 'probe: 放行出口带 Content-Security-Policy 响应头');
  ok(/script-src 'self' 'nonce-[0-9a-f-]{36}' 'strict-dynamic'/.test(csp ?? ''), 'probe: script-src=nonce 形+strict-dynamic(无 unsafe-inline)');
  const scriptSeg = (csp ?? '').split(';').map((s) => s.trim()).find((s) => s.startsWith('script-src')) ?? '';
  ok(!scriptSeg.includes('unsafe-inline'), 'probe: script-src 段零 unsafe-inline(style-src 保留属样式面·设计内)');
  ok(/style-src 'self' 'unsafe-inline'/.test(csp ?? ''), 'probe: style-src 保留 unsafe-inline(仅样式面·Tailwind)');
  ok(/frame-ancestors 'none'/.test(csp ?? ''), 'probe: frame-ancestors none 保留(防点击劫持零回退)');

  const redirect = middleware(req('/dashboard'));   // 未登录重定向出口
  ok(redirect.status === 307 && !!redirect.headers.get('content-security-policy'), 'probe: 重定向出口同样携带 CSP 响应头');

  // nonce 每请求唯一(防跨请求重放同一 nonce)
  const a = middleware(req('/')).headers.get('content-security-policy') ?? '';
  const b = middleware(req('/')).headers.get('content-security-policy') ?? '';
  ok(a !== b, 'probe: 两请求 nonce 互不相同(每请求随机)');

  // preview 只读出口(503/404/next)零豁免
  process.env.MEETWISE_PUBLIC_PREVIEW = '1';
  const p503 = middleware(reqWithMethod('POST', '/'));
  ok(p503.status === 503 && !!p503.headers.get('content-security-policy'), 'probe: preview 503 出口携带 CSP(公开面零豁免)');
  const p404 = middleware(req('/private'));
  ok(p404.status === 404 && !!p404.headers.get('content-security-policy'), 'probe: preview 404 出口携带 CSP');
  delete process.env.MEETWISE_PUBLIC_PREVIEW;

  // dev 形不进生产:NODE_ENV=production 无 unsafe-eval
  ok(!buildContentSecurityPolicy('n', false).includes('unsafe-eval'), 'probe: 生产形零 unsafe-eval');
  ok(buildContentSecurityPolicy('n', true).includes('unsafe-eval'), 'probe: dev 形带 unsafe-eval(仅非生产)');

  console.log(`\n✓ authz5a2:csp — ${assertions} 断言全绿`);
  process.exit(0);
}

function reqWithMethod(method: string, path: string) {
  return new NextRequest(`http://127.0.0.1:3000${path}`, {
    method,
    headers: { host: 'csp.test', 'x-forwarded-host': 'csp.test', 'x-forwarded-proto': 'https' },
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
