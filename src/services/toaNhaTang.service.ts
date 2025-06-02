// src/services/toaNhaTang.service.ts
import { LoaiTangResponse } from '@/services/loaiTang.service';
import apiHelper, { APIError } from './apiHelper';
import { ToaNhaResponseMin } from '@/services/toaNha.service';
// src/types/toaNhaTang.types.ts (Tạo file mới)

export interface ToaNhaTangResponse {
  toaNhaTangID: number;
  toaNha: ToaNhaResponseMin;
  loaiTang: LoaiTangResponse;
  soPhong?: number | null;
  moTa?: string | null;
}

export interface PaginatedToaNhaTangResponse {
  items: ToaNhaTangResponse[];
  thongTinToaNhaCha?: ToaNhaResponseMin;
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

// src/types/toaNhaTang.types.ts
export interface CreateToaNhaTangPayload {
  loaiTangID: number;
  soPhong?: number | null;
  moTa?: string | null;
}

// src/types/toaNhaTang.types.ts
export interface UpdateToaNhaTangPayload {
  soPhong?: number | null;
  moTa?: string | null;
}

export interface GetToaNhaTangParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getToaNhaTangList = async (
  toaNhaId: number | string,
  params: GetToaNhaTangParams
): Promise<PaginatedToaNhaTangResponse> => {
  return apiHelper.get(
    `/danhmuc/toa-nha/${toaNhaId}/tang`,
    params
  ) as Promise<PaginatedToaNhaTangResponse>;
};

const getToaNhaTangDetail = async (
  toaNhaTangId: number | string
): Promise<ToaNhaTangResponse> => {
  return apiHelper.get(
    `/danhmuc/tang/${toaNhaTangId}`
  ) as Promise<ToaNhaTangResponse>;
};

const createToaNhaTang = async (
  toaNhaId: number | string,
  payload: CreateToaNhaTangPayload
): Promise<ToaNhaTangResponse> => {
  return apiHelper.post(
    `/danhmuc/toa-nha/${toaNhaId}/tang`,
    payload
  ) as Promise<ToaNhaTangResponse>;
};

const updateToaNhaTang = async (
  toaNhaTangId: number | string,
  payload: UpdateToaNhaTangPayload
): Promise<ToaNhaTangResponse> => {
  return apiHelper.put(
    `/danhmuc/tang/${toaNhaTangId}`,
    payload
  ) as Promise<ToaNhaTangResponse>;
};

const deleteToaNhaTang = async (
  toaNhaTangId: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danhmuc/tang/${toaNhaTangId}`) as Promise<{
    message: string;
  }>;
};

const toaNhaTangService = {
  getToaNhaTangList,
  getToaNhaTangDetail,
  createToaNhaTang,
  updateToaNhaTang,
  deleteToaNhaTang,
};

export default toaNhaTangService;
