/**
 * App Store
 *
 * Uygulama ayarları ve özelliklerini yöneten merkezi store.
 *
 * ## Kullanım
 *
 * ### Ayarları okuma:
 * ```tsx
 * const { settings, features } = useAppStore();
 * ```
 *
 * ### Loader'da init çağrısı:
 * ```ts
 * // İlk çağrıda API'ye gider, sonraki çağrılarda cache'ten döner.
 * // Uygulama ayarları oturum boyunca değişmez.
 * await useAppStore.getState().init();
 * ```
 *
 * ### Önbellek davranışı:
 * ```
 * İlk çağrı            → API isteği atar (/api/init), sonucu store'a yazar
 * Sonraki çağrılar      → API'ye gitmez, mevcut state'i döner (isInitialized = true)
 * init(true) ile çağrı  → Cache'i atlar, API'ye tekrar gider (zorla yenileme)
 * ```
 */
import { create } from 'zustand';
import api from '@/lib/axios';

interface AppState {
    settings: Record<string, any>;
    features: Record<string, boolean>;
    isLoading: boolean;
    /**
     * Uygulama ayarlarını yükler.
     *
     * @param forceRefresh - true ise cache'i atlayıp API'den tekrar çeker
     * @returns Ayarlar ve özellikler objesi veya null (hata durumunda)
     *
     * Varsayılan davranış: İlk çağrıda API'ye gider,
     * sonraki çağrılarda mevcut state'i döner.
     * Oturum boyunca site ayarları değişmediği için
     * tekrar tekrar API'ye gitmeye gerek yok.
     */
    init: (forceRefresh?: boolean) => Promise<{ settings: Record<string, any>, features: Record<string, boolean> } | null>;
}

/**
 * Init edildi mi flag'i.
 * Store dışında tutulur — render'a etki etmemeli.
 */
let isInitialized = false;

export const useAppStore = create<AppState>((set, get) => ({
    settings: {},
    features: {
        register: true,
        forgot_password: false,
    },
    isLoading: true,
    init: async (forceRefresh = false) => {
        // Daha önce init edildiyse ve zorla yenileme istenmiyorsa
        // API'ye gitme, mevcut state'i döndür
        if (isInitialized && !forceRefresh) {
            const { settings, features } = get();
            return { settings, features };
        }

        try {
            const { data } = await api.get('/init');
            
            // Backend'den gelen features
            const backendFeatures = data.features || {};
            
            // Settings'i düz yapıya çevir
            const settingsObj = data.settings || {};
            const flatSettings: Record<string, any> = {};
            
            // { key: { value: ... } } → { key: ... } dönüşümü
            Object.entries(settingsObj).forEach(([key, val]: [string, any]) => {
                if (val && typeof val === 'object' && 'value' in val) {
                    flatSettings[key] = val.value;
                } else {
                    flatSettings[key] = val;
                }
            });
            
            const result = {
                settings: flatSettings,
                features: {
                    register: backendFeatures.register !== undefined ? backendFeatures.register : true,
                    forgot_password: backendFeatures.forgot_password !== undefined ? backendFeatures.forgot_password : false,
                },
            };
            
            // Başarılı — state güncelle ve cache flag'ini set et
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
