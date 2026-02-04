/**
 * API Client for Panel Frontend
 * Handles HTTP requests with proper error handling, CSRF tokens, and auth
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private csrfToken: string | null = null;
  private authToken: string | null = null;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Include cookies in requests
    });

    // Add request interceptor for CSRF token and auth
    this.client.interceptors.request.use((config) => {
      // Add CSRF token to non-GET requests
      if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
        if (this.csrfToken) {
          config.headers['X-CSRF-Token'] = this.csrfToken;
        }
      }

      // Add auth token if available
      if (this.authToken) {
        config.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      return config;
    });

    // Add response interceptor for error handling and CSRF token extraction
    this.client.interceptors.response.use(
      (response) => {
        // Extract CSRF token from response headers if present
        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
          this.csrfToken = csrfToken;
          // Also store in cookie for future requests
          this.setCsrfCookie(csrfToken);
        }
        return response;
      },
      (error) => {
        // Handle unauthorized - redirect to login
        if (error.response?.status === 401) {
          this.clearAuthToken();
          window.location.href = '/login';
        }

        // Handle forbidden
        if (error.response?.status === 403) {
          window.location.href = '/unauthorized';
        }

        return Promise.reject(error);
      }
    );

    // Load CSRF token from cookie on initialization
    this.loadCsrfTokenFromCookie();
  }

  /**
   * Load CSRF token from cookie
   */
  private loadCsrfTokenFromCookie() {
    const token = this.getCookie('XSRF-TOKEN');
    if (token) {
      this.csrfToken = token;
    }
  }

  /**
   * Set CSRF token in cookie
   */
  private setCsrfCookie(token: string) {
    document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict`;
  }

  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any): ApiError {
    if (error?.response?.data) {
      const data = error.response.data as any;
      return {
        message: data?.message || error.message || 'An error occurred',
        code: error.response?.status?.toString(),
        details: data?.errors || undefined,
      };
    }
    return {
      message: error?.message || 'An error occurred',
    };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string) {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearAuthToken() {
    this.authToken = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Set CSRF token manually
   */
  setCsrfToken(token: string) {
    this.csrfToken = token;
    this.setCsrfCookie(token);
  }

  /**
   * Get current CSRF token
   */
  getCsrfToken(): string | null {
    return this.csrfToken;
  }
}

export const apiClient = new ApiClient();
