/**
 * CheckboxFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart checkbox implementasyonu (Form view)
 * Boolean değer döndürür
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareControl } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

/**
 * CheckboxFormField Component
 *
 * Mikro frontend pattern'ine uygun checkbox component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Boolean değer döndürür
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <CheckboxFormField
 *   field={{ key: 'is_active' }}
 *   name="is_active"
 *   label="Aktif"
 *   value={isActive}
 *   onChange={setIsActive}
 * />
 * ```
 */
export const CheckboxFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helpText,
  startAddon,
  endAddon,
}) => {
  // Boolean değere çevir
  const checked = Boolean(value);
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
      <AddonAwareControl
        startAddon={addons.startAddon}
        endAddon={addons.endAddon}
        controlClassName={addons.startAddon || addons.endAddon ? 'px-2.5' : undefined}
      >
        <div className="flex items-center space-x-2">
          <Checkbox
            id={name}
            checked={checked}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          />
          <label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        </div>
      </AddonAwareControl>
    </FieldLayout>
  );
};

CheckboxFormField.displayName = 'CheckboxFormField';
