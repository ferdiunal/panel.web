import type { FieldData } from "@/types"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { IndexView, type IndexViewColumn } from "@/components/views/IndexView"

interface ResourceDetailProps {
    fields: FieldData[]
    onClose: () => void
}

export function ResourceDetail({ fields, onClose }: ResourceDetailProps) {
    const navigate = useNavigate()

    // Check if there are any relationship table fields
    const hasRelationshipTables = fields.some(field =>
        (field.view === "has-many-field" ||
         field.view === "belongs-to-many-field" ||
         field.view === "morph-to-many-field") &&
        Array.isArray(field.data) &&
        field.data.length > 0
    )

    const renderValue = (field: FieldData) => {
        if (!field.data && field.data !== 0) {
            return <span className="text-muted-foreground italic">-</span>
        }

        // Handle relationship tables (HasMany, BelongsToMany, MorphToMany)
        if ((field.view === "has-many-field" ||
             field.view === "belongs-to-many-field" ||
             field.view === "morph-to-many-field") &&
            Array.isArray(field.data) &&
            field.data.length > 0) {

            const relatedResource = field.props?.related_resource as string
            const data = field.data as any[]

            // Get all unique keys from the data
            const allKeys = new Set<string>()
            data.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(key => {
                        // Skip internal keys
                        if (!key.startsWith('_') && key !== 'pivot') {
                            allKeys.add(key)
                        }
                    })
                }
            })

            const keys = Array.from(allKeys)

            // Create columns for IndexView
            const columns: IndexViewColumn[] = keys.map(key => ({
                key,
                label: key.replace(/_/g, ' '),
                sortable: false,
                render: (value: any) => formatCellValue(value)
            }))

            // Handle view action
            const handleView = relatedResource ? (resource: any) => {
                const itemId = resource.id || resource.ID
                if (itemId) {
                    navigate(`/resource/${relatedResource}?id=${itemId}`)
                }
            } : undefined

            return (
                <IndexView
                    resources={data}
                    columns={columns}
                    onView={handleView}
                    className="border-0"
                />
            )
        }

        // Handle objects (like relations)
        if (typeof field.data === 'object' && field.data !== null) {
            const data = field.data as any

            // Handle Arrays (for non-relationship fields)
            if (Array.isArray(data)) {
                if (data.length === 0) return <span className="text-muted-foreground italic">-</span>

                return (
                    <div className="flex flex-wrap gap-1">
                        {data.map((item: any, i: number) => {
                            const label = typeof item === 'object'
                                ? (item.name || item.title || item.label || item.username || item.email || item.id)
                                : item

                            return (
                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                    {String(label)}
                                </span>
                            )
                        })}
                    </div>
                )
            }

            // Check for empty/zero object (id 0)
            if (data.id === 0 || data.ID === 0) {
                return <span className="text-muted-foreground italic">-</span>
            }

            // Try to find a displayable string
            const display = data.name || data.email || data.title || data.username || data.id || JSON.stringify(data)
            return <span className="break-all">{display}</span>
        }

        // Handle options (BelongsTo/HasOne with primitive value ID)
        if (field.props?.options) {
            const options = field.props.options as Record<string, string>
            const valStr = String(field.data)
            if (options[valStr]) {
                return <span className="break-all">{options[valStr]}</span>
            }
        }

        if (field.view === "image-field") {
            return (
                <div className="flex items-center gap-2 mx-auto">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={field.data} alt={field.name} />
                        <AvatarFallback>IMG</AvatarFallback>
                    </Avatar>
                </div>
            )
        }

        if (field.type === "boolean" || field.view === "boolean-field") {
            return field.data ? "Evet" : "Hayır"
        }

        if (field.view === "file-field") {
            return (
                <a href={field.data} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {String(field.data)}
                </a>
            )
        }

        // Default text
        return <span className="break-all">{String(field.data)}</span>
    }

    return (
        <div className={cn("space-y-4 pt-4", hasRelationshipTables && "max-w-full")}>
            {fields.map((field) => {
                if (field.type === "hidden") return null

                // Check if this is a relationship table field
                const isRelationshipTable =
                    (field.view === "has-many-field" ||
                     field.view === "belongs-to-many-field" ||
                     field.view === "morph-to-many-field") &&
                    Array.isArray(field.data) &&
                    field.data.length > 0

                return (
                    <div key={field.key} className={cn("space-y-1", isRelationshipTable && "col-span-full")}>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                            {field.name || field.label}
                        </Label>
                        <div className={cn(
                            isRelationshipTable ? "" : "rounded-md p-3",
                            field.view === "image-field" ? "flex justify-center" : !isRelationshipTable && "text-sm border shadow-sm bg-background"
                        )}>
                            {renderValue(field)}
                        </div>
                    </div>
                )
            })}

            <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={onClose} className="w-full md:w-auto">
                    Kapat
                </Button>
            </div>
        </div>
    )
}

function formatCellValue(value: any): string {
    if (value === null || value === undefined) {
        return '-'
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
    }

    if (typeof value === 'object') {
        // Handle dates
        if (value instanceof Date) {
            return value.toLocaleDateString()
        }
        // Handle nested objects
        return JSON.stringify(value)
    }

    return String(value)
}
