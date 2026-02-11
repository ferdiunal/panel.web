/**
 * AsyncComboboxDetailField - Mikro Frontend Pattern
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export const AsyncComboboxDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  const value = record[field.key]?.data || record[field.key] || '';
  const displayValue = typeof value === 'object' && value !== null 
    ? (value as any).label || (value as any).name || String((value as any).id || value)
    : String(value);

  const variant = (field.props?.variant as 'default' | 'secondary' | 'destructive' | 'outline') || 'secondary';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      {displayValue ? (
        <Badge variant={variant}>{displayValue}</Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

AsyncComboboxDetailField.displayName = 'AsyncComboboxDetailField';
