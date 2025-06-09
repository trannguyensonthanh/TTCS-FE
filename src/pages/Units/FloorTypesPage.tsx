import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useLoaiTangList,
  useCreateLoaiTang,
  useUpdateLoaiTang,
  useDeleteLoaiTang,
} from '@/hooks/queries/loaiTangQueries'; // Đảm bảo đường dẫn đúng

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
  DialogTrigger,
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
  Layers,
  SortAsc,
  HelpCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  GetLoaiTangParams,
  LoaiTangResponse,
} from '@/services/loaiTang.service';
import { motion } from 'framer-motion';
// --- Zod Schema for LoaiTang Form ---
const loaiTangFormSchema = z.object({
  maLoaiTang: z
    .string()
    .min(1, 'Mã loại tầng không được trống')
    .max(20, 'Tối đa 20 ký tự.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Mã chỉ chứa chữ, số, gạch dưới, gạch nối.'),
  tenLoaiTang: z
    .string()
    .min(1, 'Tên loại tầng không được trống')
    .max(100, 'Tối đa 100 ký tự.'),
  soThuTu: z.coerce
    .number()
    .int('Số thứ tự phải là số nguyên.')
    .optional()
    .nullable(),
  moTa: z.string().max(255, 'Tối đa 255 ký tự.').optional().nullable(),
});
type LoaiTangFormValues = z.infer<typeof loaiTangFormSchema>;

