import type { FieldData } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getFieldSpan, getFieldSpanClass } from "@/lib/field-span"
import { resolveWithProps } from "@/lib/with-props"

// Detail Field Components
import { TextDetailField } from "@/components/fields/detail/TextInput"
import { SelectDetailField } from "@/components/fields/detail/SelectField"
import { TextareaDetailField } from "@/components/fields/detail/TextareaField"
import { DateDetailField } from "@/components/fields/detail/DateField"
import { DateTimeDetailField } from "@/components/fields/detail/DateTimeField"
import { BooleanGroupDetailField } from "@/components/fields/detail/BooleanGroupField"
import { EmailDetailField } from "@/components/fields/detail/EmailInput"
import { NumberDetailField } from "@/components/fields/detail/NumberInput"
import { PasswordDetailField } from "@/components/fields/detail/PasswordInput"
import { TelDetailField } from "@/components/fields/detail/TelInput"
import { URLDetailField } from "@/components/fields/detail/URLInput"
import { BadgeDetailField } from "@/components/fields/detail/BadgeField"
import { ColorDetailField } from "@/components/fields/detail/ColorField"
import { CodeDetailField } from "@/components/fields/detail/CodeField"
import { RichTextDetailField } from "@/components/fields/detail/RichTextField"
import { SwitchDetailField } from "@/components/fields/detail/SwitchField"
import { CheckboxDetailField } from "@/components/fields/detail/CheckboxField"
import { ImageDetailField } from "@/components/fields/detail/ImageField"
import { RadioGroupDetailField } from "@/components/fields/detail/RadioGroupField"
import { ComboboxDetailField } from "@/components/fields/detail/ComboboxField"
import { AsyncComboboxDetailField } from "@/components/fields/detail/AsyncComboboxField"
import { TimeDetailField } from "@/components/fields/detail/TimeField"

// Relationship Detail Fields
import { BelongsToDetailField } from "@/components/fields/detail/BelongsToField"
import { HasManyDetailField } from "@/components/fields/detail/HasManyField"
import { BelongsToManyDetailField } from "@/components/fields/detail/BelongsToManyField"
import { MorphToManyDetailField } from "@/components/fields/detail/MorphToManyField"
import { HasOneDetailField } from "@/components/fields/detail/HasOneField"
import { MorphToDetailField } from "@/components/fields/detail/MorphToField"

interface ResourceDetailProps {
    resourceName: string
    resourceId: string | number
    fields: FieldData[]
    onClose: () => void
    onResourceClick?: (resource: string, id: string | number) => void
}

