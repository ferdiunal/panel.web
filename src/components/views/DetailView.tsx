/**
 * DetailView Component
 * Renders a read-only view of a resource with all attributes and related data
 * Displayed in a Sheet/Drawer modal
 */

import React, { useCallback } from 'react';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Edit2, Loader2 } from 'lucide-react';
import type { AnyResource, FieldDefinition } from '@/types';
import { getFieldSpanClass } from '@/lib/field-span';
import { cn } from '@/lib/utils';

export interface DetailViewProps {
  resourceType: string;
  resource: AnyResource | null;
  fields: FieldDefinition[];
  isOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  isDeleting?: boolean;
  showDeleteConfirm?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onClose: () => void;
  onRetry?: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  resourceType,
  resource,
  fields,
  isOpen,
  isLoading = false,
  error = null,
  isDeleting = false,
  showDeleteConfirm = false,
  onEdit,
  onDelete,
  onDeleteConfirm,
  onDeleteCancel,
  onClose,
  onRetry,
}) => {
  // Format field value for display
  const formatValue = useCallback((value: unknown): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        title="Loading..."
        variant="sheet"
        side="right"
      >
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-6 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </ResponsiveModal>
    );
  }

  // Render error state
  if (error) {
    return (
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        title="Error"
        variant="sheet"
        side="right"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full">
              Retry
            </Button>
          )}
        </div>
      </ResponsiveModal>
    );
  }

  // Render empty state
  if (!resource) {
    return (
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        title="No Resource"
        variant="sheet"
        side="right"
      >
        <p className="text-sm text-muted-foreground">
          The requested resource could not be found.
        </p>
      </ResponsiveModal>
    );
  }

  return (
    <>
      <ResponsiveModal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        title={`${resourceType} Details`}
        variant="sheet"
        side="right"
      >
        {/* Resource attributes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {fields.map((field) => {
            const value = (resource.attributes as Record<string, unknown>)[field.name];
            return (
              <div key={field.name} className={cn('col-span-1 space-y-2', getFieldSpanClass(field))}>
                <label className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </label>
                <p className="text-sm" data-testid={`detail-${field.name}`}>
                  {formatValue(value)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-6 mt-6 border-t">
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="flex-1"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </ResponsiveModal>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => !open && onDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {resourceType}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The {resourceType} will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DetailView;
