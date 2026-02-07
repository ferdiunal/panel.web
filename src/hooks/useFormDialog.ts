/**
 * Hook for managing form dialogs
 *
 * Features:
 * - Dialog open/close
 * - Form mode (create/edit)
 * - Initial data handling
 * - Integration with form-dialog-store
 */

import { useCallback } from 'react';
import {
  useFormDialogStore,
  useFormDialog as useFormDialogSelector,
} from '@/stores/form-dialog-store';

export interface OpenFormDialogConfig {
  mode: 'create' | 'edit';
  resourceType: string;
  resourceId?: string | number;
  initialData?: Record<string, any>;
}

export interface UseFormDialogReturn {
  isOpen: boolean;
  mode: 'create' | 'edit';
  resourceType: string;
  resourceId?: string | number;
  initialData?: Record<string, any>;
  openDialog: (config: OpenFormDialogConfig) => void;
  closeDialog: () => void;
  updateDialog: (updates: Partial<OpenFormDialogConfig>) => void;
}

/**
 * Hook for managing form dialogs
 */
export function useFormDialog(dialogId: string): UseFormDialogReturn {
  // Subscribe to dialog state
  const dialog = useFormDialogSelector(dialogId);

  // Get store actions
  const { openFormDialog, closeFormDialog, updateFormDialog } = useFormDialogStore();

  // Open dialog with config
  const openDialog = useCallback(
    (config: OpenFormDialogConfig) => {
      openFormDialog(dialogId, config);
    },
    [dialogId, openFormDialog]
  );

  // Close dialog
  const closeDialog = useCallback(() => {
    closeFormDialog(dialogId);
  }, [dialogId, closeFormDialog]);

  // Update dialog config
  const updateDialog = useCallback(
    (updates: Partial<OpenFormDialogConfig>) => {
      updateFormDialog(dialogId, updates);
    },
    [dialogId, updateFormDialog]
  );

  return {
    isOpen: dialog?.isOpen ?? false,
    mode: dialog?.mode ?? 'create',
    resourceType: dialog?.resourceType ?? '',
    resourceId: dialog?.resourceId,
    initialData: dialog?.initialData,
    openDialog,
    closeDialog,
    updateDialog,
  };
}
