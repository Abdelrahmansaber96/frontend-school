import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import {
  clearFrontendSessionTokens,
  getFrontendAccessToken,
  syncFrontendAccessToken,
} from '@/lib/auth-session';
import { extractAccessToken, extractAccessTokenFromHeaders } from '@/lib/auth-session-shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // for HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
});

type AuthAwareRequestConfig = AxiosRequestConfig & {
  skipAuthRedirect?: boolean;
};

type InternalAuthAwareRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRedirect?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeEnvelope = <T>(payload: T): T => {
  if (!isRecord(payload) || typeof payload.success !== 'boolean') {
    return payload;
  }

  const normalized = { ...payload } as Record<string, unknown>;
  const envelopeData = normalized.data;
  const envelopeError = normalized.error;

  if (isRecord(envelopeError)) {
    normalized.message = envelopeError.message;
    normalized.errorCode = envelopeError.code;
    if (Array.isArray(envelopeError.details)) {
      normalized.errors = envelopeError.details;
    }
  }

  if (
    normalized.success
    && isRecord(envelopeData)
    && Object.prototype.hasOwnProperty.call(envelopeData, 'items')
    && Object.prototype.hasOwnProperty.call(envelopeData, 'pagination')
  ) {
    normalized.data = envelopeData.items;
    normalized.meta = envelopeData.pagination;
    normalized.pagination = envelopeData.pagination;
  }

  return normalized as T;
};

api.interceptors.request.use((config) => {
  const accessToken = getFrontendAccessToken();

  const headers = config.headers instanceof AxiosHeaders
    ? config.headers
    : new AxiosHeaders(config.headers);

  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  config.headers = headers;

  return config;
});

// ─── Response Interceptor (token refresh) ────────────────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: () => void; reject: (e: unknown) => void }[] = [];

const clearPersistedAuth = () => {
  if (typeof window === 'undefined') return;
  clearFrontendSessionTokens();
  window.localStorage.removeItem('basma-auth');
};

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    response.data = normalizeEnvelope(response.data);
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.data) {
      error.response.data = normalizeEnvelope(error.response.data);
    }

    const originalRequest = error.config as InternalAuthAwareRequestConfig;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login')
      || requestUrl.includes('/auth/refresh')
      || requestUrl.includes('/auth/logout');
    const skipAuthRedirect = Boolean(originalRequest?.skipAuthRedirect);

    if (error.response?.status === 401 && skipAuthRedirect) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(Promise.reject.bind(Promise));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const nextAccessToken = extractAccessToken(refreshResponse.data)
          || extractAccessTokenFromHeaders(refreshResponse.headers as Record<string, unknown> | undefined);
        if (nextAccessToken) {
          syncFrontendAccessToken(nextAccessToken);
        }
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        if (axios.isAxiosError(refreshError) && refreshError.response?.data) {
          refreshError.response.data = normalizeEnvelope(refreshError.response.data);
        }
        processQueue(refreshError);
        clearPersistedAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// ─── Typed endpoint helpers ──────────────────────────────────────────────────
