// src/hooks/queries/danhMucQueries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { APIError } from '@/services/apiHelper';
import danhMucService, {
  GetLoaiPhongParams,
  GetPhongForSelectParams,
  PhongForSelectResponse,
} from '@/services/danhMuc.service';
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';

export const DANH_MUC_QUERY_KEYS = {
  // ... (keys cũ)
  loaiPhong: (params?: GetLoaiPhongParams) =>
    ['loaiPhong', params || {}] as const,
  phongForSelect: (params?: GetPhongForSelectParams) =>
    ['phongForSelect', params || {}] as const,
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
