/**
 * Panel Frontend utility functions
 */

import type { AnyResource } from '@/types';

/**
 * Get display value for a resource attribute
 */
export function getDisplayValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

/**
 * Get resource type label
 */
export function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    user: 'User',
    product: 'Product',
    post: 'Post',
    category: 'Category',
  };
  return labels[type] || type;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
    case 'published':
      return 'default';
    case 'inactive':
    case 'draft':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Check if a field is a relation field
 */
export function isRelationField(fieldType: string): boolean {
  return ['belongs_to', 'has_many', 'has_one', 'belongs_to_many', 'morph_to'].includes(fieldType);
}

/**
 * Check if a field is a regular field
 */
export function isRegularField(fieldType: string): boolean {
  return ['text', 'textarea', 'email', 'url', 'password', 'number', 'select', 'date', 'datetime', 'switch'].includes(fieldType);
}

/**
 * Get field component type
 */
export function getFieldComponentType(fieldType: string): string {
  const componentMap: Record<string, string> = {
    text: 'TextInput',
    textarea: 'TextareaField',
    email: 'EmailInput',
    url: 'URLInput',
    password: 'PasswordInput',
    number: 'NumberInput',
    select: 'SelectField',
    date: 'DateField',
    datetime: 'DateTimeField',
    switch: 'SwitchField',
    belongs_to: 'BelongsToField',
    has_many: 'HasManyField',
    has_one: 'HasOneField',
    belongs_to_many: 'BelongsToManyField',
    morph_to: 'MorphToField',
  };
  return componentMap[fieldType] || 'TextInput';
}

/**
 * Merge form data with existing resource
 */
export function mergeResourceData(existing: AnyResource | null, formData: Record<string, any>): Record<string, any> {
  if (!existing) {
    return formData;
  }
  return {
    ...existing.attributes,
    ...formData,
  };
}

/**
 * Extract errors from API response
 */
export function extractErrors(error: any): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error?.response?.data?.errors) {
    const apiErrors = error.response.data.errors;
    if (typeof apiErrors === 'object') {
      Object.entries(apiErrors).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          errors[key] = value[0];
        } else if (typeof value === 'string') {
          errors[key] = value;
        }
      });
    }
  } else if (error?.response?.data?.message) {
    errors._form = error.response.data.message;
  } else if (error?.message) {
    errors._form = error.message;
  } else {
    errors._form = 'An error occurred';
  }

  return errors;
}

/**
 * Build query string from filters
 */
export function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
