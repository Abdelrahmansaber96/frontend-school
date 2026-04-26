'use client';

import { useQuery, type QueryKey } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { getListPayload, type ListPayload } from '@/lib/api-contracts';
import type { PaginatedResponse } from '@/types';

interface UsePaginatedListQueryOptions<TItem> {
  queryKey: QueryKey;
  queryFn: () => Promise<AxiosResponse<PaginatedResponse<TItem>>>;
  enabled?: boolean;
  staleTime?: number;
}

export const usePaginatedListQuery = <TItem>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 30_000,
}: UsePaginatedListQueryOptions<TItem>) => useQuery<ListPayload<TItem>>({
  queryKey,
  queryFn: () => queryFn().then(getListPayload<TItem>),
  enabled,
  staleTime,
});