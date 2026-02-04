/**
 * useErrorHandler Hook
 * Provides error handling and recovery utilities
 */

import { useState, useCallback } from 'react';
import type { ApiError } from '@/types';
import {
  parseApiError,
  getUserFriendlyMessage,
  mapValidationErrors,
  isNetworkError,
  isValidationError,
} from '@/utils/error-handler';

interface UseErrorHandlerReturn {
  error: ApiError | null;
  fieldErrors: Record<string, string>;
  isNetworkError: boolean;
  isValidationError: boolean;
  setError: (error: unknown) => void;
  clearError: () => void;
  clearFieldError: (field: string) => void;
  getUserMessage: () => string;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setError = useCallback((err: unknown) => {
    const apiError = parseApiError(err);
    setErrorState(apiError);

    // Map validation errors to fields
    if (isValidationError(apiError)) {
      setFieldErrors(mapValidationErrors(apiError.details));
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
    setFieldErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const getUserMessage = useCallback(() => {
    if (!error) return '';
    return getUserFriendlyMessage(error);
  }, [error]);

  return {
    error,
    fieldErrors,
    isNetworkError: error ? isNetworkError(error) : false,
    isValidationError: error ? isValidationError(error) : false,
    setError,
    clearError,
    clearFieldError,
    getUserMessage,
  };
}
