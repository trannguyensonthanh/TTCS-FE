/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Facilities/RoomChangeRequests.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns'; // Bỏ các hàm date-fns không dùng
import { vi } from 'date-fns/locale';
import { useForm, Controller, SubmitHandler } from 'react-hook-form'; // Bỏ useFieldArray nếu không dùng ở đây
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
// Popover và CalendarShadcn không thấy dùng trực tiếp trong file này nữa
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';

import {
  useRoomChangeRequests,
  useRoomChangeRequestDetail,
  useCreateRoomChangeRequest,
  useProcessRoomChangeRequest,
  useCancelRoomChangeRequestByUser,
  useMyActiveBookedRoomsForChangeEvent,
  ROOM_CHANGE_REQUEST_QUERY_KEYS, // Import keys
} from '@/hooks/queries/roomChangeRequestQueries';
import {
  usePhongListForSelect,
  useLoaiPhongList,
} from '@/hooks/queries/danhMucQueries';

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import MaTrangThaiYeuCauDoiPhong from '@/enums/MaTrangThaiYeuCauDoiPhong.enum';

import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  PlusCircle,
  Trash2,
  Shuffle,
  AlertCircle,
  Info,
  ExternalLink, // Thêm ExternalLink
  // Các icon không dùng có thể bỏ: FileText, CalendarClock, History, ListChecks, Building, Edit, ChevronLeft, ChevronRight,
  // MessageSquareWarning, Users as UsersIcon, MapPin, ChevronsUpDown, Clock, MinusCircle, Send
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import roomChangeRequestService, {
  ChiTietDatPhongForSelect,
  CreateYeuCauDoiPhongPayload,
  GetYeuCauDoiPhongParams,
  XuLyYeuCauDoiPhongPayload,
  YeuCauDoiPhongDetailResponse,
  YeuCauDoiPhongListItemResponse,
} from '@/services/roomChangeRequest.service';
import { ROOM_REQUEST_QUERY_KEYS } from '@/hooks/queries/roomRequestQueries';

