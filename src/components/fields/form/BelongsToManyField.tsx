/**
 * BelongsToManyFormField - Mikro Frontend Pattern
 * 
 * A multi-select combobox field for BelongsToMany relationships using Shadcn/Radix primitives.
 * Supports multiple selection with chips, search, and pre-loaded options.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import type { Resource } from '@/types';
import { QuickCreateModal } from '../QuickCreateModal';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

const EMPTY_OPTIONS: Record<string, string> = {};

interface Option {
  id: string | number;
  name?: string;
}

export const BelongsToManyFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value = [],
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = 'Select resources...',
  helpText,
  container,
  className,
}) => {
    // Props extraction
    const searchFn = field.props?.searchFn as (query: string) => Promise<Resource[]>;
    const optionsProp = field.props?.options as Record<string, string>;
    const initialOptions = optionsProp || EMPTY_OPTIONS;
    const resourceSlug = name; // Using name as slug based on previous implementation usage

    const [searchQuery, setSearchQuery] = useState('');
    const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quickCreateOpen, setQuickCreateOpen] = useState(false);
    const anchor = useComboboxAnchor();

    // Convert initialOptions (Record<string, string>) to Option[]
    const preloadedResources = useMemo(() => {
      return Object.entries(initialOptions).map(([id, name]) => ({
        id: id,
        name: name,
      }));
    }, [initialOptions]);

    // Load initial options on mount if initialOptions is empty
    useEffect(() => {
      if (Object.keys(initialOptions).length === 0 && searchFn) {
        const loadInitialOptions = async () => {
          setIsLoading(true);
          try {
            const results = await searchFn('');
            const mappedResults: Option[] = results.map(r => ({
              id: String(r.id),
              name: r.name || String(r.id)
            }));
            setAvailableOptions(mappedResults);
          } catch (err) {
            console.error('Failed to load initial options:', err);
            setAvailableOptions([]);
          } finally {
            setIsLoading(false);
          }
        };
        loadInitialOptions();
      } else {
        setAvailableOptions(preloadedResources);
      }
    }, [initialOptions, searchFn, preloadedResources]);

    const handleSearch = useCallback(
      async (query: string) => {
        setSearchQuery(query);
        if (!searchFn) return;

        if (query.length === 0) {
          // Reload initial options when search is cleared
          if (Object.keys(initialOptions).length === 0) {
            setIsLoading(true);
            try {
              const results = await searchFn('');
              const mappedResults: Option[] = results.map(r => ({
                id: String(r.id),
                name: r.name || String(r.id)
              }));
              setAvailableOptions(mappedResults);
            } catch (err) {
              console.error('Failed to reload options:', err);
              setAvailableOptions(preloadedResources);
            } finally {
              setIsLoading(false);
            }
          } else {
            setAvailableOptions(preloadedResources);
          }
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
      [searchFn, preloadedResources, initialOptions]
    );

    // Map current values to display names
    const getDisplayValue = useCallback((id: string) => {
      const option = availableOptions.find(opt => String(opt.id) === String(id)) || 
                     preloadedResources.find(opt => String(opt.id) === String(id));
      return option?.name || id;
    }, [availableOptions, preloadedResources]);

    // Ensure value is an array
    const currentValue = Array.isArray(value) ? value : [];

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
        <div className="flex gap-2">
          <div className="flex-1">
            <Combobox
              multiple
              autoHighlight
              value={currentValue}
              onValueChange={(val) => {
                onChange(val as string[]);
                setSearchQuery('');
              }}
              disabled={disabled}
            >
              <ComboboxChips ref={anchor} className="w-full max-w-xs">
                {currentValue.map((val: string) => (
                  <ComboboxChip key={val} className="mr-1 mb-1">
                    {getDisplayValue(val)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput 
                  placeholder={currentValue.length === 0 ? placeholder : undefined}
                  value={searchQuery}
                  {...({ onValueChange: (val: string) => handleSearch(val) } as any)}
                  onBlur={onBlur}
                />
              </ComboboxChips>
              
              <ComboboxContent anchor={anchor} container={container}>
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
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuickCreateOpen(true)}
            disabled={disabled}
            title="Hızlı oluştur"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Create Modal */}
        <QuickCreateModal
          resourceSlug={resourceSlug}
          open={quickCreateOpen}
          onOpenChange={setQuickCreateOpen}
          onSuccess={(createdResource) => {
            // Yeni kaydı availableOptions'a ekle
            const newOption: Option = {
              id: String(createdResource.id?.data || createdResource.id),
              name: createdResource.name?.data || createdResource.name || createdResource.title?.data || createdResource.title || `#${createdResource.id}`,
            };
            setAvailableOptions([...availableOptions, newOption]);

            // Yeni kaydı value array'ine ekle
            onChange([...currentValue, String(newOption.id)]);

            // Search query'yi temizle
            setSearchQuery('');
          }}
        />
      </FieldLayout>
    );
};

BelongsToManyFormField.displayName = 'BelongsToManyFormField';
