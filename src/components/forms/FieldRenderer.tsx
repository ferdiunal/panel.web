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

import React, { useMemo, useCallback, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useFieldUpdate } from '@/stores/form-state-store';
import { fieldRegistry } from './FieldRegistry';
import type { FieldDefinition } from '@/types/form';
import { searchRelationship } from '@/lib/relationship-api';
import { getFieldSpanClass } from '@/lib/field-span';
import { cn } from '@/lib/utils';
import { resolveWithProps } from '@/lib/with-props';

export interface FieldRendererProps {
  formId: string;
  field: FieldDefinition;
  container?: HTMLElement | null;
  parentResourceId?: string | number; // Parent resource ID (edit modunda kullanılır)
  parentResourceSlug?: string; // Parent resource slug (resourceType)
}

/**
 * FieldRenderer - Renders a single field with dependency updates
 */
export const FieldRenderer: React.FC<FieldRendererProps> = React.memo(
  ({ formId, field, container, parentResourceId, parentResourceSlug }) => {
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

    const spanClassName = useMemo(() => getFieldSpanClass(enhancedField), [enhancedField]);
    const resolvedWithProps = useMemo(
      () => resolveWithProps(enhancedField.props as Record<string, unknown> | undefined),
      [enhancedField.props]
    );

    useEffect(() => {
      console.log('[depends][frontend][renderer] field-update', {
        formId,
        fieldKey: field.key,
        fieldUpdate: fieldUpdate ?? null,
        nextState: {
          visible: enhancedField.visible ?? true,
          disabled: enhancedField.disabled ?? false,
          required: enhancedField.required ?? false,
        },
      });
    }, [formId, field.key, fieldUpdate, enhancedField.visible, enhancedField.disabled, enhancedField.required]);

    // Relationship field kontrolü ve searchFn memoization
    // Bu değerleri return branch'lerinden önce hesaplıyoruz ki hook sırası stabil kalsın.
    const relationshipViews = [
      'belongs-to-field',
      'has-one-field',
      'has-many-field',
      'belongs-to-many-field',
      'morph-to-field',
      'morph-to-many-field',
    ];
    const viewName = enhancedField.view || '';
    const isRelationshipField =
      ['belongs-to', 'has-one', 'has-many', 'belongs-to-many', 'morph-to', 'morph-to-many', 'relationship'].includes(enhancedField.type) ||
      relationshipViews.some((view) => viewName === view || viewName.startsWith(`${view}-`));
    const relatedResource = enhancedField.props?.related_resource;

    // searchFn'i useCallback ile memoize et - sonsuz render döngüsünü önler
    // Her render'da yeni fonksiyon oluşturmak yerine, sadece relatedResource değiştiğinde yeni fonksiyon oluştur
    const searchFn = useCallback(
      (query: string) => {
        if (relatedResource) {
          return searchRelationship(relatedResource, query);
        }
        return Promise.resolve([]);
      },
      [relatedResource]
    );

    // Skip hidden fields
    if (enhancedField.visible === false) {
      console.log('[depends][frontend][renderer] field-hidden', {
        formId,
        fieldKey: field.key,
      });
      return null;
    }

    // Get field component from registry
    // Strategy: Prefer 'type' based lookup first, then 'view' based
    // Backend types: "text", "tel", "code" -> Registry keys: "text-field-form", "tel-field-form", "code-field-form"

    const typeKey = `${enhancedField.type}-field-form`;
    const viewKey = `${enhancedField.view}-form`; // view usually includes "-field" suffix

    let FieldComponent = fieldRegistry.get(typeKey) || fieldRegistry.get(viewKey);

    // Fallback to direct view/type lookup if form-specific not found
    if (!FieldComponent) {
      FieldComponent = fieldRegistry.get(enhancedField.view) || fieldRegistry.get(enhancedField.type);
    }

    if (!FieldComponent) {
      console.warn(`No component registered for field type: ${enhancedField.type} or view: ${enhancedField.view}`);
      return (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
          <p className="text-sm text-yellow-800">
            Unknown field type: {enhancedField.type}
          </p>
        </div>
      );
    }

    return (
      <div
        className={cn('col-span-1', spanClassName, resolvedWithProps.className)}
        style={resolvedWithProps.style}
        {...resolvedWithProps.attributes}
      >
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
            // Backend props'ları ÖNCE spread et, sonra memoized değerler gelsin.
            // Böylece searchFn gibi memoized fonksiyonlar backend props tarafından
            // override edilemez ve stabil referanslarını korur.
            const fieldProps = {
              // Backend'den gelen field-specific props (options, types, vs.)
              ...enhancedField.props,
              // Core props — bunlar backend props'larını override eder
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
              type: enhancedField.type,
              container,
              // Relationship field'lar için memoized searchFn ve parentResourceId
              // En sonda olmalı — backend props tarafından override edilmemeli
              ...(isRelationshipField && relatedResource && {
                searchFn: searchFn,
                parentResourceId: parentResourceId,
                parentResourceSlug: parentResourceSlug,
              }),
            };

            return <FieldComponent {...fieldProps} />;
          }}
        />
      </div>
    );
  },
  (prev, next) => {
    // Custom comparison for memoization
    return (
      prev.formId === next.formId &&
      prev.field.key === next.field.key &&
      prev.field.type === next.field.type &&
      prev.container === next.container &&
      prev.parentResourceId === next.parentResourceId &&
      prev.parentResourceSlug === next.parentResourceSlug
    );
  }
);

FieldRenderer.displayName = 'FieldRenderer';
