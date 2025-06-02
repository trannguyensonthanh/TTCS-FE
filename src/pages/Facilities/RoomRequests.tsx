/* eslint-disable @typescript-eslint/no-explicit-any */
// Giả sử đường dẫn file là: src/pages/Facilities/RoomRequests.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Bỏ useParams nếu không dùng trực tiếp ở đây
import {
  format,
  parseISO,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isBefore,
  formatISO,
  isValid, // Thêm isValid
} from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  useForm,
  Controller,
  useFieldArray,
  SubmitHandler,
} from 'react-hook-form';
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
} from '@/components/ui/dialog'; // Bỏ DialogTrigger nếu không dùng trực tiếp
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarShadcn } from '@/components/ui/calendar';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner'; // Giả sử dùng sonner

import {
  useRoomRequests,
  useRoomRequestDetail,
  useCreateRoomRequest,
  useProcessRoomRequestDetailItem,
  useCancelRoomRequestByUser,
} from '@/hooks/queries/roomRequestQueries';
import {
  useSuKienListForSelection,
  EVENT_QUERY_KEYS, // Giữ lại EVENT_QUERY_KEYS
} from '@/hooks/queries/eventQueries';
import {
  useLoaiPhongList,
  usePhongListForSelect,
} from '@/hooks/queries/danhMucQueries';

import MaVaiTro from '@/enums/MaVaiTro.enum'; // Đường dẫn đến constants
import MaTrangThaiSK from '@/enums/MaTrangThaiSK.enum';
import MaTrangThaiYeuCauPhong from '@/enums/MaTrangThaiYeuCauPhong.enum';

import { APIError } from '@/services/apiHelper'; // Giả sử type này tồn tại

import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  PlusCircle,
  Trash2,
  CalendarIcon,
  ListChecks,
  ExternalLink,
  MinusCircle,
  Send,
  Plus, // Thêm ExternalLink, MinusCircle, Send
  // FileText, CalendarClock, History, Building, ChevronLeft, ChevronRight, MoreHorizontal,
  // MessageSquareWarning, ThumbsUp, ThumbsDown, Info, Users as UsersIcon, MapPin, ChevronsUpDown, Clock, Plus, AlertCircle
  // Bỏ bớt các icon không dùng đến trong file này
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  CreateYeuCauMuonPhongPayload,
  GetYeuCauMuonPhongParams,
  XuLyYcChiTietPayload,
  YcMuonPhongChiTietResponse,
  YeuCauMuonPhongDetailResponse,
  YeuCauMuonPhongListItemResponse,
} from '@/services/roomRequest.service';
import InfoRowDialog from '@/components/dialog/InfoRowDialog';
// import { DateRange } from 'react-day-picker'; // Không thấy dùng DateRangePicker

