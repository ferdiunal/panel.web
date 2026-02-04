/**
 * Zustand store for resource management
 * Manages resource data, pagination, filters, sort, and modal states
 */

import { create } from 'zustand';
import type { AnyResource } from '@/types';

export interface ResourceStoreState {
  // Resource data
  resources: AnyResource[];
  currentResource: AnyResource | null;

  // Loading and error states
  loading: boolean;
  error: Error | null;

  // Pagination
  page: number;
  pageSize: number;
  total: number;

  // Search and filters
  searchQuery: string;
  filters: Record<string, any>;

  // Sort
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  // Modal states
  formOpen: boolean;
  formMode: 'create' | 'update';
  detailOpen: boolean;
  confirmOpen: boolean;
  confirmAction: (() => void) | null;
  confirmMessage: string;

  // Actions
  setResources: (resources: AnyResource[]) => void;
  setCurrentResource: (resource: AnyResource | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSortBy: (sortBy: string, order: 'asc' | 'desc') => void;

  // Modal actions
  openForm: (mode: 'create' | 'update', resource?: AnyResource) => void;
  closeForm: () => void;
  openDetail: (resource: AnyResource) => void;
  closeDetail: () => void;
  openConfirm: (message: string, action: () => void) => void;
  closeConfirm: () => void;

  // Selectors (for memoization)
  selectResources: () => AnyResource[];
  selectLoading: () => boolean;
  selectError: () => Error | null;
  selectPaginatedResources: () => AnyResource[];
  selectCurrentResource: () => AnyResource | null;
  selectFormOpen: () => boolean;
  selectFormMode: () => 'create' | 'update';
  selectDetailOpen: () => boolean;
  selectConfirmOpen: () => boolean;
}

export const useResourceStore = create<ResourceStoreState>((set, get) => ({
  // Initial state
  resources: [],
  currentResource: null,
  loading: false,
  error: null,
  page: 1,
  pageSize: 10,
  total: 0,
  searchQuery: '',
  filters: {},
  sortBy: 'id',
  sortOrder: 'asc',
  formOpen: false,
  formMode: 'create',
  detailOpen: false,
  confirmOpen: false,
  confirmAction: null,
  confirmMessage: '',

  // Actions
  setResources: (resources) => set({ resources }),
  setCurrentResource: (resource) => set({ currentResource: resource }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  setTotal: (total) => set({ total }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setFilters: (filters) => set({ filters, page: 1 }),
  setSortBy: (sortBy, order) => set({ sortBy, sortOrder: order }),

  // Modal actions
  openForm: (mode, resource) => {
    set({
      formOpen: true,
      formMode: mode,
      currentResource: resource || null,
    });
  },
  closeForm: () => {
    set({
      formOpen: false,
      currentResource: null,
    });
  },
  openDetail: (resource) => {
    set({
      detailOpen: true,
      currentResource: resource,
    });
  },
  closeDetail: () => {
    set({
      detailOpen: false,
      currentResource: null,
    });
  },
  openConfirm: (message, action) => {
    set({
      confirmOpen: true,
      confirmMessage: message,
      confirmAction: action,
    });
  },
  closeConfirm: () => {
    set({
      confirmOpen: false,
      confirmMessage: '',
      confirmAction: null,
    });
  },

  // Selectors (for memoization)
  selectResources: () => get().resources,
  selectLoading: () => get().loading,
  selectError: () => get().error,
  selectPaginatedResources: () => {
    const { resources, page, pageSize } = get();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return resources.slice(start, end);
  },
  selectCurrentResource: () => get().currentResource,
  selectFormOpen: () => get().formOpen,
  selectFormMode: () => get().formMode,
  selectDetailOpen: () => get().detailOpen,
  selectConfirmOpen: () => get().confirmOpen,
}));

// Selector hooks for memoization
export const useResources = () => useResourceStore((state) => state.selectResources());
export const useResourcesLoading = () => useResourceStore((state) => state.selectLoading());
export const useResourcesError = () => useResourceStore((state) => state.selectError());
export const usePaginatedResources = () => useResourceStore((state) => state.selectPaginatedResources());
export const useCurrentResource = () => useResourceStore((state) => state.selectCurrentResource());
export const useFormOpen = () => useResourceStore((state) => state.selectFormOpen());
export const useFormMode = () => useResourceStore((state) => state.selectFormMode());
export const useDetailOpen = () => useResourceStore((state) => state.selectDetailOpen());
export const useConfirmOpen = () => useResourceStore((state) => state.selectConfirmOpen());

// Pagination selectors
export const usePagination = () =>
  useResourceStore((state) => ({
    page: state.page,
    pageSize: state.pageSize,
    total: state.total,
    totalPages: Math.ceil(state.total / state.pageSize),
  }));

// Search and filter selectors
export const useSearchAndFilters = () =>
  useResourceStore((state) => ({
    searchQuery: state.searchQuery,
    filters: state.filters,
  }));

// Sort selectors
export const useSort = () =>
  useResourceStore((state) => ({
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  }));
