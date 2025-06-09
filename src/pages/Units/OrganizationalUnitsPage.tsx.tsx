// src/pages/Units/OrganizationalUnitsPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PlusCircle, Loader2, AlertTriangle, ListFilter } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce'; // Giả sử bạn có hook này
import {
  useDonViList,
  useCreateDonVi,
  useUpdateDonVi,
  useDeleteDonVi,
  useLoaiDonViOptions,
  useDonViChaOptions,
} from '@/hooks/queries/donViQueries';

import { UnitFormDialog } from './components/UnitFormDialog';
import { UnitTable } from './components/UnitTable';
import { UnitFilters } from './components/UnitFilters';
import { ReusablePagination } from '@/components/ui/ReusablePagination'; // Giả sử có component này
import { useAuth } from '@/context/AuthContext'; // Để kiểm tra quyền
import MaVaiTro from '@/enums/MaVaiTro.enum'; // Enum Mã Vai Trò
import { toast } from '@/components/ui/sonner';
import { motion } from 'framer-motion'; // Cho animation
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DonViDetail, DonViListItem } from '@/services/donVi.service';
import DashboardLayout from '@/components/DashboardLayout';

const ITEMS_PER_PAGE = 10;

function OrganizationalUnitsPage() {
  const { user, hasRole } = useAuth(); // Sử dụng hook useAuth đã có hasRole

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<
    DonViDetail | DonViListItem | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<DonViListItem | null>(null);

  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: 'TenDonVi',
    sortOrder: 'asc' as 'asc' | 'desc',
    searchTerm: undefined as string | undefined,
    loaiDonVi: undefined as string | undefined,
    donViChaID: undefined as number | undefined,
  });

  const debouncedSearchTerm = useDebounce(filterParams.searchTerm, 500);

  useEffect(() => {
    // Khi searchTerm debounce thay đổi, reset page về 1
    // Các filter khác cũng nên reset page khi thay đổi
    // Logic này có thể phức tạp hơn nếu muốn giữ nguyên page khi filter thay đổi
    // nhưng đơn giản nhất là reset về page 1
  }, [debouncedSearchTerm, filterParams.loaiDonVi, filterParams.donViChaID]);

  const canManageUnits = useMemo(
    () => hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );

  const {
    data: paginatedUnits,
    isLoading: isLoadingUnits,
    isFetching: isFetchingUnits,
    isError: isErrorUnits,
    error: errorUnits,
    refetch: refetchUnits,
  } = useDonViList(
    {
      ...filterParams,
      searchTerm: debouncedSearchTerm, // Sử dụng debouncedSearchTerm ở đây
    },
    {
      enabled: canManageUnits, // Chỉ fetch nếu có quyền
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: loaiDonViOptions, isLoading: isLoadingLoaiDonVi } =
    useLoaiDonViOptions({
      enabled: canManageUnits, // Chỉ fetch nếu có quyền
    });

  const { data: donViChaOptions, isLoading: isLoadingDonViCha } =
    useDonViChaOptions(
      editingUnit ? (editingUnit as DonViDetail).donViID : undefined, // Loại trừ đơn vị đang sửa
      {
        enabled: canManageUnits && isFormModalOpen, // Chỉ fetch khi modal mở và có quyền
      }
    );

  const deleteDonViMutation = useDeleteDonVi({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setUnitToDelete(null);
      // refetchUnits(); // React Query sẽ tự động refetch nếu query key được invalidate
    },
  });

  const handleSearchTermChange = (term: string) => {
    setFilterParams((prev) => ({ ...prev, searchTerm: term, page: 1 }));
  };

  const handleLoaiDonViChange = (value: string | undefined) => {
    setFilterParams((prev) => ({ ...prev, loaiDonVi: value, page: 1 }));
  };

  const handleDonViChaChange = (value: string | undefined) => {
    setFilterParams((prev) => ({
      ...prev,
      donViChaID: value ? parseInt(value) : undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreateModal = () => {
    setEditingUnit(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (unit: DonViListItem | DonViDetail) => {
    setEditingUnit(unit);
    setIsFormModalOpen(true);
  };

  const openDeleteConfirm = (unit: DonViListItem) => {
    setUnitToDelete(unit);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (unitToDelete) {
      deleteDonViMutation.mutate(unitToDelete.donViID);
    }
  };

  if (!canManageUnits && !isLoadingUnits) {
    // Kiểm tra sau khi loading xong
    return (
      <DashboardLayout pageTitle="Không Có Quyền Truy Cập">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-muted-foreground">
            Bạn không có quyền truy cập chức năng quản lý đơn vị.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const units = paginatedUnits?.items || [];
  const totalPages = paginatedUnits?.totalPages || 1;
  const currentPage = paginatedUnits?.currentPage || 1;

  return (
    <DashboardLayout
      pageTitle="Quản Lý Đơn Vị Tổ Chức"
      headerActions={
        canManageUnits && (
          <Button onClick={openCreateModal}>
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Đơn Vị Mới
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
            <CardTitle className="text-2xl flex items-center gap-2">
              <ListFilter /> Danh Sách Đơn Vị
            </CardTitle>
            <CardDescription>
              Quản lý các Khoa, Phòng, Ban, Câu lạc bộ, và các đơn vị tổ chức
              khác.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UnitFilters
              searchTerm={filterParams.searchTerm || ''}
              onSearchTermChange={handleSearchTermChange}
              selectedLoaiDonVi={filterParams.loaiDonVi}
              onLoaiDonViChange={handleLoaiDonViChange}
              selectedDonViCha={filterParams.donViChaID?.toString()}
              onDonViChaChange={handleDonViChaChange}
              loaiDonViOptions={loaiDonViOptions || []}
              donViChaOptions={donViChaOptions || []}
              isLoadingLoaiDonVi={isLoadingLoaiDonVi}
              isLoadingDonViCha={isLoadingDonViCha}
            />

            {(isLoadingUnits || isFetchingUnits) && !units.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">
                  Đang tải danh sách đơn vị...
                </p>
              </div>
            ) : !isLoadingUnits && units.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <img
                  src="https://i.pinimg.com/736x/81/6a/54/816a54e948e480723a617446a01d3314.jpg"
                  alt="No data"
                  className="mx-auto mb-4 h-40 w-40"
                />
                <p className="text-xl font-semibold">
                  Không tìm thấy đơn vị nào.
                </p>
                {canManageUnits && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateModal}
                    >
                      thêm đơn vị mới
                    </Button>
                    .
                  </p>
                )}
              </div>
            ) : (
              <UnitTable
                units={units}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                canManage={canManageUnits}
              />
            )}

            {totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoadingUnits || isFetchingUnits}
                className="mt-8"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {canManageUnits && (
        <UnitFormDialog
          open={isFormModalOpen}
          onOpenChange={setIsFormModalOpen}
          editingUnit={editingUnit as DonViDetail | null} // Cast vì UnitTable có thể truyền DonViListItem
          loaiDonViOptions={loaiDonViOptions || []}
          donViChaOptions={donViChaOptions || []}
          isLoadingLoaiDonVi={isLoadingLoaiDonVi}
          isLoadingDonViCha={isLoadingDonViCha}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <AlertTriangle className="text-destructive mr-2 h-6 w-6" />
              Xác nhận Xóa Đơn Vị
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đơn vị "{unitToDelete?.tenDonVi}"? Hành
              động này không thể hoàn tác.
              <br />
              Lưu ý: Chỉ có thể xóa nếu đơn vị không có đơn vị con hoặc các liên
              kết quan trọng khác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteDonViMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDonViMutation.isPending}
            >
              {deleteDonViMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default OrganizationalUnitsPage;
