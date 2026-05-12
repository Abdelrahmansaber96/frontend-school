import { NextRequest, NextResponse } from 'next/server';
import {
  decodeAccessTokenRole,
  FRONTEND_ACCESS_TOKEN_COOKIE,
  FRONTEND_AUTH_COOKIE,
  getFrontendAuthRole,
} from '@/lib/auth-session-shared';
import { getDefaultAppRoute } from '@/lib/app-routes';

const PUBLIC_PATHS = ['/'];
const AUTH_PATHS = ['/login', '/register'];

const matchesPath = (pathname: string, paths: string[]) => paths.some(
  (path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)),
);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicPath = matchesPath(pathname, PUBLIC_PATHS);
  const isAuthPath = matchesPath(pathname, AUTH_PATHS);
  const accessToken = req.cookies.get('accessToken')?.value;
  const frontendAccessToken = req.cookies.get(FRONTEND_ACCESS_TOKEN_COOKIE)?.value;
  const accessRole = decodeAccessTokenRole(accessToken) ?? decodeAccessTokenRole(frontendAccessToken);
  const frontendAuthRole = getFrontendAuthRole(req.cookies.get(FRONTEND_AUTH_COOKIE)?.value);
  const sessionRole = accessRole ?? frontendAuthRole;
  const hasSession = Boolean(
    accessToken || frontendAccessToken || req.cookies.get('refreshToken')?.value || frontendAuthRole,
  );

  if (!hasSession && !isPublicPath && !isAuthPath) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthPath) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = getDefaultAppRoute(sessionRole);
    dashboardUrl.searchParams.delete('from');
    return NextResponse.redirect(dashboardUrl);
  }

  if (hasSession && pathname === '/') {
    const appUrl = req.nextUrl.clone();
    appUrl.pathname = getDefaultAppRoute(sessionRole);
    return NextResponse.redirect(appUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
