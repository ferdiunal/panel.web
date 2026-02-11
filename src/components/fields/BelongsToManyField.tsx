import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';
import { QuickCreateModal } from './QuickCreateModal';

/**
 * Varsayılan boş options objesi.
 * Component dışında sabit referans olarak tanımlanır —
 * her render'da yeni {} oluşmasını ve sonsuz API döngüsünü engeller.
 */
const EMPTY_OPTIONS: Record<string, string> = {};

// Define a minimal type for options to avoid Resource type errors if it's missing fields
interface Option {
  id: string | number;
  name?: string;
}

export interface BelongsToManyFieldProps {
  name: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
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
 * BelongsToManyField Component
 * 
 * A multi-select combobox field for BelongsToMany relationships using Shadcn/Radix primitives.
 * Supports multiple selection with chips, search, and pre-loaded options.
 */
export const BelongsToManyField = React.forwardRef<HTMLDivElement, BelongsToManyFieldProps>(
  (
    {
      name,
      label,
      value = [],
      onChange,
      searchFn,
      options: initialOptions = EMPTY_OPTIONS,
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
      if (Object.keys(initialOptions).length === 0) {
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

    return (
      <div className={cn('flex flex-col gap-2', className)} ref={ref}>
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>

        <div className="flex gap-2">
          <div className="flex-1">
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

        {/* Quick Create Modal */}
        <QuickCreateModal
          resourceSlug={name}
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
            onChange([...value, String(newOption.id)]);

            // Search query'yi temizle
            setSearchQuery('');
          }}
        />
      </div>
    );
  }
);

BelongsToManyField.displayName = 'BelongsToManyField';
