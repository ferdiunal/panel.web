import axios from 'axios';
import { invalidateSessionCache } from '@/lib/session-cache';

const api = axios.create({
    baseURL: '/api',
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

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
}

/**
 * Set auth token in localStorage
 */
function setAuthToken(token: string) {
    localStorage.setItem('auth_token', token);
}

/**
 * Clear auth token from localStorage
 */
function clearAuthToken() {
    localStorage.removeItem('auth_token');
}

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
    // Add auth token if available
    const authToken = getAuthToken();
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});

// Response interceptor: Handle HTTP errors
// Error'ları React Router error boundary'lerine iletmek için sadece reject ediyoruz
// Redirect işlemleri loader'larda yapılacak
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        // 401 için özel handling - auth store'u güncelle ve session cache'i sıfırla
        // Loader catch edip redirect yapacak
        if (status === 401) {
            clearAuthToken();
            invalidateSessionCache();
        }

        // Diğer error'lar için sadece reject et
        // Loader'lar veya error boundary'ler handle edecek
        return Promise.reject(error);
    }
);

export default api;
export { getAuthToken, setAuthToken, clearAuthToken };
