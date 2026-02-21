/**
 * DialogDetailField - Mikro Frontend Pattern
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export const DialogDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      {value ? (
        <Badge variant="outline">{value}</Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

DialogDetailField.displayName = 'DialogDetailField';
