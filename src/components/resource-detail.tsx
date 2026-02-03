import type { FieldData } from "@/types"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ResourceDetailProps {
    fields: FieldData[]
    onClose: () => void
}

export function ResourceDetail({ fields, onClose }: ResourceDetailProps) {
    return (
        <div className="space-y-4 pt-4">
            {fields.map((field) => {
                if (field.type === "hidden") return null

                return (
                    <div key={field.key} className="space-y-1">
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                            {field.name || field.label}
                        </Label>
                        <div className={cn(
                            "rounded-md p-3",
                            field.view === "image-field" ? "flex justify-center" : "text-sm border shadow-sm bg-background"
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

function renderValue(field: FieldData) {
    if (!field.data && field.data !== 0) {
        return <span className="text-muted-foreground italic">Boş</span>
    }

    if (field.view === "image-field") {
        return (
            <div className="flex items-center gap-2 mx-auto">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={field.data} alt={field.name} />
                    <AvatarFallback>IMG</AvatarFallback>
                </Avatar>
                {/* Optional: Show URL or allow download? */}
            </div>
        )
    }

    if (field.type === "boolean" || field.view === "boolean-field") {
        return field.data ? "Evet" : "Hayır"
    }

    if (field.view === "file-field") {
        // Handle file display (maybe a link?)
        return (
            <a href={field.data} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                {String(field.data)}
            </a>
        )
    }

    // Default text
    return <span className="break-all">{String(field.data)}</span>
}
