import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';

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
  Package,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import {
  GetTrangThietBiParams,
  TrangThietBiFullResponse,
} from '@/services/danhMuc.service';
import {
  useCreateTrangThietBi,
  useDeleteTrangThietBi,
  useTrangThietBiCrudList,
  useUpdateTrangThietBi,
} from '@/hooks/queries/trangThietBiQueries';
import { motion } from 'framer-motion';
// --- Zod Schema for TrangThietBi Form ---
const trangThietBiFormSchema = z.object({
  tenThietBi: z
    .string()
    .min(1, 'Tên thiết bị không được trống')
    .max(150, 'Tối đa 150 ký tự.'),
  // maThietBi: z.string().max(50).optional().nullable(), // Bỏ qua nếu không có trong DB
  moTa: z.string().max(500, 'Tối đa 500 ký tự.').optional().nullable(),
});
type TrangThietBiFormValues = z.infer<typeof trangThietBiFormSchema>;

// ---- Component Chính ----
const EquipmentPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();

  const [filterParams, setFilterParams] = useState<GetTrangThietBiParams>({
    page: 1,
    limit: 10,
    sortBy: 'TenThietBi',
    sortOrder: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingThietBi, setEditingThietBi] =
    useState<TrangThietBiFullResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [thietBiToDelete, setThietBiToDelete] =
    useState<TrangThietBiFullResponse | null>(null);

  // --- Data Fetching ---
  const {
    data: paginatedThietBi,
    isLoading,
    isFetching,
    refetch: refetchThietBiList,
  } = useTrangThietBiCrudList(filterParams, {
    // Sử dụng hook mới
    enabled: hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG),
  });

  // --- Mutations ---
  const createThietBiMutation = useCreateTrangThietBi({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
    },
  });
  const updateThietBiMutation = useUpdateTrangThietBi({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
      setEditingThietBi(null);
    },
  });
  const deleteThietBiMutation = useDeleteTrangThietBi({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setThietBiToDelete(null);
    },
  });

  // --- Form Handling ---
  const form = useForm<TrangThietBiFormValues>({
    resolver: zodResolver(trangThietBiFormSchema),
    defaultValues: { tenThietBi: '', moTa: '' },
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
    form.reset({ tenThietBi: '', moTa: '' });
    setEditingThietBi(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (thietBi: TrangThietBiFullResponse) => {
    setEditingThietBi(thietBi);
    form.reset({
      tenThietBi: thietBi.tenThietBi,
      moTa: thietBi.moTa || '',
    });
    setIsFormModalOpen(true);
  };

  const openDeleteConfirm = (thietBi: TrangThietBiFullResponse) => {
    setThietBiToDelete(thietBi);
    setShowDeleteConfirm(true);
  };

  const onSubmitThietBi: SubmitHandler<TrangThietBiFormValues> = (data) => {
    const payload = {
      tenThietBi: data.tenThietBi,
      moTa: data.moTa || null,
    };
    if (editingThietBi) {
      updateThietBiMutation.mutate({ id: editingThietBi.thietBiID, payload });
    } else {
      createThietBiMutation.mutate(payload);
    }
  };

  const handleDeleteConfirm = () => {
    if (thietBiToDelete) {
      deleteThietBiMutation.mutate(thietBiToDelete.thietBiID);
    }
  };

  // --- Quyền ---
  const canManageEquipment =
    hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG);

  if (!isLoading && !canManageEquipment && !isFetching) {
    return (
      <DashboardLayout pageTitle="Quản Lý Danh Mục Trang Thiết Bị">
        <div className="flex flex-col items-center justify-center py-24">
          <Info className="h-16 w-16 text-blue-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Bạn không có quyền truy cập trang này.
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập chức năng
            quản lý trang thiết bị.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const thietBiList = paginatedThietBi?.items || [];
  const totalPages = paginatedThietBi?.totalPages || 1;
  const currentPage = paginatedThietBi?.currentPage || 1;

  return (
    <DashboardLayout
      pageTitle="Quản Lý Danh Mục Trang Thiết Bị"
      headerActions={
        canManageEquipment && (
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Thiết Bị Mới
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
            <CardTitle className="text-2xl">Danh Mục Trang Thiết Bị</CardTitle>
            <CardDescription>
              Quản lý các loại trang thiết bị có thể được sử dụng trong các
              phòng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên thiết bị..."
                  className="pl-10 h-10 rounded-lg shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {(isLoading || isFetching) && !thietBiList.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoading && thietBiList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-xl font-semibold">
                  Chưa có loại thiết bị nào.
                </p>
                {canManageEquipment && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateModal}
                    >
                      thêm thiết bị mới
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
                      {/* <TableHead className="w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">Mã TB</TableHead> */}
                      <TableHead className="min-w-[250px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Tên Thiết Bị
                      </TableHead>
                      <TableHead className="min-w-[300px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mô Tả
                      </TableHead>
                      {/* <TableHead className="text-center w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">Active</TableHead> */}
                      {canManageEquipment && (
                        <TableHead className="text-right w-[130px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                          Thao tác
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {thietBiList.map((tb) => (
                      <TableRow
                        key={tb.thietBiID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* <TableCell className="font-mono py-3 px-4 text-sm">{tb.maThietBi || '-'}</TableCell> */}
                        <TableCell className="font-medium py-3 px-4 text-primary dark:text-sky-400">
                          {tb.tenThietBi}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground truncate max-w-md">
                          {tb.moTa || 'Không có mô tả'}
                        </TableCell>
                        {/* <TableCell className="text-center py-3 px-4">{tb.isActive ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto"/> : <XCircle className="h-5 w-5 text-red-500 mx-auto"/>}</TableCell> */}
                        {canManageEquipment && (
                          <TableCell className="text-right py-3 px-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(tb)}
                                title="Sửa thiết bị"
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(tb)}
                                title="Xóa thiết bị"
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

            {paginatedThietBi && totalPages > 1 && (
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

      {/* Dialog Thêm/Sửa Trang Thiết Bị */}
      <Dialog
        open={isFormModalOpen && canManageEquipment}
        onOpenChange={(open) => {
          if (!open) {
            setEditingThietBi(null);
            form.reset();
          }
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingThietBi
                ? 'Chỉnh Sửa Trang Thiết Bị'
                : 'Thêm Trang Thiết Bị Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingThietBi
                ? `Cập nhật thông tin cho thiết bị ${editingThietBi.tenThietBi}.`
                : 'Điền thông tin để tạo một loại thiết bị mới.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitThietBi)}
              className="space-y-6 py-2"
            >
              <FormField
                control={form.control}
                name="tenThietBi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên Thiết Bị <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Máy chiếu vật thể Avermedia"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Bỏ qua MaThietBi nếu không có trong DB */}
              <FormField
                control={form.control}
                name="moTa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô Tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về thiết bị, thông số kỹ thuật (nếu cần)..."
                        {...field}
                        value={field.value ?? ''}
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Thêm Checkbox cho IsActive nếu có */}
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    createThietBiMutation.isPending ||
                    updateThietBiMutation.isPending
                  }
                >
                  {(createThietBiMutation.isPending ||
                    updateThietBiMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingThietBi ? 'Lưu Thay Đổi' : 'Thêm Thiết Bị'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Trang Thiết Bị */}
      <Dialog
        open={showDeleteConfirm && !!thietBiToDelete}
        onOpenChange={setShowDeleteConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác nhận Xóa Thiết
              Bị
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vĩnh viễn loại thiết bị:{' '}
              <strong className="text-foreground">
                {thietBiToDelete?.tenThietBi}
              </strong>
              ?
              <br />
              Hành động này không thể hoàn tác và chỉ nên thực hiện nếu loại
              thiết bị này không còn được gán cho bất kỳ phòng nào.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setThietBiToDelete(null)}
              >
                Không, Hủy bỏ
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteThietBiMutation.isPending}
            >
              {deleteThietBiMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Có, Xóa Thiết Bị
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default EquipmentPage;
