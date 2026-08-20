import { NextResponse, type NextRequest } from 'next/server';

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

/**
 * fail-closed 预览模式解析：只有精确 '1' 才启用预览；任何其它非空值（'true'/'01'/'1 ' 等）抛错，
 * 而不是静默回退到完整写应用（与 apps/api/src/platform/public-preview.ts 的 resolvePublicPreviewMode 对齐）。
 */
export function resolvePublicPreview(raw: string | undefined): boolean {
  if (raw === undefined || raw === '0') return false;
  if (raw === '1') return true;
  throw new Error('invalid_meetwise_public_preview');
}

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
  if (resolvePublicPreview(process.env.MEETWISE_PUBLIC_PREVIEW)) {
    if (!safeMethods.has(request.method)) {
      return NextResponse.json({ error: 'public_preview_read_only' }, { status: 503 });
    }
    if (!isDisplayPath(request.nextUrl.pathname)) {
      return NextResponse.json({ error: 'public_preview_path_unavailable' }, { status: 404 });
    }
    // 预览模式剥离可伪造/可携带身份的头，避免向前透传越权上下文。
    return NextResponse.next({ request: { headers: stripClientIdentityHeaders(request.headers) } });
  }

  const { pathname } = request.nextUrl;
  const needsAuth = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (needsAuth && !request.cookies.get('mw_token')) {
    return NextResponse.redirect(authRedirectUrl(request, pathname));
  }
  return NextResponse.next();
}

// 预览门须拦截全部路径（否则非受保护路径会绕过只读门），故 matcher 收敛为全量，auth 门在函数内按 needsAuth 分支。
export const config = { matcher: '/:path*' };
