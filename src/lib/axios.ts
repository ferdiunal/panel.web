import axios from 'axios';
import { invalidateSessionCache } from '@/lib/session-cache';

const MUTATION_METHODS = new Set(['post', 'put', 'patch', 'delete']);
const LOCAL_BASE_URL = 'http://localhost';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

const api = axios.create({
    baseURL: '/api/internal',
    withCredentials: true, // Include HTTPOnly cookies automatically
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
    },
});

const csrfInitClient = axios.create({
    baseURL: '/api/internal',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

let latestCsrfToken: string | null = null;

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

function normalizeRequestPath(url?: string): string | null {
    if (!url) return null;

    try {
        return new URL(url, LOCAL_BASE_URL).pathname;
    } catch {
        return url.split('?')[0] || null;
    }
}

function isInitEndpoint(url?: string): boolean {
    const pathname = normalizeRequestPath(url);

    return pathname === '/init' || pathname === '/api/internal/init';
}

function shouldInitializeCsrf(method?: string, url?: string): boolean {
    if (!method || !MUTATION_METHODS.has(method)) {
        return false;
    }

    return !isInitEndpoint(url);
}

function extractHeaderValue(headers: any, name: string): string | null {
    if (!headers) return null;

    const getHeader =
        typeof headers.get === 'function'
            ? headers.get(name)
            : headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];

    const value = Array.isArray(getHeader) ? getHeader[0] : getHeader;

    if (typeof value === 'string' && value.trim().length > 0) {
        return value;
    }

    return null;
}

async function initializeCsrf(authToken: string | null): Promise<string | null> {
    const response = await csrfInitClient.get('/init', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });

    const csrfToken = extractHeaderValue(response.headers, CSRF_HEADER_NAME);
    if (csrfToken) {
        latestCsrfToken = csrfToken;
    }

    return latestCsrfToken;
}

// Request interceptor: Add auth token
api.interceptors.request.use(async (config) => {
    // Add auth token if available
    const authToken = getAuthToken();
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (shouldInitializeCsrf(config.method?.toLowerCase(), config.url)) {
        const csrfToken = await initializeCsrf(authToken);
        if (csrfToken) {
            config.headers[CSRF_HEADER_NAME] = csrfToken;
        }
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
            latestCsrfToken = null;
        }

        // Diğer error'lar için sadece reject et
        // Loader'lar veya error boundary'ler handle edecek
        return Promise.reject(error);
    }
);

export default api;
export { getAuthToken, setAuthToken, clearAuthToken };
