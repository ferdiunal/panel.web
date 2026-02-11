/**
 * RichTextIndexField - RichText Field Index View Component
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

export const RichTextIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';
  const plainText = typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : '';
  const displayValue = plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;

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
      <span className={cn('text-sm line-clamp-2', alignmentClass)}>
        {displayValue || '—'}
      </span>
    </FieldLayout>
  );
};

RichTextIndexField.displayName = 'RichTextIndexField';
