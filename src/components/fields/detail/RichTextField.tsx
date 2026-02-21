/**
 * RichTextDetailField - Mikro Frontend Pattern
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export const RichTextDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      <div 
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: value || '—' }}
      />
    </FieldLayout>
  );
};

RichTextDetailField.displayName = 'RichTextDetailField';
