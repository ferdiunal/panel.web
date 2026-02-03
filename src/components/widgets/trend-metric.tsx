"use client"

import { Area, AreaChart } from "recharts"

import {
    Card,
    CardContent,
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
    value: {
        label: "Value",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

export function TrendMetric({ card }: { card: CardType }) {
    // Ensure data is array. Backend returns { data: [...] } for this widget.
    const rawData = card.data
    const chartData = Array.isArray(rawData) ? rawData : (rawData && Array.isArray(rawData.data) ? rawData.data : [])

    return (
        <Card>
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ChartContainer config={chartConfig} className="min-h-[100px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                        }}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <defs>
                            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-value)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-value)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="value"
                            type="natural"
                            fill="url(#fillValue)"
                            fillOpacity={0.4}
                            stroke="var(--color-value)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
