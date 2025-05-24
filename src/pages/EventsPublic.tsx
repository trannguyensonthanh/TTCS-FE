import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  format,
  parseISO,
  isBefore,
  isAfter,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { vi } from 'date-fns/locale';

import MainNavigation from '@/components/MainNavigation';
import {
  usePublicEventsList,
  usePublicEventDetail,
  // Giả định có hook này nếu cần lấy danh sách Loại Sự Kiện từ API
  // useEventTypesList
} from '@/hooks/queries/eventQueries'; // Đảm bảo đường dẫn đúng
import {
  SuKienListItemResponse,
  GetPublicSuKienParams,
  SuKienDetailResponse,
  DonViResponseMin, // Import nếu dùng trực tiếp
} from '@/services/event.service'; // Hoặc từ types/event.types.ts

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  FileText,
  Search,
  CalendarDays,
  MapPin,
  Users as UsersIcon,
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  LayoutGrid,
  ExternalLink,
  Ticket,
  Building,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce'; // Custom hook
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DatePickerWithRange } from '@/components/DateRangePicker';
import { useLoaiSuKienList } from '@/hooks/queries/loaiSuKienQueries';

// --- Helper Functions ---
const formatDateRangeForDisplay = (start?: string, end?: string): string => {
  if (!start) return 'Chưa xác định';
  try {
    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : null;

    let formatted = format(startDate, 'HH:mm, EEEE, dd/MM/yyyy', {
      locale: vi,
    });

    if (endDate) {
      if (format(startDate, 'yyyyMMdd') === format(endDate, 'yyyyMMdd')) {
        // Cùng ngày, chỉ khác giờ
        formatted = `${format(startDate, 'dd/MM/yyyy')}, ${format(
          startDate,
          'HH:mm',
          { locale: vi }
        )} - ${format(endDate, 'HH:mm', { locale: vi })}`;
      } else {
        // Khác ngày
        formatted = `${format(startDate, 'HH:mm dd/MM/yyyy', {
          locale: vi,
        })} - ${format(endDate, 'HH:mm dd/MM/yyyy', { locale: vi })}`;
      }
    }
    return formatted;
  } catch (e) {
    console.error('Error formatting date range:', e);
    return 'Ngày không hợp lệ';
  }
};

const getPublicEventStatus = (
  maTrangThaiSK?: string,
  tgBatDauDK?: string,
  tgKetThucDK?: string
): {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} => {
  if (!maTrangThaiSK || !tgBatDauDK)
    return { text: 'Chưa rõ', variant: 'outline' };

  try {
    const now = new Date();
    const startDate = parseISO(tgBatDauDK);
    const endDate = tgKetThucDK ? parseISO(tgKetThucDK) : startDate; // Mặc định kết thúc cùng ngày nếu không có

    if (maTrangThaiSK.toUpperCase() === 'HOAN_THANH') {
      return { text: 'Đã hoàn thành', variant: 'default' };
    }
    if (maTrangThaiSK.toUpperCase().includes('DA_HUY')) {
      return { text: 'Đã hủy', variant: 'destructive' };
    }

    if (isBefore(now, startDate)) {
      return { text: 'Sắp diễn ra', variant: 'default' };
    } else if (isWithinInterval(now, { start: startDate, end: endDate })) {
      return { text: 'Đang diễn ra', variant: 'outline' };
    } else if (isAfter(now, endDate)) {
      // Nếu qua ngày kết thúc mà chưa phải "HOAN_THANH" thì coi như đã qua
      return { text: 'Đã qua', variant: 'secondary' };
    }
  } catch (e) {
    console.error('Error determining public event status:', e);
  }
  return { text: 'Chưa rõ', variant: 'outline' };
};

