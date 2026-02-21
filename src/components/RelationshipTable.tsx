import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { IndexView, type IndexViewColumn } from '@/components/views/IndexView';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus, Table } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resourceService } from '@/services/resource';
import type { ResourceParams } from '@/lib/resource-params';
import type { FieldData } from '@/types';
import {
  buildRelationshipQueryString,
  parseRelationshipUrlState,
  serializeColumnFiltersForQuery,
  serializeColumnFiltersKey,
  type RelationshipUrlState,
} from '@/lib/relationship-table-url-state';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ResourceGridView } from '@/components/views/ResourceGridView';
import { renderResourceFieldValue } from '@/lib/resource-field-render';

export interface RelationshipTableProps {
  /** İlişkili resource tipi (örn: "posts", "comments") */
  resourceType: string;
  
  /** Ana resource tipi (örn: "users") */
  viaResource: string;
  
  /** Ana resource ID */
  viaResourceId: string | number;
  
  /** İlişki adı (örn: "posts", "comments") */
  viaRelationship: string;
  
  /** İlişki tipi */
  relationshipType: 'hasMany' | 'belongsToMany' | 'morphToMany';
  
  /** Panel başlığı */
  title?: string;
  
  /** Açılır/kapanır panel */
  collapsable?: boolean;
  
  /** Varsayılan açık/kapalı durumu */
  defaultOpen?: boolean;
  
  /** Attach butonu göster */
  showAttachButton?: boolean;
  
  /** Sayfa başına kayıt sayısı seçenekleri */
  perPageOptions?: number[];
  
  /** Varsayılan sayfa başına kayıt sayısı */
  defaultPerPage?: number;
  
  /** Ek CSS class'ları */
  className?: string;
  
  /** View action callback */
  onView?: (resource: any) => void;
  
  /** Edit action callback */
  onEdit?: (resource: any) => void;
  
  /** Delete action callback */
  onDelete?: (resource: any) => void;
  
  /** Attach action callback */
  onAttach?: () => void;
}

