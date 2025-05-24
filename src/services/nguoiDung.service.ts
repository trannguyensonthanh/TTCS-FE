import apiHelper from '@/services/apiHelper';
import { NguoiDungResponseMin } from '@/services/event.service';

export interface GetNguoiDungParams {
  searchTerm?: string;
  maVaiTro?: string;
  donViID?: number;
  limit?: number;
}
export interface PaginatedNguoiDungResponse {
  items: NguoiDungResponseMin[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number; // Thêm pageSize để biết limit hiện tại
}
const getNguoiDungList = async (
  params?: GetNguoiDungParams
): Promise<PaginatedNguoiDungResponse | NguoiDungResponseMin[]> => {
  return apiHelper.get('/nguoidung', params || {}) as Promise<
    PaginatedNguoiDungResponse | NguoiDungResponseMin[]
  >;
};

export const nguoiDungService = {
  getNguoiDungList,
};
