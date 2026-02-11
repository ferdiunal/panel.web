/**
 * BooleanGroupIndexField - BooleanGroup Field Index View Component
 *
 * Index view (tablo/liste) için boolean group field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * BooleanGroupIndexField Component
 *
 * Index view (tablo/liste) için boolean group field component'i.
 * Count ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Active count display
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <BooleanGroupIndexField
 *   field={{
 *     key: 'permissions',
 *     name: 'İzinler',
 *     text_align: 'center',
 *   }}
 *   record={{ permissions: { read: true, write: false } }}
 * />
 * ```
 */
export const BooleanGroupIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key] || {};
  const values = (rawValue as Record<string, boolean>) || {};

  // Active count hesapla
  const activeCount = Object.values(values).filter(Boolean).length;
  const totalCount = Object.keys(values).length;

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
        {totalCount > 0 ? `${activeCount}/${totalCount}` : '—'}
      </span>
    </FieldLayout>
  );
};

BooleanGroupIndexField.displayName = 'BooleanGroupIndexField';
