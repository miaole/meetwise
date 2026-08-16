import { NextRequest, NextResponse } from 'next/server';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const displayPaths = new Set(['/', '/features', '/faq', '/legal']);
const protectedPaths = ['/dashboard', '/resume', '/interviews', '/interview', '/report', '/settings', '/notifications', '/billing', '/admin', '/privacy', '/roles', '/jobs', '/recruiter'];

function isDisplayPath(pathname: string) {
  return displayPaths.has(pathname) || pathname.startsWith('/_next/static/');
}

/**
 * Nginx is the authoritative public ingress gate. This second gate keeps a
 * mistaken proxy rule or future listener from exposing an account, API, or
 * Server Action when the Web process is explicitly launched in preview mode.
 */
export function middleware(request: NextRequest) {
  if (process.env.MEETWISE_PUBLIC_PREVIEW === '1') {
    if (!safeMethods.has(request.method)) {
      return NextResponse.json({ error: 'public_preview_read_only' }, { status: 503 });
    }
    if (!isDisplayPath(request.nextUrl.pathname)) {
      return NextResponse.json({ error: 'public_preview_path_unavailable' }, { status: 404 });
    }

    const headers = new Headers(request.headers);
    headers.delete('authorization');
    headers.delete('cookie');
    headers.delete('x-forwarded-for');
    headers.delete('x-forwarded-host');
    return NextResponse.next({ request: { headers } });
  }

  const { pathname } = request.nextUrl;
  const needsAuth = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!needsAuth || request.cookies.get('mw_token')) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: '/:path*' };
