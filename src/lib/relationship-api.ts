/**
 * Relationship Search API
 *
 * Mevcut resource index API'sini kullanarak relationship field'lar için arama yapar.
 * Search parametresi backend'de searchable field'lar üzerinden arama yapar.
 */

import api from './axios';
import type { Resource } from '@/types';

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
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // Mevcut resource index API'sini kullan
    // URL formatı: /api/resources/{resource}?{resource}[search]={query}
    const response = await api.get<{ data: Resource[] }>(
      `/resources/${resourceType}`,
      {
        params: {
          [`${resourceType}[search]`]: query,
          [`${resourceType}[per_page]`]: 20, // Sonuçları sınırla
        },
      }
    );

    return response.data?.data || [];
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
    const response = await api.get<{ data: Resource[]  }>(
      `/resources/${resourceType}`,
      {
        params: {
          [`${resourceType}[search]`]: query,
          [`${resourceType}[per_page]`]: 20,
          morph_type: morphType, // MorphTo için tip filtresi
        },
      }
    );

    return response.data?.data || [];
  } catch (error) {
    console.error(`MorphTo search failed for ${resourceType}:`, error);
    return [];
  }
}
