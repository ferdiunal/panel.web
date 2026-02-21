/**
 * Lens Type Definitions
 *
 * Lens özelliği için gerekli TypeScript type tanımları.
 * Resource verilerini farklı perspektiflerden görüntülemek için kullanılır.
 */

import type { ResourceItem, FieldData } from '../types';

/**
 * Lens Verisi
 * Backend'den dönen lens bilgilerini temsil eder
 */
export interface LensData {
  /** Lens'in görünen adı */
  name: string;
  /** Lens'in URL-friendly slug'ı */
  slug: string;
  /** Lens açıklaması (opsiyonel) */
  description?: string;
}

/**
 * Lens Response
 * Backend'den dönen lens view verilerini temsil eder
 */
export interface LensResponse {
  /** Lens'in görünen adı */
  name: string;
  /** Lens'e ait resource kayıtları */
  resources: ResourceItem[];
  /** Önceki sayfa URL'i (pagination için) */
  prevPageUrl: string | null;
  /** Sonraki sayfa URL'i (pagination için) */
  nextPageUrl: string | null;
  /** Sayfa başına kayıt sayısı */
  perPage: number;
  /** Soft delete desteği var mı? */
  softDeletes: boolean;
  /** ID alanı var mı? */
  hasId: boolean;
  /** Grid görünümü resource seviyesinde aktif mi? */
  grid_enabled?: boolean;
  /** Lens'e ait header field'ları */
  headers?: FieldData[];
  /** Kayıt başlığı için kullanılacak field key */
  record_title_key?: string;
}

/**
 * Lens View Props
 * LensView component'inin prop'ları
 */
export interface LensViewProps {
  /** Resource adı (örn: "users") */
  resourceName: string;
  /** Lens slug'ı (örn: "active-users") */
  lensSlug: string;
  /** Arama özelliği aktif mi? */
  searchable?: boolean;
  /** Sayfa başına kayıt seçenekleri */
  perPageOptions?: number[];
}

/**
 * Lens Selector Props
 * LensSelector component'inin prop'ları
 */
export interface LensSelectorProps {
  /** Resource adı */
  resourceName: string;
  /** Mevcut lens'ler listesi */
  lenses: LensData[];
  /** Şu anda aktif olan lens slug'ı (opsiyonel) */
  currentLens?: string;
}

/**
 * Lens Query Parameters
 * Lens API çağrıları için query parametreleri
 */
export interface LensQueryParams {
  /** Sayfa numarası */
  page?: number;
  /** Sayfa başına kayıt sayısı */
  per_page?: number;
  /** Arama sorgusu */
  search?: string;
  /** Sıralama kolonu */
  sort_by?: string;
  /** Sıralama yönü */
  sort_order?: 'asc' | 'desc';
  /** Filtreler (opsiyonel) */
  filters?: Record<string, any>;
  /** Görünüm modu */
  view?: 'table' | 'grid';
}
