// src/hooks/queries/danhMucQueries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { APIError } from '@/services/apiHelper';
import danhMucService, {
  ChuyenNganhResponseMin,
  GetChuyenNganhForSelectParams,
  GetLoaiPhongParams,
  GetNganhHocForSelectParams,
  GetPhongForSelectParams,
  GetToaNhaForSelectParams,
  GetToaNhaTangForSelectParams,
  GetTrangThaiPhongParams,
  GetTrangThietBiForSelectParams,
  NganhHocResponseMin,
  PhongForSelectResponse,
  ToaNhaTangForSelectResponse,
  TrangThietBiResponseMin,
} from '@/services/danhMuc.service';
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import { TrangThaiPhongResponse } from '@/services/phong.service';
import { ToaNhaResponseMin } from '@/services/toaNha.service';

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
  nganhHocForSelect: (params?: GetNganhHocForSelectParams) =>
    ['nganhHocForSelect', params || {}] as const,
  chuyenNganhForSelectByNganh: (
    nganhHocId?: number,
    params?: GetChuyenNganhForSelectParams
  ) => ['chuyenNganhForSelect', 'byNganh', nganhHocId, params || {}] as const,
  toaNhaForSelect: (params?: GetToaNhaForSelectParams) =>
    ['toaNhaForSelect', params || {}] as const,
};

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

// Hook lấy danh sách Tòa Nhà để chọn
export const useToaNhaListForSelect = (
  params?: GetToaNhaForSelectParams,
  options?: Omit<
    UseQueryOptions<ToaNhaResponseMin[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ToaNhaResponseMin[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.toaNhaForSelect(params),
    queryFn: () => danhMucService.getToaNhaListForSelect(params),
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
    // enabled: !!toaNhaId, // Chỉ fetch   toaNhaId (nếu là param bắt buộc của hook)
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

// Hook lấy danh sách Ngành Học để chọn
export const useNganhHocListForSelect = (
  params?: GetNganhHocForSelectParams,
  options?: Omit<
    UseQueryOptions<NganhHocResponseMin[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<NganhHocResponseMin[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.nganhHocForSelect(params),
    queryFn: () => danhMucService.getNganhHocListForSelect(params),
    staleTime: 60 * 60 * 1000, // Cache 1 giờ, danh mục ngành ít thay đổi
    ...options,
  });
};

// Hook lấy danh sách Chuyên Ngành theo Ngành Học ID để chọn
export const useChuyenNganhListForSelectByNganh = (
  nganhHocId: number | undefined, // ID của ngành học cha
  params?: GetChuyenNganhForSelectParams,
  options?: Omit<
    UseQueryOptions<ChuyenNganhResponseMin[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ChuyenNganhResponseMin[], APIError>({
    queryKey: DANH_MUC_QUERY_KEYS.chuyenNganhForSelectByNganh(
      nganhHocId,
      params
    ),
    queryFn: () => {
      if (!nganhHocId) return Promise.resolve([]); // Không fetch nếu không có nganhHocId
      return danhMucService.getChuyenNganhListForSelectByNganh(
        nganhHocId,
        params
      );
    },
    enabled: !!nganhHocId, // Chỉ fetch khi có nganhHocId
    staleTime: 30 * 60 * 1000, // Cache 30 phút
    ...options,
  });
};
