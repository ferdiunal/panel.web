/**
 * PasswordDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart password display implementasyonu (Detail view)
 * Masked görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * PasswordDetailField Component
 *
 * Mikro frontend pattern'ine uygun password display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Masked görünüm (••••••••)
 * - Güvenlik için şifre gösterilmez
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <PasswordDetailField
 *   field={{
 *     key: 'password',
 *     name: 'Şifre',
 *   }}
 *   record={{ password: 'secret123' }}
 * />
 * ```
 */
export const PasswordDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key];

  // Şifre varsa masked göster
  const displayValue = value ? '••••••••' : '—';

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      <p className="text-sm text-muted-foreground">
        {displayValue}
      </p>
    </FieldLayout>
  );
};

PasswordDetailField.displayName = 'PasswordDetailField';
