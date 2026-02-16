import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useTranslation } from "@/hooks/useTranslation"
import { getBrowserLocale, normalizeDateValue } from "@/lib/date-display"

interface ProgressMetricProps {
  title: string
  payload?: Record<string, any>
}

type ProgressRow = {
  date: string
  [key: string]: string | number
}

type ProgressSeriesInput = {
  key?: string
  label?: string
  color?: string
  enabled?: boolean
}

type ProgressPayload = {
  subtitle?: string
  description?: string
  chartData?: unknown[]
  current?: unknown
  target?: unknown
  activeSeries?: string
  seriesOrder?: string[]
  series?: Record<string, ProgressSeriesInput>
}

type ResolvedSeries = {
  id: string
  key: string
  label: string
  color: string
  enabled: boolean
}

const DEFAULT_SERIES: ResolvedSeries[] = [
  {
    id: "desktop",
    key: "desktop",
    label: "Desktop",
    color: "var(--chart-1)",
    enabled: true,
  },
  {
    id: "mobile",
    key: "mobile",
    label: "Mobile",
    color: "var(--chart-2)",
    enabled: true,
  },
]

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    if (value.trim() === "") return undefined
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const toNumber = (value: unknown): number => {
  return parseNumber(value) ?? 0
}

const defaultColor = (index: number) => `var(--chart-${(index % 5) + 1})`

const normalizeSeriesId = (value: string, fallback: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || fallback
}

const defaultSeriesLabel = (
  id: string,
  t: (key: string, fallback?: string) => string
): string => {
  if (id === "desktop") return t("widgets.chart.desktop_label", "Desktop")
  if (id === "mobile") return t("widgets.chart.mobile_label", "Mobile")

  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const resolveSeries = (
  payload: ProgressPayload,
  t: (key: string, fallback?: string) => string
): ResolvedSeries[] => {
  const input = payload.series ?? {}
  const sourceEntries = Object.entries(input)

  let series: ResolvedSeries[] = sourceEntries.map(([rawId, rawConfig], index) => {
    const normalizedId = normalizeSeriesId(rawId, `series-${index + 1}`)
    const normalizedKey = normalizeSeriesId(rawConfig.key ?? normalizedId, normalizedId)

    return {
      id: normalizedId,
      key: normalizedKey,
      label: rawConfig.label || defaultSeriesLabel(normalizedId, t),
      color: rawConfig.color || defaultColor(index),
      enabled: rawConfig.enabled ?? true,
    }
  })

  if (series.length === 0) {
    series = DEFAULT_SERIES.map((item, index) => ({
      ...item,
      label: defaultSeriesLabel(item.id, t),
      color: defaultColor(index),
    }))
  }

  const usedIds = new Set<string>()
  const usedKeys = new Set<string>()

  series = series.map((item, index) => {
    let id = item.id
    let key = item.key

    let idCounter = 2
    while (usedIds.has(id)) {
      id = `${item.id}-${idCounter}`
      idCounter += 1
    }

    let keyCounter = 2
    while (usedKeys.has(key)) {
      key = `${item.key}-${keyCounter}`
      keyCounter += 1
    }

    usedIds.add(id)
    usedKeys.add(key)

    return {
      ...item,
      id,
      key,
      color: item.color || defaultColor(index),
      enabled: item.enabled,
    }
  })

  const orderSource = Array.isArray(payload.seriesOrder) ? payload.seriesOrder : []
  const orderIndex = new Map<string, number>()
  orderSource.forEach((entry, index) => {
    const normalized = normalizeSeriesId(entry, "")
    if (normalized) {
      orderIndex.set(normalized, index)
    }
  })

  series.sort((a, b) => {
    const indexA = orderIndex.get(a.id) ?? orderIndex.get(a.key)
    const indexB = orderIndex.get(b.id) ?? orderIndex.get(b.key)

    if (indexA !== undefined || indexB !== undefined) {
      if (indexA === undefined) return 1
      if (indexB === undefined) return -1
      if (indexA !== indexB) return indexA - indexB
    }

    return a.label.localeCompare(b.label)
  })

  if (!series.some((item) => item.enabled) && series.length > 0) {
    series[0] = {
      ...series[0],
      enabled: true,
    }
  }

  return series
}

const firstNumberFromRow = (row: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    if (!key) continue
    if (!(key in row)) continue
    const parsed = parseNumber(row[key])
    if (parsed !== undefined) {
      return parsed
    }
  }

  return undefined
}

