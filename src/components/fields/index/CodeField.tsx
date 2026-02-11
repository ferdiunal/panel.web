/**
 * CodeIndexField - Code Field Index View Component
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

export const CodeIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';
  const displayValue = typeof value === 'string' && value.length > 50 
    ? value.substring(0, 50) + '...' 
    : value;

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
      <code className={cn('text-xs bg-muted px-2 py-1 rounded', alignmentClass)}>
        {displayValue || '—'}
      </code>
    </FieldLayout>
  );
};

CodeIndexField.displayName = 'CodeIndexField';
