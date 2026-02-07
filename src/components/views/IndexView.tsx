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
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronUpIcon, ChevronDownIcon, MoreHorizontal, Eye, Pencil, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface IndexViewColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, resource: T) => React.ReactNode;
}

export interface IndexViewProps<T extends Resource = Resource> {
  resources: T[];
  columns: IndexViewColumn<T>[];
  isLoading?: boolean;
  isEmpty?: boolean;
  error?: string | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onEdit?: (resource: T) => void;
  onDelete?: (resource: T) => void;
  onView?: (resource: T) => void;
  onRetry?: () => void;
  className?: string;
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
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
      enableSelection = false,
      selectedIds = [],
      onSelectionChange,
    },
    ref
  ) => {
    const showActions = !!(onEdit || onDelete || onView);

    // Selection handlers
    const handleSelectAll = useCallback(
      (checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) {
          const allIds = resources.map((r) => String(r.id));
          onSelectionChange(allIds);
        } else {
          onSelectionChange([]);
        }
      },
      [resources, onSelectionChange]
    );

    const handleSelectRow = useCallback(
      (id: string, checked: boolean) => {
        if (!onSelectionChange) return;
        if (checked) {
          onSelectionChange([...selectedIds, id]);
        } else {
          onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
        }
      },
      [selectedIds, onSelectionChange]
    );

    const isAllSelected = resources.length > 0 && selectedIds.length === resources.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < resources.length;

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

        {isEmpty ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No resources found</p>
          </div>
        ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {enableSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className={isSomeSelected ? 'data-[state=checked]:bg-muted' : ''}
                    />
                  </TableHead>
                )}
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
                  <TableCell colSpan={columns.length + (showActions ? 1 : 0) + (enableSelection ? 1 : 0)} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-muted-foreground/30 animate-pulse" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showActions ? 1 : 0) + (enableSelection ? 1 : 0)} className="text-center py-8">
                    <span className="text-sm text-muted-foreground">No data</span>
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((resource) => {
                  const resourceId = String(resource.id);
                  const isSelected = selectedIds.includes(resourceId);

                  return (
                    <TableRow key={resource.id}>
                      {enableSelection && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(resourceId, checked as boolean)}
                            aria-label={`Select row ${resourceId}`}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={`${resource.id}-${column.key}`}>
                          {column.render
                            ? column.render(resource[column.key as keyof Resource], resource)
                            : String(resource[column.key as keyof Resource] || '')}
                        </TableCell>
                      ))}
                    {showActions && (
                      <TableCell>
                        {(onView && (resource.policy?.view ?? true)) ||
                        (onEdit && (resource.policy?.update ?? true)) ||
                        (onDelete && (resource.policy?.delete ?? true)) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onView && (resource.policy?.view ?? true) && (
                                <DropdownMenuItem onClick={() => onView(resource)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Görüntüle
                                </DropdownMenuItem>
                              )}
                              {onEdit && (resource.policy?.update ?? true) && (
                                <DropdownMenuItem onClick={() => onEdit(resource)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Düzenle
                                </DropdownMenuItem>
                              )}
                              {onDelete && (resource.policy?.delete ?? true) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDelete(resource)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Sil
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
          </Table>
        </div>
        )}
      </div>
    );
  }
);

IndexView.displayName = 'IndexView';
