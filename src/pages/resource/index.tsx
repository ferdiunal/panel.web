import { useState, useMemo, useCallback, useEffect } from "react"
import { useParams, useLoaderData, type LoaderFunctionArgs, redirect, useSearchParams, useNavigate, useLocation } from "react-router-dom"
import { resourceService } from "@/services/resource"
import type { ResourceItem, FieldData, Card as CardType } from "@/types"
import { WidgetRenderer } from "@/components/widget-renderer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ResponsiveModal } from "@/components/ui/responsive-modal"
import type { ResponsiveModalSize } from "@/components/ui/responsive-modal"
import { UniversalResourceForm } from "@/components/forms/UniversalResourceForm"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { useAppStore, useAuthStore } from "@/stores"
import { IndexView, type IndexViewColumn, type IndexViewRowClickAction } from "@/components/views/IndexView"
import { Pagination, type PaginationMode } from "@/components/views/Pagination"
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
import { DetailModalWrapper } from "@/components/DetailModalWrapper"
import { renderRelationshipFieldValue } from "@/lib/relation-field-links"
import { renderDisplayComponent } from "@/lib/display-components"
import { formatTemporalFieldValue } from "@/lib/date-display"
import { formatMoneyFieldValue } from "@/lib/money-display"
import { extractRecordIdFromItem, extractRecordTitleFromFields, extractRecordTitleFromItem, extractRecordTitleFromMeta, formatRecordReference } from "@/lib/record-reference"
import type { ResourceFieldResponse } from "@/services/resource"
import { getCardGridSpan } from "@/lib/card-grid"

interface LoaderData {
    data: any
    params: ResourceParams
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

function extractSelectScalarValue(rawValue: unknown): string | undefined {
    if (rawValue === null || rawValue === undefined) return undefined

    if (typeof rawValue === "string") {
        const trimmed = rawValue.trim()
        if (!trimmed) return undefined

        if (trimmed.startsWith("{")) {
            try {
                const parsed = JSON.parse(trimmed) as Record<string, unknown>
                return (
                    extractSelectScalarValue(parsed.value) ??
                    extractSelectScalarValue(parsed.data) ??
                    extractSelectScalarValue(parsed.target_type)
                )
            } catch {
                // keep plain string fallback
            }
        }

        return trimmed
    }

    if (typeof rawValue === "number" || typeof rawValue === "boolean") {
        return String(rawValue)
    }

    if (typeof rawValue === "object") {
        const record = rawValue as Record<string, unknown>
        return (
            extractSelectScalarValue(record.value) ??
            extractSelectScalarValue(record.data) ??
            extractSelectScalarValue(record.target_type) ??
            extractSelectScalarValue(record.id)
        )
    }

    return undefined
}

function hasMeaningfulValue(value: unknown): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === "string") return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
}

function isValidationHttpError(error: unknown): boolean {
    return (error as any)?.response?.status === 422
}

function normalizeSelectInitialValue(field: FieldData): string | undefined {
    const candidate = extractSelectScalarValue(field.data)
    if (!candidate) return undefined

    const rawOptions = field.props?.options
    if (!rawOptions) return candidate

    if (Array.isArray(rawOptions)) {
        const exact = rawOptions.find((opt: any) => String(opt?.value) === candidate)
        if (exact) return String(exact.value)

        const lowered = candidate.toLowerCase()
        const byValueInsensitive = rawOptions.find(
            (opt: any) => String(opt?.value ?? "").toLowerCase() === lowered
        )
        if (byValueInsensitive) return String(byValueInsensitive.value)

        const byLabelInsensitive = rawOptions.find(
            (opt: any) => String(opt?.label ?? "").toLowerCase() === lowered
        )
        if (byLabelInsensitive) return String(byLabelInsensitive.value)

        return candidate
    }

    if (typeof rawOptions === "object") {
        const optionsMap = rawOptions as Record<string, unknown>
        if (candidate in optionsMap) return candidate

        const lowered = candidate.toLowerCase()
        for (const [valueKey, labelValue] of Object.entries(optionsMap)) {
            if (String(valueKey).toLowerCase() === lowered) return valueKey
            if (String(labelValue).toLowerCase() === lowered) return valueKey
        }
    }

    return candidate
}

