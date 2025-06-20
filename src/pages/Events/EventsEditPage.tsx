import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  useForm,
  Controller,
  SubmitHandler,
  useFieldArray,
} from 'react-hook-form';
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

import {
  useManagedEventDetail, // Để lấy dữ liệu sự kiện cần sửa
  useUpdateEvent, // Để cập nhật sự kiện
} from '@/hooks/queries/eventQueries';
import {
  UpdateSuKienPayload,
  SuKienDetailResponse, // SuKienDetailResponse giờ dùng để fill form
} from '@/services/event.service';
import MaVaiTro from '@/enums/MaVaiTro.enum.js';
import MaTrangThaiSK from '@/enums/MaTrangThaiSK.enum.js';

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
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { EVENT_QUERY_KEYS } from '@/hooks/queries/eventQueries';
import { useDonViList } from '@/hooks/queries/donViQueries';
import { useLoaiSuKienList } from '@/hooks/queries/loaiSuKienQueries';
import { useNguoiDungListForSelect } from '@/hooks/queries/nguoiDungQueries';

// --- Zod Schema for Edit Event Form (Tương tự Create, nhưng có thể một số trường không cho sửa) ---
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
    }), // Có thể không cho sửa
    nguoiChuTriID: z.string().optional().nullable(),
    tenChuTriNgoai: z.string().max(150).optional().nullable(),
    donViChuTriNgoai: z.string().max(200).optional().nullable(),
    cacDonViThamGiaIDs: z.array(z.string()).optional().default([]),
    khachMoiNgoaiGhiChu: z.string().optional().nullable(),
    isCongKhaiNoiBo: z.boolean().default(false),
    // Thêm trường này nếu muốn CBTC gửi ghi chú khi sửa theo yêu cầu của BGH
    ghiChuPhanHoiChoBGH: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Ràng buộc thời gian: ngày bắt đầu + giờ bắt đầu phải trước ngày kết thúc + giờ kết thúc
      if (
        !data.ngayBatDau ||
        !data.gioBatDau ||
        !data.ngayKetThuc ||
        !data.gioKetThuc
      ) {
        return true; // Để các lỗi required khác xử lý
      }
      const [hB, mB] = data.gioBatDau.split(':').map(Number);
      const [hK, mK] = data.gioKetThuc.split(':').map(Number);
      const start = setMilliseconds(
        setSeconds(setMinutes(setHours(data.ngayBatDau, hB), mB), 0),
        0
      );
      const end = setMilliseconds(
        setSeconds(setMinutes(setHours(data.ngayKetThuc, hK), mK), 0),
        0
      );
      return isBefore(start, end);
    },
    {
      message: 'Thời gian bắt đầu phải trước thời gian kết thúc.',
      path: ['ngayKetThuc'],
    }
  )
  .refine((data) => !!data.nguoiChuTriID || !!data.tenChuTriNgoai, {
    message: 'Phải chọn người chủ trì nội bộ hoặc nhập tên chủ trì ngoài.',
    path: ['nguoiChuTriID'],
  });

type EditEventFormValues = z.infer<typeof editEventFormSchema>;

const EventsEditPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { can } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch chi tiết sự kiện để điền vào form
  const {
    data: eventToEditData,
    isLoading: isLoadingEventDetail,
    isError: isErrorLoadingEvent,
    refetch: refetchEventDetail,
  } = useManagedEventDetail(eventId);

  useEffect(() => {
    if (eventToEditData) {
      // Kiểm tra quyền sửa ở đây sau khi có dữ liệu
      const canEditThisEvent = can('edit', 'SuKien', {
        nguoiTaoID: eventToEditData?.nguoiTao?.nguoiDungID,
        maTrangThaiSK: eventToEditData?.trangThaiSK?.maTrangThai,
      });
      if (!canEditThisEvent) {
        toast.error(
          'Bạn không có quyền sửa sự kiện này hoặc sự kiện không ở trạng thái cho phép sửa.'
        );
        navigate('/events', { replace: true });
        return;
      }
      // Điền dữ liệu vào form
      form.reset({
        tenSK: eventToEditData.tenSK,
        loaiSuKienID:
          eventToEditData.loaiSuKien?.loaiSuKienID?.toString() || undefined, //   loaiSuKienID trong SuKienDetailResponse
        moTaChiTiet: eventToEditData.moTaChiTiet || '',
        ngayBatDau: eventToEditData.tgBatDauDK
          ? parseISO(eventToEditData.tgBatDauDK)
          : undefined,
        gioBatDau: eventToEditData.tgBatDauDK
          ? format(parseISO(eventToEditData.tgBatDauDK), 'HH:mm')
          : '08:00',
        ngayKetThuc: eventToEditData.tgKetThucDK
          ? parseISO(eventToEditData.tgKetThucDK)
          : undefined,
        gioKetThuc: eventToEditData.tgKetThucDK
          ? format(parseISO(eventToEditData.tgKetThucDK), 'HH:mm')
          : '17:00',
        slThamDuDK: eventToEditData.slThamDuDK ?? undefined,
        donViChuTriID: eventToEditData.donViChuTri.donViID.toString(),
        nguoiChuTriID:
          eventToEditData.nguoiChuTri?.nguoiDungID?.toString() || undefined,
        tenChuTriNgoai: eventToEditData.tenChuTriNgoai || '',
        donViChuTriNgoai: eventToEditData.donViChuTriNgoai || '',
        cacDonViThamGiaIDs:
          eventToEditData.donViThamGia?.map((dv) => dv.donViID.toString()) ||
          [],
        khachMoiNgoaiGhiChu: eventToEditData.khachMoiNgoaiGhiChu || '',
        isCongKhaiNoiBo: eventToEditData.isCongKhaiNoiBo || false,
        ghiChuPhanHoiChoBGH: '', // Reset trường này
      });
      setInitialLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventToEditData]);

  useEffect(() => {
    if (isErrorLoadingEvent) {
      toast.error('Không tìm thấy sự kiện hoặc có lỗi khi tải dữ liệu.');
      navigate('/events', { replace: true });
      setInitialLoading(false);
    }
  }, [isErrorLoadingEvent, navigate]);

  const updateEventMutation = useUpdateEvent({
    onSuccess: () => {
      refetchEventDetail(); // Làm mới dữ liệu sự kiện sau khi cập nhật
      navigate(`/events`);
    },
  });

  // Data cho Selects (tương tự trang EventsNew)
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList({
    limit: 100,
  });
  const { data: dsLoaiSK, isLoading: isLoadingLoaiSK } = useLoaiSuKienList({
    isActive: true,
    limit: 100,
  });
  const [searchTermNguoiChuTri, setSearchTermNguoiChuTri] = useState('');
  const debouncedSearchNguoiChuTri = useDebounce(searchTermNguoiChuTri, 300);
  const { data: dsNguoiChuTri, isLoading: isLoadingNguoiChuTri } =
    useNguoiDungListForSelect({
      searchTerm: debouncedSearchNguoiChuTri,
      maVaiTro: `${MaVaiTro.BGH_DUYET_SK_TRUONG},GIANG_VIEN`,
      limit: 10,
    });
  const [searchTermDonViThamGia, setSearchTermDonViThamGia] = useState('');
  const debouncedSearchDonViThamGia = useDebounce(searchTermDonViThamGia, 300);
  const { data: dsDonViThamGiaOptions, isLoading: isLoadingDonViThamGia } =
    useDonViList({ searchTerm: debouncedSearchDonViThamGia, limit: 10 });
  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventFormSchema),
    // defaultValues sẽ được set trong useEffect sau khi eventToEditData có
  });

  const onSubmit: SubmitHandler<EditEventFormValues> = (data) => {
    if (!eventId) return;

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
      loaiSuKienID: data.loaiSuKienID
        ? parseInt(data.loaiSuKienID, 10)
        : undefined,
      donViChuTriID: data.donViChuTriID
        ? parseInt(data.donViChuTriID, 10)
        : undefined, // Convert to number
      nguoiChuTriID: data.nguoiChuTriID
        ? parseInt(data.nguoiChuTriID, 10)
        : undefined,
      cacDonViThamGiaIDs: data.cacDonViThamGiaIDs?.map((idStr) =>
        parseInt(idStr, 10)
      ),
      slThamDuDK: data.slThamDuDK ? Number(data.slThamDuDK) : undefined,
    };
    // Nếu sự kiện đang ở trạng thái BGH YC Chỉnh Sửa, có thể gửi kèm ghi chú phản hồi
    if (
      eventToEditData?.trangThaiSK.maTrangThai ===
      MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK
    ) {
      payload.ghiChuPhanHoiChoBGH = data.ghiChuPhanHoiChoBGH || null;
    }

    updateEventMutation.mutate({ id: eventId, payload });
  };

  if (initialLoading || isLoadingEventDetail) {
    return (
      <DashboardLayout pageTitle="Đang tải thông tin sự kiện...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isErrorLoadingEvent || !eventToEditData) {
    return (
      <DashboardLayout pageTitle="Lỗi">
        <div className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />{' '}
          <p className="mt-4">
            Không thể tải thông tin sự kiện hoặc sự kiện không tồn tại.
          </p>
          <Button onClick={() => navigate('/events')} className="mt-4">
            Quay lại Danh sách
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Kiểm tra quyền sau khi đã có eventToEditData
  const canEditThisEvent = can('edit', 'SuKien', {
    nguoiTaoID: eventToEditData.nguoiTao.nguoiDungID,
    maTrangThaiSK: eventToEditData.trangThaiSK.maTrangThai,
  });
  if (!canEditThisEvent) {
    // navigate('/events', {replace: true}); // Đã xử lý trong onSuccess/onError của useManagedEventDetail
    // return null; // Hoặc hiển thị thông báo không có quyền ngay tại đây
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Không thể chỉnh sửa</h2>
          <p className="text-muted-foreground mb-6">
            Bạn không có quyền sửa sự kiện này hoặc sự kiện không ở trạng thái
            cho phép chỉnh sửa.
          </p>
          <Button onClick={() => navigate('/events')}>
            Quay lại Danh sách
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle={`Chỉnh Sửa Sự Kiện: ${eventToEditData?.tenSK || ''}`}
      headerActions={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={updateEventMutation.isPending}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="event-edit-form"
            disabled={updateEventMutation.isPending}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            {updateEventMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu Thay Đổi
          </Button>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="event-edit-form"
            className="space-y-8"
          >
            {/* Card Thông tin chung */}
            <Card className="shadow-lg dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FilePenLine className="text-primary dark:text-ptit-red" />
                  Thông tin chung
                </CardTitle>
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
                      <FormDescription>
                        Tên sự kiện phải có ít nhất 5 ký tự.
                      </FormDescription>
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
                          {dsLoaiSK?.map((loai) => (
                            <SelectItem
                              key={loai.loaiSuKienID}
                              value={loai.loaiSuKienID.toString()}
                            >
                              {loai.tenLoaiSK}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Chọn loại sự kiện phù hợp.
                      </FormDescription>
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
                          placeholder="Nhập mô tả chi tiết ( )"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Thông tin mô tả thêm về sự kiện (không bắt buộc).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Card Thời gian và Quy mô */}
            <Card className="shadow-lg dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl">Thời gian và Quy mô</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ngayBatDau"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Ngày bắt đầu{' '}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? formatISO(field.value, {
                                    representation: 'date',
                                  })
                                : ''
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseISO(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
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
                          <Input
                            type="time"
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
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
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? formatISO(field.value, {
                                    representation: 'date',
                                  })
                                : ''
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseISO(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
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
                          <Input
                            type="time"
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slThamDuDK"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng tham dự dự kiến</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Nhập số lượng"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Không bắt buộc, chỉ nhập dự kiến số lượng.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card Đơn vị tổ chức và Chủ trì */}
            <Card className="shadow-lg dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl">
                  Đơn vị tổ chức và Chủ trì
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
                        disabled={
                          isLoadingDonVi ||
                          true /* Thường không cho sửa đơn vị chủ trì */
                        }
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
                          {dsDonVi?.items?.map((dv) => (
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
                        Đơn vị chịu trách nhiệm chính cho sự kiện này. Thường
                        không thể thay đổi sau khi tạo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Người chủ trì nội bộ (select) */}
                <FormField
                  control={form.control}
                  name="nguoiChuTriID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người chủ trì nội bộ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={isLoadingNguoiChuTri}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingNguoiChuTri
                                  ? 'Đang tải...'
                                  : 'Chọn người chủ trì nội bộ'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="px-2 py-1">
                            <Input
                              placeholder="Tìm kiếm người dùng..."
                              value={searchTermNguoiChuTri}
                              onChange={(e) =>
                                setSearchTermNguoiChuTri(e.target.value)
                              }
                              className="mb-2"
                            />
                          </div>
                          {dsNguoiChuTri?.length === 0 && (
                            <div className="px-2 py-1 text-muted-foreground">
                              Không tìm thấy người dùng phù hợp.
                            </div>
                          )}
                          {dsNguoiChuTri?.map((nguoi) => (
                            <SelectItem
                              key={nguoi.nguoiDungID}
                              value={nguoi.nguoiDungID.toString()}
                            >
                              {nguoi.hoTen} ({nguoi.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Chọn người chủ trì nội bộ ( ).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hoặc nhập thông tin chủ trì ngoài */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tenChuTriNgoai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên chủ trì ngoài</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên chủ trì ngoài (nếu không chọn nội bộ)"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Nếu không chọn người chủ trì nội bộ, hãy nhập tên chủ
                          trì ngoài.
                        </FormDescription>
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
                            placeholder="Nhập đơn vị chủ trì ngoài ( )"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Đơn vị công tác của chủ trì ngoài (không bắt buộc).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card Thành phần tham gia và Công khai */}
            <Card className="shadow-lg dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl">
                  Thành phần tham gia và Công khai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Đơn vị tham gia (MultiSelect) */}
                <FormField
                  control={form.control}
                  name="cacDonViThamGiaIDs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị tham gia</FormLabel>
                      <div>
                        <div className="px-2 py-1">
                          <Input
                            placeholder="Tìm kiếm đơn vị..."
                            value={searchTermDonViThamGia}
                            onChange={(e) =>
                              setSearchTermDonViThamGia(e.target.value)
                            }
                            className="mb-2"
                          />
                        </div>
                        <ScrollArea className="max-h-40 border rounded overflow-y-auto">
                          {dsDonViThamGiaOptions?.items?.length === 0 && (
                            <div className="px-2 py-1 text-muted-foreground">
                              Không tìm thấy đơn vị phù hợp.
                            </div>
                          )}
                          {dsDonViThamGiaOptions?.items?.map((dv) => (
                            <div
                              key={dv.donViID}
                              className="flex items-center px-2 py-1"
                            >
                              <Checkbox
                                id={`dvthamgia-${dv.donViID}`}
                                checked={field.value?.includes(
                                  dv.donViID.toString()
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([
                                      ...(field.value || []),
                                      dv.donViID.toString(),
                                    ]);
                                  } else {
                                    field.onChange(
                                      (field.value || []).filter(
                                        (id) => id !== dv.donViID.toString()
                                      )
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`dvthamgia-${dv.donViID}`}
                                className="ml-2 cursor-pointer"
                              >
                                {dv.tenDonVi}
                              </Label>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                      <FormDescription>
                        Chọn các đơn vị sẽ tham gia sự kiện ( ).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ghi chú khách mời ngoài */}
                <FormField
                  control={form.control}
                  name="khachMoiNgoaiGhiChu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú khách mời ngoài</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập ghi chú về khách mời ngoài ( )"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Thông tin thêm về khách mời ngoài (không bắt buộc).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Công khai nội bộ */}
                <FormField
                  control={form.control}
                  name="isCongKhaiNoiBo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="mb-0">Công khai nội bộ</FormLabel>
                      <FormDescription>
                        Đánh dấu nếu sự kiện này chỉ công khai trong nội bộ
                        trường.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Nếu sự kiện đang ở trạng thái BGH YC Chỉnh Sửa, hiển thị ô ghi chú phản hồi */}
                {eventToEditData?.trangThaiSK.maTrangThai ===
                  MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK && (
                  <FormField
                    control={form.control}
                    name="ghiChuPhanHoiChoBGH"
                    render={({ field }) => (
                      <FormItem className="mt-6 pt-6 border-t dark:border-slate-700">
                        <FormLabel className="font-semibold text-amber-600 dark:text-amber-400">
                          Ghi chú phản hồi cho BGH (sau khi chỉnh sửa)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Giải thích ngắn gọn những thay đổi đã thực hiện theo yêu cầu của BGH..."
                            className="min-h-[80px]"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Ghi chú này sẽ được gửi kèm khi bạn lưu thay đổi và sự
                          kiện được gửi lại để BGH duyệt.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={updateEventMutation.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={
                  updateEventMutation.isPending || !form.formState.isDirty
                }
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {updateEventMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu Thay Đổi
                {eventToEditData?.trangThaiSK.maTrangThai ===
                  MaTrangThaiSK.BGH_YEU_CAU_CHINH_SUA_SK && ' & Gửi Lại Duyệt'}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </DashboardLayout>
  );
};

export default EventsEditPage;
