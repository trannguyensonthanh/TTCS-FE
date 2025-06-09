import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useEventCancelRequests,
  useEventCancelRequestDetail, // Hook này sẽ fetch chi tiết YeuCauHuySK (bao gồm cả chi tiết SuKien nếu cần)
  useApproveEventCancelRequest,
  useRejectEventCancelRequest,
} from '@/hooks/queries/eventCancelRequestQueries';

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum'; // Import hằng số này
import MaTrangThaiYeuCauHuySK from '@/enums/MaTrangThaiYeuCauHuySK.enum'; // Import hằng số này

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  CalendarClock,
  History,
  ListChecks,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageSquareWarning,
  ThumbsUp,
  ThumbsDown,
  Info,
  User,
  Building,
  Calendar as CalendarIcon,
  MoreHorizontal,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

import { motion } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { Label } from '@/components/ui/label';
import { formatDateRangeForDisplay } from '@/utils/formatDate';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GetYeuCauHuySKParams,
  YeuCauHuySKDetailResponse,
  YeuCauHuySKListItemResponse,
} from '@/services/eventCancelRequest.service';
import InfoRowDialog from '@/components/dialog/InfoRowDialog';

// --- Helper Functions ---
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

const getStatusBadgeForYeuCauHuySK = (
  maTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai)
    return (
      <Badge variant="outline" className="text-xs">
        Chưa rõ
      </Badge>
    );
  switch (maTrangThai) {
    case MaTrangThaiYeuCauHuySK.CHO_DUYET_HUY_BGH:
      return (
        <Badge variant="destructive" className="text-xs">
          Chờ BGH duyệt hủy
        </Badge>
      );
    case MaTrangThaiYeuCauHuySK.DA_DUYET_HUY:
      return (
        <Badge variant="secondary" className="text-xs">
          BGH đã duyệt hủy
        </Badge>
      );
    case MaTrangThaiYeuCauHuySK.TU_CHOI_HUY:
      return (
        <Badge variant="destructive" className="text-xs">
          BGH từ chối hủy
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          {maTrangThai}
        </Badge>
      );
  }
};

