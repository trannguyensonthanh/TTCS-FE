// src/services/nguoiDung.service.ts
import apiHelper from '@/services/apiHelper';
import { VaiTroChucNangResponse } from '@/services/auth.service';
import { NguoiDungResponseMin } from '@/services/event.service';

export interface GetNguoiDungParams {
  searchTerm?: string; // Tìm theo HoTen, Email, MaDinhDanh
  loaiNguoiDung?: 'SINH_VIEN' | 'GIANG_VIEN' | 'NHAN_VIEN_KHAC'; // Lọc theo loại người dùng cơ bản
  maVaiTro?: string; // Lọc người dùng có một vai trò chức năng cụ thể
  donViID?: number; // Lọc người dùng thuộc một đơn vị cụ thể
  isActive?: boolean; // Lọc theo trạng thái hoạt động của tài khoản
  page?: number; // Default: 1
  limit?: number; // Default: 10
  sortBy?: string; // Default: 'HoTen'
  sortOrder?: 'asc' | 'desc'; // Default: 'asc'
}
export interface PaginatedNguoiDungResponse {
  items: NguoiDungResponseMin[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number; // Thêm pageSize để biết limit hiện tại
}

export interface ChangePasswordResponse {
  message: string; // VD: "Đổi mật khẩu thành công."
}

export interface ChangePasswordPayload {
  matKhauHienTai: string; // NOT NULL
  matKhauMoi: string; // NOT NULL, tuân thủ quy tắc độ mạnh
  // xacNhanMatKhauMoi: string; // FE sẽ tự validate, BE không cần
}
export interface NguoiDungFullResponse {
  nguoiDungID: number;
  maDinhDanh?: string | null;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  anhDaiDien?: string | null;
  ngayTao: string; // ISO Date string
  isActive: boolean;
  ngaySinh?: string | null;
}
export interface ThongTinSinhVienInput {
  lopID: number;
  khoaHoc?: string | null;
  heDaoTao?: string | null;
  ngayNhapHoc?: string | null; // YYYY-MM-DD
  trangThaiHocTap?: string | null;
}

// Thông tin chi tiết cho hồ sơ Sinh Viên
export interface ThongTinSinhVienChiTietResponse {
  maSinhVien: string;
  lop: { lopID: number; tenLop: string; maLop?: string | null };
  nganhHoc: {
    nganhHocID: number;
    tenNganhHoc: string;
    maNganhHoc?: string | null;
  };
  chuyenNganh?: {
    chuyenNganhID: number;
    tenChuyenNganh: string;
    maChuyenNganh?: string | null;
  } | null;
  khoaQuanLy: { donViID: number; tenDonVi: string; maDonVi?: string | null }; // Khoa quản lý ngành
  khoaHoc?: string | null;
  heDaoTao?: string | null;
  ngayNhapHoc?: string | null; // ISO Date
  trangThaiHocTap?: string | null;
  // Các thông tin khác của sinh viên   trong ThongTinSinhVien
}

export interface ThongTinGiangVienInput {
  donViCongTacID: number;
  hocVi?: string | null;
  hocHam?: string | null;
  chucDanhGD?: string | null;
  chuyenMonChinh?: string | null;
}

// Thông tin chi tiết cho hồ sơ Giảng Viên
export interface ThongTinGiangVienChiTietResponse {
  maGiangVien: string;
  donViCongTac: {
    donViID: number;
    tenDonVi: string;
    maDonVi?: string | null;
    loaiDonVi: string;
  }; // Khoa/Bộ môn
  hocVi?: string | null;
  hocHam?: string | null;
  chucDanhGD?: string | null;
  chuyenMonChinh?: string | null;
  // Các thông tin khác của giảng viên   trong ThongTinGiangVien
}
// Thông tin nhân viên khác (nếu cần, đơn giản hóa)

export interface TaiKhoanInfoResponse {
  tenDangNhap: string;
  trangThaiTk: string; // 'Active', 'Locked', 'Disabled'
  lanDangNhapCuoi?: string | null; // ISO
  ngayTaoTk: string; // ISO
}

export interface UserProfileResponse {
  // Kế thừa từ NguoiDungResponse
  nguoiDung: NguoiDungFullResponse;
  taiKhoan?: TaiKhoanInfoResponse; // Thông tin tài khoản
  // Thông tin hồ sơ chi tiết (chỉ một trong số này sẽ có giá trị, hoặc cả hai nếu kiêm nhiệm và DB cho phép)
  thongTinSinhVien?: ThongTinSinhVienChiTietResponse | null;
  thongTinGiangVien?: ThongTinGiangVienChiTietResponse | null;
  vaiTroChucNang: VaiTroChucNangResponse[]; // Danh sách vai trò chức năng đang giữ
}

export interface NguoiDungListItemFE {
  // FE có thể cần một cấu trúc hơi khác cho danh sách
  nguoiDungID: number;
  maDinhDanh?: string | null; // Mã chung
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  anhDaiDien?: string | null;
  isActive?: boolean; // Từ NguoiDung.IsActive
  trangThaiTaiKhoan?: string; // Từ TaiKhoan.TrangThaiTk
  loaiNguoiDungHienThi?: string; // VD: "Sinh viên", "Giảng viên", "Nhân viên"
  donViCongTacChinh?: string | null; // Tên Khoa của GV, hoặc tên Lớp của SV
  nganhHocSV?: string | null; // Ngành của SV
  cacVaiTroChucNang?: string[]; // Mảng tên các vai trò chức năng
  ngayTao?: string; // ISO Date string
  ngaySinh?: string | null; // ISO Date string, có thể null nếu không có
  thongTinSinhVien?: ThongTinSinhVienChiTietResponse | null;
  thongTinGiangVien?: ThongTinGiangVienChiTietResponse | null;

