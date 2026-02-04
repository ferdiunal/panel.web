import React, { useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUpIcon, ChevronDownIcon, EditIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';

export interface IndexViewColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, resource: Resource) => React.ReactNode;
}

export interface IndexViewProps {
  resources: Resource[];
  columns: IndexViewColumn[];
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: string | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onView?: (resource: Resource) => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * IndexView Component
 * 
 * Displays a table of resources with search, sort, and action capabilities.
 * Shows loading, empty, and error states.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.8
 */
export const IndexView = React.forwardRef<HTMLDivElement, IndexViewProps>(
  (
    {
      resources,
      columns,
      isLoading = false,
      isEmpty = false,
      error = null,
      searchQuery = '',
      onSearchChange,
      sortBy,
      sortOrder = 'asc',
      onSort,
      onEdit,
      onDelete,
      onView,
      onRetry,
      className,
    },
    ref
  ) => {
    const showActions = !!(onEdit || onDelete || onView);

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange?.(e.target.value);
      },
      [onSearchChange]
    );

    const handleSort = useCallback(
      (key: string) => {
        onSort?.(key);
      },
      [onSort]
    );

    const renderSortIcon = (key: string) => {
      if (sortBy !== key) {
        return <div className="w-4 h-4" />;
      }
      return sortOrder === 'asc' ? (
        <ChevronUpIcon className="w-4 h-4" />
      ) : (
        <ChevronDownIcon className="w-4 h-4" />
      );
    };

    if (error) {
      return (
        <div className={cn('flex flex-col gap-4', className)} ref={ref}>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">Error loading resources</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className={cn('flex flex-col gap-4', className)} ref={ref}>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No resources found</p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn('flex flex-col gap-4', className)} ref={ref}>
        {onSearchChange && (
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        )}

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                      >
                        {column.label}
                        {renderSortIcon(column.key)}
                      </button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
                {showActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-muted-foreground/30 animate-pulse" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showActions ? 1 : 0)} className="text-center py-8">
                    <span className="text-sm text-muted-foreground">No data</span>
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => (
                  <TableRow key={resource.id}>
                    {columns.map((column) => (
                      <TableCell key={`${resource.id}-${column.key}`}>
                        {column.render
                          ? column.render(resource[column.key as keyof Resource], resource)
                          : String(resource[column.key as keyof Resource] || '')}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {onView && (
                            <Button
                              onClick={() => onView(resource)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              onClick={() => onEdit(resource)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Edit"
                            >
                              <EditIcon className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              onClick={() => onDelete(resource)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
);

IndexView.displayName = 'IndexView';
