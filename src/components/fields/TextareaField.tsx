import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface TextareaFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
}

/**
 * TextareaField Component
 * 
 * A textarea field component built with shadcn/ui Textarea.
 * Displays a label with optional required indicator, textarea field with character count,
 * error message below field if error exists, and optional help text.
 * 
 * Validates: Requirements 4.4
 */
export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
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
      maxLength,
      rows = 4,
      className,
    },
    ref
  ) => {
    const charCount = value.length;
    const charLimit = maxLength || 0;
    const showCharCount = maxLength !== undefined;

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {showCharCount && (
            <span className={cn(
              'text-xs',
              charCount > charLimit * 0.9 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {charCount}/{charLimit}
            </span>
          )}
        </div>
        <Textarea
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
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

TextareaField.displayName = 'TextareaField';
