/**
 * URLDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart URL display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * URLDetailField Component
 *
 * Mikro frontend pattern'ine uygun URL display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - External link icon
 * - Opens in new tab
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <URLDetailField
 *   field={{
 *     key: 'website',
 *     name: 'Website',
 *   }}
 *   record={{ website: 'https://example.com' }}
 * />
 * ```
 */
export const URLDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          {value}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

URLDetailField.displayName = 'URLDetailField';
