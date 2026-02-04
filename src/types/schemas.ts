/**
 * Zod validation schemas for all resource types
 */

import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'user', 'moderator']),
  status: z.enum(['active', 'inactive']),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  bio: z.string().optional(),
});

export type UserFormData = z.infer<typeof UserSchema>;

// Product Schema
export const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  price: z.number().positive('Price must be positive'),
  category_id: z.string().min(1, 'Category is required'),
  sku: z.string(),
  stock: z.number().nonnegative(),
  status: z.enum(['active', 'inactive']),
  image_url: z.string().url().optional().or(z.literal('')),
});

export type ProductFormData = z.infer<typeof ProductSchema>;

// Post Schema
export const PostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  author_id: z.string().min(1, 'Author is required'),
  status: z.enum(['draft', 'published']),
  published_at: z.date().optional(),
  featured_image_url: z.string().url().optional().or(z.literal('')),
});

export type PostFormData = z.infer<typeof PostSchema>;

// Category Schema
export const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  status: z.enum(['active', 'inactive']),
});

export type CategoryFormData = z.infer<typeof CategorySchema>;

// Schema map for dynamic access
export const SchemaMap = {
  user: UserSchema,
  product: ProductSchema,
  post: PostSchema,
  category: CategorySchema,
} as const;

// Type for schema keys
export type SchemaKey = keyof typeof SchemaMap;

// Helper function to validate data against schema
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
}

// Helper function to get schema by resource type
export function getSchema(resourceType: string): z.ZodSchema | null {
  return SchemaMap[resourceType as SchemaKey] || null;
}
