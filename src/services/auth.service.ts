/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/auth.service.ts

import apiHelper, { APIError } from './apiHelper'; // Import helper và kiểu lỗi
import TokenService from './token.service';
export interface RefreshResponse {
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  matKhau: string;
}

export interface NguoiDungData {
  nguoiDungID: number;
  maDinhDanh?: string | null;
  hoTen: string;
  email: string;
  soDienThoai?: string | null; // Thêm vào nếu cần
  anhDaiDien?: string | null;
  isActive: boolean; // Thêm vào nếu cần
  trangThaiTk: string; // Lấy từ TaiKhoan
}

export interface TokensData {
  accessToken: string;
  refreshToken?: string;
}

export interface VaiTroData {
  maVaiTro: string;
  tenVaiTro: string;
  donViThucThi?: {
    donViID: number;
    tenDonVi: string;
    maDonVi?: string | null;
    loaiDonVi: string;
  } | null;
}

export interface ThongTinSinhVienCoBan {
  maSo: string;
  tenLop?: string | null;
  maLop?: string | null;
  tenNganhHoc?: string | null;
  maNganhHoc?: string | null;
  tenChuyenNganh?: string | null;
  maChuyenNganh?: string | null;
  khoaHoc?: string | null;
  tenKhoaQuanLy?: string | null;
  maKhoaQuanLy?: string | null;
}

export interface ThongTinGiangVienCoBan {
  maSo: string;
  tenDonViCongTacChinh?: string | null;
  maDonViCongTacChinh?: string | null;
  hocVi?: string | null;
  chucDanhGD?: string | null;
}

export interface TuCachCoBanData {
  loai: 'SINH_VIEN' | 'GIANG_VIEN' | 'NHAN_VIEN_KHAC' | string;
  chiTiet:
    | ThongTinSinhVienCoBan
    | ThongTinGiangVienCoBan
    | Record<string, any>
    | null;
}

export interface LoginSuccessResponse {
  nguoiDung: NguoiDungData;
  tokens: TokensData;
  vaiTro: VaiTroData[];
  tuCachCoBan: TuCachCoBanData;
}

export interface DonViThucThiResponse {
  donViID: number;
  tenDonVi: string;
  maDonVi?: string | null;
  loaiDonVi: string;
}

export interface VaiTroChucNangResponse {
  vaiTroID: number;
  maVaiTro: string;
  tenVaiTro: string;
  donViThucThi?: DonViThucThiResponse | null;

  ganVaiTroID?: number; // ID của bản ghi gán
  ngayBatDau?: string; // ISO Date string
  ngayKetThuc?: string | null; // ISO Date string
  ghiChuGanVT?: string | null;
}

// Hàm đăng nhập
export const loginApi = async (
  credentials: LoginCredentials
): Promise<LoginSuccessResponse> => {
  const response = await apiHelper.post('/auth/login', credentials);
  return response as LoginSuccessResponse;
};

// Hàm yêu cầu gửi OTP quên mật khẩu
export interface ForgotPasswordPayload {
  email: string;
}
export interface ForgotPasswordResponse {
  message: string;
}
export const forgotPasswordApi = async (
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> => {
  return apiHelper.post('/auth/forgot-password', payload);
};

// Hàm xác thực OTP
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}
export interface VerifyOtpResponse {
  message: string;
  resetToken: string;
}
export const verifyOtpApi = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  return apiHelper.post('/auth/verify-otp', payload);
};

// Hàm đặt lại mật khẩu
export interface ResetPasswordPayload {
  resetToken: string;
  matKhauMoi: string;
}
export interface ResetPasswordResponse {
  message: string;
}
export const resetPasswordApi = async (
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> => {
  return apiHelper.post('/auth/reset-password', payload);
};

// 4. Gửi lại OTP (Resend OTP) - Nếu cần
export interface ResendOtpPayload {
  email: string;
}
export interface ResendOtpResponse {
  message: string; // VD: "Mã OTP mới đã được gửi."
}
export const resendOtpApi = async (
  payload: ResendOtpPayload
): Promise<ResendOtpResponse> => {
  return apiHelper.post('/auth/forgot-password', payload);
};

// src/services/auth.service.ts
export const refreshToken = async (
  data = {},
  tokenIgnored = ''
): Promise<{ accessToken: string }> => {
  const API_BASE_URL: string = 'http://localhost:3000/v1';
  try {
    // Gọi fetch trực tiếp, KHÔNG qua fetchWithAuth
    const res = await fetch(API_BASE_URL + '/auth/refresh-tokens', {
      // *** Endpoint đúng là /refresh-tokens ***
      method: 'POST',
      headers: {
        // Authorization: `Bearer ${tokenIgnored}`, // API refresh token KHÔNG cần Access Token cũ
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include', // *** Quan trọng: Để gửi cookie refreshToken ***
      body: JSON.stringify(data), // Body có thể rỗng nếu backend chỉ đọc cookie
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Nếu API refresh token cũng trả về 401 -> Refresh token hết hạn/không hợp lệ
      throw new APIError(
        result.message || `Refresh token failed with status ${res.status}`,
        res.status, // Trả về status code lỗi từ API refresh
        result
      );
    }
    if (!result.accessToken) {
      throw new Error('Refresh response missing accessToken');
    }
    return result as { accessToken: string };
  } catch (error: any) {
    console.error('API call to refresh token failed:', error);
    throw error; // Ném lỗi để catch trong fetchWithAuth xử lý
  }
};

/** Đăng xuất */
export const logoutUser = async (): Promise<{ message: string }> => {
  // Gọi API backend để backend xử lý phía server (vd: blacklist token nếu cần, xóa cookie)
  const response = await apiHelper.post(
    '/auth/logout',
    {},
    {},
    {
      credentials: 'include', // Gửi cookie ( )
    }
  ); // apiHelper sẽ tự động gửi token hiện tại
  // Xóa thông tin user và token khỏi localStorage phía client
  document.cookie = 'refreshToken=; Max-Age=0; path=/;'; // Xóa refreshToken bằng cách đặt Max-Age=0
  TokenService.removeUser();
  return response;
};

export const logoutUserApi = async (token = ''): Promise<any> => {
  const API_BASE_URL: string = 'http://localhost:3000/v1';
  try {
    const res = await fetch(API_BASE_URL + '/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include', // Gửi cookie ( )
      body: JSON.stringify({}), // Không cần body nếu API không yêu cầu
    });
    // Không cần quan tâm nhiều đến kết quả response logout, chỉ cần gọi là chính
    if (!res.ok) {
      console.warn(`API call to /auth/logout failed with status ${res.status}`);
    }
    return res.json().catch(() => ({})); // Trả về kết quả hoặc object rỗng
  } catch (error) {
    console.error('API call to /auth/logout failed:', error);
    throw error; // Ném lỗi để có thể bắt ở nơi gọi nếu cần
  }
};

/** Gọi API Backend để refresh token (Backend đọc cookie refreshToken) */
export const refreshTokenApi = async (): Promise<RefreshResponse> => {
  const result = await refreshToken(
    {},
    TokenService.getLocalAccessToken() || ''
  ); // Gửi token cũ (có thể hết hạn) nếu API backend cần
  if (result?.accessToken) {
    TokenService.updateLocalAccessToken(result.accessToken); // Cập nhật token mới vào local
  }
  return result;
};

const authService = {
  loginApi,
  forgotPasswordApi,
  verifyOtpApi,
  resetPasswordApi,
  resendOtpApi,
  refreshToken,
  logoutUser,
  logoutUserApi,
  refreshTokenApi,
};
export default authService;
