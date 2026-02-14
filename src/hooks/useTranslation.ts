/**
 * useTranslation Hook
 *
 * window.Init.translations'dan çeviri mesajlarını okur.
 * Dot notation ile key erişimi sağlar.
 *
 * ## Kullanım
 * ```tsx
 * const { t } = useTranslation()
 * t("auth.login.title") // "Giriş Yap"
 * t("auth.login.notExist", "Varsayılan") // "Varsayılan"
 * ```
 */

import { useCallback } from "react"

type Translations = Record<string, string>

function getTranslations(): Translations {
    return (window.Init?.translations as Translations) || {}
}

export function useTranslation() {
    const translations = getTranslations()

    /**
     * Çeviri key'ine göre mesaj döner.
     * Key bulunamazsa fallback döner, fallback yoksa key'in kendisi döner.
     */
    const t = useCallback((key: string, fallback?: string): string => {
        return translations[key] ?? fallback ?? key
    }, [translations])

    return { t }
}

/**
 * Component dışında çeviri almak için yardımcı fonksiyon.
 * Örn: Zod validation mesajlarında kullanımı.
 */
export function t(key: string, fallback?: string): string {
    const translations = getTranslations()
    return translations[key] ?? fallback ?? key
}
