/**
 * Error Handling Utilities
 * Provides functions for handling and displaying errors
 */

import type { ApiError } from '@/types';

/**
 * Parse API error response
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, any>;
    return {
      message: err.message || 'An error occurred',
      code: err.code || 'UNKNOWN_ERROR',
      details: err.details,
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiError): string {
  const messages: Record<string, string> = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };

  return (error.code && messages[error.code]) || error.message;
}

/**
 * Map server validation errors to field errors
 */
export function mapValidationErrors(
  details?: Record<string, string[]>
): Record<string, string> {
  if (!details) return {};

  const fieldErrors: Record<string, string> = {};
  Object.entries(details).forEach(([field, errors]) => {
    if (errors && Array.isArray(errors) && errors.length > 0) {
      fieldErrors[field] = errors[0];
    } else {
      fieldErrors[field] = 'Invalid value';
    }
  });

  return fieldErrors;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout')
    );
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return error.code === 'VALIDATION_ERROR' || !!error.details;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Create error boundary handler
 */
export function createErrorBoundaryHandler(
  onError: (error: ApiError) => void
) {
  return (error: unknown) => {
    const apiError = parseApiError(error);
    onError(apiError);
  };
}
