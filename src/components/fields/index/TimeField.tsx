/**
 * TimeIndexField - Time Field Index View Component
 *
 * Index view (tablo/liste) için time field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * TimeIndexField Component
 *
 * Index view (tablo/liste) için time field component'i.
 * Time formatting ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Time formatting (HH:mm veya HH:mm:ss)
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TimeIndexField
 *   field={{
 *     key: 'start_time',
 *     name: 'Başlangıç Saati',
 *     text_align: 'center',
 *     props: { format: 'HH:mm' }
 *   }}
 *   record={{ start_time: '14:30:00' }}
 * />
 * ```
 */
export const TimeIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];

  // Time formatla
  const formattedValue = useMemo((): string => {
    if (!rawValue) return '—';

    try {
      const formatStr = (field.props?.format as string) || 'HH:mm';

      // Eğer value string ise (HH:mm:ss formatında)
      if (typeof rawValue === 'string') {
        const [hours, minutes, seconds] = rawValue.split(':');
        const date = new Date();
        date.setHours(parseInt(hours) || 0);
        date.setMinutes(parseInt(minutes) || 0);
        date.setSeconds(parseInt(seconds) || 0);
        return format(date, formatStr);
      }

      // Eğer value Date object ise
      if (rawValue instanceof Date) {
        return format(rawValue, formatStr);
      }

      return rawValue.toString();
    } catch (error) {
      console.error('Time formatlama hatası:', error);
      return '—';
    }
  }, [rawValue, field.props?.format]);

  // Text alignment class'ı
  const textAlign = field.text_align || 'center';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign] || 'text-center';

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

TimeIndexField.displayName = 'TimeIndexField';
