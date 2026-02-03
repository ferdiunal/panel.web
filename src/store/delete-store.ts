import { create } from 'zustand'

interface DeleteState {
    isOpen: boolean
    resourceSlug: string | null
    resourceId: string | number | null
    openDelete: (slug: string, id: string | number) => void
    closeDelete: () => void
}

export const useDeleteStore = create<DeleteState>((set) => ({
    isOpen: false,
    resourceSlug: null,
    resourceId: null,
    openDelete: (slug, id) => set({ isOpen: true, resourceSlug: slug, resourceId: id }),
    closeDelete: () => set({ isOpen: false, resourceSlug: null, resourceId: null }),
}))
