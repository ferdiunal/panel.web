/**
 * DateIndexField - Date Field Index View Component
 *
 * Index view (tablo/liste) için date field component'i.
 * Minimal, salt okunur görünüm sağlar.
 *
 * # Özellikler
 *
 * - **Minimal Design**: Tablo hücresi için optimize edilmiş minimal görünüm
 * - **Date Formatting**: Intl.DateTimeFormat ile tarih formatlaması
 * - **Format Customization**: field.props.format ile format özelleştirme
 * - **Text Alignment**: field.text_align property'sine göre hizalama
 * - **Copyable Desteği**: field.props.copyable ile kopyalama özelliği
 * - **Salt Okunur**: Sadece görüntüleme, düzenleme yok
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * // Backend'den gelen field
 * {
 *   key: 'created_at',
 *   type: 'date',
 *   view: 'date-field-index',
 *   label: 'Oluşturulma Tarihi',
 *   text_align: 'left',
 *   props: {
 *     format: 'short', // veya 'medium', 'long', 'full'
 *     copyable: true,
 *   },
 * }
 * ```
 *
 * # Date Format Options
 *
 * field.props.format ile format özelleştirilebilir:
 *
 * **Preset Formats:**
 * - `short`: 01/01/2024
 * - `medium`: Jan 1, 2024 (varsayılan)
 * - `long`: January 1, 2024
 * - `full`: Monday, January 1, 2024
 *
 * # Value Format
 *
 * Backend'den gelen value farklı format'larda olabilir:
 * - Date object: `new Date()`
 * - ISO string: `"2024-01-01T00:00:00Z"`
 * - Date string: `"2024-01-01"`
 *
 * Component, tüm format'ları Date object'e normalize eder.
 */

import React, { useMemo } from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import { formatDateForDisplay } from '@/lib/date-display';
import type { IndexFieldProps } from '@/types';

/**
 * DateIndexField Component
 *
 * Index view (tablo/liste) için date field component'i.
 * Tarih formatlaması ile minimal görünüm sağlar.
 *
 * # Value Normalization
 *
 * Backend'den gelen value farklı format'larda olabilir:
 * - Date object → direkt kullan
 * - ISO string → Date'e çevir
 * - Date string → Date'e çevir
 * - undefined/null → '—'
 *
 * # Date Formatting
 *
 * 1. Value'yu normalize et (Date object'e çevir)
 * 2. Format preset'ini belirle (short/medium/long/full)
 * 3. Intl.DateTimeFormat ile tarayıcı locale'ine göre formatla
 *
 * # Props (field.props)
 *
 * - **format**: Tarih format'ı (preset, varsayılan: 'medium')
 * - **copyable**: Kopyalama özelliği aktif mi? (varsayılan: false)
 */
export const DateIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];

  /**
   * Tarih formatla
   *
   * 1. Format preset'ini belirle
   * 2. Intl.DateTimeFormat ile formatla
   */
  const formattedValue = useMemo((): string => {
    const formatKey = typeof field.props?.format === 'string' ? field.props.format : undefined;
    return formatDateForDisplay(rawValue, formatKey, 'medium');
  }, [rawValue, field.props?.format]);

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
        {formattedValue}
      </span>
    </FieldLayout>
  );
};

DateIndexField.displayName = 'DateIndexField';
