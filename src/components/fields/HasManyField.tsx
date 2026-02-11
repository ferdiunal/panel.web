/**
 * HasManyField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart HasMany relationship field implementasyonu
 * Çoklu seçim, async search ve quick create özellikleri ile
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Info } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Resource } from '@/types';
import { QuickCreateModal } from './QuickCreateModal';
import { FieldLayout } from './FieldLayout';

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

export interface HasManyFieldProps {
  name: string;
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  resourceType: string;
  related_resource: string;
  searchFn: (query: string) => Promise<Resource[]>;
  options?: Record<string, string>; // Pre-loaded options from backend
  container?: HTMLElement; // Portal container for dropdown
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
 * HasManyField Component
 *
 * Mikro frontend pattern'ine uygun HasMany relationship field component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Çoklu seçim desteği
 * - Async search desteği
 * - Quick create modal (Plus butonu)
 * - Pre-loaded options desteği
 * - Chip gösterimi (seçili değerler)
 * - Tooltip desteği
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Basit HasMany field
 * <HasManyField
 *   name="tag_ids"
 *   label="Etiketler"
 *   value={tagIds}
 *   onChange={setTagIds}
 *   resourceType="posts"
 *   related_resource="tags"
 *   searchFn={searchTags}
 * />
 *
 * // Pre-loaded options ile
 * <HasManyField
 *   name="category_ids"
 *   label="Kategoriler"
 *   value={categoryIds}
 *   onChange={setCategoryIds}
 *   resourceType="products"
 *   related_resource="categories"
 *   searchFn={searchCategories}
 *   options={{ '1': 'Electronics', '2': 'Books' }}
 * />
 *
 * // Tooltip ile
 * <HasManyField
 *   name="author_ids"
 *   label="Yazarlar"
 *   value={authorIds}
 *   onChange={setAuthorIds}
 *   resourceType="books"
 *   related_resource="authors"
 *   searchFn={searchAuthors}
 *   tooltip="Kitabın yazarlarını seçin (birden fazla seçilebilir)"
 *   required
 * />
 * ```
 */

/**
 * Backend'den gelen field değerlerini normalize eder
 * Hem küçük hem büyük harf field isimlerini destekler (id/ID, name/Name)
 */
const getFieldValue = (obj: any, fieldName: string): any => {
  if (!obj || typeof obj !== 'object') return undefined;

  // Önce küçük harfle dene
  if (obj[fieldName] !== undefined) return obj[fieldName];

  // İlk harf büyük harfle dene (camelCase -> PascalCase)
  const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  if (obj[capitalizedField] !== undefined) return obj[capitalizedField];

  // Tamamen büyük harfle dene
  const upperField = fieldName.toUpperCase();
  if (obj[upperField] !== undefined) return obj[upperField];

  return undefined;
};

/**
 * Resource objesinden ID değerini çıkarır
 * Hem primitive hem de nested object formatlarını destekler
 */
const extractId = (item: any): string => {
  if (!item) return '';

  // Primitive value ise direkt döndür
  if (typeof item !== 'object') return String(item);

  // ID field'ını bul (id, ID, vb.)
  const idField = getFieldValue(item, 'id');
  if (idField === undefined) {
    console.warn('HasManyField: item is object but has no id field:', item);
    return String(item);
  }

  // ID field'ı bir obje ise (data property'si var)
  if (idField && typeof idField === 'object' && 'data' in idField) {
    return String(idField.data);
  }

  // ID primitive value
  return String(idField);
};

/**
 * Resource objesinden name değerini çıkarır
 * Fallback olarak title veya ID kullanır
 */
const extractName = (item: any): string => {
  if (!item) return '';

  // name field'ını bul
  const nameField = getFieldValue(item, 'name');
  if (nameField !== undefined) {
    // name bir obje ise (data property'si var)
    if (nameField && typeof nameField === 'object' && 'data' in nameField) {
      return String(nameField.data);
    }
    return String(nameField);
  }

  // title field'ını dene
  const titleField = getFieldValue(item, 'title');
  if (titleField !== undefined) {
    if (titleField && typeof titleField === 'object' && 'data' in titleField) {
      return String(titleField.data);
    }
    return String(titleField);
  }

  // Fallback: ID kullan
  return extractId(item);
};

export const HasManyField = React.forwardRef<HTMLDivElement, HasManyFieldProps>(
  (
    {
      name,
      label,
      value: rawValue = [],
      onChange,
      onBlur,
      resourceType: _resourceType,
      related_resource,
      searchFn,
      options: initialOptions = EMPTY_OPTIONS,
      container,
      error,
      disabled = false,
      required = false,
      helpText,
      className,
      placeholder = 'Select resources...',
      tooltip,
      parentResourceId,
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [quickCreateOpen, setQuickCreateOpen] = useState(false);
    const anchor = useComboboxAnchor();

    // value'yu normalize et - her zaman string ID array'i olduğundan emin ol
    const value = useMemo(() => {
      if (!rawValue) return [];
      if (!Array.isArray(rawValue)) {
        console.warn('HasManyField: value prop must be an array, received:', typeof rawValue);
        return [];
      }

      // Array içindeki elemanları normalize et - extractId fonksiyonunu kullan
      return rawValue.map((item: any) => extractId(item)).filter(Boolean);
    }, [rawValue]);

    // Convert initialOptions (Record<string, string>) to Option[]
    // useMemo ile memoize ediyoruz ama JSON.stringify ile deep comparison yapıyoruz
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
              id: extractId(r),
              name: extractName(r)
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
              const mappedResults: Option[] = results.map((r: any) => ({
                id: String(r.id?.data || r.id),
                name: r.name?.data || r.name || String(r.id?.data || r.id)
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
          const mappedResults: Option[] = results.map((r: any) => ({
            id: String(r.id?.data || r.id),
            name: r.name?.data || r.name || String(r.id?.data || r.id) // Fallback if name is missing
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
                    onChange={(e) => handleSearch(e.target.value)}
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
                      <ComboboxList>
                        {availableOptions.map((option) => (
                          <ComboboxItem key={option.id} value={String(option.id)}>
                            {option.name || String(option.id)}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                      {availableOptions.length === 0 && <ComboboxEmpty>No results found</ComboboxEmpty>}
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
              // Yeni kaydı availableOptions'a ekle
              const newOption: Option = {
                id: extractId(createdResource),
                name: extractName(createdResource),
              };
              setAvailableOptions([...availableOptions, newOption]);

              // Yeni kaydı value array'ine ekle
              onChange([...value, String(newOption.id)]);

              // Search query'yi temizle
              setSearchQuery('');
            }}
          />
        </div>
      </FieldLayout>
    );
  }
);

HasManyField.displayName = 'HasManyField';
