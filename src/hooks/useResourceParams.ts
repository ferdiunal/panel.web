import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    parseResourceParams,
    stringifyResourceParams,
    areParamsEqual,
    type ResourceParams,
    DEFAULT_RESOURCE_PARAMS,
} from '@/lib/resource-params'

interface UseResourceParamsOptions {
    /** Resource name (e.g., 'users') */
    resource: string
    /** Debounce delay for search in ms */
    debounceMs?: number
    /** Callback when params change and API should be called */
    onParamsChange?: (params: ResourceParams) => Promise<void>
    /** Initial params from loader */
    initialParams?: ResourceParams
}

interface UseResourceParamsReturn {
    /** Current URL params (source of truth) */
    params: ResourceParams
    /** Local search input value (for immediate UI feedback) */
    localSearch: string
    /** Update local search input */
    setLocalSearch: (value: string) => void
    /** Update sort column/direction */
    updateSort: (column: string) => void
    /** Update page */
    updatePage: (page: number) => void
    /** Update per_page */
    updatePerPage: (perPage: number) => void
    /** Update filters */
    updateFilters: (filters: Record<string, string>) => void
    /** Update view mode */
    updateView: (view: 'table' | 'grid') => void
    /** Is search currently debouncing */
    isSearchPending: boolean
    /** Reset all params to default */
    resetParams: () => void
}

/**
 * Hook for managing resource query params with debounced search
 * 
 * Flow:
 * 1. User types in search → localSearch updates immediately
 * 2. After debounce delay → API call is made
 * 3. On API success → URL is updated with replace
 * 
 * @example
 * const { params, localSearch, setLocalSearch, updateSort } = useResourceParams({
 *   resource: 'users',
 *   onParamsChange: async (params) => {
 *     await refetch(params)
 *   }
 * })
 */
