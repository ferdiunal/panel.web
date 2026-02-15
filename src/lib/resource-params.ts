import qs from 'qs'

/**
 * Resource query parameters structure
 * URL format: users[search]=Ferdi&users[sort][id]=asc&users[page]=1
 */
export interface ResourceParams {
    search?: string
    sort?: {
        column: string
        direction: 'asc' | 'desc'
    }
    filters?: Record<string, string>
    page: number
    per_page: number
}

export const DEFAULT_RESOURCE_PARAMS: ResourceParams = {
    page: 1,
    per_page: 10,
}

/**
 * Parse URL query string to get params for a specific resource
 * 
 * @example
 * // URL: ?users[search]=Ferdi&users[page]=2
 * parseResourceParams('?users[search]=Ferdi&users[page]=2', 'users')
 * // Returns: { search: 'Ferdi', page: 2, per_page: 10 }
 */
export function parseResourceParams(queryString: string, resource: string): ResourceParams {
    const parsed = qs.parse(queryString, {
        ignoreQueryPrefix: true,
        depth: 5,
        parameterLimit: 100,
        duplicates: 'last', // Take the last value if duplicates exist
    })

    const resourceData = parsed[resource] as Record<string, any> | undefined

    if (!resourceData || typeof resourceData !== 'object') {
        return { ...DEFAULT_RESOURCE_PARAMS }
    }

    const params: ResourceParams = {
        page: DEFAULT_RESOURCE_PARAMS.page,
        per_page: DEFAULT_RESOURCE_PARAMS.per_page,
    }

    // Parse search
    if (typeof resourceData.search === 'string' && resourceData.search.trim()) {
        params.search = resourceData.search.trim()
    }

    // Parse sort - format: sort[column]=direction or sort={column: direction}
    if (resourceData.sort && typeof resourceData.sort === 'object') {
        const sortObj = resourceData.sort as Record<string, string>
        const columns = Object.keys(sortObj)
        if (columns.length > 0) {
            const column = columns[0]
            const direction = sortObj[column]
            if (direction === 'asc' || direction === 'desc') {
                params.sort = { column, direction }
            }
        }
    }

    // Parse filters - format: filters[name]=value
    if (resourceData.filters && typeof resourceData.filters === 'object') {
        const filters: Record<string, string> = {}
        Object.entries(resourceData.filters).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim()) {
                filters[key] = value.trim()
            }
        })
        if (Object.keys(filters).length > 0) {
            params.filters = filters
        }
    }

    // Parse page
    if (resourceData.page !== undefined) {
        const pageNum = parseInt(String(resourceData.page), 10)
        if (!isNaN(pageNum) && pageNum > 0) {
            params.page = pageNum
        }
    }

    // Parse per_page
    if (resourceData.per_page !== undefined) {
        const perPageNum = parseInt(String(resourceData.per_page), 10)
        if (!isNaN(perPageNum) && perPageNum > 0 && perPageNum <= 100) {
            params.per_page = perPageNum
        }
    }

    return params
}

/**
 * Convert ResourceParams to URL query string for a specific resource
 * 
 * @example
 * stringifyResourceParams({ search: 'Ferdi', page: 2, per_page: 10 }, 'users')
 * // Returns: 'users[search]=Ferdi&users[page]=2&users[per_page]=10'
 */
export function stringifyResourceParams(
    params: Partial<ResourceParams>,
    resource: string,
    existingQueryString?: string
): string {
    // Parse existing params to preserve other resources' params
    const existingParams = existingQueryString
        ? qs.parse(existingQueryString, { ignoreQueryPrefix: true, depth: 5 })
        : {}

    // Build resource-specific params object
    const resourceParams: Record<string, any> = {}

    // Add search if present
    if (params.search && params.search.trim()) {
        resourceParams.search = params.search.trim()
    }

    // Add sort if present
    if (params.sort) {
        resourceParams.sort = {
            [params.sort.column]: params.sort.direction
        }
    }

    // Add filters if present
    if (params.filters && Object.keys(params.filters).length > 0) {
        resourceParams.filters = params.filters
    }

    // Add page (always include if not default)
    if (params.page && params.page !== DEFAULT_RESOURCE_PARAMS.page) {
        resourceParams.page = params.page
    }

    // Add per_page (always include if not default)
    if (params.per_page && params.per_page !== DEFAULT_RESOURCE_PARAMS.per_page) {
        resourceParams.per_page = params.per_page
    }

    // Merge with existing params
    const mergedParams = {
        ...existingParams,
        [resource]: Object.keys(resourceParams).length > 0 ? resourceParams : undefined,
    }

    // Remove undefined/null values
    Object.keys(mergedParams).forEach(key => {
        if (mergedParams[key] === undefined || mergedParams[key] === null) {
            delete mergedParams[key]
        }
    })

    return qs.stringify(mergedParams, {
        encode: true,
        encodeValuesOnly: true, // Don't encode keys for readability
        skipNulls: true,
        allowDots: false,
        arrayFormat: 'brackets',
    })
}

/**
 * Check if params have changed (for optimization)
 */
export function areParamsEqual(a: ResourceParams, b: ResourceParams): boolean {
    if (a.search !== b.search) return false
    if (a.page !== b.page) return false
    if (a.per_page !== b.per_page) return false

    // Compare sort
    if (a.sort?.column !== b.sort?.column) return false
    if (a.sort?.direction !== b.sort?.direction) return false

    // Compare filters
    const aFilters = a.filters || {}
    const bFilters = b.filters || {}
    const aKeys = Object.keys(aFilters)
    const bKeys = Object.keys(bFilters)

    if (aKeys.length !== bKeys.length) return false
    for (const key of aKeys) {
        if (aFilters[key] !== bFilters[key]) return false
    }

    return true
}

/**
 * Build API query params from ResourceParams
 * This converts the frontend params to backend expected format
 */
export function toApiParams(params: ResourceParams, resource: string): Record<string, any> {
    const apiParams: Record<string, any> = {
        page: params.page,
        per_page: params.per_page,
    }

    if (params.search) {
        apiParams[`${resource}[search]`] = params.search
    }

    if (params.sort) {
        apiParams[`${resource}[sort][${params.sort.column}]`] = params.sort.direction
    }

    if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
            apiParams[`${resource}[filters][${key}]`] = value
        })
    }

    return apiParams
}
