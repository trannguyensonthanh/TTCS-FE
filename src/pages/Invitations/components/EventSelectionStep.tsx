// src/pages/Invitations/components/EventSelectionStep.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Info, CalendarX2, ListChecks } from 'lucide-react'; // Thay CalendarOff bằng CalendarX2 hoặc biểu tượng khác
import { Skeleton } from '@/components/ui/skeleton';
import { useSuKienCoTheMoi } from '@/hooks/queries/eventQueries';
import {
  SuKienCoTheMoiItem,
  GetSuKienCoTheMoiParams,
} from '@/services/event.service';
import { ReusablePagination } from '@/components/ui/ReusablePagination'; // Đảm bảo component này tồn tại
import { useDebounce } from '@/hooks/useDebounce';
import { EventCardForSelection } from './EventCardForSelection';
import { APIError } from '@/services/apiHelper';
import { motion, AnimatePresence } from 'framer-motion';

interface EventSelectionStepProps {
  onEventSelected: (event: SuKienCoTheMoiItem) => void;
}

const ITEMS_PER_PAGE = 6;

export const EventSelectionStep: React.FC<EventSelectionStepProps> = ({
  onEventSelected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const queryParams: GetSuKienCoTheMoiParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    searchTerm: debouncedSearchTerm || undefined, // Gửi undefined nếu rỗng để backend không lọc theo chuỗi rỗng
    sortBy: 'TgBatDauDK', // Sắp xếp theo ngày bắt đầu dự kiến
    sortOrder: 'asc', // Ưu tiên sự kiện sắp diễn ra gần nhất
  };

  const {
    data: paginatedEvents,
    isLoading,
    isFetching, // Để hiển thị loading khi chuyển trang hoặc refetch
    isError,
    error,
  } = useSuKienCoTheMoi(queryParams);

  const events = paginatedEvents?.items || [];
  const totalPages = paginatedEvents?.totalPages || 1;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset về trang 1 khi người dùng thay đổi từ khóa tìm kiếm
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Có thể cuộn lên đầu trang khi chuyển trang
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.07,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-xl border dark:border-slate-700/70">
        <CardHeader className="border-b dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <ListChecks className="mr-3 h-7 w-7 text-primary dark:text-ptit-blue" />
                Bước 1: Chọn Sự Kiện Để Mời
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Duyệt qua các sự kiện đã sẵn sàng để gửi lời mời tham dự.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Tìm kiếm theo tên sự kiện..."
              className="pl-12 pr-4 py-3 text-base rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-ptit-blue"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Tìm kiếm sự kiện"
            />
          </div>

          {isLoading &&
            !events.length && ( // Chỉ hiển thị skeleton loading ban đầu
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <Card key={index} className="h-[250px] flex flex-col">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                    <CardFooter className="pt-3">
                      <Skeleton className="h-10 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

          {isFetching &&
            events.length > 0 && ( // Hiển thị loading nhẹ khi fetching trang mới
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Đang cập nhật danh sách...
                </span>
              </div>
            )}

          {isError && (
            <div className="text-center py-10 text-destructive bg-destructive/10 p-6 rounded-lg">
              <Info className="mx-auto h-12 w-12 mb-3" />
              <p className="font-semibold text-lg">Lỗi Khi Tải Sự Kiện</p>
              <p className="text-sm mt-1">
                {(error as APIError)?.body?.message ||
                  (error as Error)?.message ||
                  'Đã có lỗi xảy ra. Vui lòng thử lại.'}
              </p>
              {/* Có thể thêm nút thử lại ở đây nếu cần */}
            </div>
          )}

          {!isLoading &&
            !isError &&
            events.length === 0 &&
            debouncedSearchTerm && (
              <div className="text-center py-16 text-muted-foreground">
                <img
                  src="/no-events-found.svg"
                  alt="No search results"
                  className="mx-auto mb-6 h-44 w-44 opacity-75"
                />
                <p className="text-xl font-semibold">
                  Không tìm thấy sự kiện nào.
                </p>
                <p className="mt-2 text-sm">
                  Không có sự kiện nào khớp với từ khóa "
                  <span className="font-medium text-foreground">
                    {debouncedSearchTerm}
                  </span>
                  ".
                  <br /> Vui lòng thử một từ khóa tìm kiếm khác.
                </p>
              </div>
            )}

          {!isLoading &&
            !isError &&
            events.length === 0 &&
            !debouncedSearchTerm && (
              <div className="text-center py-16 text-muted-foreground">
                <CalendarX2 className="mx-auto h-20 w-20 mb-6 opacity-50" />
                <p className="text-xl font-semibold">
                  Chưa Có Sự Kiện Nào Sẵn Sàng
                </p>
                <p className="mt-2 text-sm">
                  Hiện tại không có sự kiện nào đã được duyệt và xếp phòng để
                  bạn có thể gửi lời mời.
                  <br />
                  Vui lòng kiểm tra lại sau hoặc liên hệ quản trị viên.
                </p>
              </div>
            )}

          {!isLoading && !isError && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.suKienID}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    layout // Giúp animation mượt hơn khi filter/paging
                  >
                    <EventCardForSelection
                      event={event}
                      onSelect={() => onEventSelected(event)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {totalPages > 1 && events.length > 0 && (
            <div className="pt-6 border-t dark:border-slate-800">
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isFetching} // Chỉ isLoading khi chuyển trang, không phải loading ban đầu
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
