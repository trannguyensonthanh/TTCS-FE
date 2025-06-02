import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useToaNhaTangList,
  useCreateToaNhaTang,
  useUpdateToaNhaTang,
  useDeleteToaNhaTang,
} from '@/hooks/queries/toaNhaTangQueries';
import { useToaNhaDetail } from '@/hooks/queries/toaNhaQueries'; // Để lấy tên tòa nhà cha
import { useLoaiTangList } from '@/hooks/queries/loaiTangQueries'; // Để chọn loại tầng

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Loader2,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Layers,
  Building,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { useDebounce } from '@/hooks/useDebounce';
import {
  GetToaNhaTangParams,
  ToaNhaTangResponse,
} from '@/services/toaNhaTang.service';
import { motion } from 'framer-motion';
// --- Zod Schema for ToaNha_Tang Form ---
const toaNhaTangFormSchema = z.object({
  loaiTangID: z
    .string()
    .refine((val) => val !== '', { message: 'Vui lòng chọn loại tầng.' }),
  soPhong: z.coerce
    .number()
    .int('Số phòng phải là số nguyên.')
    .min(0, 'Số phòng không âm.')
    .optional()
    .nullable(),
  moTa: z.string().max(500, 'Tối đa 500 ký tự.').optional().nullable(),
});
type ToaNhaTangFormValues = z.infer<typeof toaNhaTangFormSchema>;

