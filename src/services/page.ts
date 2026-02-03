import api from "@/lib/axios";
import type { FieldData } from "@/types";

export interface PageResponse {
    slug: string;
    title: string;
    meta: {
        widgets: any[];
        fields: FieldData[];
    };
}

export const pageService = {
    fetchPage: async (slug: string): Promise<PageResponse> => {
        const { data } = await api.get<PageResponse>(`/pages/${slug}`);
        return data;
    },

    savePage: async (slug: string, data: any) => {
        const response = await api.post(`/pages/${slug}`, data);
        return response.data;
    },
};
