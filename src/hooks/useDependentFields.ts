/**
 * Custom hook for handling field dependencies
 */

import { useState, useCallback, useMemo } from 'react';
import { resourceService } from '@/services/resource';
import type { FieldData } from '@/types';
import type { FieldUpdate, ResolveDependenciesRequest } from '@/types/dependencies';

interface UseDependentFieldsOptions {
  resource: string;
  context: 'create' | 'update';
  resourceId?: string | number;
  fields: FieldData[];
  formData: Record<string, any>;
  onFieldsUpdate: (updates: Record<string, FieldUpdate>) => void;
}

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useDependentFields(options: UseDependentFieldsOptions) {
  const [isResolving, setIsResolving] = useState(false);

  // Debounced dependency resolution
  const resolveDependencies = useMemo(
    () =>
      debounce(async (fields: string[]) => {
        setIsResolving(true);
        try {
          const request: ResolveDependenciesRequest = {
            formData: options.formData,
            context: options.context,
            changedFields: fields,
            resourceId: options.resourceId || null,
          };

          const response = await resourceService.resolveDependencies(
            options.resource,
            request
          );

          options.onFieldsUpdate(response.fields);
        } catch (error) {
          console.error('Failed to resolve dependencies:', error);
        } finally {
          setIsResolving(false);
        }
      }, 300),
    [options.resource, options.context, options.resourceId, options.formData]
  );

  // Track field changes
  const handleFieldChange = useCallback(
    (fieldKey: string) => {
      resolveDependencies([fieldKey]);
    },
    [resolveDependencies]
  );

  return { isResolving, handleFieldChange };
}
