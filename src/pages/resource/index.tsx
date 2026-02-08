import { useState, useMemo, useCallback, useEffect } from "react"
import { useParams, useLoaderData, type LoaderFunctionArgs, redirect } from "react-router-dom"
import { resourceService } from "@/services/resource"
import type { ResourceItem, FieldData, Card as CardType } from "@/types"
import { WidgetRenderer } from "@/components/widget-renderer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BadgeField } from "@/components/fields/BadgeField"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { UniversalResourceForm } from "@/components/forms/UniversalResourceForm"
import { ResourceDetail } from "@/components/resource-detail"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { useAppStore, useAuthStore } from "@/stores"
import { IndexView, type IndexViewColumn } from "@/components/views/IndexView"
import { Skeleton } from "@/components/ui/skeleton"
import { LensSelector } from "@/components/LensSelector"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { parseResourceParams, type ResourceParams } from "@/lib/resource-params"
import { useResourceParams } from "@/hooks/useResourceParams"
import { ActionButton, ActionModal } from "@/components/actions"
import { useActionStore } from "@/stores/action-store"

interface LoaderData {
    data: any
    params: ResourceParams
}

export const loader = async ({ params, request }: LoaderFunctionArgs): Promise<LoaderData | Response> => {
    const resource = params.resource
    if (!resource) throw new Error("Resource not found")

    try {
        await useAppStore.getState().init()
    } catch{}

    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login')
    }

    // Parse URL query params
    const url = new URL(request.url)
    const resourceParams = parseResourceParams(url.search, resource)

    // Fetch data with parsed params
    const data = await resourceService.fetchResource(resource, resourceParams)

    return { data, params: resourceParams }
}

