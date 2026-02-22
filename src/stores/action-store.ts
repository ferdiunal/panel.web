/**
 * Zustand store for action management
 * Manages actions, selected items, and action execution
 */

import { create } from 'zustand';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { queryClient } from '@/lib/query-client';

export interface ActionField {
  key: string;
  name: string;
  view: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface Action {
  name: string;
  slug: string;
  icon: string;
  confirmText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  destructive: boolean;
  onlyOnIndex: boolean;
  onlyOnDetail: boolean;
  showInline: boolean;
  standalone?: boolean;
  sole?: boolean;
  fields: ActionField[];
}

export interface ActionStoreState {
  // State
  actions: Action[];
  selectedAction: Action | null;
  selectedIds: string[];
  actionModalOpen: boolean;
  loading: boolean;

  // Actions
  setActions: (actions: Action[]) => void;
  selectAction: (action: Action) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectedId: (id: string) => void;
  clearSelectedIds: () => void;
  openActionModal: (action: Action, ids: string[]) => void;
  closeActionModal: () => void;
  executeAction: (
    resource: string,
    actionSlug: string,
    ids: string[],
    fields: Record<string, any>
  ) => Promise<void>;
}

export const useActionStore = create<ActionStoreState>((set, get) => ({
  // Initial state
  actions: [],
  selectedAction: null,
  selectedIds: [],
  actionModalOpen: false,
  loading: false,

  // Actions
  setActions: (actions) => set({ actions }),

  selectAction: (action) => set({ selectedAction: action }),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  toggleSelectedId: (id) => {
    const { selectedIds } = get();
    const newIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    set({ selectedIds: newIds });
  },

  clearSelectedIds: () => set({ selectedIds: [] }),

  openActionModal: (action, ids) =>
    set({
      selectedAction: action,
      selectedIds: ids,
      actionModalOpen: true,
    }),

  closeActionModal: () =>
    set({
      actionModalOpen: false,
      selectedAction: null,
    }),

  executeAction: async (resource, actionSlug, ids, fields) => {
    set({ loading: true });
    try {
      const response = await api.post(`/resource/${resource}/actions/${actionSlug}`, {
        ids,
        fields,
      });

      toast.success(response.data.message || 'Action executed successfully');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['resource', resource] });

      // Close modal and clear selection
      get().closeActionModal();
      get().clearSelectedIds();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Action failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
