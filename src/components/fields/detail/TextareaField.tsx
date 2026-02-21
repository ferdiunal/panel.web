/**
 * TextareaDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart textarea display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * TextareaDetailField Component
 *
 * Mikro frontend pattern'ine uygun textarea display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Çok satırlı metin gösterimi
 * - Whitespace korunur
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TextareaDetailField
 *   field={{
 *     key: 'description',
 *     name: 'Açıklama',
 *   }}
 *   record={{ description: 'Uzun açıklama metni...' }}
 * />
 * ```
 */
export const TextareaDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      <p className="text-sm text-foreground whitespace-pre-wrap">
        {value || '—'}
      </p>
    </FieldLayout>
  );
};

TextareaDetailField.displayName = 'TextareaDetailField';
