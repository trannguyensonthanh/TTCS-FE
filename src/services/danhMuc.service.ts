// src/services/danhMuc.service.ts (Tạo file mới hoặc thêm vào service hiện có)
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import apiHelper from './apiHelper';

export interface SuKienForSelectResponse {
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string; // ISO Date string
  tgKetThucDK: string; // ISO Date string
  donViChuTri: {
    // Chỉ cần tên đơn vị để hiển thị
    tenDonVi: string;
  };
}

export interface PhongForSelectResponse {
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  sucChua?: number | null;
  tenLoaiPhong: string; // Join từ LoaiPhong
  loaiPhongID?: number | null; // ID của LoaiPhong để lọc
  viTri?: string | null;
  // isAvailableNow?: boolean; // Backend có thể tính toán sẵn
}

export interface PhongResponseMin {
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  sucChua?: number | null;
  loaiPhong?: LoaiPhongResponseMin | null; // Thông tin loại phòng (join từ LoaiPhong)
  viTri?: string | null; // Ví dụ: "Tòa A, Tầng 3"
  tgNhanPhongTT?: string; // ISO Date string, thời gian nhận phòng thực tế
  tgTraPhongTT?: string; // ISO Date string, thời gian trả phòng thực tế
  // Các thông tin cơ bản khác nếu cần hiển thị nhanh
}

// --- Loại Phòng ---
export interface GetLoaiPhongParams {
  isActive?: boolean;
  limit?: number;
}
const getLoaiPhongList = async (
  params?: GetLoaiPhongParams
): Promise<LoaiPhongResponseMin[]> => {
  // Giả sử API không phân trang, trả về mảng trực tiếp
  return apiHelper.get('/danhmuc/loai-phong', params || {}) as Promise<
    LoaiPhongResponseMin[]
  >;
};

// --- Phòng (Cho việc chọn lựa) ---
export interface GetPhongForSelectParams {
  searchTerm?: string;
  loaiPhongID?: number;
  sucChuaToiThieu?: number;
  thoiGianMuon?: string; // ISO
  thoiGianTra?: string; // ISO
  trangThaiPhongMa?: string;
  limit?: number;
}
const getPhongListForSelect = async (
  params?: GetPhongForSelectParams
): Promise<PhongForSelectResponse[]> => {
  return apiHelper.get('/danhmuc/phong/cho-chon', params || {}) as Promise<
    PhongForSelectResponse[]
  >;
};

const danhMucService = {
  getLoaiPhongList,
  getPhongListForSelect,
};

export default danhMucService;
