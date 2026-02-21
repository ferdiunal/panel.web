/**
 * SwitchDetailField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart switch display implementasyonu (Detail view)
 * Read-only görünüm
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { DetailFieldProps } from '@/types';

/**
 * SwitchDetailField Component
 *
 * Mikro frontend pattern'ine uygun switch display component'i (Detail view)
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
 * <SwitchDetailField
 *   field={{
 *     key: 'is_active',
 *     name: 'Aktif',
 *   }}
 *   record={{ is_active: true }}
 * />
 * ```
 */
export const SwitchDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
  // Value'yu extract et ve boolean'a çevir
  const rawValue = record[field.key]?.data ?? record[field.key];
  const value = Boolean(rawValue);

  return (
    <FieldLayout
      name={field.key}
      label={field.label || field.name}
      helpText={field.help_text}
    >
      <Badge
        variant="outline"
        className={cn(
          'gap-1 border',
          value
            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : 'border-border bg-muted/60 text-muted-foreground',
        )}
      >
        <Check className="h-3 w-3" />
        <span>{value ? 'Aktif' : 'Pasif'}</span>
      </Badge>
    </FieldLayout>
  );
};

SwitchDetailField.displayName = 'SwitchDetailField';
