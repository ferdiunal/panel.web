import React, { useState, useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';

export interface BelongsToManyFieldProps {
  name: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  searchFn: (query: string) => Promise<Resource[]>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  placeholder?: string;
}

/**
 * BelongsToManyField Component
 * 
 * A multi-select combobox field for BelongsToMany relationships with junction table support.
 * Displays a label with optional required indicator, searchable multi-select dropdown,
 * error message below field if error exists, and optional help text.
 * 
 * Validates: Requirements 5.4
 */
export const BelongsToManyField = React.forwardRef<HTMLDivElement, BelongsToManyFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      searchFn,
      error,
      disabled = false,
      required = false,
      helpText,
      className,
      placeholder = 'Select resources...',
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

    const selectedOptions = useMemo(() => {
      return options.filter((opt) => value.includes(opt.id));
    }, [options, value]);

    const handleAddValue = useCallback(
      (idOrNull: string | null) => {
        if (idOrNull && !value.includes(idOrNull)) {
          onChange([...value, idOrNull]);
          setSearchQuery('');
        }
      },
      [value, onChange]
    );

    return (
      <div className={cn('flex flex-col gap-2', className)} ref={ref}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <Combobox
          value=""
          onValueChange={handleAddValue}
          disabled={disabled}
        >
          <ComboboxChips
            id={name}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          >
            {value.map((id) => {
              const resource = selectedOptions.find((opt) => opt.id === id);
              return (
                <ComboboxChip
                  key={id}
                  showRemove
                >
                  {resource?.name || id}
                </ComboboxChip>
              );
            })}
            <ComboboxChipsInput
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={disabled}
            />
          </ComboboxChips>
          <ComboboxContent>
            {isLoading && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Loading...
              </div>
            )}
            {!isLoading && (
              <>
                <ComboboxList>
                  {options
                    .filter((opt) => !value.includes(opt.id))
                    .map((option) => (
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

BelongsToManyField.displayName = 'BelongsToManyField';
