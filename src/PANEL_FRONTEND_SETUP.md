# Panel Frontend - Project Setup

## Overview

Panel Frontend is a React-based single-page component library that provides a unified interface for managing resources through CRUD operations. This document describes the project structure and setup completed in Task 1.

## Project Structure

```
web/src/
├── components/
│   ├── panel/              # Panel-specific components (to be created)
│   │   └── index.ts
│   └── ui/                 # shadcn/ui components (pre-configured)
├── hooks/
│   ├── index.ts            # Hook exports
│   ├── useResourceQuery.ts # React Query hooks for fetching
│   ├── useResourceMutation.ts # React Query hooks for mutations
│   └── ...                 # Other existing hooks
├── lib/
│   ├── index.ts            # Library exports
│   ├── api-client.ts       # API client with error handling
│   ├── query-client.ts     # React Query client configuration
│   └── ...                 # Other existing utilities
├── stores/
│   ├── index.ts            # Store exports
│   ├── resource-store.ts   # Zustand store for resource management
│   └── ...                 # Other existing stores
├── types/
│   ├── index.ts            # Core TypeScript types
│   └── schemas.ts          # Zod validation schemas
├── utils/
│   ├── index.ts            # Utility exports
│   ├── panel-utils.ts      # Panel-specific utilities
│   └── ...                 # Other existing utilities
└── PANEL_FRONTEND_SETUP.md # This file
```

## Core Types

### Resource Types

All resources extend the base `Resource` interface:

- **User**: Manages user data with fields like name, email, role, status, phone, address, etc.
- **Product**: Manages product data with fields like name, description, price, category, sku, stock, etc.
- **Post**: Manages post data with fields like title, content, author, status, published_at, etc.
- **Category**: Manages category data with fields like name, description, slug, status, etc.

### Field Types

Supported field types for forms:
- `text`: Text input
- `textarea`: Multi-line text input
- `email`: Email input with validation
- `url`: URL input with validation
- `password`: Password input with visibility toggle
- `number`: Number input with increment/decrement
- `select`: Dropdown select
- `date`: Date picker
- `datetime`: Date and time picker
- `switch`: Toggle switch

### Relation Types

Supported relation types:
- `belongs_to`: Single related resource
- `has_many`: Multiple related resources
- `has_one`: Single one-to-one relationship
- `belongs_to_many`: Many-to-many relationship
- `morph_to`: Polymorphic relationship

## Zod Validation Schemas

Zod schemas are defined for each resource type in `types/schemas.ts`:

- **UserSchema**: Validates user data with email format and required fields
- **ProductSchema**: Validates product data with positive price requirement
- **PostSchema**: Validates post data with required title and content
- **CategorySchema**: Validates category data with required name and slug

Helper functions:
- `validateData()`: Validates data against a schema and returns errors
- `getSchema()`: Gets the schema for a resource type

## React Query Configuration

React Query client is configured in `lib/query-client.ts` with:

- **Retry Logic**: Exponential backoff with max 3 retries for queries, 2 for mutations
- **Cache Settings**: 5-minute stale time, 10-minute garbage collection time
- **Refetch Settings**: Refetch on window focus, reconnect, and mount
- **Error Handling**: Automatic 401 redirect to login

## API Client

The API client in `lib/api-client.ts` provides:

- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Error Handling**: Consistent error formatting with message, code, and details
- **Authorization**: Token management with Bearer scheme
- **Interceptors**: Response interceptor for 401 handling

## Zustand Store

The resource store in `stores/resource-store.ts` manages:

### State
- `resources`: Array of resource records
- `currentResource`: Currently selected resource
- `loading`: Loading state
- `error`: Error state
- `page`, `pageSize`, `total`: Pagination state
- `searchQuery`, `filters`: Search and filter state
- `sortBy`, `sortOrder`: Sort state
- `formOpen`, `formMode`: Form modal state
- `detailOpen`: Detail modal state
- `confirmOpen`, `confirmMessage`, `confirmAction`: Confirmation dialog state

### Actions
- `setResources()`, `setCurrentResource()`: Set resource data
- `setLoading()`, `setError()`: Set loading/error states
- `setPage()`, `setPageSize()`, `setTotal()`: Set pagination
- `setSearchQuery()`, `setFilters()`: Set search/filters
- `setSortBy()`: Set sort order
- `openForm()`, `closeForm()`: Manage form modal
- `openDetail()`, `closeDetail()`: Manage detail modal
- `openConfirm()`, `closeConfirm()`: Manage confirmation dialog

### Selectors
Memoized selectors for preventing unnecessary re-renders:
- `selectResources()`: Get all resources
- `selectLoading()`: Get loading state
- `selectError()`: Get error state
- `selectPaginatedResources()`: Get paginated resources
- `selectCurrentResource()`: Get current resource
- `selectFormOpen()`: Get form modal state
- `selectFormMode()`: Get form mode
- `selectDetailOpen()`: Get detail modal state
- `selectConfirmOpen()`: Get confirmation dialog state

