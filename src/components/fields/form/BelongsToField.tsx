/**
 * BelongsToFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart BelongsTo relationship field implementasyonu
 * Async search ve quick create özellikleri ile
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Info } from 'lucide-react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Resource } from '@/types';
import { QuickCreateModal } from '../QuickCreateModal';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

const EMPTY_OPTIONS: Record<string, string> = {};

export const BelongsToFormField: React.FC<FormFieldProps> = ({
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
    // Props extraction from field.props
    const related_resource = field.props?.related_resource as string;
    const searchFn = field.props?.searchFn as (query: string) => Promise<Resource[]>;
    const optionsProp = field.props?.options as Record<string, string>;
    const initialOptions = optionsProp || EMPTY_OPTIONS;
    const tooltip = field.props?.tooltip as string;
    const parentResourceId = field.props?.parentResourceId as string | number;

    const [searchQuery, setSearchQuery] = useState('');
    const [options, setOptions] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quickCreateOpen, setQuickCreateOpen] = useState(false);

    // Load initial options on mount
    useEffect(() => {
      // If backend provided options, use them
      if (Object.keys(initialOptions).length > 0) {
        // @ts-ignore
        const preloadedOptions: Resource[] = Object.entries(initialOptions).map(([id, name]) => ({
          id: id,
          name: name,
        }));
        setOptions(preloadedOptions);
        return;
      }

      // Otherwise, fetch from API if searchFn is provided
      if (searchFn) {
        const loadInitialOptions = async () => {
          setIsLoading(true);
          try {
            const results = await searchFn('');
            setOptions(results);
          } catch (err) {
            console.error('Failed to load initial options:', err);
            setOptions([]);
          } finally {
            setIsLoading(false);
          }
        };
        loadInitialOptions();
      }
    }, [searchFn, initialOptions]);

    const handleSearch = useCallback(
      async (query: string) => {
        setSearchQuery(query);
        if (!searchFn) return;

        if (query.length === 0) {
          // Reload initial options when search is cleared
          if (Object.keys(initialOptions).length > 0) {
            // @ts-ignore
            const preloadedOptions: Resource[] = Object.entries(initialOptions).map(([id, name]) => ({
              id: id,
              name: name,
            }));
            setOptions(preloadedOptions);
          } else {
            setIsLoading(true);
            try {
              const results = await searchFn('');
              setOptions(results);
            } catch (err) {
              console.error('Failed to reload options:', err);
              setOptions([]);
            } finally {
              setIsLoading(false);
            }
          }
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
      [searchFn, initialOptions]
    );

    // Seçilen değerin adını input'ta göster - useMemo ile memoize et
    const selectedOptionName = useMemo(() => {
      if (!value) return '';
      const selectedOption = options.find(opt => String(opt.id) === String(value));
      return selectedOption ? (selectedOption.name || selectedOption.id) : '';
    }, [value, options]);

    // Value değiştiğinde search query'yi güncelle
    useEffect(() => {
      if (selectedOptionName) {
        setSearchQuery(String(selectedOptionName));
      }
    }, [selectedOptionName]);

    // Seçilen değeri değiştir
    const handleValueChange = useCallback(
      (newValue: string | null) => {
        onChange(newValue);
      },
      [onChange]
    );

    // Tooltip varsa label'a ekle
    const labelContent = label && tooltip && (
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );

    return (
      <FieldLayout
        name={name}
        label={labelContent ? undefined : label}
        error={error}
        required={required}
        helpText={helpText}
        disabled={disabled}
        className={className}
        hideLabel={!!labelContent}
      >
        <div>
          {/* Tooltip varsa custom label göster */}
          {labelContent && (
            <div className="mb-2">
              {labelContent}
              {required && (
                <span className="ml-1 text-destructive" aria-label="required">
                  *
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Combobox
                value={value ? String(value) : ''}
                onValueChange={handleValueChange}
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
                      {options.length === 0 && <ComboboxEmpty>No results found</ComboboxEmpty>}
                    </>
                  )}
                </ComboboxContent>
              </Combobox>
            </div>
            {related_resource && (
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
            )}
          </div>

          {/* Quick Create Modal */}
          {related_resource && (
              <QuickCreateModal
                resourceSlug={related_resource}
                open={quickCreateOpen}
                onOpenChange={setQuickCreateOpen}
                parentResourceId={parentResourceId}
                onSuccess={(createdResource) => {
                  // Yeni kaydı options'a ekle
                  // @ts-ignore
                  const newOption: Resource = {
                    id: String(createdResource.id?.data || createdResource.id),
                    name: createdResource.name?.data || createdResource.name || createdResource.title?.data || createdResource.title || `#${createdResource.id}`,
                  };
                  setOptions(prev => [...prev, newOption]);

                  // Yeni kaydı seç
                  onChange(String(newOption.id));
                }}
              />
          )}
        </div>
      </FieldLayout>
    );
};

BelongsToFormField.displayName = 'BelongsToFormField';
