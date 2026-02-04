/**
 * Custom hook for fetching resources with React Query
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AnyResource, ApiListResponse } from '@/types';

interface UseResourceQueryOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

export function useResourceQuery(
  resourceType: string,
  options: UseResourceQueryOptions = {}
): UseQueryResult<ApiListResponse<AnyResource>, Error> {
  const { page = 1, pageSize = 10, search = '', filters = {}, sortBy = 'id', sortOrder = 'asc', enabled = true } = options;

  return useQuery({
    queryKey: [resourceType, { page, pageSize, search, filters, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(pageSize));
      if (search) params.append('search', search);
      if (sortBy) params.append('sort_by', sortBy);
      if (sortOrder) params.append('sort_order', sortOrder);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get<ApiListResponse<AnyResource>>(`/${resourceType}?${params.toString()}`);
      return response;
    },
    enabled,
  });
}

export function useSingleResourceQuery(
  resourceType: string,
  resourceId: string | undefined,
  options: { enabled?: boolean } = {}
): UseQueryResult<AnyResource, Error> {
  const { enabled = !!resourceId } = options;

  return useQuery({
    queryKey: [resourceType, resourceId],
    queryFn: async () => {
      const response = await apiClient.get<AnyResource>(`/${resourceType}/${resourceId}`);
      return response;
    },
    enabled,
  });
}
