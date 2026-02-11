/**
 * RadioGroupIndexField - RadioGroup Field Index View Component
 *
 * Index view (tablo/liste) için radio group field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React, { useMemo } from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

export interface RadioOption {
  value: string;
  label: string;
}

/**
 * RadioGroupIndexField Component
 *
 * Index view (tablo/liste) için radio group field component'i.
 * Selected option label ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Option label mapping
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <RadioGroupIndexField
 *   field={{
 *     key: 'gender',
 *     name: 'Cinsiyet',
 *     text_align: 'left',
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
export const RadioGroupIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
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
      <span className={cn('text-sm', alignmentClass)}>
        {label || '—'}
      </span>
    </FieldLayout>
  );
};

RadioGroupIndexField.displayName = 'RadioGroupIndexField';
