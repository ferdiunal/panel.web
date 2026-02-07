/**
 * TimeField Component
 *
 * Saat seçimi için kullanılan bileşen.
 * İki mod destekler:
 * 1. Dialog modu: Popover içinde saat girişi (varsayılan)
 * 2. Native modu: HTML time input (useNative prop'u ile)
 *
 * Özellikler:
 * - Dialog modu: Popover içinde time input, "Tamam" butonu ile kapanma
 * - Native modu: HTML5 time input, mobil uyumlu
 * - Label, hata mesajı ve yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Dialog modu (varsayılan)
 * <TimeField
 *   name="start_time"
 *   label="Başlangıç Saati"
 *   value={startTime}
 *   onChange={setStartTime}
 * />
 *
 * // Native modu
 * <TimeField
 *   name="start_time"
 *   label="Başlangıç Saati"
 *   value={startTime}
 *   onChange={setStartTime}
 *   useNative
 * />
 * ```
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimeFieldProps {
  name: string;
  label: string;
  value: string; // HH:mm formatında (örn: "14:30")
  onChange: (time: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
  /**
   * Tooltip metni - Label'ın yanında info ikonu ile gösterilir
   */
  tooltip?: string;
  /**
   * Native HTML time input kullan
   * true: HTML5 time input (mobil uyumlu, hafif)
   * false/undefined: Dialog ile saat girişi (varsayılan)
   */
  useNative?: boolean;
}

/**
 * TimeField Component
 *
 * Saat seçimi için esnek bileşen.
 * useNative prop'una göre Dialog veya Native input kullanır.
 *
 * Dialog Modu (useNative={false} veya undefined):
 * - Popover içinde time input
 * - "Tamam" butonu ile dialog kapanma
 *
 * Native Modu (useNative={true}):
 * - HTML5 time input
 * - Mobil cihazlarda native time picker
 * - Hafif ve hızlı
 */
export const TimeField = React.forwardRef<HTMLButtonElement | HTMLInputElement, TimeFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      placeholder = 'Saat seçin',
      helpText,
      className,
      tooltip,
      useNative = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [tempValue, setTempValue] = React.useState(value);

    // Native mod
    if (useNative) {
      const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      };

      return (
        <div className={cn('flex flex-col gap-2', className)}>
          <div className="flex items-center gap-2">
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive">*</span>}
            </Label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            id={name}
            name={name}
            type="time"
            value={value}
            onChange={handleNativeChange}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            className={cn(
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          {error && (
            <p id={`${name}-error`} className="text-sm text-destructive">
              {error}
            </p>
          )}
          {helpText && !error && (
            <p id={`${name}-help`} className="text-sm text-muted-foreground">
              {helpText}
            </p>
          )}
        </div>
      );
    }

    // Dialog modu
    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (open) {
        // Dialog açıldığında mevcut değeri temp value'ya kopyala
        setTempValue(value);
      }
    };

    const handleDone = () => {
      // Temp value'yu asıl value'ya kaydet
      onChange(tempValue);
      setIsOpen(false);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTempValue(e.target.value);
    };

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-2">
          <Label htmlFor={name} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              ref={ref as React.Ref<HTMLButtonElement>}
              id={name}
              variant="outline"
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground',
                error && 'border-destructive focus-visible:ring-destructive/20'
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              {value || placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${name}-input`} className="text-sm font-medium">
                  Saat
                </Label>
                <Input
                  id={`${name}-input`}
                  type="time"
                  value={tempValue}
                  onChange={handleTimeChange}
                  disabled={disabled}
                  className="w-full"
                  autoFocus
                />
              </div>
              <Button
                onClick={handleDone}
                className="w-full"
              >
                Tamam
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {error && (
          <p id={`${name}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p id={`${name}-help`} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

TimeField.displayName = 'TimeField';
