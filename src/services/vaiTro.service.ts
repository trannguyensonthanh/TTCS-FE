// src/services/vaiTro.service.ts
import apiHelper from './apiHelper';

export interface VaiTroHeThongItem {
  vaiTroID: number;
  maVaiTro: string;
  tenVaiTro: string;
  moTaVT?: string | null;
  soNguoiDungSuDung?: number; // Số lượng người dùng đang được gán vai trò này (Backend tính toán)
}

export interface PaginatedVaiTroHeThongResponse {
  items: VaiTroHeThongItem[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface GetVaiTroHeThongParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVaiTroHeThongPayload {
  maVaiTro: string; // Bắt buộc, UNIQUE
  tenVaiTro: string; // Bắt buộc
  moTaVT?: string | null;
}

export interface UpdateVaiTroHeThongPayload {
  tenVaiTro?: string;
  moTaVT?: string | null;
}

export interface VaiTroForSelectResponse {
  vaiTroID: number;
  maVaiTro: string;
  tenVaiTro: string;
}

const vaiTroService = {
  getVaiTroList: (
    params: GetVaiTroHeThongParams
  ): Promise<PaginatedVaiTroHeThongResponse> => {
    return apiHelper.get('/vaitrohethong', params);
  },

  // getVaiTroDetail: (vaiTroId: number | string): Promise<VaiTroHeThongItem> => {
  //   return apiHelper.get(`/vaitrohethong/${vaiTroId}`);
  // }, // Có thể không cần nếu danh sách đã đủ thông tin cho form sửa

  createVaiTro: (
    payload: CreateVaiTroHeThongPayload
  ): Promise<VaiTroHeThongItem> => {
    return apiHelper.post('/vaitrohethong', payload);
  },

  updateVaiTro: (
    vaiTroId: number | string,
    payload: UpdateVaiTroHeThongPayload
  ): Promise<VaiTroHeThongItem> => {
    return apiHelper.put(`/vaitrohethong/${vaiTroId}`, payload);
  },

  deleteVaiTro: (vaiTroId: number | string): Promise<{ message: string }> => {
    return apiHelper.delete(`/vaitrohethong/${vaiTroId}`);
  },

  getVaiTroForSelect: async (): Promise<VaiTroForSelectResponse[]> => {
    // Giả sử API trả về mảng trực tiếp, không phân trang
    return apiHelper.get('/vaitrohethong/cho-chon') as Promise<
      VaiTroForSelectResponse[]
    >;
  },
};

export default vaiTroService;