export const loader = async ({ params, request }: LoaderFunctionArgs): Promise<LoaderData | Response> => {
    const resource = params.resource
    if (!resource) {
        throw new Response("Resource not found", { status: 404 })
    }

    try {
        await useAppStore.getState().init()
    } catch (error) {
        console.error('App init failed:', error)
    }

    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login')
    }

    // Parse URL query params
    const url = new URL(request.url)
    const resourceParams = parseResourceParams(url.search, resource)

    // Fetch data with error handling
    try {
        const data = await resourceService.fetchResource(resource, resourceParams)
        return { data, params: resourceParams }
    } catch (error: any) {
        const status = error.response?.status || 500
        const message = error.response?.data?.message || error.message || 'Kaynak yüklenirken hata oluştu'

        throw new Response(message, {
            status,
            statusText: error.response?.statusText
        })
    }
}

export default function ResourceIndexPage() {
    const { resource, id: routeRecordId } = useParams<{ resource: string; id?: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const loaderData = useLoaderData() as LoaderData
    const queryClient = useQueryClient()
    const [createContainer, setCreateContainer] = useState<HTMLDivElement | null>(null)
    const [editContainer, setEditContainer] = useState<HTMLDivElement | null>(null)

    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Data states (Simple modals)
    const [editingItem, setEditingItem] = useState<ResourceItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<ResourceItem | null>(null)

    // Detail Stack for Nested Modals
    interface DetailStackItem {
        id: string // Unique ID for key
        resource: string
        item: ResourceItem
    }
    const [detailStack, setDetailStack] = useState<DetailStackItem[]>([])

    // URL Search Params
    const [searchParams, setSearchParams] = useSearchParams()

    const isCreateRoute = !!resource && location.pathname === `/resource/${resource}/create`
    const isShowRoute = !!resource && !!routeRecordId && location.pathname === `/resource/${resource}/${routeRecordId}/show`
    const isEditRoute = !!resource && !!routeRecordId && location.pathname === `/resource/${resource}/${routeRecordId}/edit`

    const buildPathWithCurrentQuery = useCallback((path: string, removeLegacyDetailId = false) => {
        const nextParams = new URLSearchParams(searchParams)
        if (removeLegacyDetailId) {
            nextParams.delete("detail_id")
        }
        const queryString = nextParams.toString()
        return queryString ? `${path}?${queryString}` : path
    }, [searchParams])

    const buildMockResourceItem = useCallback((id: string | number): ResourceItem => {
        return {
            id: {
                data: id,
                key: 'id',
                name: 'ID',
                label: 'ID',
                type: 'id',
                view: 'id-field'
            } as FieldData
        }
    }, [])

    const navigateToIndexPath = useCallback((replace = false) => {
        if (!resource) return
        navigate(buildPathWithCurrentQuery(`/resource/${resource}`, true), { replace })
    }, [buildPathWithCurrentQuery, navigate, resource])

    const navigateToCreatePath = useCallback(() => {
        if (!resource) return
        navigate(buildPathWithCurrentQuery(`/resource/${resource}/create`, true))
    }, [buildPathWithCurrentQuery, navigate, resource])

    const navigateToShowPath = useCallback((id: string | number) => {
        if (!resource) return
        navigate(buildPathWithCurrentQuery(`/resource/${resource}/${id}/show`, true))
    }, [buildPathWithCurrentQuery, navigate, resource])

    const navigateToEditPath = useCallback((id: string | number) => {
        if (!resource) return
        navigate(buildPathWithCurrentQuery(`/resource/${resource}/${id}/edit`, true))
    }, [buildPathWithCurrentQuery, navigate, resource])

    // Sync URL -> modal states (create)
    useEffect(() => {
        setIsCreateOpen(isCreateRoute)
    }, [isCreateRoute])

    // Sync URL -> modal states (edit)
    useEffect(() => {
        if (!isEditRoute || !routeRecordId) {
            setIsEditOpen(false)
            setEditingItem(null)
            return
        }

        setIsEditOpen(true)
        setEditingItem((prev) => {
            const prevIdField = prev?.id as FieldData | undefined
            const prevId = prevIdField ? String(prevIdField.data) : ""
            if (prev && prevId === String(routeRecordId)) {
                return prev
            }
            return buildMockResourceItem(routeRecordId)
        })
    }, [buildMockResourceItem, isEditRoute, routeRecordId])

    // Sync URL -> modal states (show)
    useEffect(() => {
        if (!resource) return

        const legacyDetailId = searchParams.get("detail_id")
        const activeDetailId = isShowRoute ? routeRecordId : legacyDetailId

        if (!activeDetailId) {
            setDetailStack((prev) => (prev.length === 0 ? prev : []))
            return
        }

        setDetailStack((prev) => {
            const root = prev[0]
            const rootIdField = root?.item?.id as FieldData | undefined
            const rootId = rootIdField ? String(rootIdField.data) : ""

            if (root && root.resource === resource && rootId === String(activeDetailId)) {
                return prev
            }

            return [{
                id: `${resource}-${activeDetailId}-init`,
                resource,
                item: buildMockResourceItem(activeDetailId)
            }]
        })
    }, [buildMockResourceItem, isShowRoute, resource, routeRecordId, searchParams])

    // Use the custom hook for URL params management
    const {
        params,
        localSearch,
        setLocalSearch,
        updateSort,
        updatePage,
        updatePerPage,
        isSearchPending,
    } = useResourceParams({
        resource: resource || '',
        debounceMs: 300,
        initialParams: loaderData.params,
    })

    // Resource Data Query
    const { data: resourceData, isLoading, isError } = useQuery({
        queryKey: ["resource", resource, params.search, params.sort?.column, params.sort?.direction, params.page, params.per_page],
        queryFn: async () => {
            if (!resource) return null
            return resourceService.fetchResource(resource, params)
        },
        initialData: loaderData.data,
        enabled: !!resource,
        staleTime: 30000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })

    const handleSearchChange = useCallback((query: string) => {
        setLocalSearch(query)
    }, [setLocalSearch])

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
    const { data: editFieldsResponse } = useQuery<ResourceFieldResponse>({
        queryKey: ["resource", resource, "edit-fields", (editingItem?.id as FieldData)?.data],
        queryFn: async () => {
            if (!resource || !editingItem) return { fields: [] }
            const idField = editingItem['id'] as FieldData
            const id = idField ? idField.data : null
            if (!id) return { fields: [] }
            return resourceService.getEditFields(resource, id)
        },
        enabled: !!resource && isEditOpen && !!editingItem,
    })

    const rawEditFields = useMemo(() => {
        if (!editFieldsResponse) {
            return []
        }
        return editFieldsResponse.fields || []
    }, [editFieldsResponse])

    const editMeta = useMemo(() => {
        if (!editFieldsResponse) {
            return undefined
        }
        return editFieldsResponse.meta
    }, [editFieldsResponse])

    // Process edit fields
    const editFields = useMemo(() => {
        return rawEditFields.map(field => {
            const view = field.view || '';
            const isManyRelationship =
                view === 'has-many-field' ||
                view === 'belongs-to-many-field' ||
                view.startsWith('has-many-field-') ||
                view.startsWith('belongs-to-many-field-');

            if (isManyRelationship && Array.isArray(field.data) && field.data.length > 0) {
                const firstItem = field.data[0];
                if (firstItem && typeof firstItem === 'object' && 'id' in firstItem) {
                    const options: Record<string, string> = {};
                    field.data.forEach((item: any) => {
                        const id = item.id?.data || item.id;
                        const name = item.name?.data || item.name || item.title?.data || item.title || `#${id}`;
                        options[String(id)] = String(name);
                    });

                    return {
                        ...field,
                        props: {
                            ...field.props,
                            options: options
                        }
                    };
                }
            }
            return field;
        });
    }, [rawEditFields])

    const editModalTitle = useMemo(() => {
        const fallbackTitle = `${resourceData.meta.title} Duzenle`

        const recordId =
            extractRecordIdFromItem((editingItem as unknown as Record<string, unknown>) || undefined) ||
            (routeRecordId ? routeRecordId : undefined)

        const recordTitle =
            extractRecordTitleFromItem((editingItem as unknown as Record<string, unknown>) || undefined) ||
            extractRecordTitleFromFields(rawEditFields) ||
            extractRecordTitleFromMeta(editMeta as Record<string, unknown> | undefined)

        const formatted = formatRecordReference(recordId, recordTitle)
        return formatted || fallbackTitle
    }, [editMeta, editingItem, rawEditFields, resourceData.meta.title, routeRecordId])

    const resourceModalSize = useMemo<ResponsiveModalSize>(() => {
        return parseResponsiveModalSize(resourceData?.meta?.dialog_size, "md")
    }, [resourceData?.meta?.dialog_size])

    const rowClickAction = useMemo<IndexViewRowClickAction>(() => {
        const action = resourceData?.meta?.row_click_action
        return action === "detail" ? "detail" : "edit"
    }, [resourceData?.meta?.row_click_action])

    const reorderColumn = useMemo(() => {
        const reorder = resourceData?.meta?.reorder
        if (!reorder?.enabled) return ""
        return typeof reorder.column === "string" ? reorder.column.trim() : ""
    }, [resourceData?.meta?.reorder])

    const paginationMode = useMemo<PaginationMode>(() => {
        const mode = resourceData?.meta?.pagination?.type
        if (mode === "simple" || mode === "load_more") {
            return mode
        }
        return "links"
    }, [resourceData?.meta?.pagination?.type])

    const loadMoreSignature = useMemo(() => {
        return JSON.stringify({
            resource,
            search: params.search || "",
            sortColumn: params.sort?.column || "",
            sortDirection: params.sort?.direction || "",
            filters: params.filters || {},
            perPage: params.per_page,
        })
    }, [params.filters, params.per_page, params.search, params.sort?.column, params.sort?.direction, resource])

    const [loadMorePages, setLoadMorePages] = useState<Record<number, ResourceItem[]>>({})
    const [loadMoreStateSignature, setLoadMoreStateSignature] = useState("")

    useEffect(() => {
        if (paginationMode !== "load_more" || !resourceData) return

        const currentPage = Number(resourceData.meta.current_page || params.page || 1)
        const currentItems = resourceData.data || []

        if (loadMoreStateSignature !== loadMoreSignature) {
            setLoadMoreStateSignature(loadMoreSignature)
            setLoadMorePages({ [currentPage]: currentItems })
            return
        }

        setLoadMorePages((prev) => ({
            ...prev,
            [currentPage]: currentItems,
        }))
    }, [loadMoreSignature, loadMoreStateSignature, paginationMode, params.page, resourceData])

    const displayedResources = useMemo(() => {
        if (paginationMode !== "load_more") {
            return resourceData?.data || []
        }

        const entries = Object.entries(loadMorePages)
            .map(([pageKey, items]) => ({ page: Number(pageKey), items }))
            .sort((a, b) => a.page - b.page)

        return entries.flatMap((entry) => entry.items)
    }, [loadMorePages, paginationMode, resourceData?.data])

    const handleLoadMore = useCallback(() => {
        const currentPage = Number(resourceData?.meta?.current_page || params.page || 1)
        const total = Number(resourceData?.meta?.total || 0)
        const totalPages = Math.max(1, Math.ceil(total / params.per_page))

        if (currentPage >= totalPages) {
            return
        }

        updatePage(currentPage + 1)
    }, [params.page, params.per_page, resourceData?.meta?.current_page, resourceData?.meta?.total, updatePage])

    // Prepare initial data for edit form
    const editInitialData = useMemo(() => {
        if (!editFields || editFields.length === 0) return {}
        const initial: Record<string, any> = {}
        editFields.forEach(field => {
            const view = field.view || ''
            const isManyRelationship =
                view === 'has-many-field' ||
                view === 'belongs-to-many-field' ||
                view.startsWith('has-many-field-') ||
                view.startsWith('belongs-to-many-field-')

            const isSingleRelationship =
                view === 'belongs-to-field' ||
                view === 'has-one-field' ||
                view.startsWith('belongs-to-field-') ||
                view.startsWith('has-one-field-')

            const isSelectField =
                field.type === 'select' ||
                view === 'select-field' ||
                view.startsWith('select-field-')

            if (isSelectField) {
                initial[field.key] = normalizeSelectInitialValue(field) ?? ''
                return
            }

            if (isManyRelationship) {
                if (field.data === null || field.data === undefined) {
                    initial[field.key] = []
                } else if (Array.isArray(field.data)) {
                    initial[field.key] = field.data.map((item: any) => {
                        if (item && typeof item === 'object' && 'id' in item) {
                            const idField = item.id;
                            if (idField && typeof idField === 'object' && 'data' in idField) {
                                return String(idField.data);
                            }
                            return String(idField);
                        }
                        return String(item);
                    })
                } else {
                    initial[field.key] = []
                }
            } else if (isSingleRelationship && field.data && typeof field.data === 'object' && 'id' in (field.data as any)) {
                const idField = (field.data as any).id
                if (idField && typeof idField === 'object' && 'data' in idField) {
                    initial[field.key] = String(idField.data)
                } else {
                    initial[field.key] = String(idField)
                }
            } else {
                initial[field.key] = field.data
            }
        })

        // Keep target_type selected in edit form even when backend payload omits it.
        if (!hasMeaningfulValue(extractSelectScalarValue(initial["target_type"]))) {
            if (hasMeaningfulValue(initial["product_id"])) {
                initial["target_type"] = "product"
            } else if (hasMeaningfulValue(initial["category_id"])) {
                initial["target_type"] = "category"
            } else if (hasMeaningfulValue(initial["static_url"])) {
                initial["target_type"] = "static_url"
            }
        }

        return initial
    }, [editFields])

    // Handlers
    const closeCreateModal = useCallback((navigateBack = true) => {
        setIsCreateOpen(false)
        if (navigateBack && isCreateRoute) {
            navigateToIndexPath(true)
        }
    }, [isCreateRoute, navigateToIndexPath])

    const closeEditModal = useCallback((navigateBack = true) => {
        setIsEditOpen(false)
        setEditingItem(null)
        if (navigateBack && isEditRoute) {
            navigateToIndexPath(true)
        }
    }, [isEditRoute, navigateToIndexPath])

    const handleCreateSubmit = async (formData: any) => {
        if (!resource) return
        try {
            await resourceService.createResource(resource, formData)
            toast.success("Kayit olusturuldu")
            closeCreateModal(true)
            await queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        } catch (error) {
            console.error(error)
            if (!isValidationHttpError(error)) {
                toast.error("Olusturulurken hata olustu")
            }
            throw error
        }
    }

    const handleCreateAndContinue = async (formData: any) => {
        if (!resource) return
        try {
            const response = await resourceService.createResource(resource, formData)
            toast.success("Kayit olusturuldu")
            const createdResource = response.data
            closeCreateModal(false)
            openEditModal(createdResource)
            await queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        } catch (error) {
            console.error(error)
            if (!isValidationHttpError(error)) {
                toast.error("Olusturulurken hata olustu")
            }
            throw error
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
            closeEditModal(true)
            await queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        } catch (error) {
            console.error(error)
            if (!isValidationHttpError(error)) {
                toast.error("Guncellenirken hata olustu")
            }
            throw error
        }
    }

    const handleUpdateAndContinue = async (formData: any) => {
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
            await queryClient.invalidateQueries({ queryKey: ["resource", resource] })
        } catch (error) {
            console.error(error)
            if (!isValidationHttpError(error)) {
                toast.error("Guncellenirken hata olustu")
            }
            throw error
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

    const reorderMutation = useMutation({
        mutationFn: async (orderedItems: ResourceItem[]) => {
            if (!resource) throw new Error("No resource")
            if (!reorderColumn) throw new Error("Reorder is not enabled for this resource")

            const ids = orderedItems.map((item) => {
                const idField = item['id'] as FieldData | undefined
                const id = idField ? idField.data : undefined
                if (id === undefined || id === null) {
                    throw new Error("Invalid row id for reorder")
                }
                return id
            })

            return resourceService.reorderResource(resource, ids)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Siralama guncellenirken hata olustu")
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

    const handleRowReorder = useCallback(async (orderedItems: ResourceItem[]) => {
        if (!resource || !reorderColumn) return
        await reorderMutation.mutateAsync(orderedItems)
        await queryClient.invalidateQueries({ queryKey: ["resource", resource] })
    }, [queryClient, reorderColumn, reorderMutation, resource])

    const openEditModal = (item: ResourceItem) => {
        setEditingItem(item)
        setIsEditOpen(true)
        const idField = item['id'] as FieldData | undefined
        const id = idField ? idField.data : null
        if (id !== null && id !== undefined) {
            navigateToEditPath(id)
        }
    }

    const openDetailModal = (item: ResourceItem, targetResource?: string) => {
        const res = targetResource || resource || ''
        const idField = item['id'] as FieldData
        const id = idField ? idField.data : null

        // Add new item to stack
        setDetailStack(prev => [...prev, {
            id: `${res}-${id || 'unknown'}-${Date.now()}`,
            resource: res,
            item: item
        }])

        // Root resource detay açılışında URL route'unu güncelle
        if (!targetResource && id !== null && id !== undefined) {
            navigateToShowPath(id)
        }
    }

    const openDetailFromEditModal = () => {
        if (!editingItem) return
        closeEditModal(false)
        openDetailModal(editingItem)
    }

    const closeDetailModal = (stackIndex: number) => {
        if (stackIndex === 0) {
            setDetailStack([])

            if (isShowRoute) {
                navigateToIndexPath(true)
                return
            }

            if (searchParams.has("detail_id")) {
                const newParams = new URLSearchParams(searchParams)
                newParams.delete("detail_id")
                setSearchParams(newParams)
            }
            return
        }

        // Remove this specific item from stack
        setDetailStack(prev => prev.filter((_, i) => i !== stackIndex))
    }

    const handleResourceClick = (targetResource: string, id: string | number) => {
        openDetailModal(buildMockResourceItem(id), targetResource)
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
                label: header.label || header.name || key,
                sortable: header.sortable,
                render: (_: any, record: ResourceItem) => {
                    const field: FieldData = record[key] as FieldData
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
                            <Badge variant={field.props?.variant || 'default'}>
                                {field.data}
                            </Badge>
                        )
                    }

                    const relationshipContent = renderRelationshipFieldValue(field, record as Record<string, unknown>)
                    if (relationshipContent !== null) {
                        return relationshipContent
                    }

                    const displayComponent = renderDisplayComponent(field.data)
                    if (displayComponent !== null) {
                        return displayComponent
                    }

                    if (typeof field.data === 'object' && field.data !== null) {
                        const data = field.data as any
                        if (Array.isArray(data)) {
                            return (
                                <div className="flex flex-wrap gap-1">
                                    {data.map((item: any, i: number) => {
                                        let label: string;
                                        if (item && typeof item === 'object' && 'data' in item && 'key' in item) {
                                            const fieldData = item.data;
                                            if (fieldData && typeof fieldData === 'object') {
                                                label = String(fieldData.name || fieldData.title || fieldData.label || fieldData.id || i);
                                            } else {
                                                label = String(fieldData || i);
                                            }
                                        } else if (typeof item === 'object') {
                                            label = String(item.name || item.title || item.label || item.username || item.email || item.id || i);
                                        } else {
                                            label = String(item);
                                        }
                                        return (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                {label}
                                            </span>
                                        )
                                    })}
                                </div>
                            )
                        }
                        return data.name || data.email || data.title || data.username || data.id || JSON.stringify(data)
                    }

                    if (field.props?.options) {
                        if (Array.isArray(field.props.options)) {
                            const option = field.props.options.find((opt: any) => opt.value === field.data)
                            if (option) return option.label
                        } else {
                            const options = field.props.options as Record<string, string>
                            const valStr = String(field.data)
                            if (options[valStr]) return options[valStr]
                        }
                    }

                    const formattedTemporalValue = formatTemporalFieldValue(field)
                    if (formattedTemporalValue !== null) {
                        return formattedTemporalValue
                    }

                    const formattedMoneyValue = formatMoneyFieldValue(field)
                    if (formattedMoneyValue !== null) {
                        return formattedMoneyValue
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
        staleTime: 60000,
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

    const { setActions, selectedIds, setSelectedIds, clearSelectedIds } = useActionStore()

    useEffect(() => {
        if (actions.length > 0) setActions(actions)
    }, [actions, setActions])

    useEffect(() => {
        clearSelectedIds()
    }, [resource, clearSelectedIds])

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
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-12">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            ) : cardsError ? (
                <div className="p-4 border rounded bg-red-50 text-red-500">
                    Failed to load cards: {cardsError.message}
                </div>
            ) : cards?.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-12">
                    {cards.map((card: CardType, index: number) => (
                        <div key={index} className={getCardGridSpan(card.width)}>
                            <WidgetRenderer card={card} />
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Header */}
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
                            size={resourceModalSize}
                            sheetSize={resourceModalSize}
                            onOpenChange={(open) => {
                                if (!open) {
                                    closeCreateModal(true)
                                }
                            }}
                            ref={setCreateContainer}
                            trigger={
                                <Button onClick={navigateToCreatePath}>
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
                                onCreateAndContinue={handleCreateAndContinue}
                                onCancel={() => closeCreateModal(true)}
                                container={createContainer}
                            />
                        </ResponsiveModal>
                    )}
                </div>
            </div>

            {/* IndexView */}
            <IndexView
                resources={displayedResources}
                columns={columns}
                isLoading={isLoading || isSearchPending}
                isEmpty={displayedResources.length === 0}
                searchQuery={localSearch}
                onSearchChange={handleSearchChange}
                sortBy={params.sort?.column}
                sortOrder={params.sort?.direction || 'asc'}
                onSort={handleSort}
                onView={(item) => {
                    if (item.policy?.view) openDetailModal(item)
                }}
                onEdit={(item) => {
                    if (item.policy?.update) openEditModal(item)
                }}
                onDelete={(item) => {
                    if (item.policy?.delete) openDeleteDialog(item)
                }}
                enableSelection={actions.length > 0}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                rowClickAction={rowClickAction}
                enableRowReorder={!!reorderColumn}
                onRowReorder={reorderColumn ? handleRowReorder : undefined}
            />

            {resourceData.meta.total > 0 && (
                <Pagination
                    mode={paginationMode}
                    page={resourceData.meta.current_page}
                    pageSize={resourceData.meta.per_page}
                    total={resourceData.meta.total}
                    visibleCount={paginationMode === "load_more" ? displayedResources.length : undefined}
                    onPageChange={updatePage}
                    onPageSizeChange={updatePerPage}
                    onLoadMore={paginationMode === "load_more" ? handleLoadMore : undefined}
                    disabled={isLoading || isSearchPending}
                />
            )}

            {/* Action Modal */}
            {resource && <ActionModal resource={resource} />}

            {/* Edit Modal */}
            <ResponsiveModal
                title={(
                    <div className="flex items-center gap-3 pr-12">
                        <span>{editModalTitle}</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openDetailFromEditModal}
                            disabled={!editingItem}
                        >
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                            Detaya Don
                        </Button>
                    </div>
                )}
                description="Asagidaki bilgileri guncelleyiniz."
                open={isEditOpen}
                variant={resourceData.meta.dialog_type}
                size={resourceModalSize}
                sheetSize={resourceModalSize}
                onOpenChange={(open) => {
                    if (!open) {
                        closeEditModal(true)
                    }
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
                    onUpdateAndContinue={handleUpdateAndContinue}
                    onCancel={() => {
                        closeEditModal(true)
                    }}
                    container={editContainer}
                />
            </ResponsiveModal>

            {/* Detail Modals (Stacked) */}
            {detailStack.map((stackItem, index) => (
                <DetailModalWrapper
                    key={stackItem.id}
                    stackItem={stackItem}
                    isOpen={true} // Always true, controlled by stack presence
                    onClose={() => closeDetailModal(index)}
                    onResourceClick={handleResourceClick}
                    onEdit={stackItem.resource === resource ? openEditModal : undefined}
                />
            ))}

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