export default function ResourceIndexPage() {
    const { resource } = useParams<{ resource: string }>()
    const loaderData = useLoaderData() as LoaderData
    const queryClient = useQueryClient()
    const [createContainer, setCreateContainer] = useState<HTMLDivElement | null>(null)
    const [editContainer, setEditContainer] = useState<HTMLDivElement | null>(null)

    // Use the custom hook for URL params management
    const {
        params,
        localSearch,
        setLocalSearch,
        updateSort,
        isSearchPending,
    } = useResourceParams({
        resource: resource || '',
        debounceMs: 300,
        initialParams: loaderData.params,
    })
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    
    // Data states
    const [editingItem, setEditingItem] = useState<ResourceItem | null>(null)
    const [viewingItem, setViewingItem] = useState<ResourceItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<ResourceItem | null>(null)

    // Resource Data Query - Only refetch when params actually change from initial
    const { data: resourceData, isLoading, isError } = useQuery({
        queryKey: ["resource", resource, params.search, params.sort?.column, params.sort?.direction, params.page, params.per_page],
        queryFn: async () => {
            if (!resource) return null
            return resourceService.fetchResource(resource, params)
        },
        initialData: loaderData.data,
        enabled: !!resource,
        staleTime: 30000, // 30 seconds - prevent immediate refetch
        refetchOnMount: false, // Don't refetch on mount since loader already fetched
        refetchOnWindowFocus: false, // Don't refetch on window focus
    })

    // Handle search change - this updates local state immediately
    // The debounce happens in useResourceParams which then updates URL
    const handleSearchChange = useCallback((query: string) => {
        setLocalSearch(query)
    }, [setLocalSearch])

    // Handle sort change
    const handleSort = useCallback((key: string) => {
        updateSort(key)
    }, [updateSort])

    // Create Fields Query
    const { data: createFields = [] } = useQuery({
        queryKey: ["resource", resource, "create-fields"],
        queryFn: async () => {
            if (!resource) return []
            return resourceService.getCreateFields(resource)
        },
        enabled: !!resource && isCreateOpen,
        staleTime: 1000 * 60 * 5,
    })

    // Edit Fields Query
    const { data: editFields = [] } = useQuery({
        queryKey: ["resource", resource, "edit-fields", (editingItem?.id as FieldData)?.data],
        queryFn: async () => {
            if (!resource || !editingItem) return []
            const idField = editingItem['id'] as FieldData
            const id = idField ? idField.data : null
            if (!id) return []
            return resourceService.getEditFields(resource, id)
        },
        enabled: !!resource && isEditOpen && !!editingItem,
    })

    // Detail Fields Query
    const { data: detailFields = [] } = useQuery({
        queryKey: ["resource", resource, "detail-fields", (viewingItem?.id as FieldData)?.data],
        queryFn: async () => {
            if (!resource || !viewingItem) return []
            const idField = viewingItem['id'] as FieldData
            const id = idField ? idField.data : null
            if (!id) return []
            return resourceService.getDetailFields(resource, id)
        },
        enabled: !!resource && isDetailOpen && !!viewingItem,
    })

    // Prepare initial data for edit form
    const editInitialData = useMemo(() => {
        if (!editFields || editFields.length === 0) return {}
        const initial: Record<string, any> = {}
        editFields.forEach(field => {
            initial[field.key] = field.data
        })
        return initial
    }, [editFields])

    // Handlers
    const handleCreateSubmit = async (formData: any) => {
        if (!resource) return

        try {
            await resourceService.createResource(resource, formData)
            toast.success("Kayit olusturuldu")
            setIsCreateOpen(false)
            // Manual invalidation to ensure list refresh
            await queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        } catch (error) {
            console.error(error)
            toast.error("Olusturulurken hata olustu")
            throw error // Propagate to form for loading state
        }
    }

    const handleUpdateSubmit = async (formData: any) => {
        if (!editingItem || !resource) return
        
        const idField = editingItem['id'] as FieldData
        const id = idField ? idField.data : null
        
        if (!id) {
            toast.error("ID bulunamadi")
            return
        }

        try {
            await resourceService.updateResource(resource, id, formData)
            toast.success("Kayit guncellendi")
            setIsEditOpen(false)
            setEditingItem(null)
            // Manual invalidation to ensure list refresh
            await queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        } catch (error) {
            console.error(error)
            toast.error("Guncellenirken hata olustu")
            throw error // Propagate to form for loading state
        }
    }

    const deleteMutation = useMutation({
        mutationFn: async (id: string | number) => {
            if (!resource) throw new Error("No resource")
            return resourceService.deleteResource(resource, id)
        },
        onSuccess: () => {
            toast.success("Kayit silindi")
            setIsDeleteOpen(false)
            setDeletingItem(null)
            queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Silinirken hata olustu")
        }
    })



    const handleDeleteConfirm = async () => {
        if (!deletingItem) return
        const idField = deletingItem['id'] as FieldData
        const id = idField ? idField.data : null
        if (!id) {
            toast.error("ID bulunamadi")
            return
        }
        await deleteMutation.mutateAsync(id)
    }

    const openEditModal = (item: ResourceItem) => {
        setEditingItem(item)
        setIsEditOpen(true)
    }

    const openDetailModal = (item: ResourceItem) => {
        setViewingItem(item)
        setIsDetailOpen(true)
    }

    const openDeleteDialog = (item: ResourceItem) => {
        setDeletingItem(item)
        setIsDeleteOpen(true)
    }

    // Build columns for IndexView
    const columns: IndexViewColumn<ResourceItem>[] = useMemo(() => {
        if (!resourceData || !resourceData.meta.headers) return []

        return resourceData.meta.headers.map((header: FieldData) => {
            const key = header.key
            return {
                key,
                label: header.name || header.label || key,
                sortable: header.sortable,
                render: (_: any, resource: ResourceItem) => {
                    const field: FieldData = resource[key] as FieldData
                    if (!field) return null

                    if (header.key === "image" || header.view === "image-field") {
                        return (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={field.data} alt={field.name} />
                                <AvatarFallback>{field.name ? field.name.substring(0, 2).toUpperCase() : "IMG"}</AvatarFallback>
                            </Avatar>
                        )
                    }

                    if (header.view === "badge-field") {
                        return (
                            <BadgeField
                                value={field.data}
                                variant={field.props?.variant || 'default'}
                            />
                        )
                    }

                    // Handle objects (like relations) to prevent React Error #31
                    if (typeof field.data === 'object' && field.data !== null) {
                        const data = field.data as any
                        
                        // Handle Arrays (BelongsToMany, HasMany)
                        if (Array.isArray(data)) {
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {data.map((item: any, i: number) => {
                                        const label = typeof item === 'object' 
                                            ? (item.name || item.title || item.label || item.username || item.email || item.id)
                                            : item
                                        
                                        return (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                {String(label)}
                                            </span>
                                        )
                                    })}
                                </div>
                            )
                        }

                        // Try to find a displayable string
                        return data.name || data.email || data.title || data.username || data.id || JSON.stringify(data)
                    }

                    // Handle options (BelongsTo/HasOne with primitive value ID)
                    if (field.props?.options) {
                        const options = field.props.options as Record<string, string>
                        const valStr = String(field.data)
                        if (options[valStr]) {
                            return options[valStr]
                        }
                    }

                    return field.data
                },
            }
        })
    }, [resourceData])

    // Cards Query
    const { data: cards = [], isLoading: isCardsLoading, error: cardsError } = useQuery({
        queryKey: ["resource", resource, "cards"],
        queryFn: async () => {
            if (!resource) return []
            return resourceService.getCards(resource)
        },
        enabled: !!resource,
    })

    // Lenses Query
    const { data: lenses = [] } = useQuery({
        queryKey: ["resource", resource, "lenses"],
        queryFn: async () => {
            if (!resource) return []
            return resourceService.getLenses(resource)
        },
        enabled: !!resource,
        staleTime: 60000, // 1 dakika
    })

    // Actions Query
    const { data: actions = [] } = useQuery({
        queryKey: ["resource", resource, "actions"],
        queryFn: async () => {
            if (!resource) return []
            return resourceService.getActions(resource)
        },
        enabled: !!resource,
    })

    // Action store
    const { setActions, selectedIds, setSelectedIds, clearSelectedIds } = useActionStore()

    // Update actions in store when fetched
    useEffect(() => {
        if (actions.length > 0) {
            setActions(actions)
        }
    }, [actions, setActions])

    // Clear selected IDs when resource changes
    useEffect(() => {
        clearSelectedIds()
    }, [resource, clearSelectedIds])

    // Render loading skeleton
    if (isLoading && !resourceData) {
        return (
            <div className="flex flex-col gap-4">
                <div className="px-4 md:px-8 pt-4">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="flex flex-col gap-4 p-4 md:p-8 pt-0">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (isError || !resourceData) {
        return <div className="p-8 text-center text-destructive">Bir hata olustu veya veri bulunamadi.</div>
    }

    return (
            <div className="flex flex-col gap-4 p-4 md:p-8 pt-0">
                {/* Cards */}
                {isCardsLoading ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                ) : cardsError ? (
                    <div className="p-4 border rounded bg-red-50 text-red-500">
                        Failed to load cards: {cardsError.message}
                    </div>
                ) : cards?.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {cards.map((card: CardType, index: number) => (
                            <div key={index} className="col-span-1">
                                <WidgetRenderer card={card} />
                            </div>
                        ))}
                    </div>
                ) : null}

                {/* Header with title and action buttons */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">{resourceData.meta.title}</h1>
                    <div className="flex items-center gap-2">
                        {lenses.length > 0 && (
                            <LensSelector
                                resourceName={resource || ''}
                                lenses={lenses}
                            />
                        )}
                        {actions.length > 0 && (
                            <ActionButton actions={actions} selectedIds={selectedIds} />
                        )}
                        {resourceData.meta.policy.create && (
                            <ResponsiveModal
                                title={`Yeni ${resourceData.meta.title}`}
                                description="Asagidaki bilgileri doldurunuz."
                                open={isCreateOpen}
                                variant={resourceData.meta.dialog_type}
                                onOpenChange={setIsCreateOpen}
                                ref={setCreateContainer}
                                trigger={
                                    <Button onClick={() => setIsCreateOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Yeni Ekle
                                    </Button>
                                }
                            >
                                <UniversalResourceForm
                                    resourceType={resource || ''}
                                    mode="create"
                                    fields={createFields as any}
                                    onSubmit={handleCreateSubmit}
                                    onCancel={() => setIsCreateOpen(false)}
                                    container={createContainer}
                                />
                            </ResponsiveModal>
                        )}
                    </div>
                </div>

                {/* IndexView with dropdown actions */}
                <IndexView
                    resources={resourceData.data as any}
                    columns={columns as any}
                    isLoading={isLoading || isSearchPending}
                    isEmpty={resourceData.data.length === 0}
                    searchQuery={localSearch}
                    onSearchChange={handleSearchChange}
                    sortBy={params.sort?.column}
                    sortOrder={params.sort?.direction || 'asc'}
                    onSort={handleSort}
                    onView={(item: any) => {
                        if (item.policy?.view) openDetailModal(item)
                    }}
                    onEdit={(item: any) => {
                        if (item.policy?.update) openEditModal(item)
                    }}
                    onDelete={(item: any) => {
                        if (item.policy?.delete) openDeleteDialog(item)
                    }}
                    enableSelection={actions.length > 0}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                />

                {/* Action Modal */}
                {resource && <ActionModal resource={resource} />}

                {/* Edit Modal */}
                <ResponsiveModal
                    title={`${resourceData.meta.title} Duzenle`}
                    description="Asagidaki bilgileri guncelleyiniz."
                    open={isEditOpen}
                    variant={resourceData.meta.dialog_type}
                    onOpenChange={(open) => {
                        setIsEditOpen(open)
                        if (!open) setEditingItem(null)
                    }}
                    ref={setEditContainer}
                >
                    <UniversalResourceForm
                        key={(editingItem?.id as FieldData)?.data || 'edit-form'}
                        resourceType={resource || ''}
                        mode="edit"
                        resourceId={(editingItem?.id as FieldData)?.data}
                        fields={editFields as any}
                        initialData={editInitialData}
                        onSubmit={handleUpdateSubmit}
                        onCancel={() => {
                            setIsEditOpen(false)
                            setEditingItem(null)
                        }}
                        container={editContainer}
                    />
                </ResponsiveModal>

                {/* Detail Modal */}
                <ResponsiveModal
                    title={`${resourceData.meta.title} Detayi`}
                    description="Kayit detaylari asagidadir."
                    open={isDetailOpen}
                    variant={resourceData.meta.dialog_type}
                    onOpenChange={(open) => {
                        setIsDetailOpen(open)
                        if (!open) setViewingItem(null)
                    }}
                >
                    <ResourceDetail
                        fields={detailFields}
                        onClose={() => setIsDetailOpen(false)}
                    />
                </ResponsiveModal>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Silmek istediginizden emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bu islem geri alinamaz. Kayit kalici olarak silinecektir.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3 justify-end">
                            <AlertDialogCancel>Iptal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteConfirm}
                                disabled={deleteMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>

                <DeleteConfirmDialog />
            </div>
    )
}
