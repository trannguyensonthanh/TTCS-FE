// src/services/invitationResponse.service.ts
import { LoaiSuKienResponse } from '@/services/loaiSuKien.service';
import apiHelper, { APIError } from './apiHelper';
import { DonViResponseMin, NguoiDungResponseMin } from './event.service'; // Tái sử dụng types

// --- Types for Invitation Response ---

export interface SuKienTrongLoiMoi {
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string; // ISO Date string
  tgKetThucDK: string; // ISO Date string
  diaDiemDaXep?: string | null;
  loaiSuKien?: LoaiSuKienResponse | null;
  donViChuTri: DonViResponseMin;
  // Có thể thêm mô tả ngắn sự kiện nếu cần
  moTaNganSK?: string | null;
}

export interface NguoiGuiMoiInfo {
  hoTen: string;
  donViCongTac?: string | null; // Tên đơn vị của người gửi
  // anhDaiDien?: string | null; // Nếu muốn hiển thị avatar người gửi
}

export interface LoiMoiSuKienItem {
  moiThamGiaID: number;
  suKien: SuKienTrongLoiMoi;
  vaiTroDuKienSK?: string | null;
  ghiChuMoi?: string | null;
  isChapNhanMoi?: boolean | null; // null: chưa phản hồi, true: chấp nhận, false: từ chối
  tgMoi: string; // Thời gian gửi lời mời (hoặc thời gian tạo bản ghi SK_MoiThamGia)
  tgPhanHoiMoi?: string | null; // Thời gian người dùng phản hồi
  nguoiGuiMoi?: NguoiGuiMoiInfo | null; // Thông tin người gửi lời mời (CTSV)
  // lyDoTuChoiCuaNguoiDung?: string | null; // Nếu BE hỗ trợ lưu lý do từ chối từ người dùng
}

export interface GetMyInvitationsParams {
  trangThaiPhanHoi?: 'CHUA_PHAN_HOI' | 'DA_CHAP_NHAN' | 'DA_TU_CHOI' | 'ALL';
  sapDienRa?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedLoiMoiSuKienResponse {
  items: LoiMoiSuKienItem[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface PhanHoiLoiMoiPayload {
  chapNhan: boolean;
  lyDoTuChoi?: string | null; // Gửi null nếu chấp nhận hoặc không có lý do
}

export interface PhanHoiLoiMoiResponse {
  message: string;
  loiMoiCapNhat: {
    moiThamGiaID: number;
    isChapNhanMoi: boolean;
    tgPhanHoiMoi: string; // ISO Date string
    // lyDoTuChoi?: string | null; // Nếu BE trả về
  };
}

// --- API Functions ---

const getMyInvitations = async (
  params?: GetMyInvitationsParams
): Promise<PaginatedLoiMoiSuKienResponse> => {
  return apiHelper.get(
    '/loi-moi-su-kien/cua-toi',
    params || {}
  ) as Promise<PaginatedLoiMoiSuKienResponse>;
};

const respondToInvitation = async (
  moiThamGiaID: number | string,
  payload: PhanHoiLoiMoiPayload
): Promise<PhanHoiLoiMoiResponse> => {
  return apiHelper.post(
    `/loi-moi-su-kien/${moiThamGiaID}/phan-hoi`,
    payload
  ) as Promise<PhanHoiLoiMoiResponse>;
};

const invitationResponseService = {
  getMyInvitations,
  respondToInvitation,
};

export default invitationResponseService;
