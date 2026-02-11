/**
 * TextIndexField - Text Input Index View Component
 *
 * Index view (tablo/liste) için text input field component'i.
 * Minimal, salt okunur görünüm sağlar.
 *
 * # Özellikler
 *
 * - **Minimal Design**: Tablo hücresi için optimize edilmiş minimal görünüm
 * - **Text Alignment**: field.text_align property'sine göre hizalama
 * - **Copyable Desteği**: field.props.copyable ile kopyalama özelliği
 * - **Truncate Desteği**: Uzun metinleri kesmek için truncate özelliği
 * - **Salt Okunur**: Sadece görüntüleme, düzenleme yok
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * // Backend'den gelen field
 * {
 *   key: 'name',
 *   type: 'text',
 *   view: 'text-field-index',
 *   label: 'İsim',
 *   text_align: 'left',
 *   props: {
 *     copyable: true,
 *     truncate: true,
 *   },
 * }
 * ```
 *
 * # Text Alignment
 *
 * field.text_align property'sine göre:
 * - `left` → Sol hizalama (varsayılan)
 * - `center` → Orta hizalama
 * - `right` → Sağ hizalama
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * TextIndexField Component
 *
 * Index view (tablo/liste) için text input field component'i.
 * Minimal, salt okunur görünüm sağlar.
 *
 * # Value Extraction
 *
 * Value şu sırayla extract edilir:
 * 1. record[field.key]?.data (API response format)
 * 2. record[field.key] (direct value)
 * 3. '—' (empty placeholder)
 *
 * # Props (field.props)
 *
 * - **copyable**: Kopyalama özelliği aktif mi? (varsayılan: false)
 * - **truncate**: Uzun metinleri kes (varsayılan: false)
 * - **maxLength**: Maksimum karakter sayısı (truncate için)
 */
export const TextIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Props'tan truncate değerini al
  const truncate = field.props?.truncate as boolean | undefined;
  const maxLength = field.props?.maxLength as number | undefined;

  // Truncate işlemi (maxLength varsa)
  let displayValue = value;
  if (truncate && maxLength && typeof value === 'string' && value.length > maxLength) {
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
      <span className={cn('text-sm', alignmentClass)}>
        {displayValue || '—'}
      </span>
    </FieldLayout>
  );
};

TextIndexField.displayName = 'TextIndexField';
