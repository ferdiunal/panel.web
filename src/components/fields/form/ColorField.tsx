/**
 * ColorFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart color picker implementasyonu (Form view)
 * HTML5 color input
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareInput } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

/**
 * ColorFormField Component
 *
 * Mikro frontend pattern'ine uygun color picker component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - HTML5 color input
 * - Color preview
 * - Hata mesajı gösterimi
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <ColorFormField
 *   field={{ key: 'brand_color' }}
 *   name="brand_color"
 *   label="Marka Rengi"
 *   value={brandColor}
 *   onChange={setBrandColor}
 * />
 * ```
 */
export const ColorFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = '#000000',
  helpText,
  startAddon,
  endAddon,
}) => {
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <div className="flex gap-2">
        <Input
          id={name}
          name={name}
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            'w-20 h-10 p-1 cursor-pointer',
            error && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
        <AddonAwareInput
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          startAddon={addons.startAddon}
          endAddon={addons.endAddon}
          className={cn(
            'flex-1',
            error && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
      </div>
    </FieldLayout>
  );
};

ColorFormField.displayName = 'ColorFormField';
