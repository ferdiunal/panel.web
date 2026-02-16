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
  initialFormData?: FormData;
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
  const {
    formId,
    resourceType,
    mode,
    resourceId,
    fields,
    initialFormData = {},
    enabled = true,
  } = options;

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

    console.log('[depends][frontend] trigger-fields-built', {
      formId,
      resourceType,
      mode,
      dependencies: Array.from(triggerFields),
      fieldCount: fields.length,
    });

    return triggerFields;
  }, [fields, formId, resourceType, mode]);

  const canResolveDependencies = enabled && dependencyTriggerFields.size > 0;

  useEffect(() => {
    console.log('[depends][frontend] resolver-state', {
      formId,
      resourceType,
      mode,
      enabled,
      canResolveDependencies,
      triggerFields: Array.from(dependencyTriggerFields),
    });
  }, [formId, resourceType, mode, enabled, canResolveDependencies, dependencyTriggerFields]);

  // Debounced dependency resolution
  const { run: resolveDependencies, cancel: cancelResolveDependencies } = useDebouncedCallback(
    async (changedFields: string[], formData: FormData) => {
      if (!canResolveDependencies) {
        console.log('[depends][frontend] resolve-skip-disabled', {
          formId,
          changedFields,
          canResolveDependencies,
        });
        return;
      }
      if (!changedFields.some((fieldKey) => dependencyTriggerFields.has(fieldKey))) {
        console.log('[depends][frontend] resolve-skip-not-trigger', {
          formId,
          changedFields,
          triggerFields: Array.from(dependencyTriggerFields),
        });
        return;
      }

      const store = useFormStateStore.getState();
      store.setDependencyLoading(formId, true);

      try {
        const dependencyContext = mode === 'edit' ? 'update' : 'create';
        console.log('[depends][frontend] resolve-request', {
          formId,
          resourceType,
          dependencyContext,
          changedFields,
          resourceId: resourceId ?? null,
          formData,
        });

        // Use axios-backed service so CSRF/session handling is consistent.
        const data = await resourceService.resolveDependencies(resourceType, {
          formData,
          context: dependencyContext,
          changedFields,
          resourceId: resourceId ?? null,
        });

        console.log('[depends][frontend] resolve-response', {
          formId,
          resourceType,
          changedFields,
          updates: data.fields ?? {},
          updatedFieldKeys: Object.keys(data.fields ?? {}),
        });

        // Update field updates in store
        if (data.fields) {
          store.setFieldUpdates(formId, data.fields);
        }
      } catch (error) {
        console.error('[depends][frontend] resolve-error', {
          formId,
          resourceType,
          changedFields,
          error,
        });
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
    console.log('[depends][frontend] resolver-disabled-clear-loading', { formId });
    useFormStateStore.getState().setDependencyLoading(formId, false);
  }, [canResolveDependencies, cancelResolveDependencies, formId]);

  useEffect(() => {
    return () => {
      console.log('[depends][frontend] resolver-unmount-cancel', { formId });
      cancelResolveDependencies();
    };
  }, [cancelResolveDependencies, formId]);

  // Resolve dependencies once for initial form state so dependent fields are correct on first render.
  useEffect(() => {
    if (!canResolveDependencies) return;

    const initialChangedFields = Array.from(dependencyTriggerFields);
    if (initialChangedFields.length === 0) return;

    console.log('[depends][frontend] initial-resolve', {
      formId,
      initialChangedFields,
      initialFormData,
    });

    resolveDependencies(initialChangedFields, initialFormData);
  }, [
    canResolveDependencies,
    dependencyTriggerFields,
    formId,
    initialFormData,
    resolveDependencies,
  ]);

  // Handle field change with dependency resolution
  const handleFieldChange = useCallback(
    (fieldKey: string, value: unknown, formData: FormData) => {
      if (!canResolveDependencies) {
        console.log('[depends][frontend] field-change-skip-disabled', { formId, fieldKey });
        return;
      }
      if (!dependencyTriggerFields.has(fieldKey)) {
        console.log('[depends][frontend] field-change-skip-not-trigger', {
          formId,
          fieldKey,
          triggerFields: Array.from(dependencyTriggerFields),
        });
        return;
      }
      console.log('[depends][frontend] field-change-trigger', { formId, fieldKey, value });
      resolveDependencies([fieldKey], { ...formData, [fieldKey]: value });
    },
    [canResolveDependencies, dependencyTriggerFields, resolveDependencies, formId]
  );

  return {
    fieldUpdates,
    isResolving,
    resolveDependencies,
    handleFieldChange,
  };
}
