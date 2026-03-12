/**
 * FieldLayout - Standart field layout component'i
 *
 * Tüm field'lar için tutarlı layout sağlar:
 * - Label (required indicator ile)
 * - Field content
 * - Error message
 * - Help text
 * - Tutarlı spacing ve styling
 *
 * Mikro frontend pattern'i - tüm field'lar bu layout'u kullanır
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AddonAwareControl } from './form/input-group-addon';

interface FieldLayoutAddonContextValue {
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
}

const FieldLayoutAddonContext = React.createContext<FieldLayoutAddonContextValue | null>(null);

interface FieldLayoutAddonProviderProps {
  addons: FieldLayoutAddonContextValue;
  children: React.ReactNode;
}

export function FieldLayoutAddonProvider({ addons, children }: FieldLayoutAddonProviderProps) {
  return (
    <FieldLayoutAddonContext.Provider value={addons}>
      {children}
    </FieldLayoutAddonContext.Provider>
  );
}

export interface FieldLayoutProps {
  /** Field adı (HTML name attribute) */
  name: string;
  /** Field label'ı */
  label?: string;
  /** Zorunlu field mi? */
  required?: boolean;
  /** Hata mesajı */
  error?: string;
  /** Yardım metni */
  helpText?: string;
  /** Field disabled mi? */
  disabled?: boolean;
  /** Field content (input, select, vb.) */
  children: React.ReactNode;
  /** Ek CSS class'ları */
  className?: string;
  /** Label'ı gizle */
  hideLabel?: boolean;
  /** Field içeriğinin başında gösterilecek addon */
  startAddon?: React.ReactNode;
  /** Field içeriğinin sonunda gösterilecek addon */
  endAddon?: React.ReactNode;
}

/**
 * FieldLayout Component
 *
 * Tüm field component'leri için standart layout sağlar.
 * Mikro frontend pattern'ine uygun, tutarlı ve yeniden kullanılabilir.
 */
export const FieldLayout: React.FC<FieldLayoutProps> = ({
  name,
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  children,
  className,
  hideLabel = false,
  startAddon,
  endAddon,
}) => {
  const contextAddons = React.useContext(FieldLayoutAddonContext);
  const resolvedStartAddon = startAddon ?? contextAddons?.startAddon;
  const resolvedEndAddon = endAddon ?? contextAddons?.endAddon;
  const hasAddons = !!(resolvedStartAddon || resolvedEndAddon);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      {!hideLabel && label && (
        <Label
          htmlFor={name}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            disabled && 'opacity-50',
            error && 'text-destructive'
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-label="required">
              *
            </span>
          )}
        </Label>
      )}

      {/* Field Content */}
      <div className="relative">
        {hasAddons ? (
          <AddonAwareControl
            startAddon={resolvedStartAddon}
            endAddon={resolvedEndAddon}
            groupClassName="h-auto min-h-9 items-stretch rounded-md"
            controlClassName="min-h-9 px-2.5 py-1.5"
          >
            {children}
          </AddonAwareControl>
        ) : (
          children
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          className="text-sm font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {/* Help Text */}
      {!error && helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
};

/**
 * FieldLayoutInline - Inline layout variant
 *
 * Label ve field yan yana gösterilir (horizontal layout)
 */
export const FieldLayoutInline: React.FC<FieldLayoutProps> = ({
  name,
  label,
  required = false,
  error,
  helpText,
  disabled = false,
  children,
  className,
  hideLabel = false,
  startAddon,
  endAddon,
}) => {
  const contextAddons = React.useContext(FieldLayoutAddonContext);
  const resolvedStartAddon = startAddon ?? contextAddons?.startAddon;
  const resolvedEndAddon = endAddon ?? contextAddons?.endAddon;
  const hasAddons = !!(resolvedStartAddon || resolvedEndAddon);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-start gap-4">
        {/* Label */}
        {!hideLabel && label && (
          <Label
            htmlFor={name}
            className={cn(
              'text-sm font-medium leading-none pt-2 min-w-[120px]',
              disabled && 'opacity-50',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            )}
          </Label>
        )}

        {/* Field Content */}
        <div className="flex-1 space-y-3">
          <div className="relative">
            {hasAddons ? (
              <AddonAwareControl
                startAddon={resolvedStartAddon}
                endAddon={resolvedEndAddon}
                groupClassName="h-auto min-h-9 items-stretch rounded-md"
                controlClassName="min-h-9 px-2.5 py-1.5"
              >
                {children}
              </AddonAwareControl>
            ) : (
              children
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p
              className="text-sm font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200"
              role="alert"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          {/* Help Text */}
          {!error && helpText && (
            <p className="text-sm text-muted-foreground">{helpText}</p>
          )}
        </div>
      </div>
    </div>
  );
};
