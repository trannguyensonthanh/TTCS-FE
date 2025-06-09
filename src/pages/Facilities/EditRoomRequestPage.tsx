import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  format,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isBefore,
  formatISO,
  isValid,
  startOfDay,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarShadcn } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

import {
  useRoomRequestDetail,
  ROOM_REQUEST_QUERY_KEYS,
  useUpdateRoomRequestDetailByUser,
} from '@/hooks/queries/roomRequestQueries';
import { EVENT_QUERY_KEYS } from '@/hooks/queries/eventQueries';
import { useLoaiPhongList } from '@/hooks/queries/danhMucQueries';

import { APIError } from '@/services/apiHelper';

import MaVaiTro from '@/enums/MaVaiTro.enum';
import MaTrangThaiYeuCauPhong from '@/enums/MaTrangThaiYeuCauPhong.enum';

import {
  Loader2,
  Save,
  ChevronLeft,
  Plus,
  MinusCircle,
  AlertCircle,
  CalendarIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { UpdateYeuCauMuonPhongPayload } from '@/services/roomRequest.service';

// --- Zod Schemas (Kế thừa và điều chỉnh từ trang Create) ---
const ycChiTietUpdateSchema = z.object({
  ycMuonPhongCtID: z.number().optional().nullable(),
  moTaNhomPhong: z.string().max(255).optional().nullable(),
  slPhongNhomNay: z.coerce
    .number({ invalid_type_error: 'Số lượng phải là số.' })
    .int()
    .min(1, 'Số lượng phải ít nhất là 1.'),
  loaiPhongYcID: z.string().optional().nullable(),
  sucChuaYc: z.coerce
    .number({ invalid_type_error: 'Sức chứa phải là số.' })
    .int()
    .min(1)
    .optional()
    .nullable(),
  thietBiThemYc: z.string().max(500).optional().nullable(),
  ngayMuon: z.date({ required_error: 'Ngày mượn là bắt buộc.' }),
  gioMuon: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Giờ mượn không hợp lệ (HH:mm).',
  }),
  ngayTra: z.date({ required_error: 'Ngày trả là bắt buộc.' }),
  gioTra: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Giờ trả không hợp lệ (HH:mm).',
  }),
});

