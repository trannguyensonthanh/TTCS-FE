// src/pages/Facilities/RoomsPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Không dùng useParams ở đây
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
import { Checkbox } from '@/components/ui/checkbox'; // Không thấy dùng Checkbox trực tiếp trong form này
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator'; // Thêm Separator
import {
  Loader2,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Building as BuildingIcon,
  ListFilter,
  AlertTriangle,
  Layers,
  Info,
  Plus,
  MinusCircle,
  Send, // Thêm MinusCircle, Send
  // Các icon không dùng: FileText, MapPin, UsersIcon, Settings, ChevronDown, X, Tag, Maximize, Minimize, CalendarClock, History, ListChecks, ChevronLeft, ChevronRight, MoreHorizontal, Eye, MessageSquareWarning, ThumbsUp, ThumbsDown, CalendarIcon, ChevronsUpDown, Clock
} from 'lucide-react';

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum';

import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
  CreatePhongPayload,
  GetPhongParams,
  PhongListItemResponse,
  UpdatePhongPayload,
} from '@/services/phong.service';
import {
  useLoaiPhongList,
  useToaNhaTangListForSelect,
  useTrangThaiPhongList,
  useTrangThietBiListForSelect,
} from '@/hooks/queries/danhMucQueries';
import {
  useCreatePhong,
  useDeletePhong,
  usePhongDetail,
  usePhongList,
  useUpdatePhong,
} from '@/hooks/queries/phongQueries';
import { useToaNhaTangList } from '@/hooks/queries/toaNhaTangQueries';

// --- Zod Schema for Phong Form ---
const thietBiTrongPhongSchema = z.object({
  thietBiID: z.string().min(1, { message: 'Vui lòng chọn thiết bị.' }),
  soLuong: z.coerce
    .number()
    .int({ message: 'Số lượng phải là số nguyên.' })
    .min(1, 'Số lượng phải lớn hơn 0.'),
  tinhTrang: z
    .string()
    .max(200, 'Tình trạng tối đa 200 ký tự.')
    .optional()
    .nullable(),
});

const phongFormSchema = z.object({
  tenPhong: z
    .string()
    .min(1, 'Tên phòng không được trống.')
    .max(100, 'Tên phòng tối đa 100 ký tự.'),
  maPhong: z
    .string()
    .max(50, 'Mã phòng tối đa 50 ký tự.')
    .optional()
    .nullable(),
  loaiPhongID: z.string().min(1, { message: 'Vui lòng chọn loại phòng.' }),
  sucChua: z.coerce
    .number()
    .int()
    .min(0, 'Sức chứa không âm.')
    .optional()
    .nullable(), // Cho phép sức chứa 0
  trangThaiPhongID: z
    .string()
    .min(1, { message: 'Vui lòng chọn trạng thái phòng.' }),
  toaNhaTangID: z.string().min(1, { message: 'Vui lòng chọn tầng cho phòng.' }),
  soThuTuPhong: z
    .string()
    .max(20, 'Số thứ tự tối đa 20 ký tự.')
    .optional()
    .nullable(),
  moTaChiTietPhong: z
    .string()
    .max(1000, 'Mô tả tối đa 1000 ký tự.')
    .optional()
    .nullable(),
  anhMinhHoa: z
    .string()
    .url({ message: 'URL ảnh không hợp lệ.' })
    .optional()
    .nullable()
    .or(z.literal('')), // Cho phép rỗng
  thietBiTrongPhong: z.array(thietBiTrongPhongSchema).optional(),
});
type PhongFormValues = z.infer<typeof phongFormSchema>;

// Default values cho form
const defaultFormValues: PhongFormValues = {
  tenPhong: '',
  maPhong: '',
  loaiPhongID: '',
  sucChua: undefined,
  trangThaiPhongID: '',
  toaNhaTangID: '',
  soThuTuPhong: '',
  moTaChiTietPhong: '',
  anhMinhHoa: '',
  thietBiTrongPhong: [],
};

