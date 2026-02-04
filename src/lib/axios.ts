import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

/**
 * Set CSRF token in cookie
 */
function setCsrfCookie(token: string) {
    document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict`;
}

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

// Request interceptor: Add CSRF token and auth token
api.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    
    // Add CSRF token to non-GET requests
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
        }
    }

    // Add auth token if available
    const authToken = getAuthToken();
    if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
});

// Response interceptor: Extract CSRF token and handle auth errors
api.interceptors.response.use(
    (response) => {
        // Extract CSRF token from response headers if present
        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
            setCsrfCookie(csrfToken);
        }
        return response;
    },
    (error) => {
        // Handle unauthorized - redirect to login
        if (error.response?.status === 401) {
            clearAuthToken();
            window.location.href = '/login';
        }

        // Handle forbidden
        if (error.response?.status === 403) {
            window.location.href = '/unauthorized';
        }

        return Promise.reject(error);
    }
);

export default api;
export { getCsrfToken, setCsrfCookie, getAuthToken, setAuthToken, clearAuthToken };
