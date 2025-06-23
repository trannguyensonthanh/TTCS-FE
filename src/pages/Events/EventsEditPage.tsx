// src/pages/Events/EventsEditPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  formatISO,
  parseISO,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isBefore,
  addDays,
  format,
  isValid as isValidDate,
  startOfDay, // Đổi tên để tránh trùng
} from 'date-fns';
import { vi } from 'date-fns/locale';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion } from 'framer-motion';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import {
  useManagedEventDetail,
  useUpdateEvent,
  EVENT_QUERY_KEYS, // Import query keys
} from '@/hooks/queries/eventQueries';
import {
  UpdateSuKienPayload,
  SuKienDetailResponse,
} from '@/services/event.service';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import MaTrangThaiSK from '@/enums/MaTrangThaiSK.enum';

import {
  Loader2,
  Save,
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Users,
  AlertCircle,
  FilePenLine,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext'; // Import useRole
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { useDonViList } from '@/hooks/queries/donViQueries';
import { useLoaiSuKienList } from '@/hooks/queries/loaiSuKienQueries';
import { useNguoiDungListForSelect } from '@/hooks/queries/nguoiDungQueries';

// Zod Schema - Giữ nguyên như bạn đã cung cấp, đã có logic refine tốt
const editEventFormSchema = z
  .object({
    tenSK: z
      .string()
      .min(5, { message: 'Tên sự kiện phải có ít nhất 5 ký tự.' })
      .max(300),
    loaiSuKienID: z
      .string()
      .refine((val) => val !== '', { message: 'Vui lòng chọn loại sự kiện.' }),
    moTaChiTiet: z.string().optional().nullable(),
    ngayBatDau: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu.' }),
    gioBatDau: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ bắt đầu không hợp lệ.'),
    ngayKetThuc: z.date({ required_error: 'Vui lòng chọn ngày kết thúc.' }),
    gioKetThuc: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ kết thúc không hợp lệ.'),
    slThamDuDK: z.coerce
      .number()
      .int()
      .positive('Số lượng phải dương')
      .optional()
      .nullable(),
    donViChuTriID: z.string().refine((val) => val !== '', {
      message: 'Vui lòng chọn đơn vị chủ trì.',
    }), // Cho phép sửa
    nguoiChuTriID: z.string().optional().nullable(),
    tenChuTriNgoai: z.string().max(150).optional().nullable(),
    donViChuTriNgoai: z.string().max(200).optional().nullable(),
    cacDonViThamGiaIDs: z.array(z.string()).optional().default([]),
    khachMoiNgoaiGhiChu: z.string().optional().nullable(),
    isCongKhaiNoiBo: z.boolean().default(false),
    ghiChuPhanHoiChoBGH: z
      .string()
      .max(1000, 'Ghi chú không quá 1000 ký tự.')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (
        !data.ngayBatDau ||
        !data.gioBatDau ||
        !data.ngayKetThuc ||
        !data.gioKetThuc
      )
        return true;
      const [hB, mB] = data.gioBatDau.split(':').map(Number);
      const [hK, mK] = data.gioKetThuc.split(':').map(Number);
      const tgBatDauDK = setMilliseconds(
        setSeconds(setMinutes(setHours(data.ngayBatDau, hB), mB), 0),
        0
      );
      const tgKetThucDK = setMilliseconds(
        setSeconds(setMinutes(setHours(data.ngayKetThuc, hK), mK), 0),
        0
      );

      if (isBefore(tgKetThucDK, tgBatDauDK)) return false; // Kết thúc phải sau hoặc bằng bắt đầu

      // Chỉ áp dụng ràng buộc 5 ngày nếu ngày bắt đầu *thực sự thay đổi* và không phải là ngày trong quá khứ
      // hoặc nếu sự kiện gốc đã ở tương lai và người dùng chọn lại một ngày trong tương lai.
      const originalTgBatDauDK = eventToEditData?.tgBatDauDK
        ? parseISO(eventToEditData.tgBatDauDK)
        : null;
      const isStartDateChanged =
        !originalTgBatDauDK ||
        format(tgBatDauDK, 'yyyy-MM-dd') !==
          format(originalTgBatDauDK, 'yyyy-MM-dd');

      if (isStartDateChanged) {
        const minAllowedStartDate = addDays(startOfDay(new Date()), 5); // Ít nhất 5 ngày kể từ ngày hiện tại (bắt đầu từ 00:00)
        if (isBefore(tgBatDauDK, minAllowedStartDate)) {
          return false; // Ngày bắt đầu mới phải sau ngày hiện tại ít nhất 5 ngày
        }
      } else if (
        originalTgBatDauDK &&
        isBefore(originalTgBatDauDK, new Date()) &&
        isBefore(tgBatDauDK, new Date())
      ) {
        // Nếu ngày bắt đầu gốc đã qua, và người dùng chọn một ngày mới cũng đã qua (nhưng vẫn là ngày gốc), thì bỏ qua check 5 ngày
        // Điều này cho phép giữ nguyên ngày bắt đầu nếu nó đã qua, nhưng không cho chọn ngày mới trong quá khứ.
      } else {
        // Nếu ngày gốc ở tương lai, hoặc người dùng chọn ngày mới ở tương lai
        const minAllowedStartDate = addDays(startOfDay(new Date()), 5);
        if (isBefore(tgBatDauDK, minAllowedStartDate)) {
          return false;
        }
      }

      const maxEnd = addDays(tgBatDauDK, 5); // Sự kiện không kéo dài quá 5 ngày
      if (
        isBefore(maxEnd, tgKetThucDK) &&
        format(tgBatDauDK, 'yyyy-MM-dd') !== format(tgKetThucDK, 'yyyy-MM-dd')
      ) {
        // Kiểm tra khác ngày mới áp dụng 5 ngày
        return false;
      }
      return true;
    },
    {
      message:
        'Thời gian không hợp lệ. Quy tắc: Bắt đầu >= Hiện tại + 5 ngày (nếu chọn ngày mới). Kết thúc >= Bắt đầu. Khoảng thời gian sự kiện không quá 5 ngày (nếu khác ngày).',
      path: ['ngayBatDau'],
    }
  )
  .refine((data) => !!data.nguoiChuTriID || !!data.tenChuTriNgoai, {
    message: 'Phải chọn người chủ trì nội bộ hoặc nhập tên chủ trì ngoài.',
    path: ['nguoiChuTriID'],
  })
  .superRefine((data, ctx) => {
    if (
      (data.tenChuTriNgoai && !data.donViChuTriNgoai) ||
      (!data.tenChuTriNgoai && data.donViChuTriNgoai)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Nếu nhập tên chủ trì ngoài thì phải nhập cả đơn vị (và ngược lại). Để trống cả hai nếu không có.',
        path: ['donViChuTriNgoai'],
      });
    }
    if (data.nguoiChuTriID && (data.tenChuTriNgoai || data.donViChuTriNgoai)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Chỉ chọn người chủ trì nội bộ HOẶC nhập thông tin chủ trì ngoài, không chọn cả hai.',
        path: ['nguoiChuTriID'],
      });
    }
  });

