import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';

export interface HasOneFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  resourceType: string;
  searchFn: (query: string) => Promise<Resource[]>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  placeholder?: string;
}

/**
 * HasOneField Component
 * 
 * A searchable combobox field for HasOne relationships (one-to-one).
 * Displays a label with optional required indicator, searchable dropdown,
 * error message below field if error exists, and optional help text.
 * 
 * Validates: Requirements 5.3
 */
export const HasOneField = React.forwardRef<HTMLDivElement, HasOneFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      resourceType: _resourceType,
      searchFn,
      error,
      disabled = false,
      required = false,
      helpText,
      className,
      placeholder = 'Select a resource...',
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [options, setOptions] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(
      async (query: string) => {
        setSearchQuery(query);
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
      <div className={cn('flex flex-col gap-2', className)} ref={ref}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Combobox
          value={value || ''}
          onValueChange={onChange}
          disabled={disabled}
        >
          <ComboboxInput
            id={name}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={disabled}
            showClear={!!value}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          />
          <ComboboxContent>
            {isLoading && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Loading...
              </div>
            )}
            {!isLoading && (
              <>
                <ComboboxList>
                  {options.map((option) => (
                    <ComboboxItem key={option.id} value={option.id}>
                      {option.name || option.id}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>No results found</ComboboxEmpty>
              </>
            )}
          </ComboboxContent>
        </Combobox>
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

HasOneField.displayName = 'HasOneField';
