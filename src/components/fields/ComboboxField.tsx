/**
 * ComboboxField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart combobox field implementasyonu
 * Arama ve çoklu seçim desteği ile
 */

import { useState, useEffect } from "react"
import { XIcon, Info } from "lucide-react"
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { FieldLayout } from './FieldLayout'

export interface ComboboxFieldProps {
    name: string
    label?: string
    value: string | string[]
    options: { value: string; label: string }[]
    onChange: (val: string | string[]) => void
    onBlur?: () => void
    error?: string
    disabled?: boolean
    required?: boolean
    placeholder?: string
    helpText?: string
    className?: string
    /**
     * Tooltip metni - Label'ın yanında info ikonu ile gösterilir
     */
    tooltip?: string
    /**
     * Çoklu seçim modu
     */
    multiple?: boolean
    /**
     * Portal container (dropdown'lar için)
     */
    container?: HTMLElement | null
}

/**
 * ComboboxField Component
 *
 * Mikro frontend pattern'ine uygun combobox field component'i
 * FieldLayout kullanarak tutarlı layout sağlar
 *
 * Özellikler:
 * - FieldLayout kullanır (tutarlı layout)
 * - Arama/filtreleme desteği
 * - Çoklu seçim desteği
 * - Seçili değerleri chip olarak gösterme
 * - Tooltip desteği
 * - Hata mesajı gösterimi
 * - Yardım metni desteği
 * - Erişilebilirlik özellikleri
 *
 * Kullanım Örnekleri:
 *
 * ```tsx
 * // Tekli seçim
 * <ComboboxField
 *   name="status"
 *   label="Durum"
 *   value={status}
 *   onChange={setStatus}
 *   options={[
 *     { value: 'active', label: 'Aktif' },
 *     { value: 'inactive', label: 'Pasif' }
 *   ]}
 * />
 *
 * // Çoklu seçim
 * <ComboboxField
 *   name="tags"
 *   label="Etiketler"
 *   value={tags}
 *   onChange={setTags}
 *   options={tagOptions}
 *   multiple
 *   placeholder="Etiket ara..."
 * />
 *
 * // Tooltip ile
 * <ComboboxField
 *   name="category"
 *   label="Kategori"
 *   value={category}
 *   onChange={setCategory}
 *   options={categories}
 *   tooltip="Ürün kategorisini seçin"
 *   required
 *   error={errors.category}
 * />
 * ```
 */
export function ComboboxField({
    name,
    label,
    value,
    options,
    onChange,
    onBlur,
    error,
    disabled = false,
    required = false,
    placeholder,
    helpText,
    className,
    tooltip,
    multiple = false,
    container
}: ComboboxFieldProps) {
    // Initial input value (only for single select)
    const getLabel = (val: string) => options.find(o => o.value === val)?.label || ""
    const [inputValue, setInputValue] = useState(
        !multiple && typeof value === 'string' ? getLabel(value) : ""
    )

    // Sync input value when external value changes (single select only)
    useEffect(() => {
        if (!multiple && typeof value === 'string') {
            const item = options.find(o => o.value === value)
            if (item) {
                setInputValue(prev => prev !== item.label ? item.label : prev)
            } else if (!value) {
                setInputValue(prev => prev !== "" ? "" : prev)
            }
        }
    }, [value, options, multiple])

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
    )

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

            <Combobox
                value={value}
                onValueChange={(val) => {
                    onChange(val || (multiple ? [] : ""))
                    // Update input label for single select
                    if (!multiple && typeof val === 'string') {
                        const item = options.find(o => o.value === val)
                        if (item) setInputValue(item.label)
                    }
                }}
                multiple={multiple}
            >
                {multiple && Array.isArray(value) && (
                    <div className="flex flex-wrap gap-1 mb-1">
                        {value.map((v) => {
                            const opt = options.find((o) => o.value === v)
                            return (
                                <div key={v} className="bg-muted text-foreground flex h-6 w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap">
                                    {opt?.label || v}
                                    <button
                                        type="button"
                                        className="-ml-1 opacity-50 hover:opacity-100 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            const newValue = value.filter(item => item !== v)
                                            onChange(newValue)
                                        }}
                                        disabled={disabled}
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
                <ComboboxInput
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                />
                <ComboboxContent container={container}>
                    <ComboboxList>
                        {options
                            .filter(item =>
                                item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                                (multiple && Array.isArray(value) ? value.includes(item.value) : item.value === value)
                            )
                            .map((item) => (
                                <ComboboxItem key={item.value} value={item.value}>
                                    {item.label}
                                </ComboboxItem>
                            ))}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </FieldLayout>
    )
}
