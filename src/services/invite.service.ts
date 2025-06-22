// src/services/invite.service.ts
import apiHelper, { APIError } from './apiHelper';
import { NguoiDungResponseMin } from './event.service'; // Import các type cần thiết

// --- Types for Event Invitation ---

export interface MoiThamGiaPayloadItem {
  nguoiDuocMoiID: number;
  vaiTroDuKienSK?: string | null;
  ghiChuMoi?: string | null;
}

export interface MoiThamGiaResultItem {
  nguoiDuocMoiID: number;
  emailInput?: string;
  status: 'success' | 'error' | 'skipped';
  moiThamGiaID?: number | null;
  message?: string | null;
}

export interface TieuChiMoiHangLoat {
  loaiNguoiDung:
    | 'SINH_VIEN_THEO_KHOA'
    | 'GIANG_VIEN_THEO_KHOA'
    | 'TAT_CA_SV'
    | 'TAT_CA_GV'
    | 'SINH_VIEN_THEO_LOP'
    | 'SINH_VIEN_THEO_NGANH';

  donViIDs?: number[];
  nganhHocIDs?: number[];
  lopIDs?: number[]; // Thêm Lớp ID để mời cả lớp
  nienKhoaSV?: string;
  trangThaiHocTapSV?: string;
  hocViGV?: string;
  // ... các tiêu chí khác
}

export interface GuiLoiMoiHangLoatPayload {
  loaiDoiTuongMoi: 'THEO_TIEU_CHI' | 'DANH_SACH_CU_THE';
  tieuChiMoi?: TieuChiMoiHangLoat | null; // Nullable nếu mời theo danh sách cụ thể
  danhSachNguoiDungIDs?: number[]; // Nullable nếu mời theo tiêu chí
  vaiTroDuKienSK?: string | null; // Áp dụng chung nếu có
  ghiChuMoiChung?: string | null; // Áp dụng chung nếu có
  loaiTruNguoiDungIDs?: number[];
}

export interface GuiLoiMoiResponse {
  message: string;
  results: MoiThamGiaResultItem[];
  jobId?: string; // Nếu mời hàng loạt > N người và xử lý bất đồng bộ
  tongSoNguoiDuKienMoi?: number;
  soLuongMoiThanhCong?: number;
  soLuongMoiLoi?: number;
  chiTietLoi?: { nguoiDungID?: number; email?: string; lyDo: string }[];
}

export interface NguoiDuocMoiItem {
  moiThamGiaID: number;
  nguoiDuocMoi: NguoiDungResponseMin & { anhDaiDien?: string | null }; // Mở rộng NguoiDungResponseMin nếu cần thêm trường
  vaiTroDuKienSK?: string | null;
  isChapNhanMoi?: boolean | null;
  tgPhanHoiMoi?: string | null; // ISO Date string
  ghiChuMoi?: string | null;
}

export interface GetDanhSachMoiParams {
  searchTerm?: string;
  trangThaiPhanHoi?: 'CHUA_PHAN_HOI' | 'CHAP_NHAN' | 'TU_CHOI' | 'ALL';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedNguoiDuocMoiResponse {
  items: NguoiDuocMoiItem[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

// --- API Functions ---

// Mời từng người (có thể vẫn giữ lại nếu cần hoặc gộp vào API hàng loạt)
const guiLoiMoiCaNhan = async (
  suKienID: number | string,
  payload: MoiThamGiaPayloadItem[]
): Promise<GuiLoiMoiResponse> => {
  // Endpoint này có thể là POST /api/v1/sukien/{suKienID}/moi-tham-gia/ca-nhan
  return apiHelper.post(
    `/sukien/${suKienID}/moi-tham-gia/ca-nhan`,
    payload
  ) as Promise<GuiLoiMoiResponse>;
};

const guiLoiMoiHangLoat = async (
  suKienID: number | string,
  payload: GuiLoiMoiHangLoatPayload
): Promise<GuiLoiMoiResponse> => {
  return apiHelper.post(
    `/sukien/${suKienID}/gui-loi-moi-hang-loat`,
    payload
  ) as Promise<GuiLoiMoiResponse>;
};

const getDanhSachMoi = async (
  suKienID: number | string,
  params?: GetDanhSachMoiParams
): Promise<PaginatedNguoiDuocMoiResponse> => {
  return apiHelper.get(
    `/sukien/${suKienID}/danh-sach-moi`,
    params || {}
  ) as Promise<PaginatedNguoiDuocMoiResponse>;
};

const thuHoiLoiMoi = async (
  moiThamGiaID: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/moi-tham-gia/${moiThamGiaID}`) as Promise<{
    message: string;
  }>;
};

const inviteService = {
  guiLoiMoiCaNhan,
  guiLoiMoiHangLoat,
  getDanhSachMoi,
  thuHoiLoiMoi,
};

export default inviteService;
