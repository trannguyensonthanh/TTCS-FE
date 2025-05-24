import { APIError } from '@/services/apiHelper';
import { NguoiDungResponseMin } from '@/services/event.service';
import {
  GetNguoiDungParams,
  nguoiDungService,
  PaginatedNguoiDungResponse,
} from '@/services/nguoiDung.service';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const NGUOI_DUNG_QUERY_KEYS = {
  nguoiDung: (params?: GetNguoiDungParams) =>
    ['nguoiDung', params || {}] as const,
};
// Hook lấy danh sách Người dùng (cho autocomplete/select)
export const useNguoiDungListForSelect = (
  params?: GetNguoiDungParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedNguoiDungResponse | NguoiDungResponseMin[],
      APIError,
      NguoiDungResponseMin[]
    >,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useQuery<
    PaginatedNguoiDungResponse | NguoiDungResponseMin[],
    APIError,
    NguoiDungResponseMin[]
  >({
    queryKey: NGUOI_DUNG_QUERY_KEYS.nguoiDung(params),
    queryFn: () => nguoiDungService.getNguoiDungList({ limit: 50, ...params }), // Mặc định limit cho select
    select: (data) => (Array.isArray(data) ? data : data.items),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