// ---- Component Chính ----
const FloorTypesPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();

  const [filterParams, setFilterParams] = useState<GetLoaiTangParams>({
    page: 1,
    limit: 10,
    sortBy: 'SoThuTu',
    sortOrder: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLoaiTang, setEditingLoaiTang] =
    useState<LoaiTangResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loaiTangToDelete, setLoaiTangToDelete] =
    useState<LoaiTangResponse | null>(null);

  // --- Data Fetching ---
  const {
    data: paginatedLoaiTang,
    isLoading,
    isFetching,
    refetch: refetchLoaiTangList,
  } = useLoaiTangList(filterParams, {
    enabled: hasRole(MaVaiTro.ADMIN_HE_THONG) || hasRole(MaVaiTro.QUAN_LY_CSVC), // QUAN_LY_CSVC có thể được xem
  });

  console.log('Paginated Loai Tang:', paginatedLoaiTang);

  // --- Mutations ---
  const createLoaiTangMutation = useCreateLoaiTang({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
    },
  });
  const updateLoaiTangMutation = useUpdateLoaiTang({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
      setEditingLoaiTang(null);
    },
  });
  const deleteLoaiTangMutation = useDeleteLoaiTang({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setLoaiTangToDelete(null);
    },
  });

  // --- Form Handling ---
  const form = useForm<LoaiTangFormValues>({
    resolver: zodResolver(loaiTangFormSchema),
    defaultValues: {
      maLoaiTang: '',
      tenLoaiTang: '',
      soThuTu: undefined,
      moTa: '',
    },
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
    form.reset({
      maLoaiTang: '',
      tenLoaiTang: '',
      soThuTu: undefined,
      moTa: '',
    });
    setEditingLoaiTang(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (loaiTang: LoaiTangResponse) => {
    setEditingLoaiTang(loaiTang);
    form.reset({
      maLoaiTang: loaiTang.maLoaiTang,
      tenLoaiTang: loaiTang.tenLoaiTang,
      soThuTu: loaiTang.soThuTu ?? undefined,
      moTa: loaiTang.moTa || '',
    });
    setIsFormModalOpen(true);
  };

  const openDeleteConfirm = (loaiTang: LoaiTangResponse) => {
    setLoaiTangToDelete(loaiTang);
    setShowDeleteConfirm(true);
  };

  const onSubmitLoaiTang: SubmitHandler<LoaiTangFormValues> = (data) => {
    const payload = {
      ...data,
      soThuTu:
        data.soThuTu === undefined ||
        data.soThuTu === null ||
        isNaN(Number(data.soThuTu))
          ? null
          : Number(data.soThuTu),
      moTa: data.moTa || null,
    };
    if (editingLoaiTang) {
      updateLoaiTangMutation.mutate({
        id: editingLoaiTang.loaiTangID,
        payload,
      });
    } else {
      createLoaiTangMutation.mutate({
        maLoaiTang: data.maLoaiTang,
        tenLoaiTang: data.tenLoaiTang,
        soThuTu:
          data.soThuTu === undefined ||
          data.soThuTu === null ||
          isNaN(Number(data.soThuTu))
            ? null
            : Number(data.soThuTu),
        moTa: data.moTa || null,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (loaiTangToDelete) {
      deleteLoaiTangMutation.mutate(loaiTangToDelete.loaiTangID);
    }
  };

  // --- Quyền ---
  // Chỉ Admin được quản lý Loại Tầng. CSVC có thể được quyền xem.
  const canManageLoaiTang = hasRole(MaVaiTro.ADMIN_HE_THONG);
  const canViewPage = canManageLoaiTang || hasRole(MaVaiTro.QUAN_LY_CSVC);

  if (!isLoading && !canViewPage && !isFetching) {
    // Thêm !isFetching để tránh render lỗi sớm
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-muted-foreground">
            Bạn không có quyền xem hoặc quản lý Loại Tầng.
          </p>
          <Button onClick={() => navigate(-1)} className="mt-6">
            Quay lại
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const loaiTangList = paginatedLoaiTang?.items || [];
  const totalPages = paginatedLoaiTang?.totalPages || 1;
  const currentPage = paginatedLoaiTang?.currentPage || 1;

  return (
    <DashboardLayout
      pageTitle="Quản Lý Loại Tầng"
      headerActions={
        canManageLoaiTang && (
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Loại Tầng Mới
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
        <Card className="shadow-xl border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">Danh Sách Loại Tầng</CardTitle>
            <CardDescription>
              Định nghĩa các loại tầng trừu tượng sử dụng trong các tòa nhà (VD:
              Trệt, Lầu 1, Hầm B1).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên hoặc mã loại tầng..."
                  className="pl-10 h-10 rounded-lg shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {(isLoading || isFetching) && !loaiTangList.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoading && loaiTangList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Layers className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-xl font-semibold">Chưa có loại tầng nào.</p>
                {canManageLoaiTang && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateModal}
                    >
                      thêm loại tầng mới
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
                      <TableHead className="w-[120px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mã Loại Tầng
                      </TableHead>
                      <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Tên Loại Tầng
                      </TableHead>
                      <TableHead className="w-[100px] text-center px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Số Thứ Tự
                      </TableHead>
                      <TableHead className="min-w-[250px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mô Tả
                      </TableHead>
                      {canManageLoaiTang && (
                        <TableHead className="text-right w-[130px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                          Thao tác
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loaiTangList.map((lt) => (
                      <TableRow
                        key={lt.loaiTangID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell className="font-mono py-3 px-4 text-sm">
                          {lt.maLoaiTang}
                        </TableCell>
                        <TableCell className="font-medium py-3 px-4 text-primary dark:text-sky-400">
                          {lt.tenLoaiTang}
                        </TableCell>
                        <TableCell className="text-center text-sm py-3 px-4 text-muted-foreground">
                          {lt.soThuTu ?? '-'}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground truncate max-w-xs">
                          {lt.moTa || 'Không có mô tả'}
                        </TableCell>
                        {canManageLoaiTang && (
                          <TableCell className="text-right py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(lt)}
                                title="Sửa loại tầng"
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(lt)}
                                title="Xóa loại tầng"
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

            {paginatedLoaiTang && totalPages > 1 && (
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

      {/* Dialog Thêm/Sửa Loại Tầng */}
      <Dialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLoaiTang(null);
            form.reset();
          }
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingLoaiTang ? 'Chỉnh Sửa Loại Tầng' : 'Thêm Loại Tầng Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingLoaiTang
                ? `Cập nhật thông tin cho loại tầng ${editingLoaiTang.tenLoaiTang}.`
                : 'Điền thông tin để tạo một loại tầng mới.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitLoaiTang)}
              className="space-y-6 py-2"
            >
              <FormField
                control={form.control}
                name="maLoaiTang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã Loại Tầng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: L1, TRET, HB1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tenLoaiTang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên Loại Tầng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Tầng 1, Tầng Trệt, Hầm B1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="soThuTu"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Số Thứ Tự</FormLabel>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="w-60">
                            <p>
                              Dùng để sắp xếp hiển thị các tầng. Ví dụ: Hầm B1
                              (-1), Trệt (0), Lầu 1 (1), Lầu 2 (2)...
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 1, 0, -1"
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
                    <FormLabel>Mô Tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về loại tầng này (nếu có)..."
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
                    createLoaiTangMutation.isPending ||
                    updateLoaiTangMutation.isPending
                  }
                >
                  {(createLoaiTangMutation.isPending ||
                    updateLoaiTangMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingLoaiTang ? 'Lưu Thay Đổi' : 'Thêm Loại Tầng'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Loại Tầng */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác nhận Xóa Loại
              Tầng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vĩnh viễn loại tầng:{' '}
              <strong className="text-foreground">
                {loaiTangToDelete?.tenLoaiTang} ({loaiTangToDelete?.maLoaiTang})
              </strong>
              ?
              <br />
              Hành động này không thể hoàn tác và chỉ nên thực hiện nếu loại
              tầng này không còn được sử dụng bởi bất kỳ tầng vật lý nào.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Không, Hủy bỏ</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoaiTangMutation.isPending}
            >
              {deleteLoaiTangMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Có, Xóa Loại Tầng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FloorTypesPage;
