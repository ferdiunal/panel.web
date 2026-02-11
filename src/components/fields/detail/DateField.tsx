/**
 * DateDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart date display implementasyonu (Detail view)
 * Date formatting desteği ile
 */

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * Preset format map
 */
const PRESET_FORMATS: Record<string, string> = {
  short: 'MM/dd/yyyy',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
};

/**
 * DateDetailField Component
 *
 * Mikro frontend pattern'ine uygun date display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Date formatting (preset veya custom)
 * - Value normalization
 * - Empty value placeholder
 *
 * Format Options:
 * - short: 01/01/2024
 * - medium: Jan 1, 2024
 * - long: January 1, 2024 (varsayılan)
 * - full: Monday, January 1, 2024
 * - Custom: 'dd/MM/yyyy', 'yyyy-MM-dd', vb.
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <DateDetailField
 *   field={{
 *     key: 'created_at',
 *     name: 'Oluşturulma Tarihi',
 *     props: { format: 'full' }
 *   }}
 *   record={{ created_at: '2024-01-01' }}
 * />
 * ```
 */
export const DateDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];

  /**
   * Value'yu normalize et (Date object'e çevir)
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
   */
  const formattedValue = useMemo((): string => {
    if (!normalizedValue) return '—';

    try {
      // Format string'i al (field.props.format veya varsayılan 'long')
      const formatStr = (field.props?.format as string) || 'long';

      // Preset format mı yoksa custom format mı?
      const dateFormat = PRESET_FORMATS[formatStr] || formatStr;

      // Formatla
      return format(normalizedValue, dateFormat);
    } catch (error) {
      console.error('Tarih formatlama hatası:', error);
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

DateDetailField.displayName = 'DateDetailField';
