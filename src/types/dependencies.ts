/**
 * Type definitions for field dependency system
 */

import type { FieldData } from '@/types';

/**
 * Field update returned from dependency resolution
 */
export interface FieldUpdate {
  visible?: boolean;
  readonly?: boolean;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: Record<string, any>;
  value?: any;
  rules?: ValidationRule[];
}

/**
 * Validation rule structure
 */
export interface ValidationRule {
  type: string;
  message?: string;
  params?: Record<string, any>;
}

/**
 * Request payload for dependency resolution
 */
export interface ResolveDependenciesRequest {
  formData: Record<string, any>;
  context: 'create' | 'update';
  changedFields: string[];
  resourceId?: string | number | null;
}

/**
 * Response from dependency resolution
 */
export interface ResolveDependenciesResponse {
  fields: Record<string, FieldUpdate>;
}

/**
 * Extended FieldData with dependency updates applied
 */
export interface DependentFieldData extends FieldData {
  visible?: boolean;
}
