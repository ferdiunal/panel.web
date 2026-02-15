import type { FieldData } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    // Check if there are any relationship table fields
    const hasRelationshipTables = fields.some(field =>
        (field.view === "has-many-field" ||
         field.view === "belongs-to-many-field" ||
         field.view === "morph-to-many-field")
    )

    const renderDetailField = (field: FieldData) => {
        // Common props for all detail fields
        const props = {
            field,
            record: { [field.key]: field.data, id: resourceId }, 
            resourceName,
            onResourceClick
        }

        // Field view mapping
        switch (field.view) {
            case 'text-field':
            case 'id-field':
            case 'id-field-index':
                return <TextDetailField {...props} />
            case 'textarea-field':
                return <TextareaDetailField {...props} />
            case 'email-field':
                return <EmailDetailField {...props} />
            case 'select-field':
                return <SelectDetailField {...props} />
            case 'date-field':
            case 'date-field-detail':
            case 'date-field-index':
                return <DateDetailField {...props} />
            case 'datetime-field':
            case 'datetime-field-detail':
            case 'datetime-field-index':
                return <DateTimeDetailField {...props} />
            case 'boolean-field':
                // Boolean field için Switch veya Checkbox kullanılabilir
                return <SwitchDetailField {...props} />
            case 'boolean-group-field':
                return <BooleanGroupDetailField {...props} />
            case 'number-field':
                return <NumberDetailField {...props} />
            case 'password-field':
                return <PasswordDetailField {...props} />
            case 'tel-field':
                return <TelDetailField {...props} />
            case 'url-field':
                return <URLDetailField {...props} />
            case 'badge-field':
                return <BadgeDetailField {...props} />
            case 'color-field':
                return <ColorDetailField {...props} />
            case 'code-field':
                return <CodeDetailField {...props} />
            case 'rich-text-field':
            case 'markdown-field':
            case 'trix-field':
                return <RichTextDetailField {...props} />
            case 'checkbox-field':
                return <CheckboxDetailField {...props} />
            case 'radio-group-field':
                return <RadioGroupDetailField {...props} />
            case 'combobox-field':
                return <ComboboxDetailField {...props} />
            case 'async-combobox-field':
                return <AsyncComboboxDetailField {...props} />
            case 'time-field':
                return <TimeDetailField {...props} />
            
            // Relationships
            case 'belongs-to-field':
                return <BelongsToDetailField {...props} />
            case 'has-one-field':
                return <HasOneDetailField {...props} />
            case 'morph-to-field':
                return <MorphToDetailField {...props} />
            
            // Relationship Tables (Managed separately below, but handled here just in case)
            case 'has-many-field':
                return <HasManyDetailField {...props} />
            case 'belongs-to-many-field':
                return <BelongsToManyDetailField {...props} />
            case 'morph-to-many-field':
                return <MorphToManyDetailField {...props} />
            case 'relationship':
                // Generic relationship type fallback
                if (field.props?.related_resource) {
                    // Try to guess the type or use a default
                    return <BelongsToDetailField {...props} />
                }
                return <TextDetailField {...props} />
                
            default:
                // Fallback to text field for unknown types
                return <TextDetailField {...props} />
        }
    }

    return (
        <div className={cn("space-y-4 pt-4", hasRelationshipTables && "max-w-full")}>
            {/* Önce normal field'ları render et - max-w-sm ile sınırla */}
            <div className="max-w-sm space-y-4">
                {fields
                    .filter(field => {
                        if (field.type === "hidden") return false;
                        // Relationship field'ları filtrele (bunlar aşağıda geniş render edilecek)
                        const isRelationshipTable =
                            (field.view === "has-many-field" ||
                             field.view === "belongs-to-many-field" ||
                             field.view === "morph-to-many-field");
                        return !isRelationshipTable;
                    })
                    .map((field) => (
                        <div key={field.key} className="">
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
                        const isRelationshipTable =
                            (field.view === "has-many-field" ||
                             field.view === "belongs-to-many-field" ||
                             field.view === "morph-to-many-field");
                        return isRelationshipTable;
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
