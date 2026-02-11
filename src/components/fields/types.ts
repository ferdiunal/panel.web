/**
 * Base Field Types - Mikro Frontend Pattern
 *
 * Tüm field component'leri için standart props interface'leri
 * Tutarlı ve type-safe field component'leri oluşturmak için kullanılır
 */

/**
 * BaseFieldProps - Tüm field'lar için temel props interface'i
 *
 * Her field component bu interface'i extend etmelidir
 */
export interface BaseFieldProps {
  /** Field adı (HTML name attribute) */
  name: string;

  /** Field label'ı */
  label?: string;

  /** Field değeri */
  value: any;

  /** Değer değiştiğinde çağrılacak callback */
  onChange: (value: any) => void;

  /** Blur event callback */
  onBlur?: () => void;

  /** Hata mesajı */
  error?: string;

  /** Field disabled mi? */
  disabled?: boolean;

  /** Zorunlu field mi? */
  required?: boolean;

  /** Placeholder metni */
  placeholder?: string;

  /** Yardım metni */
  helpText?: string;

  /** Ek CSS class'ları */
  className?: string;

  /** Portal container (dropdown'lar için) */
  container?: HTMLElement | null;
}

/**
 * TextFieldProps - Text input field'lar için props
 */
export interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

/**
 * NumberFieldProps - Number input field'lar için props
 */
export interface NumberFieldProps extends BaseFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * SelectFieldProps - Select field'lar için props
 */
export interface SelectFieldProps extends BaseFieldProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Array<{ value: string; label: string }> | Record<string, string>;
  multiple?: boolean;
  searchable?: boolean;
}

/**
 * RelationshipFieldProps - Relationship field'lar için props
 */
export interface RelationshipFieldProps extends BaseFieldProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  resourceType: string;
  related_resource: string;
  searchFn: (query: string) => Promise<any[]>;
  options?: Record<string, string>;
  multiple?: boolean;
  parentResourceId?: string | number;
}

/**
 * DateFieldProps - Date field'lar için props
 */
export interface DateFieldProps extends BaseFieldProps {
  value: Date | string | null;
  onChange: (value: Date | string | null) => void;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

/**
 * BooleanFieldProps - Boolean field'lar için props
 */
export interface BooleanFieldProps extends BaseFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
  variant?: 'checkbox' | 'switch';
}

/**
 * FileFieldProps - File upload field'lar için props
 */
export interface FileFieldProps extends BaseFieldProps {
  value: File | File[] | string | string[] | null;
  onChange: (value: File | File[] | string | string[] | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  preview?: boolean;
}

/**
 * FieldComponentProps - FieldRenderer'dan gelen props
 *
 * FieldRenderer, field definition'ı bu formata dönüştürür
 */
export interface FieldComponentProps extends BaseFieldProps {
  field: any; // FieldDefinition
  [key: string]: any; // Field-specific props
}

/**
 * FieldLayoutVariant - Layout variant'ları
 */
export type FieldLayoutVariant = 'vertical' | 'horizontal' | 'inline';

/**
 * FieldSize - Field boyutları
 */
export type FieldSize = 'sm' | 'md' | 'lg';

/**
 * FieldState - Field durumları
 */
export interface FieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

/**
 * FieldValidator - Field validation fonksiyonu
 */
export type FieldValidator = (value: any) => string | undefined;

/**
 * FieldTransformer - Field değer dönüştürme fonksiyonu
 */
export type FieldTransformer = (value: any) => any;
