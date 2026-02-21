/**
 * NumberFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart number input implementasyonu (Form view)
 * Increment/decrement butonları ile
 */

import React from 'react';
import InputMask from 'react-input-mask';
import { InputGroupText } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareInput } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

function parseBooleanProp(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }
  return undefined;
}

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
  startAddon,
  endAddon,
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
  const showControlsProp = parseBooleanProp(field.props?.showControls);
  const hideControlsProp =
    parseBooleanProp(field.props?.hideControls) ??
    parseBooleanProp((field.props as any)?.hide_controls);
  const showControls = showControlsProp ?? !(hideControlsProp ?? false);
  const isMoneyField = fieldType === 'money' || (fieldView || '').includes('money-field');
  const useSimpleInput = native || isMoneyField || !showControls;
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );
  const resolvedStartAddon = isMoneyField && showCurrency
    ? (
      <>
        <InputGroupText>{currency}</InputGroupText>
        {typeof addons.startAddon === 'string' || typeof addons.startAddon === 'number'
          ? <InputGroupText>{addons.startAddon}</InputGroupText>
          : addons.startAddon}
      </>
    )
    : addons.startAddon;

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
      {useSimpleInput ? (
        mask ? (
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
                id={name}
                name={name}
                type="text"
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                startAddon={resolvedStartAddon}
                endAddon={addons.endAddon}
                className={cn(error && 'border-destructive focus-visible:ring-destructive/20')}
              />
            )}
          </InputMask>
        ) : (
          <AddonAwareInput
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
            startAddon={resolvedStartAddon}
            endAddon={addons.endAddon}
            className={cn(
              !native &&
                !isMoneyField &&
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
        )
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
          <AddonAwareInput
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
            startAddon={addons.startAddon}
            endAddon={addons.endAddon}
            groupClassName="flex-1"
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
