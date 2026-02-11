/**
 * ComboboxDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart combobox display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export interface ComboboxOption {
  value: string;
  label: string;
}

/**
 * ComboboxDetailField Component
 *
 * Mikro frontend pattern'ine uygun combobox display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Badge ile görsel gösterim
 * - Option label mapping
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <ComboboxDetailField
 *   field={{
 *     key: 'category',
 *     name: 'Kategori',
 *     props: {
 *       options: [
 *         { value: '1', label: 'Kategori 1' },
 *         { value: '2', label: 'Kategori 2' }
 *       ]
 *     }
 *   }}
 *   record={{ category: '1' }}
 * />
 * ```
 */
export const ComboboxDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Options'ı normalize et
  const normalizedOptions = useMemo((): ComboboxOption[] => {
    const rawOptions = field.props?.options;
    if (!rawOptions) return [];

    if (Array.isArray(rawOptions)) {
      return rawOptions.map((opt) => ({
        value: String(opt.value),
        label: String(opt.label),
      }));
    }

    if (typeof rawOptions === 'object') {
      return Object.entries(rawOptions).map(([value, label]) => ({
        value: String(value),
        label: String(label),
      }));
    }

    return [];
  }, [field.props?.options]);

  // Value'dan label'ı bul
  const label = useMemo(() => {
    if (!value) return '';
    const option = normalizedOptions.find((opt) => opt.value === String(value));
    return option ? option.label : String(value);
  }, [value, normalizedOptions]);

  const variant = (field.props?.variant as 'default' | 'secondary' | 'destructive' | 'outline') || 'secondary';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
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

ComboboxDetailField.displayName = 'ComboboxDetailField';
