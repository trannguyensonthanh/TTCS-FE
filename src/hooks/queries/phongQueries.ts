/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/phongQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import phongService, {
  CreatePhongPayload,
  GetPhongParams,
  PaginatedPhongResponse,
  PhongDetailResponse,
  UpdatePhongPayload,
} from '@/services/phong.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const PHONG_QUERY_KEYS = {
  all: ['phong'] as const,
  lists: () => [...PHONG_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetPhongParams) =>
    [...PHONG_QUERY_KEYS.lists(), params] as const,
  details: () => [...PHONG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...PHONG_QUERY_KEYS.details(), id] as const,
};

export const usePhongList = (
  params: GetPhongParams,
  options?: Omit<
    UseQueryOptions<PaginatedPhongResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedPhongResponse, APIError>({
    queryKey: PHONG_QUERY_KEYS.list(params),
    queryFn: () => phongService.getPhongList(params),
    ...options,
  });
};

export const usePhongDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<PhongDetailResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PhongDetailResponse, APIError>({
    queryKey: PHONG_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID Phòng là bắt buộc'));
      return phongService.getPhongDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreatePhong = (
  options?: UseMutationOptions<
    PhongDetailResponse,
    APIError,
    CreatePhongPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<PhongDetailResponse, APIError, CreatePhongPayload>({
    mutationFn: phongService.createPhong,
    onSuccess: (data) => {
      toast.success(`Đã tạo phòng "${data.tenPhong}" thành công.`);
      queryClient.invalidateQueries({ queryKey: PHONG_QUERY_KEYS.lists() });
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreatePhongPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(error.body?.message || error.message || 'Lỗi khi tạo phòng.');
      if (options?.onError)
        options.onError(error, {} as CreatePhongPayload, undefined);
    },
    ...options,
  });
};

export const useUpdatePhong = (
  options?: UseMutationOptions<
    PhongDetailResponse,
    APIError,
    { id: number | string; payload: UpdatePhongPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    PhongDetailResponse,
    APIError,
    { id: number | string; payload: UpdatePhongPayload }
  >({
    mutationFn: ({ id, payload }) => phongService.updatePhong(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật phòng "${data.tenPhong}" thành công.`);
      queryClient.invalidateQueries({ queryKey: PHONG_QUERY_KEYS.lists() });
      queryClient.setQueryData(PHONG_QUERY_KEYS.detail(variables.id), data); // Cập nhật cache chi tiết
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật phòng.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

export const useDeletePhong = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: phongService.deletePhong,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa phòng ID: ${id}.`);
      queryClient.invalidateQueries({ queryKey: PHONG_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: PHONG_QUERY_KEYS.detail(id) });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa phòng. Có thể phòng đang được đặt hoặc có lịch sử sử dụng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};
