/**
 * DateTimeDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart datetime display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

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
 * DateTimeDetailField Component
 *
 * Mikro frontend pattern'ine uygun datetime display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Datetime formatting (preset veya custom)
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <DateTimeDetailField
 *   field={{
 *     key: 'published_at',
 *     name: 'Yayın Tarihi',
 *     props: { format: 'medium' }
 *   }}
 *   record={{ published_at: '2024-01-01T12:00:00' }}
 * />
 * ```
 */
export const DateTimeDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
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
      const formatStr = (field.props?.format as string) || 'medium';
      const dateFormat = PRESET_FORMATS[formatStr] || formatStr;
      return format(normalizedValue, dateFormat);
    } catch (error) {
      console.error('Datetime formatlama hatası:', error);
      return '—';
    }
  }, [normalizedValue, field.props?.format]);

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      <p className="text-sm text-foreground">
        {formattedValue}
      </p>
    </FieldLayout>
  );
};

DateTimeDetailField.displayName = 'DateTimeDetailField';
