/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/RoleContext.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { useAuth, UserForContext } from './AuthContext';
import MaVaiTro from '@/enums/maVaiTro.enum';

// Định nghĩa các action và resource có thể có trong hệ thống
type Action =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'manage_participants'
  | 'request_cancel'
  | 'request_room_change'
  | 'self_cancel';
type Resource =
  | 'SuKien'
  | 'YeuCauMuonPhong'
  | 'YeuCauHuySK'
  | 'YeuCauDoiPhong'
  | 'Phong'
  | 'TrangThietBi'
  | 'LoaiPhong'
  | 'NguoiDung'
  | 'VaiTroHeThong' // Bảng định nghĩa vai trò
  | 'PhanQuyenNguoiDung' // Bảng NguoiDung_VaiTroChucNang
  | 'DonVi'
  | 'NganhHoc'
  | 'LopHoc'
  | 'ChuyenNganh'
  | 'TaiLieuSK'
  | 'DanhGiaSK'
  | 'ThongBao'
  | 'DashboardTongQuan'
  | 'DashboardDonVi' // Cho TK, TCLB, BTĐ
  | 'ThanhVienCLB'
  | 'SK_MoiThamGia'; // Thêm SK_MoiThamGia để khớp với logic phía dưới

interface RoleContextType {
  // Kiểm tra xem người dùng có một vai trò cụ thể không
  hasRole: (maVaiTro: string) => boolean;
  // Kiểm tra xem người dùng có quyền thực hiện một action trên một resource không
  // Cần truyền thêm context (ví dụ: ID của sự kiện, đơn vị) để kiểm tra chi tiết hơn nếu cần
  can: (action: Action, resource: Resource, resourceContext?: any) => boolean;

  // Các hàm helper tiện lợi (có thể giữ lại hoặc bỏ nếu can() đã đủ mạnh)
  isEventCreator: () => boolean; // Người có vai trò CB_TO_CHUC_SU_KIEN
  isFacilityManager: () => boolean; // QUAN_LY_CSVC
  isBGH: () => boolean; // BGH_DUYET_SK_TRUONG
  isAdmin: () => boolean; // ADMIN_HE_THONG

  // Hàm lấy DonViID mà người dùng quản lý (nếu họ là Trưởng Khoa/CLB/Đoàn)
  getManagedDonViId: (maVaiTroQuanLy: string) => number | undefined;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // user từ AuthContext giờ sẽ có user.vaiTroChucNang
  console.log('RoleProvider user:', user);
  const hasRole = useCallback(
    (maVaiTroToCheck: string): boolean => {
      if (!user || !user.vaiTroChucNang) return false;

      return user.vaiTroChucNang.some(
        (role) => role.maVaiTro === maVaiTroToCheck
      );
    },
    [user]
  );

