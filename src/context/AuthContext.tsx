/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import TokenService from '@/services/token.service'; // Đảm bảo đường dẫn đúng
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { VaiTroChucNangResponse } from '@/services/auth.service';

// Định nghĩa các kiểu dữ liệu cho User và các thông tin liên quan
// Những kiểu này nên được định nghĩa ở một file dùng chung (ví dụ: src/types/user.types.ts)
// và import vào đây cũng như vào useLogin.ts

interface ThongTinSinhVienCoBanForContext {
  maSo: string; // Chính là ThongTinSinhVien.MaSinhVien
  lopID: number; // Thêm LopID để dễ dàng xử lý
  tenLop?: string | null; // Join từ LopHoc.TenLop
  maLop?: string | null; // Join từ LopHoc.MaLop
  nganhHocID: number; // Thêm NganhHocID
  tenNganhHoc?: string | null; // Join từ NganhHoc.TenNganhHoc
  maNganhHoc?: string | null; // Join từ NganhHoc.MaNganhHoc
  chuyenNganhID?: number | null; // Thêm ChuyenNganhID
  tenChuyenNganh?: string | null; // Join từ ChuyenNganh.TenChuyenNganh
  maChuyenNganh?: string | null; // Join từ ChuyenNganh.MaChuyenNganh
  khoaHoc?: string | null;
  heDaoTao?: string | null;
  ngayNhapHoc?: string | null; // DATE -> string (YYYY-MM-DD)
  trangThaiHocTap?: string | null;
  tenKhoaQuanLy?: string | null; // Join từ NganhHoc -> DonVi (Khoa)
}
interface ThongTinGiangVienCoBanForContext {
  maSo: string; // Chính là ThongTinGiangVien.MaGiangVien
  donViCongTacID: number; // Thêm DonViCongTacID
  tenDonViCongTacChinh?: string | null; // Join từ DonVi.TenDonVi
  maDonViCongTacChinh?: string | null; // Join từ DonVi.MaDonVi
  hocVi?: string | null;
  hocHam?: string | null;
  chucDanhGD?: string | null;
  chuyenMonChinh?: string | null;
}

interface TuCachCoBanResponse {
  loai: 'SINH_VIEN' | 'GIANG_VIEN' | 'NHAN_VIEN_KHAC' | string;
  chiTiet:
    | ThongTinSinhVienCoBanForContext
    | ThongTinGiangVienCoBanForContext
    | Record<string, any>
    | null;
}
// User object lưu trong context và localStorage
export interface UserForContext {
  nguoiDungID: number;
  maDinhDanh?: string | null;
  hoTen: string;
  email: string;
  anhDaiDien?: string | null;
  vaiTroChucNang: VaiTroChucNangResponse[]; // Danh sách các vai trò chức năng được gán
  tuCachCoBan: TuCachCoBanResponse; // Thông tin về tư cách cơ bản (SV, GV)
  accessToken: string; // Lưu accessToken ở đây để dễ truy cập
  // refreshToken có thể không cần lưu ở client nếu backend dùng HttpOnly cookie
}

interface AuthContextType {
  user: UserForContext | null;
  isAuthenticated: boolean;
  loading: boolean; // Trạng thái loading ban đầu khi kiểm tra localStorage
  login: (
    userDataFromApi: any,
    accessToken: string,
    refreshToken?: string
  ) => void; // userDataFromApi là data từ LoginSuccessResponse
  logout: () => void;
  hasRole: (maVaiTroCn: string) => boolean; // Kiểm tra vai trò chức năng
  // Có thể thêm các hàm helper khác nếu cần, ví dụ: isSinhVien(), isGiangVien()
  isSinhVien: () => boolean;
  isGiangVien: () => boolean;
  getThongTinSinhVien: () => ThongTinSinhVienCoBanForContext | null;
  getThongTinGiangVien: () => ThongTinGiangVienCoBanForContext | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserForContext | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Kiểm tra localStorage khi component mount để duy trì trạng thái đăng nhập
  useEffect(() => {
    const storedUser = TokenService.getUser(); // Hàm này cần trả về UserForContext
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    (userDataFromApi: any, accessToken: string, refreshToken?: string) => {
      // userDataFromApi là toàn bộ object LoginSuccessResponse từ backend
      console.log('Login data from API:', userDataFromApi);
      const userToStore: UserForContext = {
        nguoiDungID: userDataFromApi.nguoiDung.nguoiDungID,
        maDinhDanh: userDataFromApi.nguoiDung.maDinhDanh,
        hoTen: userDataFromApi.nguoiDung.hoTen,
        email: userDataFromApi.nguoiDung.email,
        anhDaiDien: userDataFromApi.nguoiDung.anhDaiDien,
        vaiTroChucNang: userDataFromApi.vaiTroChucNang,
        tuCachCoBan: userDataFromApi.tuCachCoBan,
        accessToken: accessToken,
      };

      TokenService.setUser(userToStore); // Lưu vào localStorage (TokenService.setUser cần nhận UserForContext)
      if (refreshToken) {
        TokenService.setRefreshToken(refreshToken); // Nếu backend trả về refresh token trong body
      }
      setUser(userToStore);
      toast.success(`Chào mừng ${userToStore.hoTen}!`);
      navigate('/'); // Điều hướng về trang chủ sau khi đăng nhập thành công
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    try {
      // Gọi API logout của backend nếu có
      // await authService.logout(); // authService này cần được tạo
    } catch (error) {
      console.error('Error calling backend logout:', error);
    } finally {
      TokenService.removeUser();
      TokenService.removeRefreshToken(); // Nếu có lưu refresh token ở client
      setUser(null);
      toast.success('Đăng xuất thành công.');
      navigate('/login'); // Điều hướng về trang đăng nhập
    }
  }, [navigate]);

  const hasRole = useCallback(
    (maVaiTroCnToCheck: string): boolean => {
      return (
        user?.vaiTroChucNang.some(
          (role) => role.maVaiTro === maVaiTroCnToCheck
        ) || false
      );
    },
    [user]
  );

  const isSinhVien = useCallback((): boolean => {
    return user?.tuCachCoBan?.loai === 'SINH_VIEN';
  }, [user]);

  const isGiangVien = useCallback((): boolean => {
    return user?.tuCachCoBan?.loai === 'GIANG_VIEN';
  }, [user]);

  const getThongTinSinhVien =
    useCallback((): ThongTinSinhVienCoBanForContext | null => {
      if (user?.tuCachCoBan?.loai === 'SINH_VIEN') {
        return user.tuCachCoBan.chiTiet as ThongTinSinhVienCoBanForContext;
      }
      return null;
    }, [user]);

  const getThongTinGiangVien =
    useCallback((): ThongTinGiangVienCoBanForContext | null => {
      if (user?.tuCachCoBan?.loai === 'GIANG_VIEN') {
        return user.tuCachCoBan.chiTiet as ThongTinGiangVienCoBanForContext;
      }
      return null;
    }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        hasRole,
        isSinhVien,
        isGiangVien,
        getThongTinSinhVien,
        getThongTinGiangVien,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
