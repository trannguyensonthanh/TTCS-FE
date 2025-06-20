/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, isSameDay } from 'date-fns'; // Keep this import
import { vi } from 'date-fns/locale';
import MaVaiTro from '@/enums/MaVaiTro.enum.js'; // Đảm bảo import này đúng
import DashboardLayout from '@/components/DashboardLayout';
import {
  useUpdateEventStatus, // Hook để tự hủy bởi người tạo
  useCreateEventCancelRequest,
  useManagedEventsList,
  useManagedEventDetail,
  PUBLIC_EVENT_QUERY_KEYS,

  // Giả định có thêm hook này nếu BGH duyệt/từ chối yêu cầu hủy từ trang này
  // useProcessEventCancelRequest
} from '@/hooks/queries/eventQueries';
import { motion } from 'framer-motion';
import MaTrangThaiSK from '@/enums/MaTrangThaiSK.enum'; // Enum cho trạng thái sự kiện
import {
  SuKienListItemResponse,
  SuKienDetailResponse,
  GetSuKienParams,
  UpdateSuKienTrangThaiPayload,
  CreateYeuCauHuySKPayload,
  // UpdateSuKienTrangThaiResponse, // Nếu cần type cho onSuccess của mutation
  // CreateYeuCauHuySKResponse, // Nếu cần type cho onSuccess của mutation
} from '@/services/event.service'; // Hoặc từ types/event.types.ts
import { APIError } from '@/services/apiHelper';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogClose, // Thêm DialogClose
  DialogTrigger, // Thêm DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea'; // Thêm Textarea
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  FileText,
  UserPlus,
  CalendarPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Info,
  XCircle, // Icon cho nút hủy/từ chối
  CheckCircle, // Icon cho nút duyệt
  Send, // Icon cho gửi yêu cầu
  CalendarDays,
  MapPin,
  Users as UsersIcon, // Đổi tên để tránh trùng với component Users
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CalendarX,
  Building,
  ClipboardList,
  Clipboard,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext'; // Giả định hook này có hàm hasPermission(action, resource)
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { ReusablePagination } from '@/components/ui/ReusablePagination';

// --- Helper Functions (Nên đưa ra file utils riêng nếu dùng ở nhiều nơi) ---
const formatDateRange = (start?: string, end?: string) => {
  if (!start) return 'N/A';
  const startDate = parseISO(start);
  const endDate = end ? parseISO(end) : null;
  let formatted = format(startDate, 'HH:mm dd/MM/yyyy', { locale: vi });
  if (endDate && !isSameDay(startDate, endDate)) {
    formatted += ` - ${format(endDate, 'HH:mm dd/MM/yyyy', { locale: vi })}`;
  } else if (endDate) {
    formatted = `${format(startDate, 'dd/MM/yyyy HH:mm')} - ${format(
      endDate,
      'HH:mm'
    )}`;
  }
  return formatted;
};

const getStatusBadgeVariant = (
  maTrangThai?: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (!maTrangThai) return 'outline';
  const upperStatus = maTrangThai.toUpperCase();
  if (
    upperStatus.includes('DA_DUYET') ||
    upperStatus.includes('DA_XAC_NHAN_PHONG') ||
    upperStatus === 'HOAN_THANH'
  )
    return 'default';
  if (
    upperStatus.includes('CHO_DUYET_BGH') ||
    upperStatus.includes('CHO_DUYET_PHONG')
  )
    return 'secondary';
  if (upperStatus.includes('BI_TU_CHOI') || upperStatus.includes('DA_HUY'))
    return 'destructive';
  return 'outline';
};

const EventsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hasRole, can } = useRole(); // hasAccess('ACTION', 'RESOURCE')
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterParamsState, setFilterParamsState] = useState<GetSuKienParams>({
    page: 1,
    limit: 10,
    sortOrder: 'desc',
    sortBy: 'NgayTaoSK',
  });

  const [selectedEventForDetail, setSelectedEventForDetail] =
    useState<SuKienDetailResponse | null>(null);
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false);

  const [eventToCancel, setEventToCancel] =
    useState<SuKienListItemResponse | null>(null);
  const [showCancelRequestDialog, setShowCancelRequestDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const getDefaultTab = () => {
    if (hasRole(MaVaiTro.QUAN_LY_CSVC)) return 'approved';
    if (hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG)) return 'pending_bgh_approval';
    if (hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN)) return 'my_events';
    return 'all';
  };
  const [activeTab, setActiveTab] = useState<string>(getDefaultTab());
  console.log('getDefaultTab():', hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Giữ nguyên limit
  const [currentSortBy, setCurrentSortBy] = useState('NgayTaoSK');
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(
    'desc'
  );
  const [filterTrangThaiSkMa, setFilterTrangThaiSkMa] = useState<
    string | undefined
  >(getDefaultTab() === 'pending_bgh_approval' ? 'CHO_DUYET_BGH' : undefined);

  // Tạo filterParams một cách có kiểm soát dựa trên activeTab và các state lọc khác
  const filterParams = useMemo((): GetSuKienParams => {
    const params: GetSuKienParams = {
      page,
      limit,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      searchTerm: debouncedSearchTerm || undefined,
      trangThaiSkMa: filterTrangThaiSkMa, // Sử dụng state riêng cho bộ lọc trạng thái
    };

    if (activeTab === 'my_events' && user?.nguoiDungID) {
      if (hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN)) {
        params.nguoiTaoID = user.nguoiDungID;
      }
    } else if (activeTab === 'pending_bgh_approval') {
      params.trangThaiSkMa = 'CHO_DUYET_BGH'; // Luôn lọc trạng thái này cho tab BGH
      // Nếu có filterTrangThaiSkMa từ select, nó sẽ ghi đè, cần xử lý
      // Hoặc ẩn select trạng thái khi ở tab này
    } else if (activeTab === 'upcoming') {
      params.sapDienRa = true;
      params.trangThaiSkMa =
        filterTrangThaiSkMa || 'DA_DUYET_BGH,DA_XAC_NHAN_PHONG';
    } else if (activeTab === 'approved') {
      params.trangThaiSkMa =
        filterTrangThaiSkMa ||
        'CHO_DUYET_PHONG,DA_XAC_NHAN_PHONG,PHONG_BI_TU_CHOI,HOAN_THANH';
    }
    // Nếu người dùng chọn một trạng thái cụ thể từ dropdown, nó sẽ ghi đè logic của tab
    // (trừ tab pending_bgh_approval có thể muốn cố định)
    if (filterTrangThaiSkMa && activeTab !== 'pending_bgh_approval') {
      params.trangThaiSkMa = filterTrangThaiSkMa;
    }

    return params;
  }, [
    page,
    limit,
    currentSortBy,
    currentSortOrder,
    debouncedSearchTerm,
    activeTab,
    user,
    hasRole,
    filterTrangThaiSkMa,
  ]);
  // --- React Query Hooks ---
  const {
    data: paginatedEvents,
    isLoading,
    isError,
    error: fetchError,
    refetch: refetchEventsList,
  } = useManagedEventsList(filterParams, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const {
    data: eventDetailData,
    isLoading: isLoadingDetail,
    refetch: refetchEventDetail,
  } = useManagedEventDetail(selectedEventForDetail?.suKienID);
  console.log('Event Detail Data:', eventDetailData);

  const updateStatusMutation = useUpdateEventStatus({
    onSuccess: () => {
      refetchEventsList(); // Làm mới danh sách
      if (selectedEventForDetail) {
        queryClient.invalidateQueries({
          queryKey: PUBLIC_EVENT_QUERY_KEYS.detail(
            selectedEventForDetail.suKienID
          ),
        });
      }
    },
  });
  const createCancelRequestMutation = useCreateEventCancelRequest({
    onSuccess: () => {
      setShowCancelRequestDialog(false);
      setCancelReason('');
      setEventToCancel(null);
      refetchEventsList();
      if (eventToCancel) {
        queryClient.invalidateQueries({
          queryKey: PUBLIC_EVENT_QUERY_KEYS.detail(eventToCancel.suKienID),
        });
      }
    },
  });

  const events = paginatedEvents?.items || [];
  const totalPages = paginatedEvents?.totalPages || 1;
  const currentPage = paginatedEvents?.currentPage || 1;

  // --- Event Handlers ---
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleFilterTrangThaiChange = (value: string) => {
    setFilterTrangThaiSkMa(value === 'all' ? undefined : value);
    setPage(1);
  };

  const applySearchAndFilters = useCallback(() => {
    setFilterParamsState((prev) => ({
      ...prev,
      searchTerm: searchTerm || undefined,
      page: 1,
    }));
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filterParamsState.searchTerm || '')) {
        applySearchAndFilters();
      }
    }, 500); // Debounce
    return () => clearTimeout(handler);
  }, [searchTerm, filterParamsState.searchTerm, applySearchAndFilters]);

  const handleFilterChange = (
    key: keyof GetSuKienParams,
    value: string | number | boolean | undefined
  ) => {
    setFilterParamsState((prev) => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilterParamsState((prev) => ({ ...prev, page: newPage }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1); // Reset về trang 1 khi chuyển tab
    // Các logic lọc riêng cho từng tab sẽ được áp dụng trong useMemo của filterParams
    // Ví dụ, nếu tab là "pending_bgh_approval", setFilterTrangThaiSkMa thành 'CHO_DUYET_BGH'
    if (value === 'pending_bgh_approval') {
      setFilterTrangThaiSkMa('CHO_DUYET_BGH');
    } else if (value === 'upcoming') {
      setFilterTrangThaiSkMa('DA_DUYET_BGH,DA_XAC_NHAN_PHONG');
    } else if (value === 'approved') {
      setFilterTrangThaiSkMa(
        'CHO_DUYET_PHONG,DA_XAC_NHAN_PHONG,PHONG_BI_TU_CHOI,HOAN_THANH'
      );
    } else {
      setFilterTrangThaiSkMa(undefined); // Xóa filter trạng thái khi chuyển sang tab 'all' hoặc 'my_events' (để user tự chọn)
    }
  };

  const openEventDetailsModal = async (eventId: number) => {
    // Reset trước để tránh hiển thị dữ liệu cũ
    setSelectedEventForDetail(null);
    // Set ID để trigger useEventDetail fetch
    // Việc gán trực tiếp eventDetailData vào selectedEventForDetail sẽ được thực hiện trong useEffect theo dõi eventDetailData
    // Hoặc là chỉ set ID và để hook tự fetch
    // Trong trường hợp này, chúng ta sẽ set một object tạm thời để dialog mở ra với tiêu đề
    const eventFromList = events.find((e) => e.suKienID === eventId);
    if (eventFromList) {
      setSelectedEventForDetail(eventFromList as any); // Ép kiểu tạm thời, hook sẽ fetch data đầy đủ
    }
    setShowEventDetailsDialog(true);
    // refetchEventDetail() sẽ tự chạy do enabled và suKienID thay đổi
  };

  // Cập nhật selectedEventForDetail khi eventDetailData (từ hook) thay đổi
  useEffect(() => {
    if (eventDetailData && showEventDetailsDialog) {
      setSelectedEventForDetail(eventDetailData);
    }
  }, [eventDetailData, showEventDetailsDialog]);

  const handleOpenCancelRequestDialog = (event: SuKienListItemResponse) => {
    setEventToCancel(event);
    setCancelReason('');
    setShowCancelRequestDialog(true);
  };

  const submitCancelRequest = async () => {
    if (!eventToCancel || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy sự kiện.');
      return;
    }
    createCancelRequestMutation.mutate({
      suKienID: eventToCancel.suKienID,
      lyDoHuy: cancelReason,
    });
  };

  const handleSelfCancelEvent = (event: SuKienListItemResponse) => {
    // Logic xác nhận trước khi tự hủy
    // Ví dụ dùng AlertDialog của shadcn/ui
    toast.warning(
      `Bạn có chắc chắn muốn tự hủy sự kiện "${event.tenSK}" không? Hành động này sẽ chuyển sự kiện sang trạng thái "Đã hủy bởi người tạo".`,
      {
        action: {
          label: 'Xác nhận hủy',
          onClick: () => {
            updateStatusMutation.mutate({
              suKienID: event.suKienID,
              payload: {
                maTrangThaiMoi: 'DA_HUY_BOI_NGUOI_TAO',
                lyDo: 'Người tạo tự hủy',
              },
            });
          },
        },
        cancel: {
          label: 'Không',
          onClick: () => {},
        },
      }
    );
  };

  // --- JSX Rendering ---
  const renderActionButtons = (event: SuKienListItemResponse) => {
    // Logic hiển thị nút dựa trên vai trò và trạng thái sự kiện
    const canUserEdit =
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      (event.trangThaiSK.maTrangThai === MaTrangThaiSK.CHO_DUYET_BGH ||
        event.trangThaiSK.maTrangThai === MaTrangThaiSK.DA_HUY_BOI_NGUOI_TAO ||
        event.trangThaiSK.maTrangThai ===
          MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK ||
        event.trangThaiSK.maTrangThai === MaTrangThaiSK.BI_TU_CHOI_BGH);

    const canUserSelfCancel =
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      (event.trangThaiSK.maTrangThai === MaTrangThaiSK.CHO_DUYET_BGH ||
        event.trangThaiSK.maTrangThai ===
          MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK);

    const canUserRequestCancel =
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      (event.trangThaiSK.maTrangThai === MaTrangThaiSK.DA_DUYET_BGH ||
        event.trangThaiSK.maTrangThai === MaTrangThaiSK.DA_XAC_NHAN_PHONG);

    const canUserRequestRoom =
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      event.trangThaiSK.maTrangThai === MaTrangThaiSK.DA_DUYET_BGH &&
      !event.daCoPhong;

    const canUserInvite = true;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => openEventDetailsModal(event.suKienID)}
          >
            <FileText className="mr-2 h-4 w-4" /> Chi tiết
          </DropdownMenuItem>
          {canUserEdit && (
            <DropdownMenuItem
              onClick={() => navigate(`/events/edit/${event.suKienID}`)}
            >
              {' '}
              {/* Giả sử có trang edit */}
              <Edit className="mr-2 h-4 w-4" /> Sửa
            </DropdownMenuItem>
          )}
          {canUserRequestRoom && (
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `/facilities/room-requests/new?eventId=${event.suKienID}`
                )
              }
            >
              <Building className="mr-2 h-4 w-4" /> Yêu cầu phòng
            </DropdownMenuItem>
          )}
          {canUserInvite && (
            <DropdownMenuItem
              onClick={() => navigate(`/events/${event.suKienID}/participants`)}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Mời tham gia
            </DropdownMenuItem>
          )}
          {(canUserSelfCancel || canUserRequestCancel) && (
            <DropdownMenuSeparator />
          )}
          {canUserSelfCancel && (
            <DropdownMenuItem
              onClick={() => handleSelfCancelEvent(event)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" /> Tự hủy yêu cầu
            </DropdownMenuItem>
          )}
          {canUserRequestCancel && (
            <DropdownMenuItem
              onClick={() => handleOpenCancelRequestDialog(event)}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <CalendarX className="mr-2 h-4 w-4" /> Yêu cầu hủy sự kiện
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <DashboardLayout pageTitle="Quản Lý Sự Kiện">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Chỉ giữ lại phần lọc và tìm kiếm */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm tên, đơn vị tổ chức..."
              className="pl-10 h-10 rounded-md shadow-sm w-full"
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
          </div>
        </div>
        <div className="mb-6 p-4 border rounded-lg bg-card dark:border-slate-700 shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <Label
                htmlFor="filter-trangthai"
                className="text-xs font-semibold text-muted-foreground"
              >
                Lọc theo Trạng thái
              </Label>
              <Select
                value={filterTrangThaiSkMa || 'all'}
                onValueChange={handleFilterTrangThaiChange}
              >
                <SelectTrigger id="filter-trangthai">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {hasRole(MaVaiTro.QUAN_LY_CSVC) ? (
                    <>
                      <SelectItem value={MaTrangThaiSK.CHO_DUYET_PHONG}>
                        Chờ duyệt phòng
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.DA_XAC_NHAN_PHONG}>
                        Đã có phòng
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.PHONG_BI_TU_CHOI}>
                        Phòng bị từ chối
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.HOAN_THANH}>
                        Đã hoàn thành
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value={MaTrangThaiSK.CHO_DUYET_BGH}>
                        Chờ duyệt BGH
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.DA_DUYET_BGH}>
                        Đã duyệt BGH
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.CHO_DUYET_PHONG}>
                        Chờ duyệt phòng
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.DA_XAC_NHAN_PHONG}>
                        Đã có phòng
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.BI_TU_CHOI_BGH}>
                        Bị từ chối
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.DA_HUY}>
                        Đã hủy
                      </SelectItem>
                      <SelectItem value={MaTrangThaiSK.HOAN_THANH}>
                        Đã hoàn thành
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Giữ lại bảng danh sách sự kiện và các dialog như cũ */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">
              {activeTab === 'all' && 'Tất cả Sự kiện Hệ thống'}
              {activeTab === 'my_events' &&
                (hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN)
                  ? 'Sự kiện Tôi Tạo'
                  : 'Sự kiện Đơn vị Tôi Quản Lý/Tham Gia')}
              {activeTab === 'pending_bgh_approval' &&
                'Sự kiện Chờ Ban Giám Hiệu Duyệt'}
              {activeTab === 'upcoming' && 'Sự kiện Sắp Diễn Ra'}
              {activeTab === 'approved' &&
                'Sự kiện Đã Duyệt (Chờ/Yêu Cầu Phòng)'}
            </CardTitle>
            <CardDescription>
              Danh sách các sự kiện và trạng thái xử lý tương ứng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !events.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoading && events.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Clipboard className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-lg">Không có sự kiện nào phù hợp.</p>
              </div>
            ) : (
              <div className="rounded-md border shadow-sm bg-background dark:border-slate-800 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-slate-800/30">
                      <TableHead className="w-[30%] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Tên sự kiện
                      </TableHead>
                      <TableHead className="w-[20%] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Đơn vị tổ chức
                      </TableHead>
                      <TableHead className="w-[25%] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Thời gian
                      </TableHead>
                      <TableHead className="min-w-[150px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Địa điểm
                      </TableHead>
                      <TableHead className="text-center min-w-[140px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Trạng thái
                      </TableHead>
                      <TableHead className="text-right min-w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow
                        key={event.suKienID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell className="font-medium py-3 px-4">
                          <span
                            className="hover:text-primary dark:hover:text-ptit-red cursor-pointer font-semibold"
                            onClick={() =>
                              openEventDetailsModal(event.suKienID)
                            }
                          >
                            {event.tenSK}
                          </span>
                          {!event.isCongKhaiNoiBo && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs border-amber-500 text-amber-600"
                            >
                              Riêng tư
                            </Badge>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Người tạo: {event.nguoiTao.hoTen}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                          {event.donViChuTri.tenDonVi}
                        </TableCell>
                        <TableCell className="text-xs py-3 px-4 text-muted-foreground">
                          {format(parseISO(event.tgBatDauDK), 'dd/MM/yy HH:mm')}
                          <br />
                          <span className="text-slate-400 dark:text-slate-500">
                            đến{' '}
                            {format(
                              parseISO(event.tgKetThucDK),
                              'dd/MM/yy HH:mm'
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                          {event.diaDiemToChucDaXep ||
                            (event.daCoPhong ? 'Đã xếp' : 'Chưa xếp')}
                        </TableCell>
                        <TableCell className="text-center py-3 px-4">
                          <Badge
                            variant={getStatusBadgeVariant(
                              event.trangThaiSK.maTrangThai
                            )}
                            className="whitespace-nowrap"
                          >
                            {event.trangThaiSK.tenTrangThai}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          {renderActionButtons(event)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {paginatedEvents && totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
                className="mt-6"
              />
            )}
          </CardContent>
        </Card>

        {/* Event Details Dialog */}
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
                <DialogDescription>
                  {selectedEventForDetail.donViChuTri.tenDonVi} •{' '}
                  {formatDateRange(
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
              <ScrollArea className="max-h-[70vh] pr-2">
                {' '}
                {/* Thêm pr-2 cho scrollbar */}
                <div className="space-y-4 py-4 pr-4">
                  {' '}
                  {/* Thêm pr-4 để nội dung không bị che */}
                  {/* Các trường thông tin chi tiết */}
                  <InfoRow
                    label="Trạng thái:"
                    value={
                      <Badge
                        variant={getStatusBadgeVariant(
                          selectedEventForDetail.trangThaiSK.maTrangThai
                        )}
                      >
                        {selectedEventForDetail.trangThaiSK.tenTrangThai}
                      </Badge>
                    }
                  />
                  <InfoRow
                    label="Thời gian:"
                    value={formatDateRange(
                      selectedEventForDetail.tgBatDauDK,
                      selectedEventForDetail.tgKetThucDK
                    )}
                  />
                  <InfoRow
                    label="Địa điểm chính:"
                    value={
                      selectedEventForDetail.diaDiemToChucDaXep ||
                      (selectedEventForDetail.daCoPhong
                        ? 'Đã xếp phòng (xem chi tiết phòng)'
                        : 'Chưa xếp phòng')
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
                      'Chưa xác định'
                    }
                  />
                  <InfoRow
                    label="Số lượng dự kiến:"
                    value={`${
                      selectedEventForDetail.slThamDuDK || 'N/A'
                    } người`}
                  />
                  <InfoRow
                    label="Công khai nội bộ:"
                    value={
                      selectedEventForDetail.isCongKhaiNoiBo ? 'Có' : 'Không'
                    }
                  />
                  {selectedEventForDetail?.nguoiTao && (
                    <InfoRow
                      label="Người tạo:"
                      value={`${selectedEventForDetail?.nguoiTao?.hoTen} (vào ${
                        selectedEventForDetail?.ngayTaoSK
                          ? format(
                              parseISO(selectedEventForDetail?.ngayTaoSK),
                              'dd/MM/yyyy HH:mm',
                              { locale: vi }
                            )
                          : 'N/A'
                      })`}
                    />
                  )}
                  {selectedEventForDetail.nguoiDuyetBGH && (
                    <InfoRow
                      label="BGH Duyệt:"
                      value={`${
                        selectedEventForDetail.nguoiDuyetBGH.hoTen
                      } (vào ${
                        selectedEventForDetail.ngayDuyetBGH
                          ? format(
                              parseISO(selectedEventForDetail.ngayDuyetBGH),
                              'dd/MM/yyyy HH:mm',
                              { locale: vi }
                            )
                          : 'N/A'
                      })`}
                    />
                  )}
                  {selectedEventForDetail.lyDoTuChoiBGH && (
                    <InfoRow
                      label="Lý do BGH từ chối:"
                      value={selectedEventForDetail.lyDoTuChoiBGH}
                      className="text-destructive"
                    />
                  )}
                  {selectedEventForDetail.lyDoHuyNguoiTao && (
                    <InfoRow
                      label="Lý do người tạo hủy:"
                      value={selectedEventForDetail.lyDoHuyNguoiTao}
                      className="text-destructive"
                    />
                  )}
                  {selectedEventForDetail.khachMoiNgoaiGhiChu && (
                    <InfoRow
                      label="Khách mời ngoài:"
                      value={selectedEventForDetail.khachMoiNgoaiGhiChu}
                    />
                  )}
                  <div className="pt-2">
                    <Label className="font-semibold">Mô tả chi tiết:</Label>
                    <div className="mt-1 text-sm p-3 border rounded-md bg-muted/30 whitespace-pre-wrap">
                      {selectedEventForDetail.moTaChiTiet ||
                        'Không có mô tả chi tiết.'}
                    </div>
                  </div>
                  {selectedEventForDetail.donViThamGia &&
                    selectedEventForDetail.donViThamGia.length > 0 && (
                      <div className="pt-2">
                        <Label className="font-semibold">
                          Đơn vị tham gia:
                        </Label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedEventForDetail.donViThamGia.map((dv) => (
                            <Badge key={dv.donViID} variant="secondary">
                              {dv.tenDonVi}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {selectedEventForDetail.chiTietDatPhong &&
                    selectedEventForDetail.chiTietDatPhong.length > 0 && (
                      <div className="pt-2">
                        <Label className="font-semibold">Phòng được xếp:</Label>
                        <div className="mt-1 space-y-1">
                          {selectedEventForDetail.chiTietDatPhong.map((p) => (
                            <Badge
                              key={p.phongID}
                              variant="outline"
                              className="mr-2 cursor-pointer hover:bg-accent"
                              onClick={() =>
                                navigate(`/facilities/rooms/${p.phongID}`)
                              }
                            >
                              {' '}
                              {/* Giả sử có trang chi tiết phòng */}
                              {p.tenPhong} (
                              {format(parseISO(p.tgNhanPhongTT), 'HH:mm')} -{' '}
                              {format(parseISO(p.tgTraPhongTT), 'HH:mm dd/MM')})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {selectedEventForDetail.yeuCauHuy && (
                    <div className="mt-2 p-3 border border-amber-500 rounded-md bg-amber-50 dark:bg-amber-900/30">
                      <Label className="text-amber-700 dark:text-amber-400 font-semibold">
                        Thông tin Yêu Cầu Hủy Sự Kiện:
                      </Label>
                      <InfoRow
                        label="Lý do yêu cầu hủy:"
                        value={selectedEventForDetail.yeuCauHuy.lyDoHuy}
                      />
                      <InfoRow
                        label="Trạng thái YC Hủy:"
                        value={
                          <Badge
                            variant={getStatusBadgeVariant(
                              selectedEventForDetail.yeuCauHuy.trangThaiYcHuySK
                                .maTrangThai
                            )}
                          >
                            {
                              selectedEventForDetail.yeuCauHuy.trangThaiYcHuySK
                                .tenTrangThai
                            }
                          </Badge>
                        }
                      />
                      <InfoRow
                        label="Người YC Hủy:"
                        value={
                          selectedEventForDetail.yeuCauHuy.nguoiYeuCau.hoTen
                        }
                      />
                      <InfoRow
                        label="Ngày YC Hủy:"
                        value={format(
                          parseISO(
                            selectedEventForDetail.yeuCauHuy.ngayYeuCauHuy
                          ), // PARSE THE DATE STRING
                          'dd/MM/yyyy HH:mm',
                          { locale: vi }
                        )}
                      />
                    </div>
                  )}
                  {/* TODO: Hiển thị danh sách tài liệu, người được mời */}
                </div>
              </ScrollArea>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                Không tải được thông tin chi tiết sự kiện.
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Đóng</Button>
              </DialogClose>
              {/* Các nút hành động cho dialog chi tiết (ví dụ: Sửa, Yêu cầu hủy từ đây) */}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Request Dialog */}
        <Dialog
          open={showCancelRequestDialog}
          onOpenChange={(open) => {
            if (!open) setEventToCancel(null);
            setShowCancelRequestDialog(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Yêu cầu hủy sự kiện: {eventToCancel?.tenSK}
              </DialogTitle>
              <DialogDescription>
                Vui lòng nhập lý do bạn muốn hủy sự kiện này. Yêu cầu sẽ được
                gửi đến Ban Giám Hiệu để xem xét.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="cancelReason">
                Lý do hủy <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nêu rõ lý do yêu cầu hủy sự kiện..."
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelRequestDialog(false);
                  setEventToCancel(null);
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={submitCancelRequest}
                disabled={
                  !cancelReason.trim() || createCancelRequestMutation.isPending
                }
              >
                {createCancelRequestMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Gửi yêu cầu hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

// Helper component cho các dòng thông tin trong dialog
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
    className={cn('grid grid-cols-3 items-start gap-x-4 gap-y-1', className)}
  >
    <Label className="text-right text-sm text-muted-foreground">{label}</Label>
    <div className="col-span-2 text-sm">{value}</div>
  </div>
);

export default EventsList;
