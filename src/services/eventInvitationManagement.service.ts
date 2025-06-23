// src/services/eventInvitationManagement.service.ts
import apiHelper, { APIError } from './apiHelper';
import {
  DonViResponseMin,
  NguoiDungResponseMin,
  TrangThaiSKResponse,
} from './event.service'; // Tái sử dụng types
import {
  PaginatedNguoiDuocMoiResponse,
  NguoiDuocMoiItem,
} from './invite.service'; // Tái sử dụng types từ invite.service

// --- Types for Event Invitation Management ---

// 1.1. Danh sách sự kiện đã có lời mời
export interface SuKienCoLoiMoiItem {
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string; // ISO
  donViChuTri: Pick<DonViResponseMin, 'tenDonVi'>;
  trangThaiSK: Pick<TrangThaiSKResponse, 'tenTrangThai' | 'maTrangThai'>;
  tongSoLuotMoi: number;
}

export interface GetEventsWithInvitationsParams {
  searchTerm?: string;
  donViToChucID?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedEventsWithInvitationsResponse {
  items: SuKienCoLoiMoiItem[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

// 1.2. Danh sách người được mời cho một sự kiện (Chi tiết hơn)
// Sử dụng lại NguoiDuocMoiItem từ invite.service.ts, nhưng có thể cần mở rộng NguoiDungResponseMin bên trong nó
// nếu API /danh-sach-moi trả về thêm thông tin đơn vị/lớp
export interface NguoiDuocMoiChiTietItem extends NguoiDuocMoiItem {
  nguoiDuocMoi: NguoiDungResponseMin & {
    anhDaiDien?: string | null;
    loaiNguoiDungHienThi?: string; // "Sinh viên", "Giảng viên"
    thongTinDonVi?: string; // "Lớp D20CNTT01 - Khoa CNTT"
    maDinhDanh?: string | null; // Mã định danh người dùng, nếu có
  };
  tgGuiMoi: string; // ISO Date string, thời gian tạo bản ghi SK_MoiThamGia
}

export interface PaginatedNguoiDuocMoiChiTietResponse
  extends Omit<PaginatedNguoiDuocMoiResponse, 'items'> {
  items: NguoiDuocMoiChiTietItem[];
}

// --- API Functions ---

const getEventsWithInvitations = async (
  params?: GetEventsWithInvitationsParams
): Promise<PaginatedEventsWithInvitationsResponse> => {
  return apiHelper.get(
    '/sukien/da-gui-loi-moi',
    params || {}
  ) as Promise<PaginatedEventsWithInvitationsResponse>;
};

const eventInvitationManagementService = {
  getEventsWithInvitations,
};

export default eventInvitationManagementService;