const resolveActiveSeriesKey = (activeSeries: string | undefined, series: ResolvedSeries[]): string => {
  const enabled = series.filter((item) => item.enabled)
  const fallback = enabled[0] ?? series[0]
  if (!fallback) return "desktop"

  if (!activeSeries) {
    return fallback.key
  }

  const normalized = normalizeSeriesId(activeSeries, "")
  const byId = enabled.find((item) => item.id === normalized)
  if (byId) return byId.key

  const byKey = enabled.find((item) => item.key === normalized)
  if (byKey) return byKey.key

  const byIdAny = series.find((item) => item.id === normalized)
  if (byIdAny) return byIdAny.key

  const byKeyAny = series.find((item) => item.key === normalized)
  if (byKeyAny) return byKeyAny.key

  return fallback.key
}

const generateFallbackData = (
  current: number,
  target: number,
  series: ResolvedSeries[],
  activeSeriesKey: string
): ProgressRow[] => {
  const base = new Date()
  const days = 30
  const ordered = [...series].sort((a, b) => {
    const aActive = a.key === activeSeriesKey
    const bActive = b.key === activeSeriesKey
    if (aActive !== bActive) return aActive ? -1 : 1
    return a.label.localeCompare(b.label)
  })

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(base)
    date.setDate(base.getDate() - (days - index - 1))

    const ratio = (index + 1) / days
    const row: ProgressRow = {
      date: date.toISOString().slice(0, 10),
    }

    ordered.forEach((seriesItem, seriesIndex) => {
      if (seriesIndex === 0) {
        row[seriesItem.key] = Math.round(current * ratio)
      } else if (seriesIndex === 1) {
        row[seriesItem.key] = target
      } else {
        row[seriesItem.key] = 0
      }
    })

    return row
  })
}

const normalizeLineData = (
  payload: ProgressPayload,
  series: ResolvedSeries[],
  activeSeriesKey: string
): ProgressRow[] => {
  const source = Array.isArray(payload.chartData) ? payload.chartData : []
  const current = toNumber(payload.current)
  const target = toNumber(payload.target)

  const ordered = [...series].sort((a, b) => {
    const aActive = a.key === activeSeriesKey
    const bActive = b.key === activeSeriesKey
    if (aActive !== bActive) return aActive ? -1 : 1
    return a.label.localeCompare(b.label)
  })

  const normalized = source
    .map((item: unknown) => {
      const row = (item ?? {}) as Record<string, unknown>
      const date = String(row.date ?? row.month ?? "")
      const normalizedRow: ProgressRow = { date }

      ordered.forEach((seriesItem, seriesIndex) => {
        const fallbackKeys = [seriesItem.key, seriesItem.id]
        if (seriesIndex === 0) {
          fallbackKeys.push("current", "value", "desktop")
        } else if (seriesIndex === 1) {
          fallbackKeys.push("target", "mobile")
        }

        const value = firstNumberFromRow(row, fallbackKeys)
        if (value !== undefined) {
          normalizedRow[seriesItem.key] = value
          return
        }

        if (seriesIndex === 0) {
          normalizedRow[seriesItem.key] = current
        } else if (seriesIndex === 1) {
          normalizedRow[seriesItem.key] = target
        } else {
          normalizedRow[seriesItem.key] = 0
        }
      })

      return normalizedRow
    })
    .filter((item) => item.date.length > 0)

  if (normalized.length > 0) {
    return normalized
  }

  return generateFallbackData(current, target, ordered, activeSeriesKey)
}

