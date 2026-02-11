/**
 * Session Cache
 *
 * Auth store ile axios interceptor arasında paylaşılan
 * session önbellek yönetimi modülü.
 *
 * Bu modül circular dependency'yi önlemek için ayrı tutulur:
 * - `stores/auth.ts` bu modülü import eder
 * - `lib/axios.ts` bu modülü import eder
 * - İkisi arasında döngüsel bağımlılık oluşmaz
 *
 * ## Kullanım
 *
 * ### Session cache kontrolü:
 * ```ts
 * import { isSessionCacheValid, updateSessionCache, invalidateSessionCache } from '@/lib/session-cache';
 *
 * // Cache geçerli mi kontrol et
 * if (isSessionCacheValid()) {
 *   // API'ye gitme, mevcut state yeterli
 * }
 *
 * // Başarılı session sonrası cache'i güncelle
 * updateSessionCache();
 *
 * // Logout veya 401 durumunda cache'i temizle
 * invalidateSessionCache();
 * ```
 */

/**
 * Session önbellek TTL süresi (milisaniye).
 * Bu süre içinde checkSession() tekrar çağrılırsa
 * API'ye istek atılmaz, mevcut store state'i kullanılır.
 */
const SESSION_CACHE_TTL_MS = 60_000; // 60 saniye

/**
 * Son başarılı session kontrolünün timestamp'i.
 */
let lastSessionCheckAt = 0;

/**
 * Session cache'inin geçerli olup olmadığını kontrol eder.
 *
 * @returns true ise API'ye gitmeye gerek yok (TTL süresi dolmadı)
 */
export function isSessionCacheValid(): boolean {
    if (lastSessionCheckAt === 0) return false;
    return (Date.now() - lastSessionCheckAt) < SESSION_CACHE_TTL_MS;
}

/**
 * Session cache timestamp'ini günceller.
 * Başarılı session kontrolü veya login sonrası çağrılır.
 */
export function updateSessionCache(): void {
    lastSessionCheckAt = Date.now();
}

/**
 * Session cache'ini sıfırlar.
 * Logout, 401 interceptor veya başarısız session kontrolünde çağrılır.
 * Sonraki checkSession() çağrısı API'ye gidecektir.
 */
export function invalidateSessionCache(): void {
    lastSessionCheckAt = 0;
}