const updateRoomRequestSchema = z
  .object({
    ghiChuChungYc: z.string().max(1000).optional().nullable(),
    chiTietYeuCau: z
      .array(ycChiTietUpdateSchema)
      .min(1, 'Phải có ít nhất một hạng mục.'),
    ghiChuPhanHoiChoCSVC: z
      .string()
      .max(500, 'Ghi chú phản hồi tối đa 500 ký tự.')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      for (const chiTiet of data.chiTietYeuCau) {
        if (!chiTiet.ngayMuon || !chiTiet.ngayTra) return true; // Bỏ qua nếu chưa chọn xong
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
      message: 'Thời gian trả phải sau hoặc bằng thời gian mượn.',
      path: ['chiTietYeuCau'],
    }
  );

type UpdateRoomRequestFormValues = z.infer<typeof updateRoomRequestSchema>;

// ---- Component Chính: Trang Chỉnh Sửa ----
const EditRoomRequestPage = () => {
  const { ycMuonPhongID } = useParams<{ ycMuonPhongID: string }>();
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Lấy dữ liệu chi tiết của yêu cầu để điền vào form
  const {
    data: currentRequest,
    isLoading: isLoadingRequest,
    isError,
    error: fetchError,
  } = useRoomRequestDetail(ycMuonPhongID, { enabled: !!ycMuonPhongID });

  // Lấy danh sách loại phòng
  const { data: dsLoaiPhong, isLoading: isLoadingLoaiPhong } = useLoaiPhongList(
    { limit: 100 }
  );

  const form = useForm<UpdateRoomRequestFormValues>({
    resolver: zodResolver(updateRoomRequestSchema),
    defaultValues: {
      ghiChuChungYc: '',
      chiTietYeuCau: [],
      ghiChuPhanHoiChoCSVC: '',
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'chiTietYeuCau',
  });

  // Điền dữ liệu vào form sau khi fetch thành công
  useEffect(() => {
    if (currentRequest) {
      form.reset({
        ghiChuChungYc: currentRequest.ghiChuChungYc || '',
        chiTietYeuCau: currentRequest.chiTietYeuCau.map((ct) => ({
          ycMuonPhongCtID: ct.ycMuonPhongCtID,
          moTaNhomPhong: ct.moTaNhomPhong || '',
          slPhongNhomNay: ct.slPhongNhomNay,
          loaiPhongYcID: ct.loaiPhongYeuCau?.loaiPhongID.toString() || null,
          sucChuaYc: ct.sucChuaYc || null,
          thietBiThemYc: ct.thietBiThemYc || '',
          ngayMuon: parseISO(ct.tgMuonDk),
          gioMuon: format(parseISO(ct.tgMuonDk), 'HH:mm'),
          ngayTra: parseISO(ct.tgTraDk),
          gioTra: format(parseISO(ct.tgTraDk), 'HH:mm'),
        })),
        ghiChuPhanHoiChoCSVC: '',
      });
    }
  }, [currentRequest, form]);

  // Mutation để cập nhật
  const updateRequestMutation = useUpdateRoomRequestDetailByUser({
    onSuccess: (data) => {
      toast.success(`Đã cập nhật yêu cầu mượn phòng #${data.ycMuonPhongID}`);
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.detail(data.ycMuonPhongID.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.lists(),
      });
      if (data.suKien?.suKienID) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
        });
      }
      navigate('/facilities/room-requests');
    },
    onError: (error: APIError) => {
      toast.error('Lỗi khi cập nhật yêu cầu', {
        description: error.body?.message || error.message,
      });
    },
  });

  const onSubmit: SubmitHandler<UpdateRoomRequestFormValues> = (data) => {
    if (!ycMuonPhongID) return;
    const payload: UpdateYeuCauMuonPhongPayload = {
      ghiChuChungYc: data.ghiChuChungYc || null,
      chiTietYeuCau: data.chiTietYeuCau.map((ct) => {
        const [hM, mM] = ct.gioMuon.split(':').map(Number);
        const tgMuon = setMilliseconds(
          setSeconds(setMinutes(setHours(ct.ngayMuon, hM), mM), 0),
          0
        );
        const [hT, mT] = ct.gioTra.split(':').map(Number);
        const tgTra = setMilliseconds(
          setSeconds(setMinutes(setHours(ct.ngayTra, hT), mT), 0),
          0
        );
        return {
          ycMuonPhongCtID: ct.ycMuonPhongCtID, // Giữ ID để backend biết update/create
          moTaNhomPhong: ct.moTaNhomPhong || null,
          slPhongNhomNay: Number(ct.slPhongNhomNay),
          loaiPhongYcID: ct.loaiPhongYcID
            ? parseInt(ct.loaiPhongYcID, 10)
            : null,
          sucChuaYc: ct.sucChuaYc ? Number(ct.sucChuaYc) : null,
          thietBiThemYc: ct.thietBiThemYc || null,
          tgMuonDk: formatISO(tgMuon),
          tgTraDk: formatISO(tgTra),
        };
      }),
      ghiChuPhanHoiChoCSVC: data.ghiChuPhanHoiChoCSVC || null,
    };
    updateRequestMutation.mutate({ id: parseInt(ycMuonPhongID, 10), payload });
  };

  const canEditThisRequest = useMemo(() => {
    if (!user || !currentRequest) return false;
    if (hasRole(MaVaiTro.ADMIN_HE_THONG)) return true;
    if (
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) &&
      currentRequest.nguoiYeuCau.nguoiDungID === user.nguoiDungID
    ) {
      const isOverallPending =
        currentRequest.trangThaiChung.maTrangThai ===
        MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY;
      const hasRevisionItem = currentRequest.chiTietYeuCau.some(
        (ct) =>
          ct.trangThaiChiTiet.maTrangThai ===
          MaTrangThaiYeuCauPhong.CSVC_YEU_CAU_CHINH_SUA_CT
      );
      return isOverallPending || hasRevisionItem;
    }
    return false;
  }, [user, currentRequest, hasRole]);

  if (isLoadingRequest)
    return (
      <DashboardLayout pageTitle="Đang tải...">
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  if (isError)
    return (
      <DashboardLayout pageTitle="Lỗi">
        <p>Không thể tải chi tiết yêu cầu: {fetchError?.message}</p>
      </DashboardLayout>
    );
  if (!currentRequest)
    return (
      <DashboardLayout pageTitle="Không tìm thấy">
        <p>Không tìm thấy yêu cầu mượn phòng với ID này.</p>
      </DashboardLayout>
    );
  if (!canEditThisRequest)
    return (
      <DashboardLayout pageTitle="Không có quyền">
        <p>
          Bạn không có quyền sửa yêu cầu này hoặc yêu cầu không còn ở trạng thái
          cho phép chỉnh sửa.
        </p>
      </DashboardLayout>
    );

  const itemsNeedingRevision = currentRequest.chiTietYeuCau.filter(
    (ct) =>
      ct.trangThaiChiTiet.maTrangThai ===
      MaTrangThaiYeuCauPhong.CSVC_YEU_CAU_CHINH_SUA_CT
  );

  return (
    <DashboardLayout
      pageTitle={`Chỉnh Sửa Yêu Cầu #${ycMuonPhongID}`}
      headerActions={
        <Button
          type="submit"
          form="editRoomRequestForm"
          disabled={updateRequestMutation.isPending || !form.formState.isDirty}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          {updateRequestMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Lưu Thay Đổi {itemsNeedingRevision.length > 0 && '& Gửi Lại'}
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl max-w-6xl mx-auto">
          <CardHeader className="bg-muted/30 dark:bg-slate-800/30">
            <CardTitle className="text-2xl">
              Chỉnh Sửa Yêu Cầu Mượn Phòng
            </CardTitle>
            <CardDescription>
              Sự kiện:{' '}
              <span className="font-semibold">
                {currentRequest.suKien.tenSK}
              </span>{' '}
              (Không thể thay đổi sự kiện)
            </CardDescription>
            {itemsNeedingRevision.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 rounded-md text-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-700">
                      CSVC yêu cầu chỉnh sửa một số hạng mục.
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Vui lòng xem lại các hạng mục được đánh dấu, cập nhật
                      thông tin và lưu lại để gửi lại cho CSVC.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="editRoomRequestForm"
            >
              <CardContent className="p-0">
                <ScrollArea className="max-h-[calc(100vh-22rem)] overflow-auto">
                  <div className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="ghiChuChungYc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Ghi chú chung
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ghi chú chung cho toàn bộ yêu cầu..."
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator />
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Chi tiết các hạng mục phòng:
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({
                            ycMuonPhongCtID: null,
                            slPhongNhomNay: 1,
                            gioMuon: '08:00',
                            gioTra: '17:00',
                            ngayMuon: new Date(),
                            ngayTra: new Date(),
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm hạng mục
                      </Button>
                    </div>

                    {fields.map((item, index) => {
                      const detailFromApi = currentRequest.chiTietYeuCau.find(
                        (d) => d.ycMuonPhongCtID === item.ycMuonPhongCtID
                      );
                      const isProcessed =
                        detailFromApi &&
                        detailFromApi.trangThaiChiTiet.maTrangThai !==
                          MaTrangThaiYeuCauPhong.YCCPCT_CHO_DUYET &&
                        detailFromApi.trangThaiChiTiet.maTrangThai !==
                          MaTrangThaiYeuCauPhong.CSVC_YEU_CAU_CHINH_SUA_CT;
                      const needsRevision =
                        detailFromApi?.trangThaiChiTiet.maTrangThai ===
                        MaTrangThaiYeuCauPhong.CSVC_YEU_CAU_CHINH_SUA_CT;

                      return (
                        <Card
                          key={item.id}
                          className={cn(
                            'p-4 border-dashed relative group',
                            needsRevision &&
                              'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                            isProcessed &&
                              'bg-gray-100 dark:bg-gray-800/30 border-gray-300'
                          )}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">
                              Hạng mục #{index + 1}
                            </h4>
                            {fields.length > 1 && !isProcessed && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="absolute top-1 right-1 h-7 w-7 text-destructive opacity-50 group-hover:opacity-100"
                              >
                                <MinusCircle className="h-4 w-4" />{' '}
                              </Button>
                            )}
                          </div>
                          {isProcessed && (
                            <FormDescription className="mb-2 text-xs">
                              Hạng mục này đã được xử lý, không thể chỉnh sửa.
                            </FormDescription>
                          )}
                          {needsRevision && detailFromApi?.ghiChuCtCSVC && (
                            <div className="mb-3 p-2 text-xs border border-yellow-400 bg-yellow-100 dark:bg-yellow-700/30 rounded-md">
                              <span className="font-semibold">
                                CSVC Y/C Chỉnh Sửa:
                              </span>{' '}
                              {detailFromApi.ghiChuCtCSVC}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
                            {/* --- Các FormField được copy từ trang Create và thêm `disabled={isProcessed}` --- */}
                            <FormField
                              control={form.control}
                              name={`chiTietYeuCau.${index}.moTaNhomPhong`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mô tả/Tên gợi nhớ</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="VD: Phòng hội thảo chính"
                                      {...field}
                                      value={field.value ?? ''}
                                      disabled={isProcessed}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`chiTietYeuCau.${index}.slPhongNhomNay`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Số lượng{' '}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      disabled={isProcessed}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`chiTietYeuCau.${index}.loaiPhongYcID`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Loại phòng</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value ?? ''}
                                    disabled={isLoadingLoaiPhong || isProcessed}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Không yêu cầu cụ thể" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
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
                              control={form.control}
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
                                      disabled={isProcessed}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
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
                                          variant="outline"
                                          className={cn(
                                            !field.value &&
                                              'text-muted-foreground'
                                          )}
                                          disabled={isProcessed}
                                        >
                                          {field.value ? (
                                            format(field.value, 'dd/MM/yyyy')
                                          ) : (
                                            <span>Chọn ngày</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
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
                              control={form.control}
                              name={`chiTietYeuCau.${index}.gioMuon`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Giờ mượn{' '}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      disabled={isProcessed}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
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
                                          variant="outline"
                                          className={cn(
                                            !field.value &&
                                              'text-muted-foreground'
                                          )}
                                          disabled={isProcessed}
                                        >
                                          {field.value ? (
                                            format(field.value, 'dd/MM/yyyy')
                                          ) : (
                                            <span>Chọn ngày</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <CalendarShadcn
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => {
                                          const ngayMuonValue = form.getValues(
                                            `chiTietYeuCau.${index}.ngayMuon`
                                          );
                                          return ngayMuonValue
                                            ? date < ngayMuonValue
                                            : false;
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`chiTietYeuCau.${index}.gioTra`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Giờ trả{' '}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="time"
                                      {...field}
                                      disabled={isProcessed}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`chiTietYeuCau.${index}.thietBiThemYc`}
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2 lg:col-span-3">
                                  <FormLabel>Yêu cầu thiết bị thêm</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Liệt kê các thiết bị đặc biệt..."
                                      {...field}
                                      value={field.value ?? ''}
                                      disabled={isProcessed}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </Card>
                      );
                    })}
                    {itemsNeedingRevision.length > 0 && (
                      <FormField
                        control={form.control}
                        name="ghiChuPhanHoiChoCSVC"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">
                              Ghi chú phản hồi cho CSVC
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="VD: Đã cập nhật lại thời gian theo yêu cầu..."
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/facilities/room-requests')}
                >
                  Hủy Bỏ
                </Button>
                <Button
                  type="submit"
                  form="editRoomRequestForm"
                  disabled={
                    updateRequestMutation.isPending ||
                    !form.formState.isDirty ||
                    !form.formState.isValid
                  }
                  className="min-w-[180px]"
                >
                  {updateRequestMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Lưu Thay Đổi {itemsNeedingRevision.length > 0 && '& Gửi Lại'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default EditRoomRequestPage;
