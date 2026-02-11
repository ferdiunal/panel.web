/**
 * CodeDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart code display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export const CodeDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';
  const language = (field.props?.language as string) || 'text';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
        <code className={`language-${language}`}>{value || '—'}</code>
      </pre>
    </FieldLayout>
  );
};

CodeDetailField.displayName = 'CodeDetailField';
