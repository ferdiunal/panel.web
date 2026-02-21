/**
 * TextFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart text input implementasyonu (Form view)
 * Input mask desteği ile
 */

import React from 'react';
import InputMask from 'react-input-mask';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareInput } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

/**
 * TextFormField Component
 *
 * Mikro frontend pattern'ine uygun text input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Input mask desteği (telefon, TC kimlik, tarih, kredi kartı vb.)
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Input Mask Desteği:
 * - Telefon: "(599) 999 99 99"
 * - TC Kimlik: "99999999999"
 * - Tarih: "99/99/9999"
 * - Kredi Kartı: "9999 9999 9999 9999"
 * - IBAN: "TR99 9999 9999 9999 9999 9999 99"
 *
 * Maske karakterleri:
 * - 9: Rakam (0-9)
 * - a: Harf (a-z, A-Z)
 * - *: Alfanumerik (harf veya rakam)
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Basit text input
 * <TextFormField
 *   field={{ key: 'name' }}
 *   name="name"
 *   label="İsim"
 *   value={name}
 *   onChange={setName}
 * />
 *
 * // Maskeli input (telefon)
 * <TextFormField
 *   field={{
 *     key: 'phone',
 *     props: {
 *       mask: '(599) 999 99 99',
 *       maskChar: '_'
 *     }
 *   }}
 *   name="phone"
 *   label="Telefon"
 *   value={phone}
 *   onChange={setPhone}
 *   placeholder="(5XX) XXX XX XX"
 * />
 * ```
 */
export const TextFormField: React.FC<FormFieldProps> = ({
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
  type,
  startAddon,
  endAddon,
}) => {
  // Input mask props (field.props'tan)
  const mask = field.props?.mask as string | undefined;
  const maskChar = (field.props?.maskChar as string) || '_';
  const alwaysShowMask = (field.props?.alwaysShowMask as boolean) || false;
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

  // Input için ortak props
  const inputProps = {
    id: name,
    name: name,
    type: type || 'text' as const,
    value: value || '',
    disabled: disabled,
    placeholder: placeholder,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : helpText ? `${name}-help` : undefined,
    className: cn(
      error && 'border-destructive focus-visible:ring-destructive/20'
    ),
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
      {/* Mask varsa InputMask kullan, yoksa normal Input kullan */}
      {mask ? (
        <InputMask
          mask={mask}
          value={value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={onBlur}
          maskChar={maskChar}
          alwaysShowMask={alwaysShowMask}
          disabled={disabled}
        >
          {(inputMaskProps: any) => (
            <AddonAwareInput
              {...inputMaskProps}
              {...inputProps}
              startAddon={addons.startAddon}
              endAddon={addons.endAddon}
            />
          )}
        </InputMask>
      ) : (
        <AddonAwareInput
          {...inputProps}
          startAddon={addons.startAddon}
          endAddon={addons.endAddon}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      )}
    </FieldLayout>
  );
};

TextFormField.displayName = 'TextFormField';
