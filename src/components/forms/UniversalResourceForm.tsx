/**
 * UniversalResourceForm - Unified form component
 *
 * Features:
 * - React Hook Form integration
 * - Zod validation
 * - Dependent fields support
 * - Field-level memoization
 * - Automatic cleanup
 */

import React, { useCallback, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import type { z } from 'zod';
import { useFormWithStore } from '@/hooks/useFormWithStore';
import { useFormDependencies } from '@/hooks/useFormDependencies';
import { useFormStateStore } from '@/stores/form-state-store';
import { FieldRenderer } from './FieldRenderer';
import { FormActions } from './FormActions';
import type { FieldDefinition } from '@/types/form';
import { generateFormId } from '@/utils/form-helpers';
import { cn } from '@/lib/utils';

export interface UniversalResourceFormProps {
  formId?: string;
  resourceType: string;
  ignoreResourceField?: string;
  mode: 'create' | 'edit';
  resourceId?: string | number;
  fields: FieldDefinition[];
  initialData?: Record<string, any>;
  schema?: z.ZodSchema;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCreateAndContinue?: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  enableDependentFields?: boolean;
  container?: HTMLElement | null;
  className?: string;
}

/**
 * UniversalResourceForm - Main form component
 */
export const UniversalResourceForm: React.FC<UniversalResourceFormProps> = ({
  formId: providedFormId,
  resourceType,
  mode,
  ignoreResourceField,
  resourceId,
  fields,
  initialData = {},
  schema,
  onSubmit,
  onCreateAndContinue,
  onCancel,
  enableDependentFields = true,
  container,
  className,
}) => {
  // Generate unique form ID if not provided
  const formId = providedFormId || generateFormId(resourceType, mode, resourceId);

  // Initialize form with RHF + Zustand
  const { form, isSubmitting } = useFormWithStore({
    formId,
    schema: schema as any,
    defaultValues: initialData,
    mode: 'onChange',
  });

  // Setup dependent fields
  const { isResolving, handleFieldChange } = useFormDependencies({
    formId,
    resourceType,
    mode,
    resourceId,
    fields,
    enabled: enableDependentFields,
  });

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      const store = useFormStateStore.getState();
      store.setSubmitting(formId, true);

      try {
        await onSubmit(data);
        form.reset(); // Reset form after successful submission
      } catch (error) {
        console.error('Form submission failed:', error);
        // Error handling can be enhanced here
      } finally {
        store.setSubmitting(formId, false);
      }
    },
    [formId, onSubmit, form]
  );

  // Handle create and continue submission
  const handleCreateAndContinue = useCallback(
    async (data: Record<string, any>) => {
      if (!onCreateAndContinue) return;

      const store = useFormStateStore.getState();
      store.setSubmitting(formId, true);

      try {
        await onCreateAndContinue(data);
        // Don't reset form - we'll transition to edit mode
      } catch (error) {
        console.error('Form submission failed:', error);
      } finally {
        store.setSubmitting(formId, false);
      }
    },
    [formId, onCreateAndContinue]
  );

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData && Object.keys(initialData).length > 0) {
      form.reset(initialData);
    }
  }, [initialData, mode, form]);

  useEffect(() => {
    if (!enableDependentFields) return;

    const subscription = form.watch((values, info) => {
      const fieldKey = info.name;
      if (!fieldKey) return;
      handleFieldChange(fieldKey, (values as Record<string, any>)[fieldKey], values as Record<string, any>);
    });

    return () => subscription.unsubscribe();
  }, [form, enableDependentFields, handleFieldChange]);

  return (
    <FormProvider {...form}>
      <form
        className={cn('flex min-h-0 flex-col', className)}
        noValidate
        name={formId}
        id={formId}
      >
        {/* Form fields */}
        <div className="space-y-4 pl-1 pr-4 overflow-y-auto max-h-[80vh]">
          {fields
            .filter((field) => {
              if (ignoreResourceField && field.props['related_resource'] === ignoreResourceField) {
                return false;
              }

              return true;
            })
            .map((field) => (
              <FieldRenderer
                key={field.key}
                formId={formId}
                field={field}
                container={container}
                parentResourceId={resourceId}
              />
            ))}
        </div>

        {/* Form actions */}
        <FormActions
          isSubmitting={isSubmitting}
          isResolving={isResolving}
          mode={mode}
          onSubmit={form.handleSubmit(handleSubmit as any)}
          onCreateAndContinue={onCreateAndContinue ? form.handleSubmit(handleCreateAndContinue as any) : undefined}
          onCancel={onCancel}
          className="mt-6"
        />

        {/* Loading indicator for dependency resolution */}
        {isResolving && (
          <div className="mt-2 text-sm text-muted-foreground">
            Updating fields...
          </div>
        )}
      </form>
    </FormProvider>
  );
};

UniversalResourceForm.displayName = 'UniversalResourceForm';
