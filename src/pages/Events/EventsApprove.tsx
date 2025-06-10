import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import DashboardLayout from '@/components/DashboardLayout';
import {
  useManagedEventsList, // Sử dụng hook này để lấy danh sách sự kiện cần quản lý
  useManagedEventDetail,
  useApproveEventBGH,
  EVENT_QUERY_KEYS,
  useRejectEventBGH, // Sử dụng hook này để lấy chi tiết
} from '@/hooks/queries/eventQueries';
import {
  SuKienListItemResponse,
  GetSuKienParams,
  SuKienDetailResponse,
  DonViResponseMin,
} from '@/services/event.service'; // Hoặc từ types/

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
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  History,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  MessageSquareWarning,
  ThumbsUp,
  ThumbsDown,
  Info,
  Calendar,
  Users as UsersIcon,
  MapPin,
  Building,
  Send,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { Label } from '@/components/ui/label';
import MaTrangThaiSK from '@/enums/maTrangThaiSK.enum';
import MaVaiTro from '@/enums/maVaiTro.enum';
import { useQueryClient } from '@tanstack/react-query';
import InfoRowDialog from '@/components/dialog/InfoRowDialog';
import { useSendRevisionRequest } from '@/hooks/queries/notificationQueries';
import { CreateYeuCauChinhSuaThongBaoPayload } from '@/services/notification.service';
// --- Helper Functions (Có thể đã có ở EventsList.tsx hoặc utils) ---
const formatDateRangeForDisplay = (start?: string, end?: string): string => {
  if (!start) return 'N/A';
  try {
    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : null;
    let formatted = format(startDate, 'HH:mm, EEEE, dd/MM/yyyy', {
      locale: vi,
    });
    if (endDate) {
      if (format(startDate, 'yyyyMMdd') === format(endDate, 'yyyyMMdd')) {
        formatted = `${format(startDate, 'dd/MM/yyyy')}, ${format(
          startDate,
          'HH:mm',
          { locale: vi }
        )} - ${format(endDate, 'HH:mm', { locale: vi })}`;
      } else {
        formatted = `${format(startDate, 'HH:mm dd/MM/yyyy', {
          locale: vi,
        })} - ${format(endDate, 'HH:mm dd/MM/yyyy', { locale: vi })}`;
      }
    }
    return formatted;
  } catch (e) {
    return 'Ngày không hợp lệ';
  }
};

const getStatusBadgeVariant = (
  maTrangThai?: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (!maTrangThai) return 'outline';
  const upperStatus = maTrangThai.toUpperCase();
  if (
    upperStatus === MaTrangThaiSK.DA_DUYET_BGH ||
    upperStatus === MaTrangThaiSK.DA_XAC_NHAN_PHONG ||
    upperStatus === MaTrangThaiSK.HOAN_THANH
  )
    return 'default'; // Use 'default' for success-like statuses
  if (upperStatus === MaTrangThaiSK.CHO_DUYET_BGH) return 'outline'; // Use 'outline' for warning-like statuses
  if (upperStatus === MaTrangThaiSK.CHO_DUYET_PHONG) return 'secondary'; // Use 'secondary' for info-like statuses
  if (
    upperStatus === MaTrangThaiSK.BI_TU_CHOI_BGH ||
    upperStatus.includes('DA_HUY')
  )
    return 'destructive';
  return 'secondary';
};

