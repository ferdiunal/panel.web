import { useState, useEffect } from "react"

export function useMediaQuery(query: string) {
    const [value, setValue] = useState(false)

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null

        function onChange(event: MediaQueryListEvent) {
            // Debounce media query changes (150ms)
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            timeoutId = setTimeout(() => {
                setValue(event.matches)
            }, 150)
        }

        const result = matchMedia(query)
        result.addEventListener("change", onChange)
        setValue(result.matches)

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            result.removeEventListener("change", onChange)
        }
    }, [query])

    return value
}
