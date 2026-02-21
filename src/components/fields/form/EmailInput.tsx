/**
 * EmailFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart email input implementasyonu (Form view)
 * HTML5 email validation desteği ile
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareInput } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

/**
 * EmailFormField Component
 *
 * Mikro frontend pattern'ine uygun email input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - HTML5 email validation (type="email")
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <EmailFormField
 *   field={{ key: 'email' }}
 *   name="email"
 *   label="E-posta"
 *   value={email}
 *   onChange={setEmail}
 *   placeholder="ornek@email.com"
 * />
 * ```
 */
export const EmailFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = 'ornek@email.com',
  helpText,
  startAddon,
  endAddon,
}) => {
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

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
        type="email"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
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

EmailFormField.displayName = 'EmailFormField';
