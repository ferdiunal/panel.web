/**
 * TelDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart tel display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * TelDetailField Component
 *
 * Mikro frontend pattern'ine uygun tel display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Tel link desteği (tel:)
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TelDetailField
 *   field={{
 *     key: 'phone',
 *     name: 'Telefon',
 *   }}
 *   record={{ phone: '+905551234567' }}
 * />
 * ```
 */
export const TelDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      {value ? (
        <a
          href={`tel:${value}`}
          className="text-sm text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

TelDetailField.displayName = 'TelDetailField';
