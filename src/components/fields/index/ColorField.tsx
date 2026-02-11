/**
 * ColorIndexField - Color Field Index View Component
 *
 * Index view (tablo/liste) için color field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * ColorIndexField Component
 *
 * Index view (tablo/liste) için color field component'i.
 * Color preview box ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Color preview box
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <ColorIndexField
 *   field={{
 *     key: 'brand_color',
 *     name: 'Marka Rengi',
 *     text_align: 'center',
 *   }}
 *   record={{ brand_color: '#3b82f6' }}
 * />
 * ```
 */
export const ColorIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

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
        <div className={cn('flex items-center gap-2', alignmentClass)}>
          <div
            className="w-6 h-6 rounded border border-border"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-muted-foreground font-mono">{value}</span>
        </div>
      ) : (
        <span className={cn('text-sm text-muted-foreground', alignmentClass)}>—</span>
      )}
    </FieldLayout>
  );
};

ColorIndexField.displayName = 'ColorIndexField';
