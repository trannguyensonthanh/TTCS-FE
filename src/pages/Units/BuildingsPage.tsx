import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useToaNhaList,
  useCreateToaNha,
  useUpdateToaNha,
  useDeleteToaNha,
  // useToaNhaDetail, // Có thể không cần nếu modal sửa dùng data từ list item
} from '@/hooks/queries/toaNhaQueries';

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import LoaiDonVi from '@/enums/LoaiDonVi.enum';

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
  Building as BuildingIcon,
  MapPinned,
  Info,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { GetToaNhaParams, ToaNhaResponse } from '@/services/toaNha.service';
import { useDonViList } from '@/hooks/queries/donViQueries';
import { motion } from 'framer-motion';
// --- Zod Schema for ToaNha Form ---
const toaNhaFormSchema = z.object({
  maToaNha: z
    .string()
    .min(1, 'Mã tòa nhà không được trống')
    .max(20, 'Tối đa 20 ký tự'),
  tenToaNha: z
    .string()
    .min(1, 'Tên tòa nhà không được trống')
    .max(100, 'Tối đa 100 ký tự'),
  coSoID: z
    .string()
    .refine((val) => val !== '', { message: 'Vui lòng chọn cơ sở.' }),
  moTaToaNha: z.string().max(255, 'Tối đa 255 ký tự').optional().nullable(),
});
type ToaNhaFormValues = z.infer<typeof toaNhaFormSchema>;