// ---- Component Chính ----
const RoomsPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterParams, setFilterParams] = useState<GetPhongParams>({
    page: 1,
    limit: 10,
    sortBy: 'TenPhong',
    sortOrder: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterLoaiPhongID, setFilterLoaiPhongID] = useState<
    string | undefined
  >(undefined);
  const [filterToaNhaID, setFilterToaNhaID] = useState<string | undefined>(
    undefined
  ); // State for ToaNha filter
  const [filterTrangThaiPhongID, setFilterTrangThaiPhongID] = useState<
    string | undefined
  >(undefined);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPhongId, setEditingPhongId] = useState<number | null>(null); // Chỉ lưu ID
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [phongToDelete, setPhongToDelete] =
    useState<PhongListItemResponse | null>(null);

  // --- Data Fetching ---
  const {
    data: paginatedPhong,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchPhongList,
  } = usePhongList(filterParams, {
    staleTime: 5 * 60 * 1000,
  });

  const { data: editingPhongDetail, isLoading: isLoadingEditingDetail } =
    usePhongDetail(editingPhongId, {
      enabled: !!editingPhongId && isFormModalOpen,
    });

  const { data: dsLoaiPhong, isLoading: isLoadingLoaiPhong } = useLoaiPhongList(
    { limit: 100 },
    { enabled: true }
  ); // Load sẵn cho filter
  const { data: dsTrangThaiPhong, isLoading: isLoadingTrangThaiPhong } =
    useTrangThaiPhongList({ limit: 50 }, { enabled: true });
  const { data: dsToaNhaTang, isLoading: isLoadingToaNhaTang } =
    useToaNhaTangListForSelect({ limit: 500 }, { enabled: true }); // Always enabled, avoid referencing dsToaNhaTang before declaration
  const { data: dsTrangThietBi, isLoading: isLoadingTrangThietBi } =
    useTrangThietBiListForSelect({ limit: 500 }, { enabled: isFormModalOpen });

  console.log(
    'dsTrangThietBi',
    dsTrangThietBi,
    'dsToaNhaTang',
    dsToaNhaTang,
    'dsLoaiPhong',
    dsLoaiPhong,
    'dsTrangThaiPhong',
    dsTrangThaiPhong
  );

  const distinctToaNha = useMemo(() => {
    if (!dsToaNhaTang) return [];
    const toaNhaMap = new Map<
      number,
      { toaNhaID: number; tenToaNha: string }
    >();
    dsToaNhaTang?.forEach((tnt) => {
      if (!toaNhaMap.has(tnt.toaNhaID)) {
        toaNhaMap.set(tnt.toaNhaID, {
          toaNhaID: tnt.toaNhaID,
          tenToaNha: tnt.tenToaNha,
        });
      }
    });
    return Array.from(toaNhaMap.values()).sort((a, b) =>
      a.tenToaNha.localeCompare(b.tenToaNha)
    );
  }, [dsToaNhaTang]);

  // --- Mutations ---
  const commonMutationOptions = {
    onSuccess: () => {
      refetchPhongList();
      toast.success(
        editingPhongId
          ? 'Cập nhật phòng thành công!'
          : 'Thêm phòng mới thành công!'
      );
      setIsFormModalOpen(false);
      setEditingPhongId(null);
      form.reset(defaultFormValues);
    },
    onError: (error: APIError) => {
      toast.error('Thao tác thất bại', {
        description: error.body?.message || error.message || 'Có lỗi xảy ra.',
      });
    },
  };
  const createPhongMutation = useCreatePhong(commonMutationOptions);
  const updatePhongMutation = useUpdatePhong(commonMutationOptions);
  const deletePhongMutation = useDeletePhong({
    onSuccess: () => {
      toast.success('Xóa phòng thành công!');
      setShowDeleteConfirm(false);
      setPhongToDelete(null);
      refetchPhongList();
    },
    ...commonMutationOptions,
  });

  // --- Form Handling ---
  const form = useForm<PhongFormValues>({
    resolver: zodResolver(phongFormSchema),
    defaultValues: defaultFormValues,
  });
  const {
    fields: thietBiFields,
    append: appendThietBi,
    remove: removeThietBi,
  } = useFieldArray({
    control: form.control,
    name: 'thietBiTrongPhong',
  });

  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      loaiPhongID: filterLoaiPhongID ? parseInt(filterLoaiPhongID) : undefined,
      toaNhaID: filterToaNhaID ? parseInt(filterToaNhaID) : undefined,
      trangThaiPhongID: filterTrangThaiPhongID
        ? parseInt(filterTrangThaiPhongID)
        : undefined,
      page: 1,
    }));
  }, [
    debouncedSearchTerm,
    filterLoaiPhongID,
    filterToaNhaID,
    filterTrangThaiPhongID,
  ]);

  useEffect(() => {
    if (
      editingPhongDetail &&
      isFormModalOpen &&
      editingPhongId === editingPhongDetail.phongID
    ) {
      // Ensure detail matches editingId
      form.reset({
        tenPhong: editingPhongDetail.tenPhong,
        maPhong: editingPhongDetail.maPhong || '',
        loaiPhongID: editingPhongDetail.loaiPhong.loaiPhongID.toString(),
        sucChua: editingPhongDetail.sucChua ?? undefined,
        trangThaiPhongID:
          editingPhongDetail.trangThaiPhong.trangThaiPhongID.toString(),
        toaNhaTangID:
          editingPhongDetail.toaNhaTang?.toaNhaTangID.toString() || '',
        soThuTuPhong: editingPhongDetail.soThuTuPhong || '',
        moTaChiTietPhong: editingPhongDetail.moTaChiTietPhong || '',
        anhMinhHoa: editingPhongDetail.anhMinhHoa || '',
        thietBiTrongPhong: editingPhongDetail.thietBiTrongPhong.map((tb) => ({
          thietBiID: tb.thietBi.thietBiID.toString(),
          soLuong: tb.soLuong,
          tinhTrang: tb.tinhTrang || '',
        })),
      });
    } else if (!editingPhongId && isFormModalOpen) {
      form.reset(defaultFormValues); // Reset for new form
    }
  }, [editingPhongDetail, isFormModalOpen, form, editingPhongId]);

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreateModal = useCallback(() => {
    setEditingPhongId(null);
    form.reset(defaultFormValues);
    setIsFormModalOpen(true);
  }, [form]);

  const openEditModal = useCallback((phong: PhongListItemResponse) => {
    setEditingPhongId(phong.phongID); // Fetching detail will be triggered by useEffect or query's enabled flag
    setIsFormModalOpen(true);
  }, []);

  const openDeleteConfirm = useCallback((phong: PhongListItemResponse) => {
    setPhongToDelete(phong);
    setShowDeleteConfirm(true);
  }, []);

  const onSubmitPhong: SubmitHandler<PhongFormValues> = useCallback(
    (data) => {
      const payload: CreatePhongPayload | UpdatePhongPayload = {
        ...data,
        loaiPhongID: parseInt(data.loaiPhongID, 10),
        trangThaiPhongID: parseInt(data.trangThaiPhongID, 10),
        toaNhaTangID: data.toaNhaTangID
          ? parseInt(data.toaNhaTangID, 10)
          : null, // Allow null if not selected
        sucChua: data.sucChua ? Number(data.sucChua) : null,
        maPhong: data.maPhong || null,
        soThuTuPhong: data.soThuTuPhong || null,
        moTaChiTietPhong: data.moTaChiTietPhong || null,
        anhMinhHoa: data.anhMinhHoa || null,
        thietBiTrongPhong:
          data.thietBiTrongPhong?.map((tb) => ({
            thietBiID: parseInt(tb.thietBiID, 10),
            soLuong: Number(tb.soLuong),
            tinhTrang: tb.tinhTrang || null,
          })) || [],
      };
      if (editingPhongId) {
        updatePhongMutation.mutate({ id: editingPhongId, payload });
      } else {
        createPhongMutation.mutate(payload as CreatePhongPayload);
      }
    },
    [editingPhongId, createPhongMutation, updatePhongMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (phongToDelete) {
      deletePhongMutation.mutate(phongToDelete.phongID);
    }
  }, [phongToDelete, deletePhongMutation]);

  const canManagePhong = useMemo(
    () => hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );
  const canViewPage = useMemo(
    () =>
      canManagePhong ||
      hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) ||
      hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG),
    [canManagePhong, hasRole]
  );

  const phongList = paginatedPhong?.items || [];
  const totalPages = paginatedPhong?.totalPages || 1;
  const currentPage = paginatedPhong?.currentPage || 1;

  if (!isLoading && !canViewPage && !isFetching) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />{' '}
          <p className="mt-4 text-lg font-semibold">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Quản Lý Phòng Học & Hội Trường"
      headerActions={
        canManagePhong && (
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Phòng Mới
          </Button>
        )
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card className="shadow-xl border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">Danh Sách Phòng</CardTitle>
            <CardDescription>
              Quản lý thông tin chi tiết, trạng thái và thiết bị của các phòng
              trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
              <div className="lg:col-span-2">
                <Label
                  htmlFor="search-phong"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-phong"
                    type="search"
                    placeholder="Tên phòng, mã phòng..."
                    className="pl-10 h-10 rounded-lg shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="filter-loaiphong"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Loại phòng
                </Label>
                <Select
                  value={filterLoaiPhongID}
                  onValueChange={(value) =>
                    setFilterLoaiPhongID(value === 'all' ? undefined : value)
                  }
                  disabled={isLoadingLoaiPhong}
                >
                  <SelectTrigger id="filter-loaiphong">
                    <SelectValue
                      placeholder={
                        isLoadingLoaiPhong ? 'Tải...' : 'Tất cả loại'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
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
              </div>
              <div>
                <Label
                  htmlFor="filter-trangthaiphong"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Trạng thái
                </Label>
                <Select
                  value={filterTrangThaiPhongID}
                  onValueChange={(value) =>
                    setFilterTrangThaiPhongID(
                      value === 'all' ? undefined : value
                    )
                  }
                  disabled={isLoadingTrangThaiPhong}
                >
                  <SelectTrigger id="filter-trangthaiphong">
                    <SelectValue
                      placeholder={
                        isLoadingTrangThaiPhong ? 'Tải...' : 'Tất cả trạng thái'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {dsTrangThaiPhong?.map((tt) => (
                      <SelectItem
                        key={tt.trangThaiPhongID}
                        value={tt.trangThaiPhongID.toString()}
                      >
                        {tt.tenTrangThai}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Optional: Filter theo Tòa nhà */}
              {/* <div><Label htmlFor="filter-toanha" className="text-xs font-semibold text-muted-foreground">Tòa nhà</Label>
                <Select value={filterToaNhaID} onValueChange={(value) => setFilterToaNhaID(value === 'all' ? undefined : value)} disabled={isLoadingToaNhaTang}>
                  <SelectTrigger id="filter-toanha"><SelectValue placeholder="Tất cả tòa nhà" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Tất cả tòa nhà</SelectItem>{distinctToaNha.map(tn => <SelectItem key={tn.toaNhaID} value={tn.toaNhaID.toString()}>{tn.tenToaNha}</SelectItem>)}</SelectContent>
                </Select>
              </div> */}
            </div>

            {(isLoading || isFetching) && !phongList.length ? (
              <div className="text-center py-20">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoading && phongList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BuildingIcon className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-xl font-semibold">
                  Không tìm thấy phòng nào.
                </p>
                {canManagePhong && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateModal}
                    >
                      thêm phòng mới
                    </Button>
                    .
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-md border shadow-sm bg-card dark:border-slate-800 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-slate-800/30">
                      <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mã Phòng
                      </TableHead>
                      <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Tên Phòng
                      </TableHead>
                      <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Loại Phòng
                      </TableHead>
                      <TableHead className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Sức Chứa
                      </TableHead>
                      <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Vị Trí
                      </TableHead>
                      <TableHead className="text-center px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Trạng Thái
                      </TableHead>
                      {canManagePhong && (
                        <TableHead className="text-right px-4 py-3 text-sm font-semibold text-muted-foreground">
                          Thao tác
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phongList.map((phong) => (
                      <TableRow
                        key={phong.phongID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell className="font-mono py-3 px-4 text-sm align-top">
                          {phong.maPhong || '-'}
                        </TableCell>
                        <TableCell className="font-medium py-3 px-4 text-primary dark:text-sky-400 align-top">
                          {phong.tenPhong}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                          {phong.loaiPhong.tenLoaiPhong}
                        </TableCell>
                        <TableCell className="text-center text-sm py-3 px-4 text-muted-foreground align-top">
                          {phong.sucChua || '-'}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                          {phong.toaNhaTang
                            ? `${phong.toaNhaTang.toaNha.tenToaNha} - Tầng ${
                                phong.soThuTuPhong ||
                                phong.toaNhaTang.loaiTang.tenLoaiTang
                              }`
                            : 'N/A'}
                          {phong.soThuTuPhong && (
                            <span className="block text-xs">
                              Phòng số: {phong.soThuTuPhong}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center py-3 px-4 align-top">
                          <Badge
                            variant={
                              phong.trangThaiPhong.tenTrangThai === 'Sẵn sàng'
                                ? 'secondary'
                                : phong.trangThaiPhong.tenTrangThai ===
                                  'Bảo trì'
                                ? 'destructive'
                                : 'default'
                            }
                            className="text-xs whitespace-nowrap"
                          >
                            {phong.trangThaiPhong.tenTrangThai}
                          </Badge>
                        </TableCell>
                        {canManagePhong && (
                          <TableCell className="text-right py-3 px-4 align-top">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(phong)}
                                title="Sửa phòng"
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(phong)}
                                title="Xóa phòng"
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {paginatedPhong && totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading || isFetching}
                className="mt-8"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Thêm/Sửa Phòng */}
      <Dialog
        open={isFormModalOpen && canManagePhong}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPhongId(null);
            form.reset(defaultFormValues);
          }
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingPhongId ? 'Chỉnh Sửa Thông Tin Phòng' : 'Thêm Phòng Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingPhongId && editingPhongDetail
                ? `Cập nhật cho phòng ${editingPhongDetail.tenPhong}.`
                : 'Điền thông tin chi tiết cho phòng mới.'}
            </DialogDescription>
          </DialogHeader>
          {isFormModalOpen && editingPhongId && isLoadingEditingDetail ? (
            <div className="flex-grow flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitPhong)}
                id="phongForm"
                className="flex-grow overflow-hidden flex flex-col"
              >
                <ScrollArea className="flex-grow pr-5 -mr-1">
                  <div className="space-y-5 p-1 pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tenPhong"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tên Phòng{' '}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VD: Hội trường A101"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maPhong"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã Phòng</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VD: A1.101"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="loaiPhongID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Loại Phòng{' '}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ''}
                              disabled={isLoadingLoaiPhong}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isLoadingLoaiPhong
                                        ? 'Tải...'
                                        : 'Chọn loại'
                                    }
                                  />
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
                        name="sucChua"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sức Chứa (người)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="VD: 100"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="toaNhaTangID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tầng (Tòa nhà - Tầng){' '}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ''}
                              disabled={isLoadingToaNhaTang}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isLoadingToaNhaTang
                                        ? 'Tải...'
                                        : 'Chọn tầng'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {dsToaNhaTang?.map((tnt) => (
                                  <SelectItem
                                    key={tnt.toaNhaTangID}
                                    value={tnt.toaNhaTangID.toString()}
                                  >{`${tnt.tenToaNha} - ${tnt.tenLoaiTang}${
                                    tnt.moTaTang ? ` (${tnt.moTaTang})` : ''
                                  }`}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="soThuTuPhong"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số Thứ Tự/Tên Phòng trên Tầng</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VD: 101, P.A"
                                {...field}
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
                      name="trangThaiPhongID"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Trạng Thái Phòng{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                            disabled={isLoadingTrangThaiPhong}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isLoadingTrangThaiPhong
                                      ? 'Tải...'
                                      : 'Chọn trạng thái'
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dsTrangThaiPhong?.map((tt) => (
                                <SelectItem
                                  key={tt.trangThaiPhongID}
                                  value={tt.trangThaiPhongID.toString()}
                                >
                                  {tt.tenTrangThai}
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
                      name="moTaChiTietPhong"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô Tả Chi Tiết Phòng</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả thêm về phòng, vị trí cụ thể, lưu ý..."
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
                      name="anhMinhHoa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Ảnh Minh Họa</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          {field.value && (
                            <img
                              src={field.value}
                              alt="Xem trước"
                              className="mt-2 rounded-md max-h-40 object-contain border p-1"
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator className="my-6 !mt-8" />
                    <div className="flex justify-between items-center mb-3">
                      <FormLabel className="text-md font-semibold">
                        Trang Thiết Bị Trong Phòng
                      </FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendThietBi({
                            thietBiID: '',
                            soLuong: 1,
                            tinhTrang: '',
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Thiết Bị
                      </Button>
                    </div>
                    {thietBiFields.map((item, index) => (
                      <Card
                        key={item.id}
                        className="p-3 border-dashed relative group mb-3 bg-muted/20 dark:bg-slate-800/20"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeThietBi(index)}
                          className="absolute top-1 right-1 h-7 w-7 text-destructive opacity-60 group-hover:opacity-100"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-3 items-end">
                          <FormField
                            control={form.control}
                            name={`thietBiTrongPhong.${index}.thietBiID`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Thiết bị{' '}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || ''}
                                  disabled={isLoadingTrangThietBi}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          isLoadingTrangThietBi
                                            ? 'Tải...'
                                            : 'Chọn thiết bị'
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {dsTrangThietBi?.map((tb) => (
                                      <SelectItem
                                        key={tb.thietBiID}
                                        value={tb.thietBiID.toString()}
                                      >
                                        {tb.tenThietBi}
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
                            name={`thietBiTrongPhong.${index}.soLuong`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Số lượng{' '}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    placeholder="SL"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`thietBiTrongPhong.${index}.tinhTrang`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">
                                  Tình trạng
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="VD: Tốt, Cần sửa"
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
                  </div>
                </ScrollArea>
                <DialogFooter className="pt-6 border-t mt-auto shrink-0">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">
                      Hủy
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    form="phongForm"
                    disabled={
                      createPhongMutation.isPending ||
                      updatePhongMutation.isPending ||
                      !form.formState.isDirty ||
                      !form.formState.isValid
                    }
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    {(createPhongMutation.isPending ||
                      updatePhongMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingPhongId ? 'Lưu Thay Đổi' : 'Thêm Phòng Mới'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Phòng */}
      <Dialog
        open={showDeleteConfirm && !!phongToDelete}
        onOpenChange={setShowDeleteConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Xác Nhận Xóa Phòng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phòng{' '}
              <strong>{phongToDelete?.tenPhong}</strong> (Mã:{' '}
              {phongToDelete?.maPhong || 'N/A'}) không? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletePhongMutation.isPending}
            >
              {deletePhongMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{' '}
              Xóa Phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Helper component cho dialog chi tiết (nếu dùng chung)
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

export default RoomsPage;
