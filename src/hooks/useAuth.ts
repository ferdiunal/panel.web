/**
 * useAuth Hook
 * Provides authentication functionality and state management
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth';
import type { LoginRequest, RegisterRequest } from '@/services/auth';

export function useAuth() {
  const store = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsInitializing(true);
        authService.initializeAuth();
        
        // Try to fetch current user
        const token = authService.getStoredToken();
        if (token) {
          try {
            const response = await authService.getMe();
            store.initialize(response.user, token);
          } catch (error) {
            // Token is invalid, clear it
            store.logout();
          }
        }
      } catch (error) {
        store.setError(error instanceof Error ? error : new Error('Failed to initialize auth'));
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [store]);

  // Login handler
  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        store.setLoading(true);
        store.setError(null);

        const response = await authService.login(credentials);
        store.setUser(response.user);
        store.setToken(response.token);
        store.setAuthenticated(true);

        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Login failed');
        store.setError(err);
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  // Register handler
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        store.setLoading(true);
        store.setError(null);

        const response = await authService.register(data);
        store.setUser(response.user);
        store.setToken(response.token);
        store.setAuthenticated(true);

        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Registration failed');
        store.setError(err);
        throw err;
      } finally {
        store.setLoading(false);
      }
    },
    [store]
  );

  // Logout handler
  const logout = useCallback(async () => {
    try {
      store.setLoading(true);
      await authService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      store.logout();
      store.setLoading(false);
    }
  }, [store]);

  // Refresh token handler
  const refreshToken = useCallback(async () => {
    try {
      store.setLoading(true);
      store.setError(null);

      const response = await authService.refreshToken();
      store.setUser(response.user);
      store.setToken(response.token);

      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Token refresh failed');
      store.setError(err);
      throw err;
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  return {
    // State
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading || isInitializing,
    error: store.error,
    isInitializing,

    // Methods
    login,
    register,
    logout,
    refreshToken,
  };
}
