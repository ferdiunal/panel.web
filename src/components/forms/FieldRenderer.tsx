/**
 * FieldRenderer - Renders individual fields with dependency updates
 *
 * Features:
 * - Field Registry integration
 * - Dependency update application
 * - Memoization
 * - Hidden field handling
 * - Props transformation (FieldComponentProps → actual field props)
 */

import React, { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useFieldUpdate } from '@/stores/form-state-store';
import { fieldRegistry } from './FieldRegistry';
import type { FieldDefinition } from '@/types/form';

export interface FieldRendererProps {
  formId: string;
  field: FieldDefinition;
  container?: HTMLElement | null;
}

/**
 * FieldRenderer - Renders a single field with dependency updates
 */
export const FieldRenderer: React.FC<FieldRendererProps> = React.memo(
  ({ formId, field, container }) => {
    const { control } = useFormContext();

    // Subscribe to field updates from dependency resolution
    const fieldUpdate = useFieldUpdate(formId, field.key);

    // Apply dependency updates to field definition
    const enhancedField = useMemo(() => {
      if (!fieldUpdate) return field;

      return {
        ...field,
        visible: fieldUpdate.visible ?? field.visible ?? true,
        disabled: fieldUpdate.disabled ?? field.disabled ?? false,
        required: fieldUpdate.required ?? field.required ?? false,
        help_text: fieldUpdate.helpText ?? field.help_text,
        placeholder: fieldUpdate.placeholder ?? field.placeholder,
        // Merge props with updates
        props: {
          ...field.props,
          ...(fieldUpdate.options && { options: fieldUpdate.options }),
        },
      };
    }, [field, fieldUpdate]);

    // Skip hidden fields
    if (enhancedField.visible === false) {
      return null;
    }

    // Get field component from registry
    const fieldType = enhancedField.view || enhancedField.type;
    const FieldComponent = fieldRegistry.get(fieldType);

    if (!FieldComponent) {
      console.warn(`No component registered for field type: ${fieldType}`);
      return (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
          <p className="text-sm text-yellow-800">
            Unknown field type: {fieldType}
          </p>
        </div>
      );
    }

    return (
      <Controller
        name={enhancedField.key}
        control={control}
        rules={{
          required: enhancedField.required
            ? `${enhancedField.label} is required`
            : false,
        }}
        render={({ field: controllerField, fieldState }) => {
          // Transform props for the actual field component
          const fieldProps = {
            field: enhancedField,
            name: enhancedField.key,
            label: enhancedField.label,
            value: controllerField.value ?? '',
            onChange: controllerField.onChange,
            onBlur: controllerField.onBlur,
            error: fieldState.error?.message,
            disabled: enhancedField.disabled,
            required: enhancedField.required,
            placeholder: enhancedField.placeholder,
            helpText: enhancedField.help_text,
            container,
            // Pass through any additional field-specific props
            ...enhancedField.props,
          };

          return <FieldComponent {...fieldProps} />;
        }}
      />
    );
  },
  (prev, next) => {
    // Custom comparison for memoization
    return (
      prev.formId === next.formId &&
      prev.field.key === next.field.key &&
      prev.field.type === next.field.type &&
      prev.container === next.container
    );
  }
);

FieldRenderer.displayName = 'FieldRenderer';
