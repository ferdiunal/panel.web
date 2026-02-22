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
import { AddonAwareControl } from "./input-group-addon"
import { resolveFieldInputAddons } from "./input-group-addon-utils"

interface ResourceOption {
  value: string | number
  display: string
  avatar?: string
  subtitle?: string
}

type MorphTypeOption = { label: string; value: string; slug: string }

function normalizeMorphIdentifier(value?: string): string {
  if (!value) return ""
  const base = value
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .pop()

  if (!base) return ""

  return base
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function buildMorphIdentifierCandidates(value?: string): Set<string> {
  const candidates = new Set<string>()
  const normalized = normalizeMorphIdentifier(value)
  if (!normalized) return candidates

  candidates.add(normalized)
  candidates.add(normalized.replace(/-/g, "_"))
  candidates.add(normalized.replace(/_/g, "-"))
  if (normalized.endsWith("s")) {
    const singular = normalized.slice(0, -1)
    if (singular) candidates.add(singular)
  } else {
    candidates.add(`${normalized}s`)
  }
  if (normalized.endsWith("ies")) {
    const singularY = `${normalized.slice(0, -3)}y`
    if (singularY.length > 1) candidates.add(singularY)
  } else if (normalized.endsWith("y")) {
    candidates.add(`${normalized.slice(0, -1)}ies`)
  }
  if (normalized.endsWith("es")) {
    const singularEs = normalized.slice(0, -2)
    if (singularEs.length > 1) candidates.add(singularEs)
  }

  return candidates
}

function resolveTypeOption(
  options: MorphTypeOption[],
  rawType?: string
): MorphTypeOption | undefined {
  if (!rawType) return undefined
  const typeCandidates = buildMorphIdentifierCandidates(rawType)
  if (typeCandidates.size === 0) return undefined

  return options.find((option) => {
    const optionCandidates = new Set<string>()
    for (const candidate of [option.value, option.slug, option.label]) {
      for (const normalized of buildMorphIdentifierCandidates(candidate)) {
        optionCandidates.add(normalized)
      }
    }

    for (const candidate of typeCandidates) {
      if (optionCandidates.has(candidate)) return true
    }

    return false
  })
}

function extractIdValue(input: unknown): string | number | undefined {
  if (input === null || input === undefined) return undefined

  if (typeof input === "string") {
    const trimmed = input.trim()
    if (!trimmed) return undefined

    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>
        return (
          extractIdValue(parsed.id) ||
          extractIdValue(parsed.morphToId) ||
          extractIdValue(parsed.morph_id) ||
          extractIdValue(parsed.commentable_id) ||
          extractIdValue(parsed.value) ||
          extractIdValue(parsed.data)
        )
      } catch {
        // Keep plain string fallback
      }
    }

    return trimmed
  }
  if (typeof input === "number") {
    return Number.isNaN(input) ? undefined : input
  }

  if (typeof input !== "object") return undefined
  const record = input as Record<string, unknown>

  const nestedData = record.data
  if (nestedData !== undefined && nestedData !== input) {
    const nestedId = extractIdValue(nestedData)
    if (nestedId !== undefined) return nestedId
  }

  const idCandidates = [
    record.id,
    record.morphToId,
    record.morph_id,
    record.commentable_id,
    record.related_id,
    record.value,
  ]

  for (const candidate of idCandidates) {
    const parsed = extractIdValue(candidate)
    if (parsed !== undefined) return parsed
  }

  return undefined
}

function extractTypeValue(input: unknown): string | undefined {
  if (input === null || input === undefined) return undefined

  if (typeof input === "string") {
    const trimmed = input.trim()
    if (!trimmed) return undefined

    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>
        return (
          extractTypeValue(parsed.type) ||
          extractTypeValue(parsed.morphToType) ||
          extractTypeValue(parsed.morph_type) ||
          extractTypeValue(parsed.commentable_type) ||
          extractTypeValue(parsed.target_type) ||
          extractTypeValue(parsed.resource) ||
          extractTypeValue(parsed.resource_slug) ||
          extractTypeValue(parsed.resourceSlug) ||
          extractTypeValue(parsed.related_resource) ||
          extractTypeValue(parsed.slug) ||
          extractTypeValue(parsed.value) ||
          extractTypeValue(parsed.data)
        )
      } catch {
        // Keep plain string fallback
      }
    }

    return trimmed
  }

  if (typeof input !== "object") return undefined
  const record = input as Record<string, unknown>

  const nestedData = record.data
  if (nestedData !== undefined && nestedData !== input) {
    const nestedType = extractTypeValue(nestedData)
    if (nestedType) return nestedType
  }

  const typeCandidates = [
    record.type,
    record.morphToType,
    record.morph_type,
    record.commentable_type,
    record.model_type,
    record.target_type,
    record.resource,
    record.resource_slug,
    record.resourceSlug,
    record.related_resource,
    record.slug,
    record.value,
  ]

  for (const candidate of typeCandidates) {
    const parsed = extractTypeValue(candidate)
    if (parsed) return parsed
  }

  return undefined
}

