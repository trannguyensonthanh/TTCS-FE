// src/services/eventRating.service.ts
import { LoaiSuKienResponse } from '@/services/loaiSuKien.service';
import apiHelper, { APIError } from './apiHelper';
import { DonViResponseMin, NguoiDungResponseMin } from './event.service'; // Tái sử dụng types

// --- Types for Attended Events and Ratings ---

export interface DanhGiaCuaToi {
  danhGiaSkID: number;
  diemNoiDung: number;
  diemToChuc: number;
  diemDiaDiem: number;
  yKienDongGop?: string | null;
  tgDanhGia: string; // ISO Date string
}

export interface SuKienDaThamGiaItem {
  suKienID: number;
  tenSK: string;
  tgBatDau: string; // ISO Date string (thực tế hoặc dự kiến)
  tgKetThuc: string; // ISO Date string (thực tế hoặc dự kiến)
  diaDiemDaXep?: string | null;
  loaiSuKien?: LoaiSuKienResponse | null;
  donViChuTri: DonViResponseMin;
  trangThaiSuKien: {
    // Trạng thái của chính sự kiện đó
    maTrangThai: string;
    tenTrangThai: string;
  };
  isDaChapNhanMoi?: boolean | null; // Nếu việc tham gia dựa trên lời mời
  // coTheThamDuTuDo?: boolean; // Nếu là sự kiện mở, người dùng tự check-in tham gia (nếu có)
  danhGiaCuaToi?: DanhGiaCuaToi | null;
  coTheDanhGia: boolean;
}

export interface GetMyAttendedEventsParams {
  trangThaiSuKien?:
    | 'SAP_DIEN_RA'
    | 'DANG_DIEN_RA'
    | 'DA_HOAN_THANH'
    | 'DA_HUY'
    | 'ALL';
  daDanhGia?: boolean; // true, false, undefined (all)
  tuNgay?: string; // YYYY-MM-DD (lọc theo ngày kết thúc sự kiện)
  denNgay?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSuKienDaThamGiaResponse {
  items: SuKienDaThamGiaItem[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface GuiDanhGiaPayload {
  suKienID: number;
  diemNoiDung: number;
  diemToChuc: number;
  diemDiaDiem: number;
  yKienDongGop?: string | null;
}

export interface DanhGiaSKResponse {
  // Response khi gửi hoặc cập nhật đánh giá
  danhGiaSkID: number;
  suKienID: number;
  nguoiDanhGiaID: number;
  diemNoiDung: number;
  diemToChuc: number;
  diemDiaDiem: number;
  yKienDongGop?: string | null;
  tgDanhGia: string; // ISO Date string
}

export interface CapNhatDanhGiaPayload {
  diemNoiDung?: number;
  diemToChuc?: number;
  diemDiaDiem?: number;
  yKienDongGop?: string | null;
}

// --- API Functions ---

const getMyAttendedEvents = async (
  params?: GetMyAttendedEventsParams
): Promise<PaginatedSuKienDaThamGiaResponse> => {
  return apiHelper.get(
    '/sukien/da-tham-gia/cua-toi',
    params || {}
  ) as Promise<PaginatedSuKienDaThamGiaResponse>;
};

const submitEventRating = async (
  payload: GuiDanhGiaPayload
): Promise<DanhGiaSKResponse> => {
  return apiHelper.post(
    '/danh-gia-su-kien',
    payload
  ) as Promise<DanhGiaSKResponse>;
};

const updateEventRating = async (
  danhGiaSkID: number | string,
  payload: CapNhatDanhGiaPayload
): Promise<DanhGiaSKResponse> => {
  return apiHelper.put(
    `/danh-gia-su-kien/${danhGiaSkID}`,
    payload
  ) as Promise<DanhGiaSKResponse>;
};

const deleteEventRating = async (
  danhGiaSkID: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danh-gia-su-kien/${danhGiaSkID}`) as Promise<{
    message: string;
  }>;
};

const eventRatingService = {
  getMyAttendedEvents,
  submitEventRating,
  updateEventRating, // Thêm nếu bạn triển khai API cập nhật
  deleteEventRating, // Thêm nếu bạn triển khai API xóa
};

export default eventRatingService;
