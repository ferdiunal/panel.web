/**
 * TelFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart tel input implementasyonu (Form view)
 * HTML5 tel validation desteği ile
 */

import React from 'react';
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareControl, AddonAwareInput } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

/**
 * TelFormField Component
 *
 * Mikro frontend pattern'ine uygun tel input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - Native mod: Standart HTML5 tel input (type="tel")
 * - Gelişmiş mod: PhoneInput (ülke seçimi, formatlama)
 * - Mask desteği: Native modda çalışır
 */
export const TelFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = '+90 (555) 123 45 67',
  helpText,
  startAddon,
  endAddon,
}) => {
  // Backend'den gelen props
  const native = field.props?.native as boolean | undefined;
  const mask = field.props?.mask as string | undefined;
  const defaultCountry = (field.props?.defaultCountry as any) || 'TR';
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

  // Native input kullanma koşulu: native prop true ise VEYA mask varsa
  const useNative = native || !!mask;

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      {useNative ? (
        <AddonAwareInput
          id={name}
          name={name}
          type="tel"
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
      ) : (
        <AddonAwareControl
          startAddon={addons.startAddon}
          endAddon={addons.endAddon}
          controlClassName={addons.startAddon || addons.endAddon ? 'px-1.5' : undefined}
        >
          <PhoneInput
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            defaultCountry={defaultCountry}
            className={cn(
              'w-full',
              addons.startAddon || addons.endAddon
                ? '[&_input]:h-full [&_input]:border-0 [&_input]:rounded-none [&_input]:bg-transparent [&_input]:px-0 [&_input]:shadow-none [&_input]:focus-visible:ring-0 [&_button]:h-full [&_button]:border-0 [&_button]:rounded-none [&_button]:bg-transparent [&_button]:shadow-none [&_button]:hover:bg-transparent'
                : '',
              error && '[&_input]:border-destructive [&_button]:border-destructive focus-within:[&_input]:ring-destructive/20'
            )}
          />
        </AddonAwareControl>
      )}
    </FieldLayout>
  );
};

TelFormField.displayName = 'TelFormField';
