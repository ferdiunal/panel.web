/**
 * BadgeDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart badge display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * BadgeDetailField Component
 *
 * Mikro frontend pattern'ine uygun badge display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Badge variant desteği
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <BadgeDetailField
 *   field={{
 *     key: 'status',
 *     name: 'Durum',
 *     props: { variant: 'default' }
 *   }}
 *   record={{ status: 'Aktif' }}
 * />
 * ```
 */
export const BadgeDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Variant'ı al
  const variant = (field.props?.variant as 'default' | 'secondary' | 'destructive' | 'outline') || 'default';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      {value ? (
        <Badge variant={variant}>
          {value}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

BadgeDetailField.displayName = 'BadgeDetailField';
