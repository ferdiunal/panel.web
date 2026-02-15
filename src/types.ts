/**
 * Core TypeScript types for Panel Frontend and existing application
 */

// ============================================================================
// Existing Application Types
// ============================================================================

export interface FieldData {
    data: any;
    disabled: boolean;
    filterable: boolean;
    help_text: string;
    key: string;
    label: string;
    name: string;
    nullable: boolean;
    placeholder: string;
    props: Record<string, any>;
    read_only: boolean;
    required: boolean;
    sortable: boolean;
    stacked: boolean;
    text_align: 'left' | 'center' | 'right';
    type: string;
    view: string;
    visible?: boolean;
}

export interface ResourcePolicy {
    view: boolean;
    update: boolean;
    delete: boolean;
}

export interface ResourceItem {
    policy?: ResourcePolicy;
    [key: string]: FieldData | ResourcePolicy | undefined;
}

export interface ResourceResponse {
    data: ResourceItem[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        title: string;
        headers: FieldData[];
        dialog_type: "dialog" | "sheet" | "drawer";
        dialog_size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
        create_fields?: FieldData[];
        update_fields?: FieldData[];
        policy: {
            create: boolean;
            view_any: boolean;
            update: boolean;
            delete: boolean;
        };
    };
};

// Card Data Types
export interface ValueCardData {
    value?: number | string;
    title?: string;
}

export interface TrendCardData {
    data?: Array<{ date: string; value: number }>;
    title?: string;
}

export interface PartitionCardData {
    data?: Record<string, number>;
    colors?: string[];
    format?: string;
}

export interface ProgressCardData {
    current?: number;
    target?: number;
    format?: string;
}

export interface TableCardData {
    data?: any[];
    columns?: any[];
}

export type CardData = ValueCardData | TrendCardData | PartitionCardData | ProgressCardData | TableCardData | any;

export interface Card {
    component: 'value-metric' | 'trend-metric' | 'partition-metric' | 'progress-metric' | 'table-metric' | string;
    title: string;
    width: string;
    data: CardData;
    error?: string;
}

// ============================================================================
// Panel Frontend Types
// ============================================================================

// Base Resource interface
export interface Resource {
  id: string;
  name?: string;
  type: string;
  attributes: Record<string, any>;
  relationships?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  policy?: ResourcePolicy;
}

// User Resource
export interface User extends Resource {
  type: 'user';
  attributes: {
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    bio?: string;
  };
}

// Product Resource
export interface Product extends Resource {
  type: 'product';
  attributes: {
    name: string;
    description: string;
    price: number;
    category_id: string;
    sku: string;
    stock: number;
    status: 'active' | 'inactive';
    image_url?: string;
  };
}

// Post Resource
export interface Post extends Resource {
  type: 'post';
  attributes: {
    title: string;
    content: string;
    author_id: string;
    status: 'draft' | 'published';
    published_at?: Date;
    featured_image_url?: string;
  };
}

// Category Resource
export interface Category extends Resource {
  type: 'category';
  attributes: {
    name: string;
    description?: string;
    slug: string;
    status: 'active' | 'inactive';
  };
}

// Union type for all resources
export type AnyResource = User | Product | Post | Category;

// Field type definitions
export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'url'
  | 'password'
  | 'number'
  | 'select'
  | 'date'
  | 'datetime'
  | 'switch';

// Relation type definitions
export type RelationType =
  | 'belongs_to'
  | 'has_many'
  | 'has_one'
  | 'belongs_to_many'
  | 'morph_to';

// Field definition interface
export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType | RelationType;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
    stacked?: boolean;
    help_text?: string;
    key?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, unknown>;
  props?: Record<string, unknown>;
}

// Resource schema definition
export interface ResourceSchema {
  type: 'user' | 'product' | 'post' | 'category';
  fields: FieldDefinition[];
  indexColumns: string[];
  createFields: string[];
  updateFields: string[];
}

// Pagination info
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  error?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: PaginationInfo & Record<string, any>;
}

// Form data type
export type FormData = Record<string, any>;

// Error type
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// Page Types
// ============================================================================

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

// Re-export field view types — types/field-views.ts barrel'ı
// types.ts dosya olarak types/ dizinini gölgelediği için burada re-export gerekli
export type { FormFieldProps, IndexFieldProps, DetailFieldProps } from './types/field-views';
