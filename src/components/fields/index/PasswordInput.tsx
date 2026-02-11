/**
 * PasswordIndexField - Password Field Index View Component
 *
 * Index view (tablo/liste) için password field component'i.
 * Masked görünüm sağlar.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * PasswordIndexField Component
 *
 * Index view (tablo/liste) için password field component'i.
 * Güvenlik için masked görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Masked görünüm (••••••••)
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <PasswordIndexField
 *   field={{
 *     key: 'password',
 *     name: 'Şifre',
 *     text_align: 'left',
 *   }}
 *   record={{ password: 'secret123' }}
 * />
 * ```
 */
export const PasswordIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key];

  // Şifre varsa masked göster
  const displayValue = value ? '••••••••' : '—';

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
      <span className={cn('text-sm text-muted-foreground', alignmentClass)}>
        {displayValue}
      </span>
    </FieldLayout>
  );
};

PasswordIndexField.displayName = 'PasswordIndexField';
