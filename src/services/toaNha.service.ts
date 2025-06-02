// src/services/toaNha.service.ts
import { DonViResponseMin } from '@/services/event.service';
import apiHelper, { APIError } from './apiHelper';

export interface ToaNhaResponseMin {
  // Type mới
  toaNhaID: number;
  maToaNha: string;
  tenToaNha: string;
  // Có thể thêm coSoID nếu cần thiết để biết nó thuộc cơ sở nào nhanh chóng
  // coSoID?: number;
}

export interface ToaNhaResponse {
  toaNhaID: number;
  maToaNha: string;
  tenToaNha: string;
  coSo: DonViResponseMin; // Thông tin cơ sở quản lý tòa nhà
  moTaToaNha?: string | null;
  // Có thể thêm số lượng tầng, số lượng phòng nếu cần hiển thị nhanh
  // soLuongTang?: number;
  // soLuongPhong?: number;
}

export interface PaginatedToaNhaResponse {
  items: ToaNhaResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}
export interface GetToaNhaParams {
  searchTerm?: string;
  coSoID?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// src/types/toaNha.types.ts
export interface CreateToaNhaPayload {
  maToaNha: string; // NOT NULL
  tenToaNha: string; // NOT NULL
  coSoID: number; // NOT NULL (FK đến DonVi)
  moTaToaNha?: string | null;
}

// src/types/toaNha.types.ts
export interface UpdateToaNhaPayload {
  maToaNha?: string;
  tenToaNha?: string;
  coSoID?: number;
  moTaToaNha?: string | null;
}

const getToaNhaList = async (
  params: GetToaNhaParams
): Promise<PaginatedToaNhaResponse> => {
  return apiHelper.get(
    '/danhmuc/toa-nha',
    params
  ) as Promise<PaginatedToaNhaResponse>;
};

const getToaNhaDetail = async (
  id: number | string
): Promise<ToaNhaResponse> => {
  return apiHelper.get(`/danhmuc/toa-nha/${id}`) as Promise<ToaNhaResponse>;
};

const createToaNha = async (
  payload: CreateToaNhaPayload
): Promise<ToaNhaResponse> => {
  return apiHelper.post('/danhmuc/toa-nha', payload) as Promise<ToaNhaResponse>;
};

const updateToaNha = async (
  id: number | string,
  payload: UpdateToaNhaPayload
): Promise<ToaNhaResponse> => {
  return apiHelper.put(
    `/danhmuc/toa-nha/${id}`,
    payload
  ) as Promise<ToaNhaResponse>;
};

const deleteToaNha = async (
  id: number | string
): Promise<{ message: string }> => {
  // Giả sử backend trả về message sau khi xóa
  return apiHelper.delete(`/danhmuc/toa-nha/${id}`) as Promise<{
    message: string;
  }>;
};

const toaNhaService = {
  getToaNhaList,
  getToaNhaDetail,
  createToaNha,
  updateToaNha,
  deleteToaNha,
};

export default toaNhaService;
