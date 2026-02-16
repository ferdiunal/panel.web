/**
 * SelectFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart select field implementasyonu (Form view)
 * Multiple format support ile
 */

import React, { useEffect, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

function extractSelectScalarValue(rawValue: unknown): string | undefined {
  if (rawValue === null || rawValue === undefined) {
    return undefined;
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (!trimmed) return undefined;

    // Support JSON payloads like: {"data":"static_url"} or {"value":"static_url"}
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

function normalizeSelectValue(rawValue: unknown, options: SelectOption[]): string | undefined {
  const candidate = extractSelectScalarValue(rawValue);
  if (!candidate) return undefined;

  const exact = options.find((opt) => opt.value === candidate);
  if (exact) return exact.value;

  const lowered = candidate.toLowerCase();
  const byValueInsensitive = options.find((opt) => opt.value.toLowerCase() === lowered);
  if (byValueInsensitive) return byValueInsensitive.value;

  const byLabelInsensitive = options.find((opt) => opt.label.toLowerCase() === lowered);
  if (byLabelInsensitive) return byLabelInsensitive.value;

  return candidate;
}

/**
 * SelectOption Interface
 *
 * Select option için standart format
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * SelectFormField Component
 *
 * Mikro frontend pattern'ine uygun select field component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Multiple format support (object veya array)
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Object format options
 * <SelectFormField
 *   field={{
 *     key: 'status',
 *     props: {
 *       options: { 'active': 'Aktif', 'inactive': 'Pasif' }
 *     }
 *   }}
 *   name="status"
 *   label="Durum"
 *   value={status}
 *   onChange={setStatus}
 * />
 *
 * // Array format options
 * <SelectFormField
 *   field={{
 *     key: 'category',
 *     props: {
 *       options: [
 *         { value: '1', label: 'Kategori 1' },
 *         { value: '2', label: 'Kategori 2' }
 *       ]
 *     }
 *   }}
 *   name="category"
 *   label="Kategori"
 *   value={category}
 *   onChange={setCategory}
 *   required
 * />
 * ```
 */
export const SelectFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder,
  helpText,
}) => {
  /**
   * Options'ı normalize et
   *
   * field.props.options farklı format'larda gelebilir:
   * 1. Object format: { "1": "Option 1", "2": "Option 2" }
   * 2. Array format: [{ value: "1", label: "Option 1" }]
   *
   * Her iki format'ı da SelectOption[] array'ine dönüştür
   */
  const normalizedOptions = useMemo((): SelectOption[] => {
    const rawOptions = field.props?.options;

    if (!rawOptions) {
      return [];
    }

    // Array format ise direkt kullan
    if (Array.isArray(rawOptions)) {
      return rawOptions.map((opt) => ({
        value: String(opt.value),
        label: String(opt.label),
      }));
    }

    // Object format ise normalize et
    if (typeof rawOptions === 'object') {
      return Object.entries(rawOptions).map(([value, label]) => ({
        value: String(value),
        label: String(label),
      }));
    }

    return [];
  }, [field.props?.options]);

  const fieldDataValue = (field as { data?: unknown }).data;

  const normalizedValueFromField = useMemo(
    () => normalizeSelectValue(fieldDataValue, normalizedOptions),
    [fieldDataValue, normalizedOptions]
  );

  const normalizedValue = useMemo(
    () => normalizeSelectValue(value, normalizedOptions) ?? normalizedValueFromField,
    [value, normalizedOptions, normalizedValueFromField]
  );

  useEffect(() => {
    const valueFromForm = normalizeSelectValue(value, normalizedOptions);
    if (valueFromForm || !normalizedValueFromField) return;
    onChange(normalizedValueFromField);
  }, [value, normalizedOptions, normalizedValueFromField, onChange]);

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <Select
        value={normalizedValue}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={name}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive/20'
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldLayout>
  );
};

SelectFormField.displayName = 'SelectFormField';
