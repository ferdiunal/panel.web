/**
 * Resource Configurations
 * Central export for all resource schemas and utilities
 */

export * as userResource from './user';

import type { ResourceSchema } from '@/types';
import { userResourceSchema } from './user';

// Resource registry
export const resourceRegistry: Record<string, ResourceSchema> = {
  user: userResourceSchema,
};

// Get resource schema by type
export function getResourceSchema(resourceType: string): ResourceSchema | undefined {
  return resourceRegistry[resourceType];
}

// Get all resource types
export function getAllResourceTypes(): string[] {
  return Object.keys(resourceRegistry);
}
