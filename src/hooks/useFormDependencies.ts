/**
 * Hook for managing dependent field resolution
 *
 * Features:
 * - Debounced dependency resolution (300ms)
 * - Integration with form-state-store
 * - Optimized API calls (only changed fields)
 * - Loading state management
 */

import { useCallback } from 'react';
import { useFormStateStore, useDependencyLoading, useAllFieldUpdates } from '@/stores/form-state-store';
import { useDebouncedCallback } from './useDebouncedCallback';
import type { FieldDefinition } from '@/types/form';

export interface UseFormDependenciesOptions {
  formId: string;
  resourceType: string;
  mode: 'create' | 'edit';
  resourceId?: string | number;
  fields: FieldDefinition[];
  enabled?: boolean;
}

export interface UseFormDependenciesReturn {
  fieldUpdates: Record<string, any>;
  isResolving: boolean;
  resolveDependencies: (changedFields: string[], formData: Record<string, any>) => void;
  handleFieldChange: (fieldKey: string, value: any, formData: Record<string, any>) => void;
}

/**
 * Hook for managing dependent field resolution with debouncing
 */
export function useFormDependencies(
  options: UseFormDependenciesOptions
): UseFormDependenciesReturn {
  const { formId, resourceType, mode, resourceId, enabled = true } = options;

  // Subscribe to field updates and loading state
  const fieldUpdates = useAllFieldUpdates(formId);
  const isResolving = useDependencyLoading(formId);

  // Debounced dependency resolution
  const resolveDependencies = useDebouncedCallback(
    async (changedFields: string[], formData: Record<string, any>) => {
      if (!enabled) return;

      const store = useFormStateStore.getState();
      store.setDependencyLoading(formId, true);

      try {
        const dependencyContext = mode === 'edit' ? 'update' : 'create';

        // Call backend API to resolve dependencies
        const response = await fetch(
          `/api/resource/${resourceType}/fields/resolve-dependencies`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formData,
              context: dependencyContext,
              changedFields,
              resourceId: resourceId || null,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Dependency resolution failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Update field updates in store
        if (data.fields) {
          store.setFieldUpdates(formId, data.fields);
        }
      } catch (error) {
        console.error('Failed to resolve dependencies:', error);
        // Don't throw - dependency resolution is non-critical
      } finally {
        store.setDependencyLoading(formId, false);
      }
    },
    300,
    { leading: false, trailing: true }
  );

  // Handle field change with dependency resolution
  const handleFieldChange = useCallback(
    (fieldKey: string, value: any, formData: Record<string, any>) => {
      if (enabled) {
        resolveDependencies([fieldKey], { ...formData, [fieldKey]: value });
      }
    },
    [enabled, resolveDependencies]
  );

  return {
    fieldUpdates,
    isResolving,
    resolveDependencies,
    handleFieldChange,
  };
}
