import { useMutation, useQueryClient } from "@tanstack/react-query"
import { pageService } from "@/services/page"
import { UniversalResourceForm } from "@/components/forms/UniversalResourceForm"
import { toast } from "sonner"
import { useMemo } from "react"
import { redirect, useLoaderData, useRevalidator } from "react-router-dom"
import { useAppStore, useAuthStore } from "@/stores"

export const loader = async () => {
    try {
        await useAppStore.getState().init()
    } catch (error) {
        console.error('App init failed:', error)
    }

    try {
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login');
    }

    // Fetch settings page with error handling
    try {
        return await pageService.fetchPage("settings")
    } catch (error: any) {
        const status = error.response?.status || 500
        const message = error.response?.data?.message || error.message || 'Ayarlar yüklenemedi'

        throw new Response(message, {
            status,
            statusText: error.response?.statusText
        })
    }
}

export default function SettingsPage() {
    const queryClient = useQueryClient()
    const revalidator = useRevalidator()
    const slug = "settings"
    const pageData = useLoaderData() as any

    const initialData = useMemo(() => {
        if (!pageData) return {}
        const initial: Record<string, any> = {}
        pageData.meta.fields.forEach((field: any) => {
            if (field.data !== undefined) {
                initial[field.key] = field.data
            }
        })
        return initial
    }, [pageData])

    const saveMutation = useMutation({
        mutationFn: async (formData: any) => {
            return pageService.savePage(slug, formData)
        },
        onSuccess: () => {
            toast.success("Ayarlar kaydedildi")
            queryClient.invalidateQueries({ queryKey: ["page", slug] })
            // Loader verisini yeniden yükle — böylece form güncel değerlerle render edilir
            revalidator.revalidate()
        },
        onError: (error) => {
            console.error(error)
            toast.error("Kaydedilirken hata oluştu")
        }
    })

    return (

        <div className="flex flex-col gap-4 p-4 md:p-8 pt-0 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{pageData.title}</h1>
                {pageData.description && (
                    <p className="text-sm text-muted-foreground mt-1">{pageData.description}</p>
                )}
            </div>

            <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
                <UniversalResourceForm
                    resourceType="settings"
                    mode="edit"
                    fields={pageData.meta.fields}
                    initialData={initialData}
                    onSubmit={async (data) => await saveMutation.mutateAsync(data)}
                    onCancel={undefined}
                />
            </div>
        </div>
    )
}
