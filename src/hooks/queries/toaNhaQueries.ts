/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/toaNhaQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import toaNhaService, {
  CreateToaNhaPayload,
  GetToaNhaParams,
  PaginatedToaNhaResponse,
  ToaNhaResponse,
  UpdateToaNhaPayload,
} from '@/services/toaNha.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const TOA_NHA_QUERY_KEYS = {
  all: ['toaNha'] as const,
  lists: () => [...TOA_NHA_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetToaNhaParams) =>
    [...TOA_NHA_QUERY_KEYS.lists(), params] as const,
  details: () => [...TOA_NHA_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...TOA_NHA_QUERY_KEYS.details(), id] as const,
};

export const useToaNhaList = (
  params: GetToaNhaParams,
  options?: Omit<
    UseQueryOptions<PaginatedToaNhaResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedToaNhaResponse, APIError>({
    queryKey: TOA_NHA_QUERY_KEYS.list(params),
    queryFn: () => toaNhaService.getToaNhaList(params),
    ...options,
  });
};

export const useToaNhaDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<ToaNhaResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<ToaNhaResponse, APIError>({
    queryKey: TOA_NHA_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID Tòa nhà là bắt buộc'));
      return toaNhaService.getToaNhaDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateToaNha = (
  options?: UseMutationOptions<ToaNhaResponse, APIError, CreateToaNhaPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation<ToaNhaResponse, APIError, CreateToaNhaPayload>({
    mutationFn: toaNhaService.createToaNha,
    onSuccess: (data, variables) => {
      toast.success(`Đã tạo tòa nhà "${data.tenToaNha}" thành công.`);
      queryClient.invalidateQueries({ queryKey: TOA_NHA_QUERY_KEYS.lists() });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo tòa nhà.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateToaNhaPayload, undefined);
    },
    ...options,
  });
};

export const useUpdateToaNha = (
  options?: UseMutationOptions<
    ToaNhaResponse,
    APIError,
    { id: number | string; payload: UpdateToaNhaPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    ToaNhaResponse,
    APIError,
    { id: number | string; payload: UpdateToaNhaPayload }
  >({
    mutationFn: ({ id, payload }) => toaNhaService.updateToaNha(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật tòa nhà "${data.tenToaNha}" thành công.`);
      queryClient.invalidateQueries({ queryKey: TOA_NHA_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: TOA_NHA_QUERY_KEYS.detail(variables.id),
      });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật tòa nhà.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

export const useDeleteToaNha = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: toaNhaService.deleteToaNha,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa tòa nhà ID: ${id}.`);
      queryClient.invalidateQueries({ queryKey: TOA_NHA_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: TOA_NHA_QUERY_KEYS.detail(id) }); // Xóa cache chi tiết
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa tòa nhà. Có thể tòa nhà đang được sử dụng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};
