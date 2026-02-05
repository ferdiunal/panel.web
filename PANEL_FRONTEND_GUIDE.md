# Panel Frontend Implementation Guide

## Overview

This is a comprehensive React TypeScript frontend for a panel management system. It provides a complete CRUD interface for managing resources (Users, Products, Posts, Categories) with advanced features like validation, error handling, responsive design, and performance optimizations.

## Project Structure

```
web/src/
├── components/          # React components
│   ├── views/          # Main view components (FormView, DetailView, IndexView)
│   ├── fields/         # Form field components (TextInput, SelectField, etc.)
│   ├── ui/             # UI components (Button, Modal, etc.)
│   ├── error-display.tsx
│   ├── field-error.tsx
│   └── index.ts        # Component exports
├── hooks/              # Custom React hooks
│   ├── useErrorHandler.ts
│   ├── useResources.ts
│   ├── useVirtualization.ts
│   └── index.ts        # Hook exports
├── utils/              # Utility functions
│   ├── error-handler.ts
│   ├── memoization.ts
│   └── index.ts        # Utils exports
├── resources/          # Resource configurations
│   ├── user.ts
│   ├── product.ts
│   ├── post.ts
│   ├── category.ts
│   └── index.ts        # Resource registry
├── pages/              # Page components
│   ├── users/
│   ├── products/
│   ├── posts/
│   └── categories/
├── stores/             # Zustand stores
├── types.ts            # TypeScript type definitions
└── main.tsx            # Application entry point
```

## Core Components

### FormView
Renders a form for creating or updating resources in a responsive modal.

```typescript
import { FormView } from '@/components';

<FormView
  resourceType="user"
  mode="create"
  fields={fields}
  isOpen={isOpen}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

**Features:**
- Create and update modes
- Real-time validation with Zod schemas
- Field pre-population in update mode
- Error display and field-level error handling
- Loading states during submission
- Responsive modal (Sheet/Drawer on mobile)

### DetailView
Displays read-only resource attributes with action buttons.

```typescript
import { DetailView } from '@/components';

<DetailView
  resourceType="user"
  resource={user}
  fields={fields}
  isOpen={isOpen}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onClose={handleClose}
/>
```

**Features:**
- Read-only attribute display
- Formatted values (booleans, dates, arrays)
- Loading and error states
- Edit and delete action buttons
- Delete confirmation dialog
- Responsive modal

### IndexView
Displays a table of resources with sorting, filtering, and pagination.

```typescript
import { IndexView } from '@/components';

<IndexView
  resourceType="user"
  resources={users}
  isLoading={isLoading}
  onEdit={handleEdit}
  onView={handleView}
  onDelete={handleDelete}
/>
```

**Features:**
- Table layout with sortable columns
- Search and filtering
- Pagination with page size selector
- Loading skeleton
- Empty state
- Error state with retry
- Action buttons (edit, delete, view)

## Form Fields

### Basic Fields
- `TextInput` - Text input field
- `EmailInput` - Email validation
- `PasswordInput` - Password input with visibility toggle
- `NumberInput` - Number input with increment/decrement
- `TextareaField` - Multi-line text with character count
- `URLInput` - URL validation
- `SelectField` - Dropdown select
- `DateField` - Date picker
- `DateTimeField` - Date and time picker
- `SwitchField` - Toggle switch

### Relation Fields
- `BelongsToField` - Single related resource (searchable)
- `HasOneField` - One-to-one relationship
- `HasManyField` - Multiple related resources
- `BelongsToManyField` - Many-to-many relationship
- `MorphToField` - Polymorphic relationship

## Resource Configuration

Each resource has a configuration file defining its schema and fields:

```typescript
// web/src/resources/user.ts
import { userResourceSchema, getCreateFields, getUpdateFields } from '@/resources/user';

// Use in components
const createFields = getCreateFields();
const updateFields = getUpdateFields();
```

**Available Resources:**
- User (10+ fields)
- Product (8+ fields)
- Post (6+ fields)
- Category (4+ fields)

## Error Handling

### useErrorHandler Hook
Manages error state and field errors:

```typescript
import { useErrorHandler } from '@/hooks';

