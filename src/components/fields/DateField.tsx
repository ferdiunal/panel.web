/**
 * DateField Component
 *
 * Tarih seçimi için kullanılan bileşen.
 * İki mod destekler:
 * 1. Dialog modu: Popover içinde takvim ile tarih seçimi (varsayılan)
 * 2. Native modu: HTML date input (useNative prop'u ile)
 *
 * Özellikler:
 * - Dialog modu: Takvim arayüzü, tarih seçildiğinde otomatik kapanma
 * - Native modu: HTML5 date input, mobil uyumlu
 * - Label, hata mesajı ve yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Dialog modu (varsayılan)
 * <DateField
 *   name="birth_date"
 *   label="Doğum Tarihi"
 *   value={birthDate}
 *   onChange={setBirthDate}
 * />
 *
 * // Native modu
 * <DateField
 *   name="birth_date"
 *   label="Doğum Tarihi"
 *   value={birthDate}
 *   onChange={setBirthDate}
 *   useNative
 * />
 * ```
 */

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface DateFieldProps {
  name: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
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
   * Native HTML date input kullan
   * true: HTML5 date input (mobil uyumlu, hafif)
   * false/undefined: Dialog ile takvim (varsayılan)
   */
  useNative?: boolean;
}

/**
 * DateField Component
 *
 * Tarih seçimi için esnek bileşen.
 * useNative prop'una göre Dialog veya Native input kullanır.
 *
 * Dialog Modu (useNative={false} veya undefined):
 * - Takvim arayüzü ile tarih seçimi
 * - Tarih seçildiğinde otomatik kapanma
 * - Görsel olarak zengin
 *
 * Native Modu (useNative={true}):
 * - HTML5 date input
 * - Mobil cihazlarda native date picker
 * - Hafif ve hızlı
 */
export const DateField = React.forwardRef<HTMLButtonElement | HTMLInputElement, DateFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      error,
      disabled = false,
      required = false,
      placeholder = 'Pick a date',
      helpText,
      className,
      tooltip,
      useNative = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Native mod
    if (useNative) {
      const dateValue = value ? format(value, 'yyyy-MM-dd') : '';

      const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        if (dateStr) {
          onChange(new Date(dateStr));
        } else {
          onChange(undefined);
        }
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
            type="date"
            value={dateValue}
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
    const handleDateSelect = (date: Date | undefined) => {
      onChange(date);
      // Tarih seçildiğinde dialog'u kapat
      setIsOpen(false);
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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'PPP') : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              disabled={disabled}
              initialFocus
            />
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

DateField.displayName = 'DateField';
