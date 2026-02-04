import { create } from 'zustand';
import api, { setAuthToken, clearAuthToken } from '@/lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    checkSession: () => Promise<void>;
    login: (user: User, token: string) => void;
    logout: () => Promise<void>;
    setError: (error: Error | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    
    checkSession: async () => {
        try {
            const { data } = await api.get('/auth/session');
            if (!data.user) {
                throw new Error("Un Authorization")
            }
                set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error) {
            clearAuthToken();
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    
    login: (user, token) => {
        setAuthToken(token);
        set({ user, isAuthenticated: true, error: null });
    },
    
    logout: async () => {
        try {
            await api.post('/auth/sign-out', {});
        } catch (e) {
            // ignore
        }
        clearAuthToken();
        set({ user: null, isAuthenticated: false });
    },
    
    setError: (error) => set({ error }),
}));
