/**
 * User Resource Configuration
 * Defines schema, fields, and utilities for User resource
 */

import type { FieldDefinition, ResourceSchema } from '@/types';
import { z } from 'zod';

// User validation schema
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'inactive']),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  bio: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// User resource schema
export const userResourceSchema: ResourceSchema = {
  type: 'user',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter user name',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Enter email address',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'moderator', label: 'Moderator' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number',
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      placeholder: 'Enter street address',
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter city',
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Enter country',
    },
    {
      name: 'postal_code',
      label: 'Postal Code',
      type: 'text',
      placeholder: 'Enter postal code',
    },
    {
      name: 'bio',
      label: 'Bio',
      type: 'textarea',
      placeholder: 'Enter user bio',
    },
  ],
  indexColumns: ['name', 'email', 'role', 'status'],
  createFields: ['name', 'email', 'role', 'status', 'phone', 'address', 'city', 'country', 'postal_code', 'bio'],
  updateFields: ['name', 'email', 'role', 'status', 'phone', 'address', 'city', 'country', 'postal_code', 'bio'],
};

// Get fields for index view
export function getIndexFields(): FieldDefinition[] {
  return userResourceSchema.fields.filter(f => userResourceSchema.indexColumns.includes(f.name));
}

// Get fields for create form
export function getCreateFields(): FieldDefinition[] {
  return userResourceSchema.fields.filter(f => userResourceSchema.createFields.includes(f.name));
}

// Get fields for update form
export function getUpdateFields(): FieldDefinition[] {
  return userResourceSchema.fields.filter(f => userResourceSchema.updateFields.includes(f.name));
}

// Get all fields for detail view
export function getDetailFields(): FieldDefinition[] {
  return userResourceSchema.fields;
}