const resolveTotals = (rows: ProgressRow[], series: ResolvedSeries[]): Record<string, number> => {
  const totals: Record<string, number> = {}
  series.forEach((item) => {
    totals[item.id] = rows.reduce((acc, row) => acc + toNumber(row[item.key]), 0)
  })
  return totals
}

const resolveActiveSeriesId = (activeSeriesKey: string, series: ResolvedSeries[]): string => {
  const enabled = series.filter((item) => item.enabled)
  const byKey = enabled.find((item) => item.key === activeSeriesKey)
  if (byKey) return byKey.id

  const fallback = enabled[0] ?? series[0]
  return fallback?.id ?? ""
}

export function ProgressMetric({ title, payload: rawPayload }: ProgressMetricProps) {
  const { t } = useTranslation()
  const locale = getBrowserLocale()
  const payload = (rawPayload ?? {}) as ProgressPayload

  const shortDateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }),
    [locale]
  )
  const longDateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }),
    [locale]
  )
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat(locale), [locale])

  const series = React.useMemo(() => resolveSeries(payload, t), [payload, t])
  const preferredActiveSeriesKey = React.useMemo(
    () => resolveActiveSeriesKey(payload.activeSeries, series),
    [payload.activeSeries, series]
  )
  const chartData = React.useMemo(
    () => normalizeLineData(payload, series, preferredActiveSeriesKey),
    [payload, preferredActiveSeriesKey, series]
  )

  const availableSeries = React.useMemo(
    () => series.filter((item) => item.enabled),
    [series]
  )

  const [activeSeriesId, setActiveSeriesId] = React.useState<string>(() =>
    resolveActiveSeriesId(preferredActiveSeriesKey, series)
  )

  React.useEffect(() => {
    const next = resolveActiveSeriesId(preferredActiveSeriesKey, series)
    setActiveSeriesId((prev) => (prev === next ? prev : next))
  }, [preferredActiveSeriesKey, series])

  React.useEffect(() => {
    if (!availableSeries.some((item) => item.id === activeSeriesId)) {
      setActiveSeriesId(availableSeries[0]?.id ?? series[0]?.id ?? "")
    }
  }, [activeSeriesId, availableSeries, series])

  const activeSeries = React.useMemo(() => {
    return (
      availableSeries.find((item) => item.id === activeSeriesId) ||
      availableSeries[0] ||
      series[0]
    )
  }, [activeSeriesId, availableSeries, series])

  const totals = React.useMemo(() => resolveTotals(chartData, series), [chartData, series])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      views: {
        label: t("widgets.chart.views_label", "Views"),
      },
    }

    series.forEach((item) => {
      config[item.key] = {
        label: item.label,
        color: item.color,
      }
    })

    return config
  }, [series, t])

  const subtitle = payload.subtitle || payload.description || ""

  const formatDate = React.useCallback(
    (value: string, mode: "short" | "long"): string => {
      const parsed = normalizeDateValue(value)
      if (!parsed) return value
      return mode === "short" ? shortDateFormatter.format(parsed) : longDateFormatter.format(parsed)
    },
    [longDateFormatter, shortDateFormatter]
  )

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{title}</CardTitle>
          {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
        </div>
        <div className="flex">
          {availableSeries.map((seriesItem) => (
            <button
              key={seriesItem.id}
              data-active={activeSeries?.id === seriesItem.id}
              className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveSeriesId(seriesItem.id)}
            >
              <span className="text-muted-foreground text-xs">{seriesItem.label}</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {numberFormatter.format(totals[seriesItem.id] ?? 0)}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatDate(String(value), "short")}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => formatDate(String(value), "long")}
                  formatter={(value) => numberFormatter.format(Number(value) || 0)}
                />
              }
            />
            <Line
              dataKey={activeSeries?.key || "desktop"}
              type="monotone"
              stroke={`var(--color-${activeSeries?.key || "desktop"})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
