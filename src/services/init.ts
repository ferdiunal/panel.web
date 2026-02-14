import api from "@/lib/axios";

export interface Features {
    register: boolean;
    forgot_password: boolean;
}

export interface OAuthConfig {
    google: boolean;
}

export interface I18nConfig {
    lang: string;
    direction: 'ltr' | 'rtl';
    supported_languages: Array<{
        code: string;
        name: string;
    }>;
    default_language: string;
    use_url_prefix: boolean;
    url_prefix_optional: boolean;
}

export interface InitResponse {
    features: Features;
    oauth: OAuthConfig;
    i18n: I18nConfig;
    theme: string;
    version: string;
    settings?: Record<string, any>;
}

export const initService = {
    fetchInit: async (): Promise<InitResponse> => {
        const { data } = await api.get<InitResponse>("/init");
        return data;
    },
};
