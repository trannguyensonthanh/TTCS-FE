import apiHelper from '@/services/apiHelper';
import { DonViResponseMin } from '@/services/event.service';

// --- Types (Nhắc lại một số type quan trọng cho context này) ---
export interface DonViThamGiaInput {
  donViID: number;
}

export interface DonViChaInfo {
  donViID: number;
  tenDonVi: string;
  maDonVi?: string | null;
}

export interface DonViListItem {
  donViID: number;
  tenDonVi: string;
  maDonVi?: string | null;
  loaiDonVi: string; // Mã loại đơn vị (VD: 'KHOA')
  tenLoaiDonVi?: string; // Tên hiển thị của loại đơn vị (Backend có thể join hoặc FE tự map)
  donViCha?: DonViChaInfo | null;
  soLuongDonViCon?: number; // Số lượng đơn vị con trực tiếp
  soLuongThanhVien?: number; // Số lượng người dùng (GV, SV, NV) thuộc đơn vị này (nếu có và cần thiết)
  moTaDv?: string | null;
  // Thêm các thông tin khác nếu cần cho danh sách
}

export interface CreateDonViPayload {
  tenDonVi: string;
  maDonVi?: string | null;
  loaiDonVi: string; // Mã loại đơn vị (VD: 'KHOA', 'PHONG')
  donViChaID?: number | null;
  moTaDv?: string | null;
}

export type DonViDetail = DonViListItem;

export interface UpdateDonViPayload {
  tenDonVi?: string;
  maDonVi?: string | null;
  loaiDonVi?: string;
  donViChaID?: number | null; // Có thể cho phép thay đổi đơn vị cha
  moTaDv?: string | null;
}

export interface LoaiDonViOption {
  maLoai: string; // VD: 'KHOA'
  tenLoai: string; // VD: 'Khoa'
} // Response sẽ là: LoaiDonViOption[]

export interface DonViSelectOption {
  donViID: number;
  tenDonViHienThi: string; // VD: "Khoa Công nghệ Thông tin (KHOA)"
} // Response sẽ là: DonViSelectOption[]

export interface GetDonViParams {
  searchTerm?: string;
  loaiDonVi?: string;
  donViChaID?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedDonViResponse {
  items: DonViListItem[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number; // Thêm pageSize để biết limit hiện tại
}
const getDonViList = async (
  params?: GetDonViParams
): Promise<PaginatedDonViResponse> => {
  return apiHelper.get(
    '/donvi',
    params || {}
  ) as Promise<PaginatedDonViResponse>;
};

const getDonViDetail = (donViId: number | string): Promise<DonViDetail> => {
  return apiHelper.get(`/donvi/${Number(donViId)}`);
};

const createDonVi = (payload: CreateDonViPayload): Promise<DonViDetail> => {
  return apiHelper.post('/donvi', payload);
};

const updateDonVi = (
  donViId: number | string,
  payload: UpdateDonViPayload
): Promise<DonViDetail> => {
  return apiHelper.put(`/donvi/${Number(donViId)}`, payload);
};

const deleteDonVi = (
  donViId: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/donvi/${Number(donViId)}`);
};

const getLoaiDonViOptions = (): Promise<LoaiDonViOption[]> => {
  return apiHelper.get('/danhmuc/loai-don-vi');
};

const getDonViChaOptions = (
  excludeDonViId?: number
): Promise<DonViSelectOption[]> => {
  return apiHelper.get('/donvi/don-vi-cha-options', {
    excludeDonViId: Number(excludeDonViId),
  });
};

export const donViService = {
  getDonViList,
  getDonViDetail,
  createDonVi,
  updateDonVi,
  deleteDonVi,
  getLoaiDonViOptions,
  getDonViChaOptions,
};
