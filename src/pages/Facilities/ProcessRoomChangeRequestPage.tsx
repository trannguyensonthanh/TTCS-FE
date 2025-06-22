import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO, isValid, formatISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import DashboardLayout from '@/components/DashboardLayout';
import {
  useRoomChangeRequestDetail,
  useProcessRoomChangeRequest,
  ROOM_CHANGE_REQUEST_QUERY_KEYS,
} from '@/hooks/queries/roomChangeRequestQueries';
import { usePhongListForSelect } from '@/hooks/queries/danhMucQueries';
import { APIError } from '@/services/apiHelper';
import MaTrangThaiYeuCauDoiPhong from '@/enums/MaTrangThaiYeuCauDoiPhong.enum';
import { ROOM_REQUEST_QUERY_KEYS } from '@/hooks/queries/roomRequestQueries'; // Để invalidate YC Mượn gốc

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Shuffle,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { XuLyYeuCauDoiPhongPayload } from '@/services/roomChangeRequest.service';

// --- Helper Functions ---
const formatDate = (
  dateString?: string | Date,
  customFormat = 'HH:mm dd/MM/yyyy'
): string => {
  if (!dateString) return 'N/A';
  const date =
    typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return isValid(date)
    ? format(date, customFormat, { locale: vi })
    : 'Ngày không hợp lệ';
};

