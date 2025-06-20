// src/pages/MyAttendedEvents/MyAttendedEventsPage.tsx
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; // Hoặc ClientLayout nếu phù hợp
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  History,
  Star,
  CheckCircle,
  FileText,
  AlertTriangle,
  CalendarCheck2,
  Search,
  XSquare,
} from 'lucide-react';
import { useMyAttendedEventsList } from '@/hooks/queries/eventRatingQueries';
import {
  GetMyAttendedEventsParams,
  SuKienDaThamGiaItem,
  DanhGiaSKResponse,
  GuiDanhGiaPayload,
  CapNhatDanhGiaPayload,
} from '@/services/eventRating.service';
import { AttendedEventCard } from './components/AttendedEventCard';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import EventRatingFormDialog from './components/EventRatingFormDialog';
import { APIError } from '@/services/apiHelper';
import { motion, AnimatePresence } from 'framer-motion';

import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input'; // Thêm Input
import { useDebounce } from '@/hooks/useDebounce'; // Thêm useDebounce
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/DateRangePicker';

type AttendedEventStatusTab =
  | 'ALL'
  | 'DA_HOAN_THANH'
  | 'SAP_DIEN_RA'
  | 'DANG_DIEN_RA'
  | 'DA_HUY';
type RatingStatusFilter = 'ALL' | 'CHUA_DANH_GIA' | 'DA_DANH_GIA';

const ITEMS_PER_PAGE = 9;