const EventsApprove = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const [showRevisionRequestDialog, setShowRevisionRequestDialog] =
    useState(false);
  const [revisionRequestContent, setRevisionRequestContent] = useState('');
  const [eventForRevision, setEventForRevision] = useState<
    SuKienListItemResponse | SuKienDetailResponse | null
  >(null);
  const [reasonText, setReasonText] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const [filterParams, setFilterParams] = useState<GetSuKienParams>({
    page: 1,
    limit: 10,
    sortBy: 'NgayTaoSK', // Ưu tiên sự kiện tạo sớm hơn
    sortOrder: 'asc',
    trangThaiSkMa: MaTrangThaiSK.CHO_DUYET_BGH, // Mặc định chỉ lấy sự kiện chờ BGH duyệt
  });

  const [selectedEventForAction, setSelectedEventForAction] =
    useState<SuKienListItemResponse | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const {
    data: paginatedEvents,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchEventsToApprove,
  } = useManagedEventsList(filterParams, {
    enabled:
      hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG) || hasRole(MaVaiTro.ADMIN_HE_THONG), // Chỉ fetch   quyền
  });

  const {
    data: eventDetailData,
    isLoading: isLoadingDetail,
    refetch: refetchEventDetail,
  } = useManagedEventDetail(selectedEventForAction?.suKienID);

  const approveMutation = useApproveEventBGH({
    onSuccess: () => {
      refetchEventsToApprove();
      if (selectedEventForAction) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(selectedEventForAction.suKienID),
        });
      }
      setSelectedEventForAction(null);
    },
  });
  const rejectMutation = useRejectEventBGH({
    onSuccess: () => {
      setShowRejectDialog(false);
      setRejectReason('');
      refetchEventsToApprove();
      if (selectedEventForAction) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(selectedEventForAction.suKienID),
        });
      }
      setSelectedEventForAction(null);
    },
  });

  const sendRevisionRequestMutation = useSendRevisionRequest({
    onSuccess: () => {
      setShowRevisionRequestDialog(false);
      setRevisionRequestContent('');
      setEventForRevision(null);
      // Không cần refetch danh sách sự kiện chờ duyệt vì trạng thái không đổi
      // Chỉ cần người tạo sự kiện nhận được thông báo
    },
  });

  const eventsToApprove = paginatedEvents?.items || [];
  const totalPages = paginatedEvents?.totalPages || 1;
  const currentPage = paginatedEvents?.currentPage || 1;

  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      page: 1,
    }));
  }, [debouncedSearchTerm]);

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
  };

  const openDetailsModal = (eventItem: SuKienListItemResponse) => {
    setSelectedEventForAction(eventItem);
    setShowDetailsDialog(true);
  };

  const openRejectModal = (eventItem: SuKienListItemResponse) => {
    setSelectedEventForAction(eventItem);
    setRejectReason(''); // Reset reason
    setShowRejectDialog(true);
  };

  const handleConfirmApprove = (eventItem: SuKienListItemResponse) => {
    toast.info(
      `Bạn có chắc chắn muốn duyệt sự kiện "${eventItem.tenSK}" không?`,
      {
        action: {
          label: 'Xác nhận duyệt',
          onClick: () =>
            approveMutation.mutate({
              suKienID: eventItem.suKienID,
              payload: {},
            }),
        },
        cancel: { label: 'Hủy bỏ', onClick: () => {} },
      }
    );
  };

  const handleConfirmReject = () => {
    if (!selectedEventForAction || !rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối.');
      return;
    }
    rejectMutation.mutate({
      suKienID: selectedEventForAction.suKienID,
      payload: { lyDoTuChoiBGH: rejectReason },
    });
  };

  const openRevisionRequestModal = (
    eventItem: SuKienListItemResponse | SuKienDetailResponse
  ) => {
    setEventForRevision(eventItem);
    setRevisionRequestContent(''); // Reset nội dung
    setShowRevisionRequestDialog(true);
  };

  const handleSendRevisionRequest = () => {
    if (!eventForRevision || !revisionRequestContent.trim()) {
      toast.error('Vui lòng nhập nội dung yêu cầu chỉnh sửa.');
      return;
    }
    if (!eventForRevision.nguoiTao?.nguoiDungID) {
      // Đảm bảo có người tạo để gửi thông báo
      toast.error('Không tìm thấy thông tin người tạo sự kiện để gửi yêu cầu.');
      return;
    }

    const payload: CreateYeuCauChinhSuaThongBaoPayload = {
      loaiThucThe: 'SU_KIEN',
      idThucThe: eventForRevision.suKienID,
      nguoiNhanID: eventForRevision.nguoiTao.nguoiDungID, // Gửi cho người tạo sự kiện
      noiDungGhiChu: revisionRequestContent,
    };
    sendRevisionRequestMutation.mutate(payload);
  };

  const renderActionButtonsForApprovePage = (event: SuKienListItemResponse) => (
    <div className="flex justify-end gap-1 md:gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedEvent(event.suKienID.toString());
          setShowDetailsDialog(true);
        }}
      >
        <Info className="h-4 w-4 mr-1 md:mr-2" />{' '}
        <span className="hidden md:inline">Chi tiết</span>
      </Button>
      {/* Nút Yêu cầu chỉnh sửa */}
      <Dialog
        open={
          showRevisionRequestDialog &&
          eventForRevision?.suKienID === event.suKienID
        }
        onOpenChange={(open) => {
          if (!open) setEventForRevision(null);
          setShowRevisionRequestDialog(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-300"
            onClick={() => openRevisionRequestModal(event)}
          >
            <MessageSquareWarning className="h-4 w-4 mr-1 md:mr-2" />{' '}
            <span className="hidden md:inline">YC Chỉnh Sửa</span>
          </Button>
        </DialogTrigger>
        {/* Dialog Content sẽ được khai báo ở dưới cùng */}
      </Dialog>
      <Dialog
        open={openRejectModal && selectedEvent === event.suKienID.toString()}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
          setShowRejectDialog(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setSelectedEvent(event.suKienID.toString());
              setReasonText('');
            }}
            disabled={
              rejectMutation.isPending &&
              rejectMutation.variables?.suKienID === event.suKienID
            }
          >
            {rejectMutation.isPending &&
            rejectMutation.variables?.suKienID === event.suKienID ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1 md:mr-2" />
            ) : (
              <ThumbsDown className="h-4 w-4 mr-1 md:mr-2" />
            )}
            <span className="hidden md:inline">Từ chối</span>
          </Button>
        </DialogTrigger>
        {/* Dialog Content Từ chối sẽ được khai báo ở dưới cùng */}
      </Dialog>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => handleConfirmApprove(event)}
        disabled={
          approveMutation.isPending &&
          approveMutation.variables?.suKienID === event.suKienID
        }
      >
        {approveMutation.isPending &&
        approveMutation.variables?.suKienID === event.suKienID ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1 md:mr-2" />
        ) : (
          <ThumbsUp className="h-4 w-4 mr-1 md:mr-2" />
        )}
        <span className="hidden md:inline">Duyệt</span>
      </Button>
    </div>
  );

  // --- Quyền ---
  // Chỉ BGH và Admin mới được vào trang này
  if (
    !isLoading &&
    !hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG) &&
    !hasRole(MaVaiTro.ADMIN_HE_THONG)
  ) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldCheck className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-muted-foreground mb-6">
            Bạn không có quyền truy cập vào chức năng này.
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </DashboardLayout>
    );
  }

  const renderActionButtons = (event: SuKienListItemResponse) => (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => openDetailsModal(event)}
      >
        <Info className="h-4 w-4 mr-1 md:mr-2" />{' '}
        <span className="hidden md:inline">Chi tiết</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={() => handleConfirmApprove(event)}
        disabled={approveMutation.isPending}
      >
        {approveMutation.isPending &&
        approveMutation.variables?.suKienID === event.suKienID ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1 md:mr-2" />
        ) : (
          <ThumbsUp className="h-4 w-4 mr-1 md:mr-2" />
        )}
        <span className="hidden md:inline">Duyệt</span>
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => openRejectModal(event)}
        disabled={rejectMutation.isPending}
      >
        {rejectMutation.isPending &&
        rejectMutation.variables?.suKienID === event.suKienID ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1 md:mr-2" />
        ) : (
          <ThumbsDown className="h-4 w-4 mr-1 md:mr-2" />
        )}
        <span className="hidden md:inline">Từ chối</span>
      </Button>
    </div>
  );

  if (isLoading && !eventsToApprove.length) {
    return (
      <DashboardLayout pageTitle="Duyệt Sự Kiện (BGH)">
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Duyệt Sự Kiện (BGH)">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Danh sách Sự kiện Chờ Duyệt
            </CardTitle>
            <CardDescription>
              Các sự kiện đang chờ Ban Giám Hiệu phê duyệt chủ trương tổ chức.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên sự kiện, đơn vị tổ chức..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Có thể thêm các bộ lọc khác nếu cần (VD: lọc theo đơn vị tạo) */}
            </div>

            {isFetching && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </div>
            )}

            {!isFetching && eventsToApprove.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <p className="text-lg">Không có sự kiện nào đang chờ duyệt.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">
                        Tên Sự Kiện
                      </TableHead>
                      <TableHead className="min-w-[180px]">
                        Đơn vị Chủ trì
                      </TableHead>
                      <TableHead className="min-w-[150px]">Người Tạo</TableHead>
                      <TableHead className="min-w-[180px]">
                        Thời gian ĐK
                      </TableHead>
                      <TableHead className="text-center min-w-[100px]">
                        SL Dự kiến
                      </TableHead>
                      <TableHead className="text-right min-w-[220px]">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventsToApprove.map((event) => (
                      <TableRow
                        key={event.suKienID}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-medium py-3">
                          <span
                            className="hover:text-primary cursor-pointer"
                            onClick={() => openDetailsModal(event)}
                          >
                            {event.tenSK}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-3">
                          {event.donViChuTri.tenDonVi}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-3">
                          {event.nguoiTao.hoTen}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-3">
                          {format(parseISO(event.tgBatDauDK), 'dd/MM/yy HH:mm')}{' '}
                          -{' '}
                          {format(
                            parseISO(event.tgKetThucDK),
                            'dd/MM/yy HH:mm'
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground py-3">
                          {event.slThamDuDK || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right py-3">
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
                  disabled={currentPage === 1 || isLoading || isFetching}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === totalPages || isLoading || isFetching
                  }
                >
                  Sau <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog
          open={showRevisionRequestDialog && !!eventForRevision}
          onOpenChange={(open) => {
            if (!open) setEventForRevision(null);
            setShowRevisionRequestDialog(open);
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Gửi Yêu Cầu Chỉnh Sửa Sự Kiện
              </DialogTitle>
              <DialogDescription>
                Sự kiện:{' '}
                <span className="font-semibold">{eventForRevision?.tenSK}</span>
                <br />
                Nội dung yêu cầu chỉnh sửa sẽ được gửi đến người tạo sự kiện. Sự
                kiện sẽ vẫn ở trạng thái "Chờ duyệt".
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="revisionRequestContent" className="font-medium">
                Nội dung yêu cầu chỉnh sửa{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="revisionRequestContent"
                value={revisionRequestContent}
                onChange={(e) => setRevisionRequestContent(e.target.value)}
                placeholder="Nêu rõ các điểm cần chỉnh sửa, ví dụ: thời gian chưa hợp lý, mô tả cần chi tiết hơn, kiểm tra lại đơn vị tham gia..."
                className="min-h-[120px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRevisionRequestDialog(false);
                  setEventForRevision(null);
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSendRevisionRequest}
                disabled={
                  !revisionRequestContent.trim() ||
                  sendRevisionRequestMutation.isPending
                }
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {sendRevisionRequestMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Gửi Yêu Cầu Chỉnh Sửa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Dialog Chi Tiết Sự Kiện (Tái sử dụng từ EventsList hoặc tạo component riêng) */}
      <Dialog
        open={showDetailsDialog}
        onOpenChange={(open) => {
          if (!open) setSelectedEventForAction(null); // Reset để hook useManagedEventDetail không fetch lại khi không cần
          setShowDetailsDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isLoadingDetail ? (
                <Loader2 className="inline mr-2 h-5 w-5 animate-spin" />
              ) : (
                eventDetailData?.tenSK
              )}
            </DialogTitle>
            {eventDetailData && !isLoadingDetail && (
              <DialogDescription>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-1.5 text-muted-foreground" />{' '}
                    {eventDetailData.donViChuTri.tenDonVi}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-muted-foreground" />{' '}
                    {formatDateRangeForDisplay(
                      eventDetailData.tgBatDauDK,
                      eventDetailData.tgKetThucDK
                    )}
                  </span>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="py-10 flex justify-center items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : eventDetailData ? (
            <ScrollArea className="max-h-[65vh] pr-2">
              <div className="space-y-3 py-4 pr-4 text-sm">
                <InfoRowDialog
                  label="Trạng thái hiện tại:"
                  value={
                    <Badge
                      variant={getStatusBadgeVariant(
                        eventDetailData.trangThaiSK.maTrangThai
                      )}
                    >
                      {eventDetailData.trangThaiSK.tenTrangThai}
                    </Badge>
                  }
                />
                <InfoRowDialog
                  label="Địa điểm dự kiến:"
                  value={
                    eventDetailData.diaDiemToChucDaXep ||
                    'Chưa có thông tin phòng cụ thể'
                  }
                />
                <InfoRowDialog
                  label="Người chủ trì:"
                  value={
                    eventDetailData.nguoiChuTri?.hoTen ||
                    eventDetailData.tenChuTriNgoai ||
                    'Chưa có'
                  }
                />
                {eventDetailData.tenChuTriNgoai && (
                  <InfoRowDialog
                    label="ĐV chủ trì ngoài:"
                    value={eventDetailData.donViChuTriNgoai || 'Không rõ'}
                  />
                )}
                <InfoRowDialog
                  label="Số lượng dự kiến:"
                  value={`${
                    eventDetailData.slThamDuDK || 'Không giới hạn'
                  } người`}
                />
                <InfoRowDialog
                  label="Công khai nội bộ:"
                  value={eventDetailData.isCongKhaiNoiBo ? 'Có' : 'Không'}
                />
                <InfoRowDialog
                  label="Người tạo yêu cầu:"
                  value={`${eventDetailData.nguoiTao.hoTen} (${eventDetailData.nguoiTao.email})`}
                />
                <InfoRowDialog
                  label="Ngày tạo yêu cầu:"
                  value={format(
                    parseISO(eventDetailData.ngayTaoSK),
                    'HH:mm dd/MM/yyyy',
                    { locale: vi }
                  )}
                />

                {eventDetailData.donViThamGia &&
                  eventDetailData.donViThamGia.length > 0 && (
                    <div className="pt-1">
                      <Label className="font-semibold text-muted-foreground">
                        Đơn vị được chỉ định tham gia:
                      </Label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {eventDetailData.donViThamGia.map((dv) => (
                          <Badge
                            key={dv.donViID}
                            variant="secondary"
                            className="font-normal"
                          >
                            {dv.tenDonVi}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                {eventDetailData.khachMoiNgoaiGhiChu && (
                  <InfoRowDialog
                    label="Ghi chú khách mời ngoài:"
                    value={
                      <div className="whitespace-pre-line">
                        {eventDetailData.khachMoiNgoaiGhiChu}
                      </div>
                    }
                  />
                )}
                <div className="pt-1">
                  <Label className="font-semibold text-muted-foreground">
                    Mô tả chi tiết sự kiện:
                  </Label>
                  <div className="mt-1 p-3 border rounded-md bg-muted/20 dark:bg-slate-800/50 whitespace-pre-line prose-sm dark:prose-invert max-w-none">
                    {eventDetailData.moTaChiTiet || 'Không có mô tả chi tiết.'}
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Không tải được thông tin chi tiết sự kiện.
            </div>
          )}
          <DialogFooter className="pt-4 sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
            {selectedEventForAction &&
              !isLoadingDetail &&
              eventDetailData?.trangThaiSK.maTrangThai ===
                MaTrangThaiSK.CHO_DUYET_BGH && (
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      openRejectModal(selectedEventForAction);
                    }}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Từ chối
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleConfirmApprove(selectedEventForAction);
                    }}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Duyệt sự kiện
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      openRevisionRequestModal(eventDetailData);
                    }}
                    disabled={sendRevisionRequestMutation.isPending}
                  >
                    Yêu cầu chỉnh sửa
                  </Button>
                </div>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          if (!open) setSelectedEventForAction(null);
          setShowRejectDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Từ chối sự kiện: {selectedEventForAction?.tenSK}
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối. Thông tin này sẽ được gửi đến người
              tạo sự kiện.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejectReason" className="text-destructive">
              Lý do từ chối <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nêu rõ lý do..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedEventForAction(null);
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Xác nhận Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EventsApprove;
