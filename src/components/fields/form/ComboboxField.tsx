/**
 * ComboboxFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart combobox implementasyonu (Form view)
 * Searchable select
 */

import React, { useState, useMemo, useId } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FieldLayout } from '../FieldLayout';
import { AddonAwareControl } from './input-group-addon';
import { resolveFieldInputAddons } from './input-group-addon-utils';
import type { FormFieldProps } from '@/types';

export interface ComboboxOption {
  value: string;
  label: string;
}

/**
 * ComboboxFormField Component
 *
 * Mikro frontend pattern'ine uygun combobox component'i (Form view)
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Searchable select
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 *
 * Kullanım Örneği:
 *
 * ```tsx
 * <ComboboxFormField
 *   field={{
 *     key: 'category',
 *     props: {
 *       options: [
 *         { value: '1', label: 'Kategori 1' },
 *         { value: '2', label: 'Kategori 2' }
 *       ]
 *     }
 *   }}
 *   name="category"
 *   label="Kategori"
 *   value={category}
 *   onChange={setCategory}
 * />
 * ```
 */
export const ComboboxFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  placeholder = 'Seçiniz...',
  helpText,
  startAddon,
  endAddon,
}) => {
  const [open, setOpen] = useState(false);
  const listboxId = useId();
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  );
  const hasAddons = !!addons.startAddon || !!addons.endAddon;

  // Options'ı normalize et
  const normalizedOptions = useMemo((): ComboboxOption[] => {
    const rawOptions = field.props?.options;
    if (!rawOptions) return [];

    if (Array.isArray(rawOptions)) {
      return rawOptions.map((opt) => ({
        value: String(opt.value),
        label: String(opt.label),
      }));
    }

    if (typeof rawOptions === 'object') {
      return Object.entries(rawOptions).map(([value, label]) => ({
        value: String(value),
        label: String(label),
      }));
    }

    return [];
  }, [field.props?.options]);

  // Selected option'ı bul
  const selectedOption = normalizedOptions.find((opt) => opt.value === String(value));

  return (
    <FieldLayout
      name={name}
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      disabled={disabled}
    >
      <AddonAwareControl
        startAddon={addons.startAddon}
        endAddon={addons.endAddon}
        controlClassName={hasAddons ? 'px-1.5' : undefined}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-controls={listboxId}
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                'w-full justify-between',
                !value && 'text-muted-foreground',
                hasAddons && 'h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0',
                error && 'border-destructive focus-visible:ring-destructive/20'
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command id={listboxId}>
              <CommandInput placeholder="Ara..." />
              <CommandList>
                <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                <CommandGroup>
                  {normalizedOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </AddonAwareControl>
    </FieldLayout>
  );
};

ComboboxFormField.displayName = 'ComboboxFormField';
