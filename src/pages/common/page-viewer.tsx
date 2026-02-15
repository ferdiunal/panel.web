import { useMemo } from "react"
import { useMutation } from "@tanstack/react-query"
import { redirect, useLoaderData, useRevalidator, type LoaderFunctionArgs } from "react-router-dom"
import { pageService } from "@/services/page"
import type { Card } from "@/types"
import { WidgetRenderer } from "@/components/widget-renderer"
import { useAppStore, useAuthStore } from "@/stores"
import { UniversalResourceForm } from "@/components/forms/UniversalResourceForm"
import { toast } from "sonner"

interface PageData {
    slug: string
    title: string
    description: string
    meta: {
        cards: Card[]
        fields: any[]
    }
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
    let page = params.page
    if (!page) {
        page = "dashboard"
    }

    // Önce uygulama ayarlarını yükle (init kendi catch'inde hata yutar)
    await useAppStore.getState().init()

    // Oturum kontrolü — başarısızsa /login'e yönlendir
    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login');
    }

    // Fetch page data with error handling
    try {
        return await pageService.fetchPage(page)
    } catch (error: any) {
        const status = error.response?.status || 500
        const message = error.response?.data?.message || error.message || 'Sayfa yüklenirken hata oluştu'

        throw new Response(message, {
            status,
            statusText: error.response?.statusText
        })
    }
}

export default function PageViewer() {
    const pageData = useLoaderData() as PageData
    const revalidator = useRevalidator()

    const initialData = useMemo(() => {
        if (!pageData?.meta?.fields) return {}
        const initial: Record<string, any> = {}
        pageData.meta.fields.forEach((field: any) => {
            if (field.data !== undefined) {
                initial[field.key] = field.data
            }
        })
        return initial
    }, [pageData])

    const hasFields = Array.isArray(pageData?.meta?.fields) && pageData.meta.fields.length > 0

    const saveMutation = useMutation({
        mutationFn: async (formData: any) => {
            return pageService.savePage(pageData.slug, formData)
        },
        onSuccess: () => {
            toast.success("Sayfa kaydedildi")
            revalidator.revalidate()
        },
        onError: (error) => {
            console.error(error)
            toast.error("Kaydedilirken hata oluştu")
        },
    })

    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 pt-0">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{pageData.title}</h1>
                {pageData.description && (
                    <p className="text-sm text-muted-foreground mt-1">{pageData.description}</p>
                )}
            </div>

            {pageData.meta?.cards && pageData.meta.cards.length > 0 && (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {pageData.meta.cards.map((card: Card, index: number) => (
                        <div key={index} className="col-span-1">
                            <WidgetRenderer card={card} />
                        </div>
                    ))}
                </div>
            )}

            {hasFields && (
                <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm max-w-3xl">
                    <UniversalResourceForm
                        resourceType={pageData.slug}
                        mode="edit"
                        fields={pageData.meta.fields}
                        initialData={initialData}
                        onSubmit={async (data) => await saveMutation.mutateAsync(data)}
                        onCancel={undefined}
                    />
                </div>
            )}
        </div>
    )
}
