/**
 * Hook for bridging React Hook Form with Zustand stores
 *
 * Features:
 * - RHF initialization with Zod schema
 * - Store synchronization
 * - Form state management
 * - Cleanup on unmount
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useFormStateStore } from '@/stores/form-state-store';

export interface UseFormWithStoreOptions {
  formId: string;
  schema?: z.ZodSchema;
  defaultValues?: Record<string, any>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export interface UseFormWithStoreReturn {
  form: ReturnType<typeof useForm>;
  isSubmitting: boolean;
}

/**
 * Hook for bridging React Hook Form with Zustand stores
 */
export function useFormWithStore(
  options: UseFormWithStoreOptions
): UseFormWithStoreReturn {
  const { formId, schema, defaultValues, mode = 'onTouched' } = options;

  // Initialize React Hook Form
  const form = useForm({
    resolver: schema ? (zodResolver(schema as any) as any) : undefined,
    defaultValues: defaultValues as any,
    mode,
    reValidateMode: 'onChange', // Submit sonrası real-time validation
  });

  // Subscribe to submission state from store
  const isSubmitting = useFormStateStore(
    (state) => state.submitting[formId] ?? false
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const store = useFormStateStore.getState();
      store.clearFormState(formId);
    };
  }, [formId]);

  return {
    form,
    isSubmitting,
  };
}
