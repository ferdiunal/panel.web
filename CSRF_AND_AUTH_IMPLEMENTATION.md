# CSRF Token and Auth Implementation Guide

## Overview

This document explains how CSRF token protection and authentication are implemented in the Panel Frontend application.

## Architecture

### 1. CSRF Token Flow

#### How it works:
1. **Token Extraction**: CSRF tokens are extracted from API response headers (`x-csrf-token`)
2. **Token Storage**: Tokens are stored in browser cookies (`XSRF-TOKEN`)
3. **Token Injection**: Tokens are automatically injected into all non-GET requests via `X-CSRF-Token` header

#### Implementation Details:

**File**: `web/src/lib/axios.ts`

```typescript
// Get CSRF token from cookie
function getCsrfToken(): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

// Set CSRF token in cookie
function setCsrfCookie(token: string) {
    document.cookie = `XSRF-TOKEN=${token}; path=/; SameSite=Strict`;
}
```

**Request Interceptor**:
- Adds `X-CSRF-Token` header to POST, PUT, PATCH, DELETE requests
- Uses token from cookie if available

**Response Interceptor**:
- Extracts `x-csrf-token` from response headers
- Stores token in cookie for future requests

### 2. Authentication Flow

#### How it works:
1. **Login**: User submits credentials to `/auth/login` endpoint
2. **Token Response**: Backend returns auth token and CSRF token
3. **Token Storage**: Auth token stored in localStorage, CSRF token in cookie
4. **Token Injection**: Auth token injected as `Authorization: Bearer <token>` header
5. **Session Check**: `getMe()` endpoint validates token on app initialization
6. **Error Handling**: 401 responses trigger logout and redirect to login

#### Implementation Details:

**File**: `web/src/stores/auth.ts`

```typescript
export const useAuthStore = create<AuthState>((set) => ({
    // ... state
    
    checkSession: async () => {
        try {
            const { data } = await api.get('/auth/me');
            if (data.user) {
                set({ user: data.user, isAuthenticated: true, isLoading: false });
            }
        } catch (error) {
            clearAuthToken();
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    
    login: (user, token) => {
        setAuthToken(token);
        set({ user, isAuthenticated: true });
    },
    
    logout: async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (e) {
            // ignore
        }
        clearAuthToken();
        set({ user: null, isAuthenticated: false });
    },
}));
```

**File**: `web/src/pages/auth/login.tsx`

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
        const response = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
        });

        if (response.data.token && response.data.user) {
            // Set auth token in localStorage and axios
            setAuthToken(response.data.token);
            
            // Update auth store
            login(response.data.user, response.data.token);
            
            // Navigate to dashboard
            navigate('/dashboard');
        }
    } catch (err: any) {
        const message = err?.response?.data?.message || 'Login failed';
        setLocalError(message);
    }
};
```

### 3. Protected Routes

**File**: `web/src/App.tsx`

```typescript
const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) {
        return <div>Yükleniyor...</div>
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}
```

Routes wrapped with `<ProtectedRoute />` require authentication.

## API Endpoints

### Authentication Endpoints

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    },
    "token": "eyJhbGc...",
    "csrf_token": "token123"
  }
  ```

#### Get Current User (Me)
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    },
    "csrf_token": "token123"
  }
  ```

#### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`, `X-CSRF-Token: <token>`
- **Response**: `200 OK`

#### Register
- **Endpoint**: `POST /api/auth/sign-up/email`
- **Request**:
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response**: `201 Created`

### CSRF Token Headers

All non-GET requests must include:
```
X-CSRF-Token: <token>
```

The token is automatically extracted from responses and stored in the `XSRF-TOKEN` cookie.

## Error Handling

### 401 Unauthorized
- **Trigger**: Invalid or expired auth token
- **Action**: Clear auth token, redirect to `/login`
- **Implementation**: Response interceptor in `axios.ts`

### 403 Forbidden
- **Trigger**: User lacks required permissions
- **Action**: Redirect to `/unauthorized`
- **Implementation**: Response interceptor in `axios.ts`

## Security Considerations

1. **CSRF Protection**:
   - Tokens are stored in `SameSite=Strict` cookies
   - Tokens are injected into all state-changing requests
   - Tokens are refreshed on each response

2. **Auth Token Storage**:
   - Tokens stored in localStorage (accessible to JavaScript)
   - Consider using httpOnly cookies for production
   - Tokens sent via `Authorization` header (not in URL)

3. **HTTPS**:
   - All requests should use HTTPS in production
   - Cookies set with `SameSite=Strict` for CSRF protection

4. **Token Expiration**:
   - Implement token refresh mechanism
   - Handle 401 responses gracefully
   - Redirect to login on token expiration

## Usage Examples

### Making Authenticated Requests

```typescript
import api from '@/lib/axios';

// GET request (no CSRF token needed)
const users = await api.get('/api/users');

// POST request (CSRF token automatically added)
const newUser = await api.post('/api/users', {
    name: 'John Doe',
    email: 'john@example.com'
});

// PUT request (CSRF token automatically added)
const updated = await api.put('/api/users/1', {
    name: 'Jane Doe'
});

// DELETE request (CSRF token automatically added)
await api.delete('/api/users/1');
```

### Using Auth Store

```typescript
import { useAuthStore } from '@/stores/auth';

function MyComponent() {
    const { user, isAuthenticated, login, logout } = useAuthStore();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return (
        <div>
            <p>Welcome, {user?.name}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

### Protected Routes

```typescript
// In App.tsx, routes wrapped with ProtectedRoute require authentication
<ProtectedRoute>
    <DashboardLayout>
        {/* Protected pages */}
    </DashboardLayout>
</ProtectedRoute>
```

## Testing

### Test CSRF Token Flow

1. Make a GET request to any endpoint
2. Check response headers for `x-csrf-token`
3. Verify token is stored in `XSRF-TOKEN` cookie
4. Make a POST request and verify `X-CSRF-Token` header is included

### Test Auth Flow

1. Login with valid credentials
2. Verify auth token is stored in localStorage
3. Verify `Authorization` header is included in requests
4. Logout and verify token is cleared
5. Verify redirect to login on 401 response

## Troubleshooting

### CSRF Token Not Being Sent

**Issue**: POST/PUT/PATCH/DELETE requests fail with CSRF error

**Solution**:
1. Check if `XSRF-TOKEN` cookie is set
2. Verify `X-CSRF-Token` header is included in request
3. Check browser console for errors
4. Verify backend is sending `x-csrf-token` in response headers

### Auth Token Not Being Sent

**Issue**: Requests fail with 401 Unauthorized

**Solution**:
1. Check if auth token is stored in localStorage
2. Verify `Authorization` header is included in request
3. Check if token has expired
4. Verify backend is validating token correctly

### Redirect Loop

**Issue**: App redirects between login and dashboard

**Solution**:
1. Check if `checkSession()` is being called on app initialization
2. Verify `/auth/me` endpoint is working correctly
3. Check if auth token is valid
4. Clear localStorage and cookies, then login again

## Files Modified

- `web/src/lib/axios.ts` - Updated with CSRF and auth token handling
- `web/src/stores/auth.ts` - Updated with auth token management
- `web/src/pages/auth/login.tsx` - Updated with CSRF and auth token handling
- `web/src/pages/auth/unauthorized.tsx` - Added unauthorized page
- `web/src/App.tsx` - Added unauthorized route

## Next Steps

1. Test CSRF token flow with backend
2. Test auth token refresh flow
3. Implement token refresh mechanism
4. Add error handling for token expiration
5. Consider using httpOnly cookies for production
6. Add rate limiting for login attempts
7. Add two-factor authentication support
