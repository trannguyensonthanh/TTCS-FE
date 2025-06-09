/* eslint-disable @typescript-eslint/no-explicit-any */
// Giả sử đường dẫn file là: src/pages/Facilities/RoomRequests.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, formatISO, isValid } from 'date-fns'; // Bỏ các hàm date-fns không dùng trực tiếp ở đây nữa
import { vi } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
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
import { Textarea } from '@/components/ui/textarea';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { FormDescription } from '@/components/ui/form'; // Giữ lại nếu cần
import { toast } from '@/components/ui/sonner';

import {
  useRoomRequests,
  useRoomRequestDetail,
  useProcessRoomRequestDetailItem,
  useCancelRoomRequestByUser,
} from '@/hooks/queries/roomRequestQueries';
import { EVENT_QUERY_KEYS } from '@/hooks/queries/eventQueries'; // Chỉ cần EVENT_QUERY_KEYS
import {
  useLoaiPhongList, // Giữ lại nếu dùng cho modal xử lý
  usePhongListForSelect,
} from '@/hooks/queries/danhMucQueries';

import MaVaiTro from '@/enums/MaVaiTro.enum';
import MaTrangThaiYeuCauPhong from '@/enums/MaTrangThaiYeuCauPhong.enum';

import { APIError } from '@/services/apiHelper';

import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  PlusCircle,
  Trash2,
  ListChecks,
  ExternalLink,
  Send,
  // Bỏ các icon không dùng đến
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  GetYeuCauMuonPhongParams,
  XuLyYcChiTietPayload,
  YcMuonPhongChiTietResponse,
  YeuCauMuonPhongDetailResponse,
  YeuCauMuonPhongListItemResponse,
} from '@/services/roomRequest.service';
import InfoRowDialog from '@/components/dialog/InfoRowDialog';
import { useSendRevisionRequest } from '@/hooks/queries/notificationQueries';
import { CreateYeuCauChinhSuaThongBaoPayload } from '@/services/notification.service';

// --- Helper Functions ---
const formatDate = (
  // Có thể chuyển vào file utils chung
  dateString?: string | Date,
  customFormat = 'HH:mm dd/MM/yyyy'
): string => {
  if (!dateString) return 'N/A';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return 'Ngày không hợp lệ';
    return format(date, customFormat, { locale: vi });
  } catch (e) {
    console.error('Error formatting date:', dateString, e);
    return 'Ngày không hợp lệ';
  }
};

