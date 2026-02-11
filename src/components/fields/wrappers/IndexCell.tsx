/**
 * IndexCell Wrapper Component
 *
 * Index view (tablo/liste) field'ları için minimal wrapper component'i.
 * Text alignment ve copyable desteği sağlar.
 *
 * # Özellikler
 *
 * - **Text Alignment**: field.text_align property'sine göre hizalama (left, center, right)
 * - **Copyable Desteği**: Clipboard icon ile value'yu kopyalama
 * - **Minimal Design**: Tablo hücresi için optimize edilmiş minimal görünüm
 * - **Truncate Desteği**: Uzun metinleri kesmek için truncate özelliği
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * <IndexCell field={field} copyable={field.props?.copyable}>
 *   <span className="text-sm">{value || '—'}</span>
 * </IndexCell>
 * ```
 *
 * # Text Alignment
 *
 * field.text_align property'sine göre:
 * - `left` → Sol hizalama (varsayılan)
 * - `center` → Orta hizalama
 * - `right` → Sağ hizalama
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
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
 * IndexCell Props Interface
 */
export interface IndexCellProps {
  /** Backend'den gelen field definition */
  field: FieldData;

  /** Copyable özelliği aktif mi? (varsayılan: false) */
  copyable?: boolean;

  /** Kopyalanacak değer (opsiyonel - children'dan text extract edilir) */
  copyValue?: string;

  /** Uzun metinleri kes (truncate) (varsayılan: false) */
  truncate?: boolean;

  /** Field value component'i (children) */
  children: React.ReactNode;

  /** Ek CSS class'ları (opsiyonel) */
  className?: string;
}

/**
 * IndexCell Component
 *
 * Index view (tablo/liste) field'ları için minimal wrapper component'i.
 * Text alignment ve copyable desteği sağlar.
 *
 * # Text Alignment
 *
 * field.text_align property'sine göre hizalama yapılır:
 * - `left` → Sol hizalama (varsayılan)
 * - `center` → Orta hizalama
 * - `right` → Sağ hizalama
 *
 * # Copyable Özelliği
 *
 * `copyable={true}` prop'u verilirse:
 * - Value'nun yanında küçük clipboard icon gösterilir
 * - Icon'a tıklandığında value clipboard'a kopyalanır
 * - Kopyalama başarılı olursa icon 2 saniye boyunca check icon'a dönüşür
 *
 * # Truncate Özelliği
 *
 * `truncate={true}` prop'u verilirse:
 * - Uzun metinler kesilir ve sonuna "..." eklenir
 * - Hover ile tam metin tooltip'te gösterilir
 */
export const IndexCell: React.FC<IndexCellProps> = ({
  field,
  copyable = false,
  copyValue,
  truncate = false,
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  // Text alignment class'ı belirle
  const textAlign = field.text_align || 'left';
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign] || 'text-left';

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
    <div
      className={cn(
        'flex items-center gap-1',
        alignmentClass,
        className
      )}
    >
      {/* Value Content */}
      <div
        className={cn(
          'flex-1 min-w-0',
          truncate && 'truncate'
        )}
      >
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
                className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                aria-label="Kopyala"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
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
  );
};

IndexCell.displayName = 'IndexCell';
