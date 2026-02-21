/**
 * BooleanGroupFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart boolean group implementasyonu (Form view)
 * Multiple checkbox grubu
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareControl } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

export interface BooleanOption {
  key: string;
  label: string;
}

/**
 * BooleanGroupFormField Component
 *
 * Mikro frontend pattern'ine uygun boolean group component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Multiple checkbox grubu
 * - Object değer döndürür { key: boolean }
 * - Hata mesajı gösterimi
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <BooleanGroupFormField
 *   field={{
 *     key: 'permissions',
 *     props: {
 *       options: [
 *         { key: 'read', label: 'Okuma' },
 *         { key: 'write', label: 'Yazma' }
 *       ]
 *     }
 *   }}
 *   name="permissions"
 *   label="İzinler"
 *   value={{ read: true, write: false }}
 *   onChange={setPermissions}
 * />
 * ```
 */
export const BooleanGroupFormField: React.FC<FormFieldProps> = ({
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
  const rawOptions = field.props?.options;
  const options: BooleanOption[] = Array.isArray(rawOptions)
    ? rawOptions.map((opt) => ({
        key: String(opt.key || opt.value),
        label: String(opt.label),
      }))
    : [];
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

  const values = (value as Record<string, boolean>) || {};

  const handleChange = (key: string, checked: boolean) => {
    onChange({ ...values, [key]: checked });
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
      <AddonAwareControl
        startAddon={addons.startAddon}
        endAddon={addons.endAddon}
        groupClassName={addons.startAddon || addons.endAddon ? 'h-auto min-h-9' : undefined}
        controlClassName={addons.startAddon || addons.endAddon ? 'items-start px-2.5 py-2' : undefined}
      >
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.key} className="flex items-center space-x-2">
              <Checkbox
                id={`${name}-${option.key}`}
                checked={Boolean(values[option.key])}
                onCheckedChange={(checked) => handleChange(option.key, Boolean(checked))}
                disabled={disabled}
              />
              <Label
                htmlFor={`${name}-${option.key}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </AddonAwareControl>
    </FieldLayout>
  );
};

BooleanGroupFormField.displayName = 'BooleanGroupFormField';
