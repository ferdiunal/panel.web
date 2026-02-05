import api from "@/lib/axios";
import type { ResourceResponse, FieldData } from "@/types";
import type { ResourceParams } from "@/lib/resource-params";
import qs from "qs";

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

        // Add pagination
        queryParams[resource].page = params.page;
        queryParams[resource].per_page = params.per_page;

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
        const { data } = await api.get<{ fields: FieldData[] }>(`/resource/${resource}/${id}/edit`);
        return data.fields;
    },

    getDetailFields: async (resource: string, id: string | number) => {
        const { data } = await api.get<{ fields: FieldData[] }>(`/resource/${resource}/${id}/detail`);
        return data.fields;
    },

    createResource: async (resource: string, data: any) => {
        const formData = toFormData(data);
        const response = await api.post(`/resource/${resource}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    updateResource: async (resource: string, id: string | number, data: any) => {
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

    getCards: async (resource: string) => {
        const { data } = await api.get<{ data: any[] }>(`/resource/${resource}/cards`);
        return data.data;
    },
};

function toFormData(data: any): FormData {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null) return;

        // If it's a File object (browser), append directly
        if (value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            // Handle arrays if needed (e.g. key[])
            value.forEach((v) => formData.append(`${key}[]`, v));
        } else if (typeof value === 'object' && !(value instanceof Date)) {
            // Handle nested objects if necessary, or just JSON stringify
            // For simple resource forms, usually flat.
            // If complex, maybe JSON stringify? But multipart usually expects flat keys.
            // Let's assume flat for now or stringify.
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });
    return formData;
}
