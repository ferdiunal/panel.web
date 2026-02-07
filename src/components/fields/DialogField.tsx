/**
 * DialogField Component
 *
 * Modal/dialog içinde form veya wizard gösteren field component'i.
 * Kullanıcıdan modal içinde veri toplamak için kullanılır.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogContent as DialogFormContent } from './DialogContent';
import { DialogWizard } from './DialogWizard';
import type { DialogFieldProps } from '@/types/dialog';

/**
 * DialogField - Modal/dialog içinde form gösteren field component'i
 *
 * Kullanım:
 * ```tsx
 * <DialogField
 *   name="profile_completion"
 *   label="Profil Tamamla"
 *   defaultOpen={true}
 *   dialogTitle="Profilinizi Tamamlayın"
 *   dialogDesc="Lütfen eksik bilgilerinizi doldurun"
 *   contentType="form"
 *   fields={[
 *     { key: 'phone', name: 'Telefon', view: 'text-field', required: true },
 *     { key: 'address', name: 'Adres', view: 'text-field', required: true },
 *   ]}
 *   onChange={(data) => console.log('Data:', data)}
 * />
 * ```
 */
export const DialogField: React.FC<DialogFieldProps> = ({
  name: _name, // Unused but required by FieldComponentProps
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helpText,
  className,
  defaultOpen = false,
  triggerButton,
  triggerIcon,
  contentType,
  fields = [],
  steps = [],
  dialogTitle,
  dialogDesc,
  dialogSize = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // defaultOpen değiştiğinde dialog'u aç/kapat
  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // Form tamamlandığında çağrılır
  const handleComplete = (data: Record<string, any>) => {
    onChange?.(data);
    setIsOpen(false);
  };

  // Dialog iptal edildiğinde çağrılır
  const handleCancel = () => {
    setIsOpen(false);
  };

  // Wizard atlandığında çağrılır
  const handleSkip = () => {
    setIsOpen(false);
  };

  // Dialog boyutu için Tailwind class
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  return (
    <div className={className}>
      {/* Trigger button (eğer defaultOpen false ise) */}
      {!defaultOpen && triggerButton && (
        <div className="flex flex-col gap-2">
          {label && (
            <label className="text-sm font-medium">
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            disabled={disabled}
            type="button"
          >
            {triggerIcon && <span className="mr-2">{triggerIcon}</span>}
            {triggerButton}
          </Button>
          {helpText && <p className="text-sm text-muted-foreground">{helpText}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={sizeClasses[dialogSize]}>
          {/* Dialog Header */}
          {(dialogTitle || dialogDesc) && (
            <DialogHeader>
              {dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
              {dialogDesc && <DialogDescription>{dialogDesc}</DialogDescription>}
            </DialogHeader>
          )}

          {/* Content: Form mode */}
          {contentType === 'form' && (
            <DialogFormContent
              fields={fields}
              initialData={value}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          )}

          {/* Content: Wizard mode */}
          {contentType === 'wizard' && (
            <DialogWizard
              steps={steps}
              initialData={value}
              onComplete={handleComplete}
              onSkip={handleSkip}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
