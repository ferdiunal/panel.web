/**
 * AsyncComboboxFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart async combobox implementasyonu (Form view)
 * Server-side search destekli combobox
 */

import React, { useState, useEffect, useCallback } from 'react';
import { XIcon, Loader2 } from 'lucide-react';
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { resourceService } from '@/services/resource';
import { useDebounce } from '@/hooks/useDebounce';
import type { ResourceParams } from '@/lib/resource-params';
import { FieldLayout } from '../FieldLayout';
import type { FormFieldProps } from '@/types';
import { cn } from '@/lib/utils';

export const AsyncComboboxFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  placeholder = 'Ara...',
  helpText,
  container,
}) => {
    // Props'tan gelen değerler
    const relatedResource = field.props?.related_resource as string;
    const multiple = field.props?.multiple as boolean;
    const initialOptions = (field.props?.options || []) as { value: string; label: string }[];

    // Local state
    const [inputValue, setInputValue] = useState("");
    const [options, setOptions] = useState<{ value: string; label: string }[]>(initialOptions);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce search input
    const debouncedSearch = useDebounce(inputValue, 300);

    // Fetch options from resource endpoint
    const fetchOptions = useCallback(async (searchQuery: string) => {
        if (!relatedResource) return;

        setIsLoading(true);
        try {
            // ResourceParams formatında params oluştur
            const params: ResourceParams = {
                page: 1,
                per_page: 50,
            };
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await resourceService.fetchResource(relatedResource, params);

            // Response'dan options oluştur
            const newOptions = response.data.map((item: any) => {
                const idField = item.id;
                const id = idField?.data || idField;

                let title = String(id);
                if (item.name?.data) {
                    title = item.name.data;
                } else if (item.title?.data) {
                    title = item.title.data;
                } else if (item.email?.data) {
                    title = item.email.data;
                }

                return {
                    value: String(id),
                    label: title
                };
            });

            setOptions(newOptions);
            setHasSearched(true);
        } catch (error) {
            console.error('AsyncComboboxField fetch error:', error);
            setOptions([]);
        } finally {
            setIsLoading(false);
        }
    }, [relatedResource]);

    // Search when debounced input changes
    useEffect(() => {
        if (debouncedSearch || !hasSearched) {
            fetchOptions(debouncedSearch);
        }
    }, [debouncedSearch, fetchOptions, hasSearched]);

    return (
        <FieldLayout
            name={name}
            label={label}
            error={error}
            required={required}
            helpText={helpText}
            disabled={disabled}
        >
            <Combobox
                value={value}
                onValueChange={(val) => {
                    onChange(val || (multiple ? [] : ""));
                    // Update input label for single select
                    if (!multiple && typeof val === 'string') {
                        const item = options.find(o => o.value === val);
                        if (item) setInputValue(item.label);
                    }
                }}
                multiple={multiple}
            >
                {multiple && Array.isArray(value) && (
                    <div className="flex flex-wrap gap-1 mb-1">
                        {value.map((v) => {
                            const opt = options.find((o) => o.value === v);
                            return (
                                <div key={v} className="bg-muted text-foreground flex h-6 w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap">
                                    {opt?.label || v}
                                    <button
                                        type="button"
                                        className="-ml-1 opacity-50 hover:opacity-100 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const newValue = value.filter(item => item !== v);
                                            onChange(newValue);
                                        }}
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="relative">
                    <ComboboxInput
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={cn(
                            error && 'border-destructive focus-visible:ring-destructive/20'
                        )}
                    />
                    {isLoading && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
                <ComboboxContent container={container}>
                    <ComboboxList>
                        {options.length === 0 && !isLoading && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {hasSearched ? "Sonuç bulunamadı" : "Arama yapın"}
                            </div>
                        )}
                        {options.map((item) => (
                            <ComboboxItem key={item.value} value={item.value}>
                                {item.label}
                            </ComboboxItem>
                        ))}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </FieldLayout>
    );
};

AsyncComboboxFormField.displayName = 'AsyncComboboxFormField';
