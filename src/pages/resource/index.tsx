import { useState, useMemo } from "react"
import { useParams, useLoaderData, type LoaderFunctionArgs } from "react-router-dom"
import { resourceService } from "@/services/resource"
import type { ResourceItem, FieldData, Card as CardType } from "@/types"
import { WidgetRenderer } from "@/components/widget-renderer"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpDown, MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { type ColumnDef, type PaginationState, type SortingState, type HeaderContext, type CellContext } from "@tanstack/react-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import { ResourceForm } from "@/components/resource-form"
import { ResourceDetail } from "@/components/resource-detail"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteStore } from "@/store/delete-store"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const resource = params.resource
    if (!resource) throw new Error("Resource not found")

    // Fetch initial data (Page 1)
    return await resourceService.fetchResource(resource, 1, 10, undefined, undefined)
}

export default function ResourceIndexPage() {
    const { resource } = useParams<{ resource: string }>()
    const initialData = useLoaderData() as any // Return type of fetchResource
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<ResourceItem | null>(null)
    const [viewingItem, setViewingItem] = useState<ResourceItem | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const { openDelete } = useDeleteStore()

    // Pagination & Sorting State
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [sorting, setSorting] = useState<SortingState>([])

    // Resource Data Query
    const { data: resourceData, isLoading, isError } = useQuery({
        queryKey: ["resource", resource, pagination, sorting],
        queryFn: async () => {
            if (!resource) return null;
            const sortColumn = sorting.length > 0 ? sorting[0].id : undefined
            const sortDirection = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined

            return resourceService.fetchResource(
                resource,
                pagination.pageIndex + 1,
                pagination.pageSize,
                sortColumn,
                sortDirection
            )
        },
        initialData: (pagination.pageIndex === 0 && sorting.length === 0) ? initialData : undefined,
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
        enabled: !!resource,
    })

    // Create Fields Query
    const { data: createFields = [] } = useQuery({
        queryKey: ["resource", resource, "create-fields"],
        queryFn: async () => {
            if (!resource) return []
            return resourceService.getCreateFields(resource)
        },
        enabled: !!resource && isCreateOpen,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    })

    // Edit Fields & Data Query
    const { data: editFields = [] } = useQuery({
        queryKey: ["resource", resource, "edit-fields", (editingItem?.id as FieldData)?.data], // key depends on item ID if we want specific data, but endpoint is per ID
        queryFn: async () => {
            if (!resource || !editingItem) return []
            // We need ID. editingItem has 'id' field?
            // Assuming editingItem has a field 'id'.
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

    // Prepare initial data from fetched editFields
    // The backend Edit endpoint returns fields with 'data' already populated.
    // So we can extract initialData from editFields.
    const editInitialData = useMemo(() => {
        if (!editFields || editFields.length === 0) return {}
        const initial: Record<string, any> = {}
        editFields.forEach(field => {
            initial[field.key] = field.data
        })
        return initial
    }, [editFields])

    const createMutation = useMutation({
        mutationFn: async (formData: any) => {
            if (!resource) throw new Error("No resource")
            return resourceService.createResource(resource, formData)
        },
        onSuccess: () => {
            toast.success("Kayıt oluşturuldu")
            setIsCreateOpen(false)
            queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Oluşturulurken hata oluştu")
        }
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string | number, data: any }) => {
            if (!resource) throw new Error("No resource")
            return resourceService.updateResource(resource, id, data)
        },
        onSuccess: () => {
            toast.success("Kayıt güncellendi")
            setIsEditOpen(false)
            setEditingItem(null)
            queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Güncellenirken hata oluştu")
        }
    })

    const handleCreateSubmit = async (formData: any) => {
        await createMutation.mutateAsync(formData)
    }

    const handleUpdateSubmit = async (formData: any) => {
        if (!editingItem) return
        // Assuming ID field is available in keys or data.
        // We need to find the ID. 
        // Strategy: Look for field with key 'id' or logic from backend.
        // Usually rows have 'id' key if using resourceService.
        // Let's assume there is a field named 'id'.
        const idField = editingItem['id'] as FieldData
        const id = idField ? idField.data : null

        if (!id) {
            toast.error("ID bulunamadı")
            return
        }
        await updateMutation.mutateAsync({ id, data: formData })
    }

    const openEditModal = (item: ResourceItem) => {
        setEditingItem(item)
        setIsEditOpen(true)
    }

    const openDetailModal = (item: ResourceItem) => {
        setViewingItem(item)
        setIsDetailOpen(true)
    }

    const columns = useMemo<ColumnDef<ResourceItem>[]>(() => {
        if (!resourceData || !resourceData.meta.headers) return []

        const dynamicCols = resourceData.meta.headers.map((header: FieldData) => {
            const key = header.key

            return {
                accessorKey: key,
                header: ({ column }: HeaderContext<ResourceItem, unknown>) => {
                    const label = header.name || header.label || key
                    if (!header.sortable) {
                        return <div className="text-left">{label}</div>
                    }

                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="-ml-4"
                        >
                            {label}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }: CellContext<ResourceItem, unknown>) => {
                    const field: FieldData = row.original[key] as FieldData

                    if (!field) return null

                    if (header.key === "image" || header.view === "image-field") {
                        return (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={field.data} alt={field.name} />
                                <AvatarFallback>{field.name ? field.name.substring(0, 2).toUpperCase() : "IMG"}</AvatarFallback>
                            </Avatar>
                        )
                    }

                    return field.data
                },
            }
        })

        const actionCol: ColumnDef<ResourceItem> = {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {item.policy?.view && (
                                <DropdownMenuItem onClick={() => openDetailModal(item)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Görüntüle
                                </DropdownMenuItem>
                            )}
                            {item.policy?.update && (
                                <DropdownMenuItem onClick={() => openEditModal(item)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Düzenle
                                </DropdownMenuItem>
                            )}
                            {item.policy?.delete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-white hover:text-white"
                                        onClick={() => resource && openDelete(resource, (item.id as FieldData).data)}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Sil
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        }

        return [...dynamicCols, actionCol]
    }, [resourceData])




    if (isLoading) {
        return <div className="p-8">Yükleniyor...</div>
    }

    if (isError || !resourceData) {
        return <div className="p-8">Bir hata oluştu veya veri bulunamadı.</div>
    }

    // Cards Query
    const { data: cards = [] } = useQuery({
        queryKey: ["resource", resource, "cards"],
        queryFn: async () => {
            if (!resource) return []
            return resourceService.getCards(resource)
        },
        enabled: !!resource,
    })

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            {/* Cards Functionality */}
            {cards?.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                    {cards.map((card: CardType, index: number) => (
                        <div key={index} className={card.width === "1/3" ? "col-span-1" : "col-span-full"}>
                            <WidgetRenderer card={card} />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{resourceData.meta.title}</h1>
                {resourceData.meta.policy.create && (
                    <ResponsiveModal
                        title={`Create ${resourceData.meta.title}`}
                        description="Fill in the details below."
                        open={isCreateOpen}
                        variant={resourceData.meta.dialog_type}
                        onOpenChange={setIsCreateOpen}
                        trigger={
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Yeni Ekle
                            </Button>
                        }
                    >
                        <ResourceForm
                            fields={createFields}
                            onSubmit={handleCreateSubmit}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </ResponsiveModal>
                )}
            </div>

            <DataTable
                columns={columns}
                data={resourceData.data}
                pageCount={Math.ceil(resourceData.meta.total / resourceData.meta.per_page)}
                pagination={pagination}
                onPaginationChange={setPagination}
                sorting={sorting}
                onSortingChange={setSorting}
            />

            {/* Edit Modal */}
            <ResponsiveModal
                title={`Edit ${resourceData.meta.title}`}
                description="Update the details below."
                open={isEditOpen}
                variant={resourceData.meta.dialog_type}
                onOpenChange={(open) => {
                    setIsEditOpen(open)
                    if (!open) setEditingItem(null)
                }}
            >
                {/* Reusing ResourceForm. Using createFields for now as update fields might be same or similar.
                    Ideally should fetch update fields if different.
                 */}
                <ResourceForm
                    key={(editingItem?.id as FieldData)?.data || 'edit-form'}
                    fields={editFields}
                    initialData={editInitialData}
                    onSubmit={handleUpdateSubmit}
                    onCancel={() => {
                        setIsEditOpen(false)
                        setEditingItem(null)
                    }}
                    submitLabel="Güncelle"
                />
            </ResponsiveModal>

            {/* Detail Modal */}
            <ResponsiveModal
                title={`${resourceData.meta.title} Detayı`}
                description="Kayıt detayları aşağıdadır."
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

            <DeleteConfirmDialog />
        </div>
    )
}
