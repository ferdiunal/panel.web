/**
 * RadioGroupFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart radio group implementasyonu (Form view)
 * Radio button grubu
 */

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareControl } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * RadioGroupFormField Component
 *
 * Mikro frontend pattern'ine uygun radio group component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Radio button grubu
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <RadioGroupFormField
 *   field={{
 *     key: 'gender',
 *     props: {
 *       options: [
 *         { value: 'male', label: 'Erkek' },
 *         { value: 'female', label: 'Kadın' }
 *       ]
 *     }
 *   }}
 *   name="gender"
 *   label="Cinsiyet"
 *   value={gender}
 *   onChange={setGender}
 * />
 * ```
 */
export const RadioGroupFormField: React.FC<FormFieldProps> = ({
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
  const options: RadioOption[] = Array.isArray(rawOptions)
    ? rawOptions.map((opt) => ({
        value: String(opt.value),
        label: String(opt.label),
        disabled: opt.disabled,
      }))
    : [];
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
        groupClassName={addons.startAddon || addons.endAddon ? 'h-auto min-h-9' : undefined}
        controlClassName={addons.startAddon || addons.endAddon ? 'items-start px-2.5 py-2' : undefined}
      >
        <RadioGroup
          value={value || ''}
          onValueChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`${name}-${option.value}`}
                disabled={disabled || option.disabled}
              />
              <Label
                htmlFor={`${name}-${option.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </AddonAwareControl>
    </FieldLayout>
  );
};

RadioGroupFormField.displayName = 'RadioGroupFormField';
