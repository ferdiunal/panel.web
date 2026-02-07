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

export interface UniversalResourceFormProps {
  formId?: string;
  resourceType: string;
  mode: 'create' | 'edit';
  resourceId?: string | number;
  fields: FieldDefinition[];
  initialData?: Record<string, any>;
  schema?: z.ZodSchema;
  onSubmit: (data: Record<string, any>) => Promise<void>;
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
  resourceId,
  fields,
  initialData = {},
  schema,
  onSubmit,
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
  const { isResolving } = useFormDependencies({
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

  // Watch form values for dependency resolution
  const formValues = form.watch();

  // Handle field changes for dependency resolution
  useEffect(() => {
    // This effect will trigger when form values change
    // Dependency resolution is handled by useFormDependencies
  }, [formValues]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit as any)}
        className={className}
        noValidate
      >
        {/* Form fields */}
        <div className="space-y-4">
          {fields.map((field) => (
            <FieldRenderer
              key={field.key}
              formId={formId}
              field={field}
              container={container}
            />
          ))}
        </div>

        {/* Form actions */}
        <FormActions
          isSubmitting={isSubmitting}
          isResolving={isResolving}
          mode={mode}
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
