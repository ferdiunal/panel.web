/**
 * SwitchFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart switch implementasyonu (Form view)
 * Boolean değer döndürür
 */

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

/**
 * SwitchFormField Component
 *
 * Mikro frontend pattern'ine uygun switch component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Toggle switch UI
 * - Boolean değer döndürür
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <SwitchFormField
 *   field={{ key: 'is_active' }}
 *   name="is_active"
 *   label="Aktif"
 *   value={isActive}
 *   onChange={setIsActive}
 * />
 * ```
 */
export const SwitchFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helpText,
}) => {
  // Boolean değere çevir
  const checked = Boolean(value);

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <div className="flex items-center space-x-2">
        <Switch
          id={name}
          checked={checked}
          onCheckedChange={(checked) => onChange(checked)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        />
        <Label
          htmlFor={name}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </Label>
      </div>
    </FieldLayout>
  );
};

SwitchFormField.displayName = 'SwitchFormField';