### Selector Hooks
Convenience hooks for using selectors:
- `useResources()`: Get all resources
- `useResourcesLoading()`: Get loading state
- `useResourcesError()`: Get error state
- `usePaginatedResources()`: Get paginated resources
- `useCurrentResource()`: Get current resource
- `useFormOpen()`: Get form modal state
- `useFormMode()`: Get form mode
- `useDetailOpen()`: Get detail modal state
- `useConfirmOpen()`: Get confirmation dialog state
- `usePagination()`: Get pagination info
- `useSearchAndFilters()`: Get search and filters
- `useSort()`: Get sort info

## React Query Hooks

### useResourceQuery
Fetches a list of resources with pagination, search, filters, and sorting:

```typescript
const { data, isLoading, error } = useResourceQuery('user', {
  page: 1,
  pageSize: 10,
  search: 'john',
  filters: { status: 'active' },
  sortBy: 'name',
  sortOrder: 'asc',
});
```

### useSingleResourceQuery
Fetches a single resource by ID:

```typescript
const { data, isLoading, error } = useSingleResourceQuery('user', userId);
```

### useCreateResourceMutation
Creates a new resource:

```typescript
const { mutate, isPending } = useCreateResourceMutation('user', {
  onSuccess: (data) => console.log('Created:', data),
  onError: (error) => console.error('Error:', error),
});

mutate({ name: 'John', email: 'john@example.com', ... });
```

### useUpdateResourceMutation
Updates an existing resource:

```typescript
const { mutate, isPending } = useUpdateResourceMutation('user', userId, {
  onSuccess: (data) => console.log('Updated:', data),
  onError: (error) => console.error('Error:', error),
});

mutate({ name: 'Jane', email: 'jane@example.com', ... });
```

### useDeleteResourceMutation
Deletes a resource:

```typescript
const { mutate, isPending } = useDeleteResourceMutation('user', {
  onSuccess: () => console.log('Deleted'),
  onError: (error) => console.error('Error:', error),
});

mutate(userId);
```

## Utility Functions

Panel-specific utilities in `utils/panel-utils.ts`:

- `getDisplayValue()`: Format any value for display
- `formatDate()`: Format date for display
- `formatDateTime()`: Format date and time for display
- `getResourceTypeLabel()`: Get human-readable resource type label
- `getStatusColor()`: Get badge color for status
- `isRelationField()`: Check if field is a relation field
- `isRegularField()`: Check if field is a regular field
- `getFieldComponentType()`: Get component type for field
- `mergeResourceData()`: Merge form data with existing resource
- `extractErrors()`: Extract errors from API response
- `buildQueryString()`: Build query string from filters
- `debounce()`: Debounce function
- `throttle()`: Throttle function

## shadcn/ui Components

The following shadcn/ui components are pre-configured and available:

- **Sheet**: Side panel for forms
- **Drawer**: Slide-out panel for forms
- **Dialog**: Modal dialog for confirmations
- **Input**: Text input field
- **Select**: Dropdown select
- **Calendar**: Date picker
- **Button**: Action button
- **Card**: Card container
- **Table**: Data table
- **Pagination**: Pagination controls
- **Skeleton**: Loading skeleton
- **Alert**: Alert messages
- **Badge**: Status badges
- **Checkbox**: Checkbox input
- **Radio**: Radio button input
- **Switch**: Toggle switch
- **Textarea**: Multi-line text input
- **And many more...**

## Next Steps

The following tasks will build on this foundation:

1. **Task 2**: Create Zustand stores with selectors
2. **Task 3**: Implement field components
3. **Task 4**: Implement relation field components
4. **Task 5**: Implement IndexView component
5. **Task 6**: Implement FormView component
6. **Task 7**: Implement DetailView component
7. **Task 8**: Checkpoint - Ensure all core components pass tests
8. **Task 9-12**: Implement resource-specific components (User, Product, Post, Category)
9. **Task 13-16**: Implement error handling, responsive design, performance optimizations, and React Query integration
10. **Task 17-19**: Final checkpoints and integration

## Requirements Covered

This setup covers the following requirements:

- **Requirement 15.1**: TypeScript type safety with fully typed components and stores
- **Requirement 15.2**: TypeScript type safety with fully typed stores and actions
- **Requirement 16.1**: React Query integration for data fetching with proper caching and retry logic

## Testing

Unit tests and property-based tests will be added in subsequent tasks to validate:

- Store initialization and state updates
- Selector memoization
- Field component rendering
- Form validation
- Index view display and filtering
- Detail view display
- Error handling
- Responsive design
- Performance optimizations
- React Query integration

## Configuration Files

- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build configuration
- `components.json`: shadcn/ui configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `package.json`: Project dependencies

All dependencies are already installed and configured.
