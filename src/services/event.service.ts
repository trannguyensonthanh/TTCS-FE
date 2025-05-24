// src/services/event.service.ts
import { SuKienForSelectResponse } from '@/services/danhMuc.service';
import apiHelper, { APIError } from './apiHelper';

// --- Types (Nên đặt trong file types/event.types.ts và import) ---
export interface DonViResponseMin {
  donViID: number;
  tenDonVi: string;
  maDonVi?: string | null;
  loaiDonVi: string; // Thêm loại đơn vị
}

export interface NguoiDungResponseMin {
  nguoiDungID: number;
  hoTen: string;
  email?: string; // Có thể cần email để hiển thị
}

export interface TrangThaiSKResponse {
  trangThaiSkID: number;
  maTrangThai: string;
  tenTrangThai: string;
}

export interface SuKienListItemResponse {
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string; // ISO Date string
  tgKetThucDK: string; // ISO Date string
  diaDiemToChucDaXep?: string | null;
  donViChuTri: DonViResponseMin;
  trangThaiSK: TrangThaiSKResponse;
  isCongKhaiNoiBo: boolean;
  slThamDuDK?: number | null;
  imageUrl?: string | null;
  daCoPhong: boolean;
  nguoiTao: NguoiDungResponseMin; // Thêm người tạo để hiển thị
}

export interface ChiTietDatPhongResponseMin {
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  tgNhanPhongTT: string; // ISO Date string
  tgTraPhongTT: string; // ISO Date string
}

export interface YeuCauHuySKResponseMin {
  ycHuySkID: number;
  lyDoHuy: string;
  trangThaiYcHuySK: { maTrangThai: string; tenTrangThai: string };
  ngayYeuCauHuy: string; // ISO Date string
  nguoiYeuCau: NguoiDungResponseMin;
}

export interface SuKienDetailResponse
  extends Omit<SuKienListItemResponse, 'nguoiTao'> {
  // Kế thừa và bỏ nguoiTao nếu đã có trong full detail
  moTaChiTiet?: string | null;
  nguoiChuTri?: NguoiDungResponseMin | null;
  tenChuTriNgoai?: string | null;
  donViChuTriNgoai?: string | null;
  nguoiTao: NguoiDungResponseMin; // Giữ lại hoặc đảm bảo có trong SuKienListItemResponse
  ngayTaoSK: string; // ISO Date string
  donViThamGia: DonViResponseMin[];
  nguoiDuocMoi: {
    nguoiDung: NguoiDungResponseMin;
    isChapNhanMoi?: boolean | null; // Trạng thái chấp nhận lời mời
    // Có thể thêm tgPhanHoiMoi nếu cần
  }[];
  khachMoiNgoaiGhiChu?: string | null;
  nguoiDuyetBGH?: NguoiDungResponseMin | null;
  ngayDuyetBGH?: string | null;
  lyDoTuChoiBGH?: string | null;
  lyDoHuyNguoiTao?: string | null;
  chiTietDatPhong?: ChiTietDatPhongResponseMin[]; // Có thể có nhiều phòng được xếp
  yeuCauHuy?: YeuCauHuySKResponseMin | null;
  // Thêm các tài liệu liên quan nếu cần
  // taiLieuDinhKem: { tenFile: string, url: string }[];
}

