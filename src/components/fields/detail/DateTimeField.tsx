/**
 * DateTimeDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart datetime display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React, { useMemo } from 'react';
import { FieldLayout } from '../FieldLayout';
import { formatDateTimeForDisplay } from '@/lib/date-display';
import type { DetailFieldProps } from '@/types';

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

  // Datetime formatla
  const formattedValue = useMemo((): string => {
    const formatKey = typeof field.props?.format === 'string' ? field.props.format : undefined;
    return formatDateTimeForDisplay(rawValue, formatKey, 'medium');
  }, [rawValue, field.props?.format]);

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
