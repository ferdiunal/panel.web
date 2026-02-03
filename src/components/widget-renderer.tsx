import { type Card as CardType } from "@/types"
import { TrendMetric } from "./widgets/trend-metric"
import { ValueMetric } from "./widgets/value-metric"

export function WidgetRenderer({ card }: { card: CardType }) {
    switch (card.component) {
        case "trend-metric":
            return <TrendMetric card={card} />
        case "value-metric":
            return <ValueMetric card={card} />
        default:
            return (
                <div className="p-4 border rounded bg-red-50 text-red-500">
                    Unknown card component: {card.component}
                </div>
            )
    }
}
