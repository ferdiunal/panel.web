import { useMutation, useQueryClient } from "@tanstack/react-query"
import { pageService } from "@/services/page"
import { UniversalResourceForm } from "@/components/forms/UniversalResourceForm"
import { toast } from "sonner"
import { useMemo } from "react"
import { redirect, useLoaderData } from "react-router-dom"
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

    // Fetch account page with error handling
    try {
        return await pageService.fetchPage("account")
    } catch (error: any) {
        const status = error.response?.status || 500
        const message = error.response?.data?.message || error.message || 'Hesap yüklenemedi'

        throw new Response(message, {
            status,
            statusText: error.response?.statusText
        })
    }
}

export default function AccountPage() {
    const queryClient = useQueryClient()
    const slug = "account"
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
            toast.success("Hesap güncellendi")
            queryClient.invalidateQueries({ queryKey: ["page", slug] })
        },
        onError: (error) => {
            console.error(error)
            toast.error("Güncellenirken hata oluştu")
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
                    resourceType="account"
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
