/**
 * Custom hooks for resource mutations (create, update, delete)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AnyResource, FormData } from '@/types';

interface MutationOptions {
  onSuccess?: (data: AnyResource) => void;
  onError?: (error: Error) => void;
}

export function useCreateResourceMutation(
  resourceType: string,
  options: MutationOptions = {}
): UseMutationResult<AnyResource, Error, FormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<AnyResource>(`/${resourceType}`, data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate the resource list query
      queryClient.invalidateQueries({ queryKey: [resourceType] });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}

export function useUpdateResourceMutation(
  resourceType: string,
  resourceId: string,
  options: MutationOptions = {}
): UseMutationResult<AnyResource, Error, FormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.put<AnyResource>(`/${resourceType}/${resourceId}`, data);
      return response;
    },
    onSuccess: (data) => {
      // Invalidate both the resource list and single resource queries
      queryClient.invalidateQueries({ queryKey: [resourceType] });
      queryClient.invalidateQueries({ queryKey: [resourceType, resourceId] });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}

export function useDeleteResourceMutation(
  resourceType: string,
  options: MutationOptions = {}
): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      await apiClient.delete(`/${resourceType}/${resourceId}`);
    },
    onSuccess: () => {
      // Invalidate the resource list query
      queryClient.invalidateQueries({ queryKey: [resourceType] });
      options.onSuccess?.({} as AnyResource);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
