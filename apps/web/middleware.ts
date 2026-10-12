import { NextResponse, type NextRequest } from 'next/server';
/** 与 API resolvePublicPreviewMode 对齐：仅精确 '1' 启用预览，未知值 fail-closed。 */
import { resolvePublicPreview } from './lib/public-preview';

export { resolvePublicPreview } from './lib/public-preview';

// ── AUTHZ-HARDEN 5A-2 #67 CSP nonce 形（裁决项⑦：nonce·Next 中间件形）────────────────
// script-src 去内联放行（unsafe-inline 字面量禁入本文件·静态断言承重）：每请求随机 nonce +
// 'strict-dynamic'（Next 运行时注入的 chunk 脚本由 nonce 引导的加载器放行，CSP3 浏览器下
// 'self' 对 script 失效属预期收窄）。
// 接线三形：①响应头形——Content-Security-Policy 由本中间件统一设在响应（next.config.mjs
// headers() 不再承载 CSP，防双头交集互相击穿）；②请求头形——请求头带 CSP 时 Next App Router
// 自动向其内联脚本（RSC flight/水合）补同一 nonce；③自持内联脚本形——x-nonce 请求头供页面
// （app/page.tsx JSON-LD）显式接线。dev 另放 'unsafe-eval'（Next dev 编译需要；生产零放宽）。
export function buildContentSecurityPolicy(nonce: string, isDev = process.env.NODE_ENV !== 'production') {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",   // Tailwind 内联样式（原策略保留；仅样式面，脚本面不回退）
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

/** 给响应补 CSP 响应头（#67 响应头形唯一设置点）。 */
function withCspHeader(res: NextResponse, csp: string): NextResponse {
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

/**
 * 服务端路由门(Edge Middleware)，两层：
 * 1. 公开预览模式（MEETWISE_PUBLIC_PREVIEW='1'）：只读，仅 GET/HEAD/OPTIONS 且仅允许公开展示页。
 *    Nginx 是权威入站门；这里是防代理配置错误或未来监听器暴露账号/API/Server Action 的第二道栅栏（见 ADR-0021 / UC-ecs-public-preview-web-ingress）。
 *    预览展示页集合须与 nginx 方法/路径 allowlist 一致（仅首页与 features/faq/legal）。
 * 2. 正常模式：受保护路由无 httpOnly mw_token cookie → 服务端重定向到 /login，受保护页连 HTML 都不渲染给未登录者。
 */
const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const displayPaths = new Set(['/', '/features', '/faq', '/legal']);

function isDisplayPath(pathname: string) {
  return displayPaths.has(pathname) || pathname.startsWith('/_next/static/');
}

const protectedPaths = ['/dashboard', '/resume', '/interviews', '/interview', '/report', '/settings', '/notifications', '/billing', '/admin', '/privacy', '/roles', '/jobs', '/recruiter'];

/** 预览模式需剥离的完整可伪造客户端身份/协议头集合（审计：补齐 x-real-ip/forwarded/cf-connecting-ip/true-client-ip/x-forwarded-proto）。 */
const STRIPPED_HEADERS = [
  'authorization',
  'cookie',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-forwarded-port',
  'x-real-ip',
  'forwarded',
  'cf-connecting-ip',
  'true-client-ip',
];

/** 返回剥离了可伪造身份/协议头后的副本，原 Headers 不变（供行为性证明直接断言）。 */
export function stripClientIdentityHeaders(headers: Headers): Headers {
  const next = new Headers(headers);
  for (const name of STRIPPED_HEADERS) next.delete(name);
  return next;
}

/**
 * 只返回同源相对地址，避免 Next 在反向代理后用内部的 localhost:3000
 * 生成绝对 Location，导致公网用户被重定向到自己的本机。
 */
export function authRedirectLocation(pathname: string): string {
  return `/login?next=${encodeURIComponent(pathname)}`;
}

export function authRedirectUrl(request: NextRequest, pathname: string): URL {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto');
  if (!host || !/^[a-z0-9.-]+(?::[0-9]{1,5})?$/i.test(host)) {
    throw new Error('invalid_forwarded_host');
  }
  if (proto !== 'http' && proto !== 'https') {
    throw new Error('invalid_forwarded_proto');
  }
  return new URL(authRedirectLocation(pathname), `${proto}://${host}`);
}

export function middleware(request: NextRequest) {
  // #67：每请求 nonce + CSP（响应头形+请求头形）；preview 只读分支的 503/404 也照设（公开面零豁免）。
  const nonce = crypto.randomUUID();
  const csp = buildContentSecurityPolicy(nonce);

  if (resolvePublicPreview(process.env.MEETWISE_PUBLIC_PREVIEW)) {
    if (!safeMethods.has(request.method)) {
      return withCspHeader(NextResponse.json({ error: 'public_preview_read_only' }, { status: 503 }), csp);
    }
    if (!isDisplayPath(request.nextUrl.pathname)) {
      return withCspHeader(NextResponse.json({ error: 'public_preview_path_unavailable' }, { status: 404 }), csp);
    }
    // 预览模式剥离可伪造/可携带身份的头，避免向前透传越权上下文。
    const stripped = stripClientIdentityHeaders(request.headers);
    stripped.set('x-nonce', nonce);
    stripped.set('Content-Security-Policy', csp);
    return withCspHeader(NextResponse.next({ request: { headers: stripped } }), csp);
  }

  const { pathname } = request.nextUrl;
  const needsAuth = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (needsAuth && !request.cookies.get('mw_token')) {
    return withCspHeader(NextResponse.redirect(authRedirectUrl(request, pathname)), csp);
  }
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set('x-nonce', nonce);
  reqHeaders.set('Content-Security-Policy', csp);   // 请求头带 CSP → Next 自动给自家内联脚本补同一 nonce
  return withCspHeader(NextResponse.next({ request: { headers: reqHeaders } }), csp);
}

// 预览门须拦截全部路径（否则非受保护路径会绕过只读门），故 matcher 收敛为全量，auth 门在函数内按 needsAuth 分支。
export const config = { matcher: '/:path*' };
