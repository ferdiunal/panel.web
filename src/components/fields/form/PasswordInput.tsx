/**
 * PasswordFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart password input implementasyonu (Form view)
 * Show/hide toggle ile
 */

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <div className="relative">
        <Input
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
          className={cn(
            'pr-10',
            error && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </FieldLayout>
  );
};

PasswordFormField.displayName = 'PasswordFormField';
