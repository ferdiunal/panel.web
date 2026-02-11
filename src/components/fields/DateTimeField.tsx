/**
 * DateTimeField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart datetime field implementasyonu
 * İki mod destekler: Dialog (takvim + saat) ve Native (HTML datetime-local input)
 */

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FieldLayout } from './FieldLayout';

export interface DateTimeFieldProps {
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
   * Native HTML datetime-local input kullan
   * true: HTML5 datetime-local input (mobil uyumlu, hafif)
   * false/undefined: Dialog ile takvim ve saat (varsayılan)
   */
  useNative?: boolean;
}

/**
 * DateTimeField Component
 *
 * Mikro frontend pattern'ine uygun datetime field component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - İki mod: Dialog (takvim + saat) veya Native (HTML datetime-local input)
 * - Tooltip desteği
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri (aria-invalid, aria-describedby)
 *
 * Dialog Modu (useNative={false} veya undefined):
 * - Takvim arayüzü ile tarih seçimi
 * - Saat girişi için time input
 * - "Tamam" butonu ile dialog kapanma
 *
 * Native Modu (useNative={true}):
 * - HTML5 datetime-local input
 * - Mobil cihazlarda native datetime picker
 * - Hafif ve hızlı
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Dialog modu (varsayılan)
 * <DateTimeField
 *   name="appointment"
 *   label="Randevu Tarihi ve Saati"
 *   value={appointment}
 *   onChange={setAppointment}
 * />
 *
 * // Native modu
 * <DateTimeField
 *   name="appointment"
 *   label="Randevu Tarihi ve Saati"
 *   value={appointment}
 *   onChange={setAppointment}
 *   useNative
 * />
 *
 * // Tooltip ile
 * <DateTimeField
 *   name="meeting"
 *   label="Toplantı Zamanı"
 *   value={meeting}
 *   onChange={setMeeting}
 *   tooltip="Toplantının başlangıç tarih ve saatini seçin"
 *   required
 * />
 * ```
 */
export const DateTimeField = React.forwardRef<HTMLButtonElement | HTMLInputElement, DateTimeFieldProps>(
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
      placeholder = 'Pick a date and time',
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
      const dateTimeValue = value ? format(value, "yyyy-MM-dd'T'HH:mm") : '';

      const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateTimeStr = e.target.value;
        if (dateTimeStr) {
          onChange(new Date(dateTimeStr));
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
            type="datetime-local"
            value={dateTimeValue}
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
    const handleDateChange = (date: Date | undefined) => {
      if (date) {
        // Saat bilgisini koru
        if (value) {
          date.setHours(value.getHours());
          date.setMinutes(value.getMinutes());
        }
        onChange(date);
      } else {
        onChange(undefined);
      }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = e.target.value;
      if (time && value) {
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date(value);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
      }
    };

    const timeValue = value ? format(value, 'HH:mm') : '';

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
              {value ? format(value, 'PPP HH:mm') : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateChange}
                disabled={disabled}
                initialFocus
              />
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${name}-time`} className="text-sm font-medium">
                  Saat
                </Label>
                <Input
                  id={`${name}-time`}
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  disabled={disabled || !value}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Tamam
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </FieldLayout>
    );
  }
);

DateTimeField.displayName = 'DateTimeField';
