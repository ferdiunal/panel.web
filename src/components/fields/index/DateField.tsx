/**
 * DateIndexField - Date Field Index View Component
 *
 * Index view (tablo/liste) için date field component'i.
 * Minimal, salt okunur görünüm sağlar.
 *
 * # Özellikler
 *
 * - **Minimal Design**: Tablo hücresi için optimize edilmiş minimal görünüm
 * - **Date Formatting**: date-fns ile tarih formatlaması
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
 *     format: 'short', // veya 'medium', 'long', 'full', 'dd/MM/yyyy'
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
 * **Custom Formats:**
 * - `dd/MM/yyyy`: 01/01/2024
 * - `yyyy-MM-dd`: 2024-01-01
 * - `MMM d, yyyy`: Jan 1, 2024
 * - `EEEE, MMMM d, yyyy`: Monday, January 1, 2024
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
import { format } from 'date-fns';
import type { IndexFieldProps } from '@/types';

/**
 * Preset format map
 *
 * Kullanıcı dostu format isimleri → date-fns format string'leri
 */
const PRESET_FORMATS: Record<string, string> = {
  short: 'MM/dd/yyyy',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
};

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
 * 2. Format string'i belirle (preset veya custom)
 * 3. date-fns format fonksiyonu ile formatla
 *
 * # Props (field.props)
 *
 * - **format**: Tarih format'ı (preset veya custom, varsayılan: 'medium')
 * - **copyable**: Kopyalama özelliği aktif mi? (varsayılan: false)
 */
export const DateIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];

  /**
   * Value'yu normalize et (Date object'e çevir)
   *
   * Backend'den gelen value farklı format'larda olabilir:
   * - Date object → direkt kullan
   * - ISO string → Date'e çevir
   * - Date string → Date'e çevir
   * - undefined/null → undefined
   */
  const normalizedValue = useMemo((): Date | undefined => {
    if (!rawValue) return undefined;
    if (rawValue instanceof Date) return rawValue;
    if (typeof rawValue === 'string') {
      const date = new Date(rawValue);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, [rawValue]);

  /**
   * Tarih formatla
   *
   * 1. Format string'i belirle (preset veya custom)
   * 2. date-fns format fonksiyonu ile formatla
   */
  const formattedValue = useMemo((): string => {
    if (!normalizedValue) return '—';

    try {
      // Format string'i al (field.props.format veya varsayılan 'medium')
      const formatStr = (field.props?.format as string) || 'medium';

      // Preset format mı yoksa custom format mı?
      const dateFormat = PRESET_FORMATS[formatStr] || formatStr;

      // Formatla
      return format(normalizedValue, dateFormat);
    } catch (error) {
      console.error('Tarih formatlama hatası:', error);
      return '—';
    }
  }, [normalizedValue, field.props?.format]);

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
