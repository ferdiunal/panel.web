/**
 * TextareaIndexField - Textarea Field Index View Component
 *
 * Index view (tablo/liste) için textarea field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * TextareaIndexField Component
 *
 * Index view (tablo/liste) için textarea field component'i.
 * Truncate ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Truncate desteği (uzun metinleri kısaltır)
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TextareaIndexField
 *   field={{
 *     key: 'description',
 *     name: 'Açıklama',
 *     text_align: 'left',
 *     props: { maxLength: 100 }
 *   }}
 *   record={{ description: 'Uzun açıklama metni...' }}
 * />
 * ```
 */
export const TextareaIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Truncate işlemi
  const maxLength = (field.props?.maxLength as number) || 100;
  let displayValue = value;
  if (typeof value === 'string' && value.length > maxLength) {
    displayValue = value.substring(0, maxLength) + '...';
  }

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
      <span className={cn('text-sm line-clamp-2', alignmentClass)}>
        {displayValue || '—'}
      </span>
    </FieldLayout>
  );
};

TextareaIndexField.displayName = 'TextareaIndexField';
