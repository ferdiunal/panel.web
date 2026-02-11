/**
 * BadgeFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart badge input implementasyonu (Form view)
 * Text input with badge preview
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

/**
 * BadgeFormField Component
 *
 * Mikro frontend pattern'ine uygun badge input component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Text input with badge preview
 * - Badge variant desteği
 * - Hata mesajı gösterimi
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <BadgeFormField
 *   field={{ key: 'status', props: { variant: 'default' } }}
 *   name="status"
 *   label="Durum"
 *   value={status}
 *   onChange={setStatus}
 * />
 * ```
 */
export const BadgeFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder,
  helpText,
}) => {
  const variant = (field.props?.variant as 'default' | 'secondary' | 'destructive' | 'outline') || 'default';

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <div className="space-y-2">
        <Input
          id={name}
          name={name}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
        {value && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Önizleme:</span>
            <Badge variant={variant}>{value}</Badge>
          </div>
        )}
      </div>
    </FieldLayout>
  );
};

BadgeFormField.displayName = 'BadgeFormField';
