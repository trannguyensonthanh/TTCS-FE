import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import DashboardLayout from '@/components/DashboardLayout';
import {
  useRoomRequestDetail,
  useProcessRoomRequestDetailItem,
  ROOM_REQUEST_QUERY_KEYS,
} from '@/hooks/queries/roomRequestQueries';
import { usePhongListForSelect } from '@/hooks/queries/danhMucQueries';
import { useSendRevisionRequest } from '@/hooks/queries/notificationQueries';

import { CreateYeuCauChinhSuaThongBaoPayload } from '@/services/notification.service';
import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import MaTrangThaiYeuCauPhong from '@/enums/MaTrangThaiYeuCauPhong.enum';

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
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Loader2,
  ListChecks,
  CheckCircle,
  XCircle,
  MessageSquareQuote,
  Send,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { EVENT_QUERY_KEYS } from '@/hooks/queries/eventQueries';
import {
  XuLyYcChiTietPayload,
  YcMuonPhongChiTietResponse,
} from '@/services/roomRequest.service';

// --- Helper Functions ---
const formatDate = (
  dateString?: string | Date,
  customFormat = 'HH:mm dd/MM/yyyy'
) => {
  if (!dateString) return '';
  const date =
    typeof dateString === 'string' ? parseISO(dateString) : dateString;
  if (!isValid(date)) return '';
  return format(date, customFormat, { locale: vi });
};

