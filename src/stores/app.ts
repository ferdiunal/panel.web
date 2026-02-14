/**
 * App Store
 *
 * Uygulama ayarları ve özelliklerini yöneten merkezi store.
 *
 * ## Kullanım
 *
 * ### Ayarları okuma:
 * ```tsx
 * const { settings, features, i18n } = useAppStore();
 * ```
 *
 * ### Loader'da init çağrısı:
 * ```ts
 * // window.Init'ten veriyi okur, API çağrısı yapmaz.
 * await useAppStore.getState().init();
 * ```
 *
 * ### Veri kaynağı:
 * ```
 * Backend, index.html'e window.Init = {...} olarak init verisini inject eder.
 * Bu store, window.Init'ten veriyi okur — ekstra API çağrısı gerekmez.
 * init(true) ile çağrı → window.Init'i tekrar okur (zorla yenileme)
 * ```
 */
import { create } from 'zustand';
import type { I18nConfig } from '@/services/init';

declare global {
    interface Window {
        Init?: {
            features?: Record<string, boolean>;
            oauth?: Record<string, boolean>;
            i18n?: I18nConfig;
            theme?: string;
            version?: string;
            settings?: Record<string, any>;
            translations?: Record<string, string>;
        };
    }
}

interface AppState {
    settings: Record<string, any>;
    features: Record<string, boolean>;
    i18n: I18nConfig | null;
    isLoading: boolean;
    /**
     * Uygulama ayarlarını window.Init'ten yükler.
     *
     * @param forceRefresh - true ise cache'i atlayıp tekrar okur
     * @returns Ayarlar, özellikler ve i18n objesi veya null (hata durumunda)
     */
    init: (forceRefresh?: boolean) => Promise<{
        settings: Record<string, any>,
        features: Record<string, boolean>,
        i18n: I18nConfig | null
    } | null>;
}

let isInitialized = false;

export const useAppStore = create<AppState>((set, get) => ({
    settings: {},
    features: {
        register: true,
        forgot_password: false,
    },
    i18n: null,
    isLoading: true,
    init: async (forceRefresh = false) => {
        if (isInitialized && !forceRefresh) {
            const { settings, features, i18n } = get();
            return { settings, features, i18n };
        }

        try {
            const data = window.Init;

            if (!data) {
                console.warn("window.Init bulunamadı, varsayılan değerler kullanılıyor.");
                set({ isLoading: false });
                return null;
            }

            const backendFeatures = data.features || {};

            // Settings'i düz yapıya çevir
            const settingsObj = data.settings || {};
            const flatSettings: Record<string, any> = {};

            Object.entries(settingsObj).forEach(([key, val]: [string, any]) => {
                if (val && typeof val === 'object' && 'value' in val) {
                    flatSettings[key] = val.value;
                } else {
                    flatSettings[key] = val;
                }
            });

            const i18nConfig = data.i18n || null;

            const result = {
                settings: flatSettings,
                features: {
                    register: backendFeatures.register !== undefined ? backendFeatures.register : true,
                    forgot_password: backendFeatures.forgot_password !== undefined ? backendFeatures.forgot_password : false,
                },
                i18n: i18nConfig,
            };

            isInitialized = true;
            set({
                ...result,
                isLoading: false
            });
            return result;
        } catch (error) {
            console.error("Failed to init app:", error);
            set({ isLoading: false });
            return null;
        }
    }
}));
