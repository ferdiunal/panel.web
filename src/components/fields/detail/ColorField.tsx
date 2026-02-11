/**
 * ColorDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart color display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * ColorDetailField Component
 *
 * Mikro frontend pattern'ine uygun color display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Color preview box
 * - Hex code display
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <ColorDetailField
 *   field={{
 *     key: 'brand_color',
 *     name: 'Marka Rengi',
 *   }}
 *   record={{ brand_color: '#3b82f6' }}
 * />
 * ```
 */
export const ColorDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      {value ? (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border border-border"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-foreground font-mono">{value}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

ColorDetailField.displayName = 'ColorDetailField';
