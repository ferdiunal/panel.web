import api from "@/lib/axios";

export interface NavItem {
    slug: string;
    title: string;
    icon: string;
    group: string;
    type: "resource" | "page";
    order: number;
    url: string;
}

export interface NavigationResponse {
    data: NavItem[];
}

export const navigationService = {
    fetchNavigation: async (): Promise<NavItem[]> => {
        const { data } = await api.get<NavigationResponse>("/navigation");
        return data.data;
    },
};
