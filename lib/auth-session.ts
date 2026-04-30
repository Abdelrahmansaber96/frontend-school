import Cookies from 'js-cookie';
import type { User } from '@/types';
import {
  FRONTEND_ACCESS_TOKEN_COOKIE,
  FRONTEND_AUTH_COOKIE,
} from '@/lib/auth-session-shared';

const COOKIE_OPTIONS = {
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  expires: 7,
};

export const syncFrontendAuthCookie = (user: Pick<User, 'role'>) => {
  Cookies.set(FRONTEND_AUTH_COOKIE, user.role, COOKIE_OPTIONS);
};

export const syncFrontendAccessToken = (accessToken: string) => {
  Cookies.set(FRONTEND_ACCESS_TOKEN_COOKIE, accessToken, COOKIE_OPTIONS);
};

export const getFrontendAccessToken = () => Cookies.get(FRONTEND_ACCESS_TOKEN_COOKIE) || null;

export const clearFrontendAuthCookie = () => {
  Cookies.remove(FRONTEND_AUTH_COOKIE);
};

export const clearFrontendAccessToken = () => {
  Cookies.remove(FRONTEND_ACCESS_TOKEN_COOKIE);
};

export const clearFrontendSessionTokens = () => {
  clearFrontendAuthCookie();
  clearFrontendAccessToken();
};