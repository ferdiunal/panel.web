import { type Card as CardType } from "@/types"
import { TrendMetric } from "./widgets/trend-metric"
import { ValueMetric } from "./widgets/value-metric"
import { PartitionMetric, ProgressMetric, TableMetric } from "./metrics"

export function WidgetRenderer({ card }: { card: CardType }) {
    switch (card.component) {
        case "trend-metric":
            return <TrendMetric card={card} />
        case "value-metric":
            return <ValueMetric card={card} />
        case "partition-metric":
            return <PartitionMetric
                title={card.title}
                payload={card.data}
            />
        case "progress-metric":
            return <ProgressMetric
                title={card.title}
                payload={card.data}
            />
        case "table-metric":
            return <TableMetric
                title={card.title}
                data={card.data?.data || []}
                columns={card.data?.columns || []}
            />
        default:
            return (
                <div className="p-4 border rounded bg-red-50 text-red-500">
                    Unknown card component: {card.component}
                </div>
            )
    }
}
