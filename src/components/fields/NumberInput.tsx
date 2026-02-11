/**
 * NumberInput - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart number input implementasyonu
 * Increment/decrement butonları ile
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { FieldLayout } from './FieldLayout';

export interface NumberInputProps {
  name: string;
  label?: string;
  value: number | string;
  onChange: (value: number | string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

/**
 * NumberInput Component
 *
 * Mikro frontend pattern'ine uygun number input component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Increment/decrement butonları
 * - Min/max değer kontrolü
 * - Step desteği
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri (aria-invalid, aria-describedby)
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Basit sayı girişi
 * <NumberInput
 *   name="age"
 *   label="Yaş"
 *   value={age}
 *   onChange={setAge}
 *   min={0}
 *   max={120}
 * />
 *
 * // Ondalık sayı girişi
 * <NumberInput
 *   name="price"
 *   label="Fiyat"
 *   value={price}
 *   onChange={setPrice}
 *   min={0}
 *   step={0.01}
 *   placeholder="0.00"
 * />
 *
 * // Zorunlu alan
 * <NumberInput
 *   name="quantity"
 *   label="Miktar"
 *   value={quantity}
 *   onChange={setQuantity}
 *   min={1}
 *   required
 *   error={errors.quantity}
 * />
 * ```
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
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
      min,
      max,
      step = 1,
      className,
    },
    ref
  ) => {
    const handleIncrement = () => {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      const newValue = numValue + step;
      if (max === undefined || newValue <= max) {
        onChange(newValue);
      }
    };

    const handleDecrement = () => {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      const newValue = numValue - step;
      if (min === undefined || newValue >= min) {
        onChange(newValue);
      }
    };

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
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && (typeof value === 'string' ? parseFloat(value) || 0 : value) <= min)}
            className="h-9 w-9 p-0"
            aria-label="Decrease value"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            ref={ref}
            id={name}
            name={name}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            className={cn(
              'flex-1',
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && (typeof value === 'string' ? parseFloat(value) || 0 : value) >= max)}
            className="h-9 w-9 p-0"
            aria-label="Increase value"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </FieldLayout>
    );
  }
);

NumberInput.displayName = 'NumberInput';
