/**
 * DateTimeIndexField - DateTime Field Index View Component
 *
 * Index view (tablo/liste) için datetime field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React, { useMemo } from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import { formatDateTimeForDisplay } from '@/lib/date-display';
import type { IndexFieldProps } from '@/types';

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

  // Datetime formatla
  const formattedValue = useMemo((): string => {
    const formatKey = typeof field.props?.format === 'string' ? field.props.format : undefined;
    return formatDateTimeForDisplay(rawValue, formatKey, 'short');
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

DateTimeIndexField.displayName = 'DateTimeIndexField';