// ---- Component Chính ----
const BuildingFloorsPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const { toaNhaId } = useParams<{ toaNhaId: string }>(); // Lấy toaNhaId từ URL

  const [filterParams, setFilterParams] = useState<GetToaNhaTangParams>({
    page: 1,
    limit: 10,
    sortBy: 'LoaiTang.SoThuTu',
    sortOrder: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingToaNhaTang, setEditingToaNhaTang] =
    useState<ToaNhaTangResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toaNhaTangToDelete, setToaNhaTangToDelete] =
    useState<ToaNhaTangResponse | null>(null);

  // --- Data Fetching ---
  const { data: toaNhaDetail, isLoading: isLoadingToaNhaDetail } =
    useToaNhaDetail(toaNhaId);

  const {
    data: paginatedToaNhaTang,
    isLoading,
    isFetching,
    refetch: refetchToaNhaTangList,
  } = useToaNhaTangList(toaNhaId, filterParams, {
    enabled:
      !!toaNhaId &&
      (hasRole(MaVaiTro.ADMIN_HE_THONG) || hasRole(MaVaiTro.QUAN_LY_CSVC)),
  });

  const { data: dsLoaiTang, isLoading: isLoadingLoaiTang } = useLoaiTangList(
    { limit: 200, sortBy: 'SoThuTu', sortOrder: 'asc' }, // Lấy nhiều loại tầng
    { enabled: isFormModalOpen }
  );

  // --- Mutations ---
  const createToaNhaTangMutation = useCreateToaNhaTang(toaNhaId!, {
    // Truyền toaNhaId vào hook
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
    },
  });
  const updateToaNhaTangMutation = useUpdateToaNhaTang(toaNhaId!, {
    // Truyền toaNhaId
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
      setEditingToaNhaTang(null);
    },
  });
  const deleteToaNhaTangMutation = useDeleteToaNhaTang(toaNhaId!, {
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setToaNhaTangToDelete(null);
    },
  });

  // --- Form Handling ---
  const form = useForm<ToaNhaTangFormValues>({
    resolver: zodResolver(toaNhaTangFormSchema),
    defaultValues: { loaiTangID: '', soPhong: undefined, moTa: '' },
  });

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

  const openCreateModal = () => {
    form.reset({ loaiTangID: '', soPhong: undefined, moTa: '' });
    setEditingToaNhaTang(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (tang: ToaNhaTangResponse) => {
    setEditingToaNhaTang(tang);
    form.reset({
      loaiTangID: tang.loaiTang.loaiTangID.toString(),
      soPhong: tang.soPhong ?? undefined,
      moTa: tang.moTa || '',
    });
    setIsFormModalOpen(true);
  };

  const openDeleteConfirm = (tang: ToaNhaTangResponse) => {
    setToaNhaTangToDelete(tang);
    setShowDeleteConfirm(true);
  };

  const onSubmitToaNhaTang: SubmitHandler<ToaNhaTangFormValues> = (data) => {
    if (!toaNhaId) return;
    const payload = {
      loaiTangID: parseInt(data.loaiTangID, 10),
      soPhong:
        data.soPhong === undefined ||
        data.soPhong === null ||
        isNaN(Number(data.soPhong))
          ? null
          : Number(data.soPhong),
      moTa: data.moTa || null,
    };
    if (editingToaNhaTang) {
      updateToaNhaTangMutation.mutate({
        toaNhaTangId: editingToaNhaTang.toaNhaTangID,
        payload,
      });
    } else {
      createToaNhaTangMutation.mutate(payload);
    }
  };

  const handleDeleteConfirm = () => {
    if (toaNhaTangToDelete) {
      deleteToaNhaTangMutation.mutate(toaNhaTangToDelete.toaNhaTangID);
    }
  };

  // --- Quyền ---
  const canManageFloors = hasRole(MaVaiTro.ADMIN_HE_THONG);
  const canViewPage = canManageFloors || hasRole(MaVaiTro.QUAN_LY_CSVC);

  if (!toaNhaId) {
    /* Xử lý trường hợp không có toaNhaId */ return (
      <DashboardLayout pageTitle="Lỗi">
        <p>Không tìm thấy ID Tòa nhà.</p>
      </DashboardLayout>
    );
  }
  if (isLoadingToaNhaDetail) {
    return (
      <DashboardLayout pageTitle="Đang tải...">
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Đang tải thông tin tòa nhà...</span>
        </div>
      </DashboardLayout>
    );
  }
  if (!isLoadingToaNhaDetail && !toaNhaDetail) {
    return (
      <DashboardLayout pageTitle="Không tìm thấy tòa nhà">
        <div className="flex flex-col items-center py-16">
          <Building className="h-12 w-12 mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">
            Không tìm thấy tòa nhà này.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/units/buildings')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách tòa nhà
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  if (!isLoading && !canViewPage && !isFetching) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="flex flex-col items-center py-16">
          <AlertTriangle className="h-12 w-12 mb-4 text-destructive" />
          <p className="text-lg font-semibold mb-2">
            Bạn không có quyền truy cập trang này.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const tangList = paginatedToaNhaTang?.items || [];
  const totalPages = paginatedToaNhaTang?.totalPages || 1;
  const currentPage = paginatedToaNhaTang?.currentPage || 1;
  const pageTitle = `Quản Lý Tầng - Tòa Nhà: ${
    toaNhaDetail?.tenToaNha || 'Đang tải...'
  }`;

  return (
    <DashboardLayout
      pageTitle={pageTitle}
      headerActions={
        canManageFloors && (
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Tầng vào Tòa Nhà
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
        <Button
          variant="outline"
          onClick={() => navigate('/units/buildings')}
          className="mb-6"
        >
          {' '}
          {/* Hoặc /units nếu BuildingsPage nằm trong đó */}
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Danh sách Tòa Nhà
        </Button>

        <Card className="shadow-xl border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">
              Danh Sách Tầng của {toaNhaDetail?.tenToaNha || 'Tòa Nhà'}
            </CardTitle>
            <CardDescription>
              Quản lý các tầng vật lý đã được gán cho tòa nhà này.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên loại tầng, mô tả..."
                  className="pl-10 h-10 rounded-lg shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {(isLoading || isFetching) && !tangList.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoading && tangList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Layers className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-xl font-semibold">
                  Tòa nhà này chưa có tầng nào được định nghĩa.
                </p>
                {canManageFloors && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateModal}
                    >
                      thêm tầng mới
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
                      <TableHead className="w-[150px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mã Loại Tầng
                      </TableHead>
                      <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Tên Loại Tầng
                      </TableHead>
                      <TableHead className="w-[100px] text-center px-4 py-3 text-sm font-semibold text-muted-foreground">
                        STT
                      </TableHead>
                      <TableHead className="w-[120px] text-center px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Số Phòng
                      </TableHead>
                      <TableHead className="min-w-[250px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mô Tả Tầng
                      </TableHead>
                      {canManageFloors && (
                        <TableHead className="text-right w-[130px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                          Thao tác
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tangList.map((tang) => (
                      <TableRow
                        key={tang.toaNhaTangID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell className="font-mono py-3 px-4 text-sm">
                          {tang.loaiTang.maLoaiTang}
                        </TableCell>
                        <TableCell className="font-medium py-3 px-4 text-primary dark:text-sky-400">
                          {tang.loaiTang.tenLoaiTang}
                        </TableCell>
                        <TableCell className="text-center text-sm py-3 px-4 text-muted-foreground">
                          {tang.loaiTang.soThuTu ?? '-'}
                        </TableCell>
                        <TableCell className="text-center text-sm py-3 px-4 text-muted-foreground">
                          {tang.soPhong ?? '-'}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground truncate max-w-xs">
                          {tang.moTa || 'Không có mô tả'}
                        </TableCell>
                        {canManageFloors && (
                          <TableCell className="text-right py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(tang)}
                                title="Sửa thông tin tầng"
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(tang)}
                                title="Xóa tầng khỏi tòa nhà"
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

            {paginatedToaNhaTang && totalPages > 1 && (
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

      {/* Dialog Thêm/Sửa Tầng Vật Lý */}
      <Dialog
        open={isFormModalOpen && canManageFloors}
        onOpenChange={(open) => {
          if (!open) {
            setEditingToaNhaTang(null);
            form.reset();
          }
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingToaNhaTang
                ? `Chỉnh Sửa Tầng cho ${toaNhaDetail?.tenToaNha}`
                : `Thêm Tầng vào ${toaNhaDetail?.tenToaNha}`}
            </DialogTitle>
            <DialogDescription>
              {editingToaNhaTang
                ? `Cập nhật thông tin cho tầng ${editingToaNhaTang.loaiTang.tenLoaiTang}.`
                : 'Chọn loại tầng và điền thông tin chi tiết.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitToaNhaTang)}
              className="space-y-6 py-2"
            >
              <FormField
                control={form.control}
                name="loaiTangID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Loại Tầng <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isLoadingLoaiTang || !!editingToaNhaTang} // Không cho sửa Loại Tầng khi edit
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingLoaiTang
                                ? 'Đang tải DS Loại Tầng...'
                                : 'Chọn loại tầng'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dsLoaiTang?.items?.map((lt) => (
                          <SelectItem
                            key={lt.loaiTangID}
                            value={lt.loaiTangID.toString()}
                          >
                            {lt.tenLoaiTang} ({lt.maLoaiTang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!!editingToaNhaTang && (
                      <FormDescription>
                        Không thể thay đổi Loại Tầng sau khi đã tạo.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soPhong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số Phòng (dự kiến)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="VD: 20"
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
                control={form.control}
                name="moTa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô Tả cho Tầng này</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về tầng này trong tòa nhà (nếu có)..."
                        {...field}
                        value={field.value ?? ''}
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
                  disabled={
                    createToaNhaTangMutation.isPending ||
                    updateToaNhaTangMutation.isPending
                  }
                >
                  {(createToaNhaTangMutation.isPending ||
                    updateToaNhaTangMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingToaNhaTang ? 'Lưu Thay Đổi' : 'Thêm Tầng'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Tầng Vật Lý */}
      <Dialog
        open={showDeleteConfirm && !!toaNhaTangToDelete}
        onOpenChange={setShowDeleteConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác nhận Xóa Tầng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tầng{' '}
              <strong className="text-foreground">
                {toaNhaTangToDelete?.loaiTang.tenLoaiTang}
              </strong>{' '}
              khỏi tòa nhà{' '}
              <strong className="text-foreground">
                {toaNhaDetail?.tenToaNha}
              </strong>
              ?
              <br />
              Hành động này không thể hoàn tác và chỉ nên thực hiện nếu tầng này
              không có phòng nào đang được quản lý.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setToaNhaTangToDelete(null)}
              >
                Không, Hủy bỏ
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteToaNhaTangMutation.isPending}
            >
              {deleteToaNhaTangMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Có, Xóa Tầng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BuildingFloorsPage;
