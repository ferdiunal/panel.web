/**
 * NumberFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart number input implementasyonu (Form view)
 * Increment/decrement butonları ile
 */

import React from 'react';
import InputMask from 'react-input-mask';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

/**
 * NumberFormField Component
 *
 * Mikro frontend pattern'ine uygun number input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Increment/decrement butonları
 * - Min/max değer kontrolü
 * - Step desteği
 * - Hata mesajı gösterimi
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <NumberFormField
 *   field={{ key: 'age', props: { min: 0, max: 120, step: 1 } }}
 *   name="age"
 *   label="Yaş"
 *   value={age}
 *   onChange={setAge}
 * />
 * ```
 */
export const NumberFormField: React.FC<FormFieldProps> = ({
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
}) => {
  const fieldType = (field as any).type as string | undefined;
  const fieldView = (field as any).view as string | undefined;
  const min = field.props?.min as number | undefined;
  const max = field.props?.max as number | undefined;
  const step = (field.props?.step as number) || 1;
  const native = field.props?.native as boolean | undefined;
  const mask = field.props?.mask as string | undefined;
  const maskChar = (field.props?.maskChar as string) || '_';
  const alwaysShowMask = (field.props?.alwaysShowMask as boolean) || false;
  const showCurrency = (field.props?.showCurrency as boolean | undefined) ?? true;
  const currency = ((field.props?.currency as string | undefined) || 'USD').toUpperCase();
  const isMoneyField = fieldType === 'money' || (fieldView || '').includes('money-field');

  const handleIncrement = () => {
    const currentValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const currentValue = typeof value === 'number' ? value : parseFloat(value as string) || 0;
    const newValue = currentValue - step;
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
    >
      {native || isMoneyField ? (
        <div className="flex items-center gap-2">
          {showCurrency && (
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {currency}
            </span>
          )}
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
                  id={name}
                  name={name}
                  type="text"
                  disabled={disabled}
                  placeholder={placeholder}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                  className={cn(error && 'border-destructive focus-visible:ring-destructive/20')}
                />
              )}
            </InputMask>
          ) : (
            <Input
              id={name}
              name={name}
              type={isMoneyField ? 'text' : 'number'}
              value={value || ''}
              onChange={(e) => onChange(
                isMoneyField
                  ? e.target.value
                  : (e.target.value ? parseFloat(e.target.value) : '')
              )}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
              className={cn(error && 'border-destructive focus-visible:ring-destructive/20')}
            />
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && (typeof value === 'number' ? value : parseFloat(value as string) || 0) <= min)}
            className="shrink-0"
            tabIndex={-1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id={name}
            name={name}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            className={cn(
              'text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && (typeof value === 'number' ? value : parseFloat(value as string) || 0) >= max)}
            className="shrink-0"
            tabIndex={-1}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </FieldLayout>
  );
};

NumberFormField.displayName = 'NumberFormField';
