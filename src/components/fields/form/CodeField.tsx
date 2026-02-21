/**
 * CodeFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart code editor implementasyonu (Form view)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareTextarea } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

export const CodeFormField: React.FC<FormFieldProps> = ({
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
  const rows = (field.props?.rows as number) || 10;
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <AddonAwareTextarea
        id={name}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        startAddon={addons.startAddon}
        endAddon={addons.endAddon}
        className={cn(
          'font-mono text-sm',
          error && 'border-destructive focus-visible:ring-destructive/20'
        )}
      />
    </FieldLayout>
  );
};

CodeFormField.displayName = 'CodeFormField';
