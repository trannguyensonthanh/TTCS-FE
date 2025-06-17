// src/hooks/queries/lichDatPhongQueries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import lichDatPhongService, {
  GetLichDatPhongParams,
  GetLichDatPhongTheoPhongParams,
  LichDatPhongItemResponse,
  PaginatedLichDatPhongResponse,
} from '@/services/lichDatPhong.service';

import { APIError } from '@/services/apiHelper';

export const LICH_DAT_PHONG_QUERY_KEYS = {
  all: ['lichDatPhong'] as const,
  list: (params: GetLichDatPhongParams) =>
    [...LICH_DAT_PHONG_QUERY_KEYS.all, params] as const,
  byPhong: (phongId: number | string | undefined) =>
    [...LICH_DAT_PHONG_QUERY_KEYS.all, 'byPhong', phongId] as const,
  listByPhong: (
    phongId: number | string | undefined,
    params: GetLichDatPhongTheoPhongParams
  ) => [...LICH_DAT_PHONG_QUERY_KEYS.byPhong(phongId), params] as const,
};

export const useLichDatPhong = (
  params: GetLichDatPhongParams,
  options?: Omit<
    UseQueryOptions<LichDatPhongItemResponse[], APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<LichDatPhongItemResponse[], APIError>({
    queryKey: LICH_DAT_PHONG_QUERY_KEYS.list(params),
    queryFn: () => lichDatPhongService.getLichDatPhong(params),
    enabled: !!params.tuNgay && !!params.denNgay, // Chỉ fetch khi có khoảng thời gian
    staleTime: 5 * 60 * 1000, // Cache 5 phút, lịch có thể thay đổi
    ...options,
  });
};

export const useLichDatPhongTheoPhong = (
  phongId: number | string | undefined,
  params: GetLichDatPhongTheoPhongParams,
  options?: Omit<
    UseQueryOptions<PaginatedLichDatPhongResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedLichDatPhongResponse, APIError>({
    queryKey: LICH_DAT_PHONG_QUERY_KEYS.listByPhong(phongId, params),
    queryFn: () => {
      if (!phongId) return Promise.reject(new Error('ID Phòng là bắt buộc'));
      return lichDatPhongService.getLichDatPhongTheoPhong(phongId, params);
    },
    enabled: !!phongId,
    ...options,
  });
};
