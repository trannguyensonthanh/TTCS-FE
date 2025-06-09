import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useLopHocList,
  useCreateLopHoc,
  useUpdateLopHoc,
  useDeleteLopHoc,
  // useLopHocDetail, // Có thể không cần nếu modal sửa dùng data từ list item
} from '@/hooks/queries/lopHocQueries'; // Đảm bảo đường dẫn đúng
import { motion } from 'framer-motion';
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
  GraduationCap,
  BookOpen,
  ChevronDown,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Label } from '@/components/ui/label';
import {
  GetLopHocParams,
  LopHocListItemResponse,
} from '@/services/lopHoc.service';
import { useNguoiDungListForSelect } from '@/hooks/queries/nguoiDungQueries';
import {
  useChuyenNganhListForSelectByNganh,
  useNganhHocListForSelect,
} from '@/hooks/queries/danhMucQueries';

// --- Zod Schema for LopHoc Form ---
const lopHocFormSchema = z.object({
  tenLop: z
    .string()
    .min(1, 'Tên lớp không được trống')
    .max(100, 'Tối đa 100 ký tự.'),
  maLop: z.string().max(50, 'Tối đa 50 ký tự.').optional().nullable(),
  nganhHocID: z
    .string()
    .refine((val) => val !== '', { message: 'Vui lòng chọn ngành học.' }),
  chuyenNganhID: z.string().optional().nullable(),
  nienKhoa: z.string().max(50, 'Tối đa 50 ký tự.').optional().nullable(),
  // gvcnID: z.string().optional().nullable(), // Nếu có GVCN
});
type LopHocFormValues = z.infer<typeof lopHocFormSchema>;

