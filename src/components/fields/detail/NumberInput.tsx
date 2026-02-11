/**
 * NumberDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart number display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * NumberDetailField Component
 *
 * Mikro frontend pattern'ine uygun number display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Number formatting desteği
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <NumberDetailField
 *   field={{
 *     key: 'age',
 *     name: 'Yaş',
 *   }}
 *   record={{ age: 25 }}
 * />
 * ```
 */
export const NumberDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key];

  // Number'a çevir
  const value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
  const displayValue = !isNaN(value) ? value.toString() : '';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      <p className="text-sm text-foreground">
        {displayValue || '—'}
      </p>
    </FieldLayout>
  );
};

NumberDetailField.displayName = 'NumberDetailField';
