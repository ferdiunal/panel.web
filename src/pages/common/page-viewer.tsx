import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom"
import api from "@/lib/axios"
import type { Widget } from "@/types"
import { WidgetRenderer } from "@/components/widget-renderer"

interface PageData {
    slug: string
    title: string
    widgets: Widget[]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
    let page = params.page
    if (!page) {
        page = "dashboard"
    }

    try {
        const res = await api.get<{ title: string; widgets: any[] }>(`/pages/${page}`)
        return {
            slug: page,
            title: res.data.title,
            widgets: res.data.widgets
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
                {data.widgets && data.widgets.map((widget: Widget, index: number) => (
                    <div key={index} className={widget.width === "1/3" ? "col-span-1" : "col-span-full"}>
                        <WidgetRenderer widget={widget} />
                    </div>
                ))}
            </div>
        </div>
    )
}
