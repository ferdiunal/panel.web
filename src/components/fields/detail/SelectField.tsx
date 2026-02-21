/**
 * SelectDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart select display implementasyonu (Detail view)
 * Badge gösterimi ile
 */

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * SelectDetailField Component
 *
 * Mikro frontend pattern'ine uygun select display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Badge gösterimi
 * - Option label mapping
 * - Multiple format support (object veya array)
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <SelectDetailField
 *   field={{
 *     key: 'status',
 *     name: 'Durum',
 *     props: {
 *       options: { 'active': 'Aktif', 'inactive': 'Pasif' },
 *       variant: 'default'
 *     }
 *   }}
 *   record={{ status: 'active' }}
 * />
 * ```
 */
export const SelectDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  /**
   * Options'ı normalize et
   */
  const normalizedOptions = useMemo((): SelectOption[] => {
    const rawOptions = field.props?.options;

    if (!rawOptions) {
      return [];
    }

    // Array format ise direkt kullan
    if (Array.isArray(rawOptions)) {
      return rawOptions.map((opt) => ({
        value: String(opt.value),
        label: String(opt.label),
      }));
    }

    // Object format ise normalize et
    if (typeof rawOptions === 'object') {
      return Object.entries(rawOptions).map(([value, label]) => ({
        value: String(value),
        label: String(label),
      }));
    }

    return [];
  }, [field.props?.options]);

  /**
   * Value'dan label'ı bul
   */
  const label = useMemo(() => {
    if (!value) return '';

    const option = normalizedOptions.find((opt) => opt.value === String(value));
    return option ? option.label : String(value);
  }, [value, normalizedOptions]);

  // Badge variant
  const variant = (field.props?.variant as 'default' | 'secondary' | 'destructive' | 'outline') || 'secondary';

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      {label ? (
        <Badge variant={variant}>
          {label}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

SelectDetailField.displayName = 'SelectDetailField';
