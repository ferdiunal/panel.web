import { create } from 'zustand';
import api from '@/lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    checkSession: () => Promise<void>;
    login: (user: User) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    checkSession: async () => {
        try {
            const { data } = await api.get('/auth/session');
            if (data.session) {
                set({ user: data.user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    login: (user) => set({ user, isAuthenticated: true }),
    logout: async () => {
        try {
            await api.post('/auth/sign-out');
        } catch (e) {
            // ignore
        }
        set({ user: null, isAuthenticated: false });
    }
}));