export function useResourceParams({
    resource,
    debounceMs = 300,
    onParamsChange,
    initialParams,
}: UseResourceParamsOptions): UseResourceParamsReturn {
    const navigate = useNavigate()
    const location = useLocation()

    // Parse current URL params
    const urlParams = useMemo(() => {
        return parseResourceParams(location.search, resource)
    }, [location.search, resource])

    // Use initial params on first render, then URL params
    const params = useMemo(() => {
        if (initialParams && location.search === '') {
            return initialParams
        }
        return urlParams
    }, [urlParams, initialParams, location.search])

    // Local search state for immediate UI feedback
    const [localSearch, setLocalSearchState] = useState(params.search || '')
    
    // Track if search is pending (debouncing)
    const [isSearchPending, setIsSearchPending] = useState(false)
    
    // Ref to track the latest pending search value
    const pendingSearchRef = useRef<string | null>(null)
    
    // Debounce timer ref
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sync local search with URL params when URL changes externally
    useEffect(() => {
        const urlSearch = params.search || ''
        if (localSearch !== urlSearch && pendingSearchRef.current === null) {
            setLocalSearchState(urlSearch)
        }
    }, [params.search])

    // Update URL with new params
    const updateUrl = useCallback((newParams: Partial<ResourceParams>) => {
        const mergedParams: ResourceParams = {
            ...params,
            ...newParams,
        }

        // Don't update if params haven't changed
        if (areParamsEqual(params, mergedParams)) {
            return
        }

        const queryString = stringifyResourceParams(mergedParams, resource, location.search)
        const newUrl = queryString ? `?${queryString}` : location.pathname
        
        navigate(newUrl, { replace: true })
    }, [params, resource, location.search, location.pathname, navigate])

    // Handle local search change with debounce
    const setLocalSearch = useCallback((value: string) => {
        setLocalSearchState(value)
        pendingSearchRef.current = value
        setIsSearchPending(true)

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Set new debounce timer
        debounceTimerRef.current = setTimeout(async () => {
            const searchValue = pendingSearchRef.current
            pendingSearchRef.current = null

            // Call API with new params
            const newParams: ResourceParams = {
                ...params,
                search: searchValue || undefined,
                page: 1, // Reset to page 1 on search
            }

            if (onParamsChange) {
                try {
                    await onParamsChange(newParams)
                } catch (error) {
                    console.error('Error updating params:', error)
                }
            }

            // Update URL after successful API call
            updateUrl({ search: searchValue || undefined, page: 1 })
            setIsSearchPending(false)
        }, debounceMs)
    }, [params, debounceMs, onParamsChange, updateUrl])

    // Update sort (immediate, no debounce)
    const updateSort = useCallback((column: string) => {
        const currentSort = params.sort
        let newDirection: 'asc' | 'desc' = 'asc'

        if (currentSort?.column === column) {
            newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc'
        }

        const newParams: ResourceParams = {
            ...params,
            sort: { column, direction: newDirection },
            page: 1, // Reset to page 1 on sort change
        }

        if (onParamsChange) {
            onParamsChange(newParams).then(() => {
                updateUrl({ sort: { column, direction: newDirection }, page: 1 })
            })
        } else {
            updateUrl({ sort: { column, direction: newDirection }, page: 1 })
        }
    }, [params, onParamsChange, updateUrl])

    // Update page (immediate, no debounce)
    const updatePage = useCallback((page: number) => {
        if (page === params.page) return

        const newParams: ResourceParams = {
            ...params,
            page,
        }

        if (onParamsChange) {
            onParamsChange(newParams).then(() => {
                updateUrl({ page })
            })
        } else {
            updateUrl({ page })
        }
    }, [params, onParamsChange, updateUrl])

    // Update per_page (immediate, no debounce)
    const updatePerPage = useCallback((perPage: number) => {
        if (perPage === params.per_page) return

        const newParams: ResourceParams = {
            ...params,
            per_page: perPage,
            page: 1, // Reset to page 1 on per_page change
        }

        if (onParamsChange) {
            onParamsChange(newParams).then(() => {
                updateUrl({ per_page: perPage, page: 1 })
            })
        } else {
            updateUrl({ per_page: perPage, page: 1 })
        }
    }, [params, onParamsChange, updateUrl])

    // Update filters (immediate, no debounce)
    const updateFilters = useCallback((filters: Record<string, string>) => {
        const newParams: ResourceParams = {
            ...params,
            filters: Object.keys(filters).length > 0 ? filters : undefined,
            page: 1, // Reset to page 1 on filter change
        }

        if (onParamsChange) {
            onParamsChange(newParams).then(() => {
                updateUrl({ filters: newParams.filters, page: 1 })
            })
        } else {
            updateUrl({ filters: newParams.filters, page: 1 })
        }
    }, [params, onParamsChange, updateUrl])

    const updateView = useCallback((view: 'table' | 'grid') => {
        const normalized: 'table' | 'grid' = view === 'grid' ? 'grid' : 'table'
        const current = (params.view || 'table')
        if (current === normalized) return

        const newParams: ResourceParams = {
            ...params,
            view: normalized,
        }

        if (onParamsChange) {
            onParamsChange(newParams).then(() => {
                updateUrl({ view: normalized })
            })
        } else {
            updateUrl({ view: normalized })
        }
    }, [params, onParamsChange, updateUrl])

    // Reset all params
    const resetParams = useCallback(() => {
        setLocalSearchState('')
        pendingSearchRef.current = null
        setIsSearchPending(false)

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        const newParams = { ...DEFAULT_RESOURCE_PARAMS }

        if (onParamsChange) {
            onParamsChange(newParams).then(() => {
                navigate(location.pathname, { replace: true })
            })
        } else {
            navigate(location.pathname, { replace: true })
        }
    }, [onParamsChange, navigate, location.pathname])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [])

    return {
        params,
        localSearch,
        setLocalSearch,
        updateSort,
        updatePage,
        updatePerPage,
        updateFilters,
        updateView,
        isSearchPending,
        resetParams,
    }
}
