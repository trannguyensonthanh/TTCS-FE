import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReusablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean; // Để disable nút khi đang fetch
  siblingCount?: number; // Số lượng trang hiển thị ở mỗi bên của trang hiện tại
  className?: string;
}

const DOTS = '...';

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const ReusablePagination: React.FC<ReusablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  siblingCount = 1,
  className,
}) => {
  console.log('Rendering ReusablePagination', {
    currentPage,
    totalPages,
    siblingCount,
    isLoading,
    className,
  });
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    return []; // Should not happen
  }, [totalPages, currentPage, siblingCount]);

  if (totalPages <= 1) {
    return null; // Không hiển thị phân trang nếu chỉ có 1 trang hoặc không có trang nào
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center space-x-1 py-4',
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              key={DOTS + index}
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }
        return (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? 'default' : 'outline'}
            size="icon"
            className="h-9 w-9"
            onClick={() => onPageChange(Number(pageNumber))}
            disabled={isLoading}
            aria-label={`Trang ${pageNumber}`}
            aria-current={currentPage === pageNumber ? 'page' : undefined}
          >
            {pageNumber}
          </Button>
        );
      })}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
