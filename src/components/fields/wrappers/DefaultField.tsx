/**
 * DefaultField Wrapper Component
 *
 * Form field'ları için standart wrapper component'i.
 * Label, error, help text rendering'i ve responsive layout desteği sağlar.
 *
 * # Özellikler
 *
 * - **Label Rendering**: Field label'ı ve required indicator
 * - **Error Rendering**: Validasyon hata mesajları
 * - **Help Text Rendering**: Yardım metni gösterimi
 * - **Responsive Layout**: field.stacked property'sine göre vertical/horizontal/responsive layout
 * - **Tooltip Desteği**: Label yanında info ikonu ile tooltip
 * - **Mevcut UI Component'leri**: Field, FieldLabel, FieldError, FieldDescription kullanır
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <DefaultField field={field} error={error} showHelpText={!!helpText}>
 *   <Input
 *     id={field.key}
 *     name={field.key}
 *     type="text"
 *     value={value}
 *     onChange={(e) => onChange(e.target.value)}
 *     disabled={field.disabled}
 *     placeholder={field.placeholder}
 *   />
 * </DefaultField>
 * ```
 *
 * # Layout Modes
 *
 * - **vertical**: Label üstte, input altta (varsayılan)
 * - **horizontal**: Label solda, input sağda
 * - **responsive**: Mobilde vertical, desktop'ta horizontal
 *
 * Layout mode, `field.stacked` property'sine göre belirlenir:
 * - `field.stacked === true` → vertical
 * - `field.stacked === false` → horizontal
 * - `field.stacked === undefined` → responsive (varsayılan)
 */

import React from 'react';
import { Info } from 'lucide-react';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { FieldDefinition } from '@/types';

/**
 * DefaultField Props Interface
 */
export interface DefaultFieldProps {
  /** Backend'den gelen field definition */
  field: FieldDefinition;

  /** Validasyon hata mesajı (opsiyonel) */
  error?: string;

  /** Yardım metni gösterilsin mi? (varsayılan: true) */
  showHelpText?: boolean;

  /** Tooltip metni (opsiyonel) - Label'ın yanında info ikonu ile gösterilir */
  tooltip?: string;

  /** Field input component'i (children) */
  children: React.ReactNode;

  /** Ek CSS class'ları (opsiyonel) */
  className?: string;
}

/**
 * DefaultField Component
 *
 * Form field'ları için standart wrapper component'i.
 * Mevcut UI component'lerini (Field, FieldLabel, FieldError, FieldDescription) kullanarak
 * label, error ve help text rendering'i yapar.
 *
 * # Layout Belirleme
 *
 * Layout mode, `field.stacked` property'sine göre belirlenir:
 * - `true` → vertical (label üstte, input altta)
 * - `false` → horizontal (label solda, input sağda)
 * - `undefined` → responsive (mobilde vertical, desktop'ta horizontal)
 *
 * # Required Indicator
 *
 * Field zorunlu ise (`field.required === true`), label'ın sonuna kırmızı yıldız (*) eklenir.
 *
 * # Tooltip Desteği
 *
 * `tooltip` prop'u verilirse, label'ın yanında info ikonu gösterilir.
 * İkon üzerine gelindiğinde tooltip açılır.
 *
 * # Error Handling
 *
 * Error mesajı varsa:
 * - Field component'ine `data-invalid="true"` attribute'u eklenir
 * - FieldError component'i ile error mesajı gösterilir
 * - Help text gizlenir (error mesajı önceliklidir)
 */
export const DefaultField: React.FC<DefaultFieldProps> = ({
  field,
  error,
  showHelpText = true,
  tooltip,
  children,
  className,
}) => {
  // Layout mode'u belirle
  // field.stacked === true → vertical
  // field.stacked === false → horizontal
  // field.stacked === undefined → responsive (varsayılan)
  const orientation = field.stacked === true
    ? 'vertical'
    : field.stacked === false
    ? 'horizontal'
    : 'responsive';

  // Help text gösterilecek mi?
  const shouldShowHelpText = showHelpText && field.help_text && !error;

  // Tooltip metni (prop'tan veya field'dan)
  const tooltipText = tooltip || (field.props?.tooltip as string);

  return (
    <Field
      orientation={orientation}
      data-invalid={!!error}
      data-disabled={field.disabled}
      className={className}
    >
      {/* Label ve Tooltip */}
      <FieldLabel htmlFor={field.key}>
        <span className="flex items-center gap-2">
          <span>
            {field.label}
            {field.required && (
              <span className="text-destructive ml-0.5">*</span>
            )}
          </span>

          {/* Tooltip Icon */}
          {tooltipText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltipText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </span>
      </FieldLabel>

      {/* Field Input (children) */}
      {children}

      {/* Error Message */}
      {error && <FieldError>{error}</FieldError>}

      {/* Help Text (sadece error yoksa göster) */}
      {shouldShowHelpText && (
        <FieldDescription>{field.help_text}</FieldDescription>
      )}
    </Field>
  );
};

DefaultField.displayName = 'DefaultField';
