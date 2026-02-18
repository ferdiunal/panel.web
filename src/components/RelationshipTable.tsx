import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { IndexView, type IndexViewColumn } from '@/components/views/IndexView';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resourceService } from '@/services/resource';
import type { ResourceParams } from '@/lib/resource-params';
import type { FieldData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { renderRelationshipFieldValue } from '@/lib/relation-field-links';
import { renderDisplayComponent } from '@/lib/display-components';
import { formatMoneyFieldValue } from '@/lib/money-display';
import {
  buildRelationshipQueryString,
  parseRelationshipUrlState,
  serializeColumnFiltersForQuery,
  serializeColumnFiltersKey,
  type RelationshipUrlState,
} from '@/lib/relationship-table-url-state';

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
      filtersKey,
    ],
    queryFn: async () => {
      const params: ResourceParams = {
        page: urlState.page,
        per_page: urlState.perPage,
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

            if (header.key === "image" || header.view === "image-field") {
                return (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={field.data} alt={field.name} />
                        <AvatarFallback>{field.name ? field.name.substring(0, 2).toUpperCase() : "IMG"}</AvatarFallback>
                    </Avatar>
                )
            }

            if (header.view === "badge-field") {
                return (
                    <Badge variant={field.props?.variant || 'default'}>
                        {field.data}
                    </Badge>
                )
            }

            const relationshipContent = renderRelationshipFieldValue(field, resource as Record<string, unknown>);
            if (relationshipContent !== null) {
                return relationshipContent;
            }

            const displayComponent = renderDisplayComponent(field.data);
            if (displayComponent !== null) {
                return displayComponent;
            }

            // Handle objects (like relations)
            if (typeof field.data === 'object' && field.data !== null) {
                const data = field.data as any

                // Handle Arrays (BelongsToMany, HasMany)
                if (Array.isArray(data)) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {data.map((item: any, i: number) => {
                                let label: string;
                                if (item && typeof item === 'object' && 'data' in item) {
                                    const fieldData = item.data;
                                    label = typeof fieldData === 'object' 
                                        ? String(fieldData.name || fieldData.title || fieldData.label || fieldData.id || i)
                                        : String(fieldData || i);
                                } else if (typeof item === 'object') {
                                    label = String(item.name || item.title || item.label || item.id || i);
                                } else {
                                    label = String(item);
                                }

                                return (
                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                        {label}
                                    </span>
                                )
                            })}
                        </div>
                    )
                }

                return data.name || data.email || data.title || data.username || data.id || JSON.stringify(data)
            }

            // Handle options
            if (field.props?.options) {
                if (Array.isArray(field.props.options)) {
                    const option = field.props.options.find((opt: any) => opt.value === field.data)
                    if (option) return option.label
                } else {
                    const options = field.props.options as Record<string, string>
                    const valStr = String(field.data)
                    if (options[valStr]) return options[valStr]
                }
            }

            const formattedMoneyValue = formatMoneyFieldValue(field);
            if (formattedMoneyValue !== null) {
              return formattedMoneyValue;
            }

            return field.data
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

  // Panel header
  // const panelTitle = title || `${resourceType} (${data?.meta?.total || 0})`;

  return (
    <div className={cn('border rounded-lg', className)}>
      {/* Panel Content */}
      <div className="p-4">
        {showAttachButton && onAttach && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onAttach}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Attach
            </Button>
          </div>
        )}

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
