/**
 * BelongsToField - Mikro Frontend Pattern
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
import { QuickCreateModal } from './QuickCreateModal';
import { FieldLayout } from './FieldLayout';

/**
 * Varsayılan boş options objesi.
 * Component dışında sabit referans olarak tanımlanır —
 * her render'da yeni {} oluşmasını engeller.
 * Bu olmadan `useEffect([..., initialOptions])` her render'da
 * yeni referans görür ve sonsuz API döngüsü yaratır.
 */
const EMPTY_OPTIONS: Record<string, string> = {};

export interface BelongsToFieldProps {
  name: string;
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur?: () => void;
  resourceType: string;
  related_resource: string;
  searchFn: (query: string) => Promise<Resource[]>;
  options?: Record<string, string>; // Pre-loaded options from backend
  container?: HTMLElement;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  placeholder?: string;
  /**
   * Tooltip metni - Label'ın yanında info ikonu ile gösterilir
   */
  tooltip?: string;
  parentResourceId?: string | number; // Parent resource ID (edit modunda kullanılır)
}

/**
 * BelongsToField Component
 *
 * Mikro frontend pattern'ine uygun BelongsTo relationship field component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Async search desteği
 * - Quick create modal (Plus butonu)
 * - Pre-loaded options desteği
 * - Tooltip desteği
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Basit BelongsTo field
 * <BelongsToField
 *   name="user_id"
 *   label="Kullanıcı"
 *   value={userId}
 *   onChange={setUserId}
 *   resourceType="posts"
 *   related_resource="users"
 *   searchFn={searchUsers}
 * />
 *
 * // Pre-loaded options ile
 * <BelongsToField
 *   name="category_id"
 *   label="Kategori"
 *   value={categoryId}
 *   onChange={setCategoryId}
 *   resourceType="products"
 *   related_resource="categories"
 *   searchFn={searchCategories}
 *   options={{ '1': 'Electronics', '2': 'Books' }}
 * />
 *
 * // Tooltip ile
 * <BelongsToField
 *   name="author_id"
 *   label="Yazar"
 *   value={authorId}
 *   onChange={setAuthorId}
 *   resourceType="books"
 *   related_resource="authors"
 *   searchFn={searchAuthors}
 *   tooltip="Kitabın yazarını seçin"
 *   required
 * />
 * ```
 */
export const BelongsToField = React.forwardRef<HTMLDivElement, BelongsToFieldProps>(
  (
    {
      name,
      label,
      value,
      onChange,
      onBlur,
      resourceType: _resourceType,
      related_resource,
      searchFn,
      options: initialOptions = EMPTY_OPTIONS,
      error,
      disabled = false,
      required = false,
      helpText,
      container,
      className,
      placeholder = 'Select a resource...',
      tooltip,
      parentResourceId,
    },
    ref
  ) => {
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

      // Otherwise, fetch from API
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
    }, [searchFn, initialOptions]);

    const handleSearch = useCallback(
      async (query: string) => {
        setSearchQuery(query);
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
        setSearchQuery(selectedOptionName);
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
        <div ref={ref}>
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
        </div>
      </FieldLayout>
    );
  }
);

BelongsToField.displayName = 'BelongsToField';
