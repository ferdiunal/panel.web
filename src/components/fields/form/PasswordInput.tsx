/**
 * PasswordFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart password input implementasyonu (Form view)
 * Show/hide toggle ile
 */

import React, { useState } from 'react';
import { InputGroupButton } from '@/components/ui/input-group';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareInput } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

/**
 * PasswordFormField Component
 *
 * Mikro frontend pattern'ine uygun password input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Show/hide toggle
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <PasswordFormField
 *   field={{ key: 'password' }}
 *   name="password"
 *   label="Şifre"
 *   value={password}
 *   onChange={setPassword}
 * />
 * ```
 */
export const PasswordFormField: React.FC<FormFieldProps> = ({
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
  const [showPassword, setShowPassword] = useState(false);
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );
  const visibilityToggle = (
    <InputGroupButton
      type="button"
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => setShowPassword((prev) => !prev)}
      disabled={disabled}
      tabIndex={-1}
    >
      {showPassword ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </InputGroupButton>
  );
  const mergedEndAddon = addons.endAddon ? (
    <>
      {addons.endAddon}
      {visibilityToggle}
    </>
  ) : (
    visibilityToggle
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
        type={showPassword ? 'text' : 'password'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        startAddon={addons.startAddon}
        endAddon={mergedEndAddon}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive/20'
        )}
      />
    </FieldLayout>
  );
};

PasswordFormField.displayName = 'PasswordFormField';
