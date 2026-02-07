import React, { useState } from "react"
import type { FieldData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import AvatarUpload from "@/components/file-upload/avatar-upload"
import TableUpload from "@/components/file-upload/table-upload"
import { ComboboxField } from "@/components/fields/ComboboxField"
import { MorphToField } from "@/components/fields/MorphToField"
import { RichTextField } from "@/components/fields/RichTextField"
import { PanelField } from "@/components/fields/PanelField"
import { resourceService } from "@/services/resource"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

// If textarea doesn't exist, I'll stick to Input or standard textarea
// Check Shadcn Input.

interface ResourceFormProps {
    fields: FieldData[]
    initialData?: Record<string, any>
    onSubmit: (data: Record<string, any>) => Promise<void>
    onCancel?: () => void
    submitLabel?: string
    hideCancel?: boolean
    container?: HTMLElement | null
}

export function ResourceForm({
    fields,
    initialData = {},
    onSubmit,
    onCancel,
    submitLabel = "Save",
    hideCancel = false,
    container,
}: ResourceFormProps) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData)
    const [loading, setLoading] = useState(false)
    const [_, setErrors] = useState<Record<string, string>>({})

    React.useEffect(() => {
        setFormData(initialData)
    }, [JSON.stringify(initialData)])



    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            await onSubmit(formData)
        } catch (error: any) {
            console.error(error)
            // Handle validation errors from backend if standard format
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            {fields.map((field) => {
                // Handle panel fields separately
                if (field.view === "panel-field") {
                    return (
                        <PanelField
                            key={field.key}
                            field={field}
                            fields={fields}
                            formData={formData}
                            handleChange={handleChange}
                            renderInput={renderInput}
                            container={container}
                        />
                    )
                }

                if (field.read_only) return null

                return (
                    <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>
                            {field.name || field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {renderInput(field, formData, handleChange, container)}
                        {field.help_text && (
                            <p className="text-xs text-muted-foreground">{field.help_text}</p>
                        )}
                    </div>
                )
            })}

            <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 pt-6">
                {!hideCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="w-full md:w-auto h-12 md:h-10 text-base">
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={loading} className="w-full md:w-auto h-12 md:h-10 text-base">
                    {loading ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    )
}

function renderInput(
    field: FieldData,
    formData: Record<string, any>,
    onChange: (key: string, val: any) => void,
    container?: HTMLElement | null
) {
    // For MorphTo field, use field.data if formData value is empty
    const value = formData[field.key] || (field.view === "morph-to-field" ? field.data : "");
    // Normalize object values (relationships) to ID or empty string to prevent React errors
    let normalizedValue = value;
    if (typeof value === 'object' && value !== null) {
        // Check for empty/zero object
        const id = value.id || value.ID;
        if (id && id !== 0) {
            normalizedValue = id;
        } else {
            normalizedValue = "";
        }
    }

    const commonProps = {
        id: field.key,
        name: field.key,
        disabled: field.disabled || field.read_only,
        placeholder: field.placeholder,
        required: field.required,
        value: normalizedValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field.key, e.target.value),
    }

    // Custom Upload Components
    if (field.view === "image-field") {
        return (
            <AvatarUpload
                className="w-full"
                defaultAvatar={typeof value === 'string' ? value : undefined}
                onFileChange={(file) => {
                    onChange(field.key, file ? file.file : null)
                }}
            />
        )
    }

    if (field.type === "file" || field.view === "file-field") {
        return (
            <TableUpload
                maxFiles={field.props?.multiple ? 10 : 1}
                multiple={field.props?.multiple}
                simulateUpload={false} // Real upload handled by form submit
                // TableUpload expects FileWithPreview[], form state holds File objects or strings (urls)
                // We need to handle this impedance mismatch if we want to show existing files.
                // For now, onFilesChange updates the form state with selected files.
                onFilesChange={(files) => {
                    // If multiple, pass array of Files. If single, pass first File.
                    if (field.props?.multiple) {
                        onChange(field.key, files.map(f => f.file))
                    } else {
                        onChange(field.key, files.length > 0 ? files[0].file : null)
                    }
                }}
            />
        )
    }

    switch (field.view) {
        case "password-field":
            return <Input type="password" {...commonProps} />
        case "email-field":
            return <Input type="email" {...commonProps} />
        case "number-field":
            return <Input type="number" {...commonProps} />
        case "date-field":
            return <Input type="date" {...commonProps} />
        case "textarea-field":
            return <Textarea {...commonProps} />
        case "richtext-field":
            return (
                <RichTextField
                    name={field.key}
                    label={field.name}
                    value={value || ''}
                    onChange={(val) => onChange(field.key, val)}
                    disabled={field.disabled || field.read_only}
                    required={field.required}
                    placeholder={field.props?.placeholder as string}
                    helpText={field.props?.helpText as string}
                />
            )
        case "switch-field":
        case "boolean-field":
            return (
                <div className="flex items-center space-x-2">
                    <Switch
                        id={field.key}
                        checked={!!value}
                        disabled={field.disabled || field.read_only}
                        onCheckedChange={(checked) => onChange(field.key, checked)}
                    />
                </div>
            )
        case "has-one-field":
        case "belongs-to-field":
        case "combobox-field":
            // eslint-disable-next-line no-case-declarations
            const options = (field.props?.options as Record<string, string>) || {}
            // eslint-disable-next-line no-case-declarations
            const items = Object.entries(options).map(([val, label]) => ({
                value: val,
                label: label,
            }))

            // Find selected label for display if needed, but Combobox should handle it if value matches
            // Ensure value is string to match options keys
            const stringValue = value !== null && value !== undefined ? String(value) : ""

            return (
                <ComboboxField
                    value={stringValue}
                    options={items}
                    onChange={(val) => onChange(field.key, val)}
                    placeholder={field.placeholder || "Select option..."}
                    container={container}
                />
            )
        case "belongs-to-many-field":
            // eslint-disable-next-line no-case-declarations
            const btmOptions = (field.props?.options as Record<string, string>) || {}
            // eslint-disable-next-line no-case-declarations
            const btmItems = Object.entries(btmOptions).map(([val, label]) => ({
                value: val,
                label: label,
            }))

            // Ensure value is array of strings
            // eslint-disable-next-line no-case-declarations
            let btmValue: string[] = []
            if (Array.isArray(value)) {
                btmValue = value.map(v => {
                    if (typeof v === 'object' && v !== null) {
                        return String(v.id || v.ID || '')
                    }
                    return String(v)
                }).filter(v => v !== '')
            } else if (value) {
                if (typeof value === 'object' && value !== null) {
                    const id = (value as any).id || (value as any).ID
                    if (id) btmValue = [String(id)]
                } else {
                    btmValue = [String(value)]
                }
            }

            return (
                <ComboboxField
                    value={btmValue}
                    options={btmItems}
                    onChange={(val) => onChange(field.key, val)}
                    placeholder={field.placeholder || "Select items..."}
                    multiple={true}
                    container={container}
                />
            )
        case "morph-to-field":
            return (
                <MorphToField
                    name={field.key}
                    label={field.name || field.label}
                    value={value}
                    onChange={(val) => onChange(field.key, val)}
                    resourceTypes={field.props?.types || field.props?.resource_types || []}
                    displays={field.props?.displays || {}}
                    searchFn={async (type, query) => {
                        try {
                            const response = await resourceService.fetchResource(type, {
                                search: query,
                                page: 1,
                                per_page: 20
                            });
                            return response.data.map(item => {
                                const id = (item.id as any)?.data ?? (item.ID as any)?.data ?? "";
                                const name = (item.name as any)?.data ?? (item.label as any)?.data ?? (item.title as any)?.data ?? id;
                                return {
                                    id: String(id),
                                    name: String(name),
                                    type: type,
                                    attributes: item as any,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                };
                            });
                        } catch (error) {
                            console.error(`Search failed for ${type}:`, error);
                            return [];
                        }
                    }}
                    placeholder={field.placeholder}
                    container={container}
                />
            )
        case "select-field":
            // eslint-disable-next-line no-case-declarations
            const _options = (field.props?.options as Record<string, string>) || {}
            // eslint-disable-next-line no-case-declarations
            const _items = Object.entries(_options).map(([val, label]) => ({
                value: val,
                label: label,
            }))

            return (
                <Select
                    defaultValue={String(value).toLowerCase()}
                    value={String(value).toLowerCase()}
                    onValueChange={(val) => onChange(field.key, val)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={field.placeholder || "Select option..."} />
                    </SelectTrigger>
                    <SelectContent container={container}>
                        <SelectGroup>
                            {_items.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )
        default:
            return <Input type="text" {...commonProps} />
    }
}
