/**
 * EmailDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart email display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * EmailDetailField Component
 *
 * Mikro frontend pattern'ine uygun email display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Email link desteği (mailto:)
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <EmailDetailField
 *   field={{
 *     key: 'email',
 *     name: 'E-posta',
 *   }}
 *   record={{ email: 'ornek@email.com' }}
 * />
 * ```
 */
export const EmailDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
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
          href={`mailto:${value}`}
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

EmailDetailField.displayName = 'EmailDetailField';
