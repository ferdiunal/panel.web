import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';

// Define a minimal type for options to avoid Resource type errors if it's missing fields
interface Option {
  id: string | number;
  name?: string;
}

export interface HasManyFieldProps {
  name: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  resourceType: string;
  searchFn: (query: string) => Promise<Resource[]>;
  options?: Record<string, string>; // Pre-loaded options from backend
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  placeholder?: string;
}

/**
 * HasManyField Component
 *
 * A multi-select combobox field for HasMany relationships.
 * Displays a label with optional required indicator, searchable multi-select dropdown,
 * error message below field if error exists, and optional help text.
 *
 * Validates: Requirements 5.2
 */
export const HasManyField = React.forwardRef<HTMLDivElement, HasManyFieldProps>(
  (
    {
      name,
      label,
      value = [],
      onChange,
      resourceType: _resourceType,
      searchFn,
      options: initialOptions = {},
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
    const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const anchor = useComboboxAnchor();

    // Convert initialOptions (Record<string, string>) to Option[]
    const preloadedResources = useMemo(() => {
      return Object.entries(initialOptions).map(([id, name]) => ({
        id: id,
        name: name,
      }));
    }, [initialOptions]);

    // Initial load of options
    useEffect(() => {
      setAvailableOptions(preloadedResources);
    }, [preloadedResources]);

    const handleSearch = useCallback(
      async (query: string) => {
        setSearchQuery(query);
        if (query.length === 0) {
          setAvailableOptions(preloadedResources);
          return;
        }

        setIsLoading(true);
        try {
          const results = await searchFn(query);
          // Convert Resource[] to Option[] and merge
          const mappedResults: Option[] = results.map(r => ({
            id: String(r.id),
            name: r.name || String(r.id) // Fallback if name is missing
          }));

          const combined = [...preloadedResources, ...mappedResults];
          const unique = Array.from(new Map(combined.map(item => [String(item.id), item])).values());
          setAvailableOptions(unique);
        } catch (err) {
          console.error('Search failed:', err);
          setAvailableOptions(preloadedResources);
        } finally {
          setIsLoading(false);
        }
      },
      [searchFn, preloadedResources]
    );

    // Map current values to display names
    const getDisplayValue = useCallback((id: string) => {
      const option = availableOptions.find(opt => String(opt.id) === String(id)) ||
                     preloadedResources.find(opt => String(opt.id) === String(id));
      return option?.name || id;
    }, [availableOptions, preloadedResources]);

    return (
      <div className={cn('flex flex-col gap-2', className)} ref={ref}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>

        <Combobox
          multiple
          autoHighlight
          value={value}
          onValueChange={(val) => {
            onChange(val as string[]);
            setSearchQuery('');
          }}
          disabled={disabled}
        >
          <ComboboxChips ref={anchor} className="w-full max-w-xs">
            {value.map((val: string) => (
              <ComboboxChip key={val} className="mr-1 mb-1">
                {getDisplayValue(val)}
              </ComboboxChip>
            ))}
            <ComboboxChipsInput
              placeholder={value.length === 0 ? placeholder : undefined}
              value={searchQuery}
              {...({ onValueChange: (val: string) => handleSearch(val) } as any)}
            />
          </ComboboxChips>

          <ComboboxContent anchor={anchor}>
            {isLoading ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Loading...
              </div>
            ) : (
              <>
                <ComboboxEmpty>No results found</ComboboxEmpty>
                <ComboboxList>
                  {availableOptions.map((option) => (
                    <ComboboxItem key={option.id} value={String(option.id)}>
                      {option.name || String(option.id)}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
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

HasManyField.displayName = 'HasManyField';
