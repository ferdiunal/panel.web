import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
        try {
            // 1. Check Session
            await api.get('/auth/session');

            // 2. CSRF (Assuming Cookie is set by GET /auth/session or general request)
            // If strictly needed to fetch CSRF endpoint:
            // await api.get('/sanctum/csrf-cookie'); // Example if using Laravel Sanctum style
            // Assuming the session check refreshes/sets the necessary cookies for CSRF middleware.

        } catch (error) {
            // Handle session check fail (maybe let the actual request fail or redirect)
            // If session check fails, likely 401, subsequent request will also fail.
            console.error("Session check failed before mutation", error);
            throw error;
        }
    }
    return config;
});

export default api;
