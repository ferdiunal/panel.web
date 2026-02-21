/**
 * TextDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart text display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';
import { renderDisplayComponent } from '@/lib/display-components';

/**
 * TextDetailField Component
 *
 * Mikro frontend pattern'ine uygun text display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Format desteği (uppercase, lowercase, capitalize)
 * - Empty value placeholder
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <TextDetailField
 *   field={{
 *     key: 'name',
 *     name: 'İsim',
 *     props: { format: 'capitalize' }
 *   }}
 *   record={{ name: 'john doe' }}
 * />
 * ```
 */
export const TextDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  let value = record[field.key]?.data || record[field.key] || '';
  const displayComponent = renderDisplayComponent(value);

  // Format değerini al (opsiyonel)
  const format = field.props?.format as string | undefined;

  // Value formatla (format varsa)
  if (format && typeof value === 'string') {
    switch (format) {
      case 'uppercase':
        value = value.toUpperCase();
        break;
      case 'lowercase':
        value = value.toLowerCase();
        break;
      case 'capitalize':
        value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        break;
    }
  }

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      {displayComponent !== null ? (
        displayComponent
      ) : (
        <p className="text-sm text-foreground">
          {value || '—'}
        </p>
      )}
    </FieldLayout>
  );
};

TextDetailField.displayName = 'TextDetailField';
