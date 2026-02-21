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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import { useFormWithStore } from '@/hooks/useFormWithStore';
import { useFormDependencies } from '@/hooks/useFormDependencies';
import { useFormStateStore } from '@/stores/form-state-store';
import { FieldRenderer } from './FieldRenderer';
import { FormActions } from './FormActions';
import type { FieldDefinition } from '@/types/form';
import { generateFormId } from '@/utils/form-helpers';
import { cn } from '@/lib/utils';

const EMPTY_INITIAL_DATA: Record<string, any> = {};

function isStackFieldDefinition(field: Pick<FieldDefinition, 'type' | 'view'> | null | undefined): boolean {
  if (!field) return false;
  const view = typeof field.view === 'string' ? field.view : '';
  return field.type === 'stack' || view === 'stack-field' || view.startsWith('stack-field-');
}

function toFieldDefinition(raw: unknown, fallbackKey: string): FieldDefinition | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const source = raw as Record<string, any>;
  const key = typeof source.key === 'string' && source.key.trim().length > 0
    ? source.key
    : fallbackKey;

  return {
    ...source,
    key,
    name: typeof source.name === 'string' && source.name.trim().length > 0 ? source.name : key,
    label: typeof source.label === 'string' && source.label.trim().length > 0 ? source.label : key,
    type: typeof source.type === 'string' && source.type.trim().length > 0 ? source.type : 'text',
    view: typeof source.view === 'string' && source.view.trim().length > 0 ? source.view : 'text-field',
    data: source.data ?? null,
    props: source.props && typeof source.props === 'object' && !Array.isArray(source.props)
      ? source.props
      : {},
    disabled: typeof source.disabled === 'boolean' ? source.disabled : false,
    filterable: typeof source.filterable === 'boolean' ? source.filterable : false,
    help_text: typeof source.help_text === 'string' ? source.help_text : '',
    nullable: typeof source.nullable === 'boolean' ? source.nullable : false,
    placeholder: typeof source.placeholder === 'string' ? source.placeholder : '',
    read_only: typeof source.read_only === 'boolean' ? source.read_only : false,
    required: typeof source.required === 'boolean' ? source.required : false,
    sortable: typeof source.sortable === 'boolean' ? source.sortable : false,
    stacked: typeof source.stacked === 'boolean' ? source.stacked : false,
    text_align: source.text_align === 'center' || source.text_align === 'right' ? source.text_align : 'left',
  };
}

function extractRawStackChildren(field: FieldDefinition): unknown[] {
  const propsChildren = Array.isArray(field.props?.fields) ? field.props.fields : [];

  const dataPayload =
    field.data && typeof field.data === 'object' && !Array.isArray(field.data)
      ? (field.data as Record<string, unknown>)
      : null;
  const dataProps =
    dataPayload?.props && typeof dataPayload.props === 'object' && !Array.isArray(dataPayload.props)
      ? (dataPayload.props as Record<string, unknown>)
      : null;
  const dataChildren = Array.isArray(dataProps?.fields) ? dataProps.fields : [];

  return dataChildren.length > 0 ? dataChildren : propsChildren;
}

function flattenStackFields(fields: FieldDefinition[]): FieldDefinition[] {
  const flattened: FieldDefinition[] = [];

  fields.forEach((field, fieldIndex) => {
    if (!isStackFieldDefinition(field)) {
      flattened.push(field);
      return;
    }

    const children = extractRawStackChildren(field)
      .map((child, childIndex) => toFieldDefinition(child, `${field.key || `stack_${fieldIndex}`}_${childIndex}`))
      .filter((child): child is FieldDefinition => child !== null);

    if (children.length === 0) {
      return;
    }

    flattened.push(...flattenStackFields(children));
  });

  return flattened;
}

function extractSelectScalarValue(rawValue: unknown): string | undefined {
  if (rawValue === null || rawValue === undefined) return undefined;

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (!trimmed) return undefined;

    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        return (
          extractSelectScalarValue(parsed.value) ??
          extractSelectScalarValue(parsed.data) ??
          extractSelectScalarValue(parsed.target_type)
        );
      } catch {
        // Keep plain string fallback
      }
    }

    return trimmed;
  }

  if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
    return String(rawValue);
  }

  if (typeof rawValue === 'object') {
    const record = rawValue as Record<string, unknown>;
    return (
      extractSelectScalarValue(record.value) ??
      extractSelectScalarValue(record.data) ??
      extractSelectScalarValue(record.target_type) ??
      extractSelectScalarValue(record.id)
    );
  }

  return undefined;
}

function normalizeInitialFieldValue(field: FieldDefinition): any {
  const view = field.view || '';
  const isManyRelationship =
    view === 'has-many-field' ||
    view === 'belongs-to-many-field' ||
    view === 'morph-to-many-field' ||
    view.startsWith('has-many-field-') ||
    view.startsWith('belongs-to-many-field-') ||
    view.startsWith('morph-to-many-field-');

  const isSingleRelationship =
    view === 'belongs-to-field' ||
    view === 'has-one-field' ||
    view === 'morph-to-field' ||
    view.startsWith('belongs-to-field-') ||
    view.startsWith('has-one-field-') ||
    view.startsWith('morph-to-field-');

  const isSelectField =
    field.type === 'select' ||
    view === 'select-field' ||
    view.startsWith('select-field-');

  if (isSelectField) {
    return extractSelectScalarValue(field.data) ?? '';
  }

  if (isManyRelationship) {
    if (!Array.isArray(field.data)) return [];

    return field.data.map((item: any) => {
      if (item && typeof item === 'object' && 'id' in item) {
        const idField = item.id;
        if (idField && typeof idField === 'object' && 'data' in idField) {
          return String((idField as { data?: unknown }).data);
        }
        return String(idField);
      }
      return String(item);
    });
  }

  if (isSingleRelationship && field.data && typeof field.data === 'object' && 'id' in (field.data as any)) {
    const idField = (field.data as any).id;
    if (idField && typeof idField === 'object' && 'data' in idField) {
      return String(idField.data);
    }
    return String(idField);
  }

  return field.data;
}

