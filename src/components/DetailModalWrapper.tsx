// Helper component to manage individual detail modal state and data fetching
import { useQuery } from "@tanstack/react-query"
import { resourceService } from "@/services/resource"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import type { ResponsiveModalSize } from "@/components/ui/responsive-modal"
import { ResourceDetail } from "@/components/resource-detail"
import { Button } from "@/components/ui/button"
import type { ResourceItem, FieldData } from "@/types"
import { useMemo } from "react"
import { Pencil } from "lucide-react"
import { extractRecordTitleFromFields, extractRecordTitleFromItem, extractRecordTitleFromMeta, formatRecordReference } from "@/lib/record-reference"
import type { ResourceFieldResponse } from "@/services/resource"

interface DetailModalWrapperProps {
    stackItem: {
        id: string
        resource: string
        item: ResourceItem
    }
    index: number
    isOpen: boolean
    onClose: () => void
    onResourceClick: (resource: string, id: string | number) => void
    onEdit?: (item: ResourceItem) => void
    isTopMost: boolean
}

const RESPONSIVE_MODAL_SIZES: ReadonlySet<ResponsiveModalSize> = new Set([
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
    "3xl",
    "4xl",
    "5xl",
    "full",
])

function parseResponsiveModalSize(
    value: unknown,
    fallback: ResponsiveModalSize = "md"
): ResponsiveModalSize {
    if (typeof value !== "string") return fallback
    return RESPONSIVE_MODAL_SIZES.has(value as ResponsiveModalSize)
        ? (value as ResponsiveModalSize)
        : fallback
}

export function DetailModalWrapper({ stackItem, isOpen, onClose, onResourceClick, onEdit }: Omit<DetailModalWrapperProps, 'index' | 'isTopMost'>) {
    const { resource, item } = stackItem
    const idField = item['id'] as FieldData
    const id = idField ? idField.data : null

    // Each modal needs its own query for fields
    const { data: detailResponse, isLoading } = useQuery<ResourceFieldResponse>({
        queryKey: ["resource", resource, "detail-fields", id],
        queryFn: async () => {
            if (!resource || !id) return { fields: [] }
            return resourceService.getDetailFields(resource, id)
        },
        enabled: !!resource && !!id,
    })

    const detailFields = useMemo(() => {
        if (!detailResponse) {
            return []
        }
        return detailResponse.fields || []
    }, [detailResponse])

    const detailMeta = useMemo(() => {
        if (!detailResponse) {
            return undefined
        }
        return detailResponse.meta
    }, [detailResponse])

    const detailModalVariant = useMemo<"dialog" | "modal" | "sheet" | "drawer">(() => {
        const variant = detailMeta?.dialog_type
        if (variant === "dialog" || variant === "modal" || variant === "sheet" || variant === "drawer") {
            return variant
        }
        return "dialog"
    }, [detailMeta])

    // Check if detail fields have relationships for modal width
    const hasDetailRelationships = useMemo(() => {
        return detailFields.some(field =>
            field.view === 'has-many-field' ||
            field.view === 'belongs-to-many-field' ||
            field.view === 'morph-to-many-field'
        )
    }, [detailFields])

    const detailModalSize = useMemo<ResponsiveModalSize>(() => {
        const fallback = hasDetailRelationships ? "4xl" : "md"
        return parseResponsiveModalSize(detailMeta?.dialog_size, fallback)
    }, [detailMeta, hasDetailRelationships])

    const detailModalTitle = useMemo(() => {
        const recordTitle =
            extractRecordTitleFromItem(item as unknown as Record<string, unknown>) ||
            extractRecordTitleFromFields(detailFields) ||
            extractRecordTitleFromMeta(detailMeta as Record<string, unknown> | undefined)

        const formatted = formatRecordReference(id ?? undefined, recordTitle)
        return formatted || `${resource} Detayı`
    }, [detailFields, detailMeta, id, item, resource])

    const modalTitle = (
        <div className="flex items-center gap-3 pr-12">
            <span>{detailModalTitle}</span>
            {onEdit && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Duzenle
                </Button>
            )}
        </div>
    )

    // If it's not the top-most modal, we might want to hide it or keep it in background
    // Radix UI handles stacking automatically.

    return (
        <ResponsiveModal
            title={modalTitle}
            description="Kayit detaylari asagidadir."
            open={isOpen}
            variant={detailModalVariant}
            size={detailModalSize}
            sheetSize={detailModalSize}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            {isLoading ? (
                <div className="p-4 text-center">Yükleniyor...</div>
            ) : (
                <ResourceDetail
                    resourceName={resource}
                    resourceId={id}
                    fields={detailFields}
                    onClose={onClose}
                    onResourceClick={onResourceClick}
                />
            )}
        </ResponsiveModal>
    )
}
