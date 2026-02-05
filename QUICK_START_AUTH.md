# Quick Start - CSRF Token and Auth Control

## What Was Implemented

✅ **CSRF Token Protection** - All non-GET requests include CSRF tokens
✅ **Auth Control** - Authentication via `/auth/me` endpoint
✅ **Error Handling** - 401/403 responses handled automatically
✅ **Session Management** - Session checked on app initialization

## How to Use

### 1. Login

```typescript
// User submits email and password
// Frontend sends: POST /api/auth/login
// Backend returns: { user, token, csrf_token }
// Frontend stores: token in localStorage, csrf_token in cookie
```

### 2. Make Requests

```typescript
import api from '@/lib/axios';

// GET request (no CSRF token)
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

### 3. Check Auth Status

```typescript
import { useAuthStore } from '@/stores/auth';

function MyComponent() {
    const { user, isAuthenticated } = useAuthStore();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return <div>Welcome, {user?.name}</div>;
}
```

### 4. Logout

```typescript
import { useAuthStore } from '@/stores/auth';

function LogoutButton() {
    const { logout } = useAuthStore();
    
    return <button onClick={logout}>Logout</button>;
}
```

## Backend Requirements

### 1. POST /api/auth/login
```json
Request: { "email": "user@example.com", "password": "password" }
Response: { "user": {...}, "token": "...", "csrf_token": "..." }
```

### 2. GET /api/auth/me
```
Headers: Authorization: Bearer <token>
Response: { "user": {...}, "csrf_token": "..." }
```

### 3. POST /api/auth/logout
```
Headers: Authorization: Bearer <token>, X-CSRF-Token: <token>
Response: 200 OK
```

### 4. Validate CSRF Token
- Check `X-CSRF-Token` header in all non-GET requests
- Compare with token stored on backend
- Return 403 if invalid

### 5. Validate Auth Token
- Check `Authorization: Bearer <token>` header
- Validate token signature and expiration
- Return 401 if invalid

## How It Works

### CSRF Token Flow
```
1. API Response → Extract x-csrf-token header
2. Store in XSRF-TOKEN cookie
3. Next Request → Add X-CSRF-Token header
4. Backend validates CSRF token
```

### Auth Token Flow
```
1. Login → Get token from backend
2. Store in localStorage
3. Every Request → Add Authorization: Bearer <token> header
4. Backend validates auth token
```

### Error Handling
```
401 Unauthorized → Logout and redirect to /login
403 Forbidden → Redirect to /unauthorized
```

## Files Modified

- `web/src/lib/axios.ts` - CSRF and auth token handling
- `web/src/stores/auth.ts` - Auth state management
- `web/src/pages/auth/login.tsx` - Login page
- `web/src/App.tsx` - Routing

## Testing

### Test CSRF Token
1. Make POST request
2. Check request headers for `X-CSRF-Token`
3. Verify token matches cookie value

### Test Auth Token
1. Login with valid credentials
2. Check localStorage for `auth_token`
3. Check request headers for `Authorization: Bearer <token>`
4. Logout and verify token is cleared

### Test Error Handling
1. Send request with invalid token → Should get 401
2. Should redirect to /login
3. Send request without permission → Should get 403
4. Should redirect to /unauthorized

## Documentation

- `CSRF_AND_AUTH_IMPLEMENTATION.md` - Comprehensive guide
- `CSRF_AUTH_IMPLEMENTATION_SUMMARY.md` - Quick reference
- `TASK_5_COMPLETION_SUMMARY.md` - Task summary
- `IMPLEMENTATION_VERIFICATION.md` - Verification checklist

## Status

✅ **READY FOR BACKEND INTEGRATION**

All frontend code is complete and ready to work with backend endpoints.
