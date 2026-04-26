import type { AxiosResponse } from 'axios';
import type {
  ApiResponse,
  AttendanceReportResponse,
  BehaviorReportResponse,
  GradeReportResponse,
  PaginatedResponse,
  PaginationMeta,
} from '@/types';

export interface ListPayload<T> {
  items: T[];
  meta: PaginationMeta | null;
}

const hasMessage = (value: unknown): value is { message: string } => (
  typeof value === 'object'
  && value !== null
  && 'message' in value
  && typeof (value as { message?: unknown }).message === 'string'
);

export const getEntityPayload = <T>(response: AxiosResponse<ApiResponse<T>>): T => response.data.data;

export const getListPayload = <T>(response: AxiosResponse<PaginatedResponse<T>>): ListPayload<T> => ({
  items: Array.isArray(response.data.data) ? response.data.data : [],
  meta: response.data.meta ?? response.data.pagination ?? null,
});

export const getTempPassword = <T extends { tempPassword?: string | null }>(
  response: AxiosResponse<ApiResponse<T>>,
) => response.data.data?.tempPassword ?? null;

export const getApiErrorMessage = (error: unknown, fallback = 'حدث خطأ أثناء تنفيذ الطلب') => {
  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
    && hasMessage((error as { response?: { data?: unknown } }).response?.data)
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const getAttendanceReportPayload = (
  response: AxiosResponse<ApiResponse<AttendanceReportResponse>>,
) => response.data.data;

export const getBehaviorReportPayload = (
  response: AxiosResponse<ApiResponse<BehaviorReportResponse>>,
) => response.data.data;

export const getGradeReportPayload = (
  response: AxiosResponse<ApiResponse<GradeReportResponse>>,
) => response.data.data;