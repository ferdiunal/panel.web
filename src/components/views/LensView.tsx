/**
 * LensView Component
 *
 * Lens verilerini görüntüleyen ana component.
 * Resource verilerini özel filtreler ve görünümlerle sunar.
 *
 * Özellikler:
 * - Cards görüntüleme
 * - Tablo görüntüleme (IndexView kullanarak)
 * - Search bar
 * - Pagination (prev/next)
 * - Loading/Error/Empty states
 * - URL state management
 * - React Query ile data fetching
 *
 * Kullanım:
 * ```tsx
 * <LensView
 *   resourceName="users"
 *   lensSlug="active-users"
 *   searchable={true}
 *   perPageOptions={[25, 50, 100]}
 * />
 * ```
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resourceService } from '@/services/resource';
import { WidgetRenderer } from '@/components/widget-renderer';
import { IndexView, type IndexViewColumn } from '@/components/views/IndexView';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { LensViewProps } from '@/types/lens';
import type { ResourceItem, FieldData, Card as CardType } from '@/types';

/**
 * LensView Component
 *
 * @param resourceName - Resource adı (örn: "users")
 * @param lensSlug - Lens slug'ı (örn: "active-users")
 * @param searchable - Arama özelliği aktif mi?
 * @param perPageOptions - Sayfa başına kayıt seçenekleri
 */
export function LensView({
  resourceName,
  lensSlug,
  searchable = true,
  perPageOptions = [25, 50, 100],
}: LensViewProps) {
  // URL state management
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const perPage = Number(searchParams.get('per_page')) || perPageOptions[0];
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || '';
  const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc';

  /**
   * Lens verilerini getir
   * React Query ile lens data fetching
   */
  const {
    data: lensData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lens', resourceName, lensSlug, page, perPage, search, sortBy, sortOrder],
    queryFn: () =>
      resourceService.getLensData(resourceName, lensSlug, {
        page,
        per_page: perPage,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    staleTime: 30000, // 30 saniye
  });

  /**
   * Lens kartlarını getir
   * React Query ile lens cards fetching
   */
  const { data: cards = [] } = useQuery({
    queryKey: ['lens-cards', resourceName, lensSlug],
    queryFn: () => resourceService.getLensCards(resourceName, lensSlug),
    staleTime: 60000, // 1 dakika
  });

  /**
   * Tablo kolonlarını oluştur
   * Lens response'undan gelen headers'ı kullanarak
   */
  const columns: IndexViewColumn<ResourceItem>[] = useMemo(() => {
    if (!lensData || !lensData.headers) return [];

    return lensData.headers.map((header: FieldData) => {
      const key = header.key;
      return {
        key,
        label: header.label || header.name || key,
        sortable: header.sortable,
        render: (_: any, resource: ResourceItem) => {
          const field: FieldData = resource[key] as FieldData;
          if (!field) return null;

          // Image field rendering
          if (header.key === 'image' || header.view === 'image-field') {
            return (
              <Avatar className="h-8 w-8">
                <AvatarImage src={field.data} alt={field.name} />
                <AvatarFallback>
                  {field.name ? field.name.substring(0, 2).toUpperCase() : 'IMG'}
                </AvatarFallback>
              </Avatar>
            );
          }

          // Badge field rendering
          if (header.view === 'badge-field') {
            return (
              <Badge variant={field.props?.variant || 'default'}>
                {field.data}
              </Badge>
            );
          }

          // Object field rendering (relations)
          if (typeof field.data === 'object' && field.data !== null) {
            const data = field.data as any;

            // Array rendering (BelongsToMany, HasMany)
            if (Array.isArray(data)) {
              return (
                <div className="flex flex-wrap gap-1">
                  {data.map((item: any, i: number) => {
                    const label =
                      typeof item === 'object'
                        ? item.name ||
                          item.title ||
                          item.label ||
                          item.username ||
                          item.email ||
                          item.id
                        : item;

                    return (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        {String(label)}
                      </span>
                    );
                  })}
                </div>
              );
            }

            // Object rendering (BelongsTo, HasOne)
            return (
              data.name ||
              data.email ||
              data.title ||
              data.username ||
              data.id ||
              JSON.stringify(data)
            );
          }

          // Options rendering (select fields)
          if (field.props?.options) {
            const options = field.props.options as Record<string, string>;
            const valStr = String(field.data);
            if (options[valStr]) {
              return options[valStr];
            }
          }

          return field.data;
        },
      };
    });
  }, [lensData]);

  /**
   * Search değişikliğini handle et
   * URL state'i güncelle
   */
  const handleSearchChange = (query: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  /**
   * Sort değişikliğini handle et
   * URL state'i güncelle
   */
  const handleSort = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentSortBy = searchParams.get('sort_by');
    const currentSortOrder = searchParams.get('sort_order');

    if (currentSortBy === key) {
      // Toggle sort order
      newParams.set('sort_order', currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort column
      newParams.set('sort_by', key);
      newParams.set('sort_order', 'asc');
    }

    setSearchParams(newParams);
  };

  /**
   * Sayfa değişikliğini handle et
   * URL state'i güncelle
   */
  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
  };

  /**
   * Sayfa başına kayıt sayısı değişikliğini handle et
   * URL state'i güncelle
   */
  const handlePerPageChange = (newPerPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('per_page', String(newPerPage));
    newParams.set('page', '1'); // Reset to first page
    setSearchParams(newParams);
  };

  // Loading state
  if (isLoading && !lensData) {
    return (
      <div className="flex flex-col gap-4">
        <div className="px-4 md:px-8 pt-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex flex-col gap-4 p-4 md:p-8 pt-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium">
            Lens verileri yüklenirken hata oluştu
          </p>
          <p className="text-sm text-destructive/80 mt-1">
            {error instanceof Error ? error.message : 'Bilinmeyen hata'}
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!lensData) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="text-center text-muted-foreground">
          Lens verisi bulunamadı
        </div>
      </div>
    );
  }

  const hasNextPage = !!lensData.nextPageUrl;
  const hasPrevPage = !!lensData.prevPageUrl;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 pt-0">
      {/* Cards */}
      {cards && cards.length > 0 && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card: CardType, index: number) => (
            <div key={index} className="col-span-1">
              <WidgetRenderer card={card} />
            </div>
          ))}
        </div>
      )}

      {/* Lens Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{lensData.name}</h1>
      </div>

      {/* IndexView with table */}
      <IndexView
        resources={lensData.resources as any}
        columns={columns as any}
        isLoading={isLoading}
        isEmpty={lensData.resources.length === 0}
        searchQuery={search}
        onSearchChange={searchable ? handleSearchChange : undefined}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Pagination */}
      {lensData.resources.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Sayfa başına:
            </span>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPrevPage || isLoading}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                Sayfa {page}
              </span>
            </div>

            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNextPage || isLoading}
              variant="outline"
              size="icon"
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
