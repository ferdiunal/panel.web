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
import type { Resource } from '@/types';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

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
}) => {
    const searchFn = field.props?.searchFn as (query: string) => Promise<Resource[]>;

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
            />
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