type EditEventFormValues = z.infer<typeof editEventFormSchema>;

// Khai báo eventToEditData ở phạm vi ngoài component để refine schema có thể truy cập
let eventToEditData: SuKienDetailResponse | null | undefined = null;

const EventsEditPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { can } = useRole(); // Sử dụng useRole để kiểm tra quyền
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isPageLoading, setIsPageLoading] = useState(true); // Dùng để kiểm soát loading toàn trang ban đầu

  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventFormSchema),
    // defaultValues sẽ được set trong useEffect của useManagedEventDetail
  });

  const {
    data: fetchedEventData, // Đổi tên để tránh xung đột với biến cục bộ
    isLoading: isLoadingEventDetail,
    isError: isErrorLoadingEvent,
    error: errorEventDetail,
    refetch: refetchEventDetail,
  } = useManagedEventDetail(eventId);

  useEffect(() => {
    if (fetchedEventData) {
      eventToEditData = fetchedEventData; // Cập nhật biến cục bộ
      // Kiểm tra quyền sửa ở đây sau khi có dữ liệu
      const canEditThisEvent = can('edit', 'SuKien', {
        nguoiTaoID: fetchedEventData?.nguoiTao?.nguoiDungID,
        maTrangThaiSK: fetchedEventData?.trangThaiSK?.maTrangThai,
      });

      if (!canEditThisEvent) {
        toast.error(
          'Bạn không có quyền sửa sự kiện này hoặc sự kiện không ở trạng thái cho phép sửa.'
        );
        navigate('/events', { replace: true });
        return;
      }

      // Điền form
      const minStartDate = addDays(new Date(), 0); // Cho phép chọn ngày hiện tại nếu sửa
      form.reset({
        tenSK: fetchedEventData.tenSK,
        loaiSuKienID:
          fetchedEventData.loaiSuKien?.loaiSuKienID?.toString() || undefined,
        moTaChiTiet: fetchedEventData.moTaChiTiet || '',
        ngayBatDau: fetchedEventData.tgBatDauDK
          ? parseISO(fetchedEventData.tgBatDauDK)
          : minStartDate,
        gioBatDau: fetchedEventData.tgBatDauDK
          ? format(parseISO(fetchedEventData.tgBatDauDK), 'HH:mm')
          : '08:00',
        ngayKetThuc: fetchedEventData.tgKetThucDK
          ? parseISO(fetchedEventData.tgKetThucDK)
          : minStartDate,
        gioKetThuc: fetchedEventData.tgKetThucDK
          ? format(parseISO(fetchedEventData.tgKetThucDK), 'HH:mm')
          : '17:00',
        slThamDuDK: fetchedEventData.slThamDuDK ?? undefined,
        donViChuTriID: fetchedEventData.donViChuTri.donViID.toString(), // Luôn có giá trị
        nguoiChuTriID:
          fetchedEventData.nguoiChuTri?.nguoiDungID?.toString() || undefined,
        tenChuTriNgoai: fetchedEventData.tenChuTriNgoai || '',
        donViChuTriNgoai: fetchedEventData.donViChuTriNgoai || '',
        cacDonViThamGiaIDs:
          fetchedEventData.donViThamGia?.map((dv) => dv.donViID.toString()) ||
          [],
        khachMoiNgoaiGhiChu: fetchedEventData.khachMoiNgoaiGhiChu || '',
        isCongKhaiNoiBo: fetchedEventData.isCongKhaiNoiBo || false,
        ghiChuPhanHoiChoBGH: '',
      });
      setIsPageLoading(false);
    }
  }, [fetchedEventData, can, navigate, form]);

  useEffect(() => {
    if (isErrorLoadingEvent) {
      toast.error('Không tìm thấy sự kiện hoặc có lỗi khi tải dữ liệu.');
      navigate('/events', { replace: true });
      setIsPageLoading(false);
    }
  }, [isErrorLoadingEvent, navigate]);

  const updateEventMutation = useUpdateEvent({
    onSuccess: (updatedEventData) => {
      toast.success(
        `Đã cập nhật sự kiện "${updatedEventData.tenSK}" thành công!`
      );
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(eventId),
      });
      navigate(`/events`); // Hoặc chi tiết sự kiện: /events/${eventId}
    },
    // onError đã được xử lý trong hook useUpdateEvent
  });

  // Data cho Selects
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList({
    limit: 100,
    sortBy: 'TenDonVi',
  });
  const { data: dsLoaiSK, isLoading: isLoadingLoaiSK } = useLoaiSuKienList({
    isActive: true,
    limit: 100,
  });

  const [searchTermNguoiChuTri, setSearchTermNguoiChuTri] = useState('');
  const debouncedSearchNguoiChuTri = useDebounce(searchTermNguoiChuTri, 300);
  const { data: dsNguoiChuTriOptions, isLoading: isLoadingNguoiChuTri } =
    useNguoiDungListForSelect(
      {
        searchTerm: debouncedSearchNguoiChuTri,
        loaiNguoiDung: 'GIANG_VIEN',
        // maVaiTro: `${MaVaiTro.BGH_DUYET_SK_TRUONG}`,
        limit: 10,
      },
      {
        enabled:
          debouncedSearchNguoiChuTri.length > 1 ||
          searchTermNguoiChuTri.length === 0,
      }
    );

  const [searchTermDonViThamGia, setSearchTermDonViThamGia] = useState('');
  const debouncedSearchDonViThamGia = useDebounce(searchTermDonViThamGia, 300);
  const { data: dsDonViThamGiaOptions, isLoading: isLoadingDonViThamGia } =
    useDonViList(
      { searchTerm: debouncedSearchDonViThamGia, limit: 10 },
      { enabled: debouncedSearchDonViThamGia.length > 0 }
    );

  const onSubmit: SubmitHandler<EditEventFormValues> = (data) => {
    if (!eventId || !fetchedEventData) return;

    const { ngayBatDau, gioBatDau, ngayKetThuc, gioKetThuc, ...restOfData } =
      data;
    const [hB, mB] = gioBatDau.split(':').map(Number);
    const tgBatDauDKFull = setMilliseconds(
      setSeconds(setMinutes(setHours(ngayBatDau, hB), mB), 0),
      0
    );
    const [hK, mK] = gioKetThuc.split(':').map(Number);
    const tgKetThucDKFull = setMilliseconds(
      setSeconds(setMinutes(setHours(ngayKetThuc, hK), mK), 0),
      0
    );

    const payload: UpdateSuKienPayload = {
      ...restOfData,
      tgBatDauDK: formatISO(tgBatDauDKFull),
      tgKetThucDK: formatISO(tgKetThucDKFull),
      loaiSuKienID: data.loaiSuKienID ? parseInt(data.loaiSuKienID) : undefined,
      donViChuTriID: data.donViChuTriID
        ? parseInt(data.donViChuTriID)
        : undefined, // Không cho sửa
      nguoiChuTriID: data.nguoiChuTriID
        ? parseInt(data.nguoiChuTriID)
        : data.tenChuTriNgoai
        ? undefined
        : null, // null để xóa nếu tenChuTriNgoai có giá trị
      tenChuTriNgoai: data.tenChuTriNgoai || null, // null nếu rỗng
      donViChuTriNgoai: data.donViChuTriNgoai || null, // null nếu rỗng
      cacDonViThamGiaIDs: data.cacDonViThamGiaIDs?.map((idStr) =>
        parseInt(idStr)
      ),
      slThamDuDK: data.slThamDuDK ? Number(data.slThamDuDK) : null, // null nếu không nhập
      isCongKhaiNoiBo: data.isCongKhaiNoiBo,
      ghiChuPhanHoiChoBGH:
        fetchedEventData.trangThaiSK.maTrangThai ===
        MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK
          ? data.ghiChuPhanHoiChoBGH || null
          : undefined, // Chỉ gửi nếu ở trạng thái BGH YC chỉnh sửa
    };
    updateEventMutation.mutate({ id: eventId, payload });
  };

  // Logic đồng bộ người chủ trì nội bộ và ngoài (tương tự EventsNew)
  const watchNguoiChuTriID = form.watch('nguoiChuTriID');
  const watchTenChuTriNgoai = form.watch('tenChuTriNgoai');
  const watchDonViChuTriNgoai = form.watch('donViChuTriNgoai');

  useEffect(() => {
    if (watchNguoiChuTriID && (watchTenChuTriNgoai || watchDonViChuTriNgoai)) {
      form.setValue('tenChuTriNgoai', '', { shouldValidate: true });
      form.setValue('donViChuTriNgoai', '', { shouldValidate: true });
    }
  }, [watchNguoiChuTriID, watchTenChuTriNgoai, watchDonViChuTriNgoai, form]);

  useEffect(() => {
    if ((watchTenChuTriNgoai || watchDonViChuTriNgoai) && watchNguoiChuTriID) {
      form.setValue('nguoiChuTriID', null, { shouldValidate: true });
    }
  }, [watchTenChuTriNgoai, watchDonViChuTriNgoai, watchNguoiChuTriID, form]);

  if (isPageLoading || isLoadingEventDetail) {
    return (
      <DashboardLayout pageTitle="Đang Tải Sự Kiện...">
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!fetchedEventData) {
    // Đã được xử lý bởi onError của useManagedEventDetail nhưng thêm check an toàn
    return (
      <DashboardLayout pageTitle="Không Tìm Thấy Sự Kiện">
        <div className="text-center p-10">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-xl">
            Sự kiện không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <Button asChild className="mt-6">
            <Link to="/events">Quay lại danh sách</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle={`Chỉnh Sửa: ${
        form.getValues('tenSK') || fetchedEventData.tenSK
      }`}
      headerActions={
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/events')}
            disabled={updateEventMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Hủy
          </Button>
          <Button
            type="submit"
            form="event-edit-form"
            disabled={updateEventMutation.isPending || !form.formState.isDirty}
            className="bg-primary hover:bg-primary/90"
          >
            {updateEventMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu Thay Đổi{' '}
            {fetchedEventData.trangThaiSK.maTrangThai ===
              MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK && '& Gửi Lại Duyệt'}
          </Button>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="event-edit-form"
            className="space-y-8"
          >
            {/* Card Thông tin chung */}
            <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FilePenLine className="text-primary dark:text-ptit-blue" />
                  Thông Tin Chung
                </CardTitle>
                <CardDescription>
                  Cập nhật các thông tin cơ bản của sự kiện.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="tenSK"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên sự kiện <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sự kiện" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loaiSuKienID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại sự kiện <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={isLoadingLoaiSK}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingLoaiSK
                                  ? 'Đang tải...'
                                  : 'Chọn loại sự kiện'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(dsLoaiSK || []).map((loai) => (
                            <SelectItem
                              key={loai.loaiSuKienID}
                              value={loai.loaiSuKienID.toString()}
                            >
                              {loai.tenLoaiSK}
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
                  name="moTaChiTiet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả mục đích, nội dung chính..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card Thời gian và Quy mô */}
            <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
              <CardHeader>
                <CardTitle className="text-xl">Thời Gian & Quy Mô</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <FormField
                    control={form.control}
                    name="ngayBatDau"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Ngày bắt đầu{' '}
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarShadcn
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < addDays(new Date(), 0) &&
                                !date.toISOString().startsWith(
                                  parseISO(fetchedEventData?.tgBatDauDK || '')
                                    .toISOString()
                                    .substring(0, 10)
                                )
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
                    control={form.control}
                    name="gioBatDau"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Giờ bắt đầu{' '}
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
                    control={form.control}
                    name="ngayKetThuc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Ngày kết thúc{' '}
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarShadcn
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const start = form.getValues('ngayBatDau');
                                if (!start) return true;
                                const maxEnd = addDays(start, 5);
                                return date < start || date > maxEnd;
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
                    name="gioKetThuc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Giờ kết thúc{' '}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="slThamDuDK"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng tham dự dự kiến</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="VD: 150"
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
              </CardContent>
            </Card>

            {/* Card Đơn vị tổ chức và Chủ trì */}
            <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
              <CardHeader>
                <CardTitle className="text-xl">
                  Đơn Vị Tổ Chức & Chủ Trì
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="donViChuTriID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Đơn vị chủ trì{' '}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={isLoadingDonVi || true}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingDonVi ? 'Tải...' : 'Chọn đơn vị'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(dsDonVi?.items || []).map((dv) => (
                            <SelectItem
                              key={dv.donViID}
                              value={dv.donViID.toString()}
                            >
                              {dv.tenDonVi}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Đơn vị chủ trì thường không thể thay đổi.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <p className="text-sm font-medium text-muted-foreground">
                  Thông tin người chủ trì{' '}
                  <span className="text-destructive">*</span>
                </p>
                <FormField
                  control={form.control}
                  name="nguoiChuTriID"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Chủ trì nội bộ</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={
                                isLoadingNguoiChuTri ||
                                !!form.watch('tenChuTriNgoai')
                              }
                            >
                              {field.value
                                ? dsNguoiChuTriOptions?.find(
                                    (nd) =>
                                      nd.nguoiDungID.toString() === field.value
                                  )?.hoTen
                                : isLoadingNguoiChuTri
                                ? 'Đang tải...'
                                : 'Tìm & chọn...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Tìm theo tên, email, mã..."
                              value={searchTermNguoiChuTri}
                              onValueChange={setSearchTermNguoiChuTri}
                            />
                            <CommandList>
                              {isLoadingNguoiChuTri && (
                                <CommandItem disabled>Đang tải...</CommandItem>
                              )}
                              <CommandEmpty>
                                {!isLoadingNguoiChuTri && 'Không tìm thấy.'}
                              </CommandEmpty>
                              <CommandGroup>
                                {(dsNguoiChuTriOptions || []).map((nd) => (
                                  <CommandItem
                                    value={nd.hoTen}
                                    key={nd.nguoiDungID}
                                    onSelect={() => {
                                      form.setValue(
                                        'nguoiChuTriID',
                                        nd.nguoiDungID.toString()
                                      );
                                      form.setValue('tenChuTriNgoai', '');
                                      form.setValue('donViChuTriNgoai', '');
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        nd.nguoiDungID.toString() ===
                                          field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {nd.hoTen} ({nd.email})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-center my-2 text-xs text-muted-foreground">
                  HOẶC
                </div>
                <FormField
                  control={form.control}
                  name="tenChuTriNgoai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên chủ trì ngoài</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Ông Nguyễn Văn B"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value)
                              form.setValue('nguoiChuTriID', null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="donViChuTriNgoai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị chủ trì ngoài</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Công ty XYZ"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value)
                              form.setValue('nguoiChuTriID', null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card Thành phần tham gia và Công khai */}
            <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
              <CardHeader>
                <CardTitle className="text-xl">
                  Thành Phần & Công Khai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="cacDonViThamGiaIDs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị tham gia phối hợp</FormLabel>
                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between font-normal h-auto py-2"
                            >
                              {field.value && field.value.length > 0
                                ? `${field.value.length} đơn vị đã chọn`
                                : 'Chọn các đơn vị tham gia...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Tìm đơn vị..."
                                value={searchTermDonViThamGia}
                                onValueChange={setSearchTermDonViThamGia}
                              />
                              <CommandList>
                                {isLoadingDonViThamGia && (
                                  <CommandItem disabled>
                                    Đang tải...
                                  </CommandItem>
                                )}
                                <CommandEmpty>
                                  {!isLoadingDonViThamGia && 'Không tìm thấy.'}
                                </CommandEmpty>
                                <CommandGroup
                                  heading={`${
                                    field.value?.length || 0
                                  } đơn vị đã chọn`}
                                >
                                  <ScrollArea className="max-h-32 overflow-auto">
                                    {(
                                      dsDonViThamGiaOptions || dsDonVi
                                    )?.items.map((dv) => (
                                      <CommandItem
                                        key={dv.donViID}
                                        value={dv.tenDonVi}
                                        onSelect={() => {
                                          const currentValues =
                                            field.value || [];
                                          const newValue =
                                            currentValues.includes(
                                              dv.donViID.toString()
                                            )
                                              ? currentValues.filter(
                                                  (id) =>
                                                    id !== dv.donViID.toString()
                                                )
                                              : [
                                                  ...currentValues,
                                                  dv.donViID.toString(),
                                                ];
                                          field.onChange(newValue);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            field.value?.includes(
                                              dv.donViID.toString()
                                            )
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                        {dv.tenDonVi} (
                                        {dv.maDonVi || dv.loaiDonVi})
                                      </CommandItem>
                                    ))}
                                  </ScrollArea>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="khachMoiNgoaiGhiChu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú khách mời ngoài</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Thông tin thêm về khách mời ngoài..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isCongKhaiNoiBo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Công khai sự kiện trong Học viện?</FormLabel>
                        <FormDescription>
                          Nếu chọn, sự kiện sẽ hiển thị trên Lịch Sự Kiện chung.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {fetchedEventData.trangThaiSK.maTrangThai ===
                  MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK && (
                  <FormField
                    control={form.control}
                    name="ghiChuPhanHoiChoBGH"
                    render={({ field }) => (
                      <FormItem className="mt-6 pt-6 border-t dark:border-slate-700">
                        <FormLabel className="font-semibold text-amber-600 dark:text-amber-400">
                          Ghi chú phản hồi cho BGH (bắt buộc nếu BGH yêu cầu
                          chỉnh sửa)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Giải thích những thay đổi theo yêu cầu của BGH..."
                            className="min-h-[100px]"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Không có CardFooter ở đây vì nút submit đã ở headerActions của DashboardLayout */}
          </form>
        </Form>
      </motion.div>
    </DashboardLayout>
  );
};

export default EventsEditPage;
