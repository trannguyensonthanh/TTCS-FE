import apiHelper from '@/services/apiHelper';
import { DonViResponseMin } from '@/services/event.service';

// --- Types (Nhắc lại một số type quan trọng cho context này) ---
export interface DonViThamGiaInput {
  donViID: number;
}

export interface GetDonViParams {
  loaiDonVi?: string; // 'KHOA', 'PHONG', 'BAN', 'CLB', 'DOAN_THE'
  searchTerm?: string;
  limit?: number; // Mặc định lấy hết nếu không có
}
export interface PaginatedDonViResponse {
  items: DonViResponseMin[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number; // Thêm pageSize để biết limit hiện tại
}
const getDonViList = async (
  params?: GetDonViParams
): Promise<PaginatedDonViResponse | DonViResponseMin[]> => {
  return apiHelper.get('/donvi', params || {}) as Promise<
    PaginatedDonViResponse | DonViResponseMin[]
  >;
};

export const donViService = {
  getDonViList,
};
