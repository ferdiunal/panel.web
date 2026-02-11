/**
 * EmailIndexField - Email Field Index View Component
 *
 * Index view (tablo/liste) için email field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * EmailIndexField Component
 *
 * Index view (tablo/liste) için email field component'i.
 * Email link ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Email link desteği (mailto:)
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <EmailIndexField
 *   field={{
 *     key: 'email',
 *     name: 'E-posta',
 *     text_align: 'left',
 *   }}
 *   record={{ email: 'ornek@email.com' }}
 * />
 * ```
 */
export const EmailIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

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
      {value ? (
        <a
          href={`mailto:${value}`}
          className={cn('text-sm text-primary hover:underline', alignmentClass)}
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      ) : (
        <span className={cn('text-sm text-muted-foreground', alignmentClass)}>—</span>
      )}
    </FieldLayout>
  );
};

EmailIndexField.displayName = 'EmailIndexField';
