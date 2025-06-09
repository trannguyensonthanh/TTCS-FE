import apiHelper from '@/services/apiHelper';
import {
  CreateTrangThietBiPayload,
  GetTrangThietBiParams,
  PaginatedTrangThietBiResponse,
  TrangThietBiFullResponse,
  UpdateTrangThietBiPayload,
} from '@/services/danhMuc.service';

// --- Trang Thiết Bị ---
const getTrangThietBiList = async (
  params: GetTrangThietBiParams
): Promise<PaginatedTrangThietBiResponse> => {
  return apiHelper.get(
    '/danhmuc/trang-thiet-bi',
    params
  ) as Promise<PaginatedTrangThietBiResponse>;
};

// --- Chi tiết Trang Thiết Bị ---
const getTrangThietBiDetail = async (
  id: number | string
): Promise<TrangThietBiFullResponse> => {
  return apiHelper.get(
    `/danhmuc/trang-thiet-bi/${id}`
  ) as Promise<TrangThietBiFullResponse>;
};

// --- Tạo, Cập nhật, Xoá Trang Thiết Bị ---
const createTrangThietBi = async (
  payload: CreateTrangThietBiPayload
): Promise<TrangThietBiFullResponse> => {
  return apiHelper.post(
    '/danhmuc/trang-thiet-bi',
    payload
  ) as Promise<TrangThietBiFullResponse>;
};

// Cập nhật Trang Thiết Bị
const updateTrangThietBi = async (
  id: number | string,
  payload: UpdateTrangThietBiPayload
): Promise<TrangThietBiFullResponse> => {
  return apiHelper.put(
    `/danhmuc/trang-thiet-bi/${id}`,
    payload
  ) as Promise<TrangThietBiFullResponse>;
};

// Xoá Trang Thiết Bị
const deleteTrangThietBi = async (
  id: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danhmuc/trang-thiet-bi/${id}`) as Promise<{
    message: string;
  }>;
};

const trangThietBiService = {
  getTrangThietBiList,
  getTrangThietBiDetail,
  createTrangThietBi,
  updateTrangThietBi,
  deleteTrangThietBi,
};

export default trangThietBiService;
