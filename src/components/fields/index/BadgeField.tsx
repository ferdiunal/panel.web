/**
 * BadgeIndexField - Badge Field Index View Component
 *
 * Index view (tablo/liste) için badge field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * BadgeIndexField Component
 *
 * Index view (tablo/liste) için badge field component'i.
 * Badge ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Badge variant desteği
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <BadgeIndexField
 *   field={{
 *     key: 'status',
 *     name: 'Durum',
 *     text_align: 'center',
 *     props: { variant: 'default' }
 *   }}
 *   record={{ status: 'Aktif' }}
 * />
 * ```
 */
export const BadgeIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Variant'ı al
  const variant = (field.props?.variant as 'default' | 'secondary' | 'destructive' | 'outline') || 'secondary';

  // Text alignment class'ı
  const textAlign = field.text_align || 'center';
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[textAlign] || 'justify-center';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
      hideLabel={true}
    >
      {value ? (
        <div className={cn('flex', alignmentClass)}>
          <Badge variant={variant}>
            {value}
          </Badge>
        </div>
      ) : (
        <span className={cn('text-sm text-muted-foreground', alignmentClass)}>—</span>
      )}
    </FieldLayout>
  );
};

BadgeIndexField.displayName = 'BadgeIndexField';
