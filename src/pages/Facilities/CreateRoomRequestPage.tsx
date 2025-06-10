// src/pages/Facilities/CreateRoomRequestPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Thêm useSearchParams
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
  isValid,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'; // Bỏ Controller nếu không dùng trực tiếp
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarShadcn } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';

import { useCreateRoomRequest } from '@/hooks/queries/roomRequestQueries';
import {
  useSuKienListForSelection,
  EVENT_QUERY_KEYS,
} from '@/hooks/queries/eventQueries';
import { useLoaiPhongList } from '@/hooks/queries/danhMucQueries';

import { APIError } from '@/services/apiHelper';
import { CreateYeuCauMuonPhongPayload } from '@/services/roomRequest.service'; // Đảm bảo đường dẫn đúng

import {
  Loader2,
  CalendarIcon,
  MinusCircle,
  Send,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Helper Functions ---
const formatDate = (
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
    .min(1, 'Sức chứa phải lớn hơn 0.')
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
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ trả không hợp lệ (HH:mm).'), // Sửa regex giờ trả
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
        if (!chiTiet.ngayMuon || !chiTiet.ngayTra) return false; // NgayMuon/NgayTra can be undefined if not selected yet
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
      path: ['chiTietYeuCau'],
    }
  );

type CreateRoomRequestFormValues = z.infer<typeof createRoomRequestSchema>;

const CreateRoomRequestPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const eventIdFromQuery = searchParams.get('eventId');

  const [isSuKienSelectDisabled, setIsSuKienSelectDisabled] = useState(
    !!eventIdFromQuery
  );

  const defaultChiTietYeuCauValue = useMemo(
    () => ({
      slPhongNhomNay: 1,
      gioMuon: '08:00',
      gioTra: '17:00',
      ngayMuon: addDays(new Date(), 1),
      ngayTra: addDays(new Date(), 1),
      moTaNhomPhong: '',
      loaiPhongYcID: null,
      sucChuaYc: null,
      thietBiThemYc: '', // null cho optional fields
    }),
    []
  );

  const formCreate = useForm<CreateRoomRequestFormValues>({
    resolver: zodResolver(createRoomRequestSchema),
    defaultValues: {
      suKienID: eventIdFromQuery || '', // Set suKienID từ query
      ghiChuChungYc: '',
      chiTietYeuCau: [defaultChiTietYeuCauValue],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: formCreate.control,
    name: 'chiTietYeuCau',
  });

  const { data: dsSuKienForSelect, isLoading: isLoadingSuKienSelect } =
    useSuKienListForSelection({
      coTheTaoYeuCauPhongMoi: true,
      limit: 100,
      sortBy: 'TenSK',
      sortOrder: 'asc',
    });

  console.log('dsSuKienForSelect:', dsSuKienForSelect);

  const { data: dsLoaiPhong, isLoading: isLoadingLoaiPhong } = useLoaiPhongList(
    { limit: 100 }
  );

  // Effect để set suKienID từ query param
  useEffect(() => {
    if (eventIdFromQuery && dsSuKienForSelect && dsSuKienForSelect.length > 0) {
      const eventExists = dsSuKienForSelect.find(
        (sk) => sk.suKienID.toString() === eventIdFromQuery
      );
      if (eventExists) {
        if (formCreate.getValues('suKienID') !== eventIdFromQuery) {
          // Chỉ setValue nếu chưa đúng
          formCreate.setValue('suKienID', eventIdFromQuery, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
        setIsSuKienSelectDisabled(true);
      } else {
        toast.warning(
          `Sự kiện với ID ${eventIdFromQuery} không khả dụng hoặc đã có yêu cầu phòng. Vui lòng chọn sự kiện khác.`
        );
        setIsSuKienSelectDisabled(false);
        // Xóa eventId khỏi URL để người dùng có thể chọn lại
        navigate('/facilities/room-requests/new', { replace: true });
      }
    } else if (!eventIdFromQuery) {
      setIsSuKienSelectDisabled(false);
    }
  }, [eventIdFromQuery, dsSuKienForSelect, formCreate, navigate]);

  const createRequestMutation = useCreateRoomRequest({
    onSuccess: (data) => {
      toast.success('Tạo yêu cầu mượn phòng thành công!');
      formCreate.reset({
        suKienID: '',
        ghiChuChungYc: '',
        chiTietYeuCau: [defaultChiTietYeuCauValue],
      });
      if (data.suKien?.suKienID) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
        });
        queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      }
      queryClient.invalidateQueries({ queryKey: ['roomRequests'] });
      navigate('/facilities/room-requests');
    },
    onError: (error: APIError) => {
      toast.error('Tạo yêu cầu thất bại', {
        description:
          error.body?.message ||
          error.message ||
          'Có lỗi không xác định xảy ra.',
      });
    },
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
          const currentChiTiet = formCreate.getValues('chiTietYeuCau');
          if (
            (currentChiTiet.length === 1 &&
              currentChiTiet[0].ngayMuon.getTime() ===
                defaultChiTietYeuCauValue.ngayMuon.getTime()) ||
            !isSuKienSelectDisabled
          ) {
            formCreate.setValue(
              'chiTietYeuCau',
              [
                {
                  ...defaultChiTietYeuCauValue,
                  ngayMuon: startDate,
                  ngayTra: endDate,
                  gioMuon: format(startDate, 'HH:mm'),
                  gioTra: format(endDate, 'HH:mm'),
                },
              ],
              { shouldValidate: true }
            );
          }
        }
      }
    } else if (!selectedSuKienIdForForm && !eventIdFromQuery) {
      formCreate.reset({
        suKienID: '',
        ghiChuChungYc: formCreate.getValues('ghiChuChungYc'),
        chiTietYeuCau: [defaultChiTietYeuCauValue],
      });
    }
  }, [
    selectedSuKienIdForForm,
    dsSuKienForSelect,
    formCreate,
    defaultChiTietYeuCauValue,
    eventIdFromQuery,
    isSuKienSelectDisabled,
  ]);

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

  const handleCancel = () => {
    // navigate(-1) có thể không an toàn nếu người dùng vào thẳng trang này.
    // Tốt hơn là điều hướng về một trang cố định.
    navigate('/facilities/room-requests');
  };

  return (
    <DashboardLayout
      pageTitle="Tạo Yêu Cầu Mượn Phòng Mới"
      headerActions={
        <Button variant="outline" onClick={handleCancel}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Quay Lại Danh Sách
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card className="shadow-xl w-full">
          {' '}
          {/* Removed height-full */}
          <CardHeader>
            <CardTitle className="text-2xl">
              Thông Tin Yêu Cầu Mượn Phòng
            </CardTitle>
            <CardDescription>
              Điền đầy đủ thông tin chi tiết cho yêu cầu mượn phòng của bạn.
            </CardDescription>
          </CardHeader>
          <Form {...formCreate}>
            <form
              onSubmit={formCreate.handleSubmit(onSubmitCreateRequest)}
              id="createRoomRequestForm"
            >
              <CardContent className="max-h-[calc(100vh-19rem)] overflow-y-auto p-0">
                {' '}
                {/* Adjusted max-h and padding */}
                <ScrollArea className="h-full p-6">
                  {' '}
                  {/* ScrollArea now handles padding */}
                  <div className="space-y-6">
                    <FormField
                      control={formCreate.control}
                      name="suKienID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Chọn Sự Kiện (đã được BGH duyệt và chưa có YC phòng){' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (eventIdFromQuery)
                                setIsSuKienSelectDisabled(false);
                            }}
                            value={field.value}
                            disabled={
                              isLoadingSuKienSelect || isSuKienSelectDisabled
                            }
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
                              {Array.isArray(dsSuKienForSelect)
                                ? dsSuKienForSelect
                                    .filter(
                                      (sk) =>
                                        sk.suKienID != null &&
                                        sk.suKienID.toString() !== ''
                                    )
                                    .map((sk) => (
                                      <SelectItem
                                        key={sk.suKienID}
                                        value={sk.suKienID.toString()}
                                      >
                                        {sk.tenSK} (
                                        {formatDate(sk.tgBatDauDK, 'dd/MM')} -{' '}
                                        {formatDate(sk.tgKetThucDK, 'dd/MM/yy')}
                                        )
                                      </SelectItem>
                                    ))
                                : null}
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                              formCreate.getValues(
                                'chiTietYeuCau.0.ngayMuon'
                              ) || defaultChiTietYeuCauValue.ngayMuon,
                            ngayTra:
                              formCreate.getValues('chiTietYeuCau.0.ngayTra') ||
                              defaultChiTietYeuCauValue.ngayTra,
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
                                  value={field.value ?? ''}
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
                                    {isLoadingLoaiPhong &&
                                    !(dsLoaiPhong ?? []).length ? (
                                      <div className="p-4 text-center text-sm text-muted-foreground">
                                        Đang tải danh sách loại phòng...
                                      </div>
                                    ) : !isLoadingLoaiPhong &&
                                      !(dsLoaiPhong ?? []).length ? (
                                      <div className="p-4 text-center text-sm text-muted-foreground">
                                        Không có loại phòng nào.
                                      </div>
                                    ) : (
                                      (dsLoaiPhong ?? [])
                                        .filter(
                                          (lp) =>
                                            lp.loaiPhongID != null &&
                                            lp.loaiPhongID.toString() !== ''
                                        )
                                        .map((lp) => (
                                          <SelectItem
                                            key={lp.loaiPhongID}
                                            value={lp.loaiPhongID.toString()}
                                          >
                                            {lp.tenLoaiPhong}
                                          </SelectItem>
                                        ))
                                    )}
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
                                          !field.value &&
                                            'text-muted-foreground'
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
                                          !field.value &&
                                            'text-muted-foreground'
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
                                      disabled={(date) => {
                                        const ngayMuonValue =
                                          formCreate.getValues(
                                            `chiTietYeuCau.${index}.ngayMuon`
                                          );
                                        return ngayMuonValue
                                          ? date < ngayMuonValue
                                          : date < new Date(0);
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
                          <FormLabel>
                            Ghi chú chung cho toàn bộ yêu cầu
                          </FormLabel>
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
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Hủy Bỏ
                </Button>
                <Button
                  type="submit"
                  form="createRoomRequestForm"
                  disabled={
                    createRequestMutation.isPending ||
                    !formCreate.formState.isDirty ||
                    !formCreate.formState.isValid ||
                    isLoadingSuKienSelect
                  }
                  className="bg-gradient-to-r from-ptit-blue to-sky-500 hover:from-ptit-blue/90 hover:to-sky-500/90 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {createRequestMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}{' '}
                  Gửi Yêu Cầu
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateRoomRequestPage;