// ---- Component Chính ----
const ClassesPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();

  const [filterParams, setFilterParams] = useState<GetLopHocParams>({
    page: 1,
    limit: 10,
    sortBy: 'TenLop',
    sortOrder: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // State cho các bộ lọc khác nếu cần (VD: filterNganhHocID)
  const [filterNganhHocID, setFilterNganhHocID] = useState<string | undefined>(
    undefined
  );

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLopHoc, setEditingLopHoc] =
    useState<LopHocListItemResponse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lopHocToDelete, setLopHocToDelete] =
    useState<LopHocListItemResponse | null>(null);

  // --- Data Fetching ---
  const {
    data: paginatedLopHoc,
    isLoading,
    isFetching,
    refetch: refetchLopHocList,
  } = useLopHocList(filterParams, {
    enabled: hasRole(MaVaiTro.ADMIN_HE_THONG), // Chỉ Admin mới xem được trang quản lý này
  });

  // Data cho Selects trong Form
  const { data: dsNganhHoc, isLoading: isLoadingNganhHoc } =
    useNganhHocListForSelect({ limit: 200 }, { enabled: isFormModalOpen });

  const selectedNganhHocIDForForm =
    useForm<LopHocFormValues>().watch('nganhHocID');
  const { data: dsChuyenNganh, isLoading: isLoadingChuyenNganh } =
    useChuyenNganhListForSelectByNganh(
      selectedNganhHocIDForForm
        ? parseInt(selectedNganhHocIDForForm)
        : undefined,
      { limit: 100 },
      { enabled: isFormModalOpen && !!selectedNganhHocIDForForm } // Chỉ fetch khi có ngành được chọn
    );
  const { data: dsGiangVien, isLoading: isLoadingGVCN } =
    useNguoiDungListForSelect(
      // Nếu có GVCN
      { maVaiTro: 'GIANG_VIEN', limit: 200 },
      { enabled: isFormModalOpen }
    );

  // --- Mutations ---
  const createLopHocMutation = useCreateLopHoc({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
    },
  });
  const updateLopHocMutation = useUpdateLopHoc({
    onSuccess: () => {
      setIsFormModalOpen(false);
      form.reset();
      setEditingLopHoc(null);
    },
  });
  const deleteLopHocMutation = useDeleteLopHoc({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setLopHocToDelete(null);
    },
  });

  // --- Form Handling ---
  const form = useForm<LopHocFormValues>({
    resolver: zodResolver(lopHocFormSchema),
    defaultValues: {
      tenLop: '',
      maLop: '',
      nganhHocID: '',
      chuyenNganhID: undefined,
      nienKhoa: '',
    },
  });

  // Reset ChuyenNganhID khi NganhHocID thay đổi
  useEffect(() => {
    if (selectedNganhHocIDForForm) {
      form.setValue('chuyenNganhID', undefined); // Reset khi ngành thay đổi
    }
  }, [selectedNganhHocIDForForm, form]);

  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      nganhHocID: filterNganhHocID ? parseInt(filterNganhHocID) : undefined,
      page: 1,
    }));
  }, [debouncedSearchTerm, filterNganhHocID]);

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openCreateModal = () => {
    setIsFormModalOpen(true);
    setEditingLopHoc(null);
    form.reset();
  };
  const openEditModal = (lopHoc: LopHocListItemResponse) => {
    setEditingLopHoc(lopHoc);
    setIsFormModalOpen(true);
    form.reset({
      tenLop: lopHoc.tenLop || '',
      maLop: lopHoc.maLop || '',
      nganhHocID: lopHoc.nganhHoc.nganhHocID.toString(),
      chuyenNganhID: lopHoc.chuyenNganh?.chuyenNganhID
        ? lopHoc.chuyenNganh.chuyenNganhID.toString()
        : undefined,
      nienKhoa: lopHoc.nienKhoa || '',
    });
  };
  const openDeleteConfirm = (lopHoc: LopHocListItemResponse) => {
    setLopHocToDelete(lopHoc);
    setShowDeleteConfirm(true);
  };

  const onSubmitLopHoc: SubmitHandler<LopHocFormValues> = (data) => {
    const payload = {
      tenLop: data.tenLop, // Ensure tenLop is always present
      nganhHocID: parseInt(data.nganhHocID, 10),
      chuyenNganhID: data.chuyenNganhID
        ? parseInt(data.chuyenNganhID, 10)
        : null,
      maLop: data.maLop || null,
      nienKhoa: data.nienKhoa || null,
      // gvcnID: data.gvcnID ? parseInt(data.gvcnID, 10) : null,
    };
    if (editingLopHoc) {
      updateLopHocMutation.mutate({ id: editingLopHoc.lopID, payload });
    } else {
      createLopHocMutation.mutate(payload);
    }
  };
  const handleDeleteConfirm = () => {
    /* ... */
  };

  const canManagePage = hasRole(MaVaiTro.ADMIN_HE_THONG);

  if (!isLoading && !canManagePage && !isFetching) {
    return (
      <DashboardLayout pageTitle="Quản Lý Lớp Học">
        <div className="flex flex-col items-center justify-center py-20 text-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Bạn không có quyền truy cập trang này.
          </h2>
          <p>Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.</p>
        </div>
      </DashboardLayout>
    );
  }

  const lopHocList = paginatedLopHoc?.items || [];
  const totalPages = paginatedLopHoc?.totalPages || 1;
  const currentPage = paginatedLopHoc?.currentPage || 1;

  return (
    <DashboardLayout
      pageTitle="Quản Lý Lớp Học"
      headerActions={
        canManagePage && (
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Lớp Học Mới
          </Button>
        )
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        <Card className="shadow-xl border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">Danh Sách Lớp Học</CardTitle>
            <CardDescription>
              Quản lý thông tin các lớp học, bao gồm ngành và chuyên ngành.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
              <div className="lg:col-span-1">
                <Label
                  htmlFor="search-lophoc"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-lophoc"
                    type="search"
                    placeholder="Tên lớp, mã lớp..."
                    className="pl-10 h-10 rounded-lg shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="filter-nganhhoc"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Lọc theo Ngành
                </Label>
                <Select
                  value={filterNganhHocID}
                  onValueChange={(value) =>
                    setFilterNganhHocID(value === 'all' ? undefined : value)
                  }
                  disabled={isLoadingNganhHoc}
                >
                  <SelectTrigger id="filter-nganhhoc">
                    <SelectValue
                      placeholder={
                        isLoadingNganhHoc ? 'Tải...' : 'Tất cả ngành'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ngành</SelectItem>
                    {dsNganhHoc?.map((ng) => (
                      <SelectItem
                        key={ng.nganhHocID}
                        value={ng.nganhHocID.toString()}
                      >
                        {ng.tenNganhHoc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Có thể thêm Select lọc theo Khoa Quản Lý (DonVi) hoặc Niên Khóa */}
            </div>

            {(isLoading || isFetching) && !lopHocList.length ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Đang tải dữ liệu lớp học...</span>
              </div>
            ) : !isLoading && lopHocList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <GraduationCap className="h-10 w-10 mb-2" />
                <span>Không có lớp học nào được tìm thấy.</span>
              </div>
            ) : (
              /* Table */
              <div className="rounded-md border shadow-sm bg-card dark:border-slate-800 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 dark:bg-slate-800/30">
                      <TableHead className="w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Mã Lớp
                      </TableHead>
                      <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Tên Lớp
                      </TableHead>
                      <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Ngành Học
                      </TableHead>
                      <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Chuyên Ngành
                      </TableHead>
                      <TableHead className="min-w-[150px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Khoa QL
                      </TableHead>
                      <TableHead className="w-[120px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Niên Khóa
                      </TableHead>
                      <TableHead className="text-center w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                        Sĩ Số
                      </TableHead>
                      {canManagePage && (
                        <TableHead className="text-right w-[130px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                          Thao tác
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lopHocList.map((lop) => (
                      <TableRow
                        key={lop.lopID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <TableCell className="font-mono py-3 px-4 text-sm">
                          {lop.maLop || '-'}
                        </TableCell>
                        <TableCell className="font-medium py-3 px-4 text-primary dark:text-sky-400">
                          {lop.tenLop}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                          {lop.nganhHoc.tenNganhHoc}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                          {lop.chuyenNganh?.tenChuyenNganh || '-'}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                          {lop.khoaQuanLy.tenDonVi}
                        </TableCell>
                        <TableCell className="text-sm py-3 px-4 text-muted-foreground">
                          {lop.nienKhoa || '-'}
                        </TableCell>
                        <TableCell className="text-center text-sm py-3 px-4 text-muted-foreground">
                          {lop.soLuongSinhVien ?? '-'}
                        </TableCell>
                        {canManagePage && (
                          <TableCell className="text-right py-3 px-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(lop)}
                                title="Sửa lớp"
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(lop)}
                                title="Xóa lớp"
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
            {paginatedLopHoc && totalPages > 1 && (
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

      {/* Dialog Thêm/Sửa Lớp Học */}
      <Dialog
        open={isFormModalOpen && canManagePage}
        onOpenChange={(open) => {
          if (!open) {
            setEditingLopHoc(null);
            form.reset();
          }
          setIsFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingLopHoc ? 'Chỉnh Sửa Lớp Học' : 'Thêm Lớp Học Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingLopHoc
                ? `Cập nhật cho lớp ${editingLopHoc.tenLop}.`
                : 'Điền thông tin để tạo lớp học mới.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitLopHoc)}
              className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-3"
            >
              <FormField
                control={form.control}
                name="tenLop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên Lớp <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: D20CNTT01-N" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maLop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Lớp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: D20CN01N"
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
                name="nganhHocID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ngành Học <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('chuyenNganhID', undefined);
                      }}
                      value={field.value || ''}
                      disabled={isLoadingNganhHoc}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingNganhHoc ? 'Tải...' : 'Chọn ngành học'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dsNganhHoc?.map((ng) => (
                          <SelectItem
                            key={ng.nganhHocID}
                            value={ng.nganhHocID.toString()}
                          >
                            {ng.tenNganhHoc} ({ng.maNganhHoc})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Chỉ hiển thị chọn Chuyên ngành nếu Ngành đã chọn CÓ chuyên ngành */}
              {dsNganhHoc?.find(
                (ng) => ng.nganhHocID.toString() === selectedNganhHocIDForForm
              )?.coChuyenNganh && (
                <FormField
                  control={form.control}
                  name="chuyenNganhID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chuyên Ngành (nếu có)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                        disabled={
                          isLoadingChuyenNganh || !selectedNganhHocIDForForm
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingChuyenNganh
                                  ? 'Tải...'
                                  : 'Chọn chuyên ngành (nếu có)'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">
                            Không chọn chuyên ngành
                          </SelectItem>
                          {dsChuyenNganh?.map((cn) => (
                            <SelectItem
                              key={cn.chuyenNganhID}
                              value={cn.chuyenNganhID.toString()}
                            >
                              {cn.tenChuyenNganh} ({cn.maChuyenNganh})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="nienKhoa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niên Khóa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 2020-2024"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField control={form.control} name="gvcnID" render={...} /> Nếu có quản lý GVCN */}
              <DialogFooter className="pt-4 border-t mt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    createLopHocMutation.isPending ||
                    updateLopHocMutation.isPending
                  }
                >
                  {(createLopHocMutation.isPending ||
                    updateLopHocMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingLopHoc ? 'Lưu Thay Đổi' : 'Thêm Lớp Học'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Xác Nhận Xóa Lớp Học */}
      <Dialog
        open={showDeleteConfirm && !!lopHocToDelete}
        onOpenChange={setShowDeleteConfirm}
      >
        {/* ... (JSX tương tự dialog xóa khác, thay đổi text cho Lớp Học) ... */}
      </Dialog>
    </DashboardLayout>
  );
};

export default ClassesPage;
