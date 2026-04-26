import { NextRequest, NextResponse } from 'next/server';
import { getDefaultAppRoute } from '@/lib/app-routes';

const PUBLIC_PATHS = ['/'];
const AUTH_PATHS = ['/login', '/register'];
const PLATFORM_DOMAIN = (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'localhost').toLowerCase();

const matchesPath = (pathname: string, paths: string[]) => paths.some(
  (path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)),
);

const getSubdomain = (hostname: string) => {
  const normalizedHostname = hostname.toLowerCase();

  if (
    !normalizedHostname
    || normalizedHostname === PLATFORM_DOMAIN
    || normalizedHostname === 'localhost'
    || normalizedHostname === '127.0.0.1'
  ) {
    return null;
  }

  if (normalizedHostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    return normalizedHostname.slice(0, -(PLATFORM_DOMAIN.length + 1));
  }

  return null;
};

const decodeAccessTokenRole = (token?: string) => {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as { role?: string };
    return payload.role || null;
  } catch {
    return null;
  }
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicPath = matchesPath(pathname, PUBLIC_PATHS);
  const isAuthPath = matchesPath(pathname, AUTH_PATHS);
  const accessToken = req.cookies.get('accessToken')?.value;
  const accessRole = decodeAccessTokenRole(accessToken);
  const hasSession = Boolean(
    accessToken || req.cookies.get('refreshToken')?.value,
  );

  if (!hasSession && !isPublicPath && !isAuthPath) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthPath) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = getDefaultAppRoute(accessRole);
    dashboardUrl.searchParams.delete('from');
    return NextResponse.redirect(dashboardUrl);
  }

  if (hasSession && pathname === '/dashboard' && accessRole === 'student') {
    const portalUrl = req.nextUrl.clone();
    portalUrl.pathname = '/portal';
    return NextResponse.redirect(portalUrl);
  }

  const requestHeaders = new Headers(req.headers);
  const subdomain = getSubdomain(req.nextUrl.hostname);

  if (subdomain) {
    requestHeaders.set('x-school-subdomain', subdomain);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
