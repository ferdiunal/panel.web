/**
 * DialogIndexField - Dialog Field Index View Component
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

export const DialogIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';

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
        {value || '—'}
      </span>
    </FieldLayout>
  );
};

DialogIndexField.displayName = 'DialogIndexField';
