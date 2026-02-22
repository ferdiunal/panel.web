import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Column,
} from '@tanstack/react-table';
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
import { ChevronUpIcon, ChevronDownIcon, MoreHorizontal, Eye, Pencil, Trash, Filter, Database, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Resource } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export interface IndexViewColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  sortKey?: string;
  filterable?: boolean;
  render?: (value: any, resource: T) => React.ReactNode;
}

function normalizeIncomingColumnFilters(
  filters?: Record<string, string[]>
): ColumnFiltersState {
  if (!filters) {
    return [];
  }

  const result: ColumnFiltersState = [];
  for (const [columnId, values] of Object.entries(filters)) {
    if (!Array.isArray(values) || values.length === 0) {
      continue;
    }

    const sanitizedValues = values
      .map((value) => String(value))
      .filter((value) => value.length > 0);
    if (sanitizedValues.length === 0) {
      continue;
    }

    result.push({
      id: columnId,
      value: sanitizedValues,
    });
  }

  return result;
}

function normalizeOutgoingColumnFilters(
  filters: ColumnFiltersState
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const filter of filters) {
    if (!filter?.id) {
      continue;
    }

    const value = filter.value;
    const values = Array.isArray(value) ? value : [value];
    const sanitizedValues = values
      .map((item) => String(item))
      .filter((item) => item.length > 0);

    if (sanitizedValues.length === 0) {
      continue;
    }

    result[filter.id] = sanitizedValues;
  }

  return result;
}

export type IndexViewRowClickAction = 'edit' | 'detail' | 'none';

// Column Filter Component
interface ColumnFilterProps<T> {
  column: Column<T, unknown>;
  table: ReturnType<typeof useReactTable<T>>;
}

