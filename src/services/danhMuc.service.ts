// src/services/danhMuc.service.ts (Tạo file mới hoặc thêm vào service hiện có)
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import apiHelper from './apiHelper';
import { TrangThaiPhongResponse } from '@/services/phong.service';

// === Type mới cho Trang Thiết Bị ===
export interface TrangThietBiResponseMin {
  thietBiID: number; // PK từ bảng TrangThietBi
  tenThietBi: string; // TenThietBi từ bảng TrangThietBi
  // moTa?: string | null;      // Nếu cần hiển thị mô tả ngắn
}

// Type đầy đủ cho Trang Thiết Bị (khi quản lý danh mục TrangThietBi)
export interface TrangThietBiFullResponse extends TrangThietBiResponseMin {
  moTa?: string | null;
  // Các trường khác của bảng TrangThietBi nếu có
}

// Type cho payload khi tạo Trang Thiết Bị
export interface CreateTrangThietBiPayload {
  tenThietBi: string;
  // maThietBi?: string | null;
  moTa?: string | null;
}

// Type cho payload khi cập nhật Trang Thiết Bị
export interface UpdateTrangThietBiPayload {
  tenThietBi?: string;
  // maThietBi?: string | null;
  moTa?: string | null;
}

// Type cho params khi lấy danh sách Trang Thiết Bị
export interface GetTrangThietBiParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTrangThietBiResponse {
  items: TrangThietBiFullResponse[]; // Hoặc TrangThietBiResponseMin tùy mục đích
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

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
  // viTri?: string | null;
  toaNhaTangID: string | number; // ID của Tòa nhà/Tầng
  // isAvailableNow?: boolean; // Backend có thể tính toán sẵn
}

export interface PhongResponseMin {
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  sucChua?: number | null;
  loaiPhong?: LoaiPhongResponseMin | null; // Thông tin loại phòng (join từ LoaiPhong)
  // viTri?: string | null; // Ví dụ: "Tòa A, Tầng 3"
  toaNhaTangID: string | number;
  tgNhanPhongTT?: string; // ISO Date string, thời gian nhận phòng thực tế
  tgTraPhongTT?: string; // ISO Date string, thời gian trả phòng thực tế
  // Các thông tin cơ bản khác nếu cần hiển thị nhanh
}

// --- Loại Phòng ---
export interface GetLoaiPhongParams {
  // isActive?: boolean;
  limit?: number;
}
export interface ToaNhaTangForSelectResponse {
  toaNhaTangID: number;
  tenHienThi: string; // Ví dụ: "Tòa A - Tầng Trệt", "Tòa B - Lầu 1 (Khu văn phòng)"
  toaNhaID: number;
  tenToaNha: string;
  loaiTangID: number;
  tenLoaiTang: string;
  moTaTang?: string | null; // Mô tả của ToaNha_Tang
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

// --- Trạng Thái Phòng ---
export interface GetTrangThaiPhongParams {
  // isActive?: boolean; // Nếu có
  limit?: number;
}
const getTrangThaiPhongList = async (
  params?: GetTrangThaiPhongParams
): Promise<TrangThaiPhongResponse[]> => {
  return apiHelper.get('/danhmuc/trang-thai-phong', params || {}) as Promise<
    TrangThaiPhongResponse[]
  >;
};

// --- Tầng Vật Lý (ToaNha_Tang) cho Select ---
export interface GetToaNhaTangForSelectParams {
  toaNhaID?: number;
  searchTerm?: string;
  limit?: number;
}
const getToaNhaTangListForSelect = async (
  params?: GetToaNhaTangForSelectParams
): Promise<ToaNhaTangForSelectResponse[]> => {
  return apiHelper.get(
    '/danhmuc/toa-nha-tang/cho-chon',
    params || {}
  ) as Promise<ToaNhaTangForSelectResponse[]>;
};

// --- Trang Thiết Bị cho Select ---
export interface GetTrangThietBiForSelectParams {
  searchTerm?: string;
  // isActive?: boolean;
  limit?: number;
}
const getTrangThietBiListForSelect = async (
  params?: GetTrangThietBiForSelectParams
): Promise<TrangThietBiResponseMin[]> => {
  return apiHelper.get(
    '/danhmuc/trang-thiet-bi/cho-chon',
    params || {}
  ) as Promise<TrangThietBiResponseMin[]>;
};

const danhMucService = {
  getLoaiPhongList,
  getPhongListForSelect,
  getTrangThaiPhongList,
  getToaNhaTangListForSelect,
  getTrangThietBiListForSelect,
};

export default danhMucService;
