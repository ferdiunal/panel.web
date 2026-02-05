# Page Structure Implementation Guide

## Overview

A comprehensive page structure has been implemented for both backend and frontend, providing a flexible system for creating custom pages with fields, cards, and navigation support.

## Backend Implementation

### Page Interface (`pkg/page/page.go`)

The `Page` interface defines the contract for all pages:

```go
type Page interface {
    Slug() string                                          // URL identifier
    Title() string                                         // Display title
    Description() string                                   // Page description
    Cards() []widget.Card                                  // Dashboard cards/widgets
    Fields() []fields.Element                              // Form fields
    Save(c *context.Context, db *gorm.DB, data map[string]any) error  // Save handler
    Icon() string                                          // Menu icon
    Group() string                                         // Menu group
    NavigationOrder() int                                  // Menu order
    Visible() bool                                         // Menu visibility
    CanAccess(c *context.Context) bool                    // Access control
}
```

### Base Struct (`pkg/page/page.go`)

Provides default implementations for all methods:

```go
type Base struct {}

// All methods have default implementations
func (b Base) Slug() string { return "" }
func (b Base) Title() string { return "" }
func (b Base) Description() string { return "" }
func (b Base) CanAccess(c *context.Context) bool { return true }
// ... etc
```

### OptimizedBase Struct (`pkg/page/resolver.go`)

Enhanced base with support for dynamic field and card resolution:

```go
type OptimizedBase struct {
    Resolvable
    Navigable
    slug        string
    title       string
    description string
}
```

Features:
- Field resolver for dynamic fields
- Card resolver for dynamic cards
- Navigation customization
- Slug, title, and description management

### Example Implementations

#### Dashboard Page (`pkg/page/dashboard.go`)

```go
type Dashboard struct {
    Base
}

func (d *Dashboard) Slug() string { return "dashboard" }
func (d *Dashboard) Title() string { return "Dashboard" }
func (d *Dashboard) Description() string { return "Sistem özeti ve istatistikleri" }
func (d *Dashboard) Icon() string { return "layout-dashboard" }
func (d *Dashboard) Cards() []widget.Card {
    return []widget.Card{
        widget.NewCountWidget("Total Users", &user.User{}),
    }
}
```

#### Settings Page (`pkg/page/settings.go`)

```go
type Settings struct {
    Base
    Elements         []fields.Element
    HideInNavigation bool
}

func (p *Settings) Slug() string { return "settings" }
func (p *Settings) Title() string { return "Settings" }
func (p *Settings) Description() string { return "Sistem ayarlarını yönetin" }
func (p *Settings) Save(c *context.Context, db *gorm.DB, data map[string]interface{}) error {
    // Save settings to database
}
```

### API Endpoints

#### GET /api/pages

Returns list of all available pages:

```json
{
  "data": [
    {
      "slug": "dashboard",
      "title": "Dashboard",
      "description": "Sistem özeti ve istatistikleri",
      "icon": "layout-dashboard",
      "group": "Genel",
      "order": 0,
      "visible": true
    },
    {
      "slug": "settings",
      "title": "Settings",
      "description": "Sistem ayarlarını yönetin",
      "icon": "settings",
      "group": "System",
      "order": 100,
      "visible": true
    }
  ]
}
```

#### GET /api/pages/:slug

Returns page details with fields and cards:

```json
{
  "slug": "dashboard",
  "title": "Dashboard",
  "description": "Sistem özeti ve istatistikleri",
  "meta": {
    "cards": [
      {
        "component": "count",
        "title": "Total Users",
        "width": "1/4",
        "data": 42
      }
    ],
    "fields": []
  }
}
```

#### POST /api/pages/:slug

Saves page data:

```json
{
  "site_name": "My Site",
  "register": true,
  "forgot_password": true
}
```

Response:
```json
{
  "message": "Settings saved"
}
```

### Access Control

Pages support access control via `CanAccess()` method:

```go
func (p *MyPage) CanAccess(c *context.Context) bool {
    // Check user permissions
    return c.User().HasPermission("view_page")
}
```

## Frontend Implementation

### Types (`web/src/types.ts`)

```typescript
export interface PageItem {
  slug: string;
  title: string;
  description: string;
  icon: string;
  group: string;
  order: number;
  visible: boolean;
}

export interface PageResponse {
  slug: string;
  title: string;
  description: string;
  meta: {
    cards: Card[];
    fields: FieldData[];
  };
}

export interface PageListResponse {
  data: PageItem[];
}
```

### Page Service (`web/src/services/page.ts`)

```typescript
export const pageService = {
    // Fetch all pages
    fetchPages: async (): Promise<PageListResponse> => {
        const { data } = await api.get<PageListResponse>(`/pages`);
        return data;
    },

    // Fetch specific page
    fetchPage: async (slug: string): Promise<PageResponse> => {
        const { data } = await api.get<PageResponse>(`/pages/${slug}`);
        return data;
    },

    // Save page data
    savePage: async (slug: string, data: any) => {
        const response = await api.post(`/pages/${slug}`, data);
        return response.data;
    },
};
```

### Page Viewer Component (`web/src/pages/common/page-viewer.tsx`)

Displays any page with its cards and fields:

