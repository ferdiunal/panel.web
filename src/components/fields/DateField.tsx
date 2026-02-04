import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export interface DateFieldProps {
  name: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

/**
 * DateField Component
 * 
 * A date picker field component built with shadcn/ui Calendar and Popover.
 * Displays a label with optional required indicator, date picker button with calendar,
 * error message below field if error exists, and optional help text.
 * Supports date selection through a calendar interface.
 * 
 * Validates: Requirements 4.8
 */
export const DateField = React.forwardRef<HTMLButtonElement, DateFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      placeholder = 'Pick a date',
      helpText,
      className,
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={name}
              variant="outline"
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground',
                error && 'border-destructive focus-visible:ring-destructive/20'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'PPP') : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              disabled={disabled}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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

DateField.displayName = 'DateField';
