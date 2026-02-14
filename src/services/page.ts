import api from "@/lib/axios";
import type { PageResponse, PageListResponse } from "@/types";

export const pageService = {
    /**
     * Fetch all available pages
     */
    fetchPages: async (): Promise<PageListResponse> => {
        const { data } = await api.get<PageListResponse>(`/pages`);
        return data;
    },

    /**
     * Fetch a specific page with its fields and cards
     */
    fetchPage: async (slug: string): Promise<PageResponse> => {
        const { data } = await api.get<PageResponse>(`/pages/${slug}`);
        return data;
    },

    /**
     * Save page data
     * Automatically uses FormData when file uploads are detected
     */
    savePage: async (slug: string, data: any) => {
        // Check if any value is a File instance
        const hasFiles = Object.values(data).some((v) => v instanceof File);

        if (hasFiles) {
            // Convert to FormData for file uploads
            const formData = new FormData();
            for (const [key, value] of Object.entries(data)) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            }

            const response = await api.post(`/pages/${slug}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }

        // Standard JSON request
        const response = await api.post(`/pages/${slug}`, data);
        return response.data;
    },
};