// Hàm getStatusBadge đã được tối ưu từ code phụ
const getStatusBadgeForYcChiTiet = (maTrangThai?: string): React.ReactNode => {
  if (!maTrangThai)
    return (
      <Badge variant="outline" className="text-xs">
        Chưa rõ
      </Badge>
    );
  switch (maTrangThai) {
    case MaTrangThaiYeuCauPhong.YCCPCT_CHO_DUYET:
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-500/30"
        >
          Chờ Duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCPCT_DA_XEP_PHONG:
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/30"
        >
          Đã Xếp Phòng
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCPCT_KHONG_PHU_HOP:
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500/30"
        >
          Bị Từ Chối
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.CSVC_YEU_CAU_CHINH_SUA_CT:
      return (
        <Badge
          variant="default"
          className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500/30"
        >
          CSVC YC Chỉnh Sửa
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCPCT_DA_HUY:
      return (
        <Badge
          variant="outline"
          className="text-xs border-gray-400 text-gray-500"
        >
          Đã Hủy
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
// Badge cho trạng thái chung của Yêu cầu lớn
const getStatusBadgeForYeuCauPhong = (
  maTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai) return <Badge variant="outline">Chưa rõ</Badge>;
  const statuses = {
    [MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY]: (
      <Badge
        variant="destructive"
        className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
      >
        Chờ xử lý
      </Badge>
    ),
    [MaTrangThaiYeuCauPhong.YCCP_DANG_XU_LY]: (
      <Badge
        variant="default"
        className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"
      >
        Đang xử lý
      </Badge>
    ),
    [MaTrangThaiYeuCauPhong.YCCP_DA_XU_LY_MOT_PHAN]: (
      <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30">
        Xử lý một phần
      </Badge>
    ),
    [MaTrangThaiYeuCauPhong.YCCP_HOAN_TAT_DUYET]: (
      <Badge
        variant="secondary"
        className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
      >
        Hoàn tất duyệt
      </Badge>
    ),
    [MaTrangThaiYeuCauPhong.YCCP_TU_CHOI_TOAN_BO]: (
      <Badge
        variant="destructive"
        className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
      >
        Từ chối toàn bộ
      </Badge>
    ),
    [MaTrangThaiYeuCauPhong.YCCP_DA_HUY_BOI_NGUOI_TAO]: (
      <Badge variant="outline" className="border-gray-400 text-gray-500">
        Đã hủy
      </Badge>
    ),
  };
  return (
    statuses[maTrangThai] || <Badge variant="outline">{maTrangThai}</Badge>
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
    className={cn('grid grid-cols-3 items-start gap-x-4 gap-y-1', className)}
  >
    <Label className="text-right text-sm text-muted-foreground">{label}</Label>
    <div className="col-span-2 text-sm">{value}</div>
  </div>
);

// --- Zod Schemas cho các form ---

// Schema cho form xử lý (Duyệt/Từ Chối)
const processItemSchema = z.object({
  phongID: z.string().optional().nullable(),
  ghiChuCSVC: z
    .string()
    .max(500, 'Ghi chú tối đa 500 ký tự.')
    .optional()
    .nullable(),
});
type ProcessItemFormValues = z.infer<typeof processItemSchema>;

// Schema cho form yêu cầu chỉnh sửa
const revisionRequestSchema = z.object({
  noiDungYeuCau: z
    .string()
    .min(10, 'Nội dung yêu cầu phải có ít nhất 10 ký tự.')
    .max(1000, 'Tối đa 1000 ký tự.'),
});
type RevisionRequestFormValues = z.infer<typeof revisionRequestSchema>;

// ---- Component Chính: ProcessRoomRequestPage ----
const ProcessRoomRequestPage = () => {
  const { ycMuonPhongID } = useParams<{ ycMuonPhongID: string }>();
  const { hasRole, can } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State quản lý dialog và item được chọn
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] =
    useState<YcMuonPhongChiTietResponse | null>(null);
  const [processingAction, setProcessingAction] = useState<
    'DUYET' | 'TU_CHOI' | null
  >(null);

  // State cho việc tìm kiếm phòng
  const [phongSearchTerm, setPhongSearchTerm] = useState('');
  const debouncedPhongSearchTerm = useDebounce(phongSearchTerm, 300);

  // --- Quyền hạn ---
  const canProcessRequests =
    hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG);

  // --- Lấy dữ liệu chi tiết của yêu cầu ---
  // Đây là nguồn dữ liệu chính cho toàn bộ trang
  const {
    data: requestDetail,
    isLoading: isLoadingRequestDetail,
    isError,
    error: fetchError,
    refetch: refetchRequestDetail,
  } = useRoomRequestDetail(ycMuonPhongID, {
    enabled:
      !!ycMuonPhongID &&
      (can('approve', 'YeuCauMuonPhong') || can('view', 'YeuCauMuonPhong')),
  });

  // --- Khởi tạo Form bằng react-hook-form ---
  const formProcess = useForm<ProcessItemFormValues>({
    resolver: zodResolver(processItemSchema),
    defaultValues: { ghiChuCSVC: '', phongID: undefined },
  });

  const formRevision = useForm<RevisionRequestFormValues>({
    resolver: zodResolver(revisionRequestSchema),
    defaultValues: { noiDungYeuCau: '' },
  });

  // --- Lấy danh sách phòng phù hợp cho việc xếp phòng ---
  const { data: dsPhongTrongTruong, isLoading: isLoadingPhongTrongTruong } =
    usePhongListForSelect(
      {
        limit: 50,
        searchTerm: debouncedPhongSearchTerm || undefined,
        loaiPhongID: selectedDetailItem?.loaiPhongYeuCau?.loaiPhongID,
        sucChuaToiThieu: selectedDetailItem?.sucChuaYc,
        thoiGianMuon: selectedDetailItem?.tgMuonDk,
        thoiGianTra: selectedDetailItem?.tgTraDk,
        trangThaiPhongMa: 'SAN_SANG',
      },
      {
        enabled:
          isProcessingModalOpen &&
          processingAction === 'DUYET' &&
          !!selectedDetailItem,
      }
    );

  // --- Mutations (Hành động thay đổi dữ liệu) ---

  const processItemMutation = useProcessRoomRequestDetailItem({
    onSuccess: (updatedRequest) => {
      toast.success(
        `Đã ${
          processingAction === 'DUYET' ? 'duyệt và xếp phòng' : 'từ chối'
        } hạng mục thành công.`
      );
      setIsProcessingModalOpen(false);
      formProcess.reset();
      queryClient.setQueryData(
        ROOM_REQUEST_QUERY_KEYS.detail(ycMuonPhongID),
        updatedRequest
      );
      if (updatedRequest.suKien?.suKienID) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(updatedRequest.suKien.suKienID),
        });
      }
    },
    onError: (error: APIError) => {
      toast.error(error.body?.message || 'Lỗi khi xử lý hạng mục.');
    },
  });

  const sendRevisionRequestMutation = useSendRevisionRequest({
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu chỉnh sửa cho người tạo.');
      setIsRevisionModalOpen(false);
      formRevision.reset();
      refetchRequestDetail();
    },
    onError: (error: APIError) => {
      toast.error(error.body?.message || 'Lỗi khi gửi yêu cầu chỉnh sửa.');
    },
  });

  // --- Các hàm xử lý sự kiện (mở dialog, submit form) ---

  const openProcessModal = (
    item: YcMuonPhongChiTietResponse,
    action: 'DUYET' | 'TU_CHOI'
  ) => {
    setSelectedDetailItem(item);
    setProcessingAction(action);
    // Reset form với giá trị mặc định từ item ( )
    formProcess.reset({
      ghiChuCSVC: item.ghiChuCtCSVC || '',
      phongID: undefined,
    });
    setPhongSearchTerm('');
    setIsProcessingModalOpen(true);
  };

  const openRevisionModal = (item: YcMuonPhongChiTietResponse) => {
    setSelectedDetailItem(item);
    setIsRevisionModalOpen(true);
    formRevision.reset({ noiDungYeuCau: '' }); // Luôn reset để có form trống
  };

  const onSubmitProcessItem: SubmitHandler<ProcessItemFormValues> = (data) => {
    if (!selectedDetailItem || !processingAction || !ycMuonPhongID) return;

    let payload: XuLyYcChiTietPayload;

    if (processingAction === 'DUYET') {
      if (!data.phongID) {
        formProcess.setError('phongID', {
          message: 'Vui lòng chọn một phòng để xếp.',
        });
        toast.error('Vui lòng chọn phòng để xếp.');
        return;
      }
      payload = {
        hanhDong: 'DUYET',
        phongDuocCap: [{ phongID: parseInt(data.phongID, 10) }], // Giả định chỉ xếp 1 phòng/hạng mục
        ghiChuCSVC: data.ghiChuCSVC || null,
      };
    } else {
      // TU_CHOI
      if (!data.ghiChuCSVC?.trim()) {
        formProcess.setError('ghiChuCSVC', {
          message: 'Vui lòng nhập lý do từ chối.',
        });
        toast.error('Vui lòng nhập lý do từ chối.');
        return;
      }
      payload = { hanhDong: 'TU_CHOI', ghiChuCSVC: data.ghiChuCSVC };
    }
    processItemMutation.mutate({
      ycMuonPhongID: parseInt(ycMuonPhongID),
      ycMuonPhongCtID: selectedDetailItem.ycMuonPhongCtID,
      payload,
    });
  };

  const onSubmitRevisionRequest: SubmitHandler<RevisionRequestFormValues> = (
    data
  ) => {
    if (!selectedDetailItem || !requestDetail) return;
    const payload: CreateYeuCauChinhSuaThongBaoPayload = {
      loaiThucThe: 'YC_MUON_PHONG_CHI_TIET',
      idThucThe: selectedDetailItem.ycMuonPhongCtID,
      nguoiNhanID: requestDetail.nguoiYeuCau.nguoiDungID,
      noiDungGhiChu: data.noiDungYeuCau,
    };
    sendRevisionRequestMutation.mutate(payload);
  };

  // --- Render ---

  if (isLoadingRequestDetail)
    return (
      <DashboardLayout pageTitle="Đang tải...">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  if (isError || !requestDetail)
    return (
      <DashboardLayout pageTitle="Lỗi">
        <p>Không thể tải chi tiết yêu cầu: {fetchError?.message}</p>
      </DashboardLayout>
    );
  // Kiểm tra quyền sau khi đã có dữ liệu
  if (!can('approve', 'YeuCauMuonPhong') && !can('view', 'YeuCauMuonPhong')) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <p>Bạn không có quyền xem trang này.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle={`Xử Lý Yêu Cầu Phòng #${ycMuonPhongID}`}
      headerActions={
        <Link to="/facilities/room-requests">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> DS Yêu Cầu Phòng
          </Button>
        </Link>
      }
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Phần 1: Thông tin chung */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary dark:text-ptit-red" />
              Yêu cầu mượn phòng cho sự kiện: {requestDetail.suKien.tenSK}
            </CardTitle>
            <CardDescription>
              Người yêu cầu: {requestDetail.nguoiYeuCau.hoTen} (
              {requestDetail?.donViYeuCau?.tenDonVi}) - Ngày YC:{' '}
              {formatDate(requestDetail.ngayYeuCau)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-sm">
            <InfoRow
              label="Trạng thái chung:"
              value={getStatusBadgeForYeuCauPhong(
                requestDetail.trangThaiChung.maTrangThai
              )}
            />
            {requestDetail.ghiChuChungYc && (
              <InfoRow
                label="Ghi chú của người YC:"
                value={
                  <div className="whitespace-pre-line">
                    {requestDetail.ghiChuChungYc}
                  </div>
                }
              />
            )}
            {requestDetail.nguoiDuyetTongCSVC && (
              <InfoRow
                label="CSVC xử lý chung:"
                value={`${
                  requestDetail.nguoiDuyetTongCSVC.hoTen
                } (vào ${formatDate(requestDetail.ngayDuyetTongCSVC)})`}
              />
            )}
          </CardContent>
        </Card>

        {/* Phần 2: Danh sách hạng mục chi tiết */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Các hạng mục phòng yêu cầu:
          </h3>
          {requestDetail.chiTietYeuCau.length === 0 && (
            <p className="text-muted-foreground">
              Không có hạng mục chi tiết nào.
            </p>
          )}
          {requestDetail.chiTietYeuCau.map((detailItem, index) => (
            <motion.div
              key={detailItem.ycMuonPhongCtID}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row justify-between items-start p-4 border-b dark:border-slate-700">
                  <div>
                    <CardTitle className="text-md">
                      Hạng mục #{index + 1}:{' '}
                      {detailItem.moTaNhomPhong ||
                        `Yêu cầu ${detailItem.slPhongNhomNay} phòng`}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Thời gian:{' '}
                      {formatDate(detailItem.tgMuonDk, 'HH:mm dd/MM')} -{' '}
                      {formatDate(detailItem.tgTraDk, 'HH:mm dd/MM/yy')}
                    </CardDescription>
                  </div>
                  {getStatusBadgeForYcChiTiet(
                    detailItem.trangThaiChiTiet.maTrangThai
                  )}
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <InfoRow
                    label="Số lượng:"
                    value={`${detailItem.slPhongNhomNay} phòng`}
                  />
                  <InfoRow
                    label="Loại phòng YC:"
                    value={
                      detailItem.loaiPhongYeuCau?.tenLoaiPhong || (
                        <span className="italic text-muted-foreground">
                          Không YC
                        </span>
                      )
                    }
                  />
                  <InfoRow
                    label="Sức chứa YC:"
                    value={
                      detailItem.sucChuaYc ? (
                        `${detailItem.sucChuaYc} người`
                      ) : (
                        <span className="italic text-muted-foreground">
                          Không YC
                        </span>
                      )
                    }
                  />
                  {detailItem.thietBiThemYc && (
                    <InfoRow
                      label="Thiết bị thêm:"
                      value={detailItem.thietBiThemYc}
                      className="md:col-span-2"
                    />
                  )}
                  {detailItem.phongDuocCap &&
                    detailItem.phongDuocCap.length > 0 && (
                      <div className="md:col-span-2 mt-2 pt-2 border-t dark:border-slate-700">
                        <p className="font-medium text-green-600 dark:text-green-400 mb-1">
                          Phòng đã được xếp:
                        </p>
                        <ul className="list-disc list-inside pl-1 space-y-0.5">
                          {detailItem.phongDuocCap.map((p) => (
                            <li key={p.datPhongID} className="text-xs">
                              <Link
                                to={`/facilities/rooms/${p.phongID}`}
                                className="hover:underline text-primary dark:text-ptit-red"
                              >
                                {p.tenPhong} ({p.maPhong})
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  {detailItem.ghiChuCtCSVC && (
                    <InfoRow
                      label="Ghi chú của CSVC:"
                      value={
                        <span className="italic text-amber-600 dark:text-amber-400">
                          {detailItem.ghiChuCtCSVC}
                        </span>
                      }
                      className="md:col-span-2"
                    />
                  )}
                </CardContent>
                {canProcessRequests &&
                  (detailItem.trangThaiChiTiet.maTrangThai ===
                    MaTrangThaiYeuCauPhong.YCCPCT_CHO_DUYET ||
                    detailItem.trangThaiChiTiet.maTrangThai ===
                      MaTrangThaiYeuCauPhong.CSVC_YEU_CAU_CHINH_SUA_CT) && (
                    <CardFooter className="p-4 border-t dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto text-amber-600 border-amber-500 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-900/50"
                        onClick={() => openRevisionModal(detailItem)}
                        disabled={
                          sendRevisionRequestMutation.isPending ||
                          processItemMutation.isPending
                        }
                      >
                        <MessageSquareQuote className="mr-1.5 h-4 w-4" /> YC
                        Chỉnh Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full sm:w-auto"
                        onClick={() => openProcessModal(detailItem, 'TU_CHOI')}
                        disabled={processItemMutation.isPending}
                      >
                        <XCircle className="mr-1.5 h-4 w-4" /> Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
                        onClick={() => openProcessModal(detailItem, 'DUYET')}
                        disabled={processItemMutation.isPending}
                      >
                        <CheckCircle className="mr-1.5 h-4 w-4" /> Duyệt & Xếp
                        phòng
                      </Button>
                    </CardFooter>
                  )}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* --- Dialogs --- */}

      {/* Dialog Xử Lý Hạng Mục (Duyệt/Từ Chối) */}
      <Dialog
        open={isProcessingModalOpen && canProcessRequests}
        onOpenChange={setIsProcessingModalOpen}
      >
        <DialogContent className="max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Xử lý hạng mục:{' '}
              {selectedDetailItem?.moTaNhomPhong ||
                `YC ${selectedDetailItem?.slPhongNhomNay} phòng`}
            </DialogTitle>
            <DialogDescription>
              {processingAction === 'DUYET'
                ? 'Duyệt và chọn phòng phù hợp để xếp lịch.'
                : 'Từ chối hạng mục yêu cầu này.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...formProcess}>
            <form
              onSubmit={formProcess.handleSubmit(onSubmitProcessItem)}
              className="flex-grow flex flex-col overflow-hidden"
            >
              <ScrollArea className="flex-grow pr-4 -mr-4">
                <div className="space-y-4 py-4">
                  {processingAction === 'DUYET' && (
                    <FormField
                      control={formProcess.control}
                      name="phongID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Chọn phòng để xếp{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
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
                                            value={`${p.tenPhong} ${p.maPhong}`}
                                            onSelect={() =>
                                              field.onChange(
                                                p.phongID.toString()
                                              )
                                            }
                                            className={cn(
                                              'flex justify-between items-center cursor-pointer',
                                              field.value ===
                                                p.phongID.toString() &&
                                                'bg-accent'
                                            )}
                                          >
                                            <div>
                                              {p.tenPhong} ({p.maPhong}){' '}
                                              <span className="text-xs text-muted-foreground">
                                                - {p.tenLoaiPhong} - Sức chứa:{' '}
                                                {p.sucChua}
                                              </span>
                                            </div>
                                            {field.value ===
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={formProcess.control}
                    name="ghiChuCSVC"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          {processingAction === 'DUYET'
                            ? 'Ghi chú thêm ( )'
                            : 'Lý do từ chối'}
                          {processingAction === 'TU_CHOI' && (
                            <span className="text-destructive">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              processingAction === 'DUYET'
                                ? 'VD: Phòng có sẵn máy chiếu...'
                                : 'Nêu rõ lý do...'
                            }
                            className="min-h-[80px]"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
              <DialogFooter className="pt-5 border-t mt-auto">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy bỏ
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={processItemMutation.isPending}
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
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Gửi Yêu Cầu Chỉnh Sửa */}
      <Dialog
        open={isRevisionModalOpen && canProcessRequests}
        onOpenChange={setIsRevisionModalOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Gửi Yêu Cầu Chỉnh Sửa Hạng Mục
            </DialogTitle>
            <DialogDescription>
              Nội dung yêu cầu sẽ được gửi thông báo đến người tạo. Hạng mục này
              sẽ được cập nhật trạng thái.
            </DialogDescription>
          </DialogHeader>
          <Form {...formRevision}>
            <form
              onSubmit={formRevision.handleSubmit(onSubmitRevisionRequest)}
              className="space-y-4 py-2"
            >
              <FormField
                control={formRevision.control}
                name="noiDungYeuCau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nội dung yêu cầu chỉnh sửa{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nêu rõ các điểm cần người tạo yêu cầu chỉnh sửa (VD: thời gian không phù hợp, số lượng quá lớn, yêu cầu loại phòng khác...)"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={sendRevisionRequestMutation.isPending}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {sendRevisionRequestMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Gửi Yêu Cầu
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProcessRoomRequestPage;