function hasIdValue(input: string | number | undefined): boolean {
  if (input === null || input === undefined) return false
  if (typeof input === "string") return input.trim().length > 0
  return true
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
  startAddon,
  endAddon,
  ...props
}) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ResourceOption[]>([])
  const [search, setSearch] = useState("")
  const [initialLabel, setInitialLabel] = useState<string>("")
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)

  // Props extraction
  const resourceSlug = field.props?.resourceSlug as string; // Ensure this is passed or available
  const parentResourceId = (props.parentResourceId ?? field.props?.parentResourceId) as string | number | undefined;
  const parentResourceSlug = (props.parentResourceSlug ?? field.props?.parentResourceSlug) as string | undefined;
  const addons = resolveFieldInputAddons(
    field.props as Record<string, unknown> | undefined,
    { startAddon, endAddon }
  )
  const hasAddons = !!addons.startAddon || !!addons.endAddon

  // types dizisini memoize et — field.props?.types referansı her render'da değişebilir
  const types = useMemo(
    () => (field.props?.types as MorphTypeOption[]) || [],
    [field.props?.types]
  )
  const fieldData = (field as { data?: unknown }).data

  const fallbackType = useMemo(() => {
    return (
      extractTypeValue(fieldData) ||
      extractTypeValue(field.props?.morph_type)
    )
  }, [fieldData, field.props?.morph_type])

  const fallbackId = useMemo(() => {
    return (
      extractIdValue(fieldData) ??
      extractIdValue(field.props?.morph_id)
    )
  }, [fieldData, field.props?.morph_id])

  const rawType = useMemo(() => {
    return extractTypeValue(value) || fallbackType
  }, [value, fallbackType])

  const selectedId = useMemo(() => {
    return extractIdValue(value) ?? fallbackId ?? ""
  }, [value, fallbackId])

  const matchedTypeOption = useMemo(
    () => resolveTypeOption(types, rawType),
    [types, rawType]
  )

  const selectedType = useMemo(() => {
    if (matchedTypeOption?.value) return matchedTypeOption.value
    if (rawType && types.some((t) => t.value === rawType)) return rawType
    if (!rawType && hasIdValue(selectedId) && types.length === 1) return types[0].value
    return ""
  }, [matchedTypeOption, rawType, selectedId, types])

  // Ensure edit forms keep backend value in RHF state even if controller starts empty.
  useEffect(() => {
    const valueType = extractTypeValue(value)
    const valueId = extractIdValue(value)
    if (valueType || hasIdValue(valueId)) return
    if (!fallbackType && !hasIdValue(fallbackId)) return

    onChange({
      type: fallbackType ?? null,
      id: fallbackId ?? null,
    })
  }, [value, fallbackType, fallbackId, onChange])

  // If backend sends only ID in edit payload, infer type safely and write back to form state.
  useEffect(() => {
    if (!selectedId || selectedType) return
    if (types.length !== 1) return

    onChange({ type: types[0].value, id: selectedId })
  }, [selectedId, selectedType, types, onChange])

  // Fetch options using the new morphable endpoint
  const fetchMorphableOptions = useCallback(async (typeValue: string, searchQuery: string = "", currentId?: string | number) => {
    if (!typeValue || !resourceSlug) return

    setLoading(true)
    try {
      const response = await axios.get(`/resource/${resourceSlug}/morphable/${field.key}`, {
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
        const typeDef = resolveTypeOption(types, typeValue)
        if (typeDef) {
          const fallbackResponse = await axios.get(`/resource/${typeDef.slug}`, {
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

    const typeDef = resolveTypeOption(types, selectedType)
    if (!typeDef) return

    // If we have the object in value (e.g. eager loaded), use it
    if (value?.attributes?.name || value?.name || value?.display) {
      setInitialLabel(value.attributes?.name || value.name || value.display)
      return
    }

    // Fetch the initial resource to get its label
    const fetchInitial = async () => {
      try {
        const response = await axios.get(`/resource/${typeDef.slug}/${selectedId}`)
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

  // Load default options when type changes.
  // Requirement: fetch should happen on type selection, not on combobox focus/open.
  useEffect(() => {
    if (!selectedType) {
      setOptions([])
      return
    }

    void fetchMorphableOptions(selectedType, "")
  }, [fetchMorphableOptions, selectedType])

  // Run server-side search only when user types in the search input.
  useEffect(() => {
    if (!selectedType) return
    const normalizedSearch = search.trim()
    if (!normalizedSearch) return

    const timer = setTimeout(() => {
      fetchMorphableOptions(selectedType, normalizedSearch, selectedId)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, selectedType, fetchMorphableOptions, selectedId])

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
  const displayLabel = selectedOption?.display || initialLabel || (hasIdValue(selectedId) ? `#${selectedId}` : "Kaynak seç...")

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
                <AddonAwareControl
                  startAddon={addons.startAddon}
                  endAddon={addons.endAddon}
                  controlClassName={hasAddons ? "px-1.5" : undefined}
                >
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                          "justify-between w-full font-normal",
                          hasAddons && "h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                        )}
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
                </AddonAwareControl>
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
            parentResourceId={parentResourceId}
            parentResourceSlug={parentResourceSlug}
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
