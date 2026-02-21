/**
 * DateTimeFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart datetime input implementasyonu (Form view)
 * Tarih + saat girişi
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareInput } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

/**
 * DateTimeFormField Component
 *
 * Mikro frontend pattern'ine uygun datetime input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - HTML5 datetime-local input
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <DateTimeFormField
 *   field={{ key: 'published_at' }}
 *   name="published_at"
 *   label="Yayın Tarihi"
 *   value={publishedAt}
 *   onChange={setPublishedAt}
 * />
 * ```
 */
export const DateTimeFormField: React.FC<FormFieldProps> = ({
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
  startAddon,
  endAddon,
}) => {
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

  // Value'yu normalize et (datetime-local format: yyyy-MM-ddTHH:mm)
  const normalizedValue = useMemo((): string => {
    if (!value) return '';

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      date = new Date(value);
      if (isNaN(date.getTime())) return '';
    } else {
      return '';
    }

    // Format: yyyy-MM-ddTHH:mm
    return format(date, "yyyy-MM-dd'T'HH:mm");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      onChange(new Date(dateStr));
    } else {
      onChange(undefined);
    }
  };

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <AddonAwareInput
        id={name}
        name={name}
        type="datetime-local"
        value={normalizedValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        startAddon={addons.startAddon}
        endAddon={addons.endAddon}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive/20'
        )}
      />
    </FieldLayout>
  );
};

DateTimeFormField.displayName = 'DateTimeFormField';
