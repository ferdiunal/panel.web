import React, { useState, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';

export interface MorphToFieldProps {
  name: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  resourceTypes: string[];
  searchFn: (type: string, query: string) => Promise<Resource[]>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  placeholder?: string;
}

/**
 * MorphToField Component
 * 
 * A polymorphic combobox field for MorphTo relationships.
 * Allows selection of different resource types with grouped results.
 * Displays a label with optional required indicator, searchable dropdown,
 * error message below field if error exists, and optional help text.
 * 
 * Validates: Requirements 5.5
 */
export const MorphToField = React.forwardRef<HTMLDivElement, MorphToFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      resourceTypes,
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
    const [optionsByType, setOptionsByType] = useState<Record<string, Resource[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(
      async (query: string) => {
        setSearchQuery(query);
        if (query.length === 0) {
          setOptionsByType({});
          return;
        }

        setIsLoading(true);
        try {
          const results: Record<string, Resource[]> = {};
          
          // Search across all resource types
          await Promise.all(
            resourceTypes.map(async (type) => {
              try {
                const typeResults = await searchFn(type, query);
                if (typeResults.length > 0) {
                  results[type] = typeResults;
                }
              } catch (err) {
                console.error(`Search failed for type ${type}:`, err);
              }
            })
          );
          
          setOptionsByType(results);
        } catch (err) {
          console.error('Search failed:', err);
          setOptionsByType({});
        } finally {
          setIsLoading(false);
        }
      },
      [resourceTypes, searchFn]
    );

    const hasResults = Object.keys(optionsByType).length > 0;

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
                  {resourceTypes.map((type) => {
                    const options = optionsByType[type] || [];
                    if (options.length === 0) return null;

                    return (
                      <React.Fragment key={type}>
                        <ComboboxGroup>
                          <ComboboxLabel>{type}</ComboboxLabel>
                          {options.map((option) => (
                            <ComboboxItem key={option.id} value={option.id}>
                              {option.name || option.id}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {resourceTypes.indexOf(type) < resourceTypes.length - 1 && (
                          <ComboboxSeparator />
                        )}
                      </React.Fragment>
                    );
                  })}
                </ComboboxList>
                {!hasResults && searchQuery && (
                  <ComboboxEmpty>No results found</ComboboxEmpty>
                )}
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

MorphToField.displayName = 'MorphToField';