export function ResourceDetail({ resourceName, resourceId, fields, onClose, onResourceClick }: ResourceDetailProps) {
    const normalizeFieldView = (view: string | undefined) =>
        (view || "").replace(/-(form|index|detail)$/i, "")

    const isRelationshipTableField = (field: FieldData) => {
        const normalizedView = normalizeFieldView(field.view)
        return (
            normalizedView === "has-many-field" ||
            normalizedView === "belongs-to-many-field" ||
            normalizedView === "morph-to-many-field"
        )
    }

    // Check if there are any relationship table fields
    const hasRelationshipTables = fields.some(isRelationshipTableField)

    const toStackChildField = (child: unknown, index: number): FieldData | null => {
        if (!child || typeof child !== "object" || Array.isArray(child)) {
            return null
        }

        const raw = child as Partial<FieldData>
        const key = typeof raw.key === "string" && raw.key.trim() !== "" ? raw.key : `stack_child_${index}`

        return {
            data: raw.data ?? null,
            disabled: typeof raw.disabled === "boolean" ? raw.disabled : false,
            filterable: typeof raw.filterable === "boolean" ? raw.filterable : false,
            help_text: typeof raw.help_text === "string" ? raw.help_text : "",
            key,
            label: typeof raw.label === "string" ? raw.label : (typeof raw.name === "string" ? raw.name : key),
            name: typeof raw.name === "string" ? raw.name : key,
            nullable: typeof raw.nullable === "boolean" ? raw.nullable : true,
            placeholder: typeof raw.placeholder === "string" ? raw.placeholder : "",
            props: raw.props && typeof raw.props === "object" && !Array.isArray(raw.props) ? raw.props : {},
            read_only: typeof raw.read_only === "boolean" ? raw.read_only : false,
            required: typeof raw.required === "boolean" ? raw.required : false,
            sortable: typeof raw.sortable === "boolean" ? raw.sortable : false,
            stacked: typeof raw.stacked === "boolean" ? raw.stacked : false,
            text_align: raw.text_align === "center" || raw.text_align === "right" ? raw.text_align : "left",
            type: typeof raw.type === "string" ? raw.type : "text",
            view: typeof raw.view === "string" ? raw.view : "text-field",
        }
    }

    const getStackChildren = (field: FieldData): FieldData[] => {
        const dataPayload =
            field.data && typeof field.data === "object" && !Array.isArray(field.data)
                ? (field.data as Record<string, unknown>)
                : null

        const dataProps =
            dataPayload?.props && typeof dataPayload.props === "object" && !Array.isArray(dataPayload.props)
                ? (dataPayload.props as Record<string, unknown>)
                : null

        const dataChildren = Array.isArray(dataProps?.fields) ? dataProps.fields : []
        const propChildren = Array.isArray(field.props?.fields) ? field.props.fields : []
        const rawChildren = dataChildren.length > 0 ? dataChildren : propChildren

        return rawChildren
            .map((child, index) => toStackChildField(child, index))
            .filter((child): child is FieldData => child !== null)
    }

    const renderStackField = (field: FieldData) => {
        const stackChildren = getStackChildren(field)

        if (stackChildren.length === 0) {
            return (
                <TextDetailField
                    field={field}
                    record={{ [field.key]: field.data, id: resourceId }}
                    resourceName={resourceName}
                    onResourceClick={onResourceClick}
                />
            )
        }

        return (
            <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                    {field.label || field.name}
                </p>

                <div className="grid grid-cols-12 gap-3">
                    {stackChildren.map((childField, index) => {
                        const span = getFieldSpan(childField)
                        return (
                            <div
                                key={`${field.key}-${childField.key}-${index}`}
                                className="min-w-0"
                                style={{ gridColumn: `span ${span} / span ${span}` }}
                            >
                                {renderDetailField(childField)}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const wrapDetailFieldWithProps = (field: FieldData, content: React.ReactNode) => {
        const resolved = resolveWithProps(field.props as Record<string, unknown> | undefined)
        const hasDecorators =
            !!resolved.className ||
            !!resolved.style ||
            (resolved.attributes && Object.keys(resolved.attributes).length > 0)

        if (!hasDecorators) {
            return content
        }

        return (
            <div
                className={resolved.className}
                style={resolved.style}
                {...resolved.attributes}
            >
                {content}
            </div>
        )
    }

    const renderDetailField = (field: FieldData) => {
        const normalizedView = normalizeFieldView(field.view)

        // Common props for all detail fields
        const props = {
            field,
            record: { [field.key]: field.data, id: resourceId }, 
            resourceName,
            onResourceClick
        }

        let content: React.ReactNode

        // Field view mapping
        switch (normalizedView) {
            case 'text-field':
            case 'id-field':
                content = <TextDetailField {...props} />
                break
            case 'textarea-field':
                content = <TextareaDetailField {...props} />
                break
            case 'email-field':
                content = <EmailDetailField {...props} />
                break
            case 'select-field':
                content = <SelectDetailField {...props} />
                break
            case 'date-field':
                content = <DateDetailField {...props} />
                break
            case 'datetime-field':
                content = <DateTimeDetailField {...props} />
                break
            case 'boolean-field':
            case 'boolean':
            case 'switch-field':
            case 'switch':
                // Boolean field için Switch veya Checkbox kullanılabilir
                content = <SwitchDetailField {...props} />
                break
            case 'boolean-group-field':
                content = <BooleanGroupDetailField {...props} />
                break
            case 'number-field':
            case 'money-field':
                content = <NumberDetailField {...props} />
                break
            case 'password-field':
                content = <PasswordDetailField {...props} />
                break
            case 'tel-field':
                content = <TelDetailField {...props} />
                break
            case 'url-field':
                content = <URLDetailField {...props} />
                break
            case 'badge-field':
                content = <BadgeDetailField {...props} />
                break
            case 'color-field':
                content = <ColorDetailField {...props} />
                break
            case 'code-field':
                content = <CodeDetailField {...props} />
                break
            case 'rich-text-field':
            case 'markdown-field':
            case 'trix-field':
                content = <RichTextDetailField {...props} />
                break
            case 'image-field':
                content = <ImageDetailField {...props} />
                break
            case 'checkbox-field':
                content = <CheckboxDetailField {...props} />
                break
            case 'radio-group-field':
                content = <RadioGroupDetailField {...props} />
                break
            case 'combobox-field':
                content = <ComboboxDetailField {...props} />
                break
            case 'async-combobox-field':
                content = <AsyncComboboxDetailField {...props} />
                break
            case 'time-field':
                content = <TimeDetailField {...props} />
                break
            case 'stack-field':
                content = renderStackField(field)
                break
            
            // Relationships
            case 'belongs-to-field':
                content = <BelongsToDetailField {...props} />
                break
            case 'has-one-field':
                content = <HasOneDetailField {...props} />
                break
            case 'morph-to-field':
                content = <MorphToDetailField {...props} />
                break
            
            // Relationship Tables (Managed separately below, but handled here just in case)
            case 'has-many-field':
                content = <HasManyDetailField {...props} />
                break
            case 'belongs-to-many-field':
                content = <BelongsToManyDetailField {...props} />
                break
            case 'morph-to-many-field':
                content = <MorphToManyDetailField {...props} />
                break
            case 'relationship':
                // Generic relationship type fallback
                if (field.props?.related_resource) {
                    // Try to guess the type or use a default
                    content = <BelongsToDetailField {...props} />
                    break
                }
                content = <TextDetailField {...props} />
                break
                
            default:
                // Fallback to text field for unknown types
                content = <TextDetailField {...props} />
                break
        }

        return wrapDetailFieldWithProps(field, content)
    }

    return (
        <div className={cn("space-y-4 pt-4", hasRelationshipTables && "max-w-full")}>
            {/* Önce normal field'ları render et */}
            <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-12">
                {fields
                    .filter(field => {
                        if (field.type === "hidden") return false;
                        // Relationship field'ları filtrele (bunlar aşağıda geniş render edilecek)
                        return !isRelationshipTableField(field);
                    })
                    .map((field) => (
                        <div key={field.key} className={cn("col-span-1", getFieldSpanClass(field))}>
                            {/* Detail component'leri zaten label render ediyor */}
                            {renderDetailField(field)}
                        </div>
                    ))}
            </div>

            {/* Sonra relationship field'ları render et - tam genişlik */}
            <div className="w-full space-y-6 pt-4 border-t">
                {fields
                    .filter(field => {
                        if (field.type === "hidden") return false;
                        // Sadece relationship field'ları
                        return isRelationshipTableField(field);
                    })
                    .map((field) => (
                        <div key={field.key} className="w-full">
                            {renderDetailField(field)}
                        </div>
                    ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={onClose} className="w-full md:w-auto">
                    Kapat
                </Button>
            </div>
        </div>
    )
}
