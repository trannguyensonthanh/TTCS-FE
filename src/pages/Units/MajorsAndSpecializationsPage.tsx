import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form'; // Import SubmitHandler
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Loader2,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  FilePlus,
  Edit3,
  PackageOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  GetNganhHocParams,
  NganhHocResponse,
} from '@/services/nganhHoc.service';
import { ChuyenNganhResponse } from '@/services/chuyenNganh.service';
import {
  useCreateNganhHoc,
  useDeleteNganhHoc,
  useNganhHocDetail,
  useNganhHocList,
  useUpdateNganhHoc,
} from '@/hooks/queries/nganhHocQueries';
import {
  useCreateChuyenNganh,
  useDeleteChuyenNganh,
  useUpdateChuyenNganh,
} from '@/hooks/queries/chuyenNganhQueries';
import { useDonViList } from '@/hooks/queries/donViQueries';

// --- Zod Schemas ---
const nganhHocFormSchema = z.object({
  maNganhHoc: z.string().max(50, 'Tối đa 50 ký tự.').optional().nullable(),
  tenNganhHoc: z
    .string()
    .min(1, 'Tên ngành học không được trống')
    .max(200, 'Tối đa 200 ký tự.'),
  khoaQuanLyID: z
    .string()
    .refine((val) => val !== '', { message: 'Vui lòng chọn khoa quản lý.' }),
  moTaNH: z.string().max(500, 'Tối đa 500 ký tự.').optional().nullable(),
  coChuyenNganh: z.boolean().default(false),
});
type NganhHocFormValues = z.infer<typeof nganhHocFormSchema>;

const chuyenNganhFormSchema = z.object({
  tenChuyenNganh: z
    .string()
    .min(1, 'Tên chuyên ngành không được trống')
    .max(200),
  maChuyenNganh: z.string().max(50).optional().nullable(),
  moTaCN: z.string().max(500).optional().nullable(),
});
type ChuyenNganhFormValues = z.infer<typeof chuyenNganhFormSchema>;

const MajorsAndSpecializationsPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();

  const [filterNganhParams, setFilterNganhParams] = useState<GetNganhHocParams>(
    { page: 1, limit: 10, sortBy: 'TenNganhHoc', sortOrder: 'asc' }
  );
  const [searchTermNganh, setSearchTermNganh] = useState('');
  const debouncedSearchNganh = useDebounce(searchTermNganh, 500);
  const [isNganhFormModalOpen, setIsNganhFormModalOpen] = useState(false);
  const [editingNganhHoc, setEditingNganhHoc] =
    useState<NganhHocResponse | null>(null);
  const [showDeleteNganhConfirm, setShowDeleteNganhConfirm] = useState(false);
  const [nganhHocToDelete, setNganhHocToDelete] =
    useState<NganhHocResponse | null>(null);

  const [isChuyenNganhFormModalOpen, setIsChuyenNganhFormModalOpen] =
    useState(false);
  const [editingChuyenNganh, setEditingChuyenNganh] =
    useState<ChuyenNganhResponse | null>(null);
  const [selectedNganhHocForCN, setSelectedNganhHocForCN] =
    useState<NganhHocResponse | null>(null);
  const [showDeleteChuyenNganhConfirm, setShowDeleteChuyenNganhConfirm] =
    useState(false);
  const [chuyenNganhToDelete, setChuyenNganhToDelete] =
    useState<ChuyenNganhResponse | null>(null);

  const [openNganhHocAccordionId, setOpenNganhHocAccordionId] = useState<
    string | undefined
  >(undefined);

  const {
    data: paginatedNganhHoc,
    isLoading: isLoadingNganhList,
    isFetching: isFetchingNganhList,
    refetch: refetchNganhHocList,
  } = useNganhHocList(filterNganhParams, {
    enabled: hasRole(MaVaiTro.ADMIN_HE_THONG),
  });

  const {
    data: nganhHocDetail,
    isLoading: isLoadingNganhDetail,
    refetch: refetchNganhDetail,
  } = useNganhHocDetail(
    openNganhHocAccordionId ? parseInt(openNganhHocAccordionId) : undefined,
    { enabled: !!openNganhHocAccordionId }
  );

  const { data: dsKhoa, isLoading: isLoadingKhoa } = useDonViList(
    { loaiDonVi: 'KHOA', limit: 100 },
    { enabled: isNganhFormModalOpen }
  );

  const createNganhHocMutation = useCreateNganhHoc({
    onSuccess: () => {
      setIsNganhFormModalOpen(false);
      formNganhHoc.reset();
    },
  });
  const updateNganhHocMutation = useUpdateNganhHoc({
    onSuccess: () => {
      setIsNganhFormModalOpen(false);
      formNganhHoc.reset();
      setEditingNganhHoc(null);
      refetchNganhHocList();
      if (openNganhHocAccordionId === editingNganhHoc?.nganhHocID.toString())
        refetchNganhDetail();
    },
  });
  const deleteNganhHocMutation = useDeleteNganhHoc({
    onSuccess: () => {
      setShowDeleteNganhConfirm(false);
      setNganhHocToDelete(null);
    },
  });

  const createChuyenNganhMutation = useCreateChuyenNganh(
    selectedNganhHocForCN?.nganhHocID ?? 0,
    {
      onSuccess: () => {
        setIsChuyenNganhFormModalOpen(false);
        formChuyenNganh.reset();
        if (openNganhHocAccordionId) refetchNganhDetail();
      },
    }
  );
  const updateChuyenNganhMutation = useUpdateChuyenNganh(
    selectedNganhHocForCN?.nganhHocID ?? 0,
    {
      onSuccess: () => {
        setIsChuyenNganhFormModalOpen(false);
        formChuyenNganh.reset();
        setEditingChuyenNganh(null);
        if (openNganhHocAccordionId) refetchNganhDetail();
      },
    }
  );
  const deleteChuyenNganhMutation = useDeleteChuyenNganh(
    selectedNganhHocForCN?.nganhHocID ?? 0,
    {
      onSuccess: () => {
        setShowDeleteChuyenNganhConfirm(false);
        setChuyenNganhToDelete(null);
        if (openNganhHocAccordionId) refetchNganhDetail();
      },
    }
  );

  const formNganhHoc = useForm<NganhHocFormValues>({
    resolver: zodResolver(nganhHocFormSchema),
    defaultValues: {
      coChuyenNganh: false,
      maNganhHoc: '',
      tenNganhHoc: '',
      khoaQuanLyID: '',
      moTaNH: '',
    },
  });
  const formChuyenNganh = useForm<ChuyenNganhFormValues>({
    resolver: zodResolver(chuyenNganhFormSchema),
    defaultValues: { tenChuyenNganh: '', maChuyenNganh: '', moTaCN: '' },
  });

  useEffect(() => {
    setFilterNganhParams((prev) => ({
      ...prev,
      searchTerm: debouncedSearchNganh || undefined,
      page: 1,
    }));
  }, [debouncedSearchNganh]);
  const handlePageChangeNganh = (newPage: number) =>
    setFilterNganhParams((prev) => ({ ...prev, page: newPage }));

  const openCreateNganhModal = () => {
    formNganhHoc.reset({
      maNganhHoc: '',
      tenNganhHoc: '',
      khoaQuanLyID: '',
      moTaNH: '',
      coChuyenNganh: false,
    });
    setEditingNganhHoc(null);
    setIsNganhFormModalOpen(true);
  };
  const openEditNganhModal = (nganh: NganhHocResponse) => {
    setEditingNganhHoc(nganh);
    formNganhHoc.reset({
      maNganhHoc: nganh.maNganhHoc || '',
      tenNganhHoc: nganh.tenNganhHoc,
      khoaQuanLyID: nganh.khoaQuanLy.donViID.toString(),
      moTaNH: nganh.moTaNH || '',
      coChuyenNganh: nganh.coChuyenNganh,
    });
    setIsNganhFormModalOpen(true);
  };
  const openDeleteNganhConfirm = (nganh: NganhHocResponse) => {
    setNganhHocToDelete(nganh);
    setShowDeleteNganhConfirm(true);
  };

  const onSubmitNganhHoc: SubmitHandler<NganhHocFormValues> = (data) => {
    const payload = {
      khoaQuanLyID: parseInt(data.khoaQuanLyID),
      tenNganhHoc: data.tenNganhHoc,
      coChuyenNganh: data.coChuyenNganh,
      maNganhHoc: data.maNganhHoc,
      moTaNH: data.moTaNH,
    };
    if (editingNganhHoc) {
      updateNganhHocMutation.mutate({
        id: editingNganhHoc.nganhHocID,
        payload,
      });
    } else {
      createNganhHocMutation.mutate(payload);
    }
  };
  const handleDeleteNganhConfirm = () => {
    if (nganhHocToDelete)
      deleteNganhHocMutation.mutate(nganhHocToDelete.nganhHocID);
  };

  const openCreateChuyenNganhModal = (nganhCha: NganhHocResponse) => {
    setSelectedNganhHocForCN(nganhCha);
    formChuyenNganh.reset();
    setEditingChuyenNganh(null);
    setIsChuyenNganhFormModalOpen(true);
  };
  const openEditChuyenNganhModal = (
    cn: ChuyenNganhResponse,
    nganhCha: NganhHocResponse
  ) => {
    setSelectedNganhHocForCN(nganhCha);
    setEditingChuyenNganh(cn);
    formChuyenNganh.reset({
      tenChuyenNganh: cn.tenChuyenNganh,
      maChuyenNganh: cn.maChuyenNganh || '',
      moTaCN: cn.moTaCN || '',
    });
    setIsChuyenNganhFormModalOpen(true);
  };
  const openDeleteChuyenNganhConfirm = (
    cn: ChuyenNganhResponse,
    nganhCha: NganhHocResponse
  ) => {
    setSelectedNganhHocForCN(nganhCha);
    setChuyenNganhToDelete(cn);
    setShowDeleteChuyenNganhConfirm(true);
  };

  const onSubmitChuyenNganh: SubmitHandler<ChuyenNganhFormValues> = (data) => {
    if (!selectedNganhHocForCN) return;
    const payload = {
      tenChuyenNganh: data.tenChuyenNganh,
      maChuyenNganh: data.maChuyenNganh ?? undefined,
      moTaCN: data.moTaCN ?? undefined,
    };
    if (editingChuyenNganh) {
      updateChuyenNganhMutation.mutate({
        id: editingChuyenNganh.chuyenNganhID,
        payload,
      });
    } else {
      createChuyenNganhMutation.mutate(payload);
    }
  };
  const handleDeleteChuyenNganhConfirm = () => {
    if (chuyenNganhToDelete)
      deleteChuyenNganhMutation.mutate(chuyenNganhToDelete.chuyenNganhID);
  };

  const canManage = hasRole(MaVaiTro.ADMIN_HE_THONG);
  if (!isLoadingNganhList && !canManage && !isFetchingNganhList) {
    return (
      <DashboardLayout pageTitle="Quản Lý Ngành & Chuyên Ngành">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Bạn không có quyền truy cập trang này.
          </h2>
          <p className="text-muted-foreground">
            Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const nganhHocList = paginatedNganhHoc?.items || [];
  const totalNganhPages = paginatedNganhHoc?.totalPages || 1;
  const currentNganhPage = paginatedNganhHoc?.currentPage || 1;

  const renderChuyenNganhTable = (
    chuyenNganhs?: ChuyenNganhResponse[],
    nganhCha?: NganhHocResponse
  ) => {
    if (!chuyenNganhs || chuyenNganhs.length === 0) {
      return (
        <p className="text-sm text-muted-foreground px-4 py-2">
          Ngành này chưa có chuyên ngành nào.
        </p>
      );
    }
    return (
      <div className="px-4 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Mã CN</TableHead>
              <TableHead>Tên Chuyên Ngành</TableHead>
              <TableHead>Mô Tả</TableHead>
              {canManage && (
                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {chuyenNganhs.map((cn) => (
              <TableRow key={cn.chuyenNganhID}>
                <TableCell className="font-mono text-xs">
                  {cn.maChuyenNganh || '-'}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {cn.tenChuyenNganh}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                  {cn.moTaCN || '-'}
                </TableCell>
                {canManage && nganhCha && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditChuyenNganhModal(cn, nganhCha)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteChuyenNganhConfirm(cn, nganhCha)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <DashboardLayout
      pageTitle="Quản Lý Ngành & Chuyên Ngành"
      headerActions={
        canManage && (
          <Button onClick={openCreateNganhModal}>
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Ngành Học
          </Button>
        )
      }
    >
      <motion.div className="space-y-6">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Danh Sách Ngành Học</CardTitle>
            <CardDescription>
              Quản lý các ngành học và chuyên ngành trực thuộc. Nhấp vào một
              ngành để xem/quản lý chuyên ngành con.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm ngành học..."
                  className="pl-10 h-9"
                  value={searchTermNganh}
                  onChange={(e) => setSearchTermNganh(e.target.value)}
                />
              </div>
            </div>

            {(isLoadingNganhList || isFetchingNganhList) &&
            !nganhHocList.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoadingNganhList && nganhHocList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <p className="text-xl font-semibold">Chưa có ngành học nào.</p>
                {canManage && (
                  <p className="mt-2 text-sm">
                    Bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateNganhModal}
                    >
                      thêm ngành học mới
                    </Button>
                    .
                  </p>
                )}
              </div>
            ) : (
              <Accordion
                type="single"
                collapsible
                className="w-full space-y-3"
                value={openNganhHocAccordionId}
                onValueChange={(value) =>
                  setOpenNganhHocAccordionId(value || undefined)
                }
              >
                {nganhHocList.map((nganh) => (
                  <AccordionItem
                    value={nganh.nganhHocID.toString()}
                    key={nganh.nganhHocID}
                    className="border dark:border-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card data-[state=open]:bg-muted/30 dark:data-[state=open]:bg-slate-800/30"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-t-lg data-[state=open]:rounded-b-none data-[state=open]:border-b dark:data-[state=open]:border-slate-700">
                      <div className="flex items-center gap-3 flex-1">
                        <BookOpen className="h-6 w-6 text-primary dark:text-ptit-red flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-md">
                            {nganh.tenNganhHoc}{' '}
                            <span className="font-mono text-xs text-muted-foreground">
                              ({nganh.maNganhHoc || 'N/A'})
                            </span>
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Khoa: {nganh.khoaQuanLy.tenDonVi}
                            {nganh.coChuyenNganh ? (
                              <span className="ml-2">
                                (
                                {(openNganhHocAccordionId ===
                                  nganh.nganhHocID.toString() &&
                                  nganhHocDetail?.chuyenNganhs?.length) ||
                                  nganh.soLuongChuyenNganh ||
                                  0}{' '}
                                chuyên ngành)
                              </span>
                            ) : (
                              <span className="ml-2 text-amber-600 dark:text-amber-400">
                                (Không chia chuyên ngành)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1 mr-1 items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditNganhModal(nganh);
                            }}
                            title="Sửa ngành học"
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          {nganh.coChuyenNganh && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCreateChuyenNganhModal(nganh);
                              }}
                              title="Thêm chuyên ngành"
                            >
                              {' '}
                              <FilePlus className="h-4 w-4 text-green-600" />{' '}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteNganhConfirm(nganh);
                            }}
                            title="Xóa ngành học"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="bg-slate-50 dark:bg-slate-900/40 rounded-b-lg border-t dark:border-slate-700">
                      {openNganhHocAccordionId ===
                        nganh.nganhHocID.toString() &&
                        isLoadingNganhDetail && (
                          <div className="p-6 text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      {openNganhHocAccordionId ===
                        nganh.nganhHocID.toString() &&
                        !isLoadingNganhDetail &&
                        nganh.coChuyenNganh &&
                        renderChuyenNganhTable(
                          nganhHocDetail?.chuyenNganhs,
                          nganhHocDetail
                        )}
                      {openNganhHocAccordionId ===
                        nganh.nganhHocID.toString() &&
                        !isLoadingNganhDetail &&
                        !nganh.coChuyenNganh && (
                          <p className="text-sm text-muted-foreground px-6 py-4">
                            Ngành này không được cấu hình để có chuyên ngành.
                          </p>
                        )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            {paginatedNganhHoc && totalNganhPages > 1 && (
              <ReusablePagination
                currentPage={currentNganhPage}
                totalPages={totalNganhPages}
                onPageChange={handlePageChangeNganh}
                isLoading={isLoadingNganhList || isFetchingNganhList}
                className="mt-8"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Thêm/Sửa Ngành Học */}
      <Dialog
        open={isNganhFormModalOpen && canManage}
        onOpenChange={(open) => {
          if (!open) {
            setEditingNganhHoc(null);
            formNganhHoc.reset();
          }
          setIsNganhFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingNganhHoc ? 'Chỉnh Sửa Ngành Học' : 'Thêm Ngành Học Mới'}
            </DialogTitle>
            <DialogDescription>
              {editingNganhHoc
                ? `Cập nhật cho ngành ${editingNganhHoc.tenNganhHoc}.`
                : 'Điền thông tin để tạo ngành học mới.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...formNganhHoc}>
            <form
              onSubmit={formNganhHoc.handleSubmit(onSubmitNganhHoc)}
              className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-3"
            >
              <FormField
                control={formNganhHoc.control}
                name="tenNganhHoc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên Ngành Học <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Công nghệ Thông tin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formNganhHoc.control}
                name="maNganhHoc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Ngành Học</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: 7480201"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formNganhHoc.control}
                name="khoaQuanLyID"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Khoa Quản Lý <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isLoadingKhoa}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={isLoadingKhoa ? 'Tải...' : 'Chọn khoa'}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dsKhoa?.items.map((khoa) => (
                          <SelectItem
                            key={khoa.donViID}
                            value={khoa.donViID.toString()}
                          >
                            {khoa.tenDonVi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formNganhHoc.control}
                name="coChuyenNganh"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ngành này có chia chuyên ngành?</FormLabel>
                      <FormDescription>
                        Nếu chọn, bạn có thể thêm các chuyên ngành con sau khi
                        tạo ngành.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={formNganhHoc.control}
                name="moTaNH"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô Tả Ngành Học</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về ngành học..."
                        {...field}
                        value={field.value ?? ''}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 border-t mt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    createNganhHocMutation.isPending ||
                    updateNganhHocMutation.isPending
                  }
                >
                  {/* ... */}
                  {editingNganhHoc ? 'Lưu' : 'Thêm Ngành'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Dialog Xác Nhận Xóa Ngành Học */}
      <Dialog
        open={showDeleteNganhConfirm && !!nganhHocToDelete}
        onOpenChange={setShowDeleteNganhConfirm}
      >
        {/* ... */}
      </Dialog>

      {/* Dialog Thêm/Sửa Chuyên Ngành */}
      <Dialog
        open={
          isChuyenNganhFormModalOpen && canManage && !!selectedNganhHocForCN
        }
        onOpenChange={(open) => {
          if (!open) {
            setEditingChuyenNganh(null);
            formChuyenNganh.reset();
            setSelectedNganhHocForCN(null);
          }
          setIsChuyenNganhFormModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingChuyenNganh
                ? 'Chỉnh Sửa Chuyên Ngành'
                : 'Thêm Chuyên Ngành Mới'}
            </DialogTitle>
            <DialogDescription>
              Cho ngành:{' '}
              <span className="font-semibold text-primary">
                {selectedNganhHocForCN?.tenNganhHoc}
              </span>
            </DialogDescription>
          </DialogHeader>
          <Form {...formChuyenNganh}>
            <form
              onSubmit={formChuyenNganh.handleSubmit(onSubmitChuyenNganh)}
              className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-3"
            >
              <FormField
                control={formChuyenNganh.control}
                name="tenChuyenNganh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên Chuyên Ngành{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Trí tuệ Nhân tạo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formChuyenNganh.control}
                name="maChuyenNganh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã Chuyên Ngành</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: TTNT"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formChuyenNganh.control}
                name="moTaCN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô Tả Chuyên Ngành</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về chuyên ngành..."
                        {...field}
                        value={field.value ?? ''}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4 border-t mt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={
                    createChuyenNganhMutation.isPending ||
                    updateChuyenNganhMutation.isPending
                  }
                >
                  {/* ... */}
                  {editingChuyenNganh ? 'Lưu' : 'Thêm Chuyên Ngành'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Dialog Xác Nhận Xóa Chuyên Ngành */}
      <Dialog
        open={showDeleteChuyenNganhConfirm && !!chuyenNganhToDelete}
        onOpenChange={setShowDeleteChuyenNganhConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa chuyên ngành</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa chuyên ngành{' '}
              <span className="font-semibold text-destructive">
                {chuyenNganhToDelete?.tenChuyenNganh}
              </span>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteChuyenNganhConfirm}
              disabled={deleteChuyenNganhMutation.isPending}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MajorsAndSpecializationsPage;