// ---- Component Chính ----
const EventsCancelRequests = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterParams, setFilterParams] = useState<GetYeuCauHuySKParams>({
    page: 1,
    limit: 10,
    sortBy: 'NgayYeuCauHuy',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [activeTab, setActiveTab] = useState(
    hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG) || hasRole(MaVaiTro.ADMIN_HE_THONG)
      ? 'pending_bgh_cancel_approval'
      : 'my_cancel_requests'
  );

  const [selectedRequestForDetail, setSelectedRequestForDetail] =
    useState<YeuCauHuySKDetailResponse | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [requestToProcess, setRequestToProcess] =
    useState<YeuCauHuySKListItemResponse | null>(null);
  const [showRejectCancelDialog, setShowRejectCancelDialog] = useState(false);
  const [rejectCancelReason, setRejectCancelReason] = useState('');

  // --- Data Fetching ---
  const {
    data: paginatedCancelRequests,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchCancelRequests,
  } = useEventCancelRequests(filterParams, { staleTime: 1 * 60 * 1000 });

  const { data: fetchedCancelDetailData, isLoading: isLoadingCancelDetail } =
    useEventCancelRequestDetail(
      requestToProcess?.ycHuySkID || selectedRequestForDetail?.ycHuySkID, // Lấy ID từ một trong hai state
      {
        enabled:
          (!!requestToProcess || !!selectedRequestForDetail) &&
          (showDetailsDialog || showRejectCancelDialog),
        onSuccess: (data) => {
          if (showDetailsDialog) setSelectedRequestForDetail(data);
          // Nếu mở dialog từ chối, cũng có thể cập nhật chi tiết nếu cần
        },
      }
    );

  // --- Mutations ---
  const approveCancelMutation = useApproveEventCancelRequest({
    onSuccess: () => {
      refetchCancelRequests();
      // Không cần đóng dialog ở đây, có thể để người dùng tự đóng hoặc xử lý trong component
    },
  });
  const rejectCancelMutation = useRejectEventCancelRequest({
    onSuccess: () => {
      setShowRejectCancelDialog(false);
      setRejectCancelReason('');
      setRequestToProcess(null);
      refetchCancelRequests();
    },
  });

  const cancelRequests = paginatedCancelRequests?.items || [];
  const totalPages = paginatedCancelRequests?.totalPages || 1;
  const currentPage = paginatedCancelRequests?.currentPage || 1;

  // --- Event Handlers ---
  useEffect(() => {
    const paramsToUpdate: GetYeuCauHuySKParams = {
      ...filterParams,
      searchTerm: debouncedSearchTerm || undefined,
      page: 1,
    };
    if (activeTab === 'pending_bgh_cancel_approval') {
      paramsToUpdate.trangThaiYcHuySkMa =
        MaTrangThaiYeuCauHuySK.CHO_DUYET_HUY_BGH;
    } else if (activeTab === 'my_cancel_requests' && user?.nguoiDungID) {
      paramsToUpdate.nguoiYeuCauID = user.nguoiDungID;
      paramsToUpdate.trangThaiYcHuySkMa = undefined; // Xem tất cả trạng thái của YC mình tạo
    } else {
      paramsToUpdate.trangThaiYcHuySkMa = undefined; // Tab 'all'
    }
    setFilterParams(paramsToUpdate);
  }, [debouncedSearchTerm, activeTab, user?.nguoiDungID]); // Không nên để filterParams ở đây

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDetailsModal = (requestItem: YeuCauHuySKListItemResponse) => {
    // Có thể fetch chi tiết ở đây nếu ListItem chưa đủ thông tin
    // Hoặc để hook useEventCancelRequestDetail tự fetch khi selectedRequestForDetail thay đổi
    setSelectedRequestForDetail(requestItem as YeuCauHuySKDetailResponse); // Ép kiểu tạm thời
    setShowDetailsDialog(true);
  };

  const openRejectCancelModal = (requestItem: YeuCauHuySKListItemResponse) => {
    setRequestToProcess(requestItem);
    setRejectCancelReason('');
    setShowRejectCancelDialog(true);
  };

  const handleConfirmApproveCancel = (
    requestItem: YeuCauHuySKListItemResponse
  ) => {
    toast.warning(
      `Bạn có chắc chắn muốn DUYỆT YÊU CẦU HỦY cho sự kiện "${requestItem.suKien.tenSK}" không? Sự kiện này sẽ được chuyển sang trạng thái ĐÃ HỦY.`,
      {
        action: {
          label: 'Xác nhận Duyệt Hủy',
          onClick: () =>
            approveCancelMutation.mutate({
              id: requestItem.ycHuySkID,
              payload: {},
            }),
        },
        cancel: { label: 'Không', onClick: () => {} },
      }
    );
  };

  const handleConfirmRejectCancel = () => {
    if (!requestToProcess || !rejectCancelReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối yêu cầu hủy.');
      return;
    }
    rejectCancelMutation.mutate({
      id: requestToProcess.ycHuySkID,
      payload: { lyDoTuChoiHuyBGH: rejectCancelReason },
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Logic cập nhật filterParams đã được chuyển vào useEffect
  };

  // --- Quyền ---
  // Quyền xem trang này: BGH, Admin, hoặc CBTC (để xem YC của mình)
  const canViewPage =
    hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG) ||
    hasRole(MaVaiTro.ADMIN_HE_THONG) ||
    hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN);
  const canProcessCancelRequests =
    hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG) || hasRole(MaVaiTro.ADMIN_HE_THONG);

  if (!isLoading && !canViewPage) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldCheck className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-muted-foreground mb-6">
            Bạn không có quyền xem danh sách yêu cầu hủy sự kiện.
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </DashboardLayout>
    );
  }

  // --- JSX Render Function for Table ---
  const renderCancelRequestsTable = (
    requests: YeuCauHuySKListItemResponse[]
  ) => (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="w-[30%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Sự kiện được yêu cầu hủy
            </TableHead>
            <TableHead className="w-[20%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Người Yêu Cầu Hủy
            </TableHead>
            <TableHead className="w-[15%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Đơn vị YC
            </TableHead>
            <TableHead className="w-[15%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Ngày Yêu Cầu
            </TableHead>
            <TableHead className="text-center w-[10%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Trạng thái YC
            </TableHead>
            <TableHead className="text-right w-[10%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests?.map((req) => (
            <TableRow
              key={req.ycHuySkID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-medium py-3 px-4">
                <Link
                  to={`/events/${req.suKien.suKienID}`}
                  className="hover:underline text-primary dark:text-ptit-red group"
                >
                  {req.suKien.tenSK}
                  <ExternalLink className="inline-block ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Sự kiện bắt đầu:{' '}
                  {format(parseISO(req.suKien.tgBatDauDK), 'dd/MM/yy HH:mm')}
                </div>
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                {req.nguoiYeuCau.hoTen}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                {req?.donViYeuCau?.tenDonVi}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                {format(parseISO(req.ngayYeuCauHuy), 'dd/MM/yyyy HH:mm', {
                  locale: vi,
                })}
              </TableCell>
              <TableCell className="text-center py-3 px-4">
                {getStatusBadgeForYeuCauHuySK(
                  req.trangThaiYeuCauHuySK.maTrangThai
                )}
              </TableCell>
              <TableCell className="text-right py-3 px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openDetailsModal(req)}>
                      <FileText className="mr-2 h-4 w-4" /> Xem Chi Tiết YC Hủy
                    </DropdownMenuItem>
                    {canProcessCancelRequests &&
                      req.trangThaiYeuCauHuySK.maTrangThai ===
                        MaTrangThaiYeuCauHuySK.CHO_DUYET_HUY_BGH && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleConfirmApproveCancel(req)}
                            disabled={
                              approveCancelMutation.isPending &&
                              approveCancelMutation.variables?.id ===
                                req.ycHuySkID
                            }
                            className="text-green-600 focus:bg-green-100 focus:text-green-700"
                          >
                            {approveCancelMutation.isPending &&
                            approveCancelMutation.variables?.id ===
                              req.ycHuySkID ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Duyệt Hủy Sự Kiện
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openRejectCancelModal(req)}
                            disabled={
                              rejectCancelMutation.isPending &&
                              rejectCancelMutation.variables?.id ===
                                req.ycHuySkID
                            }
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            {rejectCancelMutation.isPending &&
                            rejectCancelMutation.variables?.id ===
                              req.ycHuySkID ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Từ Chối Hủy
                          </DropdownMenuItem>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // ----- RETURN JSX CHÍNH CỦA COMPONENT -----
  return (
    <DashboardLayout pageTitle="Quản Lý Yêu Cầu Hủy Sự Kiện">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="space-y-6"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <TabsList className="bg-card border dark:border-slate-800 p-1 rounded-lg shadow-sm">
              <TabsTrigger value="all" className="px-4 py-1.5 text-sm">
                Tất cả YC Hủy
              </TabsTrigger>
              {canProcessCancelRequests && (
                <TabsTrigger
                  value="pending_bgh_cancel_approval"
                  className="px-4 py-1.5 text-sm"
                >
                  Chờ BGH Duyệt Hủy
                </TabsTrigger>
              )}
              {hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) &&
                !canProcessCancelRequests && (
                  <TabsTrigger
                    value="my_cancel_requests"
                    className="px-4 py-1.5 text-sm"
                  >
                    Yêu cầu Hủy Của Tôi
                  </TabsTrigger>
                )}
            </TabsList>
            <div className="relative w-full sm:w-auto sm:max-w-sm mt-2 sm:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo tên sự kiện, người YC..."
                className="pl-10 h-10 rounded-md shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value={activeTab}>
            {(isLoading || isFetching) &&
            !paginatedCancelRequests?.items?.length ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground text-lg">
                  Đang tải dữ liệu...
                </span>
              </div>
            ) : !isLoading &&
              (!paginatedCancelRequests ||
                paginatedCancelRequests?.items?.length === 0) ? (
              <Card className="shadow-lg border-dashed">
                <CardContent className="py-16 text-center">
                  <CalendarClock className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-xl font-semibold text-muted-foreground">
                    Không có yêu cầu hủy sự kiện nào.
                  </p>
                </CardContent>
              </Card>
            ) : (
              renderCancelRequestsTable(paginatedCancelRequests!.items)
            )}

            {paginatedCancelRequests && totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading || isFetching}
                className="mt-8"
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Dialog Chi Tiết Yêu Cầu Hủy Sự Kiện */}
      <Dialog
        open={showDetailsDialog && !!selectedRequestForDetail}
        onOpenChange={(open) => {
          if (!open) setSelectedRequestForDetail(null);
          setShowDetailsDialog(open);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Chi Tiết Yêu Cầu Hủy Sự Kiện
            </DialogTitle>
            {isLoadingCancelDetail && (
              <div className="py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            {selectedRequestForDetail && !isLoadingCancelDetail && (
              <DialogDescription>
                Sự kiện:{' '}
                <span className="font-semibold text-primary">
                  {selectedRequestForDetail.suKien.tenSK}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedRequestForDetail && !isLoadingCancelDetail ? (
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="space-y-3 py-4 pr-4 text-sm">
                <InfoRowDialog
                  label="Người yêu cầu hủy:"
                  value={`${selectedRequestForDetail?.nguoiYeuCau?.hoTen} (${selectedRequestForDetail?.donViYeuCau?.tenDonVi})`}
                />
                <InfoRowDialog
                  label="Ngày yêu cầu hủy:"
                  value={formatDate(selectedRequestForDetail.ngayYeuCauHuy)}
                />
                <InfoRowDialog
                  label="Trạng thái yêu cầu:"
                  value={getStatusBadgeForYeuCauHuySK(
                    selectedRequestForDetail.trangThaiYeuCauHuySK.maTrangThai
                  )}
                />
                <div className="pt-1">
                  <Label className="font-semibold text-muted-foreground">
                    Lý do yêu cầu hủy:
                  </Label>
                  <div className="mt-1 p-3 border rounded-md bg-muted/20 dark:bg-slate-800/50 whitespace-pre-line prose-sm dark:prose-invert max-w-none">
                    {selectedRequestForDetail.lyDoHuy}
                  </div>
                </div>
                {selectedRequestForDetail.trangThaiYeuCauHuySK.maTrangThai ===
                  MaTrangThaiYeuCauHuySK.TU_CHOI_HUY &&
                  selectedRequestForDetail.lyDoTuChoiHuyBGH && (
                    <div className="pt-1">
                      <Label className="font-semibold text-destructive">
                        Lý do BGH từ chối hủy:
                      </Label>
                      <div className="mt-1 p-3 border border-destructive rounded-md bg-destructive/5 dark:bg-destructive/10 whitespace-pre-line prose-sm dark:prose-invert max-w-none text-destructive">
                        {selectedRequestForDetail.lyDoTuChoiHuyBGH}
                      </div>
                    </div>
                  )}
                {selectedRequestForDetail.nguoiDuyetBGH && (
                  <InfoRowDialog
                    label="Người xử lý (BGH):"
                    value={`${
                      selectedRequestForDetail.nguoiDuyetBGH.hoTen
                    } (vào ${
                      selectedRequestForDetail.ngayDuyetBGH
                        ? formatDate(selectedRequestForDetail.ngayDuyetBGH)
                        : 'N/A'
                    })`}
                  />
                )}
                <Separator className="my-3" />
                <p className="text-xs text-muted-foreground">
                  Thông tin sự kiện gốc:
                </p>
                <InfoRowDialog
                  label="Tên sự kiện:"
                  value={selectedRequestForDetail.suKien.tenSK}
                />
                <InfoRowDialog
                  label="Thời gian dự kiến:"
                  value={formatDateRangeForDisplay(
                    selectedRequestForDetail.suKien.tgBatDauDK,
                    undefined
                  )}
                />
                {/* Giả sử suKien trong YC Hủy chỉ có tgBatDauDK, hoặc bạn có thể fetch chi tiết SuKien nếu cần nhiều hơn */}
              </div>
            </ScrollArea>
          ) : (
            !isLoadingCancelDetail && (
              <div className="py-10 text-center text-muted-foreground">
                Không tải được chi tiết yêu cầu hủy.
              </div>
            )
          )}
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
            {/* Các nút hành động cho BGH nếu đang xem chi tiết yêu cầu chờ duyệt */}
            {canProcessCancelRequests &&
              selectedRequestForDetail?.trangThaiYeuCauHuySK.maTrangThai ===
                MaTrangThaiYeuCauHuySK.CHO_DUYET_HUY_BGH && (
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      openRejectCancelModal(
                        selectedRequestForDetail as YeuCauHuySKListItemResponse
                      );
                    }}
                    disabled={rejectCancelMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Từ chối Hủy
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleConfirmApproveCancel(
                        selectedRequestForDetail as YeuCauHuySKListItemResponse
                      );
                    }}
                    disabled={approveCancelMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Duyệt Hủy
                  </Button>
                </div>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Từ Chối Yêu Cầu Hủy (Cho BGH) */}
      <Dialog
        open={
          showRejectCancelDialog &&
          canProcessCancelRequests &&
          !!requestToProcess
        }
        onOpenChange={(open) => {
          if (!open) setRequestToProcess(null);
          setShowRejectCancelDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Từ chối Yêu cầu Hủy Sự kiện: {requestToProcess?.suKien.tenSK}
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối. Thông tin này sẽ được gửi đến người
              tạo yêu cầu hủy.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejectCancelReason" className="text-destructive">
              Lý do từ chối <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejectCancelReason"
              value={rejectCancelReason}
              onChange={(e) => setRejectCancelReason(e.target.value)}
              placeholder="Nêu rõ lý do từ chối yêu cầu hủy này..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectCancelDialog(false);
                setRequestToProcess(null);
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejectCancel}
              disabled={
                !rejectCancelReason.trim() || rejectCancelMutation.isPending
              }
            >
              {rejectCancelMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Xác nhận Từ Chối Yêu Cầu Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EventsCancelRequests;
