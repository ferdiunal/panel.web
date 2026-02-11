/**
 * CheckboxDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart boolean display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * CheckboxDetailField Component
 *
 * Mikro frontend pattern'ine uygun boolean display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Badge ile görsel gösterim
 * - Icon desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <CheckboxDetailField
 *   field={{
 *     key: 'is_active',
 *     name: 'Aktif',
 *   }}
 *   record={{ is_active: true }}
 * />
 * ```
 */
export const CheckboxDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et ve boolean'a çevir
  const rawValue = record[field.key]?.data ?? record[field.key];
  const value = Boolean(rawValue);

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
    >
      <Badge variant={value ? 'default' : 'secondary'} className="gap-1">
        {value ? (
          <>
            <Check className="h-3 w-3" />
            <span>Evet</span>
          </>
        ) : (
          <>
            <X className="h-3 w-3" />
            <span>Hayır</span>
          </>
        )}
      </Badge>
    </FieldLayout>
  );
};

CheckboxDetailField.displayName = 'CheckboxDetailField';