export const authApi = {
  login: (data: { identifier: string; password: string; identifierType?: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
  resetPassword: (userId: string) => api.post(`/auth/reset-password/${userId}`),
  registerSchool: (data: {
    schoolName: string;
    schoolNameAr?: string;
    address: string;
    phone: string;
    email?: string;
    admin: {
      name: { first: string; last: string };
      nationalId: string;
      phone: string;
      email?: string;
      password: string;
    };
  }) => api.post('/auth/register-school', data),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard'),
};

export const schoolsApi = {
  list: (params?: object) => api.get('/schools', { params }),
  getById: (id: string) => api.get(`/schools/${id}`),
  create: (data: object) => api.post('/schools', data),
  update: (id: string, data: object) => api.patch(`/schools/${id}`, data),
  updateCurrentProfile: (data: object) => api.patch('/schools/profile', data),
  updateSettings: (id: string, data: object) => api.patch(`/schools/${id}/settings`, data),
  delete: (id: string) => api.delete(`/schools/${id}`),
  getCurrent: () => api.get('/schools/current', { skipAuthRedirect: true } as AuthAwareRequestConfig),
  updateBranding: (data: object) => api.put('/schools/branding', data),
};

export const teachersApi = {
  list: (params?: object) => api.get('/teachers', { params }),
  getById: (id: string) => api.get(`/teachers/${id}`),
  create: (data: object) => api.post('/teachers', data),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/teachers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: string, data: object) => api.patch(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};

export const parentsApi = {
  list: (params?: object) => api.get('/parents', { params }),
  getMe: () => api.get('/parents/me'),
  getById: (id: string) => api.get(`/parents/${id}`),
  create: (data: object) => api.post('/parents', data),
  update: (id: string, data: object) => api.patch(`/parents/${id}`, data),
  delete: (id: string) => api.delete(`/parents/${id}`),
  getChildren: (id: string) => api.get(`/parents/${id}/children`),
};

export const studentsApi = {
  list: (params?: object) => api.get('/students', { params }),
  getMe: () => api.get('/students/me'),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: object) => api.post('/students', data),
  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: string, data: object) => api.patch(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
};

export const classesApi = {
  list: (params?: object) => api.get('/classes', { params }),
  getById: (id: string) => api.get(`/classes/${id}`),
  create: (data: object) => api.post('/classes', data),
  update: (id: string, data: object) => api.patch(`/classes/${id}`, data),
  delete: (id: string) => api.delete(`/classes/${id}`),
  getStudents: (id: string, params?: object) => api.get(`/classes/${id}/students`, { params }),
};

export const subjectsApi = {
  list: (params?: object) => api.get('/subjects', { params }),
  create: (data: object) => api.post('/subjects', data),
  update: (id: string, data: object) => api.patch(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};

export const gradesApi = {
  list: (params?: object) => api.get('/grades', { params }),
  getById: (id: string) => api.get(`/grades/${id}`),
  create: (data: object) => api.post('/grades', data),
  update: (id: string, data: object) => api.patch(`/grades/${id}`, data),
  delete: (id: string) => api.delete(`/grades/${id}`),
  getStudentProfile: (studentId: string, params?: object) => api.get(`/grades/student/${studentId}/profile`, { params }),
};

export const attendanceApi = {
  list: (params?: object) => api.get('/attendance', { params }),
  create: (data: object) => api.post('/attendance', data),
  bulkCreate: (data: object) => api.post('/attendance/bulk', data),
  update: (id: string, data: object) => api.patch(`/attendance/${id}`, data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
  getSummary: (studentId: string, params?: object) =>
    api.get(`/attendance/summary/${studentId}`, { params }),
};

export const behaviorApi = {
  list: (params?: object) => api.get('/behavior', { params }),
  getById: (id: string) => api.get(`/behavior/${id}`),
  create: (data: object) => api.post('/behavior', data),
  update: (id: string, data: object) => api.patch(`/behavior/${id}`, data),
  delete: (id: string) => api.delete(`/behavior/${id}`),
};

export const messagingApi = {
  listConversations: (params?: object) => api.get('/messaging', { params }),
  getOrCreate: (participantId: string) => api.post('/messaging', { participantId }),
  getMessages: (id: string, params?: object) => api.get(`/messaging/${id}/messages`, { params }),
  sendMessage: (id: string, data: object) => api.post(`/messaging/${id}/messages`, data),
  markRead: (id: string) => api.patch(`/messaging/${id}/read`),
};

export const notificationsApi = {
  list: (params?: object) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
};

export const uploadsApi = {
  list: (params?: object) => api.get('/uploads', { params }),
  upload: (context: 'avatar' | 'behavior' | 'message' | 'import', file: File, contextId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (contextId) formData.append('contextId', contextId);

    return api.post(`/uploads/${context}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (publicId: string) => api.delete(`/uploads/${encodeURIComponent(publicId)}`),
};

export const reportsApi = {
  attendance: (params?: object) => api.get('/reports/attendance', { params }),
  exportAttendance: (params?: object) => api.get('/reports/attendance/export', {
    params,
    responseType: 'blob',
  }),
  behavior: (params?: object) => api.get('/reports/behavior', { params }),
  exportBehavior: (params?: object) => api.get('/reports/behavior/export', {
    params,
    responseType: 'blob',
  }),
  grades: (params?: object) => api.get('/reports/grades', { params }),
  student: (params?: object) => api.get('/reports/student', { params }),
  summary: () => api.get('/reports/summary'),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: object) => api.patch('/users/me', data),
  createAdministrative: (data: object) => api.post('/users/administrative', data),
  list: (params?: object) => api.get('/users', { params }),
  activate: (id: string) => api.patch(`/users/${id}/activate`),
  deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
};
