/**
 * RadioGroupField Component
 *
 * Radio button grubu seçimi için kullanılan bileşen.
 * Birden fazla seçenek arasından tek bir seçim yapılmasını sağlar.
 *
 * Özellikler:
 * - Radio button grubu
 * - Tek seçim (mutually exclusive)
 * - Yatay veya dikey düzen
 * - Label, hata mesajı ve yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Dikey düzen (varsayılan)
 * <RadioGroupField
 *   name="gender"
 *   label="Cinsiyet"
 *   options={[
 *     { value: 'male', label: 'Erkek' },
 *     { value: 'female', label: 'Kadın' },
 *     { value: 'other', label: 'Diğer' }
 *   ]}
 *   value={gender}
 *   onChange={setGender}
 * />
 *
 * // Yatay düzen
 * <RadioGroupField
 *   name="status"
 *   label="Durum"
 *   options={[
 *     { value: 'active', label: 'Aktif' },
 *     { value: 'inactive', label: 'Pasif' }
 *   ]}
 *   value={status}
 *   onChange={setStatus}
 *   orientation="horizontal"
 * />
 * ```
 */

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupFieldProps {
  name: string;
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  /**
   * Tooltip metni - Label'ın yanında info ikonu ile gösterilir
   */
  tooltip?: string;
  /**
   * Radio button'ların düzeni
   * - vertical: Dikey düzen (varsayılan)
   * - horizontal: Yatay düzen
   */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * RadioGroupField Component
 *
 * Radio button grubu seçimi için bileşen.
 * Birden fazla seçenek arasından tek bir seçim yapılmasını sağlar.
 *
 * Özellikler:
 * - Tek seçim (mutually exclusive)
 * - Yatay veya dikey düzen
 * - Her seçenek için opsiyonel açıklama
 * - Erişilebilirlik desteği
 */
export const RadioGroupField = React.forwardRef<HTMLDivElement, RadioGroupFieldProps>(
  (
    {
      name,
      label,
      options,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      helpText,
      className,
      tooltip,
      orientation = 'vertical',
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">
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

        <RadioGroup
          ref={ref}
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          className={cn(
            orientation === 'horizontal' ? 'flex flex-row gap-4' : 'flex flex-col gap-3'
          )}
        >
          {options.map((option) => {
            const radioId = `${name}-${option.value}`;

            return (
              <div
                key={option.value}
                className={cn(
                  'flex items-start space-x-2',
                  orientation === 'horizontal' && 'items-center'
                )}
              >
                <RadioGroupItem
                  value={option.value}
                  id={radioId}
                  disabled={disabled || option.disabled}
                  className="mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor={radioId}
                    className={cn(
                      'text-sm font-normal cursor-pointer',
                      (disabled || option.disabled) && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </RadioGroup>

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

RadioGroupField.displayName = 'RadioGroupField';
