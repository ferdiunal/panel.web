import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export interface DateTimeFieldProps {
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
 * DateTimeField Component
 * 
 * A date and time picker field component built with shadcn/ui Calendar and Popover.
 * Displays a label with optional required indicator, date/time picker button with calendar and time input,
 * error message below field if error exists, and optional help text.
 * Supports date and time selection through a calendar interface and time input.
 * 
 * Validates: Requirements 4.9
 */
export const DateTimeField = React.forwardRef<HTMLButtonElement, DateTimeFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      placeholder = 'Pick a date and time',
      helpText,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const handleDateChange = (date: Date | undefined) => {
      if (date) {
        // Preserve the time if it exists
        if (value) {
          date.setHours(value.getHours());
          date.setMinutes(value.getMinutes());
        }
        onChange(date);
      } else {
        onChange(undefined);
      }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = e.target.value;
      if (time && value) {
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(value);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
      }
    };

    const timeValue = value
      ? format(value, 'HH:mm')
      : '';

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              {value ? format(value, 'PPP HH:mm') : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateChange}
                disabled={disabled}
                initialFocus
              />
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${name}-time`} className="text-sm font-medium">
                  Time
                </Label>
                <Input
                  id={`${name}-time`}
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  disabled={disabled || !value}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
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

DateTimeField.displayName = 'DateTimeField';
