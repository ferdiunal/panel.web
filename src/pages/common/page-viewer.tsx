import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom"
import api from "@/lib/axios"
import type { Card } from "@/types"
import { WidgetRenderer } from "@/components/widget-renderer"

interface PageData {
    slug: string
    title: string
    cards: Card[]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
    let page = params.page
    if (!page) {
        page = "dashboard"
    }

    try {
        const res = await api.get<{ title: string; meta: { cards: any[] } }>(`/pages/${page}`)
        return {
            slug: page,
            title: res.data.title,
            cards: res.data.meta?.cards || []
        }
    } catch (error) {
        throw new Error("Sayfa yüklenirken hata oluştu.")
    }
}

export default function PageViewer() {
    const data = useLoaderData() as PageData

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8">
            <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {data.cards && data.cards.map((card: Card, index: number) => (
                    <div key={index} className={card.width === "1/3" ? "col-span-1" : "col-span-full"}>
                        <WidgetRenderer card={card} />
                    </div>
                ))}
            </div>
        </div>
    )
}