  vaiTroChucNang?: VaiTroChucNangResponse[];
}

export interface PaginatedNguoiDungResponseFE {
  items: NguoiDungListItemFE[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}
export interface CreateNguoiDungPayload {
  // Thông tin NguoiDung
  hoTen: string;
  email: string;
  maDinhDanh?: string | null;
  soDienThoai?: string | null;
  anhDaiDien?: string | null;
  isActive?: boolean; // Default là true ở DB
  ngaySinh?: string | null; // ISO Date string, có thể null nếu không có
  // Thông tin TaiKhoan
  matKhau: string; // Backend sẽ hash mật khẩu này
  trangThaiTk?: string; // Default là Active

  loaiNguoiDung: 'SINH_VIEN' | 'GIANG_VIEN' | 'NHAN_VIEN_KHAC';
  thongTinSinhVien?: ThongTinSinhVienInput | null;
  thongTinGiangVien?: ThongTinGiangVienInput | null;
  // Danh sách VaiTroChucNang ban đầu (Optional)
  // Mỗi item sẽ có VaiTroID và DonViThucThiID ( )
  vaiTroChucNang?: {
    vaiTroID: number;
    donViID?: number | null;
    ngayBatDau?: string;
    ngayKetThuc?: string | null;
  }[];
}

export interface UpdateNguoiDungAdminPayload {
  // Thông tin NguoiDung
  hoTen?: string;
  email?: string;
  maDinhDanh?: string | null;
  soDienThoai?: string | null;
  anhDaiDien?: string | null;
  isActiveNguoiDung?: boolean; // Cập nhật trạng thái hoạt động
  matKhau?: string; // Backend sẽ hash mật khẩu này
  ngaySinh?: string | null; // ISO Date string, có thể null nếu không có
  trangThaiTk?: string; // Default là Active

  // Thông tin hồ sơ (Optional, chỉ gửi  )
  thongTinSinhVien?: Partial<ThongTinSinhVienInput> | null; // null để xóa nếu cho phép
  thongTinGiangVien?: Partial<ThongTinGiangVienInput> | null;
}

export interface UpdateUserAccountStatusPayload {
  isActiveNguoiDung?: boolean; // Cho NguoiDung.IsActive
  trangThaiTaiKhoan?: string; // Cho TaiKhoan.TrangThaiTk ('Active', 'Locked', 'Disabled')
}

export interface AssignFunctionalRolePayload {
  vaiTroID: number;
  donViID?: number | null;
  ngayBatDau?: string; // ISO Date string, default là ngày hiện tại ở backend
  ngayKetThuc?: string | null; // ISO Date string
  ghiChuGanVT?: string | null;
}

export interface UpdateAssignedFunctionalRolePayload {
  donViID?: number | null; // Có thể cho phép thay đổi đơn vị nếu hợp lý
  ngayBatDau?: string;
  ngayKetThuc?: string | null;
  ghiChuGanVT?: string | null;
}

export interface UserImportRowPayload {
  // Dữ liệu 1 dòng từ Excel gửi lên BE
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  maDinhDanh?: string | null;
  loaiNguoiDung: 'SINH_VIEN' | 'GIANG_VIEN' | 'NHAN_VIEN_KHAC';
  donViID?: number | null; // LopID (SV), DonViCongTacID (GV/NV)
  matKhau: string; // FE đã tạo từ ngày sinh
  ngaySinh: string;
  // Các trường tùy chọn khác dựa trên loaiNguoiDung
  khoaHoc?: string | null;
  heDaoTao?: string | null;
  ngayNhapHoc?: string | null; // Format YYYY-MM-DD
  trangThaiHocTap?: string | null;

