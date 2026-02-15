/**
 * RelationshipTable Component
 * 
 * Detail view'da relationship field'lar (HasMany, BelongsToMany, MorphToMany) için
 * tablo gösterimi sağlar. Mevcut IndexView component'ini kullanarak ilişkili kayıtları
 * tablo formatında gösterir.
 * 
 * Özellikler:
 * - Pagination desteği
 * - Sorting desteği
 * - Filtering desteği
 * - Collapsable panel
 * - Attach/Detach butonları (opsiyonel)
 * - View/Edit/Delete action'ları
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IndexView, type IndexViewColumn } from '@/components/views/IndexView';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resourceService } from '@/services/resource';
import type { ResourceParams } from '@/lib/resource-params';
import type { FieldData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/useDebounce';
import { renderRelationshipFieldValue } from '@/lib/relation-field-links';
import { renderDisplayComponent } from '@/lib/display-components';
import { formatMoneyFieldValue } from '@/lib/money-display';

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
  relationshipType: _relationshipType,
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
  const [isOpen] = useState(defaultOpen);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search query için debounce kullan
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search değiştiğinde sayfayı 1'e resetle
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  // Fetch relationship data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['relationship', resourceType, viaResource, viaResourceId, viaRelationship, page, perPage, sortBy, sortOrder, debouncedSearchQuery],
    queryFn: async () => {
      const params: ResourceParams = {
        page,
        per_page: perPage,
      };

      if (sortBy) {
        params.sort = {
          column: sortBy,
          direction: sortOrder,
        };
      }

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      // Relationship endpoint yerine standart index endpoint'ini kullanıyoruz
      // ve via parametreleri ile filtreleme yapıyoruz.
      // Panel.go backend'i nested resource endpoint'ini (/resource/:res/:id/:rel) desteklemiyor olabilir.
      // Bunun yerine /resource/:relatedRes?viaResource=...&viaResourceId=...&viaRelationship=... formatını kullanıyoruz.
      
      const filterParams = {
        ...params,
        viaResource,
        viaResourceId,
        viaRelationship,
      };

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
  }, [data?.meta?.headers]);

  // Handle sort
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRetry={() => refetch()}
        />

        {/* Pagination */}
        {data?.meta && data.meta.total > perPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, data.meta.total)} of {data.meta.total}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {Math.ceil(data.meta.total / perPage)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(data.meta.total / perPage)}
              >
                Next
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page:</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1); // Reset to first page
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
