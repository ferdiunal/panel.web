/**
 * HasManyFormField - Mikro Frontend Pattern
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
import { QuickCreateModal } from '../QuickCreateModal';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';

const EMPTY_OPTIONS: Record<string, string> = {};

interface Option {
  id: string | number;
  name?: string;
}

/**
 * Backend'den gelen field değerlerini normalize eder
 */
const getFieldValue = (obj: any, fieldName: string): any => {
  if (!obj || typeof obj !== 'object') return undefined;

  if (obj[fieldName] !== undefined) return obj[fieldName];

  const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  if (obj[capitalizedField] !== undefined) return obj[capitalizedField];

  const upperField = fieldName.toUpperCase();
  if (obj[upperField] !== undefined) return obj[upperField];

  return undefined;
};

/**
 * Resource objesinden ID değerini çıkarır
 */
const extractId = (item: any): string => {
  if (!item) return '';

  if (typeof item !== 'object') return String(item);

  const idField = getFieldValue(item, 'id');
  if (idField === undefined) {
    console.warn('HasManyField: item is object but has no id field:', item);
    return String(item);
  }

  if (idField && typeof idField === 'object' && 'data' in idField) {
    return String(idField.data);
  }

  return String(idField);
};

/**
 * Resource objesinden name değerini çıkarır
 */
const extractName = (item: any): string => {
  if (!item) return '';

  const nameField = getFieldValue(item, 'name');
  if (nameField !== undefined) {
    if (nameField && typeof nameField === 'object' && 'data' in nameField) {
      return String(nameField.data);
    }
    return String(nameField);
  }

  const titleField = getFieldValue(item, 'title');
  if (titleField !== undefined) {
    if (titleField && typeof titleField === 'object' && 'data' in titleField) {
      return String(titleField.data);
    }
    return String(titleField);
  }

  return extractId(item);
};

export const HasManyFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value: rawValue = [],
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  placeholder = 'Select resources...',
  helpText,
  container,
  className,
  ...props
}) => {
  // Props extraction
  const related_resource = field.props?.related_resource as string;
  const searchFn = field.props?.searchFn as (query: string) => Promise<Resource[]>;
  const optionsProp = field.props?.options as Record<string, string>;
  const initialOptions = optionsProp || EMPTY_OPTIONS;
  const tooltip = field.props?.tooltip as string;
  // Prefer direct prop (from FieldRenderer), fallback to field.props (from backend)
  const parentResourceId = (props.parentResourceId || field.props?.parentResourceId) as string | number;

  const [searchQuery, setSearchQuery] = useState('');
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const anchor = useComboboxAnchor();

  // value'yu normalize et
  const value = useMemo(() => {
    if (!rawValue) return [];
    if (!Array.isArray(rawValue)) {
      console.warn('HasManyField: value prop must be an array, received:', typeof rawValue);
      return [];
    }
    return rawValue.map((item: any) => extractId(item)).filter(Boolean);
  }, [rawValue]);

  // Convert initialOptions to Option[]
  const preloadedResources = useMemo(() => {
    return Object.entries(initialOptions).map(([id, name]) => ({
      id: id,
      name: name,
    }));
  }, [initialOptions]);

  // Load initial options
  useEffect(() => {
    if (Object.keys(initialOptions).length === 0 && searchFn) {
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
      if (!searchFn) return;

      if (query.length === 0) {
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
        const mappedResults: Option[] = results.map((r: any) => ({
          id: String(r.id?.data || r.id),
          name: r.name?.data || r.name || String(r.id?.data || r.id)
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

  const getDisplayValue = useCallback((id: string) => {
    const option = availableOptions.find(opt => String(opt.id) === String(id)) ||
      preloadedResources.find(opt => String(opt.id) === String(id));
    return option?.name || id;
  }, [availableOptions, preloadedResources]);

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
              const newOption: Option = {
                id: extractId(createdResource),
                name: extractName(createdResource),
              };
              setAvailableOptions([...availableOptions, newOption]);
              onChange([...value, String(newOption.id)]);
              setSearchQuery('');
            }}
          />
        )}
      </div>
    </FieldLayout>
  );
};

HasManyFormField.displayName = 'HasManyFormField';
