/**
 * FormActions - Submit and cancel buttons with loading states
 *
 * Features:
 * - Loading state display
 * - Disabled state handling
 * - Cancel confirmation (if dirty)
 */

import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';

export interface FormActionsProps {
  isSubmitting: boolean;
  isResolving?: boolean;
  mode: 'create' | 'edit';
  onSubmit?: () => Promise<void>;
  onCreateAndContinue?: () => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

/**
 * FormActions - Submit and cancel buttons
 */
export const FormActions: React.FC<FormActionsProps> = ({
  isSubmitting,
  isResolving = false,
  mode,
  onSubmit,
  onCreateAndContinue,
  onCancel,
  submitLabel,
  cancelLabel = 'Cancel',
  className,
}) => {
  const { formState } = useFormContext();
  const { isDirty } = formState;

  // Handle cancel with confirmation if form is dirty
  const handleCancel = useCallback(() => {
    if (!onCancel) return;

    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }

    onCancel();
  }, [onCancel, isDirty]);

  // Determine submit button label
  const defaultSubmitLabel = mode === 'create' ? 'Create' : 'Update';
  const finalSubmitLabel = submitLabel || defaultSubmitLabel;

  return (
    <div className={`flex justify-end gap-2 ${className || ''}`}>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      )}
      {mode === 'create' && onCreateAndContinue && (
        <Button
          type="button"
          variant="outline"
          onClick={onCreateAndContinue}
          disabled={isSubmitting || isResolving}
        >
          {isSubmitting ? 'Submitting...' : 'Create & Continue'}
        </Button>
      )}
      <Button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || isResolving}
      >
        {isSubmitting ? 'Submitting...' : finalSubmitLabel}
      </Button>
    </div>
  );
};

FormActions.displayName = 'FormActions';
