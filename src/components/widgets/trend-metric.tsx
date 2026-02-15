"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { type Card as CardType } from "@/types"

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

type TrendRow = {
    month: string
    desktop: number
    mobile: number
}

const toNumber = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }

    if (typeof value === "string") {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }

    return 0
}

const normalizeMonthLabel = (value: unknown, fallback: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        return fallback
    }

    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10)
    }

    return value
}

const normalizeAreaChartData = (payload: unknown): TrendRow[] => {
    const source: unknown[] =
        payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).chartData)
            ? ((payload as Record<string, unknown>).chartData as unknown[])
            : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).data)
                ? ((payload as Record<string, unknown>).data as unknown[])
                : Array.isArray(payload)
                    ? (payload as unknown[])
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

const formatTickLabel = (value: string): string => {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return value.slice(0, 3)
}

export function TrendMetric({ card }: { card: CardType }) {
    const chartData = normalizeAreaChartData(card.data)
    const hasMobileSeries = chartData.some((item) => item.mobile > 0)

    const trendPct = (() => {
        if (chartData.length < 2) return 0
        const first = chartData[0].desktop + chartData[0].mobile
        const last = chartData[chartData.length - 1].desktop + chartData[chartData.length - 1].mobile
        if (first === 0) return 0
        return ((last - first) / first) * 100
    })()

    const rangeLabel = (() => {
        if (chartData.length === 0) return "No data"
        const first = chartData[0].month
        const last = chartData[chartData.length - 1].month

        const toPretty = (value: string) => {
            const parsed = new Date(value)
            if (Number.isNaN(parsed.getTime())) return value
            return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }

        return `${toPretty(first)} - ${toPretty(last)}`
    })()

    return (
        <Card>
            <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>Area Chart - Axes</CardDescription>
            </CardHeader>
            <CardContent>
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
                            tickFormatter={formatTickLabel}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickCount={3}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        {hasMobileSeries && (
                            <Area
                                dataKey="mobile"
                                type="natural"
                                fill="var(--color-mobile)"
                                fillOpacity={0.4}
                                stroke="var(--color-mobile)"
                                stackId="a"
                            />
                        )}
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
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Trending {trendPct >= 0 ? "up" : "down"} by {Math.abs(trendPct).toFixed(1)}%
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            {rangeLabel}
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
