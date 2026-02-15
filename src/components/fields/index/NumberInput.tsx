/**
 * NumberIndexField - Number Field Index View Component
 *
 * Index view (tablo/liste) için number field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';
import { formatMoneyFieldValue } from '@/lib/money-display';

/**
 * NumberIndexField Component
 *
 * Index view (tablo/liste) için number field component'i.
 * Number formatting ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Number formatting desteği
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <NumberIndexField
 *   field={{
 *     key: 'age',
 *     name: 'Yaş',
 *     text_align: 'right',
 *   }}
 *   record={{ age: 25 }}
 * />
 * ```
 */
export const NumberIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];
  const formattedMoneyValue = formatMoneyFieldValue({
    data: rawValue,
    type: field.type,
    view: field.view,
    props: field.props,
  });
  if (formattedMoneyValue !== null) {
    return (
      <FieldLayout
        name={field.key}
        label={field.name || field.label}
        helpText={field.help_text}
        hideLabel={true}
      >
        <span className={cn('text-sm', field.text_align === 'left' ? 'text-left' : field.text_align === 'center' ? 'text-center' : 'text-right')}>
          {formattedMoneyValue}
        </span>
      </FieldLayout>
    );
  }

  // Number'a çevir
  const value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
  const displayValue = !isNaN(value) ? value.toString() : '';

  // Text alignment class'ı
  const textAlign = field.text_align || 'right'; // Number'lar için varsayılan sağ hizalama
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign] || 'text-right';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
      hideLabel={true}
    >
      <span className={cn('text-sm', alignmentClass)}>
        {displayValue || '—'}
      </span>
    </FieldLayout>
  );
};

NumberIndexField.displayName = 'NumberIndexField';
