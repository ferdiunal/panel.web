import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface BooleanGroupFieldProps {
  name: string;
  label: string;
  value: string[] | Record<string, boolean>;
  onChange: (value: Record<string, boolean>) => void;
  options: Record<string, string>; // key: label
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
}

/**
 * BooleanGroupField Component
 *
 * A checkbox group field component for multiple boolean selections.
 * Each checkbox represents a boolean option that can be independently toggled.
 */
export const BooleanGroupField: React.FC<BooleanGroupFieldProps> = ({
  name,
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  helpText,
  className,
}) => {
  // Normalize value to Record<string, boolean>
  const normalizedValue: Record<string, boolean> = React.useMemo(() => {
    if (Array.isArray(value)) {
      return value.reduce((acc, key) => ({ ...acc, [key]: true }), {});
    }
    return value || {};
  }, [value]);

  const handleChange = (key: string, checked: boolean) => {
    const newValue = { ...normalizedValue, [key]: checked };
    onChange(newValue);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="space-y-3">
        {Object.entries(options).map(([key, optionLabel]) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              id={`${name}-${key}`}
              checked={normalizedValue[key] || false}
              onCheckedChange={(checked) => handleChange(key, checked as boolean)}
              disabled={disabled}
            />
            <label
              htmlFor={`${name}-${key}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {optionLabel}
            </label>
          </div>
        ))}
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
};

BooleanGroupField.displayName = 'BooleanGroupField';
