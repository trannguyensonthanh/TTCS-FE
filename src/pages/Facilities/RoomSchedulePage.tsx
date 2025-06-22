/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Facilities/RoomSchedulePage.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  subDays,
  isValid,
} from 'date-fns';
import { vi } from 'date-fns/locale';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { useLichDatPhong } from '@/hooks/queries/lichDatPhongQueries';
import {
  usePhongListForSelect,
  useLoaiPhongList,
  useToaNhaTangListForSelect,
} from '@/hooks/queries/danhMucQueries';
import {
  LichDatPhongItemResponse,
  GetLichDatPhongParams,
} from '@/services/lichDatPhong.service';

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'; // Thêm SelectGroup, SelectLabel
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// import { Calendar as CalendarShadcn } from "@/components/ui/calendar"; // Không thấy dùng CalendarShadcn trực tiếp
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area'; // ScrollArea cho Popover phòng
import { Label } from '@/components/ui/label'; // Label cho các InfoRow

import {
  Loader2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Building,
  Filter,
  Users,
  MapPin,
  Clock,
  Info,
  ListFilter,
  PlusCircle,
  ChevronsUpDown,
  CheckCircle,
  ExternalLink, // Thêm các icon cần thiết
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
// useDebounce không thấy dùng trực tiếp, có thể bỏ

// Kiểu dữ liệu cho event của FullCalendar
interface CalendarEvent {
  id: string;
  resourceId?: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    organizer: string;
    roomName: string;
    participantsCount?: number;
    suKienID: number;
    maTrangThaiDatPhong?: string; // Thêm để có thể style event
    originalData: LichDatPhongItemResponse; // Lưu trữ data gốc để dễ truy cập
  };
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  className?: string; // Cho phép thêm class tùy chỉnh
}

// Kiểu dữ liệu cho resource của FullCalendar (Phòng)
interface CalendarResource {
  id: string;
  title: string;
  building?: string;
  type?: string;
  capacity?: number;
  // Các thuộc tính khác
}

const formatDate = (
  dateString?: string | Date,
  customFormat = 'dd/MM/yyyy HH:mm'
) => {
  if (!dateString) return 'N/A';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, customFormat, { locale: vi });
  } catch (e) {
    return 'Ngày không hợp lệ';
  }
};

