/**
 * RichTextFormField - Mikro Frontend Pattern
 */

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

export const RichTextFormField: React.FC<FormFieldProps> = ({
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
  const rows = (field.props?.rows as number) || 8;

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <Textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive/20'
        )}
      />
    </FieldLayout>
  );
};

RichTextFormField.displayName = 'RichTextFormField';
