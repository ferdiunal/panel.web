import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SwitchFieldProps {
  name: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
}

/**
 * SwitchField Component
 * 
 * A toggle switch field component built with shadcn/ui Switch.
 * Displays a label with optional required indicator, toggle switch,
 * error message below field if error exists, and optional help text.
 * 
 * Validates: Requirements 4.10
 */
export const SwitchField = React.forwardRef<HTMLButtonElement, SwitchFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      helpText,
      className,
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-3">
          <Switch
            ref={ref}
            id={name}
            checked={value}
            onCheckedChange={onChange}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          />
          <Label htmlFor={name} className="text-sm font-medium cursor-pointer">
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

SwitchField.displayName = 'SwitchField';
