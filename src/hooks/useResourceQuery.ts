/**
 * Resource Sorgu Hook'ları
 *
 * React Query ile resource verilerini çekmek için kullanılır.
 * Merkezi `api` (axios) instance'ını kullanır — `apiClient` KULLANILMAMALI.
 *
 * ## Kullanım
 *
 * ### Listeleme:
 * ```tsx
 * const { data, isLoading, error } = useResourceQuery('users', {
 *   page: 1,
 *   pageSize: 10,
 *   search: 'john',
 *   sortBy: 'name',
 *   sortOrder: 'asc',
 * });
 * ```
 *
 * ### Tekil kayıt:
 * ```tsx
 * const { data } = useSingleResourceQuery('users', '123');
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import api from '@/lib/axios';
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

      const { data } = await api.get<ApiListResponse<AnyResource>>(`/${resourceType}?${params.toString()}`);
      return data;
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
      const { data } = await api.get<AnyResource>(`/${resourceType}/${resourceId}`);
      return data;
    },
    enabled,
  });
}
