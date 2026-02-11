/**
 * DialogFormField - Mikro Frontend Pattern
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

export const DialogFormField: React.FC<FormFieldProps> = ({
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
  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <Input
        id={name}
        name={name}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive/20'
        )}
      />
    </FieldLayout>
  );
};

DialogFormField.displayName = 'DialogFormField';
