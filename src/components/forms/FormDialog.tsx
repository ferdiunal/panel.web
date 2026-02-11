/**
 * FormDialog - Dialog wrapper for forms
 *
 * Features:
 * - Dialog state management
 * - Form integration
 * - Responsive design
 * - Portal support
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFormDialog } from '@/hooks/useFormDialog';

export interface FormDialogProps {
  dialogId: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onClose?: () => void;
}

/**
 * FormDialog - Dialog wrapper for forms
 */
export const FormDialog: React.FC<FormDialogProps> = ({
  dialogId,
  title,
  description,
  children,
  size = 'lg',
  onClose,
}) => {
  const { isOpen, closeDialog } = useFormDialog(dialogId);

  // Handle dialog close
  const handleClose = () => {
    closeDialog();
    onClose?.();
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={sizeClasses[size]}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <ScrollArea className="max-h-[60vh] mt-4">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

FormDialog.displayName = 'FormDialog';
