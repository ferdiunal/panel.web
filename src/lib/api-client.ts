/**
 * API Client for Panel Frontend
 * Handles HTTP requests with proper error handling and auth
 * CSRF tokens are handled automatically by axios (withXSRFToken: true)
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      withCredentials: true, // Include HTTPOnly cookies automatically
      withXSRFToken: true, // Enable axios built-in CSRF token handling
      xsrfHeaderName: 'X-CSRF-Token', // Header name for CSRF token
      xsrfCookieName: 'csrf_token', // Cookie name to read token from
      headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use((config) => {
      // Add auth token if available
      if (this.authToken) {
        config.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle unauthorized - redirect to login
        if (error.response?.status === 401) {
          this.clearAuthToken();
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
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
}

export const apiClient = new ApiClient();