// --- Helper Functions ---
const formatDate = (
  dateString?: string | Date,
  customFormat = 'dd/MM/yyyy HH:mm'
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

const getStatusBadgeForYeuCauDoiPhong = (
  maTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai)
    return (
      <Badge variant="outline" className="text-xs whitespace-nowrap">
        Chưa rõ
      </Badge>
    );
  switch (maTrangThai) {
    case MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG:
      return (
        <Badge variant="destructive" className="text-xs whitespace-nowrap">
          Chờ duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.DA_DUYET_DOI_PHONG:
      return (
        <Badge variant="secondary" className="text-xs whitespace-nowrap">
          Đã duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.TU_CHOI_DOI_PHONG:
      return (
        <Badge variant="destructive" className="text-xs whitespace-nowrap">
          Bị từ chối
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.DA_HUY_BOI_NGUOI_TAO: // Thêm trạng thái này
      return (
        <Badge
          variant="outline"
          className="text-xs whitespace-nowrap border-gray-400 text-gray-500"
        >
          Đã hủy
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs whitespace-nowrap">
          {maTrangThai}
        </Badge>
      );
  }
};

// --- Zod Schema for Create Change Request Form ---
const createRoomChangeRequestSchema = z.object({
  lyDoDoiPhong: z
    .string()
    .min(10, { message: 'Lý do đổi phòng phải có ít nhất 10 ký tự.' })
    .max(500, 'Tối đa 500 ký tự.'),
  ycPhongMoi_LoaiID: z.string().optional().nullable(),
  ycPhongMoi_SucChua: z.coerce
    .number()
    .int()
    .min(1, 'Sức chứa phải lớn hơn 0')
    .optional()
    .nullable(),
  ycPhongMoi_ThietBi: z
    .string()
    .max(500, 'Tối đa 500 ký tự.')
    .optional()
    .nullable(),
});
type CreateRoomChangeRequestFormValues = z.infer<
  typeof createRoomChangeRequestSchema
>;

// ---- Component Chính ----
const RoomChangeRequestsPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterParams, setFilterParams] = useState<GetYeuCauDoiPhongParams>({
    page: 1,
    limit: 10,
    sortBy: 'NgayYeuCauDoi',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const initialActiveTab = useMemo(() => {
    if (hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG))
      return 'pending_approval';
    if (hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) || hasRole(MaVaiTro.TRUONG_KHOA))
      return 'my_requests';
    return 'all'; // Fallback cho người dùng có thể không có vai trò cụ thể nhưng vẫn xem được
  }, [hasRole]);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  const [selectedRequestForAction, setSelectedRequestForAction] =
    useState<YeuCauDoiPhongListItemResponse | null>(null);
  const [requestDetailDataForModal, setRequestDetailDataForModal] =
    useState<YeuCauDoiPhongDetailResponse | null>(null);

  const [processingActionChange, setProcessingActionChange] = useState<
    'DUYET' | 'TU_CHOI' | null
  >(null);
  const [processingReasonChange, setProcessingReasonChange] = useState('');
  const [phongMoiDuocChon, setPhongMoiDuocChon] = useState<string | undefined>(
    undefined
  );
  const [phongMoiSearchTerm, setPhongMoiSearchTerm] = useState('');
  const debouncedPhongMoiSearchTerm = useDebounce(phongMoiSearchTerm, 300);
  const [selectedBookedRoomForChange, setSelectedBookedRoomForChange] =
    useState<ChiTietDatPhongForSelect | null>(null);

  // --- Data Fetching ---
  const {
    data: paginatedChangeRequests,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchChangeRequests,
  } = useRoomChangeRequests(filterParams, {
    staleTime: 1 * 60 * 1000,
  });

  const {
    data: fetchedChangeDetailData,
    isLoading: isLoadingChangeDetail,
    refetch: refetchChangeDetail,
  } = useRoomChangeRequestDetail(selectedRequestForAction?.ycDoiPhongID);

  useEffect(() => {
    if (fetchedChangeDetailData) {
      setRequestDetailDataForModal(fetchedChangeDetailData);
    }
  }, [fetchedChangeDetailData]);

  const { data: myBookedRooms, isLoading: isLoadingMyBookedRooms } =
    useMyActiveBookedRoomsForChangeEvent(
      { /* nguoiYeuCauID lấy từ user khi gọi API hook */ limit: 100 }, // Giả sử hook tự lấy user ID
      {
        enabled:
          isCreateModalOpen &&
          (hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) ||
            hasRole(MaVaiTro.ADMIN_HE_THONG)),
      }
    );
  const { data: dsLoaiPhongChange, isLoading: isLoadingLoaiPhongChange } =
    useLoaiPhongList(
      { limit: 100, isActive: true },
      {
        enabled:
          isCreateModalOpen ||
          (isProcessModalOpen && processingActionChange === 'DUYET'),
      }
    );
  const {
    data: dsPhongForChangeSelect,
    isLoading: isLoadingPhongForChangeSelect,
  } = usePhongListForSelect(
    {
      limit: 50,
      searchTerm: debouncedPhongMoiSearchTerm || undefined,
      loaiPhongID: requestDetailDataForModal?.ycPhongMoi_LoaiPhong?.loaiPhongID,
      sucChuaToiThieu: requestDetailDataForModal?.ycPhongMoi_SucChua,
      thoiGianMuon: requestDetailDataForModal?.phongHienTai?.tgNhanPhongTT, // Lấy từ phòng hiện tại của YC Đổi
      thoiGianTra: requestDetailDataForModal?.phongHienTai?.tgTraPhongTT, // Lấy từ phòng hiện tại của YC Đổi
      trangThaiPhongMa: 'SAN_SANG',
    },
    {
      enabled:
        isProcessModalOpen &&
        processingActionChange === 'DUYET' &&
        !!requestDetailDataForModal,
    }
  );

  // --- Mutations ---
  const commonMutationOptions = {
    onError: (error: APIError) => {
      toast.error('Thao tác thất bại', {
        description: error.body?.message || error.message || 'Có lỗi xảy ra.',
      });
    },
  };

  const createChangeRequestMutation = useCreateRoomChangeRequest({
    onSuccess: () => {
      toast.success('Yêu cầu đổi phòng đã được gửi!');
      setIsCreateModalOpen(false);
      formCreateChange.reset();
      setSelectedBookedRoomForChange(null);
      refetchChangeRequests();
      if (selectedBookedRoomForChange?.ycMuonPhongCtID) {
        queryClient.invalidateQueries({
          queryKey: ROOM_REQUEST_QUERY_KEYS.detail(
            selectedBookedRoomForChange.ycMuonPhongCtID
          ),
        });
      }
    },
    ...commonMutationOptions,
  });

  const processChangeMutation = useProcessRoomChangeRequest({
    onSuccess: () => {
      toast.success(
        `Yêu cầu đổi phòng đã được ${
          processingActionChange === 'DUYET' ? 'duyệt' : 'từ chối'
        }.`
      );
      setIsProcessModalOpen(false);
      setProcessingReasonChange('');
      setPhongMoiDuocChon(undefined);
      setPhongMoiSearchTerm('');
      refetchChangeRequests(); // Refetch list
      if (requestDetailDataForModal) {
        // Refetch YC mượn phòng gốc để cập nhật trạng thái phòng cũ
        queryClient.invalidateQueries({
          queryKey: ROOM_REQUEST_QUERY_KEYS.detail(
            requestDetailDataForModal.ycMuonPhongCtID
          ),
        });
      }
      if (selectedRequestForAction) {
        // Refetch chi tiết YC đổi phòng hiện tại
        queryClient.invalidateQueries({
          queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(
            selectedRequestForAction.ycDoiPhongID
          ),
        });
      }
      setSelectedRequestForAction(null); // Đóng detail modal nếu đang mở từ đây
      setIsDetailModalOpen(false);
    },
    ...commonMutationOptions,
  });

  const cancelChangeRequestMutation = useCancelRoomChangeRequestByUser({
    onSuccess: () => {
      toast.success('Đã hủy yêu cầu đổi phòng.');
      refetchChangeRequests();
    },
    ...commonMutationOptions,
  });

  const formCreateChange = useForm<CreateRoomChangeRequestFormValues>({
    resolver: zodResolver(createRoomChangeRequestSchema),
    defaultValues: {
      lyDoDoiPhong: '',
      ycPhongMoi_LoaiID: null,
      ycPhongMoi_SucChua: null,
      ycPhongMoi_ThietBi: null,
    },
  });

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

  const openDetailChangeModal = useCallback(
    (request: YeuCauDoiPhongListItemResponse) => {
      setSelectedRequestForAction(request);
      setRequestDetailDataForModal(null);
      setIsDetailModalOpen(true);
    },
    []
  );

  const openProcessChangeModal = useCallback(
    (
      requestItem:
        | YeuCauDoiPhongListItemResponse
        | YeuCauDoiPhongDetailResponse,
      action: 'DUYET' | 'TU_CHOI'
    ) => {
      setSelectedRequestForAction(requestItem); // Lưu lại ListItem để có thể dùng ycMuonPhongID
      // Nếu requestItem chưa phải là detail, fetch detail
      if (!('phongMoiDuocCap' in requestItem) && requestItem.ycDoiPhongID) {
        // Kiểm tra 1 trường chỉ có ở Detail
        queryClient.fetchQuery({
          queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(
            requestItem.ycDoiPhongID
          ),
          queryFn: async () => {
            const detail =
              (await queryClient.getQueryData(
                ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(requestItem.ycDoiPhongID)
              )) ||
              (await roomChangeRequestService.getRoomChangeRequestDetail(
                requestItem.ycDoiPhongID
              ));
            setRequestDetailDataForModal(
              detail as YeuCauDoiPhongDetailResponse
            );
            return detail;
          },
        });
      } else {
        setRequestDetailDataForModal(
          requestItem as YeuCauDoiPhongDetailResponse
        );
      }
      setProcessingActionChange(action);
      setProcessingReasonChange('');
      setPhongMoiDuocChon(undefined);
      setPhongMoiSearchTerm('');
      setIsProcessModalOpen(true);
    },
    [queryClient]
  );

  const onSubmitCreateChangeRequest: SubmitHandler<CreateRoomChangeRequestFormValues> =
    useCallback(
      (data) => {
        if (!selectedBookedRoomForChange) {
          toast.error('Vui lòng chọn phòng hiện tại cần đổi.');
          return;
        }
        const payload: CreateYeuCauDoiPhongPayload = {
          ycMuonPhongCtID: selectedBookedRoomForChange.ycMuonPhongCtID,
          datPhongID_Cu: selectedBookedRoomForChange.datPhongID,
          lyDoDoiPhong: data.lyDoDoiPhong,
          ycPhongMoi_LoaiID: data.ycPhongMoi_LoaiID
            ? parseInt(data.ycPhongMoi_LoaiID)
            : null,
          ycPhongMoi_SucChua: data.ycPhongMoi_SucChua
            ? Number(data.ycPhongMoi_SucChua)
            : null,
          ycPhongMoi_ThietBi: data.ycPhongMoi_ThietBi || null,
        };
        createChangeRequestMutation.mutate(payload);
      },
      [createChangeRequestMutation, selectedBookedRoomForChange]
    );

  const handleSubmitProcessChange = useCallback(() => {
    if (
      !selectedRequestForAction ||
      !processingActionChange ||
      !requestDetailDataForModal
    ) {
      toast.error('Lỗi: Thiếu thông tin yêu cầu để xử lý.');
      return;
    }
    let payload: XuLyYeuCauDoiPhongPayload;
    if (processingActionChange === 'DUYET') {
      if (!phongMoiDuocChon) {
        toast.error('Vui lòng chọn phòng mới để cấp.');
        return;
      }
      payload = {
        hanhDong: 'DUYET',
        phongMoiID: parseInt(phongMoiDuocChon),
        ghiChuCSVC: processingReasonChange || null,
      };
    } else {
      // TU_CHOI
      if (!processingReasonChange.trim()) {
        toast.error('Vui lòng nhập lý do từ chối.');
        return;
      }
      payload = {
        hanhDong: 'TU_CHOI',
        lyDoTuChoiDoiCSVC: processingReasonChange,
      };
    }
    processChangeMutation.mutate({
      id: selectedRequestForAction.ycDoiPhongID,
      payload,
    });
  }, [
    selectedRequestForAction,
    processingActionChange,
    requestDetailDataForModal,
    phongMoiDuocChon,
    processingReasonChange,
    processChangeMutation,
  ]);

  const handleUserCancelChangeRequest = useCallback(
    (ycDoiPhongID: number) => {
      toast('Xác nhận hủy yêu cầu', {
        description: 'Bạn có chắc chắn muốn hủy yêu cầu đổi phòng này không?',
        action: {
          label: 'Xác nhận',
          onClick: () => cancelChangeRequestMutation.mutate(ycDoiPhongID),
        },
        cancel: { label: 'Không', onClick: () => {} },
        duration: 10000,
      });
    },
    [cancelChangeRequestMutation]
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newParams: GetYeuCauDoiPhongParams = {
      page: 1,
      limit: filterParams.limit,
      sortBy: 'NgayYeuCau',
      sortOrder: 'desc',
      searchTerm: debouncedSearchTerm || undefined, // Giữ lại searchTerm
      trangThaiYcDoiPhongMa: undefined,
      nguoiYeuCauID: undefined, // Reset các filter theo tab
    };
    if (value === 'pending_approval')
      newParams.trangThaiYcDoiPhongMa =
        MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG;
    else if (value === 'my_requests' && user?.nguoiDungID)
      newParams.nguoiYeuCauID = user.nguoiDungID;
    setFilterParams(newParams);
  };

  const canCreateChangeRequest = useMemo(
    () =>
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) || hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );
  const canProcessChangeRequests = useMemo(
    () => hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );

  const requestsToDisplay = paginatedChangeRequests?.items || [];
  const totalPages = paginatedChangeRequests?.totalPages || 1;
  const currentPage = paginatedChangeRequests?.currentPage || 1;

  const renderChangeRequestsTable = (
    requests: YeuCauDoiPhongListItemResponse[]
  ) => (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="w-[220px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Sự kiện
            </TableHead>
            <TableHead className="w-[160px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Phòng Hiện Tại
            </TableHead>
            <TableHead className="w-[180px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Người Yêu Cầu
            </TableHead>
            <TableHead className="w-[150px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Ngày YC Đổi
            </TableHead>
            <TableHead className="text-center w-[140px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Trạng Thái
            </TableHead>
            <TableHead className="text-right min-w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow
              key={req.ycDoiPhongID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="py-3 px-4 align-top">
                <Link
                  to={`/events/${req.suKien.suKienID}`}
                  className="font-medium hover:underline text-primary dark:text-ptit-red group text-sm line-clamp-2"
                  title={req.suKien.tenSK}
                >
                  {req.suKien.tenSK}{' '}
                  <ExternalLink className="inline-block ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                {/* <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(req.suKien., 'dd/MM')} -{' '}
                  {formatDate(req.suKien.tgKetThucDK_SuKienGoc, 'dd/MM/yy')}
                </div> */}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 align-top">
                {req.phongHienTai.tenPhong}{' '}
                <span className="text-xs text-muted-foreground">
                  ({req.phongHienTai.maPhong})
                </span>
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                {req.nguoiYeuCau.hoTen}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                {formatDate(req.ngayYeuCauDoi)}
              </TableCell>
              <TableCell className="text-center py-3 px-4 align-top">
                {getStatusBadgeForYeuCauDoiPhong(
                  req.trangThaiYeuCauDoiPhong.maTrangThai
                )}
              </TableCell>
              <TableCell className="text-right py-3 px-4 align-top">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailChangeModal(req)}
                  className="mr-2 border-border hover:border-primary hover:text-primary h-8 text-xs"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> Xem
                </Button>
                {req.nguoiYeuCau.nguoiDungID === user?.nguoiDungID &&
                  req.trangThaiYeuCauDoiPhong.maTrangThai ===
                    MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG &&
                  !cancelChangeRequestMutation.isPending && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      onClick={() =>
                        handleUserCancelChangeRequest(req.ycDoiPhongID)
                      }
                      title="Hủy Yêu Cầu Đổi Phòng"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                {cancelChangeRequestMutation.isPending &&
                  cancelChangeRequestMutation.variables ===
                    req.ycDoiPhongID && (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive inline-block ml-2" />
                  )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  function formatDateRangeForDisplay(
    tgNhanPhongTT?: string | Date,
    tgTraPhongTT?: string | Date
  ): React.ReactNode {
    if (!tgNhanPhongTT && !tgTraPhongTT) return 'N/A';
    const start = formatDate(tgNhanPhongTT, 'dd/MM/yyyy HH:mm');
    const end = formatDate(tgTraPhongTT, 'dd/MM/yyyy HH:mm');
    if (start === 'N/A' && end === 'N/A') return 'N/A';
    if (start === 'N/A') return `Đến ${end}`;
    if (end === 'N/A') return `Từ ${start}`;
    return (
      <>
        {start} <span className="mx-1">-</span> {end}
      </>
    );
  }

  // ----- RETURN JSX CHÍNH CỦA COMPONENT -----
  return (
    <DashboardLayout
      pageTitle="Quản Lý Yêu Cầu Đổi Phòng"
      headerActions={
        canCreateChangeRequest && (
          <Button
            onClick={() => {
              formCreateChange.reset({
                lyDoDoiPhong: '',
                ycPhongMoi_LoaiID: null,
                ycPhongMoi_SucChua: null,
                ycPhongMoi_ThietBi: null,
              });
              setSelectedBookedRoomForChange(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <Shuffle className="mr-2 h-4 w-4" /> Tạo Yêu Cầu Đổi Phòng
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
              <TabsTrigger
                value="all"
                className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
              >
                Tất cả YC Đổi
              </TabsTrigger>
              {canProcessChangeRequests && (
                <TabsTrigger
                  value="pending_approval"
                  className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
                >
                  Chờ Duyệt
                </TabsTrigger>
              )}
              {(hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) ||
                hasRole(MaVaiTro.TRUONG_KHOA)) &&
                !canProcessChangeRequests && (
                  <TabsTrigger
                    value="my_requests"
                    className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
                  >
                    YC Đổi của tôi/đơn vị
                  </TabsTrigger>
                )}
            </TabsList>
            <div className="relative w-full sm:w-auto sm:max-w-sm mt-2 sm:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo tên sự kiện, phòng..."
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
                  <Shuffle className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-xl font-semibold text-muted-foreground">
                    Không có yêu cầu đổi phòng nào.
                  </p>
                  {canCreateChangeRequest &&
                    activeTab !== 'pending_approval' && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Hãy bắt đầu bằng cách{' '}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() => {
                            formCreateChange.reset();
                            setSelectedBookedRoomForChange(null);
                            setIsCreateModalOpen(true);
                          }}
                        >
                          tạo yêu cầu mới
                        </Button>
                        .
                      </p>
                    )}
                </CardContent>
              </Card>
            ) : (
              renderChangeRequestsTable(requestsToDisplay)
            )}
            {paginatedChangeRequests && totalPages > 1 && (
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

      {/* Dialog Tạo Yêu Cầu Đổi Phòng Mới */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg md:max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg">Tạo Yêu Cầu Đổi Phòng</DialogTitle>
            <DialogDescription>
              Chọn phòng muốn đổi và điền thông tin yêu cầu mới.
            </DialogDescription>
          </DialogHeader>
          <Form {...formCreateChange}>
            <form
              onSubmit={formCreateChange.handleSubmit(
                onSubmitCreateChangeRequest
              )}
              className="flex-grow overflow-hidden flex flex-col"
            >
              <ScrollArea className="flex-grow pr-5 -mr-1">
                <div className="space-y-5 py-2 pr-1">
                  <div className="space-y-2">
                    <Label className="font-semibold">
                      Phòng hiện tại cần đổi{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => {
                        const bookedRoom = myBookedRooms?.find(
                          (r) => r.datPhongID.toString() === value
                        );
                        setSelectedBookedRoomForChange(bookedRoom || null);
                      }}
                      disabled={isLoadingMyBookedRooms}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingMyBookedRooms
                              ? 'Đang tải...'
                              : 'Chọn phòng đã được xếp'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Phòng đã được xếp cho bạn</SelectLabel>
                          {myBookedRooms?.map((br) => (
                            <SelectItem
                              key={br.datPhongID}
                              value={br.datPhongID.toString()}
                            >
                              {br.tenPhong} ({br.maPhong}) - SK:{' '}
                              {br.tenSK.substring(0, 25)}... (
                              {formatDate(br.tgNhanPhongTT, 'dd/MM')})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        {myBookedRooms?.length === 0 &&
                          !isLoadingMyBookedRooms && (
                            <div className="p-2 text-sm text-center text-muted-foreground">
                              Không có phòng nào đang được xếp cho bạn.
                            </div>
                          )}
                      </SelectContent>
                    </Select>
                    {selectedBookedRoomForChange && (
                      <Card className="mt-2 p-3 text-xs bg-muted/50 dark:bg-slate-800/30 border-border/50">
                        <p>
                          <strong>Sự kiện:</strong>{' '}
                          {selectedBookedRoomForChange.tenSK}
                        </p>
                        <p>
                          <strong>Thời gian hiện tại:</strong>{' '}
                          {formatDate(
                            selectedBookedRoomForChange.tgNhanPhongTT
                          )}{' '}
                          -{' '}
                          {formatDate(selectedBookedRoomForChange.tgTraPhongTT)}
                        </p>
                      </Card>
                    )}
                  </div>
                  <FormField
                    control={formCreateChange.control}
                    name="lyDoDoiPhong"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Lý do đổi phòng{' '}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nêu rõ lý do bạn muốn đổi phòng..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator className="my-4 !mt-6 !mb-3" />
                  <p className="font-semibold text-sm text-muted-foreground mb-1">
                    Yêu cầu cho phòng mới (nếu có):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                    <FormField
                      control={formCreateChange.control}
                      name="ycPhongMoi_LoaiID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại phòng mong muốn</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                            disabled={isLoadingLoaiPhongChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isLoadingLoaiPhongChange
                                      ? 'Đang tải...'
                                      : 'Không yêu cầu'
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dsLoaiPhongChange?.map((lp) => (
                                <SelectItem
                                  key={lp.loaiPhongID}
                                  value={lp.loaiPhongID.toString()}
                                >
                                  {lp.tenLoaiPhong}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formCreateChange.control}
                      name="ycPhongMoi_SucChua"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sức chứa tối thiểu</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="VD: 50"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ''
                                    ? null
                                    : Number(e.target.value)
                                )
                              }
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={formCreateChange.control}
                    name="ycPhongMoi_ThietBi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yêu cầu thiết bị thêm</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Liệt kê các thiết bị đặc biệt cần cho phòng mới..."
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
              <DialogFooter className="pt-5 border-t mt-auto shrink-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Đóng
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    !selectedBookedRoomForChange ||
                    createChangeRequestMutation.isPending ||
                    !formCreateChange.formState.isValid
                  }
                >
                  {createChangeRequestMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shuffle className="mr-2 h-4 w-4" />
                  )}{' '}
                  Gửi Yêu Cầu Đổi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Chi Tiết Yêu Cầu Đổi Phòng */}
      <Dialog
        open={isDetailModalOpen && !!selectedRequestForAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestForAction(null);
            setRequestDetailDataForModal(null);
          }
          setIsDetailModalOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl md:max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Chi Tiết Yêu Cầu Đổi Phòng #
              {selectedRequestForAction?.ycDoiPhongID}
            </DialogTitle>
            {isLoadingChangeDetail && !requestDetailDataForModal && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </DialogHeader>
          {requestDetailDataForModal && !isLoadingChangeDetail ? (
            <ScrollArea className="flex-grow pr-5 -mr-1">
              <div className="space-y-3 py-2 pr-1 text-sm">
                <InfoRow
                  label="Sự kiện:"
                  value={requestDetailDataForModal.suKien.tenSK}
                />
                <InfoRow
                  label="Người YC:"
                  value={requestDetailDataForModal.nguoiYeuCau.hoTen}
                />
                {/* <InfoRow
                  label="Đơn vị YC:"
                  value={requestDetailDataForModal.
                  }
                /> */}
                <InfoRow
                  label="Ngày YC đổi:"
                  value={formatDate(requestDetailDataForModal.ngayYeuCauDoi)}
                />
                <InfoRow
                  label="Trạng thái:"
                  value={getStatusBadgeForYeuCauDoiPhong(
                    requestDetailDataForModal.trangThaiYeuCauDoiPhong
                      .maTrangThai
                  )}
                />
                <Separator className="my-3" />
                <InfoRow
                  label="Phòng hiện tại:"
                  value={`${requestDetailDataForModal.phongHienTai.tenPhong} (${requestDetailDataForModal.phongHienTai.maPhong})`}
                />
                <InfoRow
                  label="Thời gian gốc:"
                  value={formatDateRangeForDisplay(
                    requestDetailDataForModal.phongHienTai.tgNhanPhongTT,
                    requestDetailDataForModal.phongHienTai.tgTraPhongTT
                  )}
                />
                <InfoRow
                  label="Lý do đổi phòng:"
                  value={
                    <div className="whitespace-pre-wrap">
                      {requestDetailDataForModal.lyDoDoiPhong}
                    </div>
                  }
                />
                <Separator className="my-3" />
                <h4 className="font-semibold mt-2 mb-1">
                  Yêu cầu cho phòng mới:
                </h4>
                <InfoRow
                  label="Loại phòng YC:"
                  value={
                    requestDetailDataForModal.ycPhongMoi_LoaiPhong
                      ?.tenLoaiPhong || (
                      <span className="italic text-muted-foreground">
                        Không yêu cầu
                      </span>
                    )
                  }
                />
                <InfoRow
                  label="Sức chứa YC:"
                  value={
                    requestDetailDataForModal.ycPhongMoi_SucChua ? (
                      `${requestDetailDataForModal.ycPhongMoi_SucChua} người`
                    ) : (
                      <span className="italic text-muted-foreground">
                        Không yêu cầu
                      </span>
                    )
                  }
                />
                <InfoRow
                  label="Thiết bị thêm YC:"
                  value={
                    requestDetailDataForModal.ycPhongMoi_ThietBi || (
                      <span className="italic text-muted-foreground">
                        Không yêu cầu
                      </span>
                    )
                  }
                />
                {requestDetailDataForModal.trangThaiYeuCauDoiPhong
                  .maTrangThai !==
                  MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG && (
                  <>
                    <Separator className="my-3" />
                    <h4 className="font-semibold mt-2 mb-1">Kết quả xử lý:</h4>
                    {requestDetailDataForModal.phongMoiDuocCap && (
                      <InfoRow
                        label="Phòng mới cấp:"
                        value={`${requestDetailDataForModal.phongMoiDuocCap.tenPhong} (${requestDetailDataForModal.phongMoiDuocCap.maPhong})`}
                        className="text-green-600 dark:text-green-400"
                      />
                    )}
                    {requestDetailDataForModal.nguoiDuyetCSVC && (
                      <InfoRow
                        label="Người duyệt:"
                        value={requestDetailDataForModal.nguoiDuyetCSVC.hoTen}
                      />
                    )}
                    {requestDetailDataForModal.ngayDuyetCSVC && (
                      <InfoRow
                        label="Ngày duyệt:"
                        value={formatDate(
                          requestDetailDataForModal.ngayDuyetCSVC
                        )}
                      />
                    )}
                    {requestDetailDataForModal.lyDoTuChoiDoiCSVC && (
                      <InfoRow
                        label="Lý do từ chối (CSVC):"
                        value={
                          <div className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                            {requestDetailDataForModal.lyDoTuChoiDoiCSVC}
                          </div>
                        }
                      />
                    )}
                    {requestDetailDataForModal.lyDoTuChoiDoiCSVC && (
                      <InfoRow
                        label="Ghi chú CSVC:"
                        value={
                          <div className="whitespace-pre-wrap italic">
                            {requestDetailDataForModal.lyDoTuChoiDoiCSVC}
                          </div>
                        }
                      />
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              {isLoadingChangeDetail && !requestDetailDataForModal
                ? 'Đang tải chi tiết...'
                : 'Không có dữ liệu chi tiết.'}
            </div>
          )}
          <DialogFooter className="pt-4 mt-auto shrink-0">
            {canProcessChangeRequests &&
              requestDetailDataForModal &&
              requestDetailDataForModal.trangThaiYeuCauDoiPhong.maTrangThai ===
                MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG && (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      openProcessChangeModal(
                        requestDetailDataForModal,
                        'TU_CHOI'
                      )
                    }
                    disabled={processChangeMutation.isPending}
                    className="h-9"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Từ chối
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      openProcessChangeModal(requestDetailDataForModal, 'DUYET')
                    }
                    disabled={processChangeMutation.isPending}
                    className="h-9 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="mr-1.5 h-4 w-4" /> Duyệt & Cấp phòng
                  </Button>
                </>
              )}
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Xử Lý Yêu Cầu Đổi Phòng (Cho CSVC) */}
      <Dialog
        open={
          isProcessModalOpen &&
          canProcessChangeRequests &&
          !!selectedRequestForAction
        }
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestForAction(null);
            setPhongMoiSearchTerm('');
          }
          setIsProcessModalOpen(open);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Xử lý Yêu Cầu Đổi Phòng #{selectedRequestForAction?.ycDoiPhongID}
            </DialogTitle>
            <DialogDescription>
              Sự kiện: {requestDetailDataForModal?.suKien.tenSK} <br />
              Phòng hiện tại: {
                requestDetailDataForModal?.phongHienTai.tenPhong
              }{' '}
              ({requestDetailDataForModal?.phongHienTai.maPhong})<br />
              Thời gian sử dụng:{' '}
              {formatDateRangeForDisplay(
                requestDetailDataForModal?.phongHienTai.tgNhanPhongTT,
                requestDetailDataForModal?.phongHienTai.tgTraPhongTT
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] -mx-6 px-6 py-4">
            <div className="space-y-4">
              {processingActionChange === 'DUYET' && (
                <div className="space-y-2">
                  <Label htmlFor="phongMoiDuocChon" className="font-semibold">
                    Chọn phòng mới để cấp
                  </Label>
                  <Command className="rounded-lg border shadow-sm bg-card">
                    <CommandInput
                      placeholder="Tìm theo tên/mã phòng..."
                      value={phongMoiSearchTerm}
                      onValueChange={setPhongMoiSearchTerm}
                    />
                    <CommandList>
                      <ScrollArea className="max-h-[200px]">
                        {isLoadingPhongForChangeSelect && (
                          <CommandItem disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                            Đang tải DS phòng...
                          </CommandItem>
                        )}
                        <CommandEmpty>
                          {!isLoadingPhongForChangeSelect &&
                            'Không tìm thấy phòng nào phù hợp.'}
                        </CommandEmpty>
                        {dsPhongForChangeSelect &&
                          dsPhongForChangeSelect.length > 0 && (
                            <CommandGroup heading="Phòng khả dụng (gợi ý):">
                              {dsPhongForChangeSelect.map((p) => (
                                <CommandItem
                                  key={p.phongID}
                                  value={`${p.tenPhong} ${p.maPhong || ''} ${
                                    p.tenLoaiPhong || ''
                                  } SC${p.sucChua}`}
                                  onSelect={() =>
                                    setPhongMoiDuocChon(p.phongID.toString())
                                  }
                                  className={cn(
                                    'flex justify-between items-center cursor-pointer',
                                    phongMoiDuocChon === p.phongID.toString() &&
                                      'bg-accent text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground'
                                  )}
                                >
                                  <div>
                                    {p.tenPhong} ({p.maPhong}){' '}
                                    <span className="text-xs text-muted-foreground">
                                      - {p.tenLoaiPhong} - SC: {p.sucChua}
                                    </span>
                                  </div>
                                  {phongMoiDuocChon ===
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
                  <FormDescription className="text-xs">
                    Hệ thống gợi ý phòng dựa trên yêu cầu và lịch trống. Chọn
                    một phòng.
                  </FormDescription>
                </div>
              )}
              <div className="space-y-2">
                <Label
                  htmlFor="processingReasonChange"
                  className="font-semibold"
                >
                  {processingActionChange === 'DUYET'
                    ? 'Ghi chú thêm (nếu có)'
                    : 'Lý do từ chối'}
                  {processingActionChange === 'TU_CHOI' && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Textarea
                  id="processingReasonChange"
                  value={processingReasonChange}
                  onChange={(e) => setProcessingReasonChange(e.target.value)}
                  className="min-h-[80px]"
                  placeholder={
                    processingActionChange === 'DUYET'
                      ? 'VD: Phòng mới có máy chiếu tốt hơn...'
                      : 'Nêu rõ lý do từ chối...'
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
              onClick={handleSubmitProcessChange}
              disabled={
                processChangeMutation.isPending ||
                (processingActionChange === 'TU_CHOI' &&
                  !processingReasonChange.trim()) ||
                (processingActionChange === 'DUYET' && !phongMoiDuocChon)
              }
              variant={
                processingActionChange === 'DUYET' ? 'secondary' : 'destructive'
              }
            >
              {processChangeMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : processingActionChange === 'DUYET' ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {processingActionChange === 'DUYET'
                ? 'Xác nhận Cấp Phòng Mới'
                : 'Xác nhận Từ Chối'}
            </Button>
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
      'grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-x-4 gap-y-1 py-2.5 border-b border-border/40 dark:border-slate-700/40 last:border-b-0',
      className
    )}
  >
    <Label className="sm:text-right text-sm font-medium text-muted-foreground col-span-1 sm:col-auto pt-0.5">
      {label}
    </Label>
    <div className="sm:col-span-2 text-sm text-foreground break-words">
      {value}
    </div>
  </div>
);

export default RoomChangeRequestsPage;
