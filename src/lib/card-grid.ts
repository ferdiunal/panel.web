const CARD_GRID_SPANS: Record<string, string> = {
    full: "col-span-1 md:col-span-2 lg:col-span-6 xl:col-span-12",
    "3/4": "col-span-1 md:col-span-2 lg:col-span-5 xl:col-span-9",
    "2/3": "col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-8",
    "1/2": "col-span-1 md:col-span-1 lg:col-span-3 xl:col-span-6",
    "1/4": "col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-3",
    "1/3": "col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-4",
}

const DEFAULT_CARD_GRID_SPAN = CARD_GRID_SPANS["1/3"]

export function getCardGridSpan(width?: string): string {
    const normalizedWidth = width?.trim().toLowerCase()
    if (!normalizedWidth) return DEFAULT_CARD_GRID_SPAN
    return CARD_GRID_SPANS[normalizedWidth] || DEFAULT_CARD_GRID_SPAN
}
