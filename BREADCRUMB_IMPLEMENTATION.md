# Breadcrumb Implementation Guide

## Overview

A dynamic breadcrumb navigation system has been implemented that automatically generates breadcrumbs based on the current route and provides options to customize with resource titles and page titles.

## Components

### BreadcrumbBuilder Component

**File**: `web/src/components/breadcrumb-builder.tsx`

A flexible breadcrumb component that automatically parses the current pathname and generates breadcrumb segments.

#### Props

```typescript
interface BreadcrumbBuilderProps {
  resourceTitle?: string;  // Override last segment with resource title
  pageTitle?: string;      // Add additional page title as last segment
  customSegments?: BreadcrumbSegment[];  // Provide custom segments
}
```

#### Features

- **Automatic Path Parsing**: Converts URL path to breadcrumb segments
- **Smart Formatting**: Capitalizes segment names and handles special cases
- **Resource Support**: Skips 'resource' segment and uses resource name
- **Customizable**: Supports resource titles and page titles
- **Responsive**: Hidden on mobile, visible on medium screens and up
- **Navigation**: Clickable links for non-active segments

#### Special Cases Handled

- `dashboard` → Dashboard
- `resource` → (skipped, uses resource name)
- `settings` → Ayarlar
- `profile` → Profil
- `users` → Kullanıcılar
- `products` → Ürünler
- `posts` → Yazılar
- `categories` → Kategoriler

## Usage

### In Dashboard Layout

```typescript
import { BreadcrumbBuilder } from '@/components/breadcrumb-builder';

export default function DashboardLayout() {
  return (
    <header>
      <BreadcrumbBuilder />
    </header>
  );
}
```

### With Resource Title

```typescript
import { BreadcrumbBuilder } from '@/components/breadcrumb-builder';

export default function ResourceIndexPage() {
  const { data: resourceData } = useQuery(...);
  
  return (
    <>
      <BreadcrumbBuilder resourceTitle={resourceData.meta.title} />
      {/* Page content */}
    </>
  );
}
```

### With Page Title

```typescript
import { BreadcrumbBuilder } from '@/components/breadcrumb-builder';

export default function PageViewer() {
  const data = useLoaderData();
  
  return (
    <>
      <BreadcrumbBuilder pageTitle={data.title} />
      {/* Page content */}
    </>
  );
}
```

### With Custom Segments

```typescript
import { BreadcrumbBuilder } from '@/components/breadcrumb-builder';

export default function CustomPage() {
  const customSegments = [
    { label: 'Dashboard', path: '/', isActive: false },
    { label: 'Products', path: '/resource/products', isActive: false },
    { label: 'Electronics', path: '/resource/products?category=electronics', isActive: true },
  ];
  
  return (
    <>
      <BreadcrumbBuilder customSegments={customSegments} />
      {/* Page content */}
    </>
  );
}
```

## Implementation Details

### Path Parsing Algorithm

1. Split pathname by `/` and filter empty segments
2. Always add Dashboard as first segment
3. For each segment:
   - If segment is 'resource', skip it and use next segment as resource name
   - Format segment name using special cases or capitalize
   - Create breadcrumb segment with path and active state
4. Mark last segment as active

### Example Paths

| Path | Breadcrumbs |
|------|-------------|
| `/` | Dashboard |
| `/settings` | Dashboard > Ayarlar |
| `/resource/users` | Dashboard > Kullanıcılar |
| `/resource/products?page=2` | Dashboard > Ürünler |
| `/dashboard` | Dashboard |

## Files Modified

1. **web/src/components/breadcrumb-builder.tsx** (Created)
   - New BreadcrumbBuilder component
   - Path parsing logic
   - Segment formatting

2. **web/src/layouts/dashboard-layout.tsx** (Updated)
   - Replaced inline breadcrumb logic with BreadcrumbBuilder
   - Simplified header component

3. **web/src/pages/resource/index.tsx** (Updated)
   - Added BreadcrumbBuilder with resourceTitle prop
   - Breadcrumb displays resource title from API

4. **web/src/pages/common/page-viewer.tsx** (Updated)
   - Added BreadcrumbBuilder with pageTitle prop
   - Breadcrumb displays page title

5. **web/src/pages/settings/index.tsx** (Updated)
   - Added BreadcrumbBuilder with pageTitle prop
   - Breadcrumb displays settings title

6. **web/src/components/index.ts** (Updated)
   - Added BreadcrumbBuilder export

## Styling

The breadcrumb uses Shadcn UI components:
- `Breadcrumb` - Container
- `BreadcrumbList` - List wrapper
- `BreadcrumbItem` - Individual item
- `BreadcrumbLink` - Clickable link
- `BreadcrumbPage` - Current page (non-clickable)
- `BreadcrumbSeparator` - Separator between items

Responsive classes:
- `hidden md:block` - Hidden on mobile, visible on medium screens and up

## Type Safety

All components are fully typed:
- `BreadcrumbSegment` interface for segment structure
- `BreadcrumbBuilderProps` interface for component props
- All functions have proper return types

## Testing

The breadcrumb component can be tested by:

1. **Navigation Testing**
   - Click breadcrumb links
   - Verify navigation to correct path
   - Verify active state on current page

2. **Path Parsing Testing**
   - Test various URL paths
   - Verify correct segment generation
   - Verify special case handling

3. **Customization Testing**
   - Test with resourceTitle prop
   - Test with pageTitle prop
   - Test with customSegments prop

## Future Enhancements

1. **Breadcrumb Caching**: Cache parsed breadcrumbs for performance
2. **Breadcrumb Events**: Add callbacks for breadcrumb clicks
3. **Breadcrumb Styling**: Add theme customization options
4. **Breadcrumb Icons**: Add icons to breadcrumb segments
5. **Breadcrumb Dropdown**: Add dropdown menu for long breadcrumbs

## Summary

The breadcrumb implementation provides:
- ✅ Automatic path parsing
- ✅ Smart segment formatting
- ✅ Resource title support
- ✅ Page title support
- ✅ Custom segment support
- ✅ Responsive design
- ✅ Type-safe implementation
- ✅ Easy integration

The breadcrumb system is now integrated across all main pages and provides a consistent navigation experience.