const RoomSchedulePage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);

  const [currentView, setCurrentView] = useState('resourceTimelineWeek');
  const [currentDateRange, setCurrentDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const [filterToaNhaId, setFilterToaNhaId] = useState<string | undefined>(
    undefined
  );
  const [filterLoaiPhongId, setFilterLoaiPhongId] = useState<
    string | undefined
  >(undefined);
  const [selectedRoomsForFilter, setSelectedRoomsForFilter] = useState<
    string[]
  >([]);

  const [selectedEventDetail, setSelectedEventDetail] =
    useState<LichDatPhongItemResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // --- Data Fetching ---
  const lichDatPhongParams = useMemo(
    (): GetLichDatPhongParams => ({
      tuNgay: format(currentDateRange.start, 'yyyy-MM-dd'),
      denNgay: format(currentDateRange.end, 'yyyy-MM-dd'),
      toaNhaID: filterToaNhaId ? parseInt(filterToaNhaId) : undefined,
      loaiPhongID: filterLoaiPhongId ? parseInt(filterLoaiPhongId) : undefined,
      phongIDs:
        selectedRoomsForFilter.length > 0
          ? selectedRoomsForFilter.join(',')
          : undefined,
    }),
    [
      currentDateRange,
      filterToaNhaId,
      filterLoaiPhongId,
      selectedRoomsForFilter,
    ]
  );

  const {
    data: lichDatPhongData,
    isLoading: isLoadingLich,
    isFetching: isFetchingLich,
  } = useLichDatPhong(lichDatPhongParams, {
    staleTime: 1 * 60 * 1000,
  });
  console.log('LichDatPhongParams:', lichDatPhongData);
  const { data: dsToaNha, isLoading: isLoadingToaNha } =
    useToaNhaTangListForSelect({ limit: 100 });
  const { data: dsLoaiPhong, isLoading: isLoadingLoaiPhong } = useLoaiPhongList(
    { limit: 100 }
  );
  const { data: dsPhongFull, isLoading: isLoadingPhong } =
    usePhongListForSelect({
      // dsPhongFull để tránh trùng tên với biến dsPhong trong map
      limit: 100, // Lấy nhiều phòng cho filter
      loaiPhongID: filterLoaiPhongId ? parseInt(filterLoaiPhongId) : undefined,
      // Không filter theo trạng thái phòng ở đây, để hiển thị tất cả phòng trong resource view
    });

  // --- Transform data for FullCalendar ---
  const calendarEvents = useMemo((): CalendarEvent[] => {
    if (!lichDatPhongData) return [];
    return lichDatPhongData.map((item) => {
      let eventColor = '#3788d8'; // Default blue
      // Ví dụ: Custom màu dựa trên trạng thái đặt phòng hoặc loại sự kiện
      if (item.maTrangThaiDatPhong === 'DA_XAC_NHAN')
        eventColor = '#28a745'; // Green
      else if (item.maTrangThaiDatPhong === 'CHO_XAC_NHAN')
        eventColor = '#ffc107'; // Yellow

      return {
        id: item.datPhongID.toString(),
        resourceId: item.phong.phongID.toString(),
        title: item.tenSK,
        start: parseISO(item.tgNhanPhongTT),
        end: parseISO(item.tgTraPhongTT),
        extendedProps: {
          organizer: item.donViToChuc.tenDonVi,
          roomName: item.phong.tenPhong,
          suKienID: item.suKienID,
          // participantsCount: item.soLuongThamGiaDuKien, //
          maTrangThaiDatPhong: item.maTrangThaiDatPhong,
          originalData: item,
        },
        backgroundColor: eventColor,
        borderColor: eventColor,
      };
    });
  }, [lichDatPhongData]);

  const calendarResources = useMemo((): CalendarResource[] => {
    if (!dsPhongFull) return [];
    let filteredRooms = dsPhongFull;
    // Filter theo selectedRoomsForFilter CHỈ KHI selectedRoomsForFilter có giá trị
    if (selectedRoomsForFilter.length > 0) {
      filteredRooms = dsPhongFull.filter((p) =>
        selectedRoomsForFilter.includes(p.phongID.toString())
      );
    }
    // Nếu không có phòng nào được chọn trong filter, và dsPhongFull có dữ liệu, thì hiển thị tất cả phòng (đã lọc bởi tòa nhà/loại phòng)
    // Nếu filter tòa nhà/loại phòng cũng rỗng, thì dsPhongFull là tất cả phòng.

    return filteredRooms.map((phong) => ({
      id: phong.phongID.toString(),
      title: `${phong.tenPhong} (${phong.maPhong || 'N/A'})`,
      building:
        dsToaNha?.find((hp) => hp.toaNhaTangID === phong.toaNhaTangID)
          ?.tenToaNha || 'Chưa phân loại',
      type:
        dsLoaiPhong?.find((lp) => lp.loaiPhongID === phong.loaiPhongID)
          ?.tenLoaiPhong || 'Chưa phân loại',
      capacity: phong.sucChua,
    }));
  }, [dsPhongFull, selectedRoomsForFilter]);

  // --- Calendar Handlers ---
  const handleDatesSet = useCallback(
    (dateInfo: { start: Date; end: Date; view: any }) => {
      let endDateCorrected = dateInfo.end;
      if (
        !dateInfo.view.type.toLowerCase().includes('timegrid') &&
        !dateInfo.view.type.toLowerCase().includes('timeline')
      ) {
        endDateCorrected = subDays(dateInfo.end, 1);
      }
      setCurrentDateRange({ start: dateInfo.start, end: endDateCorrected });
    },
    []
  );

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const bookingDetail = clickInfo.event.extendedProps
      .originalData as LichDatPhongItemResponse;
    if (bookingDetail) {
      setSelectedEventDetail(bookingDetail);
      setIsDetailModalOpen(true);
    }
  }, []);

  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      // Logic mở dialog tạo đặt phòng nhanh (cho CSVC)
      console.log(
        'Date clicked:',
        arg.dateStr,
        'Resource ID:',
        arg.resource?.id
      );
      // navigate(`/facilities/room-requests/new?date=${arg.dateStr}&phongId=${arg.resource?.id}`);
    },
    [navigate]
  );

  // --- UI Effects ---
  useEffect(() => {
    if (
      calendarRef.current &&
      (currentView.startsWith('resourceTimeline') ||
        currentView.startsWith('timeGrid'))
    ) {
      calendarRef.current.getApi().scrollToTime({ hour: 7 });
    }
  }, [currentView, calendarRef]); // Thêm calendarRef vào dependencies

  const canManageCalendar = useMemo(
    () => hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );

  function handleSelectDates(arg: any): void {
    // Only allow quick booking if user can manage calendar
    if (!canManageCalendar) return;
    // If a resource (room) is selected, prefill roomId
    const roomId = arg.resource?.id;
    const start = arg.startStr;
    const end = arg.endStr;
    // Navigate to new booking page with prefilled date and room
    navigate(
      `/facilities/room-requests/new?date=${encodeURIComponent(
        start
      )}&endDate=${encodeURIComponent(end)}${
        roomId ? `&phongId=${roomId}` : ''
      }`
    );
  }

  return (
    <DashboardLayout
      pageTitle="Lịch Sử Dụng Phòng"
      headerActions={
        canManageCalendar ? (
          <Button
            size="sm"
            onClick={() => navigate('/facilities/room-requests/new')}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Tạo Yêu Cầu Mới
          </Button>
        ) : null
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-6"
      >
        <Card className="shadow-lg dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary dark:text-ptit-red" /> Bộ
              Lọc Lịch Phòng
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <Label
                htmlFor="filter-building"
                className="text-xs font-medium text-muted-foreground"
              >
                Tòa Nhà
              </Label>
              <Select
                value={filterToaNhaId}
                onValueChange={(value) => {
                  setFilterToaNhaId(value === 'all' ? undefined : value);
                  setSelectedRoomsForFilter(
                    []
                  ); /* Reset chọn phòng khi đổi tòa nhà */
                }}
                disabled={isLoadingToaNha}
              >
                <SelectTrigger id="filter-building" className="h-9 text-sm">
                  <SelectValue
                    placeholder={isLoadingToaNha ? 'Tải...' : 'Tất cả tòa nhà'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                  {dsToaNha?.map((toaNha) => (
                    <SelectItem
                      key={toaNha.toaNhaID}
                      value={toaNha.toaNhaID.toString()}
                    >
                      {toaNha.tenToaNha} ({toaNha.toaNhaID})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="filter-roomtype"
                className="text-xs font-medium text-muted-foreground"
              >
                Loại Phòng
              </Label>
              <Select
                value={filterLoaiPhongId}
                onValueChange={(value) => {
                  setFilterLoaiPhongId(value === 'all' ? undefined : value);
                  setSelectedRoomsForFilter([]); /* Reset chọn phòng */
                }}
                disabled={isLoadingLoaiPhong}
              >
                <SelectTrigger id="filter-roomtype" className="h-9 text-sm">
                  <SelectValue
                    placeholder={isLoadingLoaiPhong ? 'Tải...' : 'Tất cả loại'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {dsLoaiPhong?.map((lp) => (
                    <SelectItem
                      key={lp.loaiPhongID}
                      value={lp.loaiPhongID.toString()}
                    >
                      {lp.tenLoaiPhong}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label
                htmlFor="filter-rooms"
                className="text-xs font-medium text-muted-foreground"
              >
                Chọn Phòng Cụ Thể
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="filter-rooms"
                    className="w-full justify-start font-normal h-9 text-sm"
                  >
                    {selectedRoomsForFilter.length > 0
                      ? `${selectedRoomsForFilter.length} phòng đã chọn`
                      : isLoadingPhong
                      ? 'Tải DS phòng...'
                      : 'Lọc theo phòng...'}
                    <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-80">
                  <Command>
                    <CommandInput placeholder="Tìm phòng..." />
                    <CommandList>
                      <ScrollArea className="max-h-72">
                        <CommandEmpty>
                          {isLoadingPhong
                            ? 'Đang tải...'
                            : 'Không tìm thấy phòng.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {dsPhongFull?.map((phong) => (
                            <CommandItem
                              key={phong.phongID}
                              value={`${phong.tenPhong} ${phong.maPhong || ''}`}
                              onSelect={() => {
                                const newSelection =
                                  selectedRoomsForFilter.includes(
                                    phong.phongID.toString()
                                  )
                                    ? selectedRoomsForFilter.filter(
                                        (id) => id !== phong.phongID.toString()
                                      )
                                    : [
                                        ...selectedRoomsForFilter,
                                        phong.phongID.toString(),
                                      ];
                                setSelectedRoomsForFilter(newSelection);
                              }}
                            >
                              <CheckCircle
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedRoomsForFilter.includes(
                                    phong.phongID.toString()
                                  )
                                    ? 'opacity-100 text-primary'
                                    : 'opacity-0'
                                )}
                              />
                              {phong.tenPhong}{' '}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({phong.maPhong || 'N/A'}) -{' '}
                                {phong.sucChua || '?'} người
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </ScrollArea>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedRoomsForFilter.length > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setSelectedRoomsForFilter([])}
                >
                  Xóa tất cả chọn phòng
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="border-b dark:border-slate-800 p-3 md:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <CardTitle className="text-lg sm:text-xl">
                Lịch Phòng: {format(currentDateRange.start, 'dd/MM')} -{' '}
                {format(currentDateRange.end, 'dd/MM/yyyy', { locale: vi })}
              </CardTitle>
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => calendarRef.current?.getApi().prev()}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => calendarRef.current?.getApi().today()}
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  Hôm Nay
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => calendarRef.current?.getApi().next()}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Select
                  value={currentView}
                  onValueChange={(view) => {
                    setCurrentView(view);
                    // Reset date range khi đổi view
                    if (
                      view.startsWith('resourceTimeline') ||
                      view.startsWith('timeGrid')
                    ) {
                      setCurrentDateRange({
                        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
                        end: endOfWeek(new Date(), { weekStartsOn: 1 }),
                      });
                    } else {
                      setCurrentDateRange({
                        start: new Date(),
                        end: new Date(),
                      });
                    }
                    calendarRef.current?.getApi().changeView(view);
                  }}
                >
                  <SelectTrigger className="w-auto sm:w-[180px] h-8 sm:h-9 ml-2 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resourceTimelineDay">
                      Theo Ngày (Phòng)
                    </SelectItem>
                    <SelectItem value="resourceTimelineWeek">
                      Theo Tuần (Phòng)
                    </SelectItem>
                    <SelectItem value="timeGridWeek">Lịch Tuần</SelectItem>
                    <SelectItem value="dayGridMonth">Lịch Tháng</SelectItem>
                    {/* <SelectItem value="listWeek">Danh sách Tuần</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-1 sm:p-2 md:p-4 relative">
            {' '}
            {/* Thêm relative cho loader overlay */}
            {(isLoadingLich || isFetchingLich) && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20 rounded-b-md">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            <div
              className={cn(
                'fc-theme-ptit min-h-[75vh]',
                (isLoadingLich || isFetchingLich) && 'opacity-50'
              )}
            >
              <FullCalendar
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                  resourceTimelinePlugin,
                ]}
                headerToolbar={false}
                initialView={currentView}
                weekends={true}
                events={calendarEvents}
                resources={calendarResources}
                resourceAreaHeaderContent="Phòng"
                resourceGroupField="building"
                locale={vi}
                allDaySlot={false}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:15:00"
                slotLabelInterval={{ hours: 1 }}
                slotLabelFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  omitZeroMinute: false,
                  meridiem: false,
                  hour12: false,
                }}
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: false,
                }}
                height="auto"
                contentHeight="auto" // Quan trọng để scroll nội bộ
                stickyHeaderDates={true} // Dính header ngày khi cuộn (cho timeline view)
                datesSet={handleDatesSet}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                selectable={canManageCalendar}
                select={handleSelectDates}
                // editable={canManageCalendar} // Tạm thời tắt, cần API
                schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
                resourceOrder="building,type,title"
                nowIndicator={true} // Hiển thị đường chỉ giờ hiện tại
                scrollTime={'07:00:00'} // Scroll tới 7h sáng khi load
                businessHours={{
                  // Đánh dấu giờ làm việc (tùy chọn)
                  daysOfWeek: [1, 2, 3, 4, 5, 6, 7], // Thứ 2 - Chủ Nhật
                  startTime: '07:30',
                  endTime: '17:30',
                }}
                eventDisplay="block" // Hiển thị event dạng block
                eventMinWidth={60} // Chiều rộng tối thiểu của event trên timeline
                resourceAreaWidth="25%" // Tăng chiều rộng cột resource
                views={{
                  resourceTimelineThreeDays: {
                    type: 'resourceTimeline',
                    duration: { days: 3 },
                    buttonText: '3 ngày',
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={isDetailModalOpen && !!selectedEventDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedEventDetail(null);
          setIsDetailModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg md:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl line-clamp-2">
              {selectedEventDetail?.tenSK}
            </DialogTitle>
            <DialogDescription>Chi tiết lịch đặt phòng.</DialogDescription>
          </DialogHeader>
          {selectedEventDetail ? (
            <ScrollArea className="max-h-[65vh] pr-2 -mr-2">
              <div className="space-y-2.5 py-4 pr-3 text-sm">
                <InfoRow
                  label="Sự kiện:"
                  value={
                    <Link
                      to={`/events/${selectedEventDetail.suKienID}`}
                      className="text-primary hover:underline font-medium flex items-center"
                    >
                      {selectedEventDetail.tenSK}{' '}
                      <ExternalLink className="ml-1 h-3.5 w-3.5 opacity-70" />
                    </Link>
                  }
                />
                <InfoRow
                  label="Đơn vị tổ chức:"
                  value={selectedEventDetail.donViToChuc.tenDonVi}
                />
                <Separator className="my-3" />
                <InfoRow
                  label="Phòng đặt:"
                  value={`${selectedEventDetail.phong.tenPhong} (${
                    selectedEventDetail.phong.maPhong || 'N/A'
                  })`}
                />
                <InfoRow
                  label="Loại phòng:"
                  value={
                    selectedEventDetail.phong.loaiPhong?.tenLoaiPhong || 'N/A'
                  }
                />
                <InfoRow
                  label="Tòa nhà:"
                  value={
                    dsToaNha.find(
                      (toaNha) =>
                        toaNha.toaNhaTangID ===
                        selectedEventDetail.phong.toaNhaTangID
                    )?.tenToaNha || 'N/A'
                  }
                />
                <InfoRow
                  label="Tầng:"
                  value={
                    dsToaNha.find(
                      (toaNha) =>
                        toaNha.toaNhaTangID ===
                        selectedEventDetail.phong.toaNhaTangID
                    )?.tenLoaiTang || 'N/A'
                  }
                />
                <InfoRow
                  label="Sức chứa phòng:"
                  value={`${selectedEventDetail.phong.sucChua || '?'} người`}
                />
                <InfoRow
                  label="Thời gian sử dụng:"
                  value={
                    formatDate(selectedEventDetail.tgNhanPhongTT) +
                    ' - ' +
                    formatDate(selectedEventDetail.tgTraPhongTT)
                  }
                />
                {/* <InfoRow label="Ghi chú CSVC:" value={selectedEventDetail.ghiChuCSVC || <span className="italic text-muted-foreground">Không có</span>} /> */}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Không có thông tin chi tiết.
            </div>
          )}
          <DialogFooter className="pt-4 border-t">
            {/* <Button variant="secondary" onClick={() => navigate(`/facilities/room-requests?detailId=${selectedEventDetail?.ycMuonPhongID}`)}>Xem YC Gốc</Button> */}
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const InfoRow: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}> = ({ label, value, className }) => (
  <div
    className={cn(
      'grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-x-4 gap-y-1 py-2 border-b border-border/30 dark:border-slate-700/30 last:border-b-0',
      className
    )}
  >
    <div className="text-sm font-medium text-muted-foreground sm:text-right">
      {label}
    </div>
    <div className="text-sm text-foreground break-words">{value}</div>
  </div>
);

export default RoomSchedulePage;
