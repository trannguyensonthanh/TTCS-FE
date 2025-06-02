/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/toaNhaTangQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import toaNhaTangService, {
  GetToaNhaTangParams,
  PaginatedToaNhaTangResponse,
  ToaNhaTangResponse,
  CreateToaNhaTangPayload,
  UpdateToaNhaTangPayload,
} from '@/services/toaNhaTang.service';

import { useLoaiTangList } from './loaiTangQueries'; // Hook lấy danh sách Loại Tầng
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const TOA_NHA_TANG_QUERY_KEYS = {
  all: (toaNhaId: number | string) => ['toaNhaTang', toaNhaId] as const,
  lists: (toaNhaId: number | string) =>
    [...TOA_NHA_TANG_QUERY_KEYS.all(toaNhaId), 'list'] as const,
  list: (toaNhaId: number | string, params: GetToaNhaTangParams) =>
    [...TOA_NHA_TANG_QUERY_KEYS.lists(toaNhaId), params] as const,
  details: (toaNhaId: number | string) =>
    [...TOA_NHA_TANG_QUERY_KEYS.all(toaNhaId), 'detail'] as const,
  detail: (
    toaNhaId: number | string,
    toaNhaTangId: number | string | undefined
  ) => [...TOA_NHA_TANG_QUERY_KEYS.details(toaNhaId), toaNhaTangId] as const,
};

export const useToaNhaTangList = (
  toaNhaId: number | string | undefined, // Cho phép undefined để disable query
  params: GetToaNhaTangParams,
  options?: Omit<
    UseQueryOptions<PaginatedToaNhaTangResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedToaNhaTangResponse, APIError>({
    queryKey: TOA_NHA_TANG_QUERY_KEYS.list(toaNhaId!, params), // Dùng ! vì enabled sẽ kiểm tra
    queryFn: () => toaNhaTangService.getToaNhaTangList(toaNhaId!, params),
    enabled: !!toaNhaId, // Chỉ fetch khi có toaNhaId
    ...options,
  });
};

// Hook lấy chi tiết (ít dùng hơn nếu modal sửa dùng data từ list)
export const useToaNhaTangDetail = (
  toaNhaId: number | string | undefined,
  toaNhaTangId: number | string | undefined,
  options?: Omit<
    UseQueryOptions<ToaNhaTangResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<ToaNhaTangResponse, APIError>({
    queryKey: TOA_NHA_TANG_QUERY_KEYS.detail(toaNhaId!, toaNhaTangId),
    queryFn: () => {
      if (!toaNhaTangId)
        return Promise.reject(new Error('ID Tầng vật lý là bắt buộc'));
      return toaNhaTangService.getToaNhaTangDetail(toaNhaTangId);
    },
    enabled: !!toaNhaId && !!toaNhaTangId,
    ...options,
  });
};

export const useCreateToaNhaTang = (
  toaNhaId: number | string,
  options?: UseMutationOptions<
    ToaNhaTangResponse,
    APIError,
    CreateToaNhaTangPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<ToaNhaTangResponse, APIError, CreateToaNhaTangPayload>({
    mutationFn: (payload) =>
      toaNhaTangService.createToaNhaTang(toaNhaId, payload),
    onSuccess: (data) => {
      toast.success(
        `Đã thêm tầng "${data.loaiTang.tenLoaiTang}" vào tòa nhà thành công.`
      );
      queryClient.invalidateQueries({
        queryKey: TOA_NHA_TANG_QUERY_KEYS.lists(toaNhaId),
      });
      // Có thể invalidate query chi tiết tòa nhà nếu nó có số lượng tầng
      // queryClient.invalidateQueries({ queryKey: TOA_NHA_QUERY_KEYS.detail(toaNhaId) });
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateToaNhaTangPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(error.body?.message || error.message || 'Lỗi khi thêm tầng.');
      if (options?.onError)
        options.onError(error, {} as CreateToaNhaTangPayload, undefined);
    },
    ...options,
  });
};

export const useUpdateToaNhaTang = (
  toaNhaId: number | string, // Cần để invalidate query list
  options?: UseMutationOptions<
    ToaNhaTangResponse,
    APIError,
    { toaNhaTangId: number | string; payload: UpdateToaNhaTangPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    ToaNhaTangResponse,
    APIError,
    { toaNhaTangId: number | string; payload: UpdateToaNhaTangPayload }
  >({
    mutationFn: ({ toaNhaTangId, payload }) =>
      toaNhaTangService.updateToaNhaTang(toaNhaTangId, payload),
    onSuccess: (data, variables) => {
      toast.success(
        `Đã cập nhật thông tin tầng "${data.loaiTang.tenLoaiTang}" thành công.`
      );
      queryClient.invalidateQueries({
        queryKey: TOA_NHA_TANG_QUERY_KEYS.lists(toaNhaId),
      });
      queryClient.invalidateQueries({
        queryKey: TOA_NHA_TANG_QUERY_KEYS.detail(
          toaNhaId,
          variables.toaNhaTangId
        ),
      });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật tầng.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

export const useDeleteToaNhaTang = (
  toaNhaId: number | string,
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: toaNhaTangService.deleteToaNhaTang,
    onSuccess: (data, toaNhaTangId) => {
      toast.success(data.message || `Đã xóa tầng ID: ${toaNhaTangId}.`);
      queryClient.invalidateQueries({
        queryKey: TOA_NHA_TANG_QUERY_KEYS.lists(toaNhaId),
      });
      queryClient.removeQueries({
        queryKey: TOA_NHA_TANG_QUERY_KEYS.detail(toaNhaId, toaNhaTangId),
      });
      // Có thể invalidate query chi tiết tòa nhà nếu nó có số lượng tầng
      // queryClient.invalidateQueries({ queryKey: TOA_NHA_QUERY_KEYS.detail(toaNhaId) });
      if (options?.onSuccess) options.onSuccess(data, toaNhaTangId, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa tầng. Có thể tầng đang được sử dụng bởi các phòng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};
