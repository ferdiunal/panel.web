import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router-dom"
import { pageService } from "@/services/page"
import type { Card } from "@/types"
import { WidgetRenderer } from "@/components/widget-renderer"
import { useAppStore, useAuthStore } from "@/stores"

interface PageData {
    slug: string
    title: string
    description: string
    cards: Card[]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
    let page = params.page
    if (!page) {
        page = "dashboard"
    }

    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login');
    }

    try {
        // @ts-ignore
        await useAppStore.getState().init()
        const res = await pageService.fetchPage(page)
        return {
            slug: page,
            title: res.title,
            description: res.description,
            cards: res.meta?.cards || []
        }
    } catch (error) {
        throw new Error("Sayfa yüklenirken hata oluştu.")
    }
}

export default function PageViewer() {
    const data = useLoaderData() as PageData

    return (
            <div className="flex flex-col gap-4 p-4 md:p-8 pt-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{data.title}</h1>
                    {data.description && (
                        <p className="text-sm text-muted-foreground mt-1">{data.description}</p>
                    )}
                </div>

                {data.cards && data.cards.length > 0 && (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {data.cards.map((card: Card, index: number) => (
                            <div key={index} className="col-span-1">
                                <WidgetRenderer card={card} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
    )
}
