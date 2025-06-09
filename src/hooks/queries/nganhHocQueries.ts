/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/nganhHocQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import nganhHocService, {
  CreateNganhHocPayload,
  GetNganhHocParams,
  NganhHocDetailResponse,
  NganhHocResponse,
  PaginatedNganhHocResponse,
  UpdateNganhHocPayload,
} from '@/services/nganhHoc.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
import danhMucService, {
  GetNganhHocForSelectParams,
  NganhHocResponseMin,
} from '@/services/danhMuc.service';

export const NGANH_HOC_QUERY_KEYS = {
  all: ['nganhHoc'] as const,
  lists: () => [...NGANH_HOC_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetNganhHocParams) =>
    [...NGANH_HOC_QUERY_KEYS.lists(), params] as const,
  details: () => [...NGANH_HOC_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...NGANH_HOC_QUERY_KEYS.details(), id] as const,
  selectOptions: (params?: GetNganhHocForSelectParams) =>
    [...NGANH_HOC_QUERY_KEYS.all, 'selectOptions', params || {}] as const,
};

export const useNganhHocList = (
  params: GetNganhHocParams,
  options?: Omit<
    UseQueryOptions<PaginatedNganhHocResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedNganhHocResponse, APIError>({
    queryKey: NGANH_HOC_QUERY_KEYS.list(params),
    queryFn: () => nganhHocService.getNganhHocList(params),

    ...options,
  });
};

export const useNganhHocDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<NganhHocDetailResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<NganhHocDetailResponse, APIError>({
    queryKey: NGANH_HOC_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID Ngành học là bắt buộc'));
      return nganhHocService.getNganhHocDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateNganhHoc = (
  options?: UseMutationOptions<
    NganhHocResponse,
    APIError,
    CreateNganhHocPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<NganhHocResponse, APIError, CreateNganhHocPayload>({
    mutationFn: nganhHocService.createNganhHoc,
    onSuccess: (data) => {
      toast.success(`Đã tạo ngành học "${data.tenNganhHoc}" thành công.`);
      queryClient.invalidateQueries({ queryKey: NGANH_HOC_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: NGANH_HOC_QUERY_KEYS.selectOptions(),
      }); // Invalidate cả list cho select
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateNganhHocPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo ngành học.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateNganhHocPayload, undefined);
    },
    ...options,
  });
};

export const useUpdateNganhHoc = (
  options?: UseMutationOptions<
    NganhHocResponse,
    APIError,
    { id: number | string; payload: UpdateNganhHocPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    NganhHocResponse,
    APIError,
    { id: number | string; payload: UpdateNganhHocPayload }
  >({
    mutationFn: ({ id, payload }) =>
      nganhHocService.updateNganhHoc(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật ngành học "${data.tenNganhHoc}" thành công.`);
      queryClient.invalidateQueries({ queryKey: NGANH_HOC_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: NGANH_HOC_QUERY_KEYS.selectOptions(),
      });
      queryClient.setQueryData(NGANH_HOC_QUERY_KEYS.detail(variables.id), data); // Optimistic update cache chi tiết
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật ngành học.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

export const useDeleteNganhHoc = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: nganhHocService.deleteNganhHoc,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa ngành học ID: ${id}.`);
      queryClient.invalidateQueries({ queryKey: NGANH_HOC_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: NGANH_HOC_QUERY_KEYS.selectOptions(),
      });
      queryClient.removeQueries({ queryKey: NGANH_HOC_QUERY_KEYS.detail(id) });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi xóa ngành học.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};

// Hook lấy danh sách Ngành Học cho Select (đã có từ trước)
export const useNganhHocListForSelect = (
  params?: GetNganhHocForSelectParams,
  options?: Omit<
    UseQueryOptions<NganhHocResponseMin[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<NganhHocResponseMin[], APIError>({
    queryKey: NGANH_HOC_QUERY_KEYS.selectOptions(params),
    queryFn: () => danhMucService.getNganhHocListForSelect(params),
    staleTime: 60 * 60 * 1000,
    ...options,
  });
};