```typescript
export default function PageViewer() {
    const data = useLoaderData() as PageData

    return (
        <div className="flex flex-col gap-4">
            <BreadcrumbBuilder pageTitle={data.title} />
            
            <div className="flex flex-col gap-4 p-4 md:p-8 pt-0">
                <div>
                    <h1 className="text-2xl font-bold">{data.title}</h1>
                    {data.description && (
                        <p className="text-sm text-muted-foreground">{data.description}</p>
                    )}
                </div>

                {data.cards && data.cards.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {data.cards.map((card, index) => (
                            <WidgetRenderer key={index} card={card} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
```

### Settings Page (`web/src/pages/settings/index.tsx`)

Specialized page for system settings:

```typescript
export default function SettingsPage() {
    const pageData = useLoaderData() as any
    const saveMutation = useMutation({...})

    return (
        <div className="flex flex-col gap-4">
            <BreadcrumbBuilder pageTitle={pageData.title} />
            
            <div className="flex flex-col gap-4 p-4 md:p-8 pt-0 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-bold">{pageData.title}</h1>
                    {pageData.description && (
                        <p className="text-sm text-muted-foreground">{pageData.description}</p>
                    )}
                </div>

                <ResourceForm
                    fields={pageData.meta.fields}
                    initialData={initialData}
                    onSubmit={async (data) => await saveMutation.mutateAsync(data)}
                    submitLabel="Kaydet"
                />
            </div>
        </div>
    )
}
```

## Features

### Backend Features

✅ **Flexible Page Interface**
- Extensible interface for custom pages
- Default implementations via Base struct
- Support for dynamic fields and cards

✅ **Navigation Support**
- Menu grouping
- Custom ordering
- Visibility control
- Icon support

✅ **Access Control**
- Per-page access control
- User permission checking
- Secure API endpoints

✅ **Field Management**
- Dynamic field resolution
- Form field support
- Field serialization

✅ **Card/Widget Support**
- Dashboard cards
- Widget rendering
- Data resolution

### Frontend Features

✅ **Page Service**
- Fetch all pages
- Fetch specific page
- Save page data
- Type-safe API calls

✅ **Page Viewer**
- Generic page display
- Card rendering
- Breadcrumb navigation
- Description display

✅ **Settings Page**
- Form-based settings
- Field validation
- Save functionality
- Error handling

✅ **Type Safety**
- Full TypeScript support
- Proper interfaces
- Type-safe API responses

## Usage Examples

### Creating a Custom Page (Backend)

```go
type Reports struct {
    page.Base
}

func (r *Reports) Slug() string { return "reports" }
func (r *Reports) Title() string { return "Reports" }
func (r *Reports) Description() string { return "System reports and analytics" }
func (r *Reports) Icon() string { return "bar-chart" }
func (r *Reports) Group() string { return "Analytics" }
func (r *Reports) NavigationOrder() int { return 50 }

func (r *Reports) Cards() []widget.Card {
    return []widget.Card{
        widget.NewChartWidget("Monthly Revenue", ...),
        widget.NewChartWidget("User Growth", ...),
    }
}

func (r *Reports) Fields() []fields.Element {
    return []fields.Element{
        // Report configuration fields
    }
}

// Register the page
panel.RegisterPage(&Reports{})
```

### Accessing a Page (Frontend)

```typescript
// Fetch page
const page = await pageService.fetchPage('reports');

// Display page
<PageViewer slug="reports" />

// Save page data
await pageService.savePage('reports', { /* data */ });
```

## Files Modified

### Backend
- `pkg/page/page.go` - Added Description() and CanAccess() methods
- `pkg/page/dashboard.go` - Added Description() method
- `pkg/page/settings.go` - Added Description() method
- `pkg/page/resolver.go` - Added description field to OptimizedBase
- `pkg/panel/page_routes.go` - Enhanced API responses with description, icon, group, order

### Frontend
- `web/src/types.ts` - Added PageItem, PageResponse, PageListResponse types
- `web/src/services/page.ts` - Added fetchPages() method, updated types
- `web/src/pages/common/page-viewer.tsx` - Added description display
- `web/src/pages/settings/index.tsx` - Added description display

## Testing

### Backend Testing

1. **List Pages**
   ```bash
   curl http://localhost:3000/api/pages
   ```

2. **Get Page Details**
   ```bash
   curl http://localhost:3000/api/pages/dashboard
   ```

3. **Save Page Data**
   ```bash
   curl -X POST http://localhost:3000/api/pages/settings \
     -H "Content-Type: application/json" \
     -d '{"site_name": "My Site"}'
   ```

### Frontend Testing

1. **View Page**
   - Navigate to `/dashboard`
   - Navigate to `/settings`

2. **Check Breadcrumbs**
   - Verify breadcrumb shows page title

3. **Check Description**
   - Verify description displays under title

4. **Save Settings**
   - Modify settings
   - Click Save
   - Verify success message

## Summary

The page structure provides:
- ✅ Flexible backend page system
- ✅ Type-safe frontend integration
- ✅ Access control support
- ✅ Navigation management
- ✅ Field and card support
- ✅ Breadcrumb integration
- ✅ Description display
- ✅ Settings management

Both backend and frontend are now aligned with a consistent page structure that supports extensibility and customization.
