import type { Role } from '@/types';

export const FRONTEND_AUTH_COOKIE = 'basma-session';
export const FRONTEND_ACCESS_TOKEN_COOKIE = 'basma-access-token';

const ROLE_VALUES: Role[] = ['super_admin', 'school_admin', 'teacher', 'parent', 'student'];

export const isRole = (value: string | null | undefined): value is Role => (
  Boolean(value) && ROLE_VALUES.includes(value as Role)
);

export const getFrontendAuthRole = (cookieValue?: string | null) => (
  isRole(cookieValue) ? cookieValue : null
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const readString = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);

const normalizeBearerToken = (value: unknown) => {
  const token = readString(value);
  if (!token) return null;
  return token.toLowerCase().startsWith('bearer ') ? token.slice(7).trim() : token;
};

const getNestedRecord = (value: unknown, key: string) => (
  isRecord(value) && isRecord(value[key]) ? value[key] : null
);

const getNestedString = (value: unknown, key: string) => (
  isRecord(value) ? readString(value[key]) : null
);

export const decodeAccessTokenRole = (token?: string | null) => {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded)) as { role?: string };
    return isRole(payload.role) ? payload.role : null;
  } catch {
    return null;
  }
};

export const extractAccessToken = (payload: unknown): string | null => {
  const directToken = getNestedString(payload, 'accessToken')
    || getNestedString(payload, 'token');

  if (directToken) return directToken;

  const data = getNestedRecord(payload, 'data');
  if (!data) return null;

  return getNestedString(data, 'accessToken')
    || getNestedString(data, 'token')
    || getNestedString(getNestedRecord(data, 'tokens'), 'accessToken')
    || getNestedString(getNestedRecord(data, 'tokens'), 'token')
    || getNestedString(getNestedRecord(data, 'session'), 'accessToken');
};

export const extractAccessTokenFromHeaders = (headers: Record<string, unknown> | undefined): string | null => {
  if (!headers) return null;

  return normalizeBearerToken(headers.authorization)
    || normalizeBearerToken(headers.Authorization)
    || normalizeBearerToken(headers['x-access-token'])
    || normalizeBearerToken(headers['X-Access-Token']);
};
