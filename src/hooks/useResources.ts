/**
 * useResources Hook
 * React Query hook for fetching resource lists
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AnyResource, ApiListResponse } from '@/types';

export interface UseResourcesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  filters?: Record<string, any>;
}

/**
 * Fetch resources list
 */
export function useResources(
  resourceType: string,
  options: UseResourcesOptions = {}
) {
  const { page = 1, pageSize = 10, search, sort, filters } = options;

  return useQuery({
    queryKey: ['resources', resourceType, { page, pageSize, search, sort, filters }],
    queryFn: async () => {
      // Mock API call - replace with actual API
      const response: ApiListResponse<AnyResource> = {
        data: [],
        meta: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        },
      };
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Fetch single resource
 */
export function useResource(resourceType: string, id: string) {
  return useQuery({
    queryKey: ['resource', resourceType, id],
    queryFn: async () => {
      // Mock API call - replace with actual API
      const resource: AnyResource = {
        id,
        type: resourceType as any,
        name: 'Resource',
        attributes: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return resource;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Create resource mutation
 */
export function useCreateResource(resourceType: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      // Mock API call - replace with actual API
      const resource: AnyResource = {
        id: String(Date.now()),
        type: resourceType as any,
        name: (data.name as string) || 'Resource',
        attributes: data as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return resource;
    },
    onSuccess: () => {
      // Invalidate resources list
      queryClient.invalidateQueries({
        queryKey: ['resources', resourceType],
      });
    },
  });
}

/**
 * Update resource mutation
 */
export function useUpdateResource(resourceType: string, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      // Mock API call - replace with actual API
      const resource: AnyResource = {
        id,
        type: resourceType as any,
        name: (data.name as string) || 'Resource',
        attributes: data as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return resource;
    },
    onSuccess: () => {
      // Invalidate resource and list
      queryClient.invalidateQueries({
        queryKey: ['resource', resourceType, id],
      });
      queryClient.invalidateQueries({
        queryKey: ['resources', resourceType],
      });
    },
  });
}

/**
 * Delete resource mutation
 */
export function useDeleteResource(resourceType: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Mock API call - replace with actual API
      return id;
    },
    onSuccess: (id) => {
      // Invalidate resource and list
      queryClient.invalidateQueries({
        queryKey: ['resource', resourceType, id],
      });
      queryClient.invalidateQueries({
        queryKey: ['resources', resourceType],
      });
    },
  });
}
