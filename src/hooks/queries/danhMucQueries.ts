// src/hooks/queries/danhMucQueries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { APIError } from '@/services/apiHelper';
import danhMucService, {
  GetLoaiPhongParams,
  GetPhongForSelectParams,
  GetToaNhaTangForSelectParams,
  GetTrangThaiPhongParams,
  GetTrangThietBiForSelectParams,
  PhongForSelectResponse,
  ToaNhaTangForSelectResponse,
  TrangThietBiResponseMin,
} from '@/services/danhMuc.service';
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import { TrangThaiPhongResponse } from '@/services/phong.service';

export const DANH_MUC_QUERY_KEYS = {
  // ... (keys cũ)
  loaiPhong: (params?: GetLoaiPhongParams) =>
    ['loaiPhong', params || {}] as const,
  phongForSelect: (params?: GetPhongForSelectParams) =>
    ['phongForSelect', params || {}] as const,
  trangThaiPhong: (params?: GetTrangThaiPhongParams) =>
    ['trangThaiPhong', params || {}] as const,
  toaNhaTangForSelect: (params?: GetToaNhaTangForSelectParams) =>
    ['toaNhaTangForSelect', params || {}] as const,
  trangThietBiForSelect: (params?: GetTrangThietBiForSelectParams) =>
    ['trangThietBiForSelect', params || {}] as const,
};

// ... (useDonViList, useNguoiDungListForSelect, useLoaiSuKienList (có thể lấy từ eventQueries) đã có)

// Hook lấy danh sách Loại Phòng
export const useLoaiPhongList = (
  params?: GetLoaiPhongParams,
  options?: Omit<
    UseQueryOptions<LoaiPhongResponseMin[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<LoaiPhongResponseMin[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.loaiPhong(params),
    queryFn: () => danhMucService.getLoaiPhongList(params),
    staleTime: 60 * 60 * 1000, // 1 giờ
    ...options,
  });
};

// Hook lấy danh sách Phòng để chọn
export const usePhongListForSelect = (
  params?: GetPhongForSelectParams,
  options?: Omit<
    UseQueryOptions<PhongForSelectResponse[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PhongForSelectResponse[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.phongForSelect(params),
    queryFn: () => danhMucService.getPhongListForSelect(params),
    // staleTime có thể ngắn hơn vì tính khả dụng của phòng thay đổi thường xuyên
    staleTime: 5 * 60 * 1000, // 5 phút
    enabled: options?.enabled !== undefined ? options.enabled : true, // Mặc định là enabled
    ...options,
  });
};

// Hook lấy danh sách Trạng Thái Phòng
export const useTrangThaiPhongList = (
  params?: GetTrangThaiPhongParams,
  options?: Omit<
    UseQueryOptions<TrangThaiPhongResponse[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<TrangThaiPhongResponse[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.trangThaiPhong(params),
    queryFn: () => danhMucService.getTrangThaiPhongList(params),
    staleTime: 60 * 60 * 1000,
    ...options,
  });
};

// Hook lấy danh sách Tầng Vật Lý (ToaNha_Tang) để chọn
export const useToaNhaTangListForSelect = (
  // toaNhaId: number | string | undefined,
  params?: GetToaNhaTangForSelectParams,
  options?: Omit<
    UseQueryOptions<ToaNhaTangForSelectResponse[], APIError>,
    'queryKey' | 'queryFn' /*| 'enabled'*/
  >
) => {
  return useQuery<ToaNhaTangForSelectResponse[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.toaNhaTangForSelect(params),
    queryFn: () => danhMucService.getToaNhaTangListForSelect(params),
    staleTime: 15 * 60 * 1000, // 15 phút, vì có thể có tầng mới được thêm
    // enabled: !!toaNhaId, // Chỉ fetch nếu có toaNhaId (nếu là param bắt buộc của hook)
    ...options,
  });
};

// Hook lấy danh sách Trang Thiết Bị để chọn
export const useTrangThietBiListForSelect = (
  params?: GetTrangThietBiForSelectParams,
  options?: Omit<
    UseQueryOptions<TrangThietBiResponseMin[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<TrangThietBiResponseMin[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.trangThietBiForSelect(params),
    queryFn: () => danhMucService.getTrangThietBiListForSelect(params),
    staleTime: 30 * 60 * 1000, // 30 phút
    ...options,
  });
};
