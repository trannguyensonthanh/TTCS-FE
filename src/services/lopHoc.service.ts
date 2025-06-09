// src/services/lopHoc.service.ts
import { DonViResponseMin } from '@/services/event.service';
import apiHelper from './apiHelper';
import {
  ChuyenNganhResponseMin,
  NganhHocResponseMin,
} from '@/services/danhMuc.service';

export interface LopHocListItemResponse {
  lopID: number;
  tenLop: string;
  maLop?: string | null;
  nganhHoc: NganhHocResponseMin; // TenNganhHoc, MaNganhHoc
  chuyenNganh?: ChuyenNganhResponseMin | null; // TenChuyenNganh, MaChuyenNganh
  khoaQuanLy: DonViResponseMin; // TenDonVi (Khoa)
  nienKhoa?: string | null;
  soLuongSinhVien?: number; // Tính toán từ backend
  // gvcn?: NguoiDungResponseMin | null; // Thông tin Giảng viên chủ nhiệm
}

export interface PaginatedLopHocResponse {
  items: LopHocListItemResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface CreateLopHocPayload {
  tenLop: string; // NOT NULL
  maLop?: string | null; // UNIQUE nếu có
  nganhHocID: number; // NOT NULL
  chuyenNganhID?: number | null; // Phải thuộc nganhHocID đã chọn
  nienKhoa?: string | null;
  // gvcnID?: number | null; // ID của Giảng viên chủ nhiệm
}

export interface GetLopHocParams {
  searchTerm?: string;
  nganhHocID?: number;
  chuyenNganhID?: number;
  khoaQuanLyID?: number;
  nienKhoa?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateLopHocPayload {
  tenLop?: string;
  maLop?: string | null;
  nganhHocID?: number;
  chuyenNganhID?: number | null;
  nienKhoa?: string | null;
  // gvcnID?: number | null;
}

export type LopHocDetailResponse = LopHocListItemResponse;

const getLopHocList = async (
  params: GetLopHocParams
): Promise<PaginatedLopHocResponse> => {
  return apiHelper.get(
    '/danhmuc/lop-hoc',
    params
  ) as Promise<PaginatedLopHocResponse>;
};

const getLopHocDetail = async (
  id: number | string
): Promise<LopHocListItemResponse> => {
  // Dùng ListItem cho đơn giản
  return apiHelper.get(
    `/danhmuc/lop-hoc/${id}`
  ) as Promise<LopHocListItemResponse>;
};

const createLopHoc = async (
  payload: CreateLopHocPayload
): Promise<LopHocListItemResponse> => {
  return apiHelper.post(
    '/danhmuc/lop-hoc',
    payload
  ) as Promise<LopHocListItemResponse>;
};

const updateLopHoc = async (
  id: number | string,
  payload: UpdateLopHocPayload
): Promise<LopHocListItemResponse> => {
  return apiHelper.put(
    `/danhmuc/lop-hoc/${id}`,
    payload
  ) as Promise<LopHocListItemResponse>;
};

const deleteLopHoc = async (
  id: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danhmuc/lop-hoc/${id}`) as Promise<{
    message: string;
  }>;
};

const lopHocService = {
  getLopHocList,
  getLopHocDetail,
  createLopHoc,
  updateLopHoc,
  deleteLopHoc,
};

export default lopHocService;
