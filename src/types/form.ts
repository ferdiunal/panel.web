/**
 * Form-related type definitions
 */

import type { FieldData } from '@/types';

/**
 * Field definition for form rendering
 */
export interface FieldDefinition extends FieldData {
  // Additional properties for form rendering
  visible?: boolean;
}

/**
 * Form context type
 */
export type FormContext = 'create' | 'update';

/**
 * Form submission handler
 */
export type FormSubmitHandler = (data: Record<string, any>) => Promise<void>;

/**
 * Form error handler
 */
export type FormErrorHandler = (error: Error) => void;

/**
 * Form success handler
 */
export type FormSuccessHandler = () => void;

/**
 * Form cancel handler
 */
export type FormCancelHandler = () => void;

/**
 * Field change handler
 */
export type FieldChangeHandler = (fieldKey: string, value: any) => void;

/**
 * Dependency resolution config
 */
export interface DependencyResolutionConfig {
  formId: string;
  resourceType: string;
  context: FormContext;
  resourceId?: string | number;
  changedFields: string[];
  formData: Record<string, any>;
}

/**
 * Form dialog config
 */
export interface FormDialogConfig {
  formId: string;
  resourceType: string;
  mode: 'create' | 'edit';
  resourceId?: string | number;
  initialData?: Record<string, any>;
  onSuccess?: FormSuccessHandler;
  onError?: FormErrorHandler;
  onCancel?: FormCancelHandler;
}

/**
 * Detail dialog config
 */
export interface DetailDialogConfig {
  dialogId: string;
  resourceType: string;
  resourceId: string | number;
  onClose?: () => void;
}

/**
 * Confirm dialog config
 */
export interface ConfirmDialogConfig {
  dialogId: string;
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}
