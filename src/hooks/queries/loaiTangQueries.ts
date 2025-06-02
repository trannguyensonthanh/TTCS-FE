/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/loaiTangQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import loaiTangService, {
  GetLoaiTangParams,
  PaginatedLoaiTangResponse,
  LoaiTangResponse,
  CreateLoaiTangPayload,
  UpdateLoaiTangPayload,
} from '@/services/loaiTang.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const LOAI_TANG_QUERY_KEYS = {
  all: ['loaiTang'] as const,
  lists: () => [...LOAI_TANG_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetLoaiTangParams) =>
    [...LOAI_TANG_QUERY_KEYS.lists(), params] as const,
  details: () => [...LOAI_TANG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...LOAI_TANG_QUERY_KEYS.details(), id] as const,
};

export const useLoaiTangList = (
  params: GetLoaiTangParams,
  options?: Omit<
    UseQueryOptions<PaginatedLoaiTangResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedLoaiTangResponse, APIError>({
    queryKey: LOAI_TANG_QUERY_KEYS.list(params),
    queryFn: () => loaiTangService.getLoaiTangList(params),
    ...options,
  });
};

// Hook lấy chi tiết (có thể không cần thiết nếu modal sửa dùng data từ list)
export const useLoaiTangDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<LoaiTangResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<LoaiTangResponse, APIError>({
    queryKey: LOAI_TANG_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID Loại tầng là bắt buộc'));
      return loaiTangService.getLoaiTangDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateLoaiTang = (
  options?: UseMutationOptions<
    LoaiTangResponse,
    APIError,
    CreateLoaiTangPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<LoaiTangResponse, APIError, CreateLoaiTangPayload>({
    mutationFn: loaiTangService.createLoaiTang,
    onSuccess: (data) => {
      toast.success(`Đã tạo loại tầng "${data.tenLoaiTang}" thành công.`);
      queryClient.invalidateQueries({ queryKey: LOAI_TANG_QUERY_KEYS.lists() });
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateLoaiTangPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo loại tầng.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateLoaiTangPayload, undefined);
    },
    ...options,
  });
};

export const useUpdateLoaiTang = (
  options?: UseMutationOptions<
    LoaiTangResponse,
    APIError,
    { id: number | string; payload: UpdateLoaiTangPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    LoaiTangResponse,
    APIError,
    { id: number | string; payload: UpdateLoaiTangPayload }
  >({
    mutationFn: ({ id, payload }) =>
      loaiTangService.updateLoaiTang(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật loại tầng "${data.tenLoaiTang}" thành công.`);
      queryClient.invalidateQueries({ queryKey: LOAI_TANG_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: LOAI_TANG_QUERY_KEYS.detail(variables.id),
      });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật loại tầng.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

export const useDeleteLoaiTang = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: loaiTangService.deleteLoaiTang,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa loại tầng ID: ${id}.`);
      queryClient.invalidateQueries({ queryKey: LOAI_TANG_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: LOAI_TANG_QUERY_KEYS.detail(id) });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa loại tầng. Có thể loại tầng đang được sử dụng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};