export interface GetSuKienParams {
  searchTerm?: string;
  trangThaiSkMa?: string;
  loaiSuKienMa?: string; // Nếu có bảng LoaiSuKien và FE gửi MaLoaiSuKien
  donViChuTriID?: number;
  tuNgay?: string;
  denNgay?: string;
  isCongKhaiNoiBo?: boolean;
  sapDienRa?: boolean;
  nguoiTaoID?: number;
  thamGiaDonViID?: number;
  thamGiaNguoiDungID?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSuKienResponse {
  items: SuKienListItemResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number; // Thêm pageSize để biết limit hiện tại
}

export interface GetPublicSuKienParams {
  searchTerm?: string;
  loaiSuKienMa?: string;
  tuNgay?: string;
  denNgay?: string;
  sapDienRa?: boolean; // true: chỉ sắp diễn ra, false/undefined: cả sắp diễn ra và đã hoàn thành gần đây
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSuKienPayload {
  tenSK: string;
  moTaChiTiet?: string | null;
  tgBatDauDK: string; // ISO "yyyy-MM-ddTHH:mm:ssZ"
  tgKetThucDK: string; // ISO "yyyy-MM-ddTHH:mm:ssZ"
  slThamDuDK?: number | null;
  donViChuTriID: number;
  nguoiChuTriID?: number | null;
  tenChuTriNgoai?: string | null;
  donViChuTriNgoai?: string | null;
  cacDonViThamGiaIDs?: number[];
  khachMoiNgoaiGhiChu?: string | null;
  isCongKhaiNoiBo?: boolean;
  loaiSuKienID?: number | null;
}
// Nếu cần alias, có thể dùng type alias thay vì interface kế thừa không thêm gì:
export type CreateSuKienSuccessResponse = SuKienDetailResponse;

export interface DuyetSuKienPayload {
  ghiChuBGH?: string | null;
}
export interface TuChoiSuKienPayload {
  lyDoTuChoiBGH: string;
}
export interface DuyetHoacTuChoiSKResponse {
  message: string;
  suKien: SuKienDetailResponse;
}

// --- API Functions ---
const getSuKienListForManagement = async (
  params: GetSuKienParams
): Promise<PaginatedSuKienResponse> => {
  // apiHelper.get cần hỗ trợ truyền params một cách an toàn (có thể tự build query string)
  // Ví dụ: const queryString = new URLSearchParams(params as any).toString();
  // return apiHelper.get(`/sukien?${queryString}`);
  // Hoặc nếu apiHelper.get đã xử lý object params:
  return apiHelper.get('/sukien', params) as Promise<PaginatedSuKienResponse>;
};

// Lấy danh sách sự kiện CÔNG KHAI
const getPublicSuKienList = async (
  params: GetPublicSuKienParams
): Promise<PaginatedSuKienResponse> => {
  return apiHelper.get(
    '/sukien/public',
    params
  ) as Promise<PaginatedSuKienResponse>;
};

const getSuKienDetailForManagement = async (
  suKienID: number | string
): Promise<SuKienDetailResponse> => {
  return apiHelper.get(`/sukien/${suKienID}`) as Promise<SuKienDetailResponse>;
};

// Lấy chi tiết một sự kiện CÔNG KHAI
const getPublicSuKienDetail = async (
  suKienID: number | string
): Promise<SuKienDetailResponse> => {
  return apiHelper.get(
    `/sukien/public/${suKienID}`
  ) as Promise<SuKienDetailResponse>;
};

// Giả sử là xóa mềm (cập nhật trạng thái) hoặc yêu cầu hủy bởi người tạo nếu ở trạng thái phù hợp
export interface UpdateSuKienTrangThaiPayload {
  maTrangThaiMoi: string; // VD: 'DA_HUY_BOI_NGUOI_TAO'
  lyDo?: string; // Nếu cần ghi lý do trực tiếp vào SuKien (ví dụ LyDoHuyNguoiTao)
}
export interface UpdateSuKienTrangThaiResponse {
  message: string;
  suKien: SuKienDetailResponse; // Trả về sự kiện đã cập nhật
}

const updateSuKienTrangThai = async (
  suKienID: number | string,
  payload: UpdateSuKienTrangThaiPayload
): Promise<UpdateSuKienTrangThaiResponse> => {
  return apiHelper.put(
    `/sukien/${suKienID}/trangthai`,
    payload
  ) as Promise<UpdateSuKienTrangThaiResponse>;
};

export interface CreateYeuCauHuySKPayload {
  suKienID: number;
  lyDoHuy: string;
}
// Response có thể là chi tiết YeuCauHuySK vừa tạo
// hoặc chỉ là message và SuKien đã cập nhật trạng thái
export interface CreateYeuCauHuySKResponse {
  message: string;
  // yeuCauHuy?: YeuCauHuySKDetailResponse; // Nếu cần
  suKienUpdated?: SuKienDetailResponse;
}

const createYeuCauHuySK = async (
  payload: CreateYeuCauHuySKPayload
): Promise<CreateYeuCauHuySKResponse> => {
  return apiHelper.post(
    `/yeucauhuysk`,
    payload
  ) as Promise<CreateYeuCauHuySKResponse>;
};

const createSuKien = async (
  payload: CreateSuKienPayload
): Promise<CreateSuKienSuccessResponse> => {
  return apiHelper.post(
    '/sukien',
    payload
  ) as Promise<CreateSuKienSuccessResponse>;
};

const approveEventByBGH = async (
  suKienID: number | string,
  payload: DuyetSuKienPayload
): Promise<DuyetHoacTuChoiSKResponse> => {
  return apiHelper.post(
    `/sukien/${suKienID}/duyet-bgh`,
    payload
  ) as Promise<DuyetHoacTuChoiSKResponse>;
};

const rejectEventByBGH = async (
  suKienID: number | string,
  payload: TuChoiSuKienPayload
): Promise<DuyetHoacTuChoiSKResponse> => {
  return apiHelper.post(
    `/sukien/${suKienID}/tuchoi-bgh`,
    payload
  ) as Promise<DuyetHoacTuChoiSKResponse>;
};

// --- Sự Kiện (Cho việc chọn lựa khi tạo YC Phòng) ---
export interface GetSuKienForSelectParams {
  nguoiTaoID?: number;
  donViChuTriID?: number;
  searchTerm?: string;
  limit?: number;
  page?: number;
  // trangThaiSkMa nên được backend tự xử lý khi có coTheTaoYeuCauPhongMoi
  // không cần FE gửi lên nữa nếu mục đích là lấy SK có thể tạo YC phòng mới.
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  coTheTaoYeuCauPhongMoi?: boolean; // Thay cho chuaCoYeuCauPhong
}

const getSuKienListForSelection = async (
  params?: GetSuKienForSelectParams
): Promise<SuKienForSelectResponse[]> => {
  return apiHelper.get('/sukien/cho-chon-yc-phong', params || {}) as Promise<
    SuKienForSelectResponse[]
  >;
};

const eventService = {
  getSuKienListForManagement,
  getPublicSuKienList,
  getSuKienDetailForManagement,
  getPublicSuKienDetail,
  updateSuKienTrangThai,
  createYeuCauHuySK,
  createSuKien,
  approveEventByBGH,
  rejectEventByBGH,
  getSuKienListForSelection,
};

export default eventService;
