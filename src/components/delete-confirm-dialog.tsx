import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteStore } from "@/store/delete-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { resourceService } from "@/services/resource"
import { toast } from "sonner"

export function DeleteConfirmDialog() {
    const { isOpen, resourceSlug, resourceId, closeDelete } = useDeleteStore()
    const queryClient = useQueryClient()

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!resourceSlug || !resourceId) return
            return resourceService.deleteResource(resourceSlug, resourceId)
        },
        onSuccess: () => {
            toast.success("Kayıt başarıyla silindi")
            queryClient.invalidateQueries({ queryKey: ["resource", resourceSlug] })
            closeDelete()
        },
        onError: (error: any) => {
            toast.error(error.message || "Silme işlemi başarısız oldu")
        },
    })

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDelete()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the record.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            deleteMutation.mutate()
                        }}
                        disabled={deleteMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
