import { NextResponse, type NextRequest } from 'next/server';

/**
 * 服务端路由鉴权门(Edge Middleware):访问受保护路由时,**没有 httpOnly mw_token cookie → 服务端重定向到 /login**。
 * 这是 App Router 的服务端能力:在请求到达页面前就拦截,受保护页连 HTML 都不渲染给未登录者。
 */
const PROTECTED = ['/dashboard', '/resume', '/interviews', '/interview', '/report', '/settings', '/notifications', '/billing', '/admin', '/privacy', '/roles', '/jobs', '/recruiter'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (needsAuth && !req.cookies.get('mw_token')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);   // 登录后可回跳
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/resume/:path*', '/interviews/:path*', '/interview/:path*', '/report/:path*', '/settings/:path*', '/notifications/:path*', '/billing/:path*', '/admin/:path*', '/privacy/:path*', '/roles/:path*', '/jobs/:path*', '/recruiter/:path*'],
};