const MyAttendedEventsPage: React.FC = () => {
  const [activeEventStatusTab, setActiveEventStatusTab] =
    useState<AttendedEventStatusTab>('ALL');
  const [ratingFilter, setRatingFilter] = useState<RatingStatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedEventForRating, setSelectedEventForRating] =
    useState<SuKienDaThamGiaItem | null>(null);

  const queryParams: GetMyAttendedEventsParams = useMemo(
    () => ({
      trangThaiSuKien:
        activeEventStatusTab === 'ALL' ? undefined : activeEventStatusTab,
      daDanhGia:
        ratingFilter === 'DA_DANH_GIA'
          ? true
          : ratingFilter === 'CHUA_DANH_GIA'
          ? false
          : undefined,
      tuNgay: dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : undefined,
      denNgay: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      // searchTerm: debouncedSearchTerm, // BE cần hỗ trợ tìm kiếm theo tên sự kiện
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sortBy: 'SuKien.TgKetThuc', // Sắp xếp theo ngày kết thúc
      sortOrder: 'desc',
    }),
    [
      activeEventStatusTab,
      ratingFilter,
      currentPage,
      dateRange,
      debouncedSearchTerm,
    ]
  );

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMyAttendedEventsList(queryParams);

  const attendedEvents = paginatedData?.items || [];
  const totalPages = paginatedData?.totalPages || 1;

  const handleTabChange = (value: string) => {
    setActiveEventStatusTab(value as AttendedEventStatusTab);
    setCurrentPage(1);
  };

  const handleRatingFilterChange = (value: string) => {
    setRatingFilter(value as RatingStatusFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRatingModal = (eventItem: SuKienDaThamGiaItem) => {
    setSelectedEventForRating(eventItem);
    setIsRatingModalOpen(true);
  };

  const handleRatingModalClose = (submittedOrUpdated: boolean) => {
    setIsRatingModalOpen(false);
    setSelectedEventForRating(null);
    if (submittedOrUpdated) {
      refetch();
    }
  };

  const eventStatusTabs = [
    { value: 'ALL', label: 'Tất cả', icon: History },
    { value: 'SAP_DIEN_RA', label: 'Sắp diễn ra', icon: CalendarCheck2 },
    { value: 'DANG_DIEN_RA', label: 'Đang diễn ra', icon: Loader2 }, // Có thể dùng icon khác
    { value: 'DA_HOAN_THANH', label: 'Đã hoàn thành', icon: CheckCircle },
    { value: 'DA_HUY', label: 'Đã hủy', icon: XSquare },
  ];

  const ratingStatusFilters = [
    { value: 'ALL', label: 'Tất cả trạng thái ĐG' },
    { value: 'CHUA_DANH_GIA', label: 'Chưa đánh giá (Có thể ĐG)' },
    { value: 'DA_DANH_GIA', label: 'Đã đánh giá' },
  ];

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl border-border/70 dark:border-slate-700/70">
          <CardHeader className="border-b dark:border-slate-700/70 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  Sự Kiện Của Tôi
                </CardTitle>
                <CardDescription className="text-sm md:text-base mt-1">
                  Xem lại các sự kiện bạn đã tham gia và chia sẻ đánh giá của
                  mình.
                </CardDescription>
              </div>
              {/* Có thể thêm nút Export nếu cần */}
            </div>
            {/* Filters */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <Label
                  htmlFor="event-history-search"
                  className="text-xs font-medium"
                >
                  Tìm theo tên sự kiện
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="event-history-search"
                    type="search"
                    placeholder="Nhập tên sự kiện..."
                    className="pl-9 h-9 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="event-date-range"
                  className="text-xs font-medium"
                >
                  Lọc theo ngày kết thúc
                </Label>
                <DatePickerWithRange
                  date={dateRange}
                  setDate={setDateRange}
                  className="mt-1 [&>button]:h-9 [&>button]:text-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor="rating-status-filter"
                  className="text-xs font-medium"
                >
                  Trạng thái đánh giá
                </Label>
                <Select
                  value={ratingFilter}
                  onValueChange={handleRatingFilterChange}
                >
                  <SelectTrigger
                    id="rating-status-filter"
                    className="h-9 text-sm mt-1"
                  >
                    <SelectValue placeholder="Lọc theo đánh giá..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingStatusFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {' '}
            {/* Bỏ pt-6 mặc định của CardContent */}
            <Tabs
              value={activeEventStatusTab}
              onValueChange={handleTabChange}
              className="w-full pt-4"
            >
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto mb-6 rounded-lg bg-muted dark:bg-slate-800 p-1">
                {eventStatusTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-xs sm:text-sm h-10 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center justify-center gap-1.5 px-2"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    activeEventStatusTab +
                    ratingFilter +
                    currentPage +
                    debouncedSearchTerm
                  } // Key thay đổi khi filter thay đổi
                  initial={{ opacity: 0.5 }} // Bắt đầu mờ hơn chút
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent
                    value={activeEventStatusTab}
                    className="mt-0 min-h-[400px]"
                  >
                    {' '}
                    {/* Đảm bảo content có chiều cao tối thiểu */}
                    {isLoading && (
                      <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      </div>
                    )}
                    {isError && (
                      <div className="text-center py-16 text-destructive bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                        <p className="text-lg font-semibold">
                          Lỗi khi tải dữ liệu!
                        </p>
                        <p className="text-sm mt-1">
                          {(error as APIError)?.body?.message ||
                            (error as Error)?.message ||
                            'Vui lòng thử lại sau.'}
                        </p>
                        <Button
                          onClick={() => refetch()}
                          variant="outline"
                          className="mt-4 border-destructive text-destructive hover:bg-destructive/10"
                        >
                          Thử lại
                        </Button>
                      </div>
                    )}
                    {!isLoading && !isError && attendedEvents.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground">
                        <FileText className="mx-auto h-20 w-20 mb-6 text-gray-400 dark:text-gray-500 opacity-70" />
                        <p className="text-xl font-semibold">
                          Không có sự kiện nào.
                        </p>
                        <p className="mt-1 text-sm">
                          Không tìm thấy sự kiện nào khớp với bộ lọc hiện tại
                          của bạn.
                        </p>
                      </div>
                    )}
                    {!isLoading && !isError && attendedEvents.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {attendedEvents.map((eventItem) => (
                          <AttendedEventCard
                            key={
                              String(eventItem.suKienID) +
                              String(eventItem.danhGiaCuaToi?.danhGiaSkID || '')
                            } // Thêm key động để re-render card khi đánh giá thay đổi
                            eventItem={eventItem}
                            onRateClick={() => handleOpenRatingModal(eventItem)}
                          />
                        ))}
                      </div>
                    )}
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <ReusablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                          isLoading={isFetching}
                        />
                      </div>
                    )}
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {selectedEventForRating && (
        <EventRatingFormDialog
          open={isRatingModalOpen}
          onOpenChange={setIsRatingModalOpen}
          eventToRate={selectedEventForRating}
          existingRating={selectedEventForRating.danhGiaCuaToi}
          onCloseDialog={handleRatingModalClose}
        />
      )}
    </div>
  );
};

export default MyAttendedEventsPage;
