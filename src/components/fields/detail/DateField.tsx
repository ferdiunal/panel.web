/**
 * DateDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart date display implementasyonu (Detail view)
 * Date formatting desteği ile
 */

import React, { useMemo } from 'react';
import { FieldLayout } from '../FieldLayout';
import { formatDateForDisplay } from '@/lib/date-display';
import type { DetailFieldProps } from '@/types';

/**
 * DateDetailField Component
 *
 * Mikro frontend pattern'ine uygun date display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Date formatting (Intl preset'leri)
 * - Value normalization
 * - Empty value placeholder
 *
 * Format Options:
 * - short: 01/01/2024
 * - medium: Jan 1, 2024
 * - long: January 1, 2024 (varsayılan)
 * - full: Monday, January 1, 2024
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
   * Tarih formatla
   */
  const formattedValue = useMemo((): string => {
    const formatKey = typeof field.props?.format === 'string' ? field.props.format : undefined;
    return formatDateForDisplay(rawValue, formatKey, 'long');
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

DateDetailField.displayName = 'DateDetailField';
