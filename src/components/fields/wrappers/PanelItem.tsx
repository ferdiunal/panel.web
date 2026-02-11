/**
 * PanelItem Wrapper Component
 *
 * Detail view field'ları için standart wrapper component'i.
 * Label ve value'yu horizontal layout ile gösterir.
 *
 * # Özellikler
 *
 * - **Horizontal Layout**: Label solda (1/4 width), value sağda (3/4 width)
 * - **Copyable Desteği**: Clipboard icon ile value'yu kopyalama
 * - **Responsive**: Mobilde vertical, desktop'ta horizontal layout
 * - **Mevcut UI Component'leri**: Field, FieldLabel kullanır
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <PanelItem field={field} copyable={field.props?.copyable}>
 *   <p className="text-sm">{value || '—'}</p>
 * </PanelItem>
 * ```
 *
 * # Layout
 *
 * Desktop (md+):
 * ```
 * ┌─────────────┬──────────────────────────────────┐
 * │ Label (1/4) │ Value (3/4)              [copy]  │
 * └─────────────┴──────────────────────────────────┘
 * ```
 *
 * Mobile:
 * ```
 * ┌──────────────────────────────────────────────┐
 * │ Label                                        │
 * │ Value                                [copy]  │
 * └──────────────────────────────────────────────┘
 * ```
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { FieldData } from '@/types';

/**
 * PanelItem Props Interface
 */
export interface PanelItemProps {
  /** Backend'den gelen field definition */
  field: FieldData;

  /** Label metni (opsiyonel - field.label kullanılır) */
  label?: string;

  /** Copyable özelliği aktif mi? (varsayılan: false) */
  copyable?: boolean;

  /** Kopyalanacak değer (opsiyonel - children'dan text extract edilir) */
  copyValue?: string;

  /** Field value component'i (children) */
  children: React.ReactNode;

  /** Ek CSS class'ları (opsiyonel) */
  className?: string;
}

/**
 * PanelItem Component
 *
 * Detail view field'ları için standart wrapper component'i.
 * Label ve value'yu horizontal layout ile gösterir.
 *
 * # Layout Davranışı
 *
 * - **Desktop (md+)**: Horizontal layout - Label solda (1/4), value sağda (3/4)
 * - **Mobile**: Vertical layout - Label üstte, value altta
 *
 * # Copyable Özelliği
 *
 * `copyable={true}` prop'u verilirse:
 * - Value'nun yanında clipboard icon gösterilir
 * - Icon'a tıklandığında value clipboard'a kopyalanır
 * - Kopyalama başarılı olursa icon 2 saniye boyunca check icon'a dönüşür
 *
 * # Value Extraction
 *
 * Kopyalanacak değer şu sırayla belirlenir:
 * 1. `copyValue` prop'u varsa onu kullan
 * 2. Children string ise onu kullan
 * 3. Children'dan text content'i extract et
 */
export const PanelItem: React.FC<PanelItemProps> = ({
  field,
  label,
  copyable = false,
  copyValue,
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  // Label metni (prop'tan veya field'dan)
  const labelText = label || field.label || field.name;

  /**
   * Value'yu clipboard'a kopyala
   *
   * Kopyalanacak değer şu sırayla belirlenir:
   * 1. copyValue prop'u
   * 2. children string ise children
   * 3. children'dan text content extract et
   */
  const handleCopy = async () => {
    try {
      let textToCopy = copyValue;

      // copyValue yoksa children'dan extract et
      if (!textToCopy) {
        if (typeof children === 'string') {
          textToCopy = children;
        } else {
          // React element'ten text content'i extract et
          const extractText = (node: React.ReactNode): string => {
            if (typeof node === 'string' || typeof node === 'number') {
              return String(node);
            }
            if (Array.isArray(node)) {
              return node.map(extractText).join('');
            }
            // @ts-ignore
            if (React.isValidElement(node) && node.props.children) {
              // @ts-ignore
              return extractText(node.props.children);
            }
            return '';
          };
          textToCopy = extractText(children);
        }
      }

      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Kopyalama başarısız:', error);
    }
  };

  return (
    <Field
      orientation="responsive"
      className={cn(
        'py-3 border-b border-border last:border-b-0',
        className
      )}
    >
      {/* Label (1/4 width on desktop) */}
      <FieldLabel className="text-sm font-medium text-muted-foreground md:w-1/4 md:flex-shrink-0">
        {labelText}
      </FieldLabel>

      {/* Value Container (3/4 width on desktop) */}
      <div className="flex items-start justify-between gap-2 md:w-3/4 md:flex-1">
        {/* Value Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Copy Button */}
        {copyable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleCopy}
                  aria-label="Kopyala"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Kopyalandı!' : 'Kopyala'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Field>
  );
};

PanelItem.displayName = 'PanelItem';
