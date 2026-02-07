import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ColorFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  className?: string;
}

/**
 * ColorField Component
 *
 * A color picker field component with popover interface.
 * Supports hex color format with visual preview.
 */
export const ColorField: React.FC<ColorFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  helpText,
  className,
}) => {
  const colorValue = value || '#000000';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled={disabled}
            type="button"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: colorValue }}
              />
              <span>{colorValue}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <input
              type="color"
              value={colorValue}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-32 cursor-pointer rounded border"
              disabled={disabled}
            />
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
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
};

ColorField.displayName = 'ColorField';
