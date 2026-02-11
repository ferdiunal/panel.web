/**
 * useDebounce Hook
 *
 * Bir değeri belirli bir süre sonra günceller (debounce).
 * Async search gibi senaryolarda kullanılır.
 *
 * Kullanım:
 * ```tsx
 * const [search, setSearch] = useState("")
 * const debouncedSearch = useDebounce(search, 300)
 *
 * useEffect(() => {
 *   // API call with debouncedSearch
 * }, [debouncedSearch])
 * ```
 */

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Delay sonrasında değeri güncelle
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: önceki timeout'u iptal et
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
