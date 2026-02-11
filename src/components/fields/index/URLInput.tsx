/**
 * URLIndexField - URL Field Index View Component
 *
 * Index view (tablo/liste) için URL field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * URLIndexField Component
 *
 * Index view (tablo/liste) için URL field component'i.
 * External link ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - External link icon
 * - Text alignment desteği
 * - Truncate desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <URLIndexField
 *   field={{
 *     key: 'website',
 *     name: 'Website',
 *     text_align: 'left',
 *   }}
 *   record={{ website: 'https://example.com' }}
 * />
 * ```
 */
export const URLIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Truncate işlemi
  const maxLength = (field.props?.maxLength as number) || 50;
  let displayValue = value;
  if (typeof value === 'string' && value.length > maxLength) {
    displayValue = value.substring(0, maxLength) + '...';
  }

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
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('inline-flex items-center gap-1 text-sm text-primary hover:underline', alignmentClass)}
          onClick={(e) => e.stopPropagation()}
        >
          {displayValue}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className={cn('text-sm text-muted-foreground', alignmentClass)}>—</span>
      )}
    </FieldLayout>
  );
};

URLIndexField.displayName = 'URLIndexField';
