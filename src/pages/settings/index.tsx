import { useMutation, useQueryClient } from "@tanstack/react-query"
import { pageService } from "@/services/page"
import { ResourceForm } from "@/components/resource-form"
import { toast } from "sonner"
import { useMemo } from "react"
import { redirect, useLoaderData } from "react-router-dom"
import { useAppStore, useAuthStore } from "@/stores"

export const loader = async () => {
    try {
        await useAppStore.getState().init()
        await useAuthStore.getState().checkSession()
    } catch {
        return redirect('/login');
    }
    try {
        return await pageService.fetchPage("settings")
    } catch (error) {
        throw new Error("Ayarlar yüklenemedi")
    }
}

export default function SettingsPage() {
    const queryClient = useQueryClient()
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
                    <ResourceForm
                        fields={pageData.meta.fields}
                        initialData={initialData}
                        onSubmit={async (data) => await saveMutation.mutateAsync(data)}
                        hideCancel={true}
                        submitLabel="Kaydet"
                    />
                </div>
            </div>
    )
}
