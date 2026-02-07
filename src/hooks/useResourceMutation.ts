/**
 * Custom hooks for resource mutations (create, update, delete)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AnyResource, FormData } from '@/types';
import { toast } from 'sonner';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface ApiResponse<T> {
  data: T;
  notifications?: Notification[];
}

interface MutationOptions {
  onSuccess?: (data: AnyResource) => void;
  onError?: (error: Error) => void;
}

/**
 * Show notifications from API response
 */
function showNotifications(notifications?: Notification[]) {
  if (!notifications || notifications.length === 0) return;

  notifications.forEach((notification) => {
    switch (notification.type) {
      case 'success':
        toast.success(notification.message, { duration: notification.duration });
        break;
      case 'error':
        toast.error(notification.message, { duration: notification.duration });
        break;
      case 'warning':
        toast.warning(notification.message, { duration: notification.duration });
        break;
      case 'info':
        toast.info(notification.message, { duration: notification.duration });
        break;
    }
  });
}

export function useCreateResourceMutation(
  resourceType: string,
  options: MutationOptions = {}
): UseMutationResult<AnyResource, Error, FormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiClient.post<ApiResponse<AnyResource>>(`/${resourceType}`, data);
      return response;
    },
    onSuccess: (response) => {
      // Show notifications from API response
      showNotifications(response.notifications);

      // Invalidate the resource list query
      queryClient.invalidateQueries({ queryKey: [resourceType] });
      options.onSuccess?.(response.data);
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
      const response = await apiClient.put<ApiResponse<AnyResource>>(`/${resourceType}/${resourceId}`, data);
      return response;
    },
    onSuccess: (response) => {
      // Show notifications from API response
      showNotifications(response.notifications);

      // Invalidate both the resource list and single resource queries
      queryClient.invalidateQueries({ queryKey: [resourceType] });
      queryClient.invalidateQueries({ queryKey: [resourceType, resourceId] });
      options.onSuccess?.(response.data);
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
      const response = await apiClient.delete<ApiResponse<void>>(`/${resourceType}/${resourceId}`);
      return response;
    },
    onSuccess: (response) => {
      // Show notifications from API response
      showNotifications(response.notifications);

      // Invalidate the resource list query
      queryClient.invalidateQueries({ queryKey: [resourceType] });
      options.onSuccess?.({} as AnyResource);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
