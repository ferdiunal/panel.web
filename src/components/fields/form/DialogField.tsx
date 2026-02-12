/**
 * DialogFormField - Mikro Frontend Pattern
 *
 * Responsive modal/dialog içinde form veya wizard gösteren field component'i.
 * Desktop'ta Dialog, mobilde Drawer kullanır.
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DialogContent as DialogFormContent } from './DialogContent';
import { DialogWizard } from './DialogWizard';
import type { FormFieldProps } from '@/types';

export const DialogFormField: React.FC<FormFieldProps> = ({
  field,
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  helpText,
  className,
}) => {
  // Extract specific props from field.props
  const defaultOpen = field.props?.defaultOpen as boolean;
  const triggerButton = field.props?.triggerButton as React.ReactNode;
  const triggerIcon = field.props?.triggerIcon as React.ReactNode;
  const contentType = field.props?.contentType as 'form' | 'wizard';
  const fields = field.props?.fields as any[];
  const steps = field.props?.steps as any[];
  const dialogTitle = field.props?.dialogTitle as string;
  const dialogDesc = field.props?.dialogDesc as string;
  const dialogSize = field.props?.dialogSize as 'sm' | 'md' | 'lg' | 'xl' | 'full';

  const [isOpen, setIsOpen] = useState(defaultOpen || false);
  // Desktop için md breakpoint (768px) kullan
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // defaultOpen değiştiğinde dialog'u aç/kapat
  useEffect(() => {
    setIsOpen(defaultOpen || false);
  }, [defaultOpen]);

  // Form tamamlandığında çağrılır
  const handleComplete = (data: Record<string, any>) => {
    onChange(data);
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

  // Content component'i - hem Dialog hem Drawer için aynı
  const renderContent = () => (
    <>
      {/* Content: Form mode */}
      {contentType === 'form' && (
        <DialogFormContent
          fields={fields || []}
          initialData={value}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}

      {/* Content: Wizard mode */}
      {contentType === 'wizard' && (
        <DialogWizard
          steps={steps || []}
          initialData={value}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onCancel={handleCancel}
        />
      )}
    </>
  );

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

      {/* Desktop: Dialog */}
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className={sizeClasses[dialogSize || 'md']}>
            {/* Dialog Header */}
            {(dialogTitle || dialogDesc) && (
              <DialogHeader>
                {dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
                {dialogDesc && <DialogDescription>{dialogDesc}</DialogDescription>}
              </DialogHeader>
            )}

            {renderContent()}
          </DialogContent>
        </Dialog>
      ) : (
        /* Mobile: Drawer */
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            {/* Drawer Header */}
            {(dialogTitle || dialogDesc) && (
              <DrawerHeader>
                {dialogTitle && <DrawerTitle>{dialogTitle}</DrawerTitle>}
                {dialogDesc && <DrawerDescription>{dialogDesc}</DrawerDescription>}
              </DrawerHeader>
            )}

            <div className="px-4 pb-4 overflow-y-auto">
              {renderContent()}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

DialogFormField.displayName = 'DialogFormField';
