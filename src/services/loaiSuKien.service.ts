import apiHelper from '@/services/apiHelper';
// --- Types cho Loại Sự Kiện ---
export interface LoaiSuKienResponse {
  loaiSuKienID: number;
  maLoaiSK: string;
  tenLoaiSK: string;
  moTaLoaiSK?: string | null;
  isActive: boolean;
}

export interface GetLoaiSuKienParams {
  searchTerm?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedLoaiSuKienResponse {
  items: LoaiSuKienResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

// Lấy danh sách Loại Sự Kiện
const getLoaiSuKienList = async (
  params?: GetLoaiSuKienParams
): Promise<PaginatedLoaiSuKienResponse> => {
  // Nếu không có params, backend sẽ dùng default
  return apiHelper.get(
    '/loaisukien',
    params || {}
  ) as Promise<PaginatedLoaiSuKienResponse>;
};

const loaiSuKien = {
  getLoaiSuKienList,
};

export default loaiSuKien;
