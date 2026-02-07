/**
 * DialogContent Component
 *
 * Basit form içeriği için component.
 * UniversalResourceForm kullanarak dialog içinde form gösterir.
 */

import React from 'react';
import { UniversalResourceForm } from '@/components/forms/UniversalResourceForm';
import type { DialogContentProps } from '@/types/dialog';

/**
 * DialogContent - Basit form content component
 *
 * Dialog içinde basit form gösterir. UniversalResourceForm'u wrapper'layarak
 * dialog-specific props'ları handle eder.
 *
 * Kullanım:
 * ```tsx
 * <DialogContent
 *   fields={[
 *     { key: 'name', name: 'Ad', view: 'text-field', required: true },
 *     { key: 'email', name: 'Email', view: 'email-field', required: true },
 *   ]}
 *   initialData={{ name: 'John', email: 'john@example.com' }}
 *   onComplete={(data) => console.log('Form completed:', data)}
 *   onCancel={() => console.log('Form cancelled')}
 * />
 * ```
 */
export const DialogContent: React.FC<DialogContentProps> = ({
  fields,
  initialData,
  onComplete,
  onCancel,
}) => {
  // onComplete'i async wrapper'a çevir (UniversalResourceForm async bekliyor)
  const handleSubmit = async (data: Record<string, any>) => {
    onComplete(data);
  };

  return (
    <UniversalResourceForm
      formId={`dialog-${Date.now()}`}
      resourceType="dialog"
      mode="create"
      fields={fields}
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      enableDependentFields={true}
    />
  );
};
