/**
 * MorphToFormField - Mikro Frontend Pattern
 *
 * FieldLayout kullanarak standart MorphTo relationship field implementasyonu (Form view)
 * Polymorphic relationship desteği ile
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"
import axios from "@/lib/axios"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldLayout } from "../FieldLayout"
import type { FormFieldProps } from "@/types"
import { QuickCreateModal } from "../QuickCreateModal"

interface ResourceOption {
  value: string | number
  display: string
  avatar?: string
  subtitle?: string
}

export const MorphToFormField: React.FC<FormFieldProps> = ({
  field,
  name,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helpText,
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ResourceOption[]>([])
  const [search, setSearch] = useState("")
  const [initialLabel, setInitialLabel] = useState<string>("")
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)

  // Props extraction
  const resourceSlug = field.props?.resourceSlug as string; // Ensure this is passed or available

  // Parse value: could be { type, id } object or separate fields
  let selectedType = value?.type || value?.morphToType || ""
  let selectedId = value?.id || value?.morphToId || ""

  // Check if value is nested (e.g. value.data)
  if (!selectedType && !selectedId && value?.data) {
    selectedType = value.data.type || value.data.morphToType
    selectedId = value.data.id || value.data.morphToId
  }

  // types dizisini memoize et — field.props?.types referansı her render'da değişebilir
  const types = useMemo(
    () => (field.props?.types as Array<{ label: string, value: string, slug: string }>) || [],
    [field.props?.types]
  )

  // Fetch options using the new morphable endpoint
  const fetchMorphableOptions = useCallback(async (typeValue: string, searchQuery: string = "", currentId?: string | number) => {
    if (!typeValue || !resourceSlug) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/resource/${resourceSlug}/morphable/${field.key}`, {
        params: {
          type: typeValue,
          search: searchQuery,
          per_page: 15,
          current: currentId || "",
        },
      })

      const resources = response.data.resources || []
      setOptions(resources)
    } catch (error) {
      console.error("Failed to fetch morphable resources", error)
      // Fallback to direct resource endpoint
      try {
        const typeDef = types.find((t) => t.value === typeValue || t.slug === typeValue)
        if (typeDef) {
          const fallbackResponse = await axios.get(`/api/resource/${typeDef.slug}`, {
            params: {
              search: searchQuery,
              per_page: 15,
            },
          })

          const data = fallbackResponse.data.data || []
          const mapped = data.map((item: any) => {
            const id = item.id?.data || item.id
            const nameField = item.name || item.title || item.label || item.email || item.username
            const display = nameField?.data || nameField || `#${id}`
            return { value: id, display }
          })
          setOptions(mapped)
        }
      } catch (fallbackError) {
        console.error("Fallback also failed", fallbackError)
        setOptions([])
      }
    } finally {
      setLoading(false)
    }
  }, [resourceSlug, field.key, types])

  // Load initial label if needed
  useEffect(() => {
    if (!selectedType || !selectedId || initialLabel) return

    const typeDef = types.find((t) => t.value === selectedType || t.slug === selectedType)
    if (!typeDef) return

    // If we have the object in value (e.g. eager loaded), use it
    if (value?.attributes?.name || value?.name || value?.display) {
      setInitialLabel(value.attributes?.name || value.name || value.display)
      return
    }

    // Fetch the initial resource to get its label
    const fetchInitial = async () => {
      try {
        const response = await axios.get(`/api/resource/${typeDef.slug}/${selectedId}`)
        const item = response.data.data

        const displays = (field.props?.displays as Record<string, string>) || {}
        const preferredField = displays[selectedType] || displays[typeDef.slug]

        let label = ""
        if (preferredField && item?.[preferredField]) {
             label = item[preferredField]?.data || item[preferredField]
        }

        if (!label) {
             label = item?.name?.data || item?.title?.data || item?.label?.data ||
                      item?.name || item?.title || item?.label || `#${selectedId}`
        }

        setInitialLabel(label)
      } catch (e) {
        console.error("Failed to fetch initial resource", e)
        setInitialLabel(`#${selectedId}`)
      }
    }
    fetchInitial()
  }, [selectedType, selectedId, types, value, initialLabel, field.props])

  // Fetch options when popover opens or search changes
  useEffect(() => {
    if (!open || !selectedType) return

    const timer = setTimeout(() => {
      fetchMorphableOptions(selectedType, search, selectedId)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, selectedType, open, fetchMorphableOptions, selectedId])

  const handleTypeChange = (newType: string) => {
    onChange({ type: newType, id: null })
    setOptions([])
    setSearch("")
    setInitialLabel("")
  }

  const handleResourceSelect = (option: ResourceOption) => {
    onChange({ type: selectedType, id: option.value })
    setInitialLabel(option.display)
    setOpen(false)
  }

  const selectedOption = options.find((o) => String(o.value) === String(selectedId))
  const displayLabel = selectedOption?.display || initialLabel || (selectedId ? `#${selectedId}` : "Kaynak seç...")

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
        <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">Tip</label>
            <Select value={selectedType} onValueChange={handleTypeChange} disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder="Tip seç" />
            </SelectTrigger>
            <SelectContent>
                {types.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                    {t.label}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>

        <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">Kaynak</label>
            <div className="flex gap-2">
            <div className="flex-1">
                <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full font-normal"
                    disabled={!selectedType || disabled}
                    >
                    {displayLabel}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Kaynak ara..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {loading && (
                        <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...
                        </div>
                        )}
                        {!loading && options.length === 0 && (
                        <CommandEmpty>Kaynak bulunamadı.</CommandEmpty>
                        )}
                        {!loading && options.map((option) => (
                        <CommandItem
                            key={option.value}
                            value={String(option.value)}
                            onSelect={() => handleResourceSelect(option)}
                        >
                            <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                String(selectedId) === String(option.value) ? "opacity-100" : "opacity-0"
                            )}
                            />
                            <div className="flex flex-col">
                            <span>{option.display}</span>
                            {option.subtitle && (
                                <span className="text-xs text-muted-foreground">{option.subtitle}</span>
                            )}
                            </div>
                        </CommandItem>
                        ))}
                    </CommandList>
                    </Command>
                </PopoverContent>
                </Popover>
            </div>
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuickCreateOpen(true)}
                disabled={!selectedType || disabled}
                title="Hızlı oluştur"
            >
                <Plus className="h-4 w-4" />
            </Button>
            </div>
        </div>

        {/* Quick Create Modal */}
        {selectedType && (
            <QuickCreateModal
            resourceSlug={types.find((t) => t.value === selectedType || t.slug === selectedType)?.slug || selectedType}
            open={quickCreateOpen}
            onOpenChange={setQuickCreateOpen}
            onSuccess={(createdResource) => {
                // Yeni kaydı options'a ekle
                const newOption: ResourceOption = {
                value: createdResource.id?.data || createdResource.id,
                display: createdResource.name?.data || createdResource.name || createdResource.title?.data || createdResource.title || `#${createdResource.id}`,
                };
                setOptions([...options, newOption]);

                // Yeni kaydı seç
                onChange({ type: selectedType, id: newOption.value });
                setInitialLabel(newOption.display);

                // Search query'yi temizle
                setSearch("");
                setOpen(false);
            }}
            />
        )}
        </div>
    </FieldLayout>
  )
}

MorphToFormField.displayName = 'MorphToFormField';
