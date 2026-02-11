/**
 * CheckboxIndexField - Checkbox Field Index View Component
 *
 * Index view (tablo/liste) için checkbox field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { IndexFieldProps } from '@/types';

/**
 * CheckboxIndexField Component
 *
 * Index view (tablo/liste) için checkbox field component'i.
 * Icon ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Icon gösterimi (✓/✗)
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <CheckboxIndexField
 *   field={{
 *     key: 'is_active',
 *     name: 'Aktif',
 *     text_align: 'center',
 *   }}
 *   record={{ is_active: true }}
 * />
 * ```
 */
export const CheckboxIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et ve boolean'a çevir
  const rawValue = record[field.key]?.data ?? record[field.key];
  const value = Boolean(rawValue);

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
      <div className={cn('flex items-center', alignmentClass)}>
        {value ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </FieldLayout>
  );
};

CheckboxIndexField.displayName = 'CheckboxIndexField';
