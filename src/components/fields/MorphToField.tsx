import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from '@/lib/axios';
import type { Resource } from '@/types';

// Support both old format (string[]) and new format (object[])
type ResourceTypeItem = string | { label: string; value: string; slug: string };

export interface MorphToFieldProps {
  name: string;
  label: string;
  value: string | { type: string; id: string | number | null } | null;
  onChange: (value: string | { type: string; id: string | number | null } | null) => void;
  resourceTypes: ResourceTypeItem[];
  displays?: Record<string, string>; // Type => Display field name mapping
  resourceSlug?: string;
  searchFn?: (type: string, query: string) => Promise<Resource[]>;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  placeholder?: string;
  container?: HTMLElement | null;
}

interface MorphableOption {
  value: string | number;
  display: string;
  avatar?: string;
  subtitle?: string;
}

// Normalize resourceTypes to consistent format
function normalizeResourceTypes(types: ResourceTypeItem[]): Array<{ label: string; value: string; slug: string }> {
  return types.map(t => {
    if (typeof t === 'string') {
      return { label: t, value: t, slug: t };
    }
    return t;
  });
}

// Parse value to consistent format
function parseValue(value: MorphToFieldProps['value']): { type: string; id: string | number | null } {
  if (!value) return { type: '', id: null };
  if (typeof value === 'string') {
    return { type: '', id: value || null };
  }

  // Handle nested data (e.g. {data: {type, id}} from backend)
  const data = (value as any).data || value;

  return {
    type: data.type || data.morphToType || '',
    id: data.id ?? data.morphToId ?? null
  };
}

export const MorphToField = React.forwardRef<HTMLDivElement, MorphToFieldProps>(
  (
    {
      name,
      // @ts-ignore
      label,
      value,
      onChange,
      resourceTypes,
      displays = {},
      resourceSlug,
      searchFn,
      error,
      disabled = false,
      required = false,
      helpText,
      className,
      placeholder = 'Kaynak seç...',
      container: _container,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [options, setOptions] = useState<MorphableOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize display label from backend data if available
    const [displayLabel, setDisplayLabel] = useState(() => {
      if (!value) return '';

      const data = (value as any).data || value;
      const type = data.type || data.morphToType || '';
      const id = data.id ?? data.morphToId ?? null;

      if (!type || !id) return '';

      // Check if backend provided display field value
      const preferredField = displays[type];
      if (preferredField && data[preferredField]) {
        return String(data[preferredField]);
      }

      return '';
    });

    // Ref to prevent duplicate fetches
    const fetchingRef = useRef(false);
    const lastFetchRef = useRef<string>('');
    const initialOptionsFetchedRef = useRef(false);

    const normalizedTypes = useMemo(() => normalizeResourceTypes(resourceTypes), [resourceTypes]);
    const parsedValue = useMemo(() => parseValue(value), [value]);
    const selectedType = parsedValue.type;
    const selectedId = parsedValue.id;

    // const typeDef = useMemo(
    //   () => normalizedTypes.find(t => t.value === selectedType || t.slug === selectedType),
    //   [normalizedTypes, selectedType]
    // );

    // Fetch options - memoized with useCallback
    const fetchOptions = useCallback(async (typeValue: string, query: string, currentId?: string | number | null) => {
      if (!typeValue) return;

      // Prevent duplicate fetches
      const fetchKey = `${typeValue}-${query}-${currentId}`;
      if (fetchingRef.current || lastFetchRef.current === fetchKey) return;

      fetchingRef.current = true;
      lastFetchRef.current = fetchKey;
      setIsLoading(true);

      try {
        if (resourceSlug) {
          const response = await axios.get(`/api/resource/${resourceSlug}/morphable/${name}`, {
            params: {
              type: typeValue,
              search: query,
              per_page: 15,
              current: currentId || '',
            },
          });
          setOptions(response.data.resources || []);
        } else if (searchFn) {
          const results = await searchFn(typeValue, query);
          setOptions(results.map(r => ({ value: r.id, display: r.name || String(r.id) })));
        } else {
          const td = normalizedTypes.find(t => t.value === typeValue || t.slug === typeValue);
          if (td) {
            const fallback = await axios.get(`/api/resource/${td.slug}`, {
              params: { search: query, per_page: 15 },
            });
            const data = fallback.data.data || [];
            setOptions(data.map((item: any) => {
              const id = item.id?.data || item.id;
              const display = item.name?.data || item.name || item.title?.data || item.title || `#${id}`;
              return { value: id, display };
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch morphable resources:', err);
        setOptions([]);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    }, [resourceSlug, name, searchFn, normalizedTypes]);

    // Fetch options when popover opens or search changes
    useEffect(() => {
      if (!open || !selectedType) return;

      const timer = setTimeout(() => {
        fetchOptions(selectedType, searchQuery, selectedId);
      }, 300);

      return () => clearTimeout(timer);
    }, [searchQuery, selectedType, open]);

    // Fetch initial options if selectedId exists (for edit mode)
    useEffect(() => {
      if (!selectedType || !selectedId) return;
      if (initialOptionsFetchedRef.current) return;
      if (options.length > 0) return;

      initialOptionsFetchedRef.current = true;
      fetchOptions(selectedType, '', selectedId);
    }, [selectedType, selectedId, fetchOptions, options.length]);

    // Reset fetch refs when type changes
    useEffect(() => {
      lastFetchRef.current = '';
      initialOptionsFetchedRef.current = false;
    }, [selectedType]);

    const handleTypeChange = (newType: string) => {
      onChange({ type: newType, id: null });
      setOptions([]);
      setSearchQuery('');
      setDisplayLabel('');
      lastFetchRef.current = '';
    };

    const handleResourceSelect = (option: MorphableOption) => {
      onChange({ type: selectedType, id: option.value });
      setDisplayLabel(option.display);
      setOpen(false);
    };

    const selectedOption = options.find(o => String(o.value) === String(selectedId));
    const buttonLabel = selectedOption?.display || displayLabel || (selectedId ? `#${selectedId}` : placeholder);

    return (
      <div className={cn('flex flex-col gap-3', className)} ref={ref}>
        <div className="flex gap-2">
          <div className="grid gap-2 shrink-1">
            <Label htmlFor={`${name}-type`} className="text-sm font-medium">
              Tip
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select value={selectedType} onValueChange={handleTypeChange} disabled={disabled}>
              <SelectTrigger id={`${name}-type`}>
                <SelectValue placeholder="Tip seç" />
              </SelectTrigger>
              <SelectContent>
                {normalizedTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 flex-1">
            <Label htmlFor={name} className="text-sm font-medium">
              Kaynak
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={!!error}
                  className="justify-between w-full font-normal"
                  disabled={disabled || !selectedType}
                >
                  {buttonLabel}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Ara..." value={searchQuery} onValueChange={setSearchQuery} />
                  <CommandList>
                    {isLoading && (
                      <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...
                      </div>
                    )}
                    {!isLoading && options.length === 0 && (
                      <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                    )}
                    {!isLoading && options.length > 0 && (
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={String(option.value)}
                            onSelect={() => handleResourceSelect(option)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                String(selectedId) === String(option.value) ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <span>{option.display}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {helpText && !error && <p className="text-sm text-muted-foreground">{helpText}</p>}
      </div>
    );
  }
);

MorphToField.displayName = 'MorphToField';
