/**
 * TimeFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart time input implementasyonu (Form view)
 * HTML5 time input
 */

import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

/**
 * TimeFormField Component
 *
 * Mikro frontend pattern'ine uygun time input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - HTML5 time input
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TimeFormField
 *   field={{ key: 'start_time' }}
 *   name="start_time"
 *   label="Başlangıç Saati"
 *   value={startTime}
 *   onChange={setStartTime}
 * />
 * ```
 */
export const TimeFormField: React.FC<FormFieldProps> = ({
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
  // Value'yu normalize et (time format: HH:mm)
  const normalizedValue = useMemo((): string => {
    if (!value) return '';

    // Eğer value string ise (HH:mm:ss formatında)
    if (typeof value === 'string') {
      // HH:mm formatına çevir
      const parts = value.split(':');
      return `${parts[0] || '00'}:${parts[1] || '00'}`;
    }

    // Eğer value Date object ise
    if (value instanceof Date) {
      return format(value, 'HH:mm');
    }

    return '';
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    if (timeStr) {
      // HH:mm:ss formatına çevir
      onChange(`${timeStr}:00`);
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
      <Input
        id={name}
        name={name}
        type="time"
        value={normalizedValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive/20'
        )}
      />
    </FieldLayout>
  );
};

TimeFormField.displayName = 'TimeFormField';
