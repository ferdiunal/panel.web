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

type ProgressSeriesConfig = {
  key: string
  label: string
  color: string
  enabled: boolean
}

type ProgressPayload = {
  subtitle?: string
  description?: string
  chartData?: unknown[]
  current?: unknown
  target?: unknown
  activeSeries?: string
  series?: Record<string, Partial<ProgressSeriesConfig>>
}

const SERIES_ORDER = ["desktop", "mobile"] as const
type SeriesAlias = (typeof SERIES_ORDER)[number]

const DEFAULT_SERIES: Record<SeriesAlias, ProgressSeriesConfig> = {
  desktop: {
    key: "desktop",
    label: "Desktop",
    color: "var(--chart-1)",
    enabled: true,
  },
  mobile: {
    key: "mobile",
    label: "Mobile",
    color: "var(--chart-2)",
    enabled: true,
  },
}

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

const normalizeSeriesKey = (value: unknown, fallback: string): string => {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : ""
  const base = raw || fallback
  const normalized = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  return normalized || fallback
}

const uniqueSeriesKey = (alias: string, used: Set<string>): string => {
  const base = normalizeSeriesKey(alias, "series")
  let candidate = base
  let i = 2
  while (used.has(candidate)) {
    candidate = `${base}-${i}`
    i += 1
  }
  return candidate
}

const resolveSeriesConfig = (
  payload: ProgressPayload,
  t: (key: string, fallback?: string) => string
): Record<SeriesAlias, ProgressSeriesConfig> => {
  const input = payload.series ?? {}
  const resolved: Record<SeriesAlias, ProgressSeriesConfig> = {
    desktop: DEFAULT_SERIES.desktop,
    mobile: DEFAULT_SERIES.mobile,
  }

  for (const alias of SERIES_ORDER) {
    const raw = input[alias] ?? {}
    resolved[alias] = {
      key: normalizeSeriesKey(raw.key, DEFAULT_SERIES[alias].key),
      label:
        raw.label ||
        (alias === "desktop"
          ? t("widgets.chart.desktop_label", DEFAULT_SERIES.desktop.label)
          : t("widgets.chart.mobile_label", DEFAULT_SERIES.mobile.label)),
      color: raw.color || DEFAULT_SERIES[alias].color,
      enabled: raw.enabled ?? DEFAULT_SERIES[alias].enabled,
    }
  }

  if (!SERIES_ORDER.some((alias) => resolved[alias].enabled)) {
    resolved.desktop = {
      ...resolved.desktop,
      enabled: true,
    }
  }

  const usedKeys = new Set<string>()
  for (const alias of SERIES_ORDER) {
    const cfg = resolved[alias]
    const key = usedKeys.has(cfg.key) ? uniqueSeriesKey(alias, usedKeys) : cfg.key
    usedKeys.add(key)
    resolved[alias] = {
      ...cfg,
      key,
    }
  }

  return resolved
}

const generateFallbackData = (
  current: number,
  target: number,
  seriesConfig: Record<SeriesAlias, ProgressSeriesConfig>
): ProgressRow[] => {
  const base = new Date()
  const days = 30

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(base)
    date.setDate(base.getDate() - (days - index - 1))

    const ratio = (index + 1) / days
    const row: ProgressRow = {
      date: date.toISOString().slice(0, 10),
    }
    row[seriesConfig.desktop.key] = Math.round(current * ratio)
    row[seriesConfig.mobile.key] = target

    return {
      ...row,
    }
  })
}

const normalizeLineData = (
  payload: ProgressPayload,
  seriesConfig: Record<SeriesAlias, ProgressSeriesConfig>
): ProgressRow[] => {
  const source = Array.isArray(payload.chartData) ? payload.chartData : []
  const current = toNumber(payload.current)
  const target = toNumber(payload.target)

  const normalized = source
    .map((item: unknown) => {
      const row = (item ?? {}) as Record<string, unknown>
      const date = String(row.date ?? row.month ?? "")
      const normalizedRow: ProgressRow = { date }

      const desktopValue = firstNumberFromRow(row, [
        seriesConfig.desktop.key,
        "desktop",
        "current",
        "value",
      ])
      const mobileValue = firstNumberFromRow(row, [seriesConfig.mobile.key, "mobile", "target"])

      normalizedRow[seriesConfig.desktop.key] = desktopValue ?? current
      normalizedRow[seriesConfig.mobile.key] = mobileValue ?? target

      return normalizedRow
    })
    .filter((item) => item.date.length > 0)

  if (normalized.length > 0) {
    return normalized
  }

  return generateFallbackData(current, target, seriesConfig)
}

const resolveActiveSeriesAlias = (
  activeSeries: string | undefined,
  seriesConfig: Record<SeriesAlias, ProgressSeriesConfig>
): SeriesAlias => {
  const enabledAliases = SERIES_ORDER.filter((alias) => seriesConfig[alias].enabled)
  const fallback = enabledAliases[0] ?? "desktop"
  if (!activeSeries) {
    return fallback
  }

  const normalized = activeSeries.trim().toLowerCase()
  if (SERIES_ORDER.includes(normalized as SeriesAlias)) {
    const alias = normalized as SeriesAlias
    if (seriesConfig[alias].enabled) {
      return alias
    }
  }

  for (const alias of enabledAliases) {
    if (seriesConfig[alias].key === normalized) {
      return alias
    }
  }

  return fallback
}

const resolveTotals = (
  rows: ProgressRow[],
  seriesConfig: Record<SeriesAlias, ProgressSeriesConfig>
): Record<SeriesAlias, number> => {
  return {
    desktop: rows.reduce((acc, row) => acc + toNumber(row[seriesConfig.desktop.key]), 0),
    mobile: rows.reduce((acc, row) => acc + toNumber(row[seriesConfig.mobile.key]), 0),
  }
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

  const seriesConfig = React.useMemo(() => resolveSeriesConfig(payload, t), [payload, t])
  const chartData = React.useMemo(() => normalizeLineData(payload, seriesConfig), [payload, seriesConfig])

  const availableCharts = React.useMemo(() => {
    const enabled = SERIES_ORDER.filter((alias) => seriesConfig[alias].enabled)
    if (enabled.length > 0) return enabled
    return ["desktop"] as SeriesAlias[]
  }, [seriesConfig])

  const [activeChart, setActiveChart] = React.useState<SeriesAlias>(() =>
    resolveActiveSeriesAlias(payload.activeSeries, seriesConfig)
  )

  React.useEffect(() => {
    if (!availableCharts.includes(activeChart)) {
      setActiveChart(availableCharts[0])
    }
  }, [activeChart, availableCharts])

  const totals = React.useMemo(() => resolveTotals(chartData, seriesConfig), [chartData, seriesConfig])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      views: {
        label: t("widgets.chart.views_label", "Views"),
      }
    }
    for (const alias of SERIES_ORDER) {
      const series = seriesConfig[alias]
      config[series.key] = {
        label: series.label,
        color: series.color,
      }
    }
    return config
  }, [seriesConfig, t])

  const subtitle = payload.subtitle || payload.description || ""
  const activeSeriesKey = seriesConfig[activeChart]?.key ?? seriesConfig.desktop.key

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
          {availableCharts.map((chart) => (
            <button
              key={chart}
              data-active={activeChart === chart}
              className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(chart)}
            >
              <span className="text-muted-foreground text-xs">{seriesConfig[chart].label}</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {numberFormatter.format(totals[chart])}
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
              dataKey={activeSeriesKey}
              type="monotone"
              stroke={`var(--color-${activeSeriesKey})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