const getStatusBadgeForYeuCauPhong = (
  maTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai) return <Badge variant="outline">Chưa rõ</Badge>;
  switch (maTrangThai) {
    case MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY:
      return (
        <Badge
          variant="destructive"
          className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
        >
          Chờ xử lý
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCPCT_CHO_DUYET: // Trạng thái chi tiết
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
        >
          Chờ duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_DANG_XU_LY:
      return (
        <Badge
          variant="default"
          className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"
        >
          Đang xử lý
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_DA_XU_LY_MOT_PHAN:
      return (
        <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20">
          Xử lý một phần
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_HOAN_TAT_DUYET:
    case MaTrangThaiYeuCauPhong.YCCPCT_DA_XEP_PHONG:
      return (
        <Badge
          variant="secondary"
          className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
        >
          Hoàn tất/Đã xếp
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_TU_CHOI_TOAN_BO:
    case MaTrangThaiYeuCauPhong.YCCPCT_KHONG_PHU_HOP:
      return (
        <Badge
          variant="destructive"
          className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
        >
          Bị từ chối
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCPCT_DA_HUY:
    case MaTrangThaiYeuCauPhong.YCCP_DA_HUY_BOI_NGUOI_TAO:
      return (
        <Badge
          variant="outline"
          className="border-gray-400 text-gray-500 dark:border-gray-600 dark:text-gray-400"
        >
          Đã hủy
        </Badge>
      );
    default:
      return <Badge variant="outline">{maTrangThai}</Badge>;
  }
};

const formatDateRangeForDisplay = (
  start?: string | Date,
  end?: string | Date
): string => {
  if (!start || !end) return 'N/A';
  try {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;
    if (!isValid(startDate) || !isValid(endDate))
      return 'Thời gian không hợp lệ';

    if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
      return `${format(startDate, 'HH:mm')} - ${format(
        endDate,
        'HH:mm'
      )} ngày ${format(startDate, 'dd/MM/yyyy', { locale: vi })}`;
    }
    return `${format(startDate, 'HH:mm dd/MM/yyyy', { locale: vi })} - ${format(
      endDate,
      'HH:mm dd/MM/yyyy',
      { locale: vi }
    )}`;
  } catch (e) {
    return 'Thời gian không hợp lệ';
  }
};

// ---- Component Chính ----
const RoomRequestsPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRevisionRequestItemDialog, setShowRevisionRequestItemDialog] =
    useState(false);
  const [revisionRequestItemContent, setRevisionRequestItemContent] =
    useState('');
  const [filterParams, setFilterParams] = useState<GetYeuCauMuonPhongParams>({
    page: 1,
    limit: 10,
    sortBy: 'NgayYeuCau',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const sendRevisionRequestItemMutation = useSendRevisionRequest({
    onSuccess: () => {
      setShowRevisionRequestItemDialog(false);
      setRevisionRequestItemContent('');
    },
  });

  const openRevisionRequestItemModal = (
    itemDetail: YcMuonPhongChiTietResponse
  ) => {
    setSelectedRequestDetailItem(itemDetail);
    setRevisionRequestItemContent('');
    setShowRevisionRequestItemDialog(true);
    setIsDetailModalOpen(false);
    setIsProcessItemModalOpen(false);
  };

  const handleSendRevisionRequestItem = () => {
    if (
      !selectedRequestDetailItem ||
      !revisionRequestItemContent.trim() ||
      !requestDetailDataForModal
    ) {
      toast.error('Vui lòng nhập nội dung yêu cầu chỉnh sửa.');
      return;
    }

    const payload: CreateYeuCauChinhSuaThongBaoPayload = {
      loaiThucThe: 'YC_MUON_PHONG_CHI_TIET',
      idThucThe: selectedRequestDetailItem.ycMuonPhongCtID,
      nguoiNhanID: requestDetailDataForModal.nguoiYeuCau.nguoiDungID, // Gửi cho người tạo yêu cầu phòng
      noiDungGhiChu: revisionRequestItemContent,
    };
    sendRevisionRequestItemMutation.mutate(payload);
  };
  const initialActiveTab = useMemo(() => {
    if (hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG)) {
      return 'pending_csvc';
    }
    if (hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) || hasRole(MaVaiTro.TRUONG_KHOA)) {
      return 'my_requests';
    }
    return 'all';
  }, [hasRole]);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessItemModalOpen, setIsProcessItemModalOpen] = useState(false);

  const [selectedRequestHeader, setSelectedRequestHeader] =
    useState<YeuCauMuonPhongListItemResponse | null>(null);
  const [requestDetailDataForModal, setRequestDetailDataForModal] =
    useState<YeuCauMuonPhongDetailResponse | null>(null);
  const [selectedRequestDetailItem, setSelectedRequestDetailItem] =
    useState<YcMuonPhongChiTietResponse | null>(null);

  const [processingAction, setProcessingAction] = useState<
    'DUYET' | 'TU_CHOI' | null
  >(null);
  const [processingReason, setProcessingReason] = useState('');
  const [phongDuocChonChoChiTiet, setPhongDuocChonChoChiTiet] = useState<
    string | undefined
  >(undefined);
  const [phongSearchTerm, setPhongSearchTerm] = useState('');
  const debouncedPhongSearchTerm = useDebounce(phongSearchTerm, 300);

  // --- Data Fetching Hooks ---
  const {
    data: paginatedRequests,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchRoomRequests,
  } = useRoomRequests(filterParams, {
    staleTime: 1 * 60 * 1000,
  });
  const requests = paginatedRequests?.items || [];
  console.log('Requests:', requests);
  const {
    data: fetchedDetailData,
    isLoading: isLoadingDetail,
    refetch: refetchDetail, // Có thể không cần refetchDetail trực tiếp ở đây nữa
  } = useRoomRequestDetail(selectedRequestHeader?.ycMuonPhongID);

  useEffect(() => {
    if (fetchedDetailData) {
      setRequestDetailDataForModal(fetchedDetailData);
    }
  }, [fetchedDetailData]);

  // dsLoaiPhong vẫn cần cho modal process item
  const { data: dsLoaiPhong, isLoading: isLoadingLoaiPhong } = useLoaiPhongList(
    { limit: 100 },
    {
      enabled: isProcessItemModalOpen && processingAction === 'DUYET',
    }
  );

  const { data: dsPhongTrongTruong, isLoading: isLoadingPhongTrongTruong } =
    usePhongListForSelect(
      {
        limit: 50,
        searchTerm: debouncedPhongSearchTerm || undefined,
        loaiPhongID: selectedRequestDetailItem?.loaiPhongYeuCau?.loaiPhongID,
        sucChuaToiThieu: selectedRequestDetailItem?.sucChuaYc,
        thoiGianMuon: selectedRequestDetailItem?.tgMuonDk
          ? formatISO(parseISO(selectedRequestDetailItem.tgMuonDk))
          : undefined,
        thoiGianTra: selectedRequestDetailItem?.tgTraDk
          ? formatISO(parseISO(selectedRequestDetailItem.tgTraDk))
          : undefined,
        trangThaiPhongMa: 'SAN_SANG',
      },
      {
        enabled:
          isProcessItemModalOpen &&
          processingAction === 'DUYET' &&
          !!selectedRequestDetailItem,
      }
    );
  console.log('Phong trong truong:', dsPhongTrongTruong);
  // --- Mutation Hooks ---
  const commonMutationOptions = {
    onSuccess: () => {
      refetchRoomRequests();
      if (selectedRequestHeader?.ycMuonPhongID) {
        queryClient.invalidateQueries({
          queryKey: ['roomRequestDetail', selectedRequestHeader.ycMuonPhongID],
        });
      }
    },
    onError: (error: APIError) => {
      toast.error('Thao tác thất bại', {
        description: error.body?.message || error.message || 'Có lỗi xảy ra.',
      });
    },
  };

  const processItemMutation = useProcessRoomRequestDetailItem({
    onSuccess: () => {
      commonMutationOptions.onSuccess();
      toast.success('Xử lý hạng mục thành công!');
      setIsProcessItemModalOpen(false);
      setProcessingReason('');
      setPhongDuocChonChoChiTiet(undefined);
      setPhongSearchTerm('');
    },
    onError: commonMutationOptions.onError,
  });

  const cancelRequestMutation = useCancelRoomRequestByUser({
    onSuccess: (data) => {
      commonMutationOptions.onSuccess();
      toast.success('Hủy yêu cầu thành công!');
      if (data.suKien?.suKienID) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
        });
        queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      }
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    },
    onError: commonMutationOptions.onError,
  });

  // --- Form Handling (đã chuyển form tạo mới sang trang riêng) ---

  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      page: 1,
    }));
  }, [debouncedSearchTerm]);

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDetailModal = useCallback(
    (request: YeuCauMuonPhongListItemResponse) => {
      setSelectedRequestHeader(request);
      // setRequestDetailDataForModal(null);
      setIsDetailModalOpen(true);
    },
    []
  );

  const openProcessItemModal = useCallback(
    (itemDetail: YcMuonPhongChiTietResponse, action: 'DUYET' | 'TU_CHOI') => {
      setSelectedRequestDetailItem(itemDetail);
      setProcessingAction(action);
      setProcessingReason(itemDetail.ghiChuCtCSVC || '');
      setPhongDuocChonChoChiTiet(
        itemDetail.phongDuocCap && itemDetail.phongDuocCap.length > 0
          ? itemDetail.phongDuocCap[0].phongID.toString()
          : undefined
      );
      setPhongSearchTerm('');
      setIsProcessItemModalOpen(true);
    },
    []
  );

  const handleSubmitProcessItem = useCallback(() => {
    if (
      !selectedRequestDetailItem ||
      !processingAction ||
      !selectedRequestHeader
    )
      return;
    let payload: XuLyYcChiTietPayload;
    if (processingAction === 'DUYET') {
      if (!phongDuocChonChoChiTiet) {
        toast.error('Vui lòng chọn phòng để xếp.');
        return;
      }
      payload = {
        hanhDong: 'DUYET',
        phongDuocCap: [{ phongID: parseInt(phongDuocChonChoChiTiet, 10) }],
        ghiChuCSVC: processingReason || null,
      };
    } else {
      if (!processingReason.trim()) {
        toast.error('Vui lòng nhập lý do từ chối.');
        return;
      }
      payload = { hanhDong: 'TU_CHOI', ghiChuCSVC: processingReason };
    }
    processItemMutation.mutate({
      ycMuonPhongID: selectedRequestHeader.ycMuonPhongID,
      ycMuonPhongCtID: selectedRequestDetailItem.ycMuonPhongCtID,
      payload,
    });
  }, [
    selectedRequestDetailItem,
    processingAction,
    selectedRequestHeader,
    phongDuocChonChoChiTiet,
    processingReason,
    processItemMutation,
  ]);

  const handleUserCancelRequest = useCallback(
    (ycMuonPhongID: number) => {
      toast.warning(`Bạn có chắc muốn hủy yêu cầu #${ycMuonPhongID}?`, {
        action: {
          label: 'Xác nhận hủy',
          onClick: () => cancelRequestMutation.mutate(ycMuonPhongID),
        },
        cancel: { label: 'Không', onClick: () => {} },
        duration: 10000,
      });
    },
    [cancelRequestMutation]
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams: GetYeuCauMuonPhongParams = {
      page: 1,
      limit: filterParams.limit,
      sortBy: 'NgayYeuCau',
      sortOrder: 'desc',
      searchTerm: debouncedSearchTerm || undefined,
    };
    if (value === 'pending_csvc')
      newParams.trangThaiChungMa = MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY;
    else if (value === 'my_requests' && user?.nguoiDungID)
      newParams.nguoiYeuCauID = user.nguoiDungID;
    setFilterParams(newParams);
  };

  // --- Permissions ---
  const canCreateNewRequest =
    hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) || hasRole(MaVaiTro.ADMIN_HE_THONG);
  const canProcessRequests =
    hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG);

  // --- Loading and Error States ---
  if (isLoading && !requests?.length && !isFetching) {
    return (
      <DashboardLayout pageTitle="Yêu Cầu Mượn Phòng">
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  if (isError && !paginatedRequests?.items?.length) {
    const errorBody = (fetchError as APIError)?.body;
    return (
      <DashboardLayout pageTitle="Lỗi Tải Dữ Liệu">
        <div className="text-red-500 text-center py-10">
          Lỗi:{' '}
          {errorBody?.message ||
            (fetchError as Error)?.message ||
            'Không xác định'}{' '}
          <Button onClick={() => refetchRoomRequests()} className="ml-4">
            Thử lại
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const requestsToDisplay = paginatedRequests?.items || [];
  const totalPages = paginatedRequests?.totalPages || 1;
  const currentPage = paginatedRequests?.currentPage || 1;

  // --- JSX Render ---
  const renderRequestsTable = (
    requestsList: YeuCauMuonPhongListItemResponse[]
  ) => (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="w-[250px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Sự kiện
            </TableHead>
            <TableHead className="min-w-[180px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Người Yêu Cầu
            </TableHead>
            <TableHead className="min-w-[180px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Đơn Vị
            </TableHead>
            <TableHead className="min-w-[140px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Ngày Yêu Cầu
            </TableHead>
            <TableHead className="text-center min-w-[150px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Trạng Thái
            </TableHead>
            <TableHead className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">
              Số phòng YC
            </TableHead>
            <TableHead className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">
              Đã Xếp
            </TableHead>
            <TableHead className="text-right min-w-[120px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requestsList.map((req) => (
            <TableRow
              key={req.ycMuonPhongID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-medium py-3 px-4 align-top">
                <Link
                  to={`/events/${req.suKien.suKienID}`} // Giả sử có route này
                  className="hover:underline text-primary dark:text-ptit-red font-semibold group flex items-start"
                >
                  <span className="flex-1 line-clamp-2">
                    {req.suKien.tenSK}
                  </span>
                  <ExternalLink className="ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(req.suKien.tgBatDauDK)}
                </div>
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                {req.nguoiYeuCau.hoTen}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                {req?.donViYeuCau?.tenDonVi}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                {formatDate(req.ngayYeuCau)}
              </TableCell>
              <TableCell className="text-center py-3 px-4 align-top">
                {getStatusBadgeForYeuCauPhong(req.trangThaiChung.maTrangThai)}
              </TableCell>
              <TableCell className="text-center text-sm py-3 px-4 font-medium align-top">
                {req.soLuongChiTietYeuCau}
              </TableCell>
              <TableCell className="text-center text-sm py-3 px-4 font-medium text-green-600 dark:text-green-400 align-top">
                {req.soLuongChiTietDaXepPhong}
              </TableCell>
              <TableCell className="text-right py-3 px-4 align-top">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailModal(req)}
                  className="mr-2 border-border hover:border-primary hover:text-primary h-8"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> Xem
                </Button>
                {req.nguoiYeuCau.nguoiDungID === user?.nguoiDungID &&
                  req.trangThaiChung.maTrangThai ===
                    MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY &&
                  !cancelRequestMutation.isPending && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      onClick={() => handleUserCancelRequest(req.ycMuonPhongID)}
                      title="Hủy Yêu Cầu"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                {cancelRequestMutation.isPending &&
                  cancelRequestMutation.variables === req.ycMuonPhongID && (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive inline-block ml-2" />
                  )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout
      pageTitle="Quản Lý Yêu Cầu Mượn Phòng"
      headerActions={
        canCreateNewRequest && (
          <Button
            onClick={() => navigate('/facilities/room-requests/new')} // Điều hướng tới trang tạo mới
            className="bg-gradient-to-r from-ptit-blue to-sky-500 hover:from-ptit-blue/90 hover:to-sky-500/90 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Tạo Yêu Cầu Mới
          </Button>
        )
      }
    >
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
                Tất cả Yêu cầu
              </TabsTrigger>
              {canProcessRequests && (
                <TabsTrigger
                  value="pending_csvc"
                  className="px-4 py-1.5 text-sm"
                >
                  Chờ CSVC Xử Lý
                </TabsTrigger>
              )}
              {(hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) ||
                hasRole(MaVaiTro.TRUONG_KHOA)) &&
                !canProcessRequests && ( // Chỉ hiện thị tab này nếu không phải là CSVC/Admin
                  <TabsTrigger
                    value="my_requests"
                    className="px-4 py-1.5 text-sm"
                  >
                    Yêu cầu của tôi/đơn vị
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
            {(isLoading || isFetching) && !requestsToDisplay.length ? (
              <Card className="shadow-lg">
                <CardContent className="py-20 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                </CardContent>
              </Card>
            ) : !isLoading && requestsToDisplay.length === 0 ? (
              <Card className="shadow-lg border-dashed">
                <CardContent className="py-16 text-center">
                  <ListChecks className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-xl font-semibold text-muted-foreground">
                    Không có yêu cầu mượn phòng nào.
                  </p>
                  {canCreateNewRequest && activeTab !== 'pending_csvc' && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Hãy bắt đầu bằng cách{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() =>
                          navigate('/facilities/create-room-request')
                        }
                      >
                        tạo yêu cầu mới
                      </Button>
                      .
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              renderRequestsTable(requestsToDisplay)
            )}
            {totalPages > 1 && (
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

      {/* Dialog Chi Tiết Yêu Cầu */}
      <Dialog
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestHeader(null);
            // setRequestDetailDataForModal(null);
          }
          setIsDetailModalOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col ">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Chi Tiết Yêu Cầu Mượn Phòng
            </DialogTitle>
            {isLoadingDetail && !requestDetailDataForModal && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {requestDetailDataForModal && (
              <DialogDescription>
                Sự kiện:{' '}
                <span className="font-semibold text-primary">
                  {requestDetailDataForModal.suKien.tenSK}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>
          {requestDetailDataForModal && !isLoadingDetail ? (
            <ScrollArea className="flex-grow pr-5 -mr-1 overflow-auto">
              <div className="space-y-6 py-4 pr-1">
                <InfoRowDialog
                  label="Người yêu cầu:"
                  value={`${requestDetailDataForModal?.nguoiYeuCau.hoTen} (${requestDetailDataForModal?.donViYeuCau?.tenDonVi})`}
                />
                <InfoRowDialog
                  label="Ngày yêu cầu:"
                  value={formatDate(requestDetailDataForModal.ngayYeuCau)}
                />
                <InfoRowDialog
                  label="Trạng thái chung:"
                  value={getStatusBadgeForYeuCauPhong(
                    requestDetailDataForModal.trangThaiChung.maTrangThai
                  )}
                />
                {requestDetailDataForModal.ghiChuChungYc && (
                  <InfoRowDialog
                    label="Ghi chú chung:"
                    value={
                      <div className="whitespace-pre-line">
                        {requestDetailDataForModal.ghiChuChungYc}
                      </div>
                    }
                  />
                )}
                <Separator className="my-4" />
                <h4 className="font-semibold text-md mb-2">
                  Các hạng mục yêu cầu chi tiết:
                </h4>
                {requestDetailDataForModal.chiTietYeuCau.map(
                  (detail, index) => (
                    <Card
                      key={detail.ycMuonPhongCtID}
                      className="mb-4 bg-muted/20 dark:bg-slate-800/20 border-border/70"
                    >
                      <CardHeader className="pb-2 pt-3 px-4">
                        <CardTitle className="text-base flex justify-between items-center">
                          <span>
                            Hạng mục #{index + 1}:{' '}
                            {detail.moTaNhomPhong ||
                              `Yêu cầu ${detail.slPhongNhomNay} phòng`}
                          </span>
                          {getStatusBadgeForYeuCauPhong(
                            detail.trangThaiChiTiet.maTrangThai
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 text-sm space-y-1.5">
                        <InfoRowDialog
                          label="Số lượng:"
                          value={`${detail.slPhongNhomNay} phòng`}
                        />
                        {detail.loaiPhongYeuCau && (
                          <InfoRowDialog
                            label="Loại phòng YC:"
                            value={detail.loaiPhongYeuCau.tenLoaiPhong}
                          />
                        )}
                        {detail.sucChuaYc && (
                          <InfoRowDialog
                            label="Sức chứa YC:"
                            value={`${detail.sucChuaYc} người`}
                          />
                        )}
                        <InfoRowDialog
                          label="Thời gian YC:"
                          value={formatDateRangeForDisplay(
                            detail.tgMuonDk,
                            detail.tgTraDk
                          )}
                        />
                        {detail.thietBiThemYc && (
                          <InfoRowDialog
                            label="Thiết bị thêm:"
                            value={detail.thietBiThemYc}
                          />
                        )}
                        {detail.ghiChuCtCSVC && (
                          <InfoRowDialog
                            label="CSVC Ghi chú:"
                            value={
                              <span className="text-amber-600 dark:text-amber-400 italic">
                                {detail.ghiChuCtCSVC}
                              </span>
                            }
                          />
                        )}
                        {detail.phongDuocCap &&
                          detail.phongDuocCap.length > 0 && (
                            <div className="pt-2">
                              <p className="font-medium text-green-600 dark:text-green-400">
                                Phòng được xếp:
                              </p>
                              {detail.phongDuocCap.map((p) => (
                                <div
                                  key={p.datPhongID}
                                  className="ml-4 text-xs"
                                >
                                  - {p.tenPhong} ({p.maPhong})
                                </div>
                              ))}
                            </div>
                          )}
                      </CardContent>
                      {canProcessRequests &&
                        detail.trangThaiChiTiet.maTrangThai ===
                          MaTrangThaiYeuCauPhong.YCCPCT_CHO_DUYET && (
                          <CardFooter className="px-4 py-3 border-t dark:border-slate-700 flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                openProcessItemModal(detail, 'TU_CHOI')
                              }
                              disabled={processItemMutation.isPending}
                              className="h-9"
                            >
                              <XCircle className="mr-1.5 h-4 w-4" /> Từ chối
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                openProcessItemModal(detail, 'DUYET')
                              }
                              disabled={processItemMutation.isPending}
                              className="h-9"
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" /> Duyệt &
                              Xếp phòng
                            </Button>
                            <Button
                              variant="outline"
                              className="mr-auto"
                              onClick={() =>
                                openRevisionRequestItemModal(detail)
                              }
                              disabled={processItemMutation.isPending}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Yêu cầu chỉnh sửa
                            </Button>
                          </CardFooter>
                        )}
                    </Card>
                  )
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              {isLoadingDetail && !requestDetailDataForModal
                ? 'Đang tải chi tiết...'
                : 'Không có dữ liệu chi tiết.'}
            </div>
          )}
          <DialogFooter className="pt-4 mt-auto shrink-0">
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xử lý Hạng mục Yêu cầu */}
      <Dialog
        open={isProcessItemModalOpen && canProcessRequests}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestDetailItem(null);
            setPhongSearchTerm('');
          }
          setIsProcessItemModalOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Xử lý hạng mục:{' '}
              {selectedRequestDetailItem?.moTaNhomPhong ||
                `YC ${selectedRequestDetailItem?.slPhongNhomNay} phòng`}
            </DialogTitle>
            <DialogDescription>
              Sự kiện: {requestDetailDataForModal?.suKien.tenSK} <br />
              YC:{' '}
              {formatDateRangeForDisplay(
                selectedRequestDetailItem?.tgMuonDk,
                selectedRequestDetailItem?.tgTraDk
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6 py-4">
            <div className="space-y-4">
              {processingAction === 'DUYET' && (
                <div className="space-y-2">
                  <Label htmlFor="phongDuocChon" className="font-semibold">
                    Chọn phòng để xếp (
                    {selectedRequestDetailItem?.slPhongNhomNay} vị trí)
                  </Label>
                  {/* `dsLoaiPhong` đã được fetch ở trên cho modal này */}
                  <Command className="rounded-lg border shadow-sm bg-card">
                    <CommandInput
                      placeholder="Tìm theo tên/mã phòng..."
                      value={phongSearchTerm}
                      onValueChange={setPhongSearchTerm}
                    />
                    <CommandList>
                      <ScrollArea className="max-h-[200px]">
                        {isLoadingPhongTrongTruong && (
                          <CommandItem disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                            Đang tải DS phòng...
                          </CommandItem>
                        )}
                        <CommandEmpty>
                          {!isLoadingPhongTrongTruong &&
                            'Không tìm thấy phòng nào phù hợp.'}
                        </CommandEmpty>
                        {dsPhongTrongTruong &&
                          dsPhongTrongTruong.length > 0 && (
                            <CommandGroup heading="Phòng khả dụng (gợi ý)">
                              {dsPhongTrongTruong.map((p) => (
                                <CommandItem
                                  key={p.phongID}
                                  value={`${p.tenPhong} ${p.maPhong || ''} ${
                                    p.tenLoaiPhong || ''
                                  } SC${p.sucChua}`}
                                  onSelect={() =>
                                    setPhongDuocChonChoChiTiet(
                                      p.phongID.toString()
                                    )
                                  }
                                  className={cn(
                                    'flex justify-between items-center cursor-pointer',
                                    phongDuocChonChoChiTiet ===
                                      p.phongID.toString() &&
                                      'bg-accent text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground'
                                  )}
                                >
                                  <div>
                                    {p.tenPhong} ({p.maPhong}){' '}
                                    <span className="text-xs text-muted-foreground">
                                      - {p.tenLoaiPhong} - Sức chứa: {p.sucChua}
                                    </span>
                                  </div>
                                  {phongDuocChonChoChiTiet ===
                                    p.phongID.toString() && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                      </ScrollArea>
                    </CommandList>
                  </Command>
                  {/* Lưu ý: Hiện tại chỉ hỗ trợ xếp 1 phòng cho 1 hạng mục yêu cầu.
                  Nếu hạng mục yêu cầu nhiều phòng (slPhongNhomNay {'>'} 1),
                  CSVC sẽ tự phân bổ thêm các phòng tương tự hoặc liên hệ lại. */}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="processingReason" className="font-semibold">
                  {processingAction === 'DUYET'
                    ? 'Ghi chú thêm (nếu có)'
                    : 'Lý do từ chối'}
                  {processingAction === 'TU_CHOI' && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Textarea
                  id="processingReason"
                  value={processingReason}
                  onChange={(e) => setProcessingReason(e.target.value)}
                  className="min-h-[80px]"
                  placeholder={
                    processingAction === 'DUYET'
                      ? 'VD: Phòng có sẵn máy chiếu...'
                      : 'Nêu rõ lý do...'
                  }
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-5 border-t">
            <DialogClose asChild>
              <Button variant="outline">Hủy bỏ</Button>
            </DialogClose>

            <Button
              onClick={handleSubmitProcessItem}
              disabled={
                processItemMutation.isPending ||
                (processingAction === 'TU_CHOI' && !processingReason.trim()) ||
                (processingAction === 'DUYET' && !phongDuocChonChoChiTiet)
              }
              variant={
                processingAction === 'DUYET' ? 'secondary' : 'destructive'
              }
            >
              {processItemMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : processingAction === 'DUYET' ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {processingAction === 'DUYET'
                ? 'Xác nhận Xếp Phòng'
                : 'Xác nhận Từ Chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showRevisionRequestItemDialog && !!selectedRequestDetailItem}
        onOpenChange={(open) => {
          if (!open) setSelectedRequestDetailItem(null);
          setShowRevisionRequestItemDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Gửi Yêu Cầu Chỉnh Sửa Hạng Mục Phòng
            </DialogTitle>
            <DialogDescription>
              Sự kiện:{' '}
              <span className="font-semibold">
                {requestDetailDataForModal?.suKien.tenSK}
              </span>
              <br />
              Hạng mục:{' '}
              <span className="font-semibold">
                {selectedRequestDetailItem?.moTaNhomPhong ||
                  `Yêu cầu ${selectedRequestDetailItem?.slPhongNhomNay} phòng`}
              </span>
              <br />
              Nội dung yêu cầu sẽ được gửi đến người tạo. Hạng mục này sẽ vẫn ở
              trạng thái "Chờ duyệt".
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="revisionRequestItemContent" className="font-medium">
              Nội dung yêu cầu chỉnh sửa{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="revisionRequestItemContent"
              value={revisionRequestItemContent}
              onChange={(e) => setRevisionRequestItemContent(e.target.value)}
              placeholder="Nêu rõ các điểm cần chỉnh sửa cho hạng mục này, ví dụ: số lượng không phù hợp, thời gian cần điều chỉnh, loại phòng không có..."
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRevisionRequestItemDialog(false);
                setSelectedRequestDetailItem(null);
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleSendRevisionRequestItem}
              disabled={
                !revisionRequestItemContent.trim() ||
                sendRevisionRequestItemMutation.isPending
              }
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {sendRevisionRequestItemMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Gửi Yêu Cầu Chỉnh Sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RoomRequestsPage;
