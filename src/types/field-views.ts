/**
 * Field View Type Definitions
 *
 * Bu dosya, field component'lerinin farklı görünüm tipleri (form, index, detail) için
 * type definition'ları içerir. Form/Index/Detail ayrımı ile separation of concerns sağlar.
 *
 * # Görünüm Tipleri
 *
 * - **Form View**: Form düzenleme sayfası - etkileşimli input'lar, validasyon
 * - **Index View**: Tablo/liste görünümü - minimal, salt okunur
 * - **Detail View**: Detay sayfası - zengin görünüm, ilişki bilgileri
 *
 * # Naming Convention
 *
 * - Form: `[FieldName]FormField` (örn: `TextFormField`)
 * - Index: `[FieldName]IndexField` (örn: `TextIndexField`)
 * - Detail: `[FieldName]DetailField` (örn: `TextDetailField`)
 *
 * # View Suffix Pattern
 *
 * Backend'den gelen `field.view` property'si ile view-specific component seçilir:
 * - `text-field-form` → TextFormField
 * - `text-field-index` → TextIndexField
 * - `text-field-detail` → TextDetailField
 *
 * # Fallback Mekanizması
 *
 * View-specific field yoksa, ana field component'i kullanılır (backward compatibility).
 */

import type { FieldData, FieldDefinition } from '@/types';

/**
 * Field görünüm tipleri
 *
 * - `form`: Form düzenleme görünümü
 * - `index`: Tablo/liste görünümü
 * - `detail`: Detay sayfası görünümü
 */
export type FieldView = 'form' | 'index' | 'detail';

/**
 * Form Field Component Props
 *
 * Form view'da kullanılan field component'leri için props interface'i.
 * Etkileşimli input'lar, validasyon ve form state yönetimi için gerekli tüm property'leri içerir.
 *
 * # Özellikler
 *
 * - **field**: Backend'den gelen field definition (FieldDefinition)
 * - **name**: Field'ın form içindeki unique adı
 * - **label**: Field'ın görünen etiketi
 * - **value**: Field'ın mevcut değeri
 * - **onChange**: Değer değişikliği callback'i
 * - **onBlur**: Focus kaybı callback'i (opsiyonel)
 * - **error**: Validasyon hata mesajı (opsiyonel)
 * - **disabled**: Field'ın devre dışı olup olmadığı
 * - **required**: Field'ın zorunlu olup olmadığı
 * - **placeholder**: Placeholder metni (opsiyonel)
 * - **helpText**: Yardım metni (opsiyonel)
 * - **container**: Portal container element'i (opsiyonel)
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * export const TextFormField: React.FC<FormFieldProps> = ({
 *   field,
 *   name,
 *   label,
 *   value,
 *   onChange,
 *   error,
 *   disabled,
 *   required,
 *   placeholder,
 *   helpText,
 * }) => {
 *   return (
 *     <DefaultField field={field} error={error} showHelpText={!!helpText}>
 *       <Input
 *         id={name}
 *         name={name}
 *         type="text"
 *         value={value}
 *         onChange={(e) => onChange(e.target.value)}
 *         disabled={disabled}
 *         placeholder={placeholder}
 *       />
 *     </DefaultField>
 *   );
 * };
 * ```
 */
export interface FormFieldProps {
  /** Backend'den gelen field definition */
  field: FieldDefinition;

  /** Field'ın form içindeki unique adı */
  name: string;

  /** Field'ın görünen etiketi */
  label: string;

  /** Field'ın mevcut değeri */
  value: any;

  /** Değer değişikliği callback'i */
  onChange: (value: any) => void;

  /** Focus kaybı callback'i (opsiyonel) */
  onBlur?: () => void;

  /** Validasyon hata mesajı (opsiyonel) */
  error?: string;

  /** Field'ın devre dışı olup olmadığı */
  disabled?: boolean;

  /** Field'ın zorunlu olup olmadığı */
  required?: boolean;

  /** Placeholder metni (opsiyonel) */
  placeholder?: string;

  /** Yardım metni (opsiyonel) */
  helpText?: string;

  /** Portal container element'i (opsiyonel) */
  container?: HTMLElement | null;

  /** Field-specific ek props (field.props'tan gelen değerler) */
  [key: string]: any;
}

/**
 * Index Field Component Props
 *
 * Index view'da (tablo/liste) kullanılan field component'leri için props interface'i.
 * Minimal, salt okunur görünüm için gerekli property'leri içerir.
 *
 * # Özellikler
 *
 * - **field**: Backend'den gelen field definition (FieldData)
 * - **record**: Tablo satırındaki kayıt verisi
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * export const TextIndexField: React.FC<IndexFieldProps> = ({ field, record }) => {
 *   const value = record[field.key]?.data || record[field.key] || '';
 *
 *   return (
 *     <span className={cn('text-sm', `text-${field.text_align || 'left'}`)}>
 *       {value || '—'}
 *     </span>
 *   );
 * };
 * ```
 */
export interface IndexFieldProps {
  /** Backend'den gelen field definition */
  field: FieldData;

  /** Tablo satırındaki kayıt verisi */
  record: Record<string, any>;
}

/**
 * Detail Field Component Props
 *
 * Detail view'da (detay sayfası) kullanılan field component'leri için props interface'i.
 * Zengin görünüm, ilişki bilgileri ve ek UI element'leri için gerekli property'leri içerir.
 *
 * # Özellikler
 *
 * - **field**: Backend'den gelen field definition (FieldData)
 * - **record**: Detay sayfasındaki kayıt verisi
 *
 * # Kullanım Örneği
 *
 * ```tsx
 * export const TextDetailField: React.FC<DetailFieldProps> = ({ field, record }) => {
 *   const value = record[field.key]?.data || record[field.key] || '';
 *
 *   return (
 *     <PanelItem field={field} copyable={field.props?.copyable}>
 *       <p className="text-sm">{value || '—'}</p>
 *     </PanelItem>
 *   );
 * };
 * ```
 */
export interface DetailFieldProps {
  /** Backend'den gelen field definition */
  field: FieldData;

  /** Detay sayfasındaki kayıt verisi */
  record: Record<string, any>;

  /** Resource name (ResourceDetail'den geçirilir) */
  resourceName?: string;

  /** Resource click handler (Detail modal içinde navigasyon için) */
  onResourceClick?: (resource: string, id: string | number) => void;
}

/**
 * Field Component Type
 *
 * Field component'lerinin generic type definition'ı.
 * Form, Index veya Detail view için kullanılabilir.
 */
export type FieldComponent<T = FormFieldProps | IndexFieldProps | DetailFieldProps> = React.FC<T>;

/**
 * View-Specific Field Component Map
 *
 * Her field type için view-specific component'lerin map'i.
 *
 * # Örnek
 *
 * ```typescript
 * const textFieldComponents: ViewSpecificFieldComponents = {
 *   form: TextFormField,
 *   index: TextIndexField,
 *   detail: TextDetailField,
 * };
 * ```
 */
export interface ViewSpecificFieldComponents {
  form?: FieldComponent<FormFieldProps>;
  index?: FieldComponent<IndexFieldProps>;
  detail?: FieldComponent<DetailFieldProps>;
}
