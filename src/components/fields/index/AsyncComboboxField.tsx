/**
 * AsyncComboboxIndexField - AsyncCombobox Field Index View Component
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

export const AsyncComboboxIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';
  const displayValue = typeof value === 'object' && value !== null 
    ? (value as any).label || (value as any).name || String((value as any).id || value)
    : String(value);

  const textAlign = field.text_align || 'left';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign] || 'text-left';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
      hideLabel={true}
    >
      <span className={cn('text-sm', alignmentClass)}>
        {displayValue || '—'}
      </span>
    </FieldLayout>
  );
};

AsyncComboboxIndexField.displayName = 'AsyncComboboxIndexField';
