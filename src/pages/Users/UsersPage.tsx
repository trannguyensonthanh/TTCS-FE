// src/pages/Users/UsersPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  PlusCircle,
  Loader2,
  AlertTriangle,
  Users as UsersIcon,
  Upload,
  Download,
  UserCog,
  KeyRound,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

import { VaiTroChucNangResponse } from '@/services/auth.service';
import { UserTable } from './components/UserTable';
import { UserFilters } from './components/UserFilters';
import { AssignRoleDialog } from './components/AssignRoleDialog';
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
  DialogClose,
} from '@/components/ui/dialog';
import { useDonViList } from '@/hooks/queries/donViQueries';
import { useVaiTroList } from '@/hooks/queries/vaiTroQueries';
import ImportUsersDialog from '@/components/users/ImportUsersDialog';
import {
  useAdminUpdateUserAccountStatus,
  useUserManagementList,
  useAdminDeleteUser,
} from '@/hooks/queries/nguoiDungQueries';
import {
  NguoiDungListItemFE,
  UpdateUserAccountStatusPayload,
  UserProfileResponse,
} from '@/services/nguoiDung.service';
import DashboardLayout from '@/components/DashboardLayout';
import { APIError } from '@/services/apiHelper';
import { UserFormDialog } from '@/pages/Users/components/UserFormDialog';

const ITEMS_PER_PAGE = 10;

