// src/pages/Users/Roles/RolesPage.tsx

import React, { useState, useMemo, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  PlusCircle,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useVaiTroList,
  useDeleteVaiTro,
  // Các hooks useCreateVaiTro, useUpdateVaiTro đã được dùng trong RoleFormDialog
} from '@/hooks/queries/vaiTroQueries';

import { RoleFormDialog } from './components/RoleFormDialog';
import { RolesTable } from './components/RolesTable';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import { useAuth } from '@/context/AuthContext';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import { toast } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'; // Dialog xác nhận xóa
import { VaiTroHeThongItem } from '@/services/vaiTro.service';
import DashboardLayout from '@/components/DashboardLayout';

const ITEMS_PER_PAGE = 10;

function RolesPage() {
  const { hasRole } = useAuth();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<VaiTroHeThongItem | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<VaiTroHeThongItem | null>(
    null
  );

  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: 'TenVaiTro',
    sortOrder: 'asc' as 'asc' | 'desc',
    searchTerm: undefined as string | undefined,
  });

  const debouncedSearchTerm = useDebounce(filterParams.searchTerm, 500);

  // Chỉ có ADMIN_HE_THONG mới có quyền quản lý vai trò
  const canManageRoles = useMemo(
    () => hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );

  const {
    data: paginatedRoles,
    isLoading: isLoadingRoles,
    isFetching: isFetchingRoles,
    isError: isErrorRoles,
    error: errorRoles,
  } = useVaiTroList(
    {
      ...filterParams,
      searchTerm: debouncedSearchTerm,
    },
    {
      enabled: canManageRoles, // Chỉ fetch nếu có quyền
      staleTime: 5 * 60 * 1000,
    }
  );

  const deleteRoleMutation = useDeleteVaiTro({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
      // Invalidation đã được xử lý trong hook
    },
  });

  useEffect(() => {
    // Reset page về 1 khi searchTerm thay đổi
    // Không cần setFilterParams ở đây vì useVaiTroList đã dùng debouncedSearchTerm
  }, [debouncedSearchTerm]);

  const handleSearchTermChange = (term: string) => {
    setFilterParams((prev) => ({ ...prev, searchTerm: term, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (role: VaiTroHeThongItem) => {
    setEditingRole(role);
    setIsFormModalOpen(true);
  };

  const openDeleteConfirm = (role: VaiTroHeThongItem) => {
    if (role.soNguoiDungSuDung && role.soNguoiDungSuDung > 0) {
      toast.error(
        `Không thể xóa vai trò "${role.tenVaiTro}" vì đang có người dùng sử dụng.`
      );
      return;
    }
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (roleToDelete) {
      deleteRoleMutation.mutate(roleToDelete.vaiTroID);
    }
  };

  if (!canManageRoles && !isLoadingRoles) {
    return (
      <DashboardLayout pageTitle="Không Có Quyền Truy Cập">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-muted-foreground">
            Bạn không có quyền truy cập chức năng quản lý vai trò hệ thống.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const roles = paginatedRoles?.items || [];
  const totalPages = paginatedRoles?.totalPages || 1;
  const currentPage = paginatedRoles?.currentPage || 1;

  return (
    <DashboardLayout
      pageTitle="Quản Lý Vai Trò Hệ Thống"
      headerActions={
        canManageRoles && (
          <Button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Thêm Vai Trò Mới
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
            <CardTitle className="text-2xl">Danh Sách Vai Trò</CardTitle>
            <CardDescription>
              Định nghĩa các vai trò chức năng và quyền hạn trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
              <div className="relative flex-1 w-full sm:w-auto sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm theo Mã hoặc Tên vai trò..."
                  className="pl-10 h-10 rounded-lg shadow-inner"
                  value={filterParams.searchTerm || ''}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                />
              </div>
              {/* Có thể thêm các bộ lọc khác nếu cần */}
            </div>

            {(isLoadingRoles || isFetchingRoles) && !roles.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">
                  Đang tải danh sách vai trò...
                </p>
              </div>
            ) : !isLoadingRoles && roles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <img
                  src="/no-data-roles.svg"
                  alt="No roles"
                  className="mx-auto mb-4 h-40 w-40"
                />{' '}
                {/* Thay bằng SVG phù hợp */}
                <p className="text-xl font-semibold">
                  Chưa có vai trò nào được định nghĩa.
                </p>
                {canManageRoles && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={openCreateModal}
                    >
                      thêm vai trò mới
                    </Button>
                    .
                  </p>
                )}
              </div>
            ) : (
              <RolesTable
                roles={roles}
                onEdit={openEditModal}
                onDelete={openDeleteConfirm}
                canManage={canManageRoles}
              />
            )}

            {totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoadingRoles || isFetchingRoles}
                className="mt-8"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {canManageRoles && (
        <RoleFormDialog
          open={isFormModalOpen}
          onOpenChange={setIsFormModalOpen}
          editingRole={editingRole}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <AlertTriangle className="text-destructive mr-2 h-6 w-6" />
              Xác nhận Xóa Vai Trò
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vai trò "{roleToDelete?.tenVaiTro}" (Mã:{' '}
              {roleToDelete?.maVaiTro})?
              <br />
              Hành động này không thể hoàn tác. Vai trò này sẽ bị gỡ bỏ khỏi tất
              cả người dùng đang được gán.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteRoleMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending && (
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

export default RolesPage;
