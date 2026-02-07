/**
 * TelInput Component
 *
 * Telefon numarası girişi için kullanılan bileşen.
 * İki mod destekler:
 * 1. PhoneInput modu: Uluslararası telefon numarası girişi (ülke seçimi, otomatik formatlama)
 * 2. Native modu: Basit HTML tel input (mask desteği ile)
 *
 * Özellikler:
 * - Otomatik mod seçimi (usePhoneInput prop'u ile)
 * - PhoneInput: Ülke bayrağı, kod seçimi, E.164 format
 * - Native: Input mask desteği, basit ve hızlı
 * - Label, hata mesajı ve yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // PhoneInput modu (gelişmiş)
 * <TelInput
 *   name="phone"
 *   label="Telefon Numarası"
 *   value={phone}
 *   onChange={setPhone}
 *   usePhoneInput
 *   defaultCountry="TR"
 * />
 *
 * // Native modu (basit, maskeli)
 * <TelInput
 *   name="phone"
 *   label="Telefon Numarası"
 *   value={phone}
 *   onChange={setPhone}
 *   mask="(599) 999 99 99"
 *   placeholder="(5XX) XXX XX XX"
 * />
 *
 * // Native modu (basit, maskesiz)
 * <TelInput
 *   name="phone"
 *   label="Telefon Numarası"
 *   value={phone}
 *   onChange={setPhone}
 *   placeholder="Telefon numaranızı girin"
 * />
 * ```
 */

import React from 'react';
import InputMask from 'react-input-mask';
import { PhoneInput } from '@/components/ui/phone-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Value as PhoneValue, Country } from 'react-phone-number-input';

export interface TelInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
  /**
   * Tooltip metni - Label'ın yanında info ikonu ile gösterilir
   */
  tooltip?: string;

  /**
   * PhoneInput modunu kullan (gelişmiş mod)
   * true: Uluslararası telefon numarası girişi (ülke seçimi, otomatik formatlama)
   * false/undefined: Native input kullan (basit mod, mask desteği ile)
   */
  usePhoneInput?: boolean;

  /**
   * PhoneInput için varsayılan ülke kodu
   * Sadece usePhoneInput={true} olduğunda kullanılır
   * Örnek: "TR", "US", "GB"
   */
  defaultCountry?: Country;

  /**
   * Native input için mask formatı
   * Sadece usePhoneInput={false} veya undefined olduğunda kullanılır
   * Örnek: "(599) 999 99 99"
   */
  mask?: string;

  /**
   * Mask için boş karakterleri temsil eden karakter
   * Varsayılan: "_"
   */
  maskChar?: string;

  /**
   * Maskeyi her zaman göster (focus olmasa bile)
   * Varsayılan: false
   */
  alwaysShowMask?: boolean;
}

/**
 * TelInput Component
 *
 * Telefon numarası girişi için esnek bileşen.
 * usePhoneInput prop'una göre PhoneInput veya native input kullanır.
 *
 * PhoneInput Modu (usePhoneInput={true}):
 * - Uluslararası telefon numarası desteği
 * - Ülke bayrağı ve kod seçimi
 * - Otomatik formatlama
 * - E.164 formatında değer döndürme
 *
 * Native Modu (usePhoneInput={false} veya undefined):
 * - Basit HTML tel input
 * - Opsiyonel mask desteği
 * - Hızlı ve hafif
 */
export const TelInput = React.forwardRef<HTMLInputElement, TelInputProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      placeholder,
      helpText,
      className,
      tooltip,
      usePhoneInput = false,
      defaultCountry = 'TR',
      mask,
      maskChar = '_',
      alwaysShowMask = false,
    },
    ref
  ) => {
    // PhoneInput modu
    if (usePhoneInput) {
      return (
        <div className={cn('flex flex-col gap-2', className)}>
          <div className="flex items-center gap-2">
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive">*</span>}
            </Label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <PhoneInput
            id={name}
            value={value as PhoneValue}
            onChange={(val) => onChange(val || '')}
            defaultCountry={defaultCountry}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />

          {error && (
            <p id={`${name}-error`} className="text-sm text-destructive">
              {error}
            </p>
          )}
          {helpText && !error && (
            <p id={`${name}-help`} className="text-sm text-muted-foreground">
              {helpText}
            </p>
          )}
        </div>
      );
    }

    // Native input modu
    const inputProps = {
      id: name,
      name: name,
      type: 'tel' as const,
      value: value,
      disabled: disabled,
      placeholder: placeholder,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${name}-error` : helpText ? `${name}-help` : undefined,
      className: cn(
        error && 'border-destructive focus-visible:ring-destructive/20'
      ),
    };

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-2">
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Mask varsa InputMask kullan, yoksa normal Input kullan */}
        {mask ? (
          <InputMask
            mask={mask}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            maskChar={maskChar}
            alwaysShowMask={alwaysShowMask}
            disabled={disabled}
          >
            {(inputMaskProps: any) => (
              <Input
                {...inputMaskProps}
                ref={ref}
                {...inputProps}
              />
            )}
          </InputMask>
        ) : (
          <Input
            ref={ref}
            {...inputProps}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          />
        )}

        {error && (
          <p id={`${name}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={`${name}-help`} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

TelInput.displayName = 'TelInput';
