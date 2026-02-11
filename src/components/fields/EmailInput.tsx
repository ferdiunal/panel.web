/**
 * EmailInput - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart email input implementasyonu
 * HTML5 email validation desteği ile
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FieldLayout } from './FieldLayout';

export interface EmailInputProps {
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

/**
 * EmailInput Component
 *
 * Mikro frontend pattern'ine uygun email input component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - HTML5 email validation (type="email")
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri (aria-invalid, aria-describedby)
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Basit email girişi
 * <EmailInput
 *   name="email"
 *   label="E-posta"
 *   value={email}
 *   onChange={setEmail}
 *   placeholder="ornek@email.com"
 * />
 *
 * // Zorunlu alan
 * <EmailInput
 *   name="email"
 *   label="E-posta Adresi"
 *   value={email}
 *   onChange={setEmail}
 *   required
 *   error={errors.email}
 * />
 *
 * // Yardım metni ile
 * <EmailInput
 *   name="email"
 *   label="İş E-postası"
 *   value={email}
 *   onChange={setEmail}
 *   helpText="Şirket e-posta adresinizi girin"
 * />
 * ```
 */
export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  (
    {
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
    },
    ref
  ) => {
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
          ref={ref}
          id={name}
          name={name}
          type="email"
          value={value}
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
  }
);

EmailInput.displayName = 'EmailInput';
