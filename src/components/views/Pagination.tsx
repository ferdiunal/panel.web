import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaginationMode = 'links' | 'simple' | 'load_more';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onLoadMore?: () => void;
  mode?: PaginationMode;
  visibleCount?: number;
  pageSizeOptions?: number[];
  disabled?: boolean;
  className?: string;
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

function buildPageItems(totalPages: number, currentPage: number, maxVisible: number): PageItem[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const windowSize = Math.max(1, maxVisible - 2);
  const halfWindow = Math.floor(windowSize / 2);

  let start = Math.max(2, currentPage - halfWindow);
  let end = Math.min(totalPages - 1, start + windowSize - 1);

  if (end-start + 1 < windowSize) {
    start = Math.max(2, end - windowSize + 1);
  }

  if (start > 2) {
    items.push('ellipsis-left');
  }

  for (let current = start; current <= end; current++) {
    items.push(current);
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-right');
  }

  items.push(totalPages);
  return items;
}

/**
 * Pagination Component
 *
 * Displays pagination controls with multiple modes:
 * - links: numbered pages
 * - simple: previous/next
 * - load_more: incremental loading
 *
 * Validates: Requirements 1.4
 */
export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      page,
      pageSize,
      total,
      onPageChange,
      onPageSizeChange,
      onLoadMore,
      mode = 'links',
      visibleCount,
      pageSizeOptions = [10, 25, 50, 100],
      disabled = false,
      className,
    },
    ref
  ) => {
    const totalPages = useMemo(() => {
      return Math.max(1, Math.ceil(total / pageSize));
    }, [total, pageSize]);

    const startItem = useMemo(() => {
      if (total === 0) return 0;
      return (page - 1) * pageSize + 1;
    }, [page, pageSize, total]);

    const endItem = useMemo(() => {
      if (total === 0) return 0;
      return Math.min(page * pageSize, total);
    }, [page, pageSize, total]);

    const shownItemCount = useMemo(() => {
      if (total === 0) return 0;
      if (typeof visibleCount === 'number') {
        return Math.min(Math.max(0, visibleCount), total);
      }
      return endItem;
    }, [endItem, total, visibleCount]);

    const handlePreviousPage = useCallback(() => {
      if (page > 1) {
        onPageChange(page - 1);
      }
    }, [page, onPageChange]);

    const handleNextPage = useCallback(() => {
      if (page < totalPages) {
        onPageChange(page + 1);
      }
    }, [page, totalPages, onPageChange]);

    const handlePageSizeChange = useCallback(
      (value: string) => {
        onPageSizeChange(parseInt(value, 10));
      },
      [onPageSizeChange]
    );

    const handleLoadMore = useCallback(() => {
      if (onLoadMore) {
        onLoadMore();
        return;
      }
      if (page < totalPages) {
        onPageChange(page + 1);
      }
    }, [onLoadMore, page, totalPages, onPageChange]);

    const pageItems = useMemo(() => {
      return buildPageItems(totalPages, page, 7);
    }, [page, totalPages]);

    const canLoadMore = shownItemCount < total && page < totalPages;

    return (
      <div className={cn('flex items-center justify-between gap-4', className)} ref={ref}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {mode === 'load_more'
              ? `Showing ${shownItemCount} of ${total}`
              : `Showing ${startItem} to ${endItem} of ${total}`}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'load_more' ? (
            <Button
              onClick={handleLoadMore}
              disabled={disabled || !canLoadMore}
              variant="outline"
              className="h-8"
            >
              Daha fazla yükle
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={disabled || page === 1}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>

              {mode === 'links' ? (
                <div className="flex items-center gap-1">
                  {pageItems.map((item) =>
                    typeof item === 'number' ? (
                      <Button
                        key={item}
                        onClick={() => onPageChange(item)}
                        disabled={disabled}
                        variant={item === page ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8"
                      >
                        {item}
                      </Button>
                    ) : (
                      <span key={item} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    )
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                </div>
              )}

              <Button
                onClick={handleNextPage}
                disabled={disabled || page === totalPages}
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';
