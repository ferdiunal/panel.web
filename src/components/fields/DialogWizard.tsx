/**
 * DialogWizard Component
 *
 * Multi-step wizard component for dialog içinde adım adım form gösterme.
 * Her adım kendi field'larına sahiptir ve kullanıcı adımlar arasında gezinebilir.
 */

import React, { useState } from 'react';
import { UniversalResourceForm } from '@/components/forms/UniversalResourceForm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DialogWizardProps } from '@/types/dialog';

/**
 * DialogWizard - Multi-step wizard component
 *
 * Kullanım:
 * ```tsx
 * <DialogWizard
 *   steps={[
 *     {
 *       index: 0,
 *       title: 'Kişisel Bilgiler',
 *       description: 'Önce sizi tanıyalım',
 *       fields: [
 *         { key: 'name', name: 'Ad', view: 'text-field', required: true },
 *         { key: 'email', name: 'Email', view: 'email-field', required: true },
 *       ],
 *       can_skip: false,
 *     },
 *     {
 *       index: 1,
 *       title: 'Tercihler',
 *       description: 'Tercihlerinizi belirleyin',
 *       fields: [
 *         { key: 'notifications', name: 'Bildirimler', view: 'switch-field' },
 *       ],
 *       can_skip: true,
 *     },
 *   ]}
 *   initialData={{ name: 'John' }}
 *   onComplete={(data) => console.log('Wizard completed:', data)}
 *   onSkip={() => console.log('Wizard skipped')}
 *   onCancel={() => console.log('Wizard cancelled')}
 * />
 * ```
 */
export const DialogWizard: React.FC<DialogWizardProps> = ({
  steps,
  initialData = {},
  onComplete,
  onSkip,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  // Mevcut adım verisi
  const currentStepData = steps[currentStep];

  // Adım tamamlandığında çağrılır
  const handleStepComplete = async (stepData: Record<string, any>) => {
    // Form data'yı birleştir
    const newData = { ...formData, ...stepData };
    setFormData(newData);

    // Son adım mı kontrol et
    if (currentStep === steps.length - 1) {
      // Son adım - wizard'ı tamamla
      onComplete(newData);
    } else {
      // Sonraki adıma geç
      setCurrentStep(currentStep + 1);
    }
  };

  // Geri butonuna tıklandığında
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      // İlk adımdaysa iptal et
      onCancel();
    }
  };

  // Atla butonuna tıklandığında
  const handleSkip = () => {
    if (currentStepData.can_skip) {
      onSkip();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Adım {currentStep + 1} / {steps.length}
          </span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((_step, idx) => (
            <div
              key={idx}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                idx < currentStep
                  ? 'bg-primary' // Tamamlanmış adımlar
                  : idx === currentStep
                  ? 'bg-primary/70' // Mevcut adım
                  : 'bg-muted' // Gelecek adımlar
              )}
            />
          ))}
        </div>
      </div>

      {/* Step header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
        {currentStepData.description && (
          <p className="text-sm text-muted-foreground">
            {currentStepData.description}
          </p>
        )}
      </div>

      {/* Step form */}
      <div className="min-h-[200px]">
        <UniversalResourceForm
          formId={`wizard-step-${currentStep}-${Date.now()}`}
          resourceType="wizard"
          mode="create"
          fields={currentStepData.fields}
          initialData={formData}
          onSubmit={handleStepComplete}
          onCancel={handleBack}
          enableDependentFields={true}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {/* Geri butonu */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
          >
            {currentStep === 0 ? 'İptal' : 'Geri'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Atla butonu (eğer izin veriliyorsa) */}
          {currentStepData.can_skip && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
            >
              Atla
            </Button>
          )}

          {/* İleri/Tamamla butonu - UniversalResourceForm'un submit butonu tarafından handle ediliyor */}
        </div>
      </div>
    </div>
  );
};