const getStatusBadgeForYeuCauDoiPhong = (
  maTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai)
    return (
      <Badge variant="outline" className="text-xs">
        Chưa rõ
      </Badge>
    );
  switch (maTrangThai) {
    case MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG:
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-500/30"
        >
          Chờ duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.DA_DUYET_DOI_PHONG:
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/30"
        >
          Đã duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.TU_CHOI_DOI_PHONG:
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500/30"
        >
          Bị từ chối
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.DA_HUY_BOI_NGUOI_TAO:
      return (
        <Badge
          variant="outline"
          className="text-xs border-gray-400 text-gray-500"
        >
          Đã hủy
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

const formatDateRangeForDisplay = (
  start?: string | Date,
  end?: string | Date
): string => {
  if (!start || !end) return 'N/A';
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  if (!isValid(startDate) || !isValid(endDate)) return 'Thời gian không hợp lệ';

  if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
    return `${format(startDate, 'HH:mm')} - ${format(
      endDate,
      'HH:mm'
    )} ngày ${format(startDate, 'dd/MM/yyyy')}`;
  }
  return `${format(startDate, 'HH:mm dd/MM/yyyy')} - ${format(
    endDate,
    'HH:mm dd/MM/yyyy'
  )}`;
};

const InfoRow = ({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-x-4 gap-y-1 py-2 border-b border-border/40 last:border-b-0">
    <Label className="sm:text-right text-sm text-muted-foreground">
      {label}
    </Label>
    <div className="text-sm font-medium text-foreground break-words">
      {value}
    </div>
  </div>
);

// --- Zod Schema ---
const processChangeFormSchema = z.object({
  phongMoiID: z.string().optional().nullable(),
  ghiChuCSVC: z
    .string()
    .max(500, 'Ghi chú tối đa 500 ký tự')
    .optional()
    .nullable(),
  lyDoTuChoiDoiCSVC: z
    .string()
    .max(500, 'Lý do tối đa 500 ký tự.')
    .optional()
    .nullable(),
});
type ProcessChangeFormValues = z.infer<typeof processChangeFormSchema>;

// ---- Component Chính: Trang xử lý ----
const ProcessRoomChangeRequestPage = () => {
  const { ycDoiPhongID } = useParams<{ ycDoiPhongID: string }>();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [actionToPerform, setActionToPerform] = useState<
    'DUYET' | 'TU_CHOI' | null
  >(null);
  const [phongSearchTerm, setPhongSearchTerm] = useState('');
  const debouncedPhongSearchTerm = useDebounce(phongSearchTerm, 300);

  const isQLCSVC = hasRole(MaVaiTro.QUAN_LY_CSVC);
  const isCBTC = hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN);

  const {
    data: requestDetail,
    isLoading: isLoadingDetail,
    isError,
    error: fetchError,
    refetch,
  } = useRoomChangeRequestDetail(ycDoiPhongID, {
    enabled: !!ycDoiPhongID,
  });

  const formProcess = useForm<ProcessChangeFormValues>({
    resolver: zodResolver(processChangeFormSchema),
    defaultValues: {
      phongMoiID: undefined,
      ghiChuCSVC: '',
      lyDoTuChoiDoiCSVC: '',
    },
  });

  // Lấy ds phòng trống dựa trên thời gian của phòng hiện tại
  const { data: dsPhongForChangeSelect, isLoading: isLoadingPhong } =
    usePhongListForSelect(
      {
        limit: 50,
        searchTerm: debouncedPhongSearchTerm || undefined,
        loaiPhongID: requestDetail?.ycPhongMoi_LoaiPhong?.loaiPhongID,
        sucChuaToiThieu: requestDetail?.ycPhongMoi_SucChua,
        thoiGianMuon: requestDetail?.phongHienTai?.tgNhanPhongTT,
        thoiGianTra: requestDetail?.phongHienTai?.tgTraPhongTT,
        trangThaiPhongMa: 'SAN_SANG',
      },
      {
        enabled:
          !!ycDoiPhongID &&
          actionToPerform === 'DUYET' &&
          !!requestDetail?.phongHienTai?.tgNhanPhongTT,
      }
    );

  const processChangeMutation = useProcessRoomChangeRequest({
    onSuccess: (data) => {
      toast.success(
        `Đã ${
          actionToPerform === 'DUYET' ? 'duyệt' : 'từ chối'
        } yêu cầu đổi phòng.`
      );
      setActionToPerform(null);
      formProcess.reset();

      // Cập nhật lại cache cho trang này và trang danh sách
      queryClient.setQueryData(
        ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(ycDoiPhongID),
        data
      );
      queryClient.invalidateQueries({
        queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.lists(),
      });

      // Invalidate cache của yêu cầu mượn phòng gốc để cập nhật trạng thái phòng
      if (data.ycMuonPhongCtID) {
        // Giả sử API trả về YcMuonPhongID của header
        queryClient.invalidateQueries({
          queryKey: ROOM_REQUEST_QUERY_KEYS.detail(
            data.ycMuonPhongCtID.toString()
          ),
        });
      }
    },
    onError: (error: APIError) => {
      toast.error('Lỗi khi xử lý yêu cầu', {
        description: error.body?.message || error.message,
      });
    },
  });

  const onSubmitProcessChange: SubmitHandler<ProcessChangeFormValues> = (
    data
  ) => {
    if (!ycDoiPhongID || !actionToPerform) return;
    let payload: XuLyYeuCauDoiPhongPayload;

    if (actionToPerform === 'DUYET') {
      if (!data.phongMoiID) {
        formProcess.setError('phongMoiID', {
          message: 'Vui lòng chọn phòng mới.',
        });
        return;
      }
      payload = {
        hanhDong: 'DUYET',
        phongMoiID: parseInt(data.phongMoiID),
        ghiChuCSVC: data.ghiChuCSVC || null,
      };
    } else {
      // TU_CHOI
      if (!data.lyDoTuChoiDoiCSVC?.trim()) {
        formProcess.setError('lyDoTuChoiDoiCSVC', {
          message: 'Vui lòng nhập lý do từ chối.',
        });
        return;
      }
      payload = {
        hanhDong: 'TU_CHOI',
        lyDoTuChoiDoiCSVC: data.lyDoTuChoiDoiCSVC,
      };
    }
    processChangeMutation.mutate({ id: parseInt(ycDoiPhongID), payload });
  };

  // --- Render logic ---
  if (isLoadingDetail)
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
  if (!isQLCSVC && !isCBTC)
    return (
      <DashboardLayout pageTitle="Không có quyền">
        <p>Bạn không có quyền truy cập trang này.</p>
      </DashboardLayout>
    );
  console.log('Request Detail:', requestDetail);
  const canProcess = isQLCSVC;
  const isPendingApproval =
    requestDetail.trangThaiYeuCauDoiPhong.maTrangThai ===
    MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG;
  console.log('Request Detail:', requestDetail);
  return (
    <DashboardLayout
      pageTitle={`Chi Tiết YC Đổi Phòng #${ycDoiPhongID}`}
      headerActions={
        <Link to="/facilities/room-change-requests">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" /> DS Yêu Cầu
          </Button>
        </Link>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shuffle className="h-6 w-6 text-amber-500" />
                Yêu Cầu Đổi Phòng #{requestDetail.ycDoiPhongID}
              </CardTitle>
              {getStatusBadgeForYeuCauDoiPhong(
                requestDetail.trangThaiYeuCauDoiPhong.maTrangThai
              )}
            </div>
            <CardDescription>
              Sự kiện:{' '}
              <Link
                to={`/events/${requestDetail.suKien.suKienID}`}
                className="text-primary hover:underline font-medium"
              >
                {requestDetail.suKien.tenSK}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <InfoRow
              label="Người yêu cầu:"
              value={requestDetail.nguoiYeuCau.hoTen}
            />
            <InfoRow
              label="Ngày YC đổi:"
              value={formatDate(requestDetail.ngayYeuCauDoi)}
            />
            <InfoRow
              label="Phòng hiện tại:"
              value={`${requestDetail.phongHienTai.tenPhong} (${requestDetail.phongHienTai.maPhong})`}
            />
            <InfoRow
              label="Thời gian sử dụng:"
              value={formatDateRangeForDisplay(
                requestDetail.phongHienTai.tgNhanPhongTT,
                requestDetail.phongHienTai.tgTraPhongTT
              )}
            />
            <div className="pt-3">
              <Label className="sm:text-right text-sm text-muted-foreground">
                Lý do đổi phòng:
              </Label>
              <div className="mt-1 p-3 border rounded-md bg-muted/20 dark:bg-slate-800/30 whitespace-pre-line text-sm font-medium">
                {requestDetail.lyDoDoiPhong}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Yêu cầu cho phòng mới</CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow
              label="Loại phòng mong muốn:"
              value={
                requestDetail.ycPhongMoi_LoaiPhong?.tenLoaiPhong || (
                  <span className="italic text-muted-foreground">
                    Không yêu cầu
                  </span>
                )
              }
            />
            <InfoRow
              label="Sức chứa mong muốn:"
              value={
                requestDetail.ycPhongMoi_SucChua ? (
                  `${requestDetail.ycPhongMoi_SucChua} người`
                ) : (
                  <span className="italic text-muted-foreground">
                    Không yêu cầu
                  </span>
                )
              }
            />
            <InfoRow
              label="Thiết bị thêm:"
              value={
                requestDetail.ycPhongMoi_ThietBi || (
                  <span className="italic text-muted-foreground">
                    Không yêu cầu
                  </span>
                )
              }
            />
          </CardContent>
        </Card>

        {!isPendingApproval && (
          <Card
            className={cn(
              'shadow-md',
              requestDetail.trangThaiYeuCauDoiPhong.maTrangThai ===
                MaTrangThaiYeuCauDoiPhong.DA_DUYET_DOI_PHONG
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                : 'border-red-500 bg-red-50 dark:bg-red-900/30'
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg">Kết quả xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              {requestDetail.phongMoiDuocCap && (
                <InfoRow
                  label="Phòng mới được cấp:"
                  value={
                    <span className="font-semibold text-green-700 dark:text-green-400">{`${requestDetail.phongMoiDuocCap.tenPhong} (${requestDetail.phongMoiDuocCap.maPhong})`}</span>
                  }
                />
              )}
              {requestDetail.lyDoTuChoiDoiCSVC && (
                <InfoRow
                  label="Lý do từ chối:"
                  value={
                    <div className="whitespace-pre-line text-destructive">
                      {requestDetail.lyDoTuChoiDoiCSVC}
                    </div>
                  }
                />
              )}
              {requestDetail.nguoiDuyetCSVC && (
                <InfoRow
                  label="Người duyệt:"
                  value={requestDetail.nguoiDuyetCSVC.hoTen}
                />
              )}
              {requestDetail.ngayDuyetCSVC && (
                <InfoRow
                  label="Ngày duyệt:"
                  value={formatDate(requestDetail.ngayDuyetCSVC)}
                />
              )}
            </CardContent>
          </Card>
        )}

        {canProcess && isPendingApproval && (
          <Card className="shadow-lg mt-6 border-t-4 border-primary dark:border-ptit-red">
            <CardHeader>
              <CardTitle className="text-xl text-primary dark:text-ptit-red">
                Xử lý yêu cầu
              </CardTitle>
              <CardDescription>
                Chọn một hành động để xử lý yêu cầu đổi phòng này.
              </CardDescription>
            </CardHeader>
            <Form {...formProcess}>
              <form onSubmit={formProcess.handleSubmit(onSubmitProcessChange)}>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => setActionToPerform('TU_CHOI')}
                      variant={
                        actionToPerform === 'TU_CHOI'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-5 w-5" /> Từ chối
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActionToPerform('DUYET')}
                      variant={
                        actionToPerform === 'DUYET' ? 'secondary' : 'outline'
                      }
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" /> Duyệt & Cấp Phòng
                    </Button>
                  </div>

                  <motion.div
                    initial={false}
                    animate={
                      actionToPerform
                        ? { opacity: 1, height: 'auto', marginTop: '24px' }
                        : { opacity: 0, height: 0, marginTop: '0' }
                    }
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    {actionToPerform === 'DUYET' && (
                      <div className="space-y-4 pt-6 border-t">
                        <FormField
                          control={formProcess.control}
                          name="phongMoiID"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">
                                Chọn phòng mới để cấp{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Command className="rounded-lg border shadow-sm bg-background">
                                  <CommandInput
                                    placeholder="Tìm theo tên/mã phòng..."
                                    onValueChange={setPhongSearchTerm}
                                  />
                                  <CommandList>
                                    <ScrollArea className="max-h-[180px]">
                                      {isLoadingPhong && (
                                        <CommandItem disabled>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                                          Đang tải...
                                        </CommandItem>
                                      )}
                                      <CommandEmpty>
                                        {!isLoadingPhong &&
                                          'Không tìm thấy phòng phù hợp.'}
                                      </CommandEmpty>
                                      {dsPhongForChangeSelect?.map((p) => (
                                        <CommandItem
                                          key={p.phongID}
                                          value={`${p.tenPhong} ${p.maPhong}`}
                                          onSelect={() =>
                                            field.onChange(p.phongID.toString())
                                          }
                                        >
                                          <CheckCircle
                                            className={cn(
                                              'mr-2 h-4 w-4',
                                              field.value ===
                                                p.phongID.toString()
                                                ? 'opacity-100 text-green-500'
                                                : 'opacity-0'
                                            )}
                                          />
                                          {p.tenPhong} ({p.maPhong}) - SC:{' '}
                                          {p.sucChua}
                                        </CommandItem>
                                      ))}
                                    </ScrollArea>
                                  </CommandList>
                                </Command>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formProcess.control}
                          name="ghiChuCSVC"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ghi chú thêm (tùy chọn)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="VD: Đã đổi sang phòng A do..."
                                  {...field}
                                  value={field.value ?? ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    {actionToPerform === 'TU_CHOI' && (
                      <div className="space-y-4 pt-6 border-t">
                        <FormField
                          control={formProcess.control}
                          name="lyDoTuChoiDoiCSVC"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Lý do từ chối{' '}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Nêu rõ lý do từ chối..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </motion.div>
                </CardContent>
                {actionToPerform && (
                  <CardFooter className="border-t pt-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={processChangeMutation.isPending}
                      variant={
                        actionToPerform === 'DUYET'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="min-w-[180px]"
                    >
                      {processChangeMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Xác nhận{' '}
                      {actionToPerform === 'DUYET' ? 'Duyệt' : 'Từ Chối'}
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Form>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProcessRoomChangeRequestPage;
