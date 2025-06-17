import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Thêm Checkbox
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import {
  CalendarIcon,
  Check,
  Users,
  FileText,
  Building,
  User,
  Info,
  PlusCircle,
  Trash2,
  ChevronsUpDown,
  Loader2,
  Save,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { DateRange } from 'react-day-picker';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateEvent } from '@/hooks/queries/eventQueries';
import { useDonViList } from '@/hooks/queries/donViQueries';
import { useLoaiSuKienList } from '@/hooks/queries/loaiSuKienQueries';
import MaVaiTro from '@/enums/maVaiTro.enum';
import { useNguoiDungListForSelect } from '@/hooks/queries/nguoiDungQueries';
import { CreateSuKienPayload } from '@/services/event.service';
import { motion } from 'framer-motion';
// --- Zod Schema for Validation ---
const eventFormSchema = z
  .object({
    tenSK: z
      .string()
      .min(5, { message: 'Tên sự kiện phải có ít nhất 5 ký tự.' })
      .max(300, { message: 'Tên sự kiện không quá 300 ký tự.' }),
    loaiSuKienID: z
      .string()
      .refine((val) => val !== '', { message: 'Vui lòng chọn loại sự kiện.' }), // Sửa thành string vì Select trả về string
    moTaChiTiet: z.string().optional().nullable(),

    // Thời gian
    ngayBatDau: z.date({ required_error: 'Vui lòng chọn ngày bắt đầu.' }),
    gioBatDau: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Giờ bắt đầu không hợp lệ (HH:mm).',
    }),
    ngayKetThuc: z.date({ required_error: 'Vui lòng chọn ngày kết thúc.' }),
    gioKetThuc: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Giờ kết thúc không hợp lệ (HH:mm).',
    }),

    slThamDuDK: z.coerce
      .number()
      .int()
      .positive({ message: 'Số lượng phải là số dương.' })
      .optional()
      .nullable(),

    donViChuTriID: z.string().refine((val) => val !== '', {
      message: 'Vui lòng chọn đơn vị chủ trì.',
    }), // Sửa thành string

    // Người chủ trì (một trong hai phải có, hoặc cả hai nếu nghiệp vụ cho phép)
    nguoiChuTriID: z.string().optional().nullable(), // Sửa thành string
    tenChuTriNgoai: z.string().max(150, 'Tên quá dài').optional().nullable(),
    donViChuTriNgoai: z
      .string()
      .max(200, 'Tên đơn vị quá dài')
      .optional()
      .nullable(),

    cacDonViThamGiaIDs: z.array(z.string()).optional(), // Mảng các DonViID (dưới dạng string từ Select)
    khachMoiNgoaiGhiChu: z.string().optional().nullable(),
    isCongKhaiNoiBo: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Ràng buộc tgKetThucDK >= tgBatDauDK
      if (
        data.ngayBatDau &&
        data.gioBatDau &&
        data.ngayKetThuc &&
        data.gioKetThuc
      ) {
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
        return !isBefore(tgKetThucDK, tgBatDauDK);
      }
      return true;
    },
    {
      message: 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.',
      path: ['ngayKetThuc'], // Hoặc path: ["gioKetThuc"]
    }
  )
  .refine(
    (data) => {
      // Ràng buộc người chủ trì
      return !!data.nguoiChuTriID || !!data.tenChuTriNgoai;
    },
    {
      message:
        'Vui lòng cung cấp thông tin Người chủ trì (nội bộ hoặc bên ngoài).',
      path: ['nguoiChuTriID'], // Gán lỗi cho một trong hai trường
    }
  )
  .superRefine((data, ctx) => {
    // Nếu có tenChuTriNgoai hoặc donViChuTriNgoai thì phải có cả hai
    if (
      (data.tenChuTriNgoai && !data.donViChuTriNgoai) ||
      (!data.tenChuTriNgoai && data.donViChuTriNgoai)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Nếu nhập tên chủ trì ngoài thì phải nhập cả đơn vị chủ trì ngoài (và ngược lại).',
        path: ['donViChuTriNgoai'],
      });
    }
    // Không được phép có cả nguoiChuTriID và tenChuTriNgoai/donViChuTriNgoai
    if (
      (data.nguoiChuTriID && (data.tenChuTriNgoai || data.donViChuTriNgoai)) ||
      (!data.nguoiChuTriID && !data.tenChuTriNgoai && !data.donViChuTriNgoai)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Chỉ được chọn 1 trong 2: Người chủ trì nội bộ hoặc nhập thông tin chủ trì ngoài.',
        path: ['nguoiChuTriID'],
      });
    }
  });

type EventFormValues = z.infer<typeof eventFormSchema>;

const EventsNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  // --- Fetch data for Selects ---
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList({
    limit: 100,
  }); // Lấy nhiều để chọn

  console.log('dsDonVi', dsDonVi);
  const { data: dsLoaiSK, isLoading: isLoadingLoaiSK } = useLoaiSuKienList({
    isActive: true,
    limit: 100,
  });

  // Tìm DonViID mặc định cho CB_TO_CHUC_SU_KIEN
  const getDefaultDonViChuTriID = (): string | undefined => {
    if (user && user.vaiTroChucNang) {
      const cbtcRoleAssignment = user.vaiTroChucNang.find(
        (roleAssignment) =>
          roleAssignment.maVaiTro === MaVaiTro.CB_TO_CHUC_SU_KIEN &&
          roleAssignment.donViThucThi
      );
      return cbtcRoleAssignment?.donViThucThi?.donViID?.toString();
    }
    return undefined;
  };
  const defaultDonViChuTri = getDefaultDonViChuTriID();
  // State cho tìm kiếm người chủ trì (Giảng viên/Cán bộ)
  const [searchTermNguoiChuTri, setSearchTermNguoiChuTri] = useState('');
  const debouncedSearchNguoiChuTri = useDebounce(searchTermNguoiChuTri, 300);
  const { data: dsNguoiChuTri, isLoading: isLoadingNguoiChuTri } =
    useNguoiDungListForSelect(
      {
        searchTerm: debouncedSearchNguoiChuTri,
        maVaiTro: `${MaVaiTro.TRUONG_KHOA},${MaVaiTro.BGH_DUYET_SK_TRUONG},GIANG_VIEN`,
        limit: 10,
      }, // Lấy GV, TK, BGH
      {
        enabled:
          debouncedSearchNguoiChuTri.length > 1 ||
          searchTermNguoiChuTri.length === 0,
      } // Fetch khi có từ khóa hoặc fetch tất cả ban đầu
    );

  // State cho tìm kiếm đơn vị tham gia
  const [searchTermDonViThamGia, setSearchTermDonViThamGia] = useState('');
  const debouncedSearchDonViThamGia = useDebounce(searchTermDonViThamGia, 300);
  const { data: dsDonViThamGiaOptions, isLoading: isLoadingDonViThamGia } =
    useDonViList(
      { searchTerm: debouncedSearchDonViThamGia, limit: 10 },
      { enabled: debouncedSearchDonViThamGia.length > 0 }
    );

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      tenSK: '',
      loaiSuKienID: undefined,
      moTaChiTiet: '',
      gioBatDau: '08:00',
      gioKetThuc: '17:00',
      slThamDuDK: undefined,
      donViChuTriID: defaultDonViChuTri || undefined, // Sử dụng giá trị đã tìm được
      nguoiChuTriID: undefined,
      tenChuTriNgoai: '',
      donViChuTriNgoai: '',
      cacDonViThamGiaIDs: [],
      khachMoiNgoaiGhiChu: '',
      isCongKhaiNoiBo: true,
    },
  });
  useEffect(() => {
    // Set đơn vị chủ trì mặc định nếu chưa có và user đã load
    if (user && !form.getValues('donViChuTriID')) {
      const foundDefaultDonViId = getDefaultDonViChuTriID();
      if (foundDefaultDonViId) {
        form.setValue('donViChuTriID', foundDefaultDonViId);
      }
    }

    // Đặt ngày bắt đầu mặc định là ngày mai
    const tomorrow = addDays(new Date(), 1);
    if (!form.getValues('ngayBatDau')) {
      // Chỉ đặt nếu chưa có giá trị
      form.setValue('ngayBatDau', tomorrow);
    }
    if (!form.getValues('ngayKetThuc')) {
      // Chỉ đặt nếu chưa có giá trị
      form.setValue('ngayKetThuc', tomorrow);
    }
  }, [user, form, defaultDonViChuTri]); // Thêm defaultDonViChuTri vào dependency array

  const onSubmit = async (data: EventFormValues) => {
    const { ngayBatDau, gioBatDau, ngayKetThuc, gioKetThuc, ...restOfData } =
      data;
    // Kiểm tra lại xem donViChuTriID có giá trị không, nếu không thì báo lỗi
    if (!data.donViChuTriID) {
      toast.error('Không thể xác định đơn vị chủ trì. Vui lòng chọn lại.');
      form.setError('donViChuTriID', {
        type: 'manual',
        message: 'Vui lòng chọn đơn vị chủ trì.',
      });
      return;
    }
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
    // Xử lý loại bỏ các trường không hợp lệ trước khi gửi payload
    let nguoiChuTriID = data.nguoiChuTriID;
    let tenChuTriNgoai = data.tenChuTriNgoai;
    let donViChuTriNgoai = data.donViChuTriNgoai;
    // Nếu có nguoiChuTriID thì xóa luôn tenChuTriNgoai và donViChuTriNgoai
    if (nguoiChuTriID) {
      tenChuTriNgoai = undefined;
      donViChuTriNgoai = undefined;
    }
    // Nếu có tenChuTriNgoai hoặc donViChuTriNgoai thì xóa luôn nguoiChuTriID
    if (tenChuTriNgoai || donViChuTriNgoai) {
      nguoiChuTriID = undefined;
      // Nếu 1 trong 2 bị rỗng thì xóa cả hai
      if (!tenChuTriNgoai || !donViChuTriNgoai) {
        tenChuTriNgoai = undefined;
        donViChuTriNgoai = undefined;
      }
    }
    const payload: CreateSuKienPayload = {
      tenSK: data.tenSK,
      tgBatDauDK: formatISO(tgBatDauDKFull),
      tgKetThucDK: formatISO(tgKetThucDKFull),
      loaiSuKienID: data.loaiSuKienID
        ? parseInt(data.loaiSuKienID, 10)
        : undefined,
      donViChuTriID: parseInt(data.donViChuTriID, 10),
      nguoiChuTriID: nguoiChuTriID ? parseInt(nguoiChuTriID, 10) : undefined,
      moTaChiTiet: data.moTaChiTiet ?? undefined,
      tenChuTriNgoai: tenChuTriNgoai ?? undefined,
      donViChuTriNgoai: donViChuTriNgoai ?? undefined,
      cacDonViThamGiaIDs: data.cacDonViThamGiaIDs?.map((idStr) =>
        parseInt(idStr, 10)
      ),
      khachMoiNgoaiGhiChu: data.khachMoiNgoaiGhiChu ?? undefined,
      slThamDuDK: data.slThamDuDK ? Number(data.slThamDuDK) : undefined,
      isCongKhaiNoiBo: data.isCongKhaiNoiBo,
    };
    await createEventMutation.mutateAsync(payload);
  };

  return (
    <DashboardLayout
      pageTitle="Tạo Yêu Cầu Sự Kiện Mới"
      headerActions={
        <Button
          type="submit"
          form="event-new-form"
          disabled={createEventMutation.isPending}
        >
          {createEventMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Gửi Yêu Cầu
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-6xl mx-auto"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            id="event-new-form"
            className="space-y-8"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Thông tin chung về sự kiện
                </CardTitle>
                <CardDescription>
                  Cung cấp các thông tin cơ bản và quan trọng nhất cho sự kiện
                  của bạn.
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
                        <Input
                          placeholder="VD: Hội thảo Khoa học Quốc tế ABC 2025"
                          {...field}
                        />
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
                        defaultValue={field.value}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moTaChiTiet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả chi tiết sự kiện</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả mục đích, nội dung chính, đối tượng tham gia, các hoạt động dự kiến..."
                          className="min-h-[120px]"
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

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Thời gian và Quy mô</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ngayBatDau"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
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
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() ||
                                date < new Date('1900-01-01')
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ngayKetThuc"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
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
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date <
                                  (form.getValues('ngayBatDau') ||
                                    new Date()) || date < new Date('1900-01-01')
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
            <Card className="shadow-lg">
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
                        value={field.value || ''} // Đảm bảo value không phải undefined cho Select
                        disabled={isLoadingDonVi} // Disable nếu đã có đơn vị mặc định theo vai trò
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingDonVi ? 'Đang tải...' : 'Chọn đơn vị'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dsDonVi?.items.map((dv) => (
                            <SelectItem
                              key={dv.donViID}
                              value={dv?.donViID?.toString()}
                            >
                              {dv.tenDonVi} ({dv.maDonVi || dv.loaiDonVi})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!!defaultDonViChuTri && (
                        <FormDescription>
                          Đơn vị chủ trì được xác định theo vai trò của bạn.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <p className="text-sm font-medium">
                  Thông tin người chủ trì sự kiện{' '}
                  <span className="text-destructive">*</span>
                </p>
                <FormField
                  control={form.control}
                  name="nguoiChuTriID"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Người chủ trì (trong trường)</FormLabel>
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
                              disabled={isLoadingNguoiChuTri}
                            >
                              {field.value
                                ? dsNguoiChuTri?.find(
                                    (nd) =>
                                      nd?.nguoiDungID?.toString() ===
                                      field.value
                                  )?.hoTen
                                : isLoadingNguoiChuTri
                                ? 'Đang tải...'
                                : 'Tìm & chọn người chủ trì...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0">
                          <Command shouldFilter={false}>
                            {' '}
                            {/* Tự quản lý search term */}
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
                                {dsNguoiChuTri?.map((nd) => (
                                  <CommandItem
                                    value={nd.hoTen} // Giá trị để Command tìm kiếm nội bộ (nếu shouldFilter=true)
                                    key={nd.nguoiDungID}
                                    onSelect={() => {
                                      form.setValue(
                                        'nguoiChuTriID',
                                        nd.nguoiDungID.toString()
                                      );
                                      form.setValue('tenChuTriNgoai', ''); // Clear trường ngoài nếu chọn nội bộ
                                      form.setValue('donViChuTriNgoai', '');
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        nd?.nguoiDungID?.toString() ===
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
                      <FormDescription>
                        Nếu người chủ trì thuộc Học viện.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-center my-2 text-sm text-muted-foreground">
                  HOẶC
                </div>
                <FormField
                  control={form.control}
                  name="tenChuTriNgoai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người chủ trì (ngoài Học viện)</FormLabel>
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
                      <FormLabel>
                        Đơn vị người chủ trì (ngoài Học viện)
                      </FormLabel>
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

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  Thành phần tham gia và Công khai
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="cacDonViThamGiaIDs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Các đơn vị được chỉ định tham gia</FormLabel>
                      {/* Sử dụng một component MultiSelect tùy chỉnh hoặc Combobox với multiple selection */}
                      {/* Ví dụ đơn giản dùng nhiều Select (không tối ưu UX lắm cho nhiều lựa chọn) */}
                      {/* Hoặc một component tìm kiếm và thêm vào danh sách */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {field.value && field.value.length > 0
                                ? field.value
                                    .map(
                                      (id) =>
                                        dsDonVi?.items.find(
                                          (dv) => dv.donViID.toString() === id
                                        )?.tenDonVi
                                    )
                                    .filter(Boolean)
                                    .join(', ')
                                : 'Chọn các đơn vị tham gia'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
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
                                <CommandItem disabled>Đang tải...</CommandItem>
                              )}
                              <CommandEmpty>
                                {!isLoadingDonViThamGia && 'Không tìm thấy.'}
                              </CommandEmpty>
                              <CommandGroup>
                                {(dsDonViThamGiaOptions || dsDonVi)?.items.map(
                                  (
                                    dv // Ưu tiên dsDonViThamGiaOptions   search term
                                  ) => (
                                    <CommandItem
                                      key={dv.donViID}
                                      value={dv.tenDonVi}
                                      onSelect={() => {
                                        const currentValues = field.value || [];
                                        const newValue = currentValues.includes(
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
                                            dv?.donViID?.toString()
                                          )
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {dv.tenDonVi} ({dv.maDonVi})
                                    </CommandItem>
                                  )
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Chọn các Khoa, Phòng, Ban, CLB... được chỉ định tham gia
                        ( ).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="khachMoiNgoaiGhiChu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú về khách mời ngoài Học viện</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liệt kê các khách mời quan trọng từ bên ngoài ( ), vai trò của họ..."
                          className="min-h-[100px]"
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Công khai sự kiện trong Học viện?</FormLabel>
                        <FormDescription>
                          Nếu chọn, sự kiện (sau khi được duyệt) sẽ hiển thị
                          trên Lịch Sự Kiện Trường cho tất cả người dùng nội bộ.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
                >
                  Hủy bỏ
                </Button>
                <Button type="submit" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Gửi Yêu Cầu Duyệt
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </motion.div>
    </DashboardLayout>
  );
};

export default EventsNew;