// ---- Component Chính ----
const BuildingsPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterParams, setFilterParams] = useState<GetToaNhaParams>({
    page: 1,
    limit: 10,
    sortBy: 'TenToaNha',
    sortOrder: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingToaNha, setEditingToaNha] = useState<ToaNhaResponse | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toaNhaToDelete, setToaNhaToDelete] = useState<ToaNhaResponse | null>(
    null
  );

  // --- Data Fetching ---
  const {
    data: paginatedToaNha,
    isLoading,
    isFetching,
    refetch: refetchToaNhaList,
  } = useToaNhaList(filterParams);
  const toaNhaList = paginatedToaNha?.items || [];
  const totalPages = paginatedToaNha?.totalPages || 1;
  const currentPage = paginatedToaNha?.currentPage || 1;
  const { data: dsCoSo, isLoading: isLoadingCoSo } = useDonViList(
    { loaiDonVi: LoaiDonVi.CO_SO, limit: 100 },
    { enabled: true } // Luôn fetch danh sách cơ sở để dùng cho filter
  );

  // --- Mutations ---
  const createToaNhaMutation = useCreateToaNha({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
    },
  });
  const updateToaNhaMutation = useUpdateToaNha({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
      setEditingToaNha(null);
    },
  });
  const deleteToaNhaMutation = useDeleteToaNha({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setToaNhaToDelete(null);
    },
  });

  // --- Form Handling ---
  const form = useForm<ToaNhaFormValues>({
    resolver: zodResolver(toaNhaFormSchema),
    defaultValues: { maToaNha: '', tenToaNha: '', coSoID: '', moTaToaNha: '' },
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
    form.reset({ maToaNha: '', tenToaNha: '', coSoID: '', moTaToaNha: '' });
    setEditingToaNha(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (toaNha: ToaNhaResponse) => {
    setEditingToaNha(toaNha);
    form.reset({
      maToaNha: toaNha.maToaNha,
      tenToaNha: toaNha.tenToaNha,
      coSoID: toaNha.coSo.donViID.toString(),
      moTaToaNha: toaNha.moTaToaNha || '',
    });
    setIsFormModalOpen(true);
  };

  const openDeleteConfirm = (toaNha: ToaNhaResponse) => {
    setToaNhaToDelete(toaNha);
    setShowDeleteConfirm(true);
  };

  const onSubmitToaNha: SubmitHandler<ToaNhaFormValues> = (data) => {
    const payload = {
      maToaNha: data.maToaNha,
      tenToaNha: data.tenToaNha,
      coSoID: parseInt(data.coSoID, 10),
      moTaToaNha: data.moTaToaNha || null,
    };
    if (editingToaNha) {
      updateToaNhaMutation.mutate({ id: editingToaNha.toaNhaID, payload });
    } else {
      createToaNhaMutation.mutate(payload);
    }
  };

  const handleDeleteConfirm = () => {
    if (toaNhaToDelete) {
      deleteToaNhaMutation.mutate(toaNhaToDelete.toaNhaID);
    }
  };

  // --- Quyền ---
  const canManageToaNha = hasRole(MaVaiTro.ADMIN_HE_THONG); // Chỉ Admin được quản lý Tòa Nhà
  const canViewPage = canManageToaNha || hasRole(MaVaiTro.QUAN_LY_CSVC);

  if (!isLoading && !canViewPage) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="flex flex-col items-center justify-center h-full text-center py-24">
          <ShieldCheck className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-muted-foreground mb-6">
            Bạn không có quyền xem hoặc quản lý danh sách tòa nhà.
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </DashboardLayout>
    );
  }
  if (isLoading && !toaNhaList?.length && !isFetching) {
    return (
      <DashboardLayout pageTitle="Quản Lý Tòa Nhà">
        <div className="text-center py-10">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Quản Lý Tòa Nhà"
      headerActions={
        canManageToaNha && (
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Tòa Nhà Mới
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
            <CardTitle className="text-2xl">Danh Sách Tòa Nhà</CardTitle>
            <CardDescription>
              Quản lý thông tin các tòa nhà trong Học viện.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên hoặc mã tòa nhà..."
                  className="pl-10 h-10 rounded-lg shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                value={filterParams.coSoID?.toString() || 'all'}
                onValueChange={(value) => {
                  setFilterParams((prev) => ({
                    ...prev,
                    coSoID: value === 'all' ? undefined : parseInt(value),
                    page: 1,
                  }));
                }}
                disabled={isLoadingCoSo}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-10 rounded-lg shadow-inner">
                  <SelectValue
                    placeholder={
                      isLoadingCoSo ? 'Đang tải Cơ sở...' : 'Lọc theo Cơ sở'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Cơ sở</SelectItem>
                  {dsCoSo?.map((cs) => (
                    <SelectItem key={cs.donViID} value={cs.donViID.toString()}>
                      {cs.tenDonVi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(isLoading || isFetching) && !toaNhaList.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoading && toaNhaList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BuildingIcon className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-xl font-semibold">Chưa có tòa nhà nào.</p>
                {canManageToaNha && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateModal}
                    >
                      thêm tòa nhà mới
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
                      <TableHead className="w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mã Tòa Nhà
                      </TableHead>
                      <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Tên Tòa Nhà
                      </TableHead>
                      <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Thuộc Cơ Sở
                      </TableHead>
                      <TableHead className="min-w-[250px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mô Tả
                      </TableHead>
                      {canManageToaNha && (
                        <TableHead className="text-right w-[130px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                          Thao tác
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {toaNhaList.map((tn) => (
                      <TableRow
                        key={tn.toaNhaID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell className="font-mono py-3 px-4 text-sm">
                          {tn.maToaNha}
                        </TableCell>
                        <TableCell className="font-medium py-3 px-4 text-primary dark:text-ptit-red">
                          {tn.tenToaNha}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                          {tn.coSo.tenDonVi}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground truncate max-w-xs">
                          {tn.moTaToaNha || 'Không có mô tả'}
                        </TableCell>
                        {canManageToaNha && (
                          <TableCell className="text-right py-3 px-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(tn)}
                                title="Sửa tòa nhà"
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(tn)}
                                title="Xóa tòa nhà"
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

            {paginatedToaNha && totalPages > 1 && (
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

      <Dialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingToaNha(null);
            form.reset();
          }
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingToaNha ? 'Chỉnh Sửa Tòa Nhà' : 'Thêm Tòa Nhà Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingToaNha
                ? `Cập nhật thông tin cho tòa nhà ${editingToaNha.tenToaNha}.`
                : 'Điền thông tin để tạo một tòa nhà mới trong hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitToaNha)}
              className="space-y-6 py-2"
            >
              <FormField
                control={form.control}
                name="maToaNha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã Tòa Nhà <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: A, B, PTIT_Q9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tenToaNha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên Tòa Nhà <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Tòa nhà Giảng đường A"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coSoID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Thuộc Cơ Sở <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isLoadingCoSo}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingCoSo
                                ? 'Đang tải DS Cơ sở...'
                                : 'Chọn cơ sở'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dsCoSo?.map((cs) => (
                          <SelectItem
                            key={cs.donViID}
                            value={cs.donViID.toString()}
                          >
                            {cs.tenDonVi}
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
                name="moTaToaNha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô Tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về tòa nhà ( )..."
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
                    createToaNhaMutation.isPending ||
                    updateToaNhaMutation.isPending
                  }
                >
                  {(createToaNhaMutation.isPending ||
                    updateToaNhaMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingToaNha ? 'Lưu Thay Đổi' : 'Thêm Tòa Nhà'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Tòa Nhà */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác nhận Xóa Tòa
              Nhà
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vĩnh viễn tòa nhà:{' '}
              <strong className="text-foreground">
                {toaNhaToDelete?.tenToaNha} ({toaNhaToDelete?.maToaNha})
              </strong>
              ?
              <br />
              Hành động này không thể hoàn tác và có thể ảnh hưởng đến dữ liệu
              các tầng và phòng liên quan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Không, Hủy bỏ</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteToaNhaMutation.isPending}
            >
              {deleteToaNhaMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Có, Xóa Tòa Nhà
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BuildingsPage;