export const RelationshipTable: React.FC<RelationshipTableProps> = ({
  resourceType,
  viaResource,
  viaResourceId,
  viaRelationship,
  defaultOpen = true,
  showAttachButton = false,
  perPageOptions = [5, 10, 25],
  defaultPerPage = 5,
  className,
  onView,
  onEdit,
  onDelete,
  onAttach,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen] = useState(defaultOpen);
  const urlState = useMemo(
    () => parseRelationshipUrlState(location.search, resourceType, defaultPerPage),
    [defaultPerPage, location.search, resourceType]
  );
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateUrlState = useCallback(
    (patch: Partial<RelationshipUrlState>) => {
      const nextState: RelationshipUrlState = {
        search: patch.search !== undefined ? patch.search : urlState.search,
        page: patch.page !== undefined ? patch.page : urlState.page,
        perPage: patch.perPage !== undefined ? patch.perPage : urlState.perPage,
        view: patch.view !== undefined ? patch.view : urlState.view,
        sortBy: patch.sortBy !== undefined ? patch.sortBy : urlState.sortBy,
        sortOrder: patch.sortOrder !== undefined ? patch.sortOrder : urlState.sortOrder,
        columnFilters:
          patch.columnFilters !== undefined ? patch.columnFilters : urlState.columnFilters,
      };

      if (nextState.page < 1) {
        nextState.page = 1;
      }
      if (nextState.perPage < 1) {
        nextState.perPage = defaultPerPage;
      }

      const nextQuery = buildRelationshipQueryString(location.search, resourceType, nextState);
      const currentQuery = location.search.startsWith('?')
        ? location.search.slice(1)
        : location.search;

      if (nextQuery === currentQuery) {
        return;
      }

      const nextUrl = `${location.pathname}${nextQuery ? `?${nextQuery}` : ''}${location.hash}`;
      navigate(nextUrl, { replace: true });
    },
    [
      defaultPerPage,
      location.hash,
      location.pathname,
      location.search,
      navigate,
      resourceType,
      urlState.columnFilters,
      urlState.page,
      urlState.perPage,
      urlState.view,
      urlState.search,
      urlState.sortBy,
      urlState.sortOrder,
    ]
  );

  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback(
    (query: string) => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }

      searchDebounceTimerRef.current = setTimeout(() => {
        if (query === urlState.search) {
          return;
        }
        updateUrlState({
          search: query,
          page: 1,
        });
      }, 300);
    },
    [updateUrlState, urlState.search]
  );

  const filtersKey = useMemo(
    () => serializeColumnFiltersKey(urlState.columnFilters),
    [urlState.columnFilters]
  );
  const queryFilters = useMemo(
    () => serializeColumnFiltersForQuery(urlState.columnFilters),
    [urlState.columnFilters]
  );

  // Fetch relationship data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'relationship',
      resourceType,
      viaResource,
      viaResourceId,
      viaRelationship,
      urlState.page,
      urlState.perPage,
      urlState.sortBy,
      urlState.sortOrder,
      urlState.search,
      urlState.view,
      filtersKey,
    ],
    queryFn: async () => {
      const params: ResourceParams = {
        page: urlState.page,
        per_page: urlState.perPage,
        view: urlState.view,
      };

      if (urlState.sortBy) {
        params.sort = {
          column: urlState.sortBy,
          direction: urlState.sortOrder,
        };
      }

      if (urlState.search.trim()) {
        params.search = urlState.search.trim();
      }

      const filterParams: Record<string, unknown> = {
        ...params,
        viaResource,
        viaResourceId,
        viaRelationship,
      };
      if (Object.keys(queryFilters).length > 0) {
        filterParams.filters = queryFilters;
      }

      const response = await resourceService.fetchResource(
        resourceType,
        filterParams as unknown as ResourceParams
      );

      return response;
    },
    enabled: isOpen, // Sadece panel açıkken fetch et
  });

  // Convert FieldData[] to IndexViewColumn[]
  const columns = useMemo<IndexViewColumn[]>(() => {
    if (!data?.meta?.headers) return [];

    return data.meta.headers
      .filter((field: FieldData) => field.visible !== false)
      .map((header: FieldData) => ({
        key: header.key,
        label: header.label || header.name,
        sortable: header.sortable ?? false,
        filterable: header.filterable ?? false,
        render: (_: any, resource: any) => {
            const field = resource[header.key] as FieldData;
            if (!field) return null;
            const renderedValue = renderResourceFieldValue(field, header, resource);
            return renderedValue === null || renderedValue === undefined || renderedValue === '' ? '—' : renderedValue;
        }
      }));
  }, [data]);

  // Handle sort
  const handleSort = useCallback(
    (key: string) => {
      if (urlState.sortBy === key) {
        updateUrlState({
          sortBy: key,
          sortOrder: urlState.sortOrder === 'asc' ? 'desc' : 'asc',
          page: 1,
        });
        return;
      }

      updateUrlState({
        sortBy: key,
        sortOrder: 'asc',
        page: 1,
      });
    },
    [updateUrlState, urlState.sortBy, urlState.sortOrder]
  );

  const handleViewChange = useCallback(
    (nextView: 'table' | 'grid') => {
      updateUrlState({
        view: nextView,
      });
    },
    [updateUrlState]
  );

  const handleColumnFiltersChange = useCallback(
    (filters: Record<string, string[]>) => {
      updateUrlState({
        columnFilters: filters,
        page: 1,
      });
    },
    [updateUrlState]
  );

  const total = Number(data?.meta?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / urlState.perPage));
  const gridEnabled = data?.meta?.grid_enabled !== false;
  const currentView: 'table' | 'grid' =
    gridEnabled && urlState.view === 'grid' ? 'grid' : 'table';

  // Panel header
  // const panelTitle = title || `${resourceType} (${data?.meta?.total || 0})`;

  return (
    <div className={cn('border rounded-lg', className)}>
      {/* Panel Content */}
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          {gridEnabled && (
            <ToggleGroup
              type="single"
              value={currentView}
              onValueChange={(value) => {
                if (value === 'table' || value === 'grid') {
                  handleViewChange(value);
                }
              }}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          {showAttachButton && onAttach && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAttach}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Attach
            </Button>
          )}
        </div>

        {currentView === 'grid' ? (
          <ResourceGridView
            resources={(data?.data || []) as any[]}
            headers={data?.meta?.headers || []}
            recordTitleKey={data?.meta?.record_title_key}
            isLoading={isLoading}
            isEmpty={!isLoading && (!data?.data || data.data.length === 0)}
            searchQuery={urlState.search}
            onSearchChange={handleSearchChange}
            onView={onView as any}
            onEdit={onEdit as any}
            onDelete={onDelete as any}
          />
        ) : (
          <IndexView
            resources={(data?.data || []) as any[]}
            columns={columns}
            isLoading={isLoading}
            isEmpty={!isLoading && (!data?.data || data.data.length === 0)}
            error={error ? String(error) : null}
            searchQuery={urlState.search}
            onSearchChange={handleSearchChange}
            sortBy={urlState.sortBy}
            sortOrder={urlState.sortOrder}
            onSort={handleSort}
            columnFilters={urlState.columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onRetry={() => refetch()}
          />
        )}

        {/* Pagination */}
        {data?.meta && data.meta.total > urlState.perPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {((urlState.page - 1) * urlState.perPage) + 1} to {Math.min(urlState.page * urlState.perPage, data.meta.total)} of {data.meta.total}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateUrlState({ page: urlState.page - 1 })}
                disabled={urlState.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {urlState.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateUrlState({ page: urlState.page + 1 })}
                disabled={urlState.page >= totalPages}
              >
                Next
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page:</span>
              <select
                value={urlState.perPage}
                onChange={(e) => {
                  updateUrlState({
                    perPage: Number(e.target.value),
                    page: 1,
                  });
                }}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                {perPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

RelationshipTable.displayName = 'RelationshipTable';
