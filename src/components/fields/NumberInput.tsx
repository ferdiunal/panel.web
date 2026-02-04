import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

export interface NumberInputProps {
  name: string;
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
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
 * A number input field component built with shadcn/ui Input.
 * Displays a label with optional required indicator, number input field with increment/decrement buttons,
 * error message below field if error exists, and optional help text.
 * 
 * Validates: Requirements 4.2
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
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
      <div className={cn('flex flex-col gap-2', className)}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
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

NumberInput.displayName = 'NumberInput';
