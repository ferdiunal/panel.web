/**
 * SelectField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart select field implementasyonu
 * shadcn/ui Select component ile
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FieldLayout } from './FieldLayout';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  name: string;
  label?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options: SelectOption[];
  className?: string;
}

/**
 * SelectField Component
 *
 * Mikro frontend pattern'ine uygun select field component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - shadcn/ui Select component
 * - Dropdown seçim listesi
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri (aria-invalid, aria-describedby)
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Basit select field
 * <SelectField
 *   name="status"
 *   label="Durum"
 *   value={status}
 *   onChange={setStatus}
 *   options={[
 *     { value: 'active', label: 'Aktif' },
 *     { value: 'inactive', label: 'Pasif' }
 *   ]}
 * />
 *
 * // Zorunlu alan
 * <SelectField
 *   name="category"
 *   label="Kategori"
 *   value={category}
 *   onChange={setCategory}
 *   options={categories}
 *   required
 *   error={errors.category}
 * />
 *
 * // Placeholder ile
 * <SelectField
 *   name="country"
 *   label="Ülke"
 *   value={country}
 *   onChange={setCountry}
 *   options={countries}
 *   placeholder="Ülke seçin"
 *   helpText="Yaşadığınız ülkeyi seçin"
 * />
 * ```
 */
export const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
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
      options,
      className,
    },
    ref
  ) => {
    return (
      <FieldLayout
        name={name}
        label={label}
        error={error}
        required={required}
        helpText={helpText}
        disabled={disabled}
        className={className}
      >
        <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            id={name}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            className={cn(
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldLayout>
    );
  }
);

SelectField.displayName = 'SelectField';
