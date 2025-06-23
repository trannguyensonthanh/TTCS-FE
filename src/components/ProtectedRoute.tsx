// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext'; // Import useRole
import MaVaiTro from '@/enums/MaVaiTro.enum'; // Import MaVaiTro nếu dùng trực tiếp
import NotFound from '@/pages/NotFound'; // Trang hiển thị khi không có quyền

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // Mảng các mã vai trò được phép, ví dụ: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.BGH_DUYET_SK_TRUONG]
  // Nếu không truyền, chỉ kiểm tra isAuthenticated
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { hasRole } = useRole(); // Lấy hàm hasRole từ RoleContext
  const location = useLocation();

  if (loading) {
    // Có thể hiển thị một spinner toàn trang ở đây thay vì chỉ text
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-primary mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-muted-foreground">
            Đang tải dữ liệu người dùng...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu lại trang người dùng muốn truy cập để redirect sau khi đăng nhập
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu route yêu cầu vai trò cụ thể
  if (allowedRoles && allowedRoles.length > 0) {
    // Kiểm tra xem người dùng có ít nhất một trong các vai trò được phép không
    const userHasRequiredRole = allowedRoles.some((role) => hasRole(role));

    if (!userHasRequiredRole) {
      // Người dùng đã đăng nhập nhưng không có quyền truy cập route này
      // Có thể chuyển hướng đến trang "Unauthorized" hoặc trang NotFound với thông báo khác
      // Hoặc đơn giản là NotFound
      // return <Navigate to="/unauthorized" replace />;
      console.warn(
        `User ${user?.email} with roles ${user?.vaiTroChucNang
          .map((r) => r.maVaiTro)
          .join(
            ', '
          )} tried to access a route requiring roles: ${allowedRoles.join(
          ', '
        )}`
      );
      return <NotFound />;
    }
  }

  // Nếu đã đăng nhập và có vai trò phù hợp (hoặc route không yêu cầu vai trò)
  return <>{children}</>;
};

export default ProtectedRoute;