const { error, fieldErrors, setError, clearError } = useErrorHandler();

try {
  await submitForm(data);
} catch (err) {
  setError(err);
}
```

### Error Display Component
Shows user-friendly error messages:

```typescript
import { ErrorDisplay } from '@/components';

<ErrorDisplay
  error={error}
  onDismiss={() => clearError()}
  onRetry={() => retry()}
/>
```

### Error Utilities
```typescript
import { parseApiError, getUserFriendlyMessage, retryWithBackoff } from '@/utils';

// Parse error
const apiError = parseApiError(error);

// Get user message
const message = getUserFriendlyMessage(apiError);

// Retry with backoff
await retryWithBackoff(() => fetchData(), 3, 1000);
```

## Performance Optimizations

### Memoization
```typescript
import { memoizeComponent, useMemoizedCallback } from '@/utils';

// Memoize component
const MemoizedField = memoizeComponent(FieldComponent);

// Memoized callback
const handleChange = useMemoizedCallback((value) => {
  setData(value);
}, []);
```

### Virtualization
For large lists:

```typescript
import { VirtualList } from '@/hooks';

<VirtualList
  items={items}
  itemHeight={50}
  containerHeight={500}
  renderItem={(item, index) => <div>{item.name}</div>}
/>
```

## React Query Integration

### Hooks
```typescript
import { useResources, useResource, useCreateResource } from '@/hooks';

// Fetch resources list
const { data: resources, isLoading } = useResources('user', {
  page: 1,
  pageSize: 10,
  search: 'john',
});

// Fetch single resource
const { data: user } = useResource('user', userId);

// Create resource
const createMutation = useCreateResource('user');
await createMutation.mutateAsync(formData);
```

## Type Safety

All components are fully typed with TypeScript:

```typescript
import type { User, Product, FieldDefinition, ApiError } from '@/types';

// Use types in components
const user: User = { ... };
const fields: FieldDefinition[] = [ ... ];
```

## Responsive Design

The application uses ResponsiveModal for adaptive layouts:

- **Mobile**: Drawer from bottom
- **Tablet**: Sheet from right
- **Desktop**: Dialog in center

```typescript
import { ResponsiveModal } from '@/components';

<ResponsiveModal
  title="Create User"
  variant="sheet"
  side="right"
  open={isOpen}
  onOpenChange={setIsOpen}
>
  {/* Content */}
</ResponsiveModal>
```

## Usage Examples

### Complete User Management Page

```typescript
import { useState } from 'react';
import { useResources, useCreateResource } from '@/hooks';
import { FormView, DetailView, IndexView } from '@/components';
import { getCreateFields, getUpdateFields, getDetailFields } from '@/resources/user';

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users, isLoading } = useResources('user');
  const createMutation = useCreateResource('user');

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  return (
    <div>
      <IndexView
        resourceType="user"
        resources={users}
        isLoading={isLoading}
        onEdit={setSelectedUser}
        onView={setSelectedUser}
      />

      <FormView
        resourceType="user"
        mode="create"
        fields={getCreateFields()}
        isOpen={isFormOpen}
        onSubmit={handleCreate}
        onCancel={() => setIsFormOpen(false)}
      />

      <DetailView
        resourceType="user"
        resource={selectedUser}
        fields={getDetailFields()}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
```

## Testing

Run tests with:

```bash
npm run test -- --run
```

Property-based tests validate correctness properties across all inputs.

## Best Practices

1. **Always use TypeScript types** - Leverage full type safety
2. **Memoize expensive components** - Use React.memo for field components
3. **Handle errors gracefully** - Use useErrorHandler for consistent error handling
4. **Validate on both client and server** - Use Zod schemas for validation
5. **Use React Query for data fetching** - Automatic caching and invalidation
6. **Virtualize large lists** - Use VirtualList for performance
7. **Test with property-based tests** - Validate correctness properties

## Contributing

When adding new features:

1. Create resource configuration in `web/src/resources/`
2. Create page component in `web/src/pages/`
3. Add types to `web/src/types.ts`
4. Export from `web/src/components/index.ts`
5. Write tests with property-based testing
6. Update this guide

## License

MIT
