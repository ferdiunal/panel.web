/**
 * DateFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart date field implementasyonu (Form view)
 * İki mod destekler: Dialog (takvim) ve Native (HTML date input)
 */

import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

/**
 * DateFormField Component
 *
 * Mikro frontend pattern'ine uygun date field component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - İki mod: Dialog (takvim) veya Native (HTML date input)
 * - Date formatting (date-fns)
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Modes:
 * 1. Dialog Mode (useNative=false, varsayılan):
 *    - Popover içinde Calendar component
 *    - Tarih seçildiğinde otomatik kapanma
 *    - Görsel olarak zengin
 *
 * 2. Native Mode (useNative=true):
 *    - HTML5 date input
 *    - Mobil cihazlarda native date picker
 *    - Hafif ve hızlı
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Dialog modu (varsayılan)
 * <DateFormField
 *   field={{ key: 'birth_date' }}
 *   name="birth_date"
 *   label="Doğum Tarihi"
 *   value={birthDate}
 *   onChange={setBirthDate}
 * />
 *
 * // Native modu
 * <DateFormField
 *   field={{
 *     key: 'birth_date',
 *     props: { useNative: true }
 *   }}
 *   name="birth_date"
 *   label="Doğum Tarihi"
 *   value={birthDate}
 *   onChange={setBirthDate}
 * />
 * ```
 */
export const DateFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = 'Tarih seçin',
  helpText,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Native mode kontrolü
  const useNative = (field.props?.useNative as boolean) || false;

  /**
   * Value'yu normalize et (Date object'e çevir)
   */
  const normalizedValue = useMemo((): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, [value]);

  // Native mod
  if (useNative) {
    const dateValue = normalizedValue ? format(normalizedValue, 'yyyy-MM-dd') : '';

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
        label={label}
        error={error}
        required={required}
        helpText={helpText}
        disabled={disabled}
      >
        <Input
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
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant="outline"
            disabled={disabled}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            className={cn(
              'w-full justify-start text-left font-normal',
              !normalizedValue && 'text-muted-foreground',
              error && 'border-destructive focus-visible:ring-destructive/20'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {normalizedValue ? format(normalizedValue, 'PPP') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={normalizedValue}
            onSelect={handleDateSelect}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FieldLayout>
  );
};

DateFormField.displayName = 'DateFormField';