  hocVi?: string | null;
  hocHam?: string | null;
  chucDanhGD?: string | null;
  chuyenMonChinh?: string | null;

  chucVuNhanVien?: string | null; // Nếu là nhân viên khác
}

export interface ImportUsersBatchPayload {
  users: UserImportRowPayload[];
}

export interface ImportUserResultItem {
  email: string; // Hoặc một định danh khác của dòng input
  status: 'success' | 'error';
  message?: string; // Thông báo lỗi nếu status là 'error'
  nguoiDungID?: number; // ID của người dùng nếu tạo thành công
}

export interface ImportUsersBatchResponse {
  totalProcessed: number;
  totalSuccess: number;
  totalError: number;
  results: ImportUserResultItem[];
  summaryMessage: string;
}

const getNguoiDungList = async (
  params?: GetNguoiDungParams
): Promise<PaginatedNguoiDungResponseFE> => {
  return apiHelper.get(
    '/nguoidung',
    params || {}
  ) as Promise<PaginatedNguoiDungResponseFE>;
};

// Hàm lấy chi tiết người dùng (cho admin xem)
const getNguoiDungDetailForAdmin = async (
  nguoiDungId: number | string
): Promise<UserProfileResponse> => {
  return apiHelper.get(`/nguoidung/${nguoiDungId}`);
};

// Admin tạo người dùng mới
const createNguoiDungByAdmin = async (
  payload: CreateNguoiDungPayload
): Promise<UserProfileResponse> => {
  return apiHelper.post('/nguoiDung/admin-create', payload);
};

// Admin cập nhật người dùng
const updateNguoiDungByAdmin = async (
  nguoiDungId: number | string,
  payload: UpdateNguoiDungAdminPayload
): Promise<UserProfileResponse> => {
  return apiHelper.put(`/nguoidung/${nguoiDungId}/admin-update`, payload);
};

// Admin cập nhật trạng thái tài khoản
const updateUserAccountStatusByAdmin = async (
  nguoiDungId: number | string,
  payload: UpdateUserAccountStatusPayload
): Promise<{ message: string; nguoiDung: NguoiDungFullResponse }> => {
  return apiHelper.put(
    `/nguoidung/${nguoiDungId}/cap-nhat-trang-thai-tai-khoan`,
    payload
  );
};

// Admin gán vai trò chức năng
const assignFunctionalRole = async (
  nguoiDungId: number | string,
  payload: AssignFunctionalRolePayload
): Promise<VaiTroChucNangResponse> => {
  // Giả sử backend trả về bản ghi gán vai trò
  return apiHelper.post(`/nguoidung/${nguoiDungId}/vai-tro-chuc-nang`, payload);
};

// Admin cập nhật vai trò chức năng đã gán
const updateAssignedFunctionalRole = async (
  ganVaiTroCnID: number,
  payload: UpdateAssignedFunctionalRolePayload
): Promise<VaiTroChucNangResponse> => {
  return apiHelper.put(
    `/nguoidung/vai-tro-chuc-nang/${ganVaiTroCnID}`,
    payload
  );
};

// Admin gỡ vai trò chức năng đã gán
const removeAssignedFunctionalRole = async (
  ganVaiTroCnID: number
): Promise<{ message: string }> => {
  return apiHelper.delete(`/nguoidung/vai-tro-chuc-nang/${ganVaiTroCnID}`);
};

const importUsersBatch = async (
  payload: ImportUsersBatchPayload
): Promise<ImportUsersBatchResponse> => {
  return apiHelper.post('/nguoidung/admin-import-batch', payload);
};

const getMyProfile = async (): Promise<UserProfileResponse> => {
  return apiHelper.get('/nguoidung/toi') as Promise<UserProfileResponse>;
};

const changeMyPassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  return apiHelper.put(
    '/nguoidung/toi/doi-mat-khau',
    payload
  ) as Promise<ChangePasswordResponse>;
};

export const nguoiDungService = {
  getNguoiDungList,
  getNguoiDungDetailForAdmin,
  createNguoiDungByAdmin,
  updateNguoiDungByAdmin,
  updateUserAccountStatusByAdmin,
  assignFunctionalRole,
  updateAssignedFunctionalRole,
  removeAssignedFunctionalRole,
  importUsersBatch,
  getMyProfile,
  changeMyPassword,
};
