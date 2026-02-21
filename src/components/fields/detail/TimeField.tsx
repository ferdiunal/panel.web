/**
 * TimeDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart time display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * TimeDetailField Component
 *
 * Mikro frontend pattern'ine uygun time display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Time formatting (HH:mm veya HH:mm:ss)
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TimeDetailField
 *   field={{
 *     key: 'start_time',
 *     name: 'Başlangıç Saati',
 *     props: { format: 'HH:mm:ss' }
 *   }}
 *   record={{ start_time: '14:30:00' }}
 * />
 * ```
 */
export const TimeDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];

  // Time formatla
  const formattedValue = useMemo((): string => {
    if (!rawValue) return '—';

    try {
      // Format string'i al (varsayılan: HH:mm)
      const formatStr = (field.props?.format as string) || 'HH:mm';

      // Eğer value string ise (HH:mm:ss formatında)
      if (typeof rawValue === 'string') {
        // Date object'e çevir (bugünün tarihi ile)
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

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      <p className="text-sm text-foreground">
        {formattedValue}
      </p>
    </FieldLayout>
  );
};

TimeDetailField.displayName = 'TimeDetailField';
