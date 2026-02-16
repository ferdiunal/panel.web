import { create } from 'zustand';
import type { FieldUpdate } from '@/types/dependencies';

interface FormStateStore {
  // Field updates from backend dependency resolution - keyed by formId
  fieldUpdates: Record<string, Record<string, FieldUpdate>>;

  // Loading states for dependency resolution
  dependencyLoading: Record<string, boolean>;

  // Form submission states
  submitting: Record<string, boolean>;

  // Form errors (backend validation errors)
  formErrors: Record<string, Record<string, string>>;

  // Actions
  setFieldUpdates: (formId: string, updates: Record<string, FieldUpdate>) => void;
  updateSingleField: (formId: string, fieldKey: string, update: FieldUpdate) => void;
  clearFieldUpdates: (formId: string) => void;

  setDependencyLoading: (formId: string, loading: boolean) => void;
  setSubmitting: (formId: string, submitting: boolean) => void;
  setFormErrors: (formId: string, errors: Record<string, string>) => void;
  clearFormErrors: (formId: string) => void;

  clearFormState: (formId: string) => void;
}

export const useFormStateStore = create<FormStateStore>((set) => ({
  fieldUpdates: {},
  dependencyLoading: {},
  submitting: {},
  formErrors: {},

  setFieldUpdates: (formId, updates) =>
    set((state) => {
      console.log('[depends][frontend][store] setFieldUpdates', {
        formId,
        updateKeys: Object.keys(updates ?? {}),
        updates,
      });

      return {
        fieldUpdates: {
          ...state.fieldUpdates,
          [formId]: updates,
        },
      };
    }),

  updateSingleField: (formId, fieldKey, update) =>
    set((state) => {
      console.log('[depends][frontend][store] updateSingleField', {
        formId,
        fieldKey,
        update,
      });

      return {
        fieldUpdates: {
          ...state.fieldUpdates,
          [formId]: {
            ...state.fieldUpdates[formId],
            [fieldKey]: update,
          },
        },
      };
    }),

  clearFieldUpdates: (formId) =>
    set((state) => {
      console.log('[depends][frontend][store] clearFieldUpdates', { formId });
      const { [formId]: _, ...rest } = state.fieldUpdates;
      return { fieldUpdates: rest };
    }),

  setDependencyLoading: (formId, loading) =>
    set((state) => {
      console.log('[depends][frontend][store] setDependencyLoading', { formId, loading });
      return {
        dependencyLoading: {
          ...state.dependencyLoading,
          [formId]: loading,
        },
      };
    }),

  setSubmitting: (formId, submitting) =>
    set((state) => ({
      submitting: {
        ...state.submitting,
        [formId]: submitting,
      },
    })),

  setFormErrors: (formId, errors) =>
    set((state) => ({
      formErrors: {
        ...state.formErrors,
        [formId]: errors,
      },
    })),

  clearFormErrors: (formId) =>
    set((state) => {
      const { [formId]: _, ...rest } = state.formErrors;
      return { formErrors: rest };
    }),

  clearFormState: (formId) =>
    set((state) => {
      console.log('[depends][frontend][store] clearFormState', { formId });
      const {
        [formId]: _fieldUpdates,
        ...restFieldUpdates
      } = state.fieldUpdates;
      const {
        [formId]: _dependencyLoading,
        ...restDependencyLoading
      } = state.dependencyLoading;
      const {
        [formId]: _submitting,
        ...restSubmitting
      } = state.submitting;
      const {
        [formId]: _formErrors,
        ...restFormErrors
      } = state.formErrors;

      return {
        fieldUpdates: restFieldUpdates,
        dependencyLoading: restDependencyLoading,
        submitting: restSubmitting,
        formErrors: restFormErrors,
      };
    }),
}));

// Selectors for performance (fine-grained subscriptions)
export const useFieldUpdate = (formId: string, fieldKey: string) =>
  useFormStateStore((state) => state.fieldUpdates[formId]?.[fieldKey]);

export const useDependencyLoading = (formId: string) =>
  useFormStateStore((state) => state.dependencyLoading[formId] ?? false);

export const useFormSubmitting = (formId: string) =>
  useFormStateStore((state) => state.submitting[formId] ?? false);

// Empty object constant to prevent re-renders
const EMPTY_FIELD_UPDATES = {};

export const useAllFieldUpdates = (formId: string) =>
  useFormStateStore((state) => state.fieldUpdates[formId] || EMPTY_FIELD_UPDATES);

export const useFormErrors = (formId: string) =>
  useFormStateStore((state) => state.formErrors[formId] ?? {});
