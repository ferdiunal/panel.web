/**
 * Zustand store for authentication
 * Manages user authentication state, current user, and auth status
 */

import { create } from 'zustand';
import type { User } from '@/types';

export interface AuthStoreState {
  // Auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;
  initialize: (user: User | null, token: string | null) => void;

  // Selectors (for memoization)
  selectUser: () => User | null;
  selectIsAuthenticated: () => boolean;
  selectLoading: () => boolean;
  selectError: () => Error | null;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  
  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  initialize: (user, token) => {
    set({
      user,
      token,
      isAuthenticated: !!user && !!token,
    });
  },

  // Selectors (for memoization)
  selectUser: () => get().user,
  selectIsAuthenticated: () => get().isAuthenticated,
  selectLoading: () => get().loading,
  selectError: () => get().error,
}));

// Selector hooks for memoization
export const useAuthUser = () => useAuthStore((state) => state.selectUser());
export const useIsAuthenticated = () => useAuthStore((state) => state.selectIsAuthenticated());
export const useAuthLoading = () => useAuthStore((state) => state.selectLoading());
export const useAuthError = () => useAuthStore((state) => state.selectError());

// Combined auth state selector
export const useAuthState = () =>
  useAuthStore((state) => ({
    user: state.selectUser(),
    isAuthenticated: state.selectIsAuthenticated(),
    loading: state.selectLoading(),
    error: state.selectError(),
  }));
