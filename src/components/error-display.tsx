/**
 * ErrorDisplay Component
 * Displays error messages with retry functionality
 */

import React from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ApiError } from '@/types';
import { getUserFriendlyMessage } from '@/utils/error-handler';

export interface ErrorDisplayProps {
  error: ApiError | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'warning';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  onRetry,
  className,
  variant = 'destructive',
}) => {
  if (!error) return null;

  const message = getUserFriendlyMessage(error);

  const variantStyles = {
    default: 'bg-slate-50 border-slate-200 text-slate-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {error.details && Object.keys(error.details).length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {Object.entries(error.details).map(([field, errors]) => (
              <li key={field}>
                <strong>{field}:</strong> {errors[0]}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
