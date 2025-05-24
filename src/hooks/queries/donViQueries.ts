// src/hooks/queries/danhMucQueries.ts (Tạo file mới)
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { APIError } from '@/services/apiHelper';
import {
  donViService,
  GetDonViParams,
  PaginatedDonViResponse,
} from '@/services/donVi.service';
import { DonViResponseMin } from '@/services/event.service';

export const DON_VI_QUERY_KEYS = {
  donVi: (params?: GetDonViParams) => ['donVi', params || {}] as const,
};

// Hook lấy danh sách Đơn vị
export const useDonViList = (
  params?: GetDonViParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedDonViResponse | DonViResponseMin[],
      APIError,
      DonViResponseMin[]
    >,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useQuery<
    PaginatedDonViResponse | DonViResponseMin[],
    APIError,
    DonViResponseMin[]
  >({
    queryKey: DON_VI_QUERY_KEYS.donVi(params),
    queryFn: () => donViService.getDonViList(params),
    select: (data) => (Array.isArray(data) ? data : data.items), // Trả về mảng items
    staleTime: 5 * 60 * 1000, // 5 phút
    ...options,
  });
};
