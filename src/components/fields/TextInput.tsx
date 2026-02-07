import React from 'react';
import InputMask from 'react-input-mask';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface TextInputProps {
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
 * Shadcn/ui Input bileşeni ile oluşturulmuş temel metin giriş alanı.
 * Opsiyonel olarak input maskesi desteği sağlar.
 *
 * Özellikler:
 * - Label ve zorunlu alan göstergesi
 * - Input maskesi desteği (telefon, TC kimlik, tarih, kredi kartı vb.)
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
 *
 * // Tarih maskeli giriş
 * <TextInput
 *   name="birthDate"
 *   label="Doğum Tarihi"
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   mask="99/99/9999"
 *   placeholder="GG/AA/YYYY"
 *   maskChar="_"
 *   alwaysShowMask
 * />
 * ```
 *
 * Validates: Requirements 4.1
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
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
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>

        {/* Mask varsa InputMask kullan, yoksa normal Input kullan */}
        {mask ? (
          <InputMask
            mask={mask}
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
            onChange={(e) => onChange(e.target.value)}
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

TextInput.displayName = 'TextInput';
