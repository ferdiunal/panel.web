import { create } from 'zustand';
import api from '@/lib/axios';

interface Features {
    register: boolean;
    forgot_password: boolean;
}

interface ConfigState {
    features: Features;
    isLoading: boolean;
    fetchConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
    features: {
        register: true,
        forgot_password: true,
    },
    isLoading: true,
    fetchConfig: async () => {
        try {
            const { data } = await api.get('/init');
            set({ features: data.features, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch init config", error);
            set({ isLoading: false });
        }
    },
}));
