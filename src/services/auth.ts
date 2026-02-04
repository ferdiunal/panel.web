/**
 * Authentication Service
 * Handles user authentication and authorization
 */

import { apiClient } from '@/lib/api-client';
import type { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  csrf_token: string;
}

export interface MeResponse {
  user: User;
  csrf_token?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/auth/sign-in/email', credentials);
      
      // Backend returns session and user
      const token = response.session?.token;
      const user = response.user || response.session?.user;

      // Set auth token
      if (token) {
        apiClient.setAuthToken(token);
        localStorage.setItem('auth_token', token);
      }

      return {
        user: user,
        token: token || '',
        csrf_token: '',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register user
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<any>('/auth/sign-up/email', data);
      
      // Backend returns user
      const user = response.user;

      return {
        user: user,
        token: '',
        csrf_token: '',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user (me endpoint)
   * Auth controlled - requires valid token
   */
  async getMe(): Promise<MeResponse> {
    try {
      const response = await apiClient.get<any>('/auth/session');
      
      return {
        user: response.user,
        csrf_token: '',
      };
    } catch (error) {
      // If 401, clear auth
      if ((error as any)?.response?.status === 401) {
        this.logout();
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/sign-out', {});
    } catch (error) {
      // Ignore errors on logout
    } finally {
      // Clear local auth state
      apiClient.clearAuthToken();
      localStorage.removeItem('auth_token');
      // Don't redirect, let the app handle it
    }
  }

  /**
   * Refresh auth token
   */
  async refreshToken(): Promise<LoginResponse> {
    try {
      // Backend doesn't have refresh endpoint, use session endpoint
      const response = await apiClient.get<any>('/auth/session');
      
      const token = response.session?.token;
      if (token) {
        apiClient.setAuthToken(token);
        localStorage.setItem('auth_token', token);
      }

      return {
        user: response.user,
        token: token || '',
        csrf_token: '',
      };
    } catch (error) {
      // If refresh fails, logout
      this.logout();
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token && apiClient.getAuthToken() !== null;
  }

  /**
   * Initialize auth from localStorage
   */
  initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.setAuthToken(token);
    }
  }

  /**
   * Get stored auth token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
