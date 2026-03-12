"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"

// Lazy load Recharts components
const Area = React.lazy(() => import("recharts").then(m => ({ default: m.Area })))
const AreaChart = React.lazy(() => import("recharts").then(m => ({ default: m.AreaChart })))
const CartesianGrid = React.lazy(() => import("recharts").then(m => ({ default: m.CartesianGrid })))
const XAxis = React.lazy(() => import("recharts").then(m => ({ default: m.XAxis })))
const YAxis = React.lazy(() => import("recharts").then(m => ({ default: m.YAxis })))

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "@/hooks/useTranslation"
import { getBrowserLocale, normalizeDateValue } from "@/lib/date-display"
import { type Card as CardType } from "@/types"

type SeriesKey = "desktop" | "mobile"

type TrendPayload = {
  subtitle?: string
  description?: string
  series?: {
    desktop?: { label?: string; color?: string; enabled?: boolean }
    mobile?: { label?: string; color?: string; enabled?: boolean }
  }
  chartData?: unknown[]
  data?: unknown[]
}

type TrendRow = {
  month: string
  desktop: number
  mobile: number
}

const DEFAULT_SERIES = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
    enabled: true,
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
    enabled: true,
  },
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

const normalizeMonthLabel = (value: unknown, fallback: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) return fallback
  const parsed = normalizeDateValue(value)
  if (parsed) return parsed.toISOString().slice(0, 10)
  return value
}

const normalizeAreaChartData = (payload?: TrendPayload): TrendRow[] => {
  const source: unknown[] = Array.isArray(payload?.chartData)
    ? payload.chartData
    : Array.isArray(payload?.data)
      ? payload.data
      : []

  return source.map((item: unknown, index: number) => {
    const row = (item ?? {}) as Record<string, unknown>
    const fallbackLabel = `item-${index + 1}`

    return {
      month: normalizeMonthLabel(row.month ?? row.date, fallbackLabel),
      desktop: toNumber(row.desktop ?? row.value ?? row.current),
      mobile: toNumber(row.mobile),
    }
  })
}

const resolveSeriesConfig = (
  payload: TrendPayload | undefined,
  t: (key: string, fallback?: string) => string
) => {
  const desktopConfig = payload?.series?.desktop
  const mobileConfig = payload?.series?.mobile

  return {
    desktop: {
      label: desktopConfig?.label || t("widgets.chart.desktop_label", DEFAULT_SERIES.desktop.label),
      color: desktopConfig?.color || DEFAULT_SERIES.desktop.color,
      enabled: desktopConfig?.enabled ?? DEFAULT_SERIES.desktop.enabled,
    },
    mobile: {
      label: mobileConfig?.label || t("widgets.chart.mobile_label", DEFAULT_SERIES.mobile.label),
      color: mobileConfig?.color || DEFAULT_SERIES.mobile.color,
      enabled: mobileConfig?.enabled ?? DEFAULT_SERIES.mobile.enabled,
    },
  } satisfies Record<SeriesKey, { label: string; color: string; enabled: boolean }>
}

export function TrendMetric({ card }: { card: CardType }) {
  const { t } = useTranslation()
  const payload = (card.data ?? {}) as TrendPayload
  const locale = getBrowserLocale()

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
  const chartData = React.useMemo(() => normalizeAreaChartData(payload), [payload])

  const chartConfig = React.useMemo(
    () =>
      ({
        desktop: {
          label: seriesConfig.desktop.label,
          color: seriesConfig.desktop.color,
        },
        mobile: {
          label: seriesConfig.mobile.label,
          color: seriesConfig.mobile.color,
        },
      }) satisfies ChartConfig,
    [seriesConfig]
  )

  const subtitle = payload.subtitle || payload.description || ""
  const hasMobileSeries = seriesConfig.mobile.enabled && chartData.some((item) => item.mobile > 0)

  const trendPct = React.useMemo(() => {
    if (chartData.length < 2) return 0
    const first = chartData[0].desktop + (hasMobileSeries ? chartData[0].mobile : 0)
    const last = chartData[chartData.length - 1].desktop + (hasMobileSeries ? chartData[chartData.length - 1].mobile : 0)
    if (first === 0) return 0
    return ((last - first) / first) * 100
  }, [chartData, hasMobileSeries])

  const formatDate = React.useCallback(
    (value: string, fallbackMode: "short" | "long"): string => {
      const parsed = normalizeDateValue(value)
      if (!parsed) return fallbackMode === "short" ? value.slice(0, 3) : value
      return fallbackMode === "short" ? shortDateFormatter.format(parsed) : longDateFormatter.format(parsed)
    },
    [longDateFormatter, shortDateFormatter]
  )

  const rangeLabel = React.useMemo(() => {
    if (chartData.length === 0) return t("widgets.chart.no_data", "No data")
    const first = chartData[0].month
    const last = chartData[chartData.length - 1].month
    return `${formatDate(first, "long")} - ${formatDate(last, "long")}`
  }, [chartData, formatDate, t])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <React.Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: -20,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatDate(String(value), "short")}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={3} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDate(String(value), "long")}
                    formatter={(value) => numberFormatter.format(Number(value) || 0)}
                  />
                }
              />
              {hasMobileSeries ? (
                <Area
                  dataKey="mobile"
                  type="natural"
                  fill="var(--color-mobile)"
                  fillOpacity={0.4}
                  stroke="var(--color-mobile)"
                  stackId="a"
                />
              ) : null}
              <Area
                dataKey="desktop"
                type="natural"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </React.Suspense>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {t("widgets.chart.trend_change", "Trend")} {numberFormatter.format(Number(Math.abs(trendPct).toFixed(1)))}%
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">{rangeLabel}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
