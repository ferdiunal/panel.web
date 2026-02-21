import api from "@/lib/axios";
import type { ResourceResponse, FieldData } from "@/types";
import type { ResourceParams } from "@/lib/resource-params";
import type { ResolveDependenciesRequest, ResolveDependenciesResponse } from "@/types/dependencies";
import type { LensData, LensResponse, LensQueryParams } from "@/types/lens";
import qs from "qs";

export interface ResourceFieldResponse {
    fields: FieldData[];
    meta?: Record<string, any>;
    [key: string]: any;
}

export const resourceService = {
    fetchResource: async (
        resource: string,
        params: ResourceParams
    ): Promise<ResourceResponse> => {
        // Build query params in nested format: users[search]=..., users[sort][id]=asc
        const queryParams: Record<string, any> = {
            [resource]: {}
        };

        // Add search
        if (params.search) {
            queryParams[resource].search = params.search;
        }

        // Add sort
        if (params.sort) {
            queryParams[resource].sort = {
                [params.sort.column]: params.sort.direction
            };
        }

        // Add filters
        if (params.filters && Object.keys(params.filters).length > 0) {
            queryParams[resource].filters = params.filters;
        }

        // Add view mode
        if (params.view === "grid") {
            queryParams[resource].view = "grid";
        }

        // Add pagination
        queryParams[resource].page = params.page;
        queryParams[resource].per_page = params.per_page;

        // Add relationship filter params (viaResource, viaResourceId, viaRelationship)
        // These are passed in params but not defined in ResourceParams interface
        const extraParams = params as any;
        if (extraParams.viaResource) queryParams.viaResource = extraParams.viaResource;
        if (extraParams.viaResourceId) queryParams.viaResourceId = extraParams.viaResourceId;
        if (extraParams.viaRelationship) queryParams.viaRelationship = extraParams.viaRelationship;

        const queryString = qs.stringify(queryParams, {
            encode: true,
            encodeValuesOnly: true,
            skipNulls: true,
            allowDots: false,
        });

        const { data } = await api.get<ResourceResponse>(`/resource/${resource}?${queryString}`);
        return data;
    },

    getCreateFields: async (resource: string) => {
        const { data } = await api.get<{ fields: FieldData[] }>(`/resource/${resource}/create`);
        return data.fields;
    },

    getEditFields: async (resource: string, id: string | number) => {
        const { data } = await api.get<ResourceFieldResponse>(`/resource/${resource}/${id}/edit`);
        return data;
    },

    getDetailFields: async (resource: string, id: string | number) => {
        const { data } = await api.get<ResourceFieldResponse>(`/resource/${resource}/${id}/detail`);
        return data;
    },

    createResource: async (resource: string, data: any) => {
        if (!shouldUseMultipart(data)) {
            const response = await api.post(`/resource/${resource}`, data);
            return response.data;
        }

        const formData = toFormData(data);
        const response = await api.post(`/resource/${resource}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updateResource: async (resource: string, id: string | number, data: any) => {
        if (!shouldUseMultipart(data)) {
            const response = await api.put(`/resource/${resource}/${id}`, data);
            return response.data;
        }

        const formData = toFormData(data);
        // Note: PUT with multipart/form-data can be tricky in some servers/proxies but Go Fiber handles it.
        // Usually POST with _method=PUT is safer for legacy, but we'll try direct PUT.
        const response = await api.put(`/resource/${resource}/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    deleteResource: async (resource: string, id: string | number) => {
        const response = await api.delete(`/resource/${resource}/${id}`);
        return response.data;
    },

    reorderResource: async (resource: string, ids: Array<string | number>) => {
        const { data } = await api.post(`/resource/${resource}/reorder`, { ids });
        return data;
    },

    getCards: async (resource: string) => {
        const { data } = await api.get<{ data: any[] }>(`/resource/${resource}/cards`);
        return data.data;
    },

    getActions: async (resource: string) => {
        const { data } = await api.get<{ actions: any[] }>(`/resource/${resource}/actions`);
        return data.actions;
    },

    resolveDependencies: async (
        resource: string,
        request: ResolveDependenciesRequest
    ): Promise<ResolveDependenciesResponse> => {
        const { data } = await api.post<ResolveDependenciesResponse>(
            `/resource/${resource}/fields/resolve-dependencies`,
            request
        );
        return data;
    },

    /**
     * Lens API Metodları
     * Backend lens özelliği için API çağrıları
     */

    /**
     * Bir resource için mevcut lens'leri getirir
     * @param resource - Resource adı (örn: "users")
     * @returns Lens listesi
     */
    getLenses: async (resource: string): Promise<LensData[]> => {
        const { data } = await api.get<{ data: LensData[] }>(
            `/resource/${resource}/lenses`
        );
        return data.data;
    },

    /**
     * Belirli bir lens'in verilerini getirir
     * @param resource - Resource adı
     * @param lens - Lens slug'ı
     * @param params - Query parametreleri (sayfa, arama, sıralama vb.)
     * @returns Lens response verisi
     */
    getLensData: async (
        resource: string,
        lens: string,
        params: LensQueryParams
    ): Promise<LensResponse> => {
        // Query parametrelerini oluştur
        const queryParams: Record<string, any> = {};

        if (params.page) queryParams.page = params.page;
        if (params.per_page) queryParams.per_page = params.per_page;
        if (params.search) queryParams.search = params.search;
        if (params.sort_by) queryParams.sort_by = params.sort_by;
        if (params.sort_order) queryParams.sort_order = params.sort_order;
        if (params.filters) queryParams.filters = params.filters;
        if (params.view === "grid") queryParams.view = "grid";

        const queryString = qs.stringify(queryParams, {
            encode: true,
            encodeValuesOnly: true,
            skipNulls: true,
        });

        const { data } = await api.get<LensResponse>(
            `/resource/${resource}/lens/${lens}${queryString ? `?${queryString}` : ''}`
        );
        return data;
    },

    /**
     * Bir lens için kartları getirir
     * @param resource - Resource adı
     * @param lens - Lens slug'ı
     * @returns Kart listesi
     */
    getLensCards: async (resource: string, lens: string): Promise<any[]> => {
        const { data } = await api.get<{ data: any[] }>(
            `/resource/${resource}/lens/${lens}/cards`
        );
        return data.data;
    },
};

function toFormData(data: any): FormData {
    const formData = new FormData();

    const appendValue = (key: string, value: any) => {
        if (value === undefined) return;

        if (value === null) {
            // Multipart cannot represent null directly. Empty string is treated as clear signal for nullable relation/file fields.
            formData.append(key, "");
            return;
        }

        if (value instanceof File) {
            formData.append(key, value);
            return;
        }

        if (value instanceof Date) {
            formData.append(key, value.toISOString());
            return;
        }

        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }

        formData.append(key, String(value));
    };

    Object.keys(data).forEach((key) => {
        const value = data[key];
        if (Array.isArray(value)) {
            value.forEach((v) => {
                appendValue(`${key}[]`, v);
            });
            return;
        }

        appendValue(key, value);
    });
    return formData;
}

function shouldUseMultipart(data: Record<string, any>): boolean {
    return Object.values(data).some(hasFileValue);
}

function hasFileValue(value: any): boolean {
    if (value instanceof File) {
        return true;
    }

    if (Array.isArray(value)) {
        return value.some(hasFileValue);
    }

    if (value && typeof value === "object" && !(value instanceof Date)) {
        return Object.values(value).some(hasFileValue);
    }

    return false;
}