function extractServerValidationErrors(error: unknown): Record<string, string> {
  const responseData = (error as any)?.response?.data;
  const rawErrors = responseData?.errors ?? responseData?.details;

  if (!rawErrors || typeof rawErrors !== 'object') {
    return {};
  }

  const mapped: Record<string, string> = {};
  Object.entries(rawErrors as Record<string, unknown>).forEach(([field, value]) => {
    if (!field) return;

    if (Array.isArray(value) && value.length > 0) {
      const firstMessage = value.find((item) => typeof item === 'string' && item.trim().length > 0);
      if (typeof firstMessage === 'string') {
        mapped[field] = firstMessage;
      }
      return;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      mapped[field] = value;
    }
  });

  return mapped;
}

function extractServerErrorMessage(error: unknown): string | undefined {
  const responseData = (error as any)?.response?.data;
  const message = responseData?.error ?? responseData?.message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }
  return undefined;
}

function applyServerValidationErrors(
  form: UseFormReturn<Record<string, any>>,
  error: unknown
): boolean {
  const fieldErrors = extractServerValidationErrors(error);
  const entries = Object.entries(fieldErrors);

  if (entries.length === 0) {
    const message = extractServerErrorMessage(error);
    if (message) {
      form.setError('root.server' as any, {
        type: 'server',
        message,
      });
    }
    return false;
  }

  entries.forEach(([field, message]) => {
    form.setError(field as any, {
      type: 'server',
      message,
    });
  });

  return true;
}

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
  onUpdateAndContinue?: (data: Record<string, any>) => Promise<void>;
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
  initialData,
  schema,
  onSubmit,
  onCreateAndContinue,
  onUpdateAndContinue,
  onCancel,
  enableDependentFields = true,
  container,
  className,
}) => {
  const normalizedFields = useMemo(() => flattenStackFields(fields), [fields]);

  const derivedInitialData = useMemo(() => {
    const initial: Record<string, any> = {};

    normalizedFields.forEach((field) => {
      if (!field?.key) return;
      if (Object.prototype.hasOwnProperty.call(initial, field.key)) return;
      initial[field.key] = normalizeInitialFieldValue(field);
    });

    return initial;
  }, [normalizedFields]);

  // Keep generated formId stable for the component lifetime.
  // If this changes on each render, dependency updates can land under a stale store key.
  const [generatedFormId] = useState(() => generateFormId(resourceType, mode, resourceId));
  const formId = providedFormId || generatedFormId;

  const resolvedInitialData = useMemo(
    () => ({
      ...derivedInitialData,
      ...(initialData ?? EMPTY_INITIAL_DATA),
    }),
    [derivedInitialData, initialData]
  );

  // Initialize form with RHF + Zustand
  const { form, isSubmitting } = useFormWithStore({
    formId,
    schema: schema as any,
    defaultValues: resolvedInitialData,
    mode: 'onChange',
  });

  // Setup dependent fields
  const { isResolving, handleFieldChange } = useFormDependencies({
    formId,
    resourceType,
    mode,
    resourceId,
    fields: normalizedFields,
    initialFormData: resolvedInitialData,
    enabled: enableDependentFields,
  });

  // Handle form submission
  const handleSubmit = useCallback(
    async (data: Record<string, any>) => {
      const store = useFormStateStore.getState();
      store.setSubmitting(formId, true);
      form.clearErrors();

      try {
        await onSubmit(data);
        form.reset(); // Reset form after successful submission
      } catch (error) {
        applyServerValidationErrors(form as UseFormReturn<Record<string, any>>, error);
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
      form.clearErrors();

      try {
        await onCreateAndContinue(data);
        // Don't reset form - we'll transition to edit mode
      } catch (error) {
        applyServerValidationErrors(form as UseFormReturn<Record<string, any>>, error);
      } finally {
        store.setSubmitting(formId, false);
      }
    },
    [form, formId, onCreateAndContinue]
  );

  // Handle update and continue submission
  const handleUpdateAndContinue = useCallback(
    async (data: Record<string, any>) => {
      if (!onUpdateAndContinue) return;

      const store = useFormStateStore.getState();
      store.setSubmitting(formId, true);
      form.clearErrors();

      try {
        await onUpdateAndContinue(data);
      } catch (error) {
        applyServerValidationErrors(form as UseFormReturn<Record<string, any>>, error);
      } finally {
        store.setSubmitting(formId, false);
      }
    },
    [form, formId, onUpdateAndContinue]
  );

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && resolvedInitialData && Object.keys(resolvedInitialData).length > 0) {
      form.reset(resolvedInitialData);
    }
  }, [resolvedInitialData, mode, form]);

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 pl-1 pr-4 overflow-y-auto max-h-[80vh]">
          {normalizedFields
            .filter((field) => {
              if (ignoreResourceField && field.props?.['related_resource'] === ignoreResourceField) {
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
                parentResourceSlug={resourceType}
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
          onUpdateAndContinue={onUpdateAndContinue ? form.handleSubmit(handleUpdateAndContinue as any) : undefined}
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
