import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO, isValid } from 'date-fns';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

import {
  useCreateRoomChangeRequest,
  useMyActiveBookedRoomsForChangeEvent,
  ROOM_CHANGE_REQUEST_QUERY_KEYS,
} from '@/hooks/queries/roomChangeRequestQueries';
import { useLoaiPhongList } from '@/hooks/queries/danhMucQueries';

import { APIError } from '@/services/apiHelper';

import {
  Loader2,
  Save,
  Shuffle,
  ChevronLeft,
  Info,
  CalendarDays,
  Clock,
  Users,
  Building,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { ROOM_REQUEST_QUERY_KEYS } from '@/hooks/queries/roomRequestQueries'; // Để invalidate YC Mượn Phòng gốc
import { formatDateRangeForDisplay } from '@/utils/formatDate';
import {
  ChiTietDatPhongForSelect,
  CreateYeuCauDoiPhongPayload,
} from '@/services/roomChangeRequest.service';

// --- Helper Functions ---
const formatDate = (
  dateString?: string | Date,
  customFormat = 'dd/MM/yyyy HH:mm'
) => {
  if (!dateString) return 'N/A';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, customFormat, { locale: vi });
  } catch (e) {
    return 'Ngày không hợp lệ';
  }
};

// --- Zod Schema for Create Change Request Form ---
const createRoomChangeRequestSchema = z.object({
  datPhongID_Cu: z
    .string()
    .min(1, { message: 'Vui lòng chọn phòng hiện tại bạn muốn đổi.' }),
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
const CreateRoomChangeRequestPage = () => {
  const { user } = useAuth();
  const { hasRole, can } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialBookedRoomId = searchParams.get('bookedRoomId'); // Lấy ID phòng đã đặt từ URL

  const [selectedBookedRoomForChange, setSelectedBookedRoomForChange] =
    useState<ChiTietDatPhongForSelect | null>(null);

  const form = useForm<CreateRoomChangeRequestFormValues>({
    resolver: zodResolver(createRoomChangeRequestSchema),
    defaultValues: {
      datPhongID_Cu: initialBookedRoomId || '',
      lyDoDoiPhong: '',
      ycPhongMoi_LoaiID: null,
      ycPhongMoi_SucChua: null,
      ycPhongMoi_ThietBi: null,
    },
  });

  const { data: myBookedRooms, isLoading: isLoadingMyBookedRooms } =
    useMyActiveBookedRoomsForChangeEvent(
      { nguoiYeuCauID: user?.nguoiDungID, limit: 100 }, // Backend sẽ lọc các phòng có thể đổi
      { enabled: !!user?.nguoiDungID }
    );

  console.log('myBookedRooms', myBookedRooms);

  const { data: dsLoaiPhongChange, isLoading: isLoadingLoaiPhongChange } =
    useLoaiPhongList({ limit: 100 });

  const createChangeRequestMutation = useCreateRoomChangeRequest({
    onSuccess: (data) => {
      toast.success('Yêu cầu đổi phòng đã được gửi thành công!');
      form.reset();
      setSelectedBookedRoomForChange(null);
      // Invalidate danh sách yêu cầu đổi phòng
      queryClient.invalidateQueries({
        queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.lists(),
      });
      // Invalidate chi tiết yêu cầu mượn phòng gốc để cập nhật trạng thái ( )
      if (selectedBookedRoomForChange?.ycMuonPhongCtID) {
        // Cần tìm ra YcMuonPhongID (header) từ ycMuonPhongCtID để invalidate đúng
        // Giả sử API trả về thông tin này hoặc có cách lấy được
        // queryClient.invalidateQueries(ROOM_REQUEST_QUERY_KEYS.detail(ID_YEU_CAU_MUON_PHONG_GOC));
      }
      navigate('/facilities/room-change-requests');
    },
    onError: (error: APIError) => {
      toast.error('Lỗi khi tạo yêu cầu đổi phòng', {
        description: error.body?.message || error.message,
      });
    },
  });

  // Effect để tự động chọn phòng   initialBookedRoomId từ URL
  useEffect(() => {
    if (initialBookedRoomId && myBookedRooms && myBookedRooms.length > 0) {
      const roomToSelect = myBookedRooms.find(
        (r) => r.datPhongID.toString() === initialBookedRoomId
      );
      if (roomToSelect) {
        setSelectedBookedRoomForChange(roomToSelect);
        form.setValue('datPhongID_Cu', initialBookedRoomId);
      } else {
        toast.error('Phòng bạn chọn để đổi không hợp lệ hoặc không tìm thấy.');
        navigate('/facilities/room-change-requests', { replace: true });
      }
    }
  }, [initialBookedRoomId, myBookedRooms, form, navigate]);

  const onSubmit: SubmitHandler<CreateRoomChangeRequestFormValues> = (data) => {
    if (!selectedBookedRoomForChange) {
      form.setError('datPhongID_Cu', {
        type: 'manual',
        message: 'Vui lòng chọn phòng hiện tại cần đổi.',
      });
      toast.error('Vui lòng chọn phòng hiện tại bạn muốn đổi.');
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
  };

  const handleCancel = () => navigate('/facilities/room-change-requests');

  // Quyền
  if (!can('create', 'YeuCauDoiPhong')) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="text-center p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />{' '}
          <p className="mt-4">Bạn không có quyền tạo yêu cầu đổi phòng.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Tạo Yêu Cầu Đổi Phòng Mới"
      headerActions={
        <Button variant="outline" onClick={handleCancel} className="text-sm">
          <ChevronLeft className="mr-2 h-4 w-4" /> Quay Lại DS Yêu Cầu Đổi
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl max-w-6xl mx-auto border-border dark:border-slate-700">
          <CardHeader className="bg-muted/30 dark:bg-slate-800/30 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-primary dark:text-ptit-red flex items-center gap-2">
              <Shuffle className="h-6 w-6" /> Yêu Cầu Đổi Phòng
            </CardTitle>
            <CardDescription>
              Chọn phòng bạn muốn đổi và cung cấp thông tin cho phòng mới mong
              muốn.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="createRoomChangeRequestForm"
            >
              <CardContent className="p-0">
                <ScrollArea className="max-h-[calc(100vh-20rem)] overflow-auto">
                  <div className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="datPhongID_Cu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-base">
                            Chọn Phòng Hiện Tại Cần Đổi{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const room = myBookedRooms?.find(
                                (r) => r.datPhongID.toString() === value
                              );
                              setSelectedBookedRoomForChange(room || null);
                            }}
                            value={field.value}
                            disabled={
                              isLoadingMyBookedRooms || !!initialBookedRoomId
                            } // Disable nếu ID đã có từ URL
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 text-base">
                                <SelectValue
                                  placeholder={
                                    isLoadingMyBookedRooms
                                      ? 'Đang tải DS phòng...'
                                      : 'Chọn phòng đã được xếp của bạn'
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>
                                  Các phòng bạn đang được xếp lịch
                                </SelectLabel>
                                {myBookedRooms?.map((br) => (
                                  <SelectItem
                                    key={br.datPhongID}
                                    value={br.datPhongID.toString()}
                                  >
                                    <div className="flex flex-col py-1">
                                      <span className="font-medium">
                                        {br.tenPhong} ({br.maPhong})
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Sự kiện: {br.tenSK.substring(0, 30)}...
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        Thời gian:{' '}
                                        {formatDate(
                                          br.tgNhanPhongTT,
                                          'dd/MM HH:mm'
                                        )}{' '}
                                        - {formatDate(br.tgTraPhongTT, 'HH:mm')}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              {myBookedRooms?.length === 0 &&
                                !isLoadingMyBookedRooms && (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    Không có phòng nào của bạn đang được xếp có
                                    thể đổi.
                                  </div>
                                )}
                            </SelectContent>
                          </Select>
                          {selectedBookedRoomForChange && (
                            <Card className="mt-3 p-3 text-xs bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700">
                              <p>
                                <strong>Thông tin phòng đang chọn đổi:</strong>
                              </p>
                              <p>
                                <strong>Sự kiện:</strong>{' '}
                                {selectedBookedRoomForChange.tenSK}
                              </p>
                              <p>
                                <strong>Thời gian sử dụng:</strong>{' '}
                                {formatDateRangeForDisplay(
                                  selectedBookedRoomForChange.tgNhanPhongTT,
                                  selectedBookedRoomForChange.tgTraPhongTT
                                )}
                              </p>
                            </Card>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lyDoDoiPhong"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-base">
                            Lý do đổi phòng{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Nêu rõ lý do bạn muốn đổi sang phòng khác..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="my-6 !mt-8 !mb-4" />
                    <h3 className="text-lg font-semibold text-primary dark:text-ptit-red">
                      Yêu Cầu Cho Phòng Mới (Không bắt buộc)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <FormField
                        control={form.control}
                        name="ycPhongMoi_LoaiID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loại phòng mong muốn</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                if (value === 'none') {
                                  field.onChange(null);
                                } else {
                                  field.onChange(value);
                                }
                              }}
                              value={field.value ?? 'none'}
                              disabled={isLoadingLoaiPhongChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isLoadingLoaiPhongChange
                                        ? 'Tải...'
                                        : 'Giữ nguyên hoặc chọn loại mới'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">
                                  Không thay đổi loại
                                </SelectItem>
                                {dsLoaiPhongChange
                                  ?.filter(
                                    (lp) =>
                                      lp.loaiPhongID !== undefined &&
                                      lp.loaiPhongID !== null
                                  )
                                  .map((lp) => (
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
                        name="ycPhongMoi_SucChua"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sức chứa tối thiểu mong muốn</FormLabel>
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
                      control={form.control}
                      name="ycPhongMoi_ThietBi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Yêu cầu thiết bị thêm cho phòng mới
                          </FormLabel>
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
              </CardContent>
              <CardFooter className="border-t dark:border-slate-700 pt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  Hủy Bỏ
                </Button>
                <Button
                  type="submit"
                  form="createRoomChangeRequestForm"
                  disabled={
                    !selectedBookedRoomForChange ||
                    createChangeRequestMutation.isPending ||
                    !form.formState.isValid
                  }
                  className="min-w-[180px] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  {createChangeRequestMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Shuffle className="mr-2 h-4 w-4" />
                  )}
                  Gửi Yêu Cầu Đổi Phòng
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateRoomChangeRequestPage;