// ---- Component ----
const EventsPublic = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filterLoaiSuKien, setFilterLoaiSuKien] = useState<string | undefined>(
    undefined
  );
  const [filterLoaiSuKienMa, setFilterLoaiSuKienMa] = useState<
    string | undefined
  >(undefined);
  const [filterParams, setFilterParams] = useState<GetPublicSuKienParams>({
    page: 1,
    limit: 9,
    sortBy: 'TgBatDauDK',
    sortOrder: 'asc',
    sapDienRa: true, // Mặc định hiển thị sự kiện sắp diễn ra & đang diễn ra
  });

  const [selectedEventForDetail, setSelectedEventForDetail] =
    useState<SuKienDetailResponse | null>(null);
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch danh sách Loại Sự Kiện
  const { data: loaiSuKienOptions, isLoading: isLoadingLoaiSuKien } =
    useLoaiSuKienList(
      { isActive: true, limit: 100 } // Lấy tất cả các loại đang active, tối đa 100 loại
    );
  const {
    data: paginatedEvents,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchEventsList,
  } = usePublicEventsList(filterParams, {
    staleTime: 3 * 60 * 1000, // Cache trong 3 phút
    refetchOnWindowFocus: true,
  });
  console.log('paginatedEvents', loaiSuKienOptions);
  const { data: eventDetailData, isLoading: isLoadingDetail } =
    usePublicEventDetail(selectedEventForDetail?.suKienID);

  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      tuNgay: dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : undefined,
      denNgay: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      loaiSuKienMa:
        filterLoaiSuKienMa === 'all' || !filterLoaiSuKienMa
          ? undefined
          : filterLoaiSuKienMa, // Sử dụng state mới
      page: 1,
    }));
  }, [debouncedSearchTerm, dateRange, filterLoaiSuKienMa]);

  const events = paginatedEvents?.items || [];
  const totalPages = paginatedEvents?.totalPages || 1;
  const currentPage = paginatedEvents?.currentPage || 1;
  const totalItems = paginatedEvents?.totalItems || 0;

  const openEventDetailsModal = (eventItem: SuKienListItemResponse) => {
    // Set thông tin cơ bản trước để dialog có nội dung khi mở
    setSelectedEventForDetail(eventItem as SuKienDetailResponse); // Ép kiểu tạm thời
    setShowEventDetailsDialog(true);
    // Hook usePublicEventDetail sẽ fetch chi tiết đầy đủ
  };

  useEffect(() => {
    if (eventDetailData && showEventDetailsDialog) {
      setSelectedEventForDetail(eventDetailData);
    }
  }, [eventDetailData, showEventDetailsDialog]);

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 200, behavior: 'smooth' }); // Cuộn lên đầu danh sách
  };

  const renderEventCards = () => (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {events.map((event, index) => (
          <motion.div
            key={event.suKienID}
            layout
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className="overflow-hidden h-full flex flex-col group hover:shadow-xl dark:hover:border-primary/50 transition-all duration-300 cursor-pointer"
              onClick={() => openEventDetailsModal(event)}
            >
              <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.tenSK}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-ptit-blue/10 to-ptit-red/10 dark:from-slate-800 dark:to-slate-700">
                    <CalendarDays className="h-20 w-20 text-ptit-blue/30 dark:text-ptit-red/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      getPublicEventStatus(
                        event.trangThaiSK.maTrangThai,
                        event.tgBatDauDK
                      ).variant
                    }
                  >
                    {
                      getPublicEventStatus(
                        event.trangThaiSK.maTrangThai,
                        event.tgBatDauDK
                      ).text
                    }
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg leading-tight line-clamp-2 h-[3.2em] group-hover:text-primary dark:group-hover:text-ptit-red transition-colors">
                  {event.tenSK}
                </CardTitle>
                <CardDescription className="text-xs pt-1 text-muted-foreground">
                  ĐV Tổ chức: {event.donViChuTri.tenDonVi}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-1.5 text-sm text-muted-foreground flex-grow">
                <div className="flex items-start">
                  <Calendar className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
                  <span>
                    {formatDateRangeForDisplay(
                      event.tgBatDauDK,
                      event.tgKetThucDK
                    )}
                  </span>
                </div>
                <div className="flex items-start">
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>{event.diaDiemToChucDaXep || 'Sẽ thông báo sau'}</span>
                </div>
                {event.slThamDuDK && (
                  <div className="flex items-center">
                    <UsersIcon className="mr-2 h-4 w-4 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                    <span>Dự kiến: {event.slThamDuDK} người</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-2 border-t dark:border-slate-700">
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary/10 group-hover:border-primary dark:group-hover:bg-ptit-red/10 dark:group-hover:border-ptit-red transition-colors"
                >
                  <Info className="mr-2 h-4 w-4" /> Xem Chi Tiết
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  const renderEventList = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Tên Sự Kiện</TableHead>
              <TableHead className="w-[20%]">Đơn vị tổ chức</TableHead>
              <TableHead className="w-[25%]">Thời gian</TableHead>
              <TableHead className="min-w-[150px]">Địa điểm</TableHead>
              <TableHead className="text-center min-w-[120px]">
                Trạng thái
              </TableHead>
              <TableHead className="text-right min-w-[100px]">
                Chi tiết
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.suKienID} className="hover:bg-muted/50">
                <TableCell className="font-medium py-3">
                  <span
                    className="hover:text-primary cursor-pointer"
                    onClick={() => openEventDetailsModal(event)}
                  >
                    {event.tenSK}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground py-3">
                  {event.donViChuTri.tenDonVi}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground py-3">
                  {formatDateRangeForDisplay(
                    event.tgBatDauDK,
                    event.tgKetThucDK
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground py-3">
                  {event.diaDiemToChucDaXep || 'N/A'}
                </TableCell>
                <TableCell className="text-center py-3">
                  <Badge
                    variant={
                      getPublicEventStatus(
                        event.trangThaiSK.maTrangThai,
                        event.tgBatDauDK
                      ).variant
                    }
                  >
                    {
                      getPublicEventStatus(
                        event.trangThaiSK.maTrangThai,
                        event.tgBatDauDK
                      ).text
                    }
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEventDetailsModal(event)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  function handleFilterChange(key: string, value: string): void {
    if (key === 'loaiSuKienMa') {
      setFilterLoaiSuKien(value);
    }
    // Nếu có thêm filter khác, xử lý tại đây
  }

  function handleSearchInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    setSearchTerm(event.target.value);
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <MainNavigation />
      <main className="flex-1 container py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-10"
        >
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-ptit-blue via-ptit-red to-amber-500 dark:from-ptit-red dark:via-ptit-blue dark:to-sky-400">
              Lịch Sự Kiện PTITHCM
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Khám phá các hoạt động, hội thảo, và sự kiện nổi bật đang và sắp
              diễn ra tại Học viện Công nghệ Bưu chính Viễn thông cơ sở TP. Hồ
              Chí Minh.
            </p>
          </div>
        </motion.div>

        <Card className="mb-8 shadow-lg border-border dark:border-slate-800">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="lg:col-span-1 space-y-1.5">
                <Label
                  htmlFor="search-event"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-event"
                    type="search"
                    placeholder="Tên sự kiện, đơn vị..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="event-type-filter"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Loại sự kiện
                </Label>
                <Select
                  value={filterLoaiSuKienMa || 'all'} // Sử dụng filterLoaiSuKienMa
                  onValueChange={(value) =>
                    setFilterLoaiSuKienMa(value === 'all' ? undefined : value)
                  } // Cập nhật filterLoaiSuKienMa
                  disabled={isLoadingLoaiSuKien}
                >
                  <SelectTrigger id="event-type-filter">
                    <SelectValue
                      placeholder={
                        isLoadingLoaiSuKien ? 'Đang tải...' : 'Tất cả loại'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {loaiSuKienOptions?.map((lt) => (
                      <SelectItem key={lt.maLoaiSK} value={lt.maLoaiSK}>
                        {lt.tenLoaiSK}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="date-range-filter"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Khoảng thời gian
                </Label>
                <DatePickerWithRange
                  date={dateRange}
                  setDate={setDateRange}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            {isFetching ? (
              <Loader2 className="inline h-4 w-4 animate-spin mr-1" />
            ) : null}
            Hiển thị{' '}
            {events.length > 0
              ? (currentPage - 1) * (filterParams.limit || 10) + 1
              : 0}{' '}
            - {Math.min(currentPage * (filterParams.limit || 10), totalItems)}{' '}
            của {totalItems} kết quả.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Chế độ xem:
            </span>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Xem dạng lưới"
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="Xem dạng danh sách"
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isLoading && !events.length ? (
          <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          </div>
        ) : !isLoading && events.length === 0 ? (
          <Card className="shadow-none border-dashed">
            <CardContent className="py-16 text-center">
              <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">
                Không tìm thấy sự kiện nào
              </h3>
              <p className="text-muted-foreground mt-2">
                Vui lòng thử lại với các bộ lọc khác hoặc kiểm tra lại sau.
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          renderEventCards()
        ) : (
          renderEventList()
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1 py-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading || isFetching}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Pagination logic for numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              const showPage =
                totalPages <= 7 ||
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);
              const isEllipsisBefore =
                totalPages > 7 && currentPage > 4 && pageNum === 2;
              const isEllipsisAfter =
                totalPages > 7 &&
                currentPage < totalPages - 3 &&
                pageNum === totalPages - 1;

              if (isEllipsisBefore && pageNum < currentPage - 2)
                return (
                  <span
                    key={`ellipsis-start-${i}`}
                    className="px-3 py-1.5 text-sm"
                  >
                    ...
                  </span>
                );
              if (isEllipsisAfter && pageNum > currentPage + 2)
                return (
                  <span
                    key={`ellipsis-end-${i}`}
                    className="px-3 py-1.5 text-sm"
                  >
                    ...
                  </span>
                );

              if (showPage) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading || isFetching}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading || isFetching}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      <Dialog
        open={showEventDetailsDialog}
        onOpenChange={(open) => {
          if (!open) setSelectedEventForDetail(null);
          setShowEventDetailsDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isLoadingDetail ? (
                <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />
              ) : (
                selectedEventForDetail?.tenSK
              )}
            </DialogTitle>
            {selectedEventForDetail && !isLoadingDetail && (
              <DialogDescription className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />{' '}
                {selectedEventForDetail.donViChuTri.tenDonVi}
                <span className="text-muted-foreground mx-1">•</span>
                <Calendar className="h-4 w-4 text-muted-foreground" />{' '}
                {formatDateRangeForDisplay(
                  selectedEventForDetail.tgBatDauDK,
                  selectedEventForDetail.tgKetThucDK
                )}
              </DialogDescription>
            )}
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="py-10 flex justify-center items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : selectedEventForDetail ? (
            <ScrollArea className="max-h-[65vh] pr-2">
              {' '}
              {/* Giảm max-h một chút */}
              <div className="space-y-4 py-4 pr-4">
                {selectedEventForDetail.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg mb-4 shadow-md">
                    <img
                      src={selectedEventForDetail.imageUrl}
                      alt={selectedEventForDetail.tenSK}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <InfoRow
                  label="Trạng thái:"
                  value={
                    <Badge
                      variant={
                        getPublicEventStatus(
                          selectedEventForDetail.trangThaiSK.maTrangThai,
                          selectedEventForDetail.tgBatDauDK
                        ).variant
                      }
                    >
                      {
                        getPublicEventStatus(
                          selectedEventForDetail.trangThaiSK.maTrangThai,
                          selectedEventForDetail.tgBatDauDK
                        ).text
                      }
                    </Badge>
                  }
                />
                <InfoRow
                  label="Thời gian:"
                  value={formatDateRangeForDisplay(
                    selectedEventForDetail.tgBatDauDK,
                    selectedEventForDetail.tgKetThucDK
                  )}
                />
                <InfoRow
                  label="Địa điểm:"
                  value={
                    selectedEventForDetail.diaDiemToChucDaXep ||
                    (selectedEventForDetail.daCoPhong
                      ? 'Phòng đã được bố trí'
                      : 'Chưa có thông tin phòng cụ thể')
                  }
                />
                <InfoRow
                  label="Đơn vị chủ trì:"
                  value={selectedEventForDetail.donViChuTri.tenDonVi}
                />
                <InfoRow
                  label="Người chủ trì:"
                  value={
                    selectedEventForDetail.nguoiChuTri?.hoTen ||
                    selectedEventForDetail.tenChuTriNgoai ||
                    'Chưa có thông tin'
                  }
                />
                <InfoRow
                  label="Số lượng dự kiến:"
                  value={`${
                    selectedEventForDetail.slThamDuDK || 'Không giới hạn'
                  } người`}
                />

                <div className="pt-2">
                  <Label className="font-semibold text-base">
                    Mô tả chi tiết
                  </Label>
                  <div className="mt-1 text-sm p-4 border rounded-md bg-muted/20 dark:bg-slate-800/50 whitespace-pre-line prose dark:prose-invert max-w-none">
                    {selectedEventForDetail.moTaChiTiet ||
                      'Sự kiện này chưa có mô tả chi tiết.'}
                  </div>
                </div>

                {selectedEventForDetail.donViThamGia &&
                  selectedEventForDetail.donViThamGia.length > 0 && (
                    <div className="pt-2">
                      <Label className="font-semibold text-base">
                        Các đơn vị cùng tham gia
                      </Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedEventForDetail.donViThamGia.map((dv) => (
                          <Badge
                            key={dv.donViID}
                            variant="secondary"
                            className="text-sm px-3 py-1"
                          >
                            {dv.tenDonVi}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                {selectedEventForDetail.khachMoiNgoaiGhiChu && (
                  <div className="pt-2">
                    <Label className="font-semibold text-base">
                      Khách mời (Ngoài Học viện)
                    </Label>
                    <div className="mt-1 text-sm p-3 border rounded-md bg-muted/20 dark:bg-slate-800/50 whitespace-pre-line">
                      {selectedEventForDetail.khachMoiNgoaiGhiChu}
                    </div>
                  </div>
                )}
                {/* Nút đăng ký tham gia (nếu có) */}
                {/* <div className="pt-4">
                <Button className="w-full sm:w-auto">
                  <Ticket className="mr-2 h-5 w-5"/> Đăng ký tham gia
                </Button>
              </div> */}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Không tải được thông tin chi tiết sự kiện.
            </div>
          )}
          <DialogFooter className="pt-4">
            {' '}
            {/* Thêm pt-4 */}
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'grid grid-cols-1 sm:grid-cols-3 items-start gap-x-4 gap-y-1 py-1.5 border-b border-border/50 dark:border-slate-700/50 last:border-b-0',
      className
    )}
  >
    <Label className="sm:text-right text-sm font-semibold text-muted-foreground col-span-1">
      {label}
    </Label>
    <div className="sm:col-span-2 text-sm">{value}</div>
  </div>
);

export default EventsPublic;
