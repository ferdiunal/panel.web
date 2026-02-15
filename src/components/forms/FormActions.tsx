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
import { useTranslation } from '@/hooks/useTranslation';

export interface FormActionsProps {
  isSubmitting: boolean;
  isResolving?: boolean;
  mode: 'create' | 'edit';
  onSubmit?: () => Promise<void>;
  onCreateAndContinue?: () => Promise<void>;
  onUpdateAndContinue?: () => Promise<void>;
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
  onUpdateAndContinue,
  onCancel,
  submitLabel,
  cancelLabel,
  className,
}) => {
  const { t } = useTranslation();
  const { formState } = useFormContext();
  const { isDirty } = formState;
  const finalCancelLabel = cancelLabel || t('button.cancel', 'Cancel');
  const submittingLabel = t('button.submitting', 'Submitting...');
  const createAndContinueLabel = t('button.createAndContinue', 'Create and Continue');
  const updateAndContinueLabel = t('button.updateAndContinue', 'Update and Continue');

  // Handle cancel with confirmation if form is dirty
  const handleCancel = useCallback(() => {
    if (!onCancel) return;

    if (isDirty) {
      const confirmed = window.confirm(
        t('confirm.unsavedChanges', 'You have unsaved changes. Are you sure you want to leave?')
      );
      if (!confirmed) return;
    }

    onCancel();
  }, [onCancel, isDirty, t]);

  // Determine submit button label
  const defaultSubmitLabel = mode === 'create'
    ? t('button.create', 'Create')
    : t('button.update', 'Update');
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
          {finalCancelLabel}
        </Button>
      )}
      {mode === 'create' && onCreateAndContinue && (
        <Button
          type="button"
          variant="outline"
          onClick={onCreateAndContinue}
          disabled={isSubmitting || isResolving}
        >
          {isSubmitting ? submittingLabel : createAndContinueLabel}
        </Button>
      )}
      {mode === 'edit' && onUpdateAndContinue && (
        <Button
          type="button"
          variant="outline"
          onClick={onUpdateAndContinue}
          disabled={isSubmitting || isResolving}
        >
          {isSubmitting ? submittingLabel : updateAndContinueLabel}
        </Button>
      )}
      <Button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || isResolving}
      >
        {isSubmitting ? submittingLabel : finalSubmitLabel}
      </Button>
    </div>
  );
};

FormActions.displayName = 'FormActions';
