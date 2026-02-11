/**
 * StandardTextField - Mikro Frontend Pattern Örneği
 *
 * FieldLayout kullanarak standart text field implementasyonu
 * Tüm field'lar bu pattern'i takip etmelidir
 */

import React from 'react';
import { FieldLayout } from './FieldLayout';
import { Input } from '@/components/ui/input';
import type { TextFieldProps } from './types';

/**
 * StandardTextField Component
 *
 * Mikro frontend pattern'ine uygun, standart text field component'i
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - BaseFieldProps'u extend eder (tutarlı props)
 * - Type-safe props interface
 * - Accessibility desteği
 * - Error handling
 *
 * Kullanım:
 * ```tsx
 * <StandardTextField
 *   name="email"
 *   label="Email"
 *   value={email}
 *   onChange={setEmail}
 *   type="email"
 *   required
 *   error={errors.email}
 * />
 * ```
 */
export const StandardTextField: React.FC<TextFieldProps> = ({
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
  className,
  type = 'text',
  maxLength,
  minLength,
  pattern,
  autoComplete,
}) => {
  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
      className={className}
    >
      <Input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        aria-required={required}
      />
    </FieldLayout>
  );
};

// Display name for debugging
StandardTextField.displayName = 'StandardTextField';
