/**
 * Resource Mutation Hook'ları
 *
 * React Query ile resource oluşturma, güncelleme ve silme işlemleri için kullanılır.
 * Merkezi `api` (axios) instance'ını kullanır — `apiClient` KULLANILMAMALI.
 *
 * ## Kullanım
 *
 * ### Oluşturma:
 * ```tsx
 * const createMutation = useCreateResourceMutation('users', {
 *   onSuccess: (data) => console.log('Oluşturuldu:', data),
 * });
 * createMutation.mutate({ name: 'John', email: 'john@test.com' });
 * ```
 *
 * ### Güncelleme:
 * ```tsx
 * const updateMutation = useUpdateResourceMutation('users', '123');
 * updateMutation.mutate({ name: 'Jane' });
 * ```
 *
 * ### Silme:
 * ```tsx
 * const deleteMutation = useDeleteResourceMutation('users');
 * deleteMutation.mutate('123');
 * ```
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import api from '@/lib/axios';
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
 * API yanıtındaki bildirimleri toast olarak gösterir
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
): UseMutationResult<ApiResponse<AnyResource>, Error, FormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post<ApiResponse<AnyResource>>(`/${resourceType}`, data);
      return response.data;
    },
    onSuccess: (response) => {
      showNotifications(response.notifications);
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
): UseMutationResult<ApiResponse<AnyResource>, Error, FormData> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put<ApiResponse<AnyResource>>(`/${resourceType}/${resourceId}`, data);
      return response.data;
    },
    onSuccess: (response) => {
      showNotifications(response.notifications);
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
): UseMutationResult<ApiResponse<void>, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/${resourceType}/${resourceId}`);
      return response.data;
    },
    onSuccess: (response) => {
      showNotifications(response.notifications);
      queryClient.invalidateQueries({ queryKey: [resourceType] });
      options.onSuccess?.({} as AnyResource);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
}
