/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, formatDate, isSameDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

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
  const [filterParams, setFilterParams] = useState<GetSuKienParams>({
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

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my_events', 'pending_bgh_approval', 'upcoming'

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
  } = useManagedEventDetail(
    selectedEventForDetail?.suKienID
    // Remove 'enabled' option as it's not supported by the hook
  );

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
  console.log('Event Detail Data:', eventDetailData);
  console.log('Selected Event For Detail:', selectedEventForDetail);
  console.log('Paginated Events:', paginatedEvents);
  const events = paginatedEvents?.items || [];
  const totalPages = paginatedEvents?.totalPages || 1;
  const currentPage = paginatedEvents?.currentPage || 1;

  // --- Event Handlers ---
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const applySearchAndFilters = useCallback(() => {
    setFilterParams((prev) => ({
      ...prev,
      searchTerm: searchTerm || undefined,
      page: 1,
    }));
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filterParams.searchTerm || '')) {
        applySearchAndFilters();
      }
    }, 500); // Debounce
    return () => clearTimeout(handler);
  }, [searchTerm, filterParams.searchTerm, applySearchAndFilters]);

  const handleFilterChange = (
    key: keyof GetSuKienParams,
    value: string | number | boolean | undefined
  ) => {
    setFilterParams((prev) => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams: GetSuKienParams = {
      page: 1,
      limit: filterParams.limit,
      sortOrder: filterParams.sortOrder,
      sortBy: filterParams.sortBy,
    }; // Reset params trừ page, limit, sort

    if (value === 'my_events' && user?.nguoiDungID) {
      // CBTC chỉ xem sự kiện họ tạo, các vai trò quản lý đơn vị xem sự kiện đơn vị họ chủ trì/tham gia
      if (hasRole('CB_TO_CHUC_SU_KIEN')) {
        newParams.nguoiTaoID = user.nguoiDungID;
      } else if (user.vaiTroChucNang[0].donViThucThi.donViID) {
        // Giả sử AuthContext cung cấp donViThucThiID_Chinh của vai trò quản lý đơn vị
        newParams.donViChuTriID = user.vaiTroChucNang[0].donViThucThi.donViID;
        // Hoặc newParams.thamGiaDonViID = user.donViThucThiID_Chinh;
      }
    } else if (value === 'pending_bgh_approval') {
      newParams.trangThaiSkMa = 'CHO_DUYET_BGH';
    } else if (value === 'upcoming') {
      newParams.sapDienRa = true;
      newParams.trangThaiSkMa = 'DA_DUYET_BGH,DA_XAC_NHAN_PHONG'; // Chỉ sự kiện đã sẵn sàng
    }
    setFilterParams(newParams);
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
      can('edit', 'SuKien') &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      (event.trangThaiSK.maTrangThai === 'CHO_DUYET_BGH' ||
        event.trangThaiSK.maTrangThai === 'DA_HUY_BOI_NGUOI_TAO');

    const canUserSelfCancel =
      can('delete', 'SuKien') &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      event.trangThaiSK.maTrangThai === 'CHO_DUYET_BGH';

    const canUserRequestCancel =
      can('create', 'YeuCauHuySK') &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      (event.trangThaiSK.maTrangThai === 'DA_DUYET_BGH' ||
        event.trangThaiSK.maTrangThai === 'DA_XAC_NHAN_PHONG');

    const canUserRequestRoom =
      can('create', 'YeuCauMuonPhong') &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID &&
      event.trangThaiSK.maTrangThai === 'DA_DUYET_BGH' &&
      !event.daCoPhong;

    const canUserInvite =
      can('create', 'SK_MoiThamGia') &&
      event.nguoiTao.nguoiDungID === user?.nguoiDungID && // Hoặc trưởng đơn vị
      (event.trangThaiSK.maTrangThai === 'DA_DUYET_BGH' ||
        event.trangThaiSK.maTrangThai === 'DA_XAC_NHAN_PHONG' ||
        event.trangThaiSK.maTrangThai === 'HOAN_THANH');

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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header và TabsList đã có ở trên */}
        <Tabs>
          <TabsContent value={activeTab} className="mt-0">
            {' '}
            {/* Thêm mt-0 để sát TabsList */}
            <Card>
              {/* Header và Bộ lọc đã có ở trên */}
              <CardContent className="pt-6">
                {' '}
                {/* Thêm pt-6 nếu cần khoảng cách */}
                {isLoading ? (
                  <div className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : !isLoading && events.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Không có sự kiện nào phù hợp với tiêu chí hiện tại.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[280px]">
                            Tên sự kiện
                          </TableHead>
                          <TableHead className="min-w-[180px]">
                            Thời gian
                          </TableHead>
                          <TableHead className="min-w-[180px]">
                            Địa điểm
                          </TableHead>
                          <TableHead className="min-w-[200px]">
                            Đơn vị tổ chức
                          </TableHead>
                          <TableHead className="text-center min-w-[120px]">
                            Trạng thái
                          </TableHead>
                          <TableHead className="text-right min-w-[100px]">
                            Thao tác
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.suKienID}>
                            <TableCell className="font-medium">
                              <span
                                className="hover:text-primary cursor-pointer"
                                onClick={() =>
                                  openEventDetailsModal(event.suKienID)
                                }
                              >
                                {event.tenSK}
                              </span>
                              {!event.isCongKhaiNoiBo && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  Riêng tư
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col text-xs">
                                <span>
                                  {format(
                                    parseISO(event.tgBatDauDK),
                                    'HH:mm dd/MM'
                                  )}
                                </span>
                                <span className="text-muted-foreground">
                                  đến{' '}
                                  {format(
                                    parseISO(event.tgKetThucDK),
                                    'HH:mm dd/MM/yy'
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {event.diaDiemToChucDaXep || 'Chưa xếp phòng'}
                            </TableCell>
                            <TableCell>{event.donViChuTri.tenDonVi}</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={getStatusBadgeVariant(
                                  event.trangThaiSK.maTrangThai
                                )}
                              >
                                {event.trangThaiSK.tenTrangThai}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {renderActionButtons(event)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trang trước
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Trang sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                  <InfoRow
                    label="Người tạo:"
                    value={`${
                      selectedEventForDetail.nguoiTao.hoTen
                    } (vào ${format(
                      parseISO(selectedEventForDetail.ngayTaoSK),
                      'dd/MM/yyyy HH:mm',
                      { locale: vi }
                    )})`}
                  />
                  {selectedEventForDetail.nguoiDuyetBGH && (
                    <InfoRow
                      label="BGH Duyệt:"
                      value={`${
                        selectedEventForDetail.nguoiDuyetBGH.hoTen
                      } (vào ${
                        selectedEventForDetail.ngayDuyetBGH
                          ? formatDate(
                              selectedEventForDetail.ngayDuyetBGH,
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
                        value={formatDate(
                          selectedEventForDetail.yeuCauHuy.ngayYeuCauHuy,
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
      </div>
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