// --- Helper Functions ---
const formatDate = (
  dateString?: string | Date,
  customFormat = 'HH:mm dd/MM/yyyy'
): string => {
  if (!dateString) return 'N/A';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return 'Ngày không hợp lệ'; // Kiểm tra tính hợp lệ của date
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
    case MaTrangThaiYeuCauPhong.YCCP_DA_HUY_BOI_NGUOI_TAO: // Thêm trạng thái này
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

// --- Zod Schemas for Forms ---
const ycChiTietSchema = z.object({
  moTaNhomPhong: z
    .string()
    .max(255, 'Mô tả không quá 255 ký tự.')
    .optional()
    .nullable(),
  slPhongNhomNay: z.coerce
    .number()
    .int()
    .min(1, 'Số lượng phòng phải lớn hơn 0'),
  loaiPhongYcID: z.string().optional().nullable(),
  sucChuaYc: z.coerce
    .number()
    .int()
    .positive('Sức chứa phải là số dương.')
    .optional()
    .nullable(),
  thietBiThemYc: z
    .string()
    .max(500, 'Yêu cầu thiết bị không quá 500 ký tự.')
    .optional()
    .nullable(),
  ngayMuon: z.date({ required_error: 'Vui lòng chọn ngày mượn.' }),
  gioMuon: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ mượn không hợp lệ (HH:mm).'),
  ngayTra: z.date({ required_error: 'Vui lòng chọn ngày trả.' }),
  gioTra: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ trả không hợp lệ (HH:mm).'),
});

const createRoomRequestSchema = z
  .object({
    suKienID: z.string().min(1, { message: 'Vui lòng chọn một sự kiện.' }),
    ghiChuChungYc: z
      .string()
      .max(1000, 'Ghi chú chung không quá 1000 ký tự.')
      .optional()
      .nullable(),
    chiTietYeuCau: z
      .array(ycChiTietSchema)
      .min(1, 'Phải có ít nhất một chi tiết yêu cầu phòng.'),
  })
  .refine(
    (data) => {
      for (const chiTiet of data.chiTietYeuCau) {
        const [hM, mM] = chiTiet.gioMuon.split(':').map(Number);
        const tgMuonDkFull = setMilliseconds(
          setSeconds(setMinutes(setHours(chiTiet.ngayMuon, hM), mM), 0),
          0
        );
        const [hT, mT] = chiTiet.gioTra.split(':').map(Number);
        const tgTraDkFull = setMilliseconds(
          setSeconds(setMinutes(setHours(chiTiet.ngayTra, hT), mT), 0),
          0
        );
        if (isBefore(tgTraDkFull, tgMuonDkFull)) return false;
      }
      return true;
    },
    {
      message:
        'Thời gian trả phải sau hoặc bằng thời gian mượn cho mỗi yêu cầu chi tiết.',
      path: ['chiTietYeuCau'], // Hoặc path cụ thể hơn nếu muốn trỏ đến field ngày/giờ
    }
  );

type CreateRoomRequestFormValues = z.infer<typeof createRoomRequestSchema>;

// ---- Component Chính ----
const RoomRequestsPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterParams, setFilterParams] = useState<GetYeuCauMuonPhongParams>({
    page: 1,
    limit: 10,
    sortBy: 'NgayYeuCau',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const initialActiveTab = useMemo(() => {
    if (hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG)) {
      return 'pending_csvc';
    }
    if (
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) ||
      hasRole(MaVaiTro.TRUONG_KHOA) /* || other roles that create requests */
    ) {
      return 'my_requests';
    }
    return 'all'; // Fallback, hoặc có thể là một tab mặc định khác
  }, [hasRole]);
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
  const {
    data: fetchedDetailData,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
  } = useRoomRequestDetail(selectedRequestHeader?.ycMuonPhongID);

  useEffect(() => {
    if (fetchedDetailData) {
      setRequestDetailDataForModal(fetchedDetailData);
    }
  }, [fetchedDetailData]);

  const { data: dsSuKienForSelect, isLoading: isLoadingSuKienSelect } =
    useSuKienListForSelection(
      {
        coTheTaoYeuCauPhongMoi: true, // Backend sẽ xử lý việc lấy SK có trạng thái DA_DUYET_BGH hoặc PHONG_BI_TU_CHOI (và không có YC phòng active)
        limit: 100,
        sortBy: 'TenSK',
        sortOrder: 'asc',
        // Thêm nguoiTaoID hoặc donViChuTriID nếu CBTC chỉ được tạo YC cho SK của họ/đơn vị họ
        // nguoiTaoID: user?.nguoiDungID
      },
      { enabled: isCreateModalOpen }
    );
  const { data: dsLoaiPhong, isLoading: isLoadingLoaiPhong } = useLoaiPhongList(
    { limit: 100 },
    {
      enabled:
        isCreateModalOpen ||
        (isProcessItemModalOpen && processingAction === 'DUYET'),
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
          : undefined, // Ensure ISO format
        thoiGianTra: selectedRequestDetailItem?.tgTraDk
          ? formatISO(parseISO(selectedRequestDetailItem.tgTraDk))
          : undefined, // Ensure ISO format
        trangThaiPhongMa: 'SAN_SANG',
      },
      {
        enabled:
          isProcessItemModalOpen &&
          processingAction === 'DUYET' &&
          !!selectedRequestDetailItem,
      }
    );

  // --- Mutation Hooks ---
  const commonMutationOptions = {
    onSuccess: () => {
      refetchRoomRequests(); // Refetch list chung
      if (selectedRequestHeader?.ycMuonPhongID) {
        // Refetch detail nếu đang mở
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

  const createRequestMutation = useCreateRoomRequest({
    onSuccess: (data) => {
      commonMutationOptions.onSuccess();
      toast.success('Tạo yêu cầu thành công!');
      setIsCreateModalOpen(false);
      formCreate.reset();
      if (data.suKien?.suKienID) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
        });
        queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      }
    },
    onError: commonMutationOptions.onError,
  });

  const processItemMutation = useProcessRoomRequestDetailItem({
    onSuccess: () => {
      commonMutationOptions.onSuccess();
      toast.success('Xử lý hạng mục thành công!');
      setIsProcessItemModalOpen(false);
      setProcessingReason('');
      setPhongDuocChonChoChiTiet(undefined);
      setPhongSearchTerm(''); // Reset search phòng
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
      if (isDetailModalOpen) setIsDetailModalOpen(false); // Đóng dialog chi tiết nếu đang mở
    },
    onError: commonMutationOptions.onError,
  });

  // --- Form Handling ---
  const defaultChiTietYeuCauValue = {
    slPhongNhomNay: 1,
    gioMuon: '08:00',
    gioTra: '17:00',
    ngayMuon: addDays(new Date(), 1),
    ngayTra: addDays(new Date(), 1),
    moTaNhomPhong: '',
    loaiPhongYcID: '',
    sucChuaYc: null,
    thietBiThemYc: '',
  };
  const formCreate = useForm<CreateRoomRequestFormValues>({
    resolver: zodResolver(createRoomRequestSchema),
    defaultValues: {
      suKienID: '',
      ghiChuChungYc: '',
      chiTietYeuCau: [defaultChiTietYeuCauValue],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: formCreate.control,
    name: 'chiTietYeuCau',
  });

  const selectedSuKienIdForForm = formCreate.watch('suKienID');
  useEffect(() => {
    if (selectedSuKienIdForForm && dsSuKienForSelect) {
      const suKien = dsSuKienForSelect.find(
        (sk) => sk.suKienID.toString() === selectedSuKienIdForForm
      );
      if (suKien?.tgBatDauDK && suKien.tgKetThucDK) {
        const startDate = parseISO(suKien.tgBatDauDK);
        const endDate = parseISO(suKien.tgKetThucDK);
        if (isValid(startDate) && isValid(endDate)) {
          formCreate.setValue('chiTietYeuCau', [
            {
              // Reset về 1 chi tiết với ngày của sự kiện
              ...defaultChiTietYeuCauValue,
              ngayMuon: startDate,
              ngayTra: endDate,
              gioMuon: format(startDate, 'HH:mm'),
              gioTra: format(endDate, 'HH:mm'),
            },
          ]);
        }
      }
    }
  }, [selectedSuKienIdForForm, dsSuKienForSelect, formCreate]);

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
      setRequestDetailDataForModal(null); // Clear old detail data
      setIsDetailModalOpen(true);
    },
    []
  );

  const openProcessItemModal = useCallback(
    (itemDetail: YcMuonPhongChiTietResponse, action: 'DUYET' | 'TU_CHOI') => {
      setSelectedRequestDetailItem(itemDetail);
      setProcessingAction(action);
      setProcessingReason(itemDetail.ghiChuCtCSVC || ''); // Load lại ghi chú cũ nếu có
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

  const onSubmitCreateRequest: SubmitHandler<CreateRoomRequestFormValues> =
    useCallback(
      (data) => {
        if (!data.suKienID) {
          formCreate.setError('suKienID', {
            type: 'manual',
            message: 'Vui lòng chọn một sự kiện.',
          });
          return;
        }
        const payload: CreateYeuCauMuonPhongPayload = {
          suKienID: parseInt(data.suKienID, 10),
          ghiChuChungYc: data.ghiChuChungYc || null,
          chiTietYeuCau: data.chiTietYeuCau.map((ct) => {
            const [hM, mM] = ct.gioMuon.split(':').map(Number);
            const tgMuonDkFull = setMilliseconds(
              setSeconds(setMinutes(setHours(ct.ngayMuon, hM), mM), 0),
              0
            );
            const [hT, mT] = ct.gioTra.split(':').map(Number);
            const tgTraDkFull = setMilliseconds(
              setSeconds(setMinutes(setHours(ct.ngayTra, hT), mT), 0),
              0
            );
            return {
              moTaNhomPhong: ct.moTaNhomPhong || null,
              slPhongNhomNay: ct.slPhongNhomNay,
              loaiPhongYcID: ct.loaiPhongYcID
                ? parseInt(ct.loaiPhongYcID, 10)
                : null,
              sucChuaYc: ct.sucChuaYc ? Number(ct.sucChuaYc) : null,
              thietBiThemYc: ct.thietBiThemYc || null,
              tgMuonDk: formatISO(tgMuonDkFull),
              tgTraDk: formatISO(tgTraDkFull),
            };
          }),
        };
        createRequestMutation.mutate(payload);
      },
      [createRequestMutation, formCreate]
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
      searchTerm: debouncedSearchTerm || undefined, // Giữ lại searchTerm khi chuyển tab
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
  const renderRequestsTable = (requests: YeuCauMuonPhongListItemResponse[]) => (
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
          {requests.map((req) => (
            <TableRow
              key={req.ycMuonPhongID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-medium py-3 px-4 align-top">
                <Link
                  to={`/events/${req.suKien.suKienID}`}
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
                {req.donViYeuCau.tenDonVi}
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
            onClick={() => {
              const tomorrow = addDays(new Date(), 1);
              formCreate.reset({
                suKienID: '',
                ghiChuChungYc: '',
                chiTietYeuCau: [
                  {
                    ...defaultChiTietYeuCauValue,
                    ngayMuon: tomorrow,
                    ngayTra: tomorrow,
                  },
                ],
              });
              setIsCreateModalOpen(true);
            }}
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
                !canProcessRequests && (
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
                        onClick={() => {
                          const tomorrow = addDays(new Date(), 1);
                          formCreate.reset({
                            suKienID: '',
                            ghiChuChungYc: '',
                            chiTietYeuCau: [
                              {
                                ...defaultChiTietYeuCauValue,
                                ngayMuon: tomorrow,
                                ngayTra: tomorrow,
                              },
                            ],
                          });
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

      {/* Dialog Tạo Yêu Cầu Mượn Phòng Mới */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] flex flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Tạo Yêu Cầu Mượn Phòng Mới
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho yêu cầu mượn phòng.
            </DialogDescription>
          </DialogHeader>
          <Form {...formCreate}>
            <form
              onSubmit={formCreate.handleSubmit(onSubmitCreateRequest)}
              id="createRoomRequestForm"
              className="flex-grow  flex flex-col"
            >
              <ScrollArea className="flex-grow pr-5 -mr-1">
                {' '}
                {/* -mr-1 để scrollbar không chiếm chỗ của padding nội dung */}
                <div className="space-y-6 p-1 pr-1">
                  <FormField
                    control={formCreate.control}
                    name="suKienID"
                    render={({ field }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>
                          Chọn Sự Kiện (đã được BGH duyệt và chưa có YC phòng){' '}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingSuKienSelect}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingSuKienSelect
                                    ? 'Đang tải DS sự kiện...'
                                    : 'Chọn sự kiện'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Sự kiện khả dụng</SelectLabel>
                              {dsSuKienForSelect?.map((sk) => (
                                <SelectItem
                                  key={sk.suKienID}
                                  value={sk.suKienID.toString()}
                                >
                                  {sk.tenSK} (
                                  {formatDate(sk.tgBatDauDK, 'dd/MM')}-
                                  {formatDate(sk.tgKetThucDK, 'dd/MM/yy')})
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-md font-semibold">
                      Chi tiết các phòng/khu vực cần mượn:
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          ...defaultChiTietYeuCauValue,
                          ngayMuon:
                            formCreate.getValues('chiTietYeuCau.0.ngayMuon') ||
                            addDays(new Date(), 1),
                          ngayTra:
                            formCreate.getValues('chiTietYeuCau.0.ngayTra') ||
                            addDays(new Date(), 1),
                        })
                      }
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm hạng mục
                    </Button>
                  </div>
                  {fields.map((item, index) => (
                    <Card
                      key={item.id}
                      className="p-4 border-dashed relative group bg-muted/20 dark:bg-slate-800/20"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-base">
                          Hạng mục yêu cầu phòng #{index + 1}
                        </h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="absolute top-1 right-1 text-destructive opacity-50 group-hover:opacity-100 transition-opacity h-7 w-7"
                          >
                            <MinusCircle className="h-4 w-4" />{' '}
                            <span className="sr-only">Xóa hạng mục</span>
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.moTaNhomPhong`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mô tả/Tên gợi nhớ</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="VD: Phòng hội thảo chính"
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.slPhongNhomNay`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Số lượng phòng này{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.loaiPhongYcID`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Loại phòng mong muốn</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value || undefined}
                                disabled={isLoadingLoaiPhong}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        isLoadingLoaiPhong
                                          ? 'Đang tải...'
                                          : 'Không yêu cầu cụ thể'
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="/">
                                    {'Không yêu cầu cụ thể'}
                                  </SelectItem>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.sucChuaYc`}
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
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.ngayMuon`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                Ngày mượn{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'dd/MM/yyyy', {
                                          locale: vi,
                                        })
                                      ) : (
                                        <span>Chọn ngày</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarShadcn
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.gioMuon`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Giờ mượn{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.ngayTra`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                Ngày trả{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'dd/MM/yyyy', {
                                          locale: vi,
                                        })
                                      ) : (
                                        <span>Chọn ngày</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarShadcn
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date <
                                      (formCreate.getValues(
                                        `chiTietYeuCau.${index}.ngayMuon`
                                      ) || new Date(0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.gioTra`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Giờ trả{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formCreate.control}
                          name={`chiTietYeuCau.${index}.thietBiThemYc`}
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2 lg:col-span-3">
                              <FormLabel>Yêu cầu thiết bị thêm</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Liệt kê các thiết bị đặc biệt cần cho nhóm phòng này..."
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                  <FormField
                    control={formCreate.control}
                    name="ghiChuChungYc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú chung cho toàn bộ yêu cầu</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ghi chú thêm cho bộ phận CSVC..."
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
              <DialogFooter className="pt-6 border-t mt-auto shrink-0">
                {' '}
                {/* mt-auto để đẩy footer xuống */}
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Đóng
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  form="createRoomRequestForm"
                  disabled={
                    createRequestMutation.isPending ||
                    !formCreate.formState.isValid
                  }
                >
                  {createRequestMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}{' '}
                  Gửi Yêu Cầu
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequestHeader(null);
            setRequestDetailDataForModal(null);
          }
          setIsDetailModalOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col">
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
            <ScrollArea className="flex-grow pr-5 -mr-1">
              <div className="space-y-6 py-4 pr-1">
                <InfoRowDialog
                  label="Người yêu cầu:"
                  value={`${requestDetailDataForModal.nguoiYeuCau.hoTen} (${requestDetailDataForModal.donViYeuCau.tenDonVi})`}
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
                              {' '}
                              <p className="font-medium text-green-600 dark:text-green-400">
                                Phòng được xếp:
                              </p>{' '}
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
        <DialogContent className="max-w-lg">
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
            {' '}
            {/* Scroll cho nội dung dialog */}
            <div className="space-y-4">
              {processingAction === 'DUYET' && (
                <div className="space-y-2">
                  <Label htmlFor="phongDuocChon" className="font-semibold">
                    Chọn phòng để xếp (
                    {selectedRequestDetailItem?.slPhongNhomNay} vị trí)
                  </Label>
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
                                      - {p.tenLoaiPhong} - SC: {p.sucChua}
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
                  <FormDescription className="text-xs">
                    Lưu ý: Chọn một phòng. Nếu cần nhiều hơn, hãy tạo yêu cầu
                    chi tiết riêng hoặc bộ phận CSVC sẽ liên hệ.
                  </FormDescription>
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
    </DashboardLayout>
  );
};

export default RoomRequestsPage;
