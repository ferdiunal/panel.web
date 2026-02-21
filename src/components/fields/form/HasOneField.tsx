/**
 * HasOneFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart HasOne relationship field implementasyonu
 * Async search özellikleri ile
 */

import React, { useState, useCallback } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';
import { InputGroupAddon, InputGroupText } from '@/components/ui/input-group';
import type { Resource } from '@/types';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';
import { resolveFieldInputAddons } from './input-group-addon-utils';

function renderAddon(addon: React.ReactNode): React.ReactNode {
  if (typeof addon === 'string' || typeof addon === 'number') {
    return <InputGroupText>{addon}</InputGroupText>;
  }
  return addon;
}

export const HasOneFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = 'Select a resource...',
  helpText,
  container,
  className,
  startAddon,
  endAddon,
}) => {
    const searchFn = field.props?.searchFn as (query: string) => Promise<Resource[]>;
    const addons = resolveFieldInputAddons(
      field.props as Record<string, unknown> | undefined,
      { startAddon, endAddon }
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [options, setOptions] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(
      async (query: string) => {
        setSearchQuery(query);
        if (!searchFn) return;

        if (query.length === 0) {
          setOptions([]);
          return;
        }

        setIsLoading(true);
        try {
          const results = await searchFn(query);
          setOptions(results);
        } catch (err) {
          console.error('Search failed:', err);
          setOptions([]);
        } finally {
          setIsLoading(false);
        }
      },
      [searchFn]
    );

    return (
      <FieldLayout
        name={name}
        label={label}
        error={error}
        required={required}
        helpText={helpText}
        disabled={disabled}
        className={className}
      >
        <div>
          <Combobox
            value={value ? String(value) : ''}
            onValueChange={onChange}
            disabled={disabled}
          >
            <ComboboxInput
              id={name}
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={onBlur}
              disabled={disabled}
              showClear={!!value}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            >
              {addons.startAddon && (
                <InputGroupAddon align="inline-start">
                  {renderAddon(addons.startAddon)}
                </InputGroupAddon>
              )}
              {addons.endAddon && (
                <InputGroupAddon align="inline-end">
                  {renderAddon(addons.endAddon)}
                </InputGroupAddon>
              )}
            </ComboboxInput>
            <ComboboxContent container={container}>
              {isLoading && (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Loading...
                </div>
              )}
              {!isLoading && (
                <>
                  <ComboboxList>
                    {options.map((option) => (
                      <ComboboxItem key={option.id} value={String(option.id)}>
                        {option.name || option.id}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                  <ComboboxEmpty>No results found</ComboboxEmpty>
                </>
              )}
            </ComboboxContent>
          </Combobox>
        </div>
      </FieldLayout>
    );
};

HasOneFormField.displayName = 'HasOneFormField';
