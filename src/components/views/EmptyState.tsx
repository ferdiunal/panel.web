import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState Component
 * 
 * Displays an empty state with optional action button.
 * 
 * Validates: Requirements 1.6
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title = 'No resources found',
      description = 'Get started by creating a new resource',
      actionLabel = 'Create Resource',
      onAction,
      className,
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed p-12 text-center flex flex-col items-center justify-center gap-4',
          className
        )}
        ref={ref}
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <PlusIcon className="w-4 h-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
