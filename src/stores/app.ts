
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
    features: {},
    isLoading: true,
    init: async () => {
        try {
            const { data } = await api.get('/init');
            const result = {
                settings: data.settings || {},
                features: data.features || {},
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
