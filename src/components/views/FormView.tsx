/**
 * FormView Component
 * Renders a form for creating or updating resources in a Sheet/Drawer
 * Supports all field types with validation and error handling
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { AnyResource, FieldDefinition, Resource } from '@/types';
import { validateData, getSchema } from '@/types/schemas';
import {
  TextInput,
  EmailInput,
  PasswordInput,
  SelectField,
  DateField,
  DateTimeField,
  NumberInput,
  TextareaField,
  URLInput,
  SwitchField,
  BelongsToField,
  HasOneField,
  HasManyField,
  BelongsToManyField,
  MorphToField,
} from '@/components/fields';

export interface FormViewProps {
  resourceType: string;
  mode: 'create' | 'update';
  resource?: AnyResource;
  fields: FieldDefinition[];
  isOpen: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const FormView: React.FC<FormViewProps> = ({
  resourceType,
  mode,
  resource,
  fields,
  isOpen,
  isSubmitting = false,
  onSubmit,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    mode === 'update' && resource
      ? resource.attributes
      : fields.reduce((acc, field) => {
          // Initialize with appropriate default values based on field type
          if (field.type === 'select' && field.options && field.options.length > 0) {
            return { ...acc, [field.name]: field.options[0].value };
          }
          if (field.type === 'switch') {
            return { ...acc, [field.name]: false };
          }
          if (field.type === 'number') {
            return { ...acc, [field.name]: 0 };
          }
          return { ...acc, [field.name]: '' };
        }, {})
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get validation schema
  const schema = useMemo(() => getSchema(resourceType), [resourceType]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Validate form data
      if (schema) {
        const validation = validateData(schema, formData);
        if (!validation.success) {
          setErrors(validation.errors || {});
          return;
        }
      }

      try {
        await onSubmit(formData);
        setFormData(
          mode === 'update' && resource
            ? resource.attributes
            : fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
        );
        setErrors({});
        // Call onSuccess after a small delay to ensure state updates
        setTimeout(() => {
          onSuccess?.();
        }, 0);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to submit form';
        setSubmitError(message);
      }
    },
    [formData, schema, onSubmit, onSuccess, mode, resource, fields]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    setFormData(
      mode === 'update' && resource
        ? resource.attributes
        : fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
    );
    setErrors({});
    setSubmitError(null);
    onCancel();
  }, [mode, resource, fields, onCancel]);

  // Render field based on type
  const renderField = (field: FieldDefinition) => {
    const fieldValue = formData[field.name];

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string) ?? ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'email':
        return (
          <EmailInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string) ?? ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'password':
        return (
          <PasswordInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string) ?? ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'textarea':
        return (
          <TextareaField
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string) ?? ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'url':
        return (
          <URLInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string) ?? ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'number':
        return (
          <NumberInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as number) ?? 0}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <SelectField
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string) ?? ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            options={field.options || []}
          />
        );
      case 'date':
        return (
          <DateField
            key={field.name}
            name={field.name}
            label={field.label}
            value={fieldValue instanceof Date ? fieldValue : undefined}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'datetime':
        return (
          <DateTimeField
            key={field.name}
            name={field.name}
            label={field.label}
            value={fieldValue instanceof Date ? fieldValue : undefined}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
          />
        );
      case 'switch':
        return (
          <SwitchField
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as boolean) ?? false}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
          />
        );
      case 'belongs_to':
        return (
          <BelongsToField
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string | null) ?? null}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            resourceType={field.props?.resourceType as string || ''}
            searchFn={
              (typeof field.props?.searchFn === 'function'
                ? field.props.searchFn
                : () => Promise.resolve([])) as (query: string) => Promise<Resource[]>
            }
          />
        );
      case 'has_one':
        return (
          <HasOneField
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string | null) ?? null}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            resourceType={field.props?.resourceType as string || ''}
            searchFn={
              (typeof field.props?.searchFn === 'function'
                ? field.props.searchFn
                : () => Promise.resolve([])) as (query: string) => Promise<Resource[]>
            }
          />
        );
      case 'has_many':
        return (
          <HasManyField
            key={field.name}
            name={field.name}
            label={field.label}
            value={Array.isArray(fieldValue) ? (fieldValue as string[]) : []}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            resourceType={field.props?.resourceType as string || ''}
            searchFn={
              (typeof field.props?.searchFn === 'function'
                ? field.props.searchFn
                : () => Promise.resolve([])) as (query: string) => Promise<Resource[]>
            }
          />
        );
      case 'belongs_to_many':
        return (
          <BelongsToManyField
            key={field.name}
            name={field.name}
            label={field.label}
            value={Array.isArray(fieldValue) ? (fieldValue as string[]) : []}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            searchFn={
              (typeof field.props?.searchFn === 'function'
                ? field.props.searchFn
                : () => Promise.resolve([])) as (query: string) => Promise<Resource[]>
            }
          />
        );
      case 'morph_to':
        return (
          <MorphToField
            key={field.name}
            name={field.name}
            label={field.label}
            value={(fieldValue as string | null) ?? null}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
            disabled={isSubmitting}
            required={field.required}
            placeholder={field.placeholder}
            resourceTypes={
              Array.isArray(field.props?.resourceTypes)
                ? (field.props.resourceTypes as string[])
                : []
            }
            searchFn={
              (typeof field.props?.searchFn === 'function'
                ? field.props.searchFn
                : () => Promise.resolve([])) as (type: string, query: string) => Promise<Resource[]>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(open) => !open && handleCancel()}
      title={`${mode === 'create' ? 'Create' : 'Edit'} ${resourceType}`}
      variant="sheet"
      side="right"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        <div className="space-y-4">
          {fields.map((field) => renderField(field))}
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Form actions */}
        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

export default FormView;
