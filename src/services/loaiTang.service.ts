// src/services/loaiTang.service.ts
import apiHelper, { APIError } from './apiHelper';

export interface UpdateLoaiTangPayload {
  maLoaiTang?: string;
  tenLoaiTang?: string;
  soThuTu?: number | null;
  moTa?: string | null;
}

export interface CreateLoaiTangPayload {
  maLoaiTang: string; // NOT NULL, UNIQUE
  tenLoaiTang: string; // NOT NULL
  soThuTu?: number | null;
  moTa?: string | null;
}

export interface GetLoaiTangParams {
  // Nhắc lại ở đây để service độc lập
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LoaiTangResponse {
  loaiTangID: number;
  maLoaiTang: string;
  tenLoaiTang: string;
  soThuTu?: number | null;
  moTa?: string | null;
}

export interface PaginatedLoaiTangResponse {
  items: LoaiTangResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

const getLoaiTangList = async (
  params: GetLoaiTangParams
): Promise<PaginatedLoaiTangResponse> => {
  return apiHelper.get(
    '/danhmuc/loai-tang',
    params
  ) as Promise<PaginatedLoaiTangResponse>;
};

const getLoaiTangDetail = async (
  id: number | string
): Promise<LoaiTangResponse> => {
  return apiHelper.get(`/danhmuc/loai-tang/${id}`) as Promise<LoaiTangResponse>;
};

const createLoaiTang = async (
  payload: CreateLoaiTangPayload
): Promise<LoaiTangResponse> => {
  return apiHelper.post(
    '/danhmuc/loai-tang',
    payload
  ) as Promise<LoaiTangResponse>;
};

const updateLoaiTang = async (
  id: number | string,
  payload: UpdateLoaiTangPayload
): Promise<LoaiTangResponse> => {
  return apiHelper.put(
    `/danhmuc/loai-tang/${id}`,
    payload
  ) as Promise<LoaiTangResponse>;
};

const deleteLoaiTang = async (
  id: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danhmuc/loai-tang/${id}`) as Promise<{
    message: string;
  }>;
};

const loaiTangService = {
  getLoaiTangList,
  getLoaiTangDetail,
  createLoaiTang,
  updateLoaiTang,
  deleteLoaiTang,
};

export default loaiTangService;
