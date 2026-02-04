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
     */
    savePage: async (slug: string, data: any) => {
        const response = await api.post(`/pages/${slug}`, data);
        return response.data;
    },
};
