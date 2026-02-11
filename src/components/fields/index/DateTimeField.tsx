/**
 * DateTimeIndexField - DateTime Field Index View Component
 *
 * Index view (tablo/liste) için datetime field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * Preset format map
 */
const PRESET_FORMATS: Record<string, string> = {
  short: 'MM/dd/yyyy HH:mm',
  medium: 'MMM d, yyyy HH:mm',
  long: 'MMMM d, yyyy HH:mm:ss',
  full: 'EEEE, MMMM d, yyyy HH:mm:ss',
};

/**
 * DateTimeIndexField Component
 *
 * Index view (tablo/liste) için datetime field component'i.
 * Datetime formatting ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Datetime formatting (preset veya custom)
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <DateTimeIndexField
 *   field={{
 *     key: 'published_at',
 *     name: 'Yayın Tarihi',
 *     text_align: 'left',
 *     props: { format: 'short' }
 *   }}
 *   record={{ published_at: '2024-01-01T12:00:00' }}
 * />
 * ```
 */
export const DateTimeIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];

  // Value'yu normalize et (Date object'e çevir)
  const normalizedValue = useMemo((): Date | undefined => {
    if (!rawValue) return undefined;
    if (rawValue instanceof Date) return rawValue;
    if (typeof rawValue === 'string') {
      const date = new Date(rawValue);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, [rawValue]);

  // Datetime formatla
  const formattedValue = useMemo((): string => {
    if (!normalizedValue) return '—';

    try {
      const formatStr = (field.props?.format as string) || 'short';
      const dateFormat = PRESET_FORMATS[formatStr] || formatStr;
      return format(normalizedValue, dateFormat);
    } catch (error) {
      console.error('Datetime formatlama hatası:', error);
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

DateTimeIndexField.displayName = 'DateTimeIndexField';
