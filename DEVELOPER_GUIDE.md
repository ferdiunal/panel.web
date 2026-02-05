# Panel Frontend - Geliştirici Rehberi

## Genel Bakış

Panel Frontend, kaynakları CRUD işlemleri aracılığıyla yönetmek için birleşik bir arayüz sağlayan React tabanlı bir yönetim paneli bileşen kütüphanesidir. Bu rehber, mimarı, bileşenleri ve uygulama detaylarını geliştiriciler için kapsar.

## İçindekiler

1. [Mimari](#mimari)
2. [Proje Yapısı](#proje-yapısı)
3. [Temel Kavramlar](#temel-kavramlar)
4. [Bileşenler](#bileşenler)
5. [Durum Yönetimi](#durum-yönetimi)
6. [Veri Getirme](#veri-getirme)
7. [Doğrulama](#doğrulama)
8. [Stil Oluşturma](#stil-oluşturma)
9. [Test Etme](#test-etme)
10. [Performans](#performans)

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Main Page (Index View)                  │   │
│  │  - Resource List (Table/Cards)                       │   │
│  │  - Search, Filter, Sort Controls                     │   │
│  │  - Pagination                                        │   │
│  │  - Action Buttons (Edit, Delete, View)              │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐           │
│    │  Sheet  │      │  Drawer │      │ Dialog  │           │
│    │ (Form)  │      │(Detail) │      │(Confirm)│           │
│    └─────────┘      └─────────┘      └─────────┘           │
│                                                               │
│         ┌─────────────────────────────────────┐             │
│         │   Zustand Store (State Mgmt)        │             │
│         │  - Resource data                    │             │
│         │  - UI state (loading, errors)       │             │
│         │  - Modal state (open/close)         │             │
│         │  - Pagination, filters, sort        │             │
│         └─────────────────┬───────────────────┘             │
│                           │                                  │
│         ┌─────────────────▼──────────────────┐              │
│         │   React Query (Server State)       │              │
│         │  - Queries (fetch)                 │              │
│         │  - Mutations (create/update/delete)│              │
│         │  - Caching & invalidation          │              │
│         └─────────────────┬──────────────────┘              │
│                           │                                  │
│         ┌─────────────────▼──────────────────┐              │
│         │   API Client                       │              │
│         │  - HTTP requests                   │              │
│         │  - Error handling                  │              │
│         │  - CSRF token management           │              │
│         └─────────────────────────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Single Page Application** - All views on one page with modals
2. **Type Safety** - Full TypeScript support
3. **Performance** - Memoization and selector patterns
4. **Validation** - Zod schemas for runtime validation
5. **Responsive** - Mobile, tablet, and desktop support
6. **Accessible** - WCAG compliant components

---

## Project Structure

```
web/src/
├── components/
│   ├── fields/                 # Field components
│   │   ├── TextInput.tsx
│   │   ├── EmailInput.tsx
│   │   ├── SelectField.tsx
│   │   ├── DateField.tsx
│   │   ├── BelongsToField.tsx
│   │   ├── HasManyField.tsx
│   │   └── ...
│   ├── views/                  # View components
│   │   ├── IndexView.tsx
│   │   ├── FormView.tsx
│   │   ├── DetailView.tsx
│   │   └── ...
│   ├── breadcrumb-builder.tsx  # Breadcrumb navigation
│   └── index.ts                # Component exports
├── hooks/
│   ├── useResources.ts         # React Query hooks
│   ├── useAuth.ts              # Auth hooks
│   └── ...
├── stores/
│   ├── resource-store.ts       # Zustand store
│   ├── auth-store.ts           # Auth store
│   └── ...
├── services/
│   ├── resource.ts             # Resource API service
│   ├── page.ts                 # Page API service
│   ├── auth.ts                 # Auth API service
│   └── ...
├── lib/
│   ├── axios.ts                # API client
│   └── ...
├── types.ts                    # TypeScript types
├── pages/
│   ├── resource/
│   │   └── index.tsx           # Resource management page
│   ├── settings/
│   │   └── index.tsx           # Settings page
│   ├── auth/
│   │   ├── login.tsx           # Login page
│   │   └── unauthorized.tsx    # Unauthorized page
│   └── ...
└── App.tsx                     # Main app component
```

---

## Core Concepts

### Resources

A resource is a data entity managed by the panel:

```typescript
interface Resource {
  id: string;
  type: 'user' | 'product' | 'post' | 'category';
  attributes: Record<string, any>;
  relationships?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Views

Three main views for managing resources:

1. **IndexView** - List of resources with search, filter, sort, pagination
2. **FormView** - Create/update form in Sheet or Drawer
3. **DetailView** - Read-only view in Sheet or Drawer

### Fields

Field components for different data types:

- **Basic**: Text, Email, Password, Number, Textarea, URL, Select, Date, DateTime, Switch
- **Relations**: BelongsTo, HasMany, HasOne, BelongsToMany, MorphTo

### State Management

Zustand store manages:
- Resource data
- UI state (loading, errors)
- Modal state (open/close)
- Pagination, filters, sort

### Data Fetching

React Query manages:
- Queries (fetch operations)
- Mutations (create/update/delete)
- Caching and invalidation
- Retry logic

---

## Components

### IndexView

Displays a paginated list of resources with search, filter, sort, and pagination.

```typescript
interface IndexViewProps {
  resourceType: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

// Usage
<IndexView resourceType="users" />
```

Features:
- Table display with sortable columns
- Search functionality
- Filtering
- Pagination
- Loading skeleton
- Empty state
- Error state
- Action buttons

### FormView

Form for creating or updating resources.

```typescript
interface FormViewProps {
  resourceType: string;
  mode: 'create' | 'update';
  resourceId?: string;
  onSuccess?: (resource: Resource) => void;
  onCancel?: () => void;
}

// Usage
<FormView resourceType="users" mode="create" />
```

Features:
- Dynamic field rendering
- Real-time validation
- Error display
- Loading state
- Submit/Cancel buttons
- Pre-population in update mode

### DetailView

Read-only view of a resource.

```typescript
interface DetailViewProps {
  resourceType: string;
  resourceId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
}

// Usage
<DetailView resourceType="users" resourceId="123" />
```

Features:
- All attributes displayed
- Related data sections
- Loading skeleton
- Error state
- Edit/Delete/Back buttons

### Field Components

```typescript
// Text field
<TextInput
  name="name"
  label="Name"
  value={value}
  onChange={onChange}
  error={error}
  required
/>

// Select field
<SelectField
  name="role"
  label="Role"
  value={value}
  onChange={onChange}
  options={[
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
  ]}
/>

// Relation field
<BelongsToField
  name="category_id"
  label="Category"
  value={value}
  onChange={onChange}
  resourceType="categories"
  searchFn={searchCategories}
/>
```

---

## State Management

### Zustand Store

```typescript
import { useResourceStore } from '@/stores/resource-store';

// Get state
const resources = useResourceStore((state) => state.resources);
const loading = useResourceStore((state) => state.loading);

// Use selector hook
const resources = useResources();
const loading = useResourcesLoading();

// Update state
useResourceStore.setState({ resources: newResources });

// Use actions
const store = useResourceStore();
store.setResources(newResources);
store.setLoading(true);
store.openForm('create');
```

### Selector Pattern

Selectors prevent unnecessary re-renders:

```typescript
// Selector hook
export const useResources = () =>
  useResourceStore((state) => state.selectResources());

// Component only re-renders when resources change
function MyComponent() {
  const resources = useResources();
  return <div>{resources.length} resources</div>;
}
```

---

## Data Fetching

### React Query Hooks

```typescript
import { useResources, useResource, useCreateResource } from '@/hooks/useResources';

// Fetch resources list
const { data, isLoading, error } = useResources('users', {
  page: 1,
  pageSize: 10,
  search: 'john',
});

// Fetch single resource
const { data: user, isLoading } = useResource('users', '123');

// Create resource
const createMutation = useCreateResource('users');
createMutation.mutate({ name: 'John', email: 'john@example.com' });

// Update resource
const updateMutation = useUpdateResource('users', '123');
updateMutation.mutate({ name: 'Jane' });

// Delete resource
const deleteMutation = useDeleteResource('users');
deleteMutation.mutate('123');
```

### API Client

```typescript
import api from '@/lib/axios';

// GET request
const users = await api.get('/resource/users');

// POST request (CSRF token automatically added)
const newUser = await api.post('/resource/users', { name: 'John' });

// PUT request (CSRF token automatically added)
const updated = await api.put('/resource/users/123', { name: 'Jane' });

// DELETE request (CSRF token automatically added)
await api.delete('/resource/users/123');
```

---

## Validation

### Zod Schemas

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user']),
  status: z.enum(['active', 'inactive']),
});

// Validate data
const result = UserSchema.safeParse(data);
if (!result.success) {
  console.log(result.error.flatten());
}
```

### Form Validation

```typescript
// Real-time validation
const [errors, setErrors] = useState<Record<string, string>>({});

const handleChange = (name: string, value: any) => {
  const schema = z.object({ [name]: fieldSchema });
  const result = schema.safeParse({ [name]: value });
  
  if (!result.success) {
    setErrors({ ...errors, [name]: result.error.flatten().fieldErrors[name][0] });
  } else {
    setErrors({ ...errors, [name]: undefined });
  }
};
```

---

## Styling

### Tailwind CSS

All components use Tailwind CSS for styling:

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Resources</h1>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    New
  </button>
</div>
```

### shadcn/ui Components

Built on shadcn/ui for consistent styling:

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Sheet } from '@/components/ui/sheet';
```

---

## Testing

### Unit Tests

Test specific components and functionality:

```typescript
import { render, screen } from '@testing-library/react';
import { TextInput } from '@/components/fields/TextInput';

describe('TextInput', () => {
  it('renders input field', () => {
    render(<TextInput name="test" label="Test" value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Test')).toBeInTheDocument();
  });

  it('displays validation error', () => {
    render(
      <TextInput
        name="test"
        label="Test"
        value=""
        onChange={() => {}}
        error="This field is required"
      />
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });
});
```

### Property-Based Tests

Test universal properties across all inputs:

```typescript
import fc from 'fast-check';

describe('IndexView Properties', () => {
  it('displays all records for any resource list', () => {
    fc.assert(
      fc.property(fc.array(fc.object()), (records) => {
        const { container } = render(<IndexView resources={records} />);
        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length).toBe(records.length);
      })
    );
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- TextInput.test.tsx

# Run with coverage
npm run test -- --coverage
```

---

## Performance

### Memoization

```typescript
import { memo, useCallback } from 'react';

// Memoize component
const ResourceRow = memo(({ resource, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{resource.name}</td>
      <td>
        <button onClick={() => onEdit(resource.id)}>Edit</button>
        <button onClick={() => onDelete(resource.id)}>Delete</button>
      </td>
    </tr>
  );
});

// Memoize callbacks
const handleEdit = useCallback((id: string) => {
  // Handle edit
}, []);
```

### Virtualization

```typescript
import { FixedSizeList } from 'react-window';

// Virtualize large lists
<FixedSizeList
  height={600}
  itemCount={resources.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ResourceRow resource={resources[index]} />
    </div>
  )}
</FixedSizeList>
```

### Selector Pattern

```typescript
// Only re-render when selected state changes
const resources = useResourceStore((state) => state.selectResources());
const loading = useResourceStore((state) => state.selectLoading());
```

---

## Best Practices

### Component Development

1. **Use TypeScript** - Full type safety
2. **Memoize Components** - Prevent unnecessary re-renders
3. **Use Selectors** - Efficient state access
4. **Handle Errors** - Display user-friendly messages
5. **Add Loading States** - Show feedback during operations
6. **Validate Input** - Use Zod schemas
7. **Test Thoroughly** - Unit and property tests

### State Management

1. **Use Zustand** - Simple and efficient
2. **Use Selectors** - Prevent re-renders
3. **Keep State Minimal** - Only store necessary data
4. **Use Actions** - Encapsulate state updates
5. **Persist State** - For quick navigation

### Data Fetching

1. **Use React Query** - Efficient caching
2. **Handle Errors** - Display error messages
3. **Show Loading States** - Provide feedback
4. **Invalidate Queries** - After mutations
5. **Retry Failed Requests** - With exponential backoff

### Styling

1. **Use Tailwind CSS** - Consistent styling
2. **Use shadcn/ui** - Pre-built components
3. **Responsive Design** - Mobile-first approach
4. **Dark Mode** - Support dark theme
5. **Accessibility** - WCAG compliant

---

## Troubleshooting

### Component Not Rendering

1. Check component is imported correctly
2. Check props are passed correctly
3. Check TypeScript types match
4. Check for console errors
5. Use React DevTools to inspect

### State Not Updating

1. Check store actions are called
2. Check selectors are correct
3. Check component is subscribed to store
4. Use Redux DevTools to inspect state
5. Check for async operations

### Data Not Fetching

1. Check API endpoint is correct
2. Check network tab in DevTools
3. Check error handling
4. Check React Query cache
5. Check authentication token

### Performance Issues

1. Check for unnecessary re-renders
2. Use React DevTools Profiler
3. Memoize components
4. Use selectors
5. Virtualize large lists

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)

---

## Contributing

To contribute to Panel Frontend:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

## License

Panel Frontend is licensed under the MIT License.

---

## Support

For support, please contact support@example.com or open an issue on GitHub.
