/**
 * SwitchIndexField - Switch Field Index View Component
 *
 * Index view (tablo/liste) için switch field component'i.
 * Minimal, salt okunur görünüm sağlar.
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import { Badge } from '@/components/ui/badge';
import type { IndexFieldProps } from '@/types';

/**
 * SwitchIndexField Component
 *
 * Index view (tablo/liste) için switch field component'i.
 * Icon ile minimal görünüm sağlar.
 *
 * Özellikler:
 * - FieldLayout kullanır (hideLabel=true)
 * - Check icon + badge gösterimi
 * - Text alignment desteği
 * - Salt okunur
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <SwitchIndexField
 *   field={{
 *     key: 'is_active',
 *     name: 'Aktif',
 *     text_align: 'center',
 *   }}
 *   record={{ is_active: true }}
 * />
 * ```
 */
export const SwitchIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
  // Value'yu extract et ve boolean'a çevir
  const rawValue = record[field.key]?.data ?? record[field.key];
  const value = Boolean(rawValue);

  // Text alignment class'ı
  const textAlign = field.text_align || 'center';
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[textAlign] || 'justify-center';

  return (
    <FieldLayout
      name={field.key}
      label={field.name || field.label}
      helpText={field.help_text}
      hideLabel={true}
    >
      <div className={cn('flex items-center', alignmentClass)}>
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
      </div>
    </FieldLayout>
  );
};

SwitchIndexField.displayName = 'SwitchIndexField';
