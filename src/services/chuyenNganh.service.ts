// src/services/chuyenNganh.service.ts
import {
  ChuyenNganhResponseMin,
  GetChuyenNganhForSelectParams,
  NganhHocResponseMin,
} from '@/services/danhMuc.service';
import apiHelper from './apiHelper';

export interface ChuyenNganhResponse {
  chuyenNganhID: number;
  tenChuyenNganh: string;
  maChuyenNganh?: string | null;
  nganhHoc: NganhHocResponseMin; // Thông tin ngành học cha
  moTaCN?: string | null;
  soLuongLop?: number; // Backend tính toán
}

export interface PaginatedChuyenNganhResponse {
  items: ChuyenNganhResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface CreateChuyenNganhPayload {
  tenChuyenNganh: string;
  maChuyenNganh?: string | null;
  // nganhHocID sẽ được truyền qua path param hoặc trong payload nếu API thiết kế khác
  moTaCN?: string | null;
}

export interface UpdateChuyenNganhPayload {
  tenChuyenNganh?: string;
  maChuyenNganh?: string | null;
  moTaCN?: string | null;
}

export interface GetChuyenNganhParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Lấy danh sách chuyên ngành thuộc một ngành cụ thể
const getChuyenNganhListByNganh = async (
  nganhHocId: number,
  params: GetChuyenNganhParams
): Promise<PaginatedChuyenNganhResponse> => {
  return apiHelper.get(
    `/danhmuc/nganh-hoc/${nganhHocId}/chuyen-nganh`,

    params
  ) as Promise<PaginatedChuyenNganhResponse>;
};

// Lấy chi tiết một chuyên ngành (endpoint này có thể không cần nganhHocId nếu ChuyenNganhID là unique toàn hệ thống)
const getChuyenNganhDetail = async (
  chuyenNganhId: number | string
): Promise<ChuyenNganhResponse> => {
  return apiHelper.get(
    `/danhmuc/chuyen-nganh/${chuyenNganhId}`
  ) as Promise<ChuyenNganhResponse>;
};

// Tạo chuyên ngành mới cho một ngành
const createChuyenNganhForNganh = async (
  nganhHocId: number,
  payload: CreateChuyenNganhPayload
): Promise<ChuyenNganhResponse> => {
  return apiHelper.post(
    `/danhmuc/nganh-hoc/${nganhHocId}/chuyen-nganh`,
    payload
  ) as Promise<ChuyenNganhResponse>;
};

// Cập nhật một chuyên ngành
const updateChuyenNganh = async (
  chuyenNganhId: number | string,
  payload: UpdateChuyenNganhPayload
): Promise<ChuyenNganhResponse> => {
  return apiHelper.put(
    `/danhmuc/chuyen-nganh/${chuyenNganhId}`,
    payload
  ) as Promise<ChuyenNganhResponse>;
};

// Xóa một chuyên ngành
const deleteChuyenNganh = async (
  chuyenNganhId: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danhmuc/chuyen-nganh/${chuyenNganhId}`) as Promise<{
    message: string;
  }>;
};

const chuyenNganhService = {
  getChuyenNganhListByNganh,
  getChuyenNganhDetail,
  createChuyenNganhForNganh,
  updateChuyenNganh,
  deleteChuyenNganh,
};

export default chuyenNganhService;
