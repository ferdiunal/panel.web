import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressMetricProps {
  title: string;
  current: number;
  target: number;
  format?: 'number' | 'currency' | 'percentage';
}

export function ProgressMetric({ title, current, target, format = 'number' }: ProgressMetricProps) {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const isComplete = current >= target;

  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('tr-TR');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-2xl font-bold">{formatValue(current)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-2xl font-bold">{formatValue(target)}</p>
          </div>
        </div>

        {isComplete && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950 p-3 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              🎉 Target Achieved!
            </p>
          </div>
        )}

        {!isComplete && (
          <div className="text-center text-sm text-muted-foreground">
            {formatValue(target - current)} remaining
          </div>
        )}
      </CardContent>
    </Card>
  );
}
