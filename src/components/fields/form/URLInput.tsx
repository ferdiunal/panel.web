/**
 * URLFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart URL input implementasyonu (Form view)
 * HTML5 URL validation desteği ile
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

/**
 * URLFormField Component
 *
 * Mikro frontend pattern'ine uygun URL input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - HTML5 URL validation (type="url")
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <URLFormField
 *   field={{ key: 'website' }}
 *   name="website"
 *   label="Website"
 *   value={website}
 *   onChange={setWebsite}
 * />
 * ```
 */
export const URLFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = 'https://example.com',
  helpText,
}) => {
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
        type="url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
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

URLFormField.displayName = 'URLFormField';
