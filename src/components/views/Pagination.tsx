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

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
  className?: string;
}

/**
 * Pagination Component
 * 
 * Displays pagination controls with page navigation and page size selector.
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
      pageSizeOptions = [10, 25, 50, 100],
      disabled = false,
      className,
    },
    ref
  ) => {
    const totalPages = useMemo(() => {
      return Math.ceil(total / pageSize);
    }, [total, pageSize]);

    const startItem = useMemo(() => {
      return (page - 1) * pageSize + 1;
    }, [page, pageSize]);

    const endItem = useMemo(() => {
      return Math.min(page * pageSize, total);
    }, [page, pageSize, total]);

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

    return (
      <div className={cn('flex items-center justify-between gap-4', className)} ref={ref}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {total}
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

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </div>

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
        </div>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';
