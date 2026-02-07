import axios from 'axios';

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
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        // Handle different HTTP error codes
        switch (status) {
            case 401:
                // Unauthorized - redirect to login
                clearAuthToken();
                window.location.href = '/login';
                break;

            case 403:
                // Forbidden - redirect to 403 page
                window.location.href = '/403';
                break;

            case 404:
                // Not Found - redirect to 404 page
                window.location.href = '/404';
                break;

            case 500:
            case 502:
            case 503:
            case 504:
                // Server errors - redirect to 500 page
                window.location.href = '/500';
                break;

            default:
                // For other errors, just reject the promise
                // This allows components to handle specific errors
                break;
        }

        return Promise.reject(error);
    }
);

export default api;
export { getAuthToken, setAuthToken, clearAuthToken };
