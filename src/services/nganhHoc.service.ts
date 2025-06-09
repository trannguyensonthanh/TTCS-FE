// src/services/nganhHoc.service.ts
import { DonViResponseMin } from '@/services/event.service';
import apiHelper from './apiHelper';
import { ChuyenNganhResponse } from '@/services/chuyenNganh.service';

export interface NganhHocResponse {
  nganhHocID: number;
  tenNganhHoc: string;
  maNganhHoc?: string | null;
  khoaQuanLy: DonViResponseMin; // Thông tin Khoa quản lý
  moTaNH?: string | null;
  coChuyenNganh: boolean;
  soLuongChuyenNganh?: number; // Backend tính toán
  soLuongLop?: number; // Backend tính toán
}

export interface NganhHocDetailResponse extends NganhHocResponse {
  chuyenNganhs?: ChuyenNganhResponse[]; // ChuyenNganhResponse sẽ định nghĩa bên dưới
}

export interface PaginatedNganhHocResponse {
  items: NganhHocResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface CreateNganhHocPayload {
  tenNganhHoc: string;
  maNganhHoc?: string | null;
  khoaQuanLyID: number; // ID của DonVi (Khoa)
  moTaNH?: string | null;
  coChuyenNganh: boolean;
}

export interface UpdateNganhHocPayload {
  tenNganhHoc?: string;
  maNganhHoc?: string | null;
  khoaQuanLyID?: number;
  moTaNH?: string | null;
  coChuyenNganh?: boolean;
}

export interface GetNganhHocParams {
  searchTerm?: string;
  khoaQuanLyID?: number;
  coChuyenNganh?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getNganhHocList = async (
  params: GetNganhHocParams
): Promise<PaginatedNganhHocResponse> => {
  return apiHelper.get(
    '/danhmuc/nganh-hoc',
    params
  ) as Promise<PaginatedNganhHocResponse>;
};

const getNganhHocDetail = async (
  id: number | string
): Promise<NganhHocDetailResponse> => {
  // API này nên trả về cả danh sách chuyên ngành con
  return apiHelper.get(
    `/danhmuc/nganh-hoc/${id}`
  ) as Promise<NganhHocDetailResponse>;
};

const createNganhHoc = async (
  payload: CreateNganhHocPayload
): Promise<NganhHocResponse> => {
  // Trả về NganhHocResponse
  return apiHelper.post(
    '/danhmuc/nganh-hoc',
    payload
  ) as Promise<NganhHocResponse>;
};

const updateNganhHoc = async (
  id: number | string,
  payload: UpdateNganhHocPayload
): Promise<NganhHocResponse> => {
  return apiHelper.put(
    `/danhmuc/nganh-hoc/${id}`,
    payload
  ) as Promise<NganhHocResponse>;
};

const deleteNganhHoc = async (
  id: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danhmuc/nganh-hoc/${id}`) as Promise<{
    message: string;
  }>;
};

const nganhHocService = {
  getNganhHocList,
  getNganhHocDetail,
  createNganhHoc,
  updateNganhHoc,
  deleteNganhHoc,
};

export default nganhHocService;
