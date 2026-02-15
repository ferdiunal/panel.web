/**
 * Hook for managing dependent field resolution
 *
 * Features:
 * - Debounced dependency resolution (300ms)
 * - Integration with form-state-store
 * - Optimized API calls (only changed fields)
 * - Loading state management
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useFormStateStore, useDependencyLoading, useAllFieldUpdates } from '@/stores/form-state-store';
import { useDebouncedCallback } from './useDebouncedCallback';
import { resourceService } from '@/services/resource';
import type { FieldDefinition } from '@/types/form';
import type { FieldUpdate } from '@/types/dependencies';

type FormData = Record<string, unknown>;

export interface UseFormDependenciesOptions {
  formId: string;
  resourceType: string;
  mode: 'create' | 'edit';
  resourceId?: string | number;
  fields: FieldDefinition[];
  enabled?: boolean;
}

export interface UseFormDependenciesReturn {
  fieldUpdates: Record<string, FieldUpdate>;
  isResolving: boolean;
  resolveDependencies: (changedFields: string[], formData: FormData) => void;
  handleFieldChange: (fieldKey: string, value: unknown, formData: FormData) => void;
}

/**
 * Hook for managing dependent field resolution with debouncing
 */
export function useFormDependencies(
  options: UseFormDependenciesOptions
): UseFormDependenciesReturn {
  const { formId, resourceType, mode, resourceId, fields, enabled = true } = options;

  // Subscribe to field updates and loading state
  const fieldUpdates = useAllFieldUpdates(formId);
  const isResolving = useDependencyLoading(formId);

  const dependencyTriggerFields = useMemo(() => {
    const toStringArray = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      return value.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0
      );
    };

    const triggerFields = new Set<string>();

    fields.forEach((field) => {
      const dependencyMeta = field as FieldDefinition & {
        depends_on?: unknown;
        dependsOn?: unknown;
      };

      const dependencies = [
        ...toStringArray(dependencyMeta.depends_on),
        ...toStringArray(dependencyMeta.dependsOn),
        ...toStringArray(field.props?.depends_on),
        ...toStringArray(field.props?.dependsOn),
      ];

      dependencies.forEach((dependency) => triggerFields.add(dependency));
    });

    return triggerFields;
  }, [fields]);

  const canResolveDependencies = enabled && dependencyTriggerFields.size > 0;

  // Debounced dependency resolution
  const { run: resolveDependencies, cancel: cancelResolveDependencies } = useDebouncedCallback(
    async (changedFields: string[], formData: FormData) => {
      if (!canResolveDependencies) return;
      if (!changedFields.some((fieldKey) => dependencyTriggerFields.has(fieldKey))) return;

      const store = useFormStateStore.getState();
      store.setDependencyLoading(formId, true);

      try {
        const dependencyContext = mode === 'edit' ? 'update' : 'create';

        // Use axios-backed service so CSRF/session handling is consistent.
        const data = await resourceService.resolveDependencies(resourceType, {
          formData,
          context: dependencyContext,
          changedFields,
          resourceId: resourceId ?? null,
        });

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

  useEffect(() => {
    if (canResolveDependencies) return;
    cancelResolveDependencies();
    useFormStateStore.getState().setDependencyLoading(formId, false);
  }, [canResolveDependencies, cancelResolveDependencies, formId]);

  useEffect(() => {
    return () => {
      cancelResolveDependencies();
    };
  }, [cancelResolveDependencies]);

  // Handle field change with dependency resolution
  const handleFieldChange = useCallback(
    (fieldKey: string, value: unknown, formData: FormData) => {
      if (!canResolveDependencies) return;
      if (!dependencyTriggerFields.has(fieldKey)) return;
      resolveDependencies([fieldKey], { ...formData, [fieldKey]: value });
    },
    [canResolveDependencies, dependencyTriggerFields, resolveDependencies]
  );

  return {
    fieldUpdates,
    isResolving,
    resolveDependencies,
    handleFieldChange,
  };
}
