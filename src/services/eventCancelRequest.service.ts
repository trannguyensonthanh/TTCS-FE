// src/services/eventCancelRequest.service.ts
import {
  DonViResponseMin,
  NguoiDungResponseMin,
  SuKienDetailResponse,
} from '@/services/event.service';
import apiHelper, { APIError } from './apiHelper';

export interface GetYeuCauHuySKParams {
  searchTerm?: string;
  trangThaiYcHuySkMa?: string;
  suKienID?: number;
  nguoiYeuCauID?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TrangThaiYeuCauHuySKResponse {
  trangThaiYcHuySkID: number;
  maTrangThai: string;
  tenTrangThai: string;
}

export interface SuKienInfoForCancelRequest {
  // Thông tin sự kiện tối thiểu
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string; // ISO
}

export interface YeuCauHuySKListItemResponse {
  ycHuySkID: number;
  suKien: SuKienInfoForCancelRequest;
  nguoiYeuCau: NguoiDungResponseMin;
  donViYeuCau: DonViResponseMin; // Đơn vị của người yêu cầu hủy
  ngayYeuCauHuy: string; // ISO
  lyDoHuyNganGon?: string; // Cắt bớt lý do để hiển thị list
  trangThaiYeuCauHuySK: TrangThaiYeuCauHuySKResponse;
  nguoiDuyetBGH?: NguoiDungResponseMin | null;
  ngayDuyetBGH?: string | null; // ISO
}

export interface PaginatedYeuCauHuySKResponse {
  items: YeuCauHuySKListItemResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface YeuCauHuySKDetailResponse extends YeuCauHuySKListItemResponse {
  lyDoHuy: string; // Lý do đầy đủ
  lyDoTuChoiHuyBGH?: string | null;
  // Có thể thêm thông tin chi tiết hơn về sự kiện nếu cần
  suKienFullDetail?: SuKienDetailResponse; // Optional, nếu cần load cả chi tiết sự kiện
}

export interface DuyetYcHuyPayload {
  ghiChuBGH?: string | null;
}

export interface TuChoiYcHuyPayload {
  lyDoTuChoiHuyBGH: string; // NOT NULL
}
// --- Types (Đã định nghĩa ở trên hoặc trong yeuCauHuySK.types.ts) ---

// --- API Functions ---
const getEventCancelRequests = async (
  params: GetYeuCauHuySKParams
): Promise<PaginatedYeuCauHuySKResponse> => {
  return apiHelper.get(
    '/yeucauhuysk',
    params
  ) as Promise<PaginatedYeuCauHuySKResponse>;
};

const getEventCancelRequestDetail = async (
  id: number | string
): Promise<YeuCauHuySKDetailResponse> => {
  return apiHelper.get(
    `/yeucauhuysk/${id}`
  ) as Promise<YeuCauHuySKDetailResponse>;
};

const approveEventCancelRequest = async (
  id: number | string,
  payload: DuyetYcHuyPayload
): Promise<YeuCauHuySKDetailResponse> => {
  return apiHelper.post(
    `/yeucauhuysk/${id}/duyet`,
    payload
  ) as Promise<YeuCauHuySKDetailResponse>;
};

const rejectEventCancelRequest = async (
  id: number | string,
  payload: TuChoiYcHuyPayload
): Promise<YeuCauHuySKDetailResponse> => {
  return apiHelper.post(
    `/yeucauhuysk/${id}/tuchoi`,
    payload
  ) as Promise<YeuCauHuySKDetailResponse>;
};

const revokeEventCancelRequest = async (
  id: number | string
): Promise<YeuCauHuySKDetailResponse> => {
  return apiHelper.put(
    `/yeucauhuysk/${id}/thu-hoi`,
    {}
  ) as Promise<YeuCauHuySKDetailResponse>;
};

const eventCancelRequestService = {
  getEventCancelRequests,
  getEventCancelRequestDetail,
  approveEventCancelRequest,
  rejectEventCancelRequest,
  revokeEventCancelRequest, // Thêm mới
};

export default eventCancelRequestService;
