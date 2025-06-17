import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Nếu muốn chia tab
import { APIError } from '@/services/apiHelper';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import MaVaiTro from '@/enums/MaVaiTro.enum';

import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  UserCog,
  Edit,
  Trash2,
  AlertTriangle,
  UsersIcon,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';

// Import các component con
import { UserProfileCard } from '@/components/users/detail/UserProfileCard';
import { UserProfileAcademicInfo } from '@/components/users/detail/UserProfileAcademicInfo';
import { UserFunctionalRolesTable } from '@/components/users/detail/UserFunctionalRolesTable';
import { AssignRoleDialog } from '@/components/users/detail/AssignRoleDialog'; // Dialog gán/sửa vai trò
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VaiTroChucNangResponse } from '@/services/auth.service';
import {
  useAdminAssignFunctionalRole,
  useAdminRemoveAssignedRole,
  useAdminUpdateAssignedRole,
  useUserDetailForAdmin,
} from '@/hooks/queries/nguoiDungQueries';
import {
  AssignFunctionalRolePayload,
  UpdateAssignedFunctionalRolePayload,
} from '@/services/nguoiDung.service';

// ---- Component Chính ----
const UserDetailPage = () => {
  const { user: currentUser, logout } = useAuth(); // Người dùng đang đăng nhập
  const { hasRole, can } = useRole();
  const navigate = useNavigate();
  const { userId: userIdFromParam } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();

  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [editingRoleAssignment, setEditingRoleAssignment] =
    useState<VaiTroChucNangResponse | null>(null);
  const [showDeleteRoleConfirm, setShowDeleteRoleConfirm] = useState(false);
  const [roleAssignmentToDelete, setRoleAssignmentToDelete] =
    useState<VaiTroChucNangResponse | null>(null);

  // --- Data Fetching ---
  const {
    data: userProfileData,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: errorProfile,
    refetch: refetchUserProfile,
  } = useUserDetailForAdmin(userIdFromParam, {
    enabled: !!userIdFromParam && hasRole(MaVaiTro.ADMIN_HE_THONG), // Chỉ Admin mới fetch chi tiết này
  });
  console.log('User Profile Data:', userProfileData);
  // --- Mutations cho Vai Trò Chức Năng ---
  const commonRoleMutationOptions = {
    onSuccess: () => {
      toast.success('Thao tác vai trò thành công!');
      setIsAssignRoleModalOpen(false);
      setShowDeleteRoleConfirm(false);
      setEditingRoleAssignment(null);
      setRoleAssignmentToDelete(null);
      if (userIdFromParam) refetchUserProfile(); // Refetch lại chi tiết user để cập nhật danh sách vai trò
    },
    onError: (error: APIError) => {
      toast.error('Lỗi khi thao tác vai trò', {
        description: error.body?.message || error.message,
      });
    },
  };

  const assignRoleMutation = useAdminAssignFunctionalRole(
    userIdFromParam!,
    commonRoleMutationOptions
  );
  const updateRoleMutation = useAdminUpdateAssignedRole(
    commonRoleMutationOptions
  );
  const removeRoleMutation = useAdminRemoveAssignedRole(
    commonRoleMutationOptions
  );

  // --- Event Handlers ---
  const handleOpenAssignNewRoleModal = () => {
    setEditingRoleAssignment(null);
    setIsAssignRoleModalOpen(true);
  };

  const handleOpenEditRoleModal = (roleAssignment: VaiTroChucNangResponse) => {
    setEditingRoleAssignment(roleAssignment);
    setIsAssignRoleModalOpen(true);
  };

  const handleOpenDeleteRoleConfirm = (
    roleAssignment: VaiTroChucNangResponse
  ) => {
    setRoleAssignmentToDelete(roleAssignment);
    setShowDeleteRoleConfirm(true);
  };

  const handleSubmitAssignOrUpdateRole = (
    data: AssignFunctionalRolePayload | UpdateAssignedFunctionalRolePayload
  ) => {
    if (!userIdFromParam) return;

    if (editingRoleAssignment && editingRoleAssignment.ganVaiTroID) {
      // Đây là trường hợp Sửa vai trò đã gán
      const updatePayload: UpdateAssignedFunctionalRolePayload = {
        donViID: data.donViID, // Lấy từ data (form)
        ngayBatDau: data.ngayBatDau, // Lấy từ data (form)
        ngayKetThuc: data.ngayKetThuc, // Lấy từ data (form)
        ghiChuGanVT: data.ghiChuGanVT, // Lấy từ data (form)
      };
      updateRoleMutation.mutate({
        ganVaiTroCnID: editingRoleAssignment.ganVaiTroID,
        payload: updatePayload,
      });
    } else {
      // Đây là trường hợp Gán vai trò mới
      assignRoleMutation.mutate(data as AssignFunctionalRolePayload);
    }
  };

  const handleDeleteRoleConfirm = () => {
    console.log('Xác nhận xóa vai trò:', roleAssignmentToDelete);
    if (roleAssignmentToDelete && roleAssignmentToDelete.ganVaiTroID) {
      removeRoleMutation.mutate(roleAssignmentToDelete.ganVaiTroID);
    }
  };

  // --- Quyền ---
  // Chỉ Admin mới xem được trang chi tiết quản trị này
  const canViewAdminDetailPage = hasRole(MaVaiTro.ADMIN_HE_THONG);
  const canManageUserRoles = hasRole(MaVaiTro.ADMIN_HE_THONG);

  if (!isLoadingProfile && !canViewAdminDetailPage) {
    return (
      <DashboardLayout pageTitle="Không có quyền truy cập">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Truy Cập Bị Từ Chối</h2>
          <p className="text-muted-foreground">
            Bạn không có quyền xem chi tiết người dùng này.
          </p>
          <Button onClick={() => navigate(-1)} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const pageTitle = isLoadingProfile
    ? 'Đang tải...'
    : userProfileData
    ? `Chi Tiết Người Dùng: ${userProfileData.nguoiDung.hoTen}`
    : 'Không tìm thấy người dùng';

  return (
    <DashboardLayout
      pageTitle={pageTitle}
      headerActions={
        canManageUserRoles &&
        userProfileData && ( // Nút sửa thông tin người dùng cơ bản (nếu có trang riêng)
          <Button
            variant="outline"
            onClick={() => navigate(`/users/edit/${userIdFromParam}`)}
            className="hover:border-primary hover:text-primary"
          >
            <Edit className="mr-2 h-4 w-4" /> Sửa Thông Tin Cơ Bản
          </Button>
        )
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'circOut' }}
        className="space-y-6 md:space-y-8"
      >
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            className="mb-2 self-start hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Danh sách Người dùng
          </Button>
        </div>

        {isLoadingProfile && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {isErrorProfile && !isLoadingProfile && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Lỗi Tải Dữ Liệu Người Dùng</AlertTitle>
            <AlertDescription>
              {(errorProfile as APIError)?.body?.message ||
                (errorProfile as Error)?.message ||
                'Không thể tải thông tin. Vui lòng thử lại.'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchUserProfile()}
                className="ml-2 h-auto p-1 text-destructive hover:underline"
              >
                Tải lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoadingProfile && !userProfileData && !isErrorProfile && (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <UsersIcon className="h-24 w-24 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                Không tìm thấy người dùng
              </h3>
              <p className="text-muted-foreground mt-3">
                Người dùng bạn tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
            </CardContent>
          </Card>
        )}

        {userProfileData && !isLoadingProfile && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Cột trái: Thông tin cá nhân và học vụ/công tác */}
            <div className="xl:col-span-1 space-y-6">
              <UserProfileCard
                nguoiDung={userProfileData.nguoiDung}
                taiKhoan={userProfileData.taiKhoan}
                isLoading={isLoadingProfile}
              />
              <UserProfileAcademicInfo
                thongTinSinhVien={userProfileData.thongTinSinhVien}
                thongTinGiangVien={userProfileData.thongTinGiangVien}
                isLoading={isLoadingProfile}
              />
            </div>

            {/* Cột phải: Quản lý vai trò chức năng */}
            <div className="xl:col-span-2">
              <UserFunctionalRolesTable
                roles={userProfileData.vaiTroChucNang}
                isLoading={isLoadingProfile}
                onEditRole={handleOpenEditRoleModal}
                onDeleteRole={handleOpenDeleteRoleConfirm}
                onAssignNewRole={handleOpenAssignNewRoleModal}
                canManageRoles={canManageUserRoles}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Dialog Gán/Sửa Vai Trò Chức Năng */}
      {userIdFromParam && ( // Chỉ render dialog nếu có userIdFromParam
        <AssignRoleDialog
          open={isAssignRoleModalOpen}
          onOpenChange={(open) => {
            if (!open) setEditingRoleAssignment(null);
            setIsAssignRoleModalOpen(open);
          }}
          onSubmit={handleSubmitAssignOrUpdateRole}
          isSubmitting={
            assignRoleMutation.isPending || updateRoleMutation.isPending
          }
          editingRoleAssignment={editingRoleAssignment}
          nguoiDungId={parseInt(userIdFromParam)}
        />
      )}

      {/* Dialog Xác Nhận Xóa Vai Trò Đã Gán */}
      <Dialog
        open={showDeleteRoleConfirm && !!roleAssignmentToDelete}
        onOpenChange={setShowDeleteRoleConfirm}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác Nhận Thu Hồi
              Vai Trò
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn thu hồi vai trò{' '}
              <strong className="text-foreground">
                {roleAssignmentToDelete?.tenVaiTro}
              </strong>
              {roleAssignmentToDelete?.donViThucThi &&
                ` tại ${roleAssignmentToDelete.donViThucThi.tenDonVi}`}{' '}
              của người dùng này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                onClick={() => setRoleAssignmentToDelete(null)}
              >
                Không, Hủy bỏ
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteRoleConfirm}
              disabled={removeRoleMutation.isPending}
            >
              {removeRoleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Có, Thu Hồi Vai Trò
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserDetailPage;
