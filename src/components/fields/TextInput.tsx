/**
 * TextInput - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart text input implementasyonu
 * Mask ve tooltip desteği ile
 */

import React from 'react';
import InputMask from 'react-input-mask';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldLayout } from './FieldLayout';

export interface TextInputProps {
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
  /**
   * Tooltip metni - Label'ın yanında info ikonu ile gösterilir
   * Form, index ve detail sayfalarında kullanılabilir
   */
  tooltip?: string;
  /**
   * Input maskesi (opsiyonel)
   * Örnek formatlar:
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
   */
  mask?: string;
  /**
   * Maske için boş karakterleri temsil eden karakter
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
 * TextInput Component
 *
 * Mikro frontend pattern'ine uygun text input component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Input maskesi desteği (telefon, TC kimlik, tarih, kredi kartı vb.)
 * - Tooltip desteği
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri (aria-invalid, aria-describedby)
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Basit metin girişi
 * <TextInput
 *   name="username"
 *   label="Kullanıcı Adı"
 *   value={username}
 *   onChange={setUsername}
 * />
 *
 * // Telefon numarası maskeli giriş
 * <TextInput
 *   name="phone"
 *   label="Telefon Numarası"
 *   value={phone}
 *   onChange={setPhone}
 *   mask="(599) 999 99 99"
 *   placeholder="(5XX) XXX XX XX"
 * />
 *
 * // TC Kimlik No maskeli giriş
 * <TextInput
 *   name="tcNo"
 *   label="TC Kimlik No"
 *   value={tcNo}
 *   onChange={setTcNo}
 *   mask="99999999999"
 *   required
 * />
 * ```
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
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
      className,
      tooltip,
      mask,
      maskChar = '_',
      alwaysShowMask = false,
    },
    ref
  ) => {
    // Input bileşeni için ortak props
    const inputProps = {
      id: name,
      name: name,
      type: 'text' as const,
      value: value || '',
      disabled: disabled,
      placeholder: placeholder,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${name}-error` : helpText ? `${name}-help` : undefined,
      className: cn(
        error && 'border-destructive focus-visible:ring-destructive/20'
      ),
    };

    // Tooltip varsa label'a ekle
    const labelContent = label && (
      <div className="flex items-center gap-2">
        <span>{label}</span>
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
    );

    return (
      <FieldLayout
        name={name}
        label={labelContent ? undefined : label}
        error={error}
        required={required}
        helpText={helpText}
        disabled={disabled}
        className={className}
        hideLabel={!!labelContent}
      >
        {/* Tooltip varsa custom label göster */}
        {labelContent && (
          <div className="mb-2">
            {labelContent}
            {required && (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            )}
          </div>
        )}

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
            onBlur={onBlur}
          />
        )}
      </FieldLayout>
    );
  }
);

TextInput.displayName = 'TextInput';
