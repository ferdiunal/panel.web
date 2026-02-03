import api from "@/lib/axios";

export interface Features {
    register: boolean;
    forgot_password: boolean;
}

export interface OAuthConfig {
    google: boolean;
}

export interface InitResponse {
    features: Features;
    oauth: OAuthConfig;
    version: string;
}

export const initService = {
    fetchInit: async (): Promise<InitResponse> => {
        const { data } = await api.get<InitResponse>("/init");
        return data;
    },
};