function ColumnFilter<T>({ column, table }: ColumnFilterProps<T>) {
  const [open, setOpen] = React.useState(false);

  // Get unique values for this column from pre-filtered data
  const uniqueValues = React.useMemo(() => {
    const values = new Set<string>();
    table.getPreFilteredRowModel().rows.forEach((row) => {
      const value = row.getValue(column.id);
      if (value != null && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  }, [table, column.id]);

  const filterValue = (column.getFilterValue() as string[]) ?? [];

  const handleFilterChange = (value: string, checked: boolean) => {
    const newFilterValue = checked
      ? [...filterValue, value]
      : filterValue.filter((v) => v !== value);

    column.setFilterValue(newFilterValue.length > 0 ? newFilterValue : undefined);
  };

  const handleClearFilter = () => {
    column.setFilterValue(undefined);
    setOpen(false);
  };

  if (uniqueValues.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 p-0',
            filterValue.length > 0 && 'text-primary'
          )}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium">Filter</Label>
            {filterValue.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilter}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {uniqueValues.map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${column.id}-${value}`}
                  checked={filterValue.includes(value)}
                  onCheckedChange={(checked) =>
                    handleFilterChange(value, checked as boolean)
                  }
                />
                <label
                  htmlFor={`${column.id}-${value}`}
                  className="text-sm cursor-pointer flex-1 truncate"
                  title={value}
                >
                  {value}
                </label>
              </div>
            ))}
          </div>
          {filterValue.length > 0 && (
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
              {filterValue.length} selected
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
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
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  columnFilters?: Record<string, string[]>;
  onColumnFiltersChange?: (filters: Record<string, string[]>) => void;
  onEdit?: (resource: T) => void;
  onDelete?: (resource: T) => void;
  onView?: (resource: T) => void;
  onRetry?: () => void;
  className?: string;
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  rowClickAction?: IndexViewRowClickAction;
  enableRowReorder?: boolean;
  onRowReorder?: (orderedResources: T[]) => Promise<void> | void;
}

/**
 * IndexView Component
 *
 * Displays a table of resources with search, sort, and action capabilities.
 * Shows loading, empty, and error states.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.8
 */
export const IndexView = React.forwardRef<HTMLDivElement, IndexViewProps<any>>(
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
      columnFilters: externalColumnFilters,
      onColumnFiltersChange: onColumnFiltersChangeProp,
      onEdit,
      onDelete,
      onView,
      onRetry,
      className,
      enableSelection = false,
      selectedIds = [],
      onSelectionChange,
      rowClickAction = 'edit',
      enableRowReorder = false,
      onRowReorder,
    },
    ref
  ) => {
    const showActions = !!(onEdit || onDelete || onView);
    const { t } = useTranslation();
    const [tableData, setTableData] = React.useState(resources);
    const [draggingRowId, setDraggingRowId] = React.useState<string | null>(null);
    const [dragOverRowId, setDragOverRowId] = React.useState<string | null>(null);
    const [isReordering, setIsReordering] = React.useState(false);

    const getResourceId = React.useCallback((resource: any) => {
      const idField = resource?.['id'] as any;
      if (idField && typeof idField === 'object' && 'data' in idField) {
        return String(idField.data);
      }
      return String(idField ?? '');
    }, []);

    const canTriggerRowClick =
      rowClickAction !== 'none' &&
      ((rowClickAction === 'edit' && !!onEdit) || (rowClickAction === 'detail' && !!onView));

    // Sorting state
    const resolveColumnIdForSort = React.useCallback(
      (incomingSortBy?: string): string | null => {
        if (!incomingSortBy) return null;
        const match = columns.find((column) => {
          if (column.sortKey && column.sortKey === incomingSortBy) return true;
          return column.key === incomingSortBy;
        });
        return match?.key ?? null;
      },
      [columns]
    );

    const resolveSortKeyForColumnId = React.useCallback(
      (columnId?: string): string | null => {
        if (!columnId) return null;
        const match = columns.find((column) => column.key === columnId);
        if (!match) return null;
        return match.sortKey || match.key;
      },
      [columns]
    );

    const [sorting, setSorting] = React.useState<SortingState>(() => {
      const initialColumnId = resolveColumnIdForSort(sortBy);
      if (initialColumnId) {
        return [{ id: initialColumnId, desc: sortOrder === 'desc' }];
      }
      return [];
    });

    // Column filters state
    const [columnFiltersState, setColumnFiltersState] = React.useState<ColumnFiltersState>(() =>
      normalizeIncomingColumnFilters(externalColumnFilters)
    );

    // Global filter state
    const [globalFilter, setGlobalFilter] = React.useState(searchQuery);

    // Sync external sorting state
    React.useEffect(() => {
      const nextColumnId = resolveColumnIdForSort(sortBy);
      if (!nextColumnId) {
        setSorting([]);
        return;
      }

      setSorting([{ id: nextColumnId, desc: sortOrder === 'desc' }]);
    }, [resolveColumnIdForSort, sortBy, sortOrder]);

    // Sync external search state
    React.useEffect(() => {
      setGlobalFilter(searchQuery);
    }, [searchQuery]);

    // Sync external column filters state
    React.useEffect(() => {
      if (!externalColumnFilters) {
        return;
      }
      setColumnFiltersState(normalizeIncomingColumnFilters(externalColumnFilters));
    }, [externalColumnFilters]);

    React.useEffect(() => {
      setTableData(resources);
    }, [resources]);

    const effectiveTableData = React.useMemo(
      () => (enableRowReorder ? tableData : resources),
      [enableRowReorder, resources, tableData]
    );

    // Convert IndexViewColumn to TanStack Table ColumnDef
    const tanstackColumns = useMemo<ColumnDef<any>[]>(() => {
      const cols: ColumnDef<any>[] = [];

      // Selection column
      if (enableSelection) {
        cols.push({
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={`Select row ${row.id}`}
            />
          ),
          enableSorting: false,
          enableColumnFilter: false,
        });
      }

      // Data columns
      columns.forEach((col) => {
        cols.push({
          id: col.key,
          accessorKey: col.key,
          header: col.label,
          cell: (info) => {
            const value = info.getValue();
            const resource = info.row.original;

            if (col.render) {
              return col.render(value, resource);
            }

            // Handle object values (like select options)
            if (value && typeof value === 'object') {
              // If it's an array, join the labels
              if (Array.isArray(value)) {
                return value.map(v => v?.label || v?.name || String(v)).join(', ');
              }
              // If it's an object with label property, use that
              if ('label' in value) {
                return String(value.label);
              }
              // If it's an object with name property, use that
              if ('name' in value) {
                return String(value.name);
              }
              // Otherwise, stringify it
              return JSON.stringify(value);
            }

            return String(value ?? '');
          },
          enableSorting: col.sortable ?? false,
          enableColumnFilter: col.filterable ?? false,
          filterFn: 'arrIncludesSome', // Use custom filter function for multi-select
        });
      });

      // Actions column
      if (showActions) {
        cols.push({
          id: 'actions',
          header: t('indexView.actions', 'Actions'),
          cell: ({ row }) => {
            const resource = row.original;
            const hasAnyAction =
              (onView && (resource.policy?.view ?? true)) ||
              (onEdit && (resource.policy?.update ?? true)) ||
              (onDelete && (resource.policy?.delete ?? true));

            if (!hasAnyAction) return null;

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
            );
          },
          enableSorting: false,
          enableColumnFilter: false,
        });
      }

      return cols;
    }, [columns, enableSelection, showActions, onView, onEdit, onDelete, t]);

    const handleRowClick = React.useCallback(
      (event: React.MouseEvent<HTMLTableRowElement>, resource: any) => {
        const target = event.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea, [role="menuitem"], [data-prevent-row-click="true"]')) {
          return;
        }

        if (rowClickAction === 'detail') {
          if (onView && (resource.policy?.view ?? true)) {
            onView(resource);
          }
          return;
        }

        if (rowClickAction === 'edit') {
          if (onEdit && (resource.policy?.update ?? true)) {
            onEdit(resource);
          }
        }
      },
      [onEdit, onView, rowClickAction]
    );

    const handleRowDragStart = React.useCallback(
      (event: React.DragEvent<HTMLTableRowElement>, rowId: string) => {
        if (!enableRowReorder || isReordering) return;
        setDraggingRowId(rowId);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', rowId);
      },
      [enableRowReorder, isReordering]
    );

    const handleRowDragOver = React.useCallback(
      (event: React.DragEvent<HTMLTableRowElement>, rowId: string) => {
        if (!enableRowReorder || isReordering || !draggingRowId) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setDragOverRowId(rowId);
      },
      [draggingRowId, enableRowReorder, isReordering]
    );

    const handleRowDragEnd = React.useCallback(() => {
      setDraggingRowId(null);
      setDragOverRowId(null);
    }, []);

    const handleRowDrop = React.useCallback(
      async (event: React.DragEvent<HTMLTableRowElement>, targetRowId: string) => {
        if (!enableRowReorder || isReordering) return;
        event.preventDefault();

        const sourceRowId = draggingRowId || event.dataTransfer.getData('text/plain');
        setDragOverRowId(null);
        setDraggingRowId(null);

        if (!sourceRowId || sourceRowId === targetRowId) return;

        const sourceIndex = tableData.findIndex((item) => getResourceId(item) === sourceRowId);
        const targetIndex = tableData.findIndex((item) => getResourceId(item) === targetRowId);

        if (sourceIndex < 0 || targetIndex < 0) return;

        const nextData = [...tableData];
        const [movedItem] = nextData.splice(sourceIndex, 1);
        nextData.splice(targetIndex, 0, movedItem);

        const previousData = tableData;
        setTableData(nextData);

        if (onRowReorder) {
          setIsReordering(true);
          try {
            await onRowReorder(nextData);
          } catch {
            setTableData(previousData);
          } finally {
            setIsReordering(false);
          }
        }
      },
      [draggingRowId, enableRowReorder, getResourceId, isReordering, onRowReorder, tableData]
    );

    // Create table instance
    const table = useReactTable({
      data: effectiveTableData,
      columns: tanstackColumns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      // Extract gerçek ID'yi her row için (row index yerine)
      getRowId: (row) => getResourceId(row),
      state: {
        sorting,
        columnFilters: columnFiltersState,
        globalFilter,
        rowSelection: selectedIds.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {} as Record<string, boolean>),
      },
      onSortingChange: (updater) => {
        const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
        setSorting(newSorting);

        // Notify parent component
        if (onSort && newSorting.length > 0) {
          const sortColumn = resolveSortKeyForColumnId(newSorting[0].id);
          if (sortColumn) {
            onSort(sortColumn, newSorting[0].desc ? 'desc' : 'asc');
          }
        }
      },
      onColumnFiltersChange: (updater) => {
        const nextFilters =
          typeof updater === 'function' ? updater(columnFiltersState) : updater;
        setColumnFiltersState(nextFilters);

        if (onColumnFiltersChangeProp) {
          onColumnFiltersChangeProp(normalizeOutgoingColumnFilters(nextFilters));
        }
      },
      onGlobalFilterChange: (updater) => {
        const newFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
        setGlobalFilter(newFilter);

        // Notify parent component
        if (onSearchChange) {
          onSearchChange(newFilter);
        }
      },
      onRowSelectionChange: (updater) => {
        if (!onSelectionChange) return;

        const currentSelection = selectedIds.reduce((acc, id) => {
          acc[id] = true;
          return acc;
        }, {} as Record<string, boolean>);

        const newSelection = typeof updater === 'function' ? updater(currentSelection) : updater;
        const newSelectedIds = Object.keys(newSelection).filter(id => newSelection[id]);
        onSelectionChange(newSelectedIds);
      },
      enableSorting: true,
      manualSorting: Boolean(onSort),
      enableSortingRemoval: false,
      enableColumnFilters: true,
      enableGlobalFilter: true,
      enableRowSelection: enableSelection,
      filterFns: {
        // Custom filter function for multi-select filtering
        arrIncludesSome: (row, columnId, filterValue) => {
          if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
            return true;
          }
          const rowValue = String(row.getValue(columnId));
          return filterValue.includes(rowValue);
        },
      },
      // Set default filter function for all columns
      globalFilterFn: 'includesString',
    });

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
            placeholder={t('indexView.searchPlaceholder', 'Search resources...')}
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        )}

        {isEmpty ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Database className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Kayıt Bulunamadı</EmptyTitle>
              <EmptyDescription>
                Henüz hiç kayıt eklenmemiş. Yeni kayıt eklemek için yukarıdaki butonu kullanabilirsiniz.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1">
                            <div
                              className={cn(
                                header.column.getCanSort() && 'cursor-pointer select-none flex items-center gap-2',
                                'hover:text-foreground transition-colors flex-1'
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <div className="w-4 h-4">
                                  {{
                                    asc: <ChevronUpIcon className="w-4 h-4" />,
                                    desc: <ChevronDownIcon className="w-4 h-4" />,
                                  }[header.column.getIsSorted() as string] ?? null}
                                </div>
                              )}
                            </div>
                            {header.column.getCanFilter() && header.id !== 'select' && header.id !== 'actions' && (
                              <ColumnFilter column={header.column} table={table} />
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-muted-foreground/30 animate-pulse" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="text-center py-12">
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Search className="h-6 w-6" />
                          </EmptyMedia>
                          <EmptyTitle>Sonuç Bulunamadı</EmptyTitle>
                          <EmptyDescription>
                            Arama kriterlerinize uygun kayıt bulunamadı. Lütfen farklı bir arama terimi deneyin.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      draggable={enableRowReorder && !isLoading && !isReordering}
                      onDragStart={(event) => handleRowDragStart(event, row.id)}
                      onDragOver={(event) => handleRowDragOver(event, row.id)}
                      onDrop={(event) => void handleRowDrop(event, row.id)}
                      onDragEnd={handleRowDragEnd}
                      onClick={(event) => {
                        if (canTriggerRowClick) {
                          handleRowClick(event, row.original);
                        }
                      }}
                      className={cn(
                        canTriggerRowClick && 'cursor-pointer',
                        enableRowReorder && !isLoading && 'select-none',
                        draggingRowId === row.id && 'opacity-50',
                        dragOverRowId === row.id && 'bg-muted/50'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
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
