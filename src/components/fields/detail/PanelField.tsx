/**
 * PanelDetailField - Mikro Frontend Pattern
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export const PanelDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      <div className="p-4 border rounded-md bg-muted/50">
        <p className="text-sm text-foreground">{value || '—'}</p>
      </div>
    </FieldLayout>
  );
};

PanelDetailField.displayName = 'PanelDetailField';
