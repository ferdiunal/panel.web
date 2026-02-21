/**
 * RadioGroupDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart radio group display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

export interface RadioOption {
  value: string;
  label: string;
}

/**
 * RadioGroupDetailField Component
 *
 * Mikro frontend pattern'ine uygun radio group display component'i (Detail view)
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
 * <RadioGroupDetailField
 *   field={{
 *     key: 'gender',
 *     name: 'Cinsiyet',
 *     props: {
 *       options: [
 *         { value: 'male', label: 'Erkek' },
 *         { value: 'female', label: 'Kadın' }
 *       ]
 *     }
 *   }}
 *   record={{ gender: 'male' }}
 * />
 * ```
 */
export const RadioGroupDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  // Options'ı normalize et
  const normalizedOptions = useMemo((): RadioOption[] => {
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

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      {label ? (
        <Badge variant="secondary">
          {label}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      )}
    </FieldLayout>
  );
};

RadioGroupDetailField.displayName = 'RadioGroupDetailField';
