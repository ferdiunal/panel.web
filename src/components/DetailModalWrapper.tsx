// Helper component to manage individual detail modal state and data fetching
import { useQuery } from "@tanstack/react-query"
import { resourceService } from "@/services/resource"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { ResourceDetail } from "@/components/resource-detail"
import type { ResourceItem, FieldData } from "@/types"
import { useMemo } from "react"
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
    isTopMost: boolean
}

export function DetailModalWrapper({ stackItem, isOpen, onClose, onResourceClick }: Omit<DetailModalWrapperProps, 'index' | 'isTopMost'>) {
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

    // Check if detail fields have relationships for modal width
    const hasDetailRelationships = useMemo(() => {
        return detailFields.some(field =>
            field.view === 'has-many-field' ||
            field.view === 'belongs-to-many-field' ||
            field.view === 'morph-to-many-field'
        )
    }, [detailFields])

    const detailModalTitle = useMemo(() => {
        const recordTitle =
            extractRecordTitleFromItem(item as unknown as Record<string, unknown>) ||
            extractRecordTitleFromFields(detailFields) ||
            extractRecordTitleFromMeta(detailMeta as Record<string, unknown> | undefined)

        const formatted = formatRecordReference(id ?? undefined, recordTitle)
        return formatted || `${resource} Detayı`
    }, [detailFields, detailMeta, id, item, resource])

    // If it's not the top-most modal, we might want to hide it or keep it in background
    // Radix UI handles stacking automatically.

    return (
        <ResponsiveModal
            title={detailModalTitle}
            description="Kayit detaylari asagidadir."
            open={isOpen}
            variant="sheet" // Default to sheet for details, or get from meta if available
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
            className={hasDetailRelationships ? "data-[side=left]:sm:max-w-4xl data-[side=right]:sm:max-w-4xl w-full" : undefined}
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