function UsersPage() {
  const { user: currentUser, hasRole } = useAuth();
  const navigate = useNavigate();

  // States for Modals
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [editingUserData, setEditingUserData] =
    useState<UserProfileResponse | null>(null); // UserProfileResponse cho form sửa
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [userToManageRoles, setUserToManageRoles] = useState<
    UserProfileResponse['nguoiDung'] | null
  >(null);
  const [roleAssignmentToEdit, setRoleAssignmentToEdit] =
    useState<VaiTroChucNangResponse | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showAccountStatusConfirm, setShowAccountStatusConfirm] =
    useState(false);
  const [userForStatusChange, setUserForStatusChange] =
    useState<NguoiDungListItemFE | null>(null);
  const [newAccountStatus, setNewAccountStatus] = useState<{
    isActiveNguoiDung?: boolean;
    trangThaiTaiKhoan?: string;
  } | null>(null);
  const [userToDelete, setUserToDelete] = useState<NguoiDungListItemFE | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [filterParams, setFilterParams] = useState<{
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    searchTerm?: string;
    loaiNguoiDung?: 'SINH_VIEN' | 'GIANG_VIEN' | 'NHAN_VIEN_KHAC';
    maVaiTro?: string;
    donViID?: number;
    isActive?: boolean;
  }>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: 'HoTen',
    sortOrder: 'asc',
    searchTerm: undefined,
    loaiNguoiDung: undefined,
    maVaiTro: undefined,
    donViID: undefined,
    isActive: undefined,
  });

  const debouncedSearchTerm = useDebounce(filterParams.searchTerm, 500);

  const canManageUsersPage = useMemo(
    () => hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );
  const canCreateUsers = useMemo(
    () => hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );
  // Quyền gán vai trò có thể mở rộng hơn ADMIN, ví dụ Trưởng Khoa gán vai trò trong Khoa
  const canAssignRoles = useMemo(
    () => hasRole(MaVaiTro.ADMIN_HE_THONG),
    [hasRole]
  );

  const {
    data: paginatedUsers,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    isError: isErrorUsers,
    refetch: refetchUsersList,
  } = useUserManagementList(
    {
      ...filterParams,
      searchTerm: debouncedSearchTerm,
      isActive: filterParams.isActive,
    },
    { enabled: true, staleTime: 5 * 60 * 1000 }
  );
  const paginatedusers = paginatedUsers?.items || [];
  // Data cho filters
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList({
    limit: 100,
    sortBy: 'TenDonVi',
  });
  const { data: dsVaiTro, isLoading: isLoadingVaiTro } = useVaiTroList({
    limit: 100,
    sortBy: 'TenVaiTro',
  });

  // Mutation cho cập nhật trạng thái tài khoản
  const updateUserAccountStatusMutation = useAdminUpdateUserAccountStatus({
    onSuccess: () => {
      toast.success('Cập nhật trạng thái tài khoản thành công.');
      const handleLoaiNguoiDungChange = (value?: string) =>
        setFilterParams((prev) => ({
          ...prev,
          loaiNguoiDung:
            value === 'SINH_VIEN' ||
            value === 'GIANG_VIEN' ||
            value === 'NHAN_VIEN_KHAC'
              ? value
              : undefined,
          page: 1,
        }));
      setNewAccountStatus(null);
      // refetchUsersList(); // Query sẽ tự invalidate nếu key đúng
    },
  });
  const deleteUserMutation = useAdminDeleteUser({
    onSuccess: () => {
      toast.success('Đã xóa người dùng thành công.');
      setUserToDelete(null);
      setShowDeleteConfirm(false);
      refetchUsersList();
    },
  });

  // Handlers for Filters
  const handleSearchTermChange = (term: string) =>
    setFilterParams((prev) => ({ ...prev, searchTerm: term, page: 1 }));
  const handleLoaiNguoiDungChange = (value?: string) =>
    setFilterParams((prev) => ({
      ...prev,
      loaiNguoiDung:
        value === 'SINH_VIEN' ||
        value === 'GIANG_VIEN' ||
        value === 'NHAN_VIEN_KHAC'
          ? value
          : undefined,
      page: 1,
    }));
  const handleDonViChange = (value?: string) =>
    setFilterParams((prev) => ({
      ...prev,
      donViID: value ? parseInt(value) : undefined,
      page: 1,
    }));
  const handleVaiTroChucNangChange = (value?: string) =>
    setFilterParams((prev) => ({ ...prev, maVaiTro: value, page: 1 }));
  const handleIsActiveChange = (value?: string) => {
    let isActiveFilter: boolean | undefined = undefined;
    if (value === 'true') isActiveFilter = true;
    else if (value === 'false') isActiveFilter = false;
    setFilterParams((prev) => ({ ...prev, isActive: isActiveFilter, page: 1 }));
  };
  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for Modals and Actions
  const handleOpenCreateUserModal = () => {
    if (!canCreateUsers) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
      return;
    }
    setEditingUserData(null);
    setIsUserFormModalOpen(true);
  };

  const handleOpenEditUserModal = (userItem: NguoiDungListItemFE) => {
    if (!canCreateUsers) {
      // Giả sử quyền sửa = quyền tạo
      toast.error('Bạn không có quyền thực hiện hành động này.');
      return;
    }

    console.log('Opening edit modal for user:', userItem);
    const mockProfile: UserProfileResponse = {
      nguoiDung: {
        nguoiDungID: userItem.nguoiDungID,
        hoTen: userItem.hoTen,
        email: userItem.email,
        maDinhDanh: userItem.maDinhDanh,
        soDienThoai: userItem.soDienThoai,
        anhDaiDien: userItem.anhDaiDien,
        isActive: userItem.isActive,
        ngayTao: userItem.ngayTao,
        // Thêm các trường còn thiếu của NguoiDungFullResponse
      },
      thongTinSinhVien: userItem.thongTinSinhVien || null,
      thongTinGiangVien: userItem.thongTinGiangVien || null,
      vaiTroChucNang: userItem.vaiTroChucNang || [],
    };
    setEditingUserData(mockProfile);
    setIsUserFormModalOpen(true);
  };

  const handleOpenManageRolesModal = (userItem: NguoiDungListItemFE) => {
    if (!canAssignRoles) {
      toast.error('Bạn không có quyền quản lý vai trò cho người dùng này.');
      return;
    }
    setUserToManageRoles(userItem as UserProfileResponse['nguoiDung']); // Lấy phần NguoiDung cơ bản
    setRoleAssignmentToEdit(null); // Mở để gán mới hoặc xem danh sách vai trò đã gán
    setIsAssignRoleModalOpen(true);
  };

  const handleOpenToggleAccountStatusConfirm = (
    userItem: NguoiDungListItemFE
  ) => {
    if (!canCreateUsers) {
      // Giả sử quyền này thuộc admin
      toast.error('Bạn không có quyền thực hiện hành động này.');
      return;
    }
    setUserForStatusChange(userItem);
    // Xác định trạng thái mới dựa trên trạng thái hiện tại
    const targetIsActive = !(
      userItem.trangThaiTaiKhoan === 'Active' || userItem.isActive
    );
    setNewAccountStatus({
      isActiveNguoiDung: targetIsActive,
      trangThaiTaiKhoan: targetIsActive ? 'Active' : 'Disabled', // Hoặc 'Locked' tùy logic
    });
    setShowAccountStatusConfirm(true);
  };

  const handleDeleteUser = (user: NguoiDungListItemFE) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.nguoiDungID);
    }
  };

  const confirmToggleAccountStatus = () => {
    if (userForStatusChange && newAccountStatus) {
      updateUserAccountStatusMutation.mutate({
        id: userForStatusChange.nguoiDungID,
        payload: newAccountStatus as UpdateUserAccountStatusPayload,
      });
    }
  };

  const handleExportExcel = () => {
    // Logic export dữ liệu người dùng ra Excel
    // Cần lấy toàn bộ dữ liệu (không phân trang) hoặc dữ liệu đã lọc hiện tại
    // Sử dụng một thư viện như 'xlsx' hoặc 'file-saver'
    const dataToExport =
      paginatedUsers?.items.map((u) => ({
        'Họ Tên': u.hoTen,
        Email: u.email,
        'Mã Số': u.maDinhDanh || '',
        'Loại User': u.loaiNguoiDungHienThi,
        'Đơn Vị': u.donViCongTacChinh || '',
        'Vai Trò CN': u.cacVaiTroChucNang?.join(', ') || '',
        'Trạng Thái TK':
          u.trangThaiTaiKhoan || (u.isActive ? 'Hoạt động' : 'Vô hiệu hóa'),
        'Ngày Tạo': new Date(u.ngayTao).toLocaleDateString('vi-VN'),
      })) || [];

    if (dataToExport.length === 0) {
      toast.info('Không có dữ liệu người dùng để xuất.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachNguoiDung');
    XLSX.writeFile(workbook, 'DanhSachNguoiDung_PTITEvents.xlsx');
    toast.success('Đã xuất danh sách người dùng ra file Excel.');
  };

  if (isLoadingUsers && !paginatedusers?.length) {
    return (
      <DashboardLayout pageTitle="Quản Lý Người Dùng">
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (isErrorUsers && !paginatedusers?.length) {
    return (
      <DashboardLayout pageTitle="Lỗi Tải Dữ Liệu">
        <div className="text-destructive text-center py-10">
          <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
          <p>Lỗi khi tải danh sách người dùng: {'Lỗi không xác định'}</p>
          <Button onClick={() => refetchUsersList()} className="mt-4">
            Thử lại
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  console.log('Paginated Users:', paginatedUsers);
  const users = paginatedUsers?.items || [];
  const totalPages = paginatedUsers?.totalPages || 1;
  const currentPage = paginatedUsers?.currentPage || 1;

  return (
    <DashboardLayout
      pageTitle="Quản Lý Người Dùng"
      headerActions={
        canCreateUsers && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" /> Import Excel
            </Button>
            <Button
              onClick={handleOpenCreateUserModal}
              className="bg-primary hover:bg-primary/90"
            >
              <UserPlus className="mr-2 h-5 w-5" /> Thêm Người Dùng
            </Button>
          </div>
        )
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        <UserFilters
          searchTerm={filterParams.searchTerm || ''}
          onSearchTermChange={handleSearchTermChange}
          selectedLoaiNguoiDung={filterParams.loaiNguoiDung}
          onLoaiNguoiDungChange={handleLoaiNguoiDungChange}
          selectedDonVi={filterParams.donViID?.toString()}
          onDonViChange={handleDonViChange}
          selectedVaiTroChucNang={filterParams.maVaiTro}
          onVaiTroChucNangChange={handleVaiTroChucNangChange}
          selectedIsActive={
            filterParams.isActive === undefined
              ? 'all'
              : filterParams.isActive.toString()
          }
          onIsActiveChange={handleIsActiveChange}
          donViOptions={dsDonVi?.items || []}
          vaiTroOptions={dsVaiTro?.items || []}
          isLoadingDonVi={isLoadingDonVi}
          isLoadingVaiTro={isLoadingVaiTro}
        />

        <Card className="shadow-xl border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <UsersIcon /> Danh Sách Người Dùng
            </CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>
                Quản lý tài khoản, thông tin hồ sơ và vai trò chức năng của
                người dùng.
              </CardDescription>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={users.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Xuất Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(isLoadingUsers || isFetchingUsers) && !users.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-muted-foreground">
                  Đang tải danh sách người dùng...
                </p>
              </div>
            ) : !isLoadingUsers && users.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <img
                  src="/no-users.svg"
                  alt="No users"
                  className="mx-auto mb-4 h-40 w-40"
                />{' '}
                {/* Thay bằng SVG phù hợp */}
                <p className="text-xl font-semibold">
                  Không tìm thấy người dùng nào.
                </p>
                {canCreateUsers && (
                  <p className="mt-2 text-sm">
                    Hãy bắt đầu bằng cách{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={handleOpenCreateUserModal}
                    >
                      thêm người dùng mới
                    </Button>{' '}
                    hoặc{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => setIsImportModalOpen(true)}
                    >
                      import từ file Excel
                    </Button>
                    .
                  </p>
                )}
              </div>
            ) : (
              <UserTable
                users={users}
                onEditUser={handleOpenEditUserModal}
                onManageRoles={handleOpenManageRolesModal}
                onToggleAccountStatus={handleOpenToggleAccountStatusConfirm}
                canManageUsers={canCreateUsers}
                canManageRolesForUser={canAssignRoles}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoadingUsers || isFetchingUsers}
                className="mt-8"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {canCreateUsers && ( // Chỉ admin/người có quyền mới thấy dialog này
        <UserFormDialog
          open={isUserFormModalOpen}
          onOpenChange={setIsUserFormModalOpen}
          editingUser={editingUserData}
          onFormSubmitSuccess={refetchUsersList}
        />
      )}

      {/* {canAssignRoles && userToManageRoles && (
        <AssignRoleDialog
          open={isAssignRoleModalOpen}
          onOpenChange={(open) => {
            setIsAssignRoleModalOpen(open);
            if (!open) {
              setUserToManageRoles(null); // Reset khi đóng
              setRoleAssignmentToEdit(null);
            }
          }}
          userToAssignRole={userToManageRoles}
          existingRoleAssignment={roleAssignmentToEdit}
          onSuccess={() => {
            refetchUsersList(); // Làm mới danh sách user để cập nhật cột vai trò
            // Nếu đang xem chi tiết user nào đó, cũng cần làm mới chi tiết đó
          }}
        />
      )} */}

      {canCreateUsers && (
        <ImportUsersDialog
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
        />
      )}

      {/* Account Status Confirmation Dialog */}
      <Dialog
        open={showAccountStatusConfirm}
        onOpenChange={setShowAccountStatusConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <ShieldAlert className="mr-2 h-6 w-6 text-warning" />
              Xác nhận thay đổi trạng thái tài khoản
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn{' '}
              <strong>
                {newAccountStatus?.isActiveNguoiDung ||
                newAccountStatus?.trangThaiTaiKhoan === 'Active'
                  ? 'KÍCH HOẠT'
                  : 'VÔ HIỆU HÓA/KHÓA'}
              </strong>{' '}
              tài khoản cho người dùng "{userForStatusChange?.hoTen}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAccountStatusConfirm(false)}
              disabled={updateUserAccountStatusMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant={
                newAccountStatus?.isActiveNguoiDung ||
                newAccountStatus?.trangThaiTaiKhoan === 'Active'
                  ? 'secondary'
                  : 'destructive'
              }
              onClick={confirmToggleAccountStatus}
              disabled={updateUserAccountStatusMutation.isPending}
            >
              {updateUserAccountStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Trash2 className="mr-2 h-6 w-6 text-destructive" />
              Xác nhận xóa người dùng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn{' '}
              <strong className="text-destructive">XÓA CỨNG</strong> người dùng
              "{userToDelete?.hoTen}"? Hành động này không thể hoàn tác!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteUserMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}{' '}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default UsersPage;
