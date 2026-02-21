/**
 * BooleanGroupDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart boolean group display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * BooleanGroupDetailField Component
 *
 * Mikro frontend pattern'ine uygun boolean group display component'i (Detail view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Read-only görünüm
 * - Badge ile görsel gösterim
 * - Multiple values
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <BooleanGroupDetailField
 *   field={{
 *     key: 'permissions',
 *     name: 'İzinler',
 *     props: {
 *       options: [
 *         { key: 'read', label: 'Okuma' },
 *         { key: 'write', label: 'Yazma' }
 *       ]
 *     }
 *   }}
 *   record={{ permissions: { read: true, write: false } }}
 * />
 * ```
 */
export const BooleanGroupDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et
  const rawValue = record[field.key]?.data || record[field.key] || {};
  const values = (rawValue as Record<string, boolean>) || {};

  const rawOptions = field.props?.options;
  const options = Array.isArray(rawOptions)
    ? rawOptions.map((opt: any) => ({
        key: String(opt.key || opt.value),
        label: String(opt.label),
      }))
    : [];

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      <div className="flex flex-wrap gap-2">
        {options.map((option: any) => {
          const isChecked = Boolean(values[option.key]);
          return (
            <Badge
              key={option.key}
              variant={isChecked ? 'default' : 'secondary'}
              className="gap-1"
            >
              {isChecked ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>{option.label}</span>
            </Badge>
          );
        })}
      </div>
    </FieldLayout>
  );
};

BooleanGroupDetailField.displayName = 'BooleanGroupDetailField';
