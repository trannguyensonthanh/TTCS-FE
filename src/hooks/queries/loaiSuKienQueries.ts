import { APIError } from '@/services/apiHelper';

import loaiSuKien, {
  GetLoaiSuKienParams,
  LoaiSuKienResponse,
  PaginatedLoaiSuKienResponse,
} from '@/services/loaiSuKien.service';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// --- Query Keys for LoaiSuKien ---
export const LOAI_SU_KIEN_QUERY_KEYS = {
  all: ['loaiSuKien'] as const,
  lists: () => [...LOAI_SU_KIEN_QUERY_KEYS.all, 'list'] as const,
  list: (params?: GetLoaiSuKienParams) =>
    [...LOAI_SU_KIEN_QUERY_KEYS.lists(), params || {}] as const,
};

// ... (các hook cũ: useManagedEventsList, usePublicEventsList, etc.) ...

// Hook để lấy danh sách Loại Sự Kiện
export const useLoaiSuKienList = (
  params?: GetLoaiSuKienParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedLoaiSuKienResponse,
      APIError,
      LoaiSuKienResponse[]
    >,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useQuery<PaginatedLoaiSuKienResponse, APIError, LoaiSuKienResponse[]>({
    // select trả về mảng items
    queryKey: LOAI_SU_KIEN_QUERY_KEYS.list(params),
    queryFn: () => loaiSuKien.getLoaiSuKienList(params),
    select: (data) => data.items.filter((item) => item.isActive), // Chỉ lấy các loại đang active để hiển thị trong bộ lọc
    staleTime: 60 * 60 * 1000, // Cache trong 1 giờ vì danh mục này ít thay đổi
    ...options,
  });
};
