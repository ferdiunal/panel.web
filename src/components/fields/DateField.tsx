/**
 * DateField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart date field implementasyonu
 * İki mod destekler: Dialog (takvim) ve Native (HTML date input)
 */

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FieldLayout } from './FieldLayout';

export interface DateFieldProps {
  name: string;
  label?: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  onBlur?: () => void;
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
 * Mikro frontend pattern'ine uygun date field component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - İki mod: Dialog (takvim) veya Native (HTML date input)
 * - Tooltip desteği
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri (aria-invalid, aria-describedby)
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
 *
 * // Tooltip ile
 * <DateField
 *   name="start_date"
 *   label="Başlangıç Tarihi"
 *   value={startDate}
 *   onChange={setStartDate}
 *   tooltip="Projenin başlangıç tarihini seçin"
 *   required
 * />
 * ```
 */
export const DateField = React.forwardRef<HTMLButtonElement | HTMLInputElement, DateFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      onBlur,
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

    // Tooltip varsa label'a ekle
    const labelContent = label && tooltip && (
      <div className="flex items-center gap-2">
        <span>{label}</span>
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
      </div>
    );

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
        <FieldLayout
          name={name}
          label={labelContent ? undefined : label}
          error={error}
          required={required}
          helpText={helpText}
          disabled={disabled}
          className={className}
          hideLabel={!!labelContent}
        >
          {/* Tooltip varsa custom label göster */}
          {labelContent && (
            <div className="mb-2">
              {labelContent}
              {required && (
                <span className="ml-1 text-destructive" aria-label="required">
                  *
                </span>
              )}
            </div>
          )}

          <Input
            ref={ref as React.Ref<HTMLInputElement>}
            id={name}
            name={name}
            type="date"
            value={dateValue}
            onChange={handleNativeChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            className={cn(
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
        </FieldLayout>
      );
    }

    // Dialog modu
    const handleDateSelect = (date: Date | undefined) => {
      onChange(date);
      // Tarih seçildiğinde dialog'u kapat
      setIsOpen(false);
    };

    return (
      <FieldLayout
        name={name}
        label={labelContent ? undefined : label}
        error={error}
        required={required}
        helpText={helpText}
        disabled={disabled}
        className={className}
        hideLabel={!!labelContent}
      >
        {/* Tooltip varsa custom label göster */}
        {labelContent && (
          <div className="mb-2">
            {labelContent}
            {required && (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            )}
          </div>
        )}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref as React.Ref<HTMLButtonElement>}
              id={name}
              variant="outline"
              disabled={disabled}
              onBlur={onBlur}
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
      </FieldLayout>
    );
  }
);

DateField.displayName = 'DateField';
