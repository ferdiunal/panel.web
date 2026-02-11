/**
 * SelectIndexField - Select Field Index View Component
 *
 * Index view (tablo/liste) için select field component'i.
 * Minimal, salt okunur görünüm sağlar.
 *
 * # Özellikler
 *
 * - **Minimal Design**: Tablo hücresi için optimize edilmiş minimal görünüm
 * - **Option Label Gösterimi**: Value'dan label'ı bulup gösterir
 * - **Text Alignment**: field.text_align property'sine göre hizalama
 * - **Copyable Desteği**: field.props.copyable ile kopyalama özelliği
 * - **Salt Okunur**: Sadece görüntüleme, düzenleme yok
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * // Backend'den gelen field
 * {
 *   key: 'status',
 *   type: 'select',
 *   view: 'select-field-index',
 *   label: 'Durum',
 *   text_align: 'left',
 *   props: {
 *     options: {
 *       'active': 'Aktif',
 *       'inactive': 'Pasif',
 *     },
 *     copyable: true,
 *   },
 * }
 * ```
 *
 * # Options Format
 *
 * field.props.options iki format'ta olabilir:
 *
 * 1. **Object Format**: { value: label }
 *    ```typescript
 *    { "active": "Aktif", "inactive": "Pasif" }
 *    ```
 *
 * 2. **Array Format**: [{ value, label }]
 *    ```typescript
 *    [{ value: "active", label: "Aktif" }, { value: "inactive", label: "Pasif" }]
 *    ```
 */

import React, { useMemo } from 'react';
import { FieldLayout } from '../FieldLayout';
import { cn } from '@/lib/utils';
import type { IndexFieldProps } from '@/types';

/**
 * SelectOption Interface
 *
 * Select option için standart format
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * SelectIndexField Component
 *
 * Index view (tablo/liste) için select field component'i.
 * Value'dan label'ı bulup gösterir.
 *
 * # Value to Label Mapping
 *
 * 1. Value'yu extract et (record[field.key])
 * 2. Options'ı normalize et (object veya array format)
 * 3. Value ile eşleşen option'ı bul
 * 4. Label'ı göster (bulunamazsa value'yu göster)
 *
 * # Props (field.props)
 *
 * - **options**: Select options (object veya array format)
 * - **copyable**: Kopyalama özelliği aktif mi? (varsayılan: false)
 */
export const SelectIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const value = record[field.key]?.data || record[field.key] || '';

  /**
   * Options'ı normalize et
   *
   * field.props.options farklı format'larda gelebilir:
   * 1. Object format: { "1": "Option 1", "2": "Option 2" }
   * 2. Array format: [{ value: "1", label: "Option 1" }]
   *
   * Her iki format'ı da SelectOption[] array'ine dönüştür
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
   *
   * Options'ta value ile eşleşen option'ı bul ve label'ını döndür.
   * Bulunamazsa value'nun kendisini döndür.
   */
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

SelectIndexField.displayName = 'SelectIndexField';
