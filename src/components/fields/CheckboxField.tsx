/**
 * CheckboxField Component
 *
 * Checkbox seçimi için kullanılan bileşen.
 * Tek bir checkbox veya checkbox grubu olarak kullanılabilir.
 *
 * Özellikler:
 * - Tek checkbox: Boolean değer döndürür
 * - Checkbox grubu: Seçili değerlerin array'ini döndürür
 * - Label, hata mesajı ve yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Tek checkbox
 * <CheckboxField
 *   name="terms"
 *   label="Kullanım koşullarını kabul ediyorum"
 *   checked={terms}
 *   onCheckedChange={setTerms}
 * />
 *
 * // Checkbox grubu
 * <CheckboxField
 *   name="interests"
 *   label="İlgi Alanları"
 *   options={[
 *     { value: 'sports', label: 'Spor' },
 *     { value: 'music', label: 'Müzik' },
 *     { value: 'tech', label: 'Teknoloji' }
 *   ]}
 *   value={interests}
 *   onChange={setInterests}
 * />
 * ```
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxFieldProps {
  name: string;
  label: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  /**
   * Tooltip metni - Label'ın yanında info ikonu ile gösterilir
   */
  tooltip?: string;

  // Tek checkbox modu
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;

  // Checkbox grubu modu
  options?: CheckboxOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
}

/**
 * CheckboxField Component
 *
 * Checkbox seçimi için esnek bileşen.
 * options prop'u varsa checkbox grubu, yoksa tek checkbox olarak çalışır.
 *
 * Tek Checkbox Modu:
 * - Boolean değer döndürür
 * - checked ve onCheckedChange prop'ları kullanılır
 *
 * Checkbox Grubu Modu:
 * - Seçili değerlerin array'ini döndürür
 * - options, value ve onChange prop'ları kullanılır
 */
export const CheckboxField = React.forwardRef<HTMLButtonElement, CheckboxFieldProps>(
  (
    {
      name,
      label,
      error,
      disabled = false,
      required = false,
      helpText,
      className,
      tooltip,
      checked,
      onCheckedChange,
      options,
      value = [],
      onChange,
    },
    ref
  ) => {
    // Checkbox grubu modu
    if (options && options.length > 0) {
      const handleCheckboxChange = (optionValue: string, isChecked: boolean) => {
        if (!onChange) return;

        if (isChecked) {
          // Değeri ekle
          onChange([...value, optionValue]);
        } else {
          // Değeri çıkar
          onChange(value.filter((v) => v !== optionValue));
        }
      };

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

          <div className="flex flex-col gap-2">
            {options.map((option) => {
              const isChecked = value.includes(option.value);
              const checkboxId = `${name}-${option.value}`;

              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={checkboxId}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(option.value, checked as boolean)
                    }
                    disabled={disabled || option.disabled}
                    aria-invalid={!!error}
                    aria-describedby={
                      error ? `${name}-error` : helpText ? `${name}-help` : undefined
                    }
                  />
                  <Label
                    htmlFor={checkboxId}
                    className={cn(
                      'text-sm font-normal cursor-pointer',
                      (disabled || option.disabled) && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>

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

    // Tek checkbox modu
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center space-x-2">
          <Checkbox
            ref={ref}
            id={name}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          />
          <Label
            htmlFor={name}
            className={cn(
              'text-sm font-medium cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
        </div>

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

CheckboxField.displayName = 'CheckboxField';
