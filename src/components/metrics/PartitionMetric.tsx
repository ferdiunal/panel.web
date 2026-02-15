import * as React from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PartitionMetricProps {
  title: string;
  payload?: Record<string, any>;
}

interface PieRow {
  month: string;
  label: string;
  desktop: number;
  fill: string;
  color: string;
}

const DEFAULT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const PieComponent = Pie as unknown as React.ComponentType<any>;

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'item';

const formatLabel = (value: string): string =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizePieData = (payload?: Record<string, any>): PieRow[] => {
  const chartRows = Array.isArray(payload?.chartData)
    ? payload.chartData
    : payload?.data && typeof payload.data === 'object'
      ? Object.entries(payload.data).map(([key, value]) => ({
          month: slugify(String(key)),
          label: String(key),
          desktop: toNumber(value),
        }))
      : [];

  const chartColors = payload?.chartColors && typeof payload.chartColors === 'object'
    ? payload.chartColors as Record<string, string>
    : {};

  return chartRows
    .map((item: any, index: number) => {
      const month = slugify(String(item.month ?? item.name ?? item.key ?? `item-${index + 1}`));
      const label = String(item.label ?? item.name ?? month);
      const fallbackColor = DEFAULT_COLORS[index % DEFAULT_COLORS.length];

      return {
        month,
        label: formatLabel(label),
        desktop: toNumber(item.desktop ?? item.value ?? item.visitors),
        fill: `var(--color-${month})`,
        color: String(chartColors[month] ?? item.color ?? item.fill ?? fallbackColor),
      };
    })
    .map((item) => ({
      month: item.month,
      label: item.label,
      desktop: item.desktop,
      fill: item.fill,
      color: item.color,
    }));
};

export function PartitionMetric({ title, payload }: PartitionMetricProps) {
  const id = React.useId().replace(/:/g, '');
  const chartData = React.useMemo(() => normalizePieData(payload), [payload]);
  const monthColors = React.useMemo(() => {
    const map: Record<string, string> = {};
    chartData.forEach((item, index) => {
      const fallbackColor = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      map[item.month] = item.color ?? fallbackColor;
    });
    return map;
  }, [chartData]);

  const chartConfig = React.useMemo(() => {
    const base: ChartConfig = {
      desktop: { label: 'Desktop' },
      visitors: { label: 'Visitors' },
    };

    chartData.forEach((item) => {
      base[item.month] = {
        label: item.label,
        color: monthColors[item.month],
      };
    });

    return base;
  }, [chartData, monthColors]);

  const [activeMonth, setActiveMonth] = React.useState(chartData[0]?.month ?? '');

  React.useEffect(() => {
    if (!activeMonth && chartData.length > 0) {
      setActiveMonth(chartData[0].month);
    }
  }, [activeMonth, chartData]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.month === activeMonth),
    [activeMonth, chartData]
  );

  const months = React.useMemo(() => chartData.map((item) => item.month), [chartData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>Pie Chart - Interactive</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];
              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PieComponent
              data={chartData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: any) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox && activeIndex >= 0) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {chartData[activeIndex].desktop.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PieComponent>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
