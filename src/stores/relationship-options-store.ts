/**
 * Relationship Options Store
 *
 * Merkezi olarak relationship field'ların options'larını yönetir.
 * Bu sayede QuickCreateModal'dan eklenen yeni kayıtlar tüm field'larda görünür.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { Resource } from '@/types';

// Boş array referansı - her seferinde yeni array oluşturmamak için
const EMPTY_ARRAY: Resource[] = [];

interface RelationshipOptionsStore {
  // Resource type'a göre options - örn: { "organizations": [...], "users": [...] }
  options: Record<string, Resource[]>;

  // Actions
  setOptions: (resourceType: string, options: Resource[]) => void;
  addOption: (resourceType: string, option: Resource) => void;
  clearOptions: (resourceType: string) => void;
  getOptions: (resourceType: string) => Resource[];
}

export const useRelationshipOptionsStore = create<RelationshipOptionsStore>((set, get) => ({
  options: {},

  setOptions: (resourceType, options) =>
    set((state) => ({
      options: {
        ...state.options,
        [resourceType]: options,
      },
    })),

  addOption: (resourceType, option) =>
    set((state) => {
      const currentOptions = state.options[resourceType] || [];
      // Duplicate kontrolü - aynı ID'ye sahip option varsa ekleme
      const exists = currentOptions.some(opt => String(opt.id) === String(option.id));
      if (exists) {
        return state;
      }
      return {
        options: {
          ...state.options,
          [resourceType]: [...currentOptions, option],
        },
      };
    }),

  clearOptions: (resourceType) =>
    set((state) => {
      const { [resourceType]: _, ...rest } = state.options;
      return { options: rest };
    }),

  getOptions: (resourceType) => {
    return get().options[resourceType] || EMPTY_ARRAY;
  },
}));

/**
 * Hook: Belirli bir resource type için options'ları al
 * Zustand'ın shallow equality kullanarak sonsuz döngüyü önler
 */
export function useRelationshipOptions(resourceType: string): Resource[] {
  return useRelationshipOptionsStore(
    useShallow((state) => state.options[resourceType] || EMPTY_ARRAY)
  );
}

/**
 * Hook: Options'ları güncellemek için actions'ları al
 */
export function useRelationshipOptionsActions() {
  return useRelationshipOptionsStore((state) => ({
    setOptions: state.setOptions,
    addOption: state.addOption,
    clearOptions: state.clearOptions,
  }));
}
