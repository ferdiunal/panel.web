/**
 * DialogField type definitions
 *
 * DialogField, modal/dialog içinde form veya wizard gösteren bir field tipidir.
 * Kullanıcıdan modal içinde veri toplamak veya multi-step wizard formları için kullanılır.
 */

import type { FieldDefinition } from './form';

/**
 * Dialog içeriğinin tipi
 */
export type DialogContentType = 'form' | 'wizard';

/**
 * Dialog boyutu
 */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Wizard adımı
 *
 * Multi-step wizard formları için bir adımı temsil eder.
 * Her adım kendi field'larına sahiptir ve atlanabilir veya zorunlu olabilir.
 */
export interface WizardStep {
  /** Adım sırası (0'dan başlar) */
  index: number;

  /** Adım başlığı */
  title: string;

  /** Adım açıklaması */
  description?: string;

  /** Adımdaki field'lar */
  fields: FieldDefinition[];

  /** Adım atlanabilir mi? */
  can_skip: boolean;
}

/**
 * DialogField component props
 *
 * DialogField component'i için gerekli props'lar.
 */
export interface DialogFieldProps {
  /** Field adı (form key) */
  name: string;

  /** Field label */
  label: string;

  /** Field değeri */
  value?: Record<string, any>;

  /** Değer değiştiğinde çağrılır */
  onChange?: (value: Record<string, any>) => void;

  /** Hata mesajı */
  error?: string;

  /** Field devre dışı mı? */
  disabled?: boolean;

  /** Field zorunlu mu? */
  required?: boolean;

  /** Yardım metni */
  helpText?: string;

  /** CSS class */
  className?: string;

  // DialogField özel özellikleri

  /** Varsayılan açık mı? (true ise sayfa yüklendiğinde otomatik açılır) */
  defaultOpen?: boolean;

  /** Trigger buton metni (boşsa varsayılan açık) */
  triggerButton?: string;

  /** Trigger buton ikonu */
  triggerIcon?: string;

  /** Dialog içeriğinin tipi */
  contentType: DialogContentType;

  /** Basit form için field'lar */
  fields?: FieldDefinition[];

  /** Wizard için adımlar */
  steps?: WizardStep[];

  /** Dialog başlığı */
  dialogTitle?: string;

  /** Dialog açıklaması */
  dialogDesc?: string;

  /** Dialog boyutu */
  dialogSize?: DialogSize;
}

/**
 * DialogContent component props
 *
 * Basit form içeriği için props.
 */
export interface DialogContentProps {
  /** Form field'ları */
  fields: FieldDefinition[];

  /** Başlangıç verisi */
  initialData?: Record<string, any>;

  /** Form tamamlandığında çağrılır */
  onComplete: (data: Record<string, any>) => void;

  /** İptal edildiğinde çağrılır */
  onCancel: () => void;
}

/**
 * DialogWizard component props
 *
 * Multi-step wizard için props.
 */
export interface DialogWizardProps {
  /** Wizard adımları */
  steps: WizardStep[];

  /** Başlangıç verisi */
  initialData?: Record<string, any>;

  /** Wizard tamamlandığında çağrılır */
  onComplete: (data: Record<string, any>) => void;

  /** Wizard atlandığında çağrılır */
  onSkip: () => void;

  /** İptal edildiğinde çağrılır */
  onCancel: () => void;
}
