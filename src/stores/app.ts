
import { create } from 'zustand';
import api from '@/lib/axios';

interface AppState {
    settings: Record<string, any>;
    features: Record<string, boolean>;
    isLoading: boolean;
    init: () => Promise<{ settings: Record<string, any>, features: Record<string, boolean> } | null>;
}

export const useAppStore = create<AppState>((set) => ({
    settings: {},
    features: {
        register: true,
        forgot_password: false,
    },
    isLoading: true,
    init: async () => {
        try {
            const { data } = await api.get('/init');
            
            // Extract features from backend response
            const backendFeatures = data.features || {};
            
            // Extract settings and convert to flat structure
            const settingsObj = data.settings || {};
            const flatSettings: Record<string, any> = {};
            
            // Convert settings from { key: { value: ... } } to { key: ... }
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
