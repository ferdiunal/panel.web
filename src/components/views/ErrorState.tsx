import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorState Component
 * 
 * Displays an error state with optional retry button.
 * 
 * Validates: Requirements 1.7
 */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      title = 'Error loading resources',
      message,
      retryLabel = 'Retry',
      onRetry,
      className,
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'rounded-lg border border-destructive/50 bg-destructive/10 p-6 flex flex-col gap-4',
          className
        )}
        ref={ref}
      >
        <div className="flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-destructive">{title}</h3>
            <p className="text-sm text-destructive/80">{message}</p>
          </div>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="w-fit">
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';
