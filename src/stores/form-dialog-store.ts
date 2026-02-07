import { create } from 'zustand';

interface FormDialogConfig {
  isOpen: boolean;
  mode: 'create' | 'edit';
  resourceType: string;
  resourceId?: string | number;
  initialData?: Record<string, any>;
}

interface DetailDialogConfig {
  isOpen: boolean;
  resourceType: string;
  resourceId: string | number;
  data?: any;
}

interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
}

interface FormDialogStore {
  formDialogs: Record<string, FormDialogConfig>;
  detailDialogs: Record<string, DetailDialogConfig>;
  confirmDialogs: Record<string, ConfirmDialogConfig>;

  openFormDialog: (id: string, config: Omit<FormDialogConfig, 'isOpen'>) => void;
  closeFormDialog: (id: string) => void;
  updateFormDialog: (id: string, updates: Partial<FormDialogConfig>) => void;

  openDetailDialog: (id: string, config: Omit<DetailDialogConfig, 'isOpen'>) => void;
  closeDetailDialog: (id: string) => void;

  openConfirmDialog: (id: string, config: Omit<ConfirmDialogConfig, 'isOpen'>) => void;
  closeConfirmDialog: (id: string) => void;

  clearAllDialogs: () => void;
}

export const useFormDialogStore = create<FormDialogStore>((set) => ({
  formDialogs: {},
  detailDialogs: {},
  confirmDialogs: {},

  openFormDialog: (id, config) =>
    set((state) => ({
      formDialogs: {
        ...state.formDialogs,
        [id]: { ...config, isOpen: true },
      },
    })),

  closeFormDialog: (id) =>
    set((state) => ({
      formDialogs: {
        ...state.formDialogs,
        [id]: { ...state.formDialogs[id], isOpen: false },
      },
    })),

  updateFormDialog: (id, updates) =>
    set((state) => ({
      formDialogs: {
        ...state.formDialogs,
        [id]: { ...state.formDialogs[id], ...updates },
      },
    })),

  openDetailDialog: (id, config) =>
    set((state) => ({
      detailDialogs: {
        ...state.detailDialogs,
        [id]: { ...config, isOpen: true },
      },
    })),

  closeDetailDialog: (id) =>
    set((state) => ({
      detailDialogs: {
        ...state.detailDialogs,
        [id]: { ...state.detailDialogs[id], isOpen: false },
      },
    })),

  openConfirmDialog: (id, config) =>
    set((state) => ({
      confirmDialogs: {
        ...state.confirmDialogs,
        [id]: { ...config, isOpen: true },
      },
    })),

  closeConfirmDialog: (id) =>
    set((state) => ({
      confirmDialogs: {
        ...state.confirmDialogs,
        [id]: { ...state.confirmDialogs[id], isOpen: false },
      },
    })),

  clearAllDialogs: () =>
    set({
      formDialogs: {},
      detailDialogs: {},
      confirmDialogs: {},
    }),
}));

// Selectors for performance (fine-grained subscriptions)
export const useFormDialog = (id: string) =>
  useFormDialogStore((state) => state.formDialogs[id]);

export const useDetailDialog = (id: string) =>
  useFormDialogStore((state) => state.detailDialogs[id]);

export const useConfirmDialog = (id: string) =>
  useFormDialogStore((state) => state.confirmDialogs[id]);

export const useIsAnyDialogOpen = () =>
  useFormDialogStore(
    (state) =>
      Object.values(state.formDialogs).some((d) => d?.isOpen) ||
      Object.values(state.detailDialogs).some((d) => d?.isOpen) ||
      Object.values(state.confirmDialogs).some((d) => d?.isOpen)
  );
