/**
 * TelIndexField - Tel Field Index View Component
 *
 * Index view (tablo/liste) için tel field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * TelIndexField Component
 *
 * Index view (tablo/liste) için tel field component'i.
 * Tel link ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Tel link desteği (tel:)
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TelIndexField
 *   field={{
 *     key: 'phone',
 *     name: 'Telefon',
 *     text_align: 'left',
 *   }}
 *   record={{ phone: '+905551234567' }}
 * />
 * ```
 */
export const TelIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Text alignment class'ı
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
      {value ? (
        <a
          href={`tel:${value}`}
          className={cn('text-sm text-primary hover:underline', alignmentClass)}
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      ) : (
        <span className={cn('text-sm text-muted-foreground', alignmentClass)}>—</span>
      )}
    </FieldLayout>
  );
};

TelIndexField.displayName = 'TelIndexField';