  // Hàm kiểm tra quyền phức tạp hơn, cần định nghĩa ma trận quyền
  const can = useCallback(
    (action: Action, resource: Resource, resourceContext?: any): boolean => {
      if (!user || !user.vaiTroChucNang) return false;

      // ADMIN_HE_THONG có mọi quyền
      if (hasRole(MaVaiTro.ADMIN_HE_THONG)) return true;

      // Duyệt qua các vai trò chức năng của người dùng
      for (const userRole of user.vaiTroChucNang) {
        const maVaiTroHienTai = userRole.maVaiTro;

        switch (maVaiTroHienTai) {
          case MaVaiTro.CB_TO_CHUC_SU_KIEN:
            if (
              resource === 'SuKien' &&
              (action === 'create' ||
                action === 'request_cancel' ||
                action === 'self_cancel')
            )
              return true;
            if (
              resource === 'SuKien' &&
              (action === 'edit' || action === 'delete')
            ) {
              // Kiểm tra thêm trạng thái sự kiện cho phép sửa/xóa
              if (action === 'edit') return true;
            }
            if (resource === 'SuKien' && action === 'self_cancel') {
              return true;
            }
            if (resource === 'YeuCauMuonPhong' && action === 'create')
              return true;
            if (resource === 'YeuCauDoiPhong' && action === 'create')
              return true;
            if (resource === 'SK_MoiThamGia' && action === 'create')
              return true; // Mời cho sự kiện họ quản lý
            if (
              resource === 'TaiLieuSK' &&
              (action === 'create' || action === 'edit' || action === 'delete')
            )
              return true;
            if (resource === 'SuKien' && action === 'view') return true; // Xem sự kiện họ tạo/đơn vị họ
            break;

          case MaVaiTro.BGH_DUYET_SK_TRUONG:
            if (resource === 'SuKien' && action === 'approve') return true;
            if (resource === 'YeuCauHuySK' && action === 'approve') return true;
            if (resource === 'SuKien' && action === 'view') return true; // Xem tất cả sự kiện để duyệt
            if (resource === 'DashboardTongQuan' && action === 'view')
              return true;
            break;

          case MaVaiTro.QUAN_LY_CSVC:
            if (
              (resource === 'Phong' ||
                resource === 'TrangThietBi' ||
                resource === 'LoaiPhong') &&
              (action === 'create' ||
                action === 'edit' ||
                action === 'delete' ||
                action === 'view')
            )
              return true;
            if (resource === 'YeuCauMuonPhong' && action === 'approve')
              return true; // Giả sử có trạng thái này
            if (resource === 'YeuCauDoiPhong' && action === 'approve')
              return true;
            if (
              (resource === 'YeuCauMuonPhong' ||
                resource === 'YeuCauDoiPhong' ||
                resource === 'SuKien') &&
              action === 'view'
            )
              return true;
            if (resource === 'DashboardTongQuan' && action === 'view')
              return true; // Hoặc Dashboard CSVC

            break;

          // Các vai trò khác  ...
        }
      }

      // Quyền xem mặc định cho GIANG_VIEN và SINH_VIEN (nếu không có vai trò chức năng nào ở trên cho phép)
      // if (action === 'view' && resource === 'SuKien') {
      //   if (
      //     resourceContext?.isCongKhaiNoiBo &&
      //     ['DA_DUYET_BGH', 'DA_XAC_NHAN_PHONG', 'HOAN_THANH'].includes(
      //       resourceContext?.maTrangThaiSK
      //     )
      //   )
      //     return true;
      //   if (resourceContext?.isInvitedUser) return true; // Cần thêm logic để kiểm tra user hiện tại có trong SK_MoiThamGia không
      //   // Logic kiểm tra đơn vị tham gia cho SV/GV cơ bản
      //   if (user?.tuCachCoBan?.chiTiet) {
      //     const userProfile = user.tuCachCoBan.chiTiet as any; // Cần ép kiểu an toàn hơn
      //     if (
      //       user.tuCachCoBan.loai === 'SINH_VIEN' &&
      //       resourceContext?.donViThamGiaIDs?.includes(userProfile.lopID)
      //     )
      //       return true; // Giả sử LopID là DonViID
      //     if (
      //       user.tuCachCoBan.loai === 'GIANG_VIEN' &&
      //       resourceContext?.donViThamGiaIDs?.includes(
      //         userProfile.donViCongTacID
      //       )
      //     )
      //       return true;
      //   }
      // }
      if (action === 'view' && resource === 'TaiLieuSK') return true;
      if (action === 'create' && resource === 'DanhGiaSK') return true; // Cần logic xác định đã tham gia

      return false;
    },
    [user, hasRole]
  );

  const isEventCreator = useCallback((): boolean => {
    return hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN);
  }, [hasRole]);

  const isFacilityManager = useCallback((): boolean => {
    return hasRole(MaVaiTro.QUAN_LY_CSVC);
  }, [hasRole]);

  const isBGH = useCallback((): boolean => {
    return hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG);
  }, [hasRole]);

  const isAdmin = useCallback((): boolean => {
    return hasRole(MaVaiTro.ADMIN_HE_THONG);
  }, [hasRole]);

  const getManagedDonViId = useCallback(
    (maVaiTroQuanLy: string): number | undefined => {
      if (!user || !user.vaiTroChucNang) return undefined;
      const roleAssignment = user.vaiTroChucNang.find(
        (role) => role.maVaiTro === maVaiTroQuanLy && role.donViThucThi
      );
      return roleAssignment?.donViThucThi?.donViID;
    },
    [user]
  );

  return (
    <RoleContext.Provider
      value={{
        hasRole,
        can,
        isEventCreator,
        isFacilityManager,
        isBGH,
        isAdmin,

        getManagedDonViId,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
