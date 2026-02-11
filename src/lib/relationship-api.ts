/**
 * Relationship Search API
 *
 * Mevcut resource index API'sini kullanarak relationship field'lar için arama yapar.
 * Search parametresi backend'de searchable field'lar üzerinden arama yapar.
 */

import api from './axios';
import type { Resource } from '@/types';

/**
 * Backend'den gelen field değerini normalize eder
 * FieldData objesi ise .data property'sini extract eder
 */
function extractFieldValue(field: any): any {
  if (!field) return field;
  // Eğer field bir obje ve data property'si varsa, data'yı döndür
  if (typeof field === 'object' && 'data' in field) {
    return field.data;
  }
  return field;
}

/**
 * Backend'den gelen resource item'ı normalize eder
 * Her field'ın .data property'sini extract eder
 */
function normalizeResourceItem(item: any): Resource {
  const normalized: any = {};
  
  // Her field'ı normalize et
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      normalized[key] = extractFieldValue(item[key]);
    }
  }
  
  return normalized as Resource;
}

/**
 * Relationship field'da arama yap
 *
 * Mevcut resource index API'sini kullanır: GET /api/resources/{resource}
 * Backend'de searchable field'lar üzerinden arama yapılır.
 *
 * @param resourceType - Aranacak resource tipi (örn: "users", "posts")
 * @param query - Arama terimi
 * @returns Promise<Resource[]> - Bulunan resource'lar
 *
 * Kullanım:
 * ```ts
 * const results = await searchRelationship('users', 'john');
 * // Backend'de searchable field'lar (name, email, vb.) üzerinden arama yapılır
 * ```
 */
export async function searchRelationship(
  resourceType: string,
  query: string
): Promise<Resource[]> {
  try {
    // Mevcut resource index API'sini kullan
    // URL formatı: /api/resource/{resource}?{resource}[search]={query}
    const params: Record<string, any> = {
      [`${resourceType}[per_page]`]: 20, // Sonuçları sınırla
    };

    // Query boş değilse, search parametresi ekle
    if (query && query.trim().length > 0) {
      params[`${resourceType}[search]`] = query;
    }

    const response = await api.get<{ data: any[] }>(
      `/resource/${resourceType}`,
      { params }
    );

    // Backend response'unu normalize et - her field'ın .data property'sini extract et
    const rawData = response.data?.data || [];
    return rawData.map(normalizeResourceItem);
  } catch (error) {
    console.error(`Relationship search failed for ${resourceType}:`, error);
    return [];
  }
}

/**
 * MorphTo field için arama yap
 *
 * @param resourceType - Aranacak resource tipi
 * @param morphType - Morph tipi (örn: "App\\Models\\User")
 * @param query - Arama terimi
 * @returns Promise<Resource[]> - Bulunan resource'lar
 */
export async function searchMorphToRelationship(
  resourceType: string,
  morphType: string,
  query: string
): Promise<Resource[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const response = await api.get<{ data: any[] }>(
      `/resource/${resourceType}`,
      {
        params: {
          [`${resourceType}[search]`]: query,
          [`${resourceType}[per_page]`]: 20,
          morph_type: morphType, // MorphTo için tip filtresi
        },
      }
    );

    // Backend response'unu normalize et - her field'ın .data property'sini extract et
    const rawData = response.data?.data || [];
    return rawData.map(normalizeResourceItem);
  } catch (error) {
    console.error(`MorphTo search failed for ${resourceType}:`, error);
    return [];
  }
}
