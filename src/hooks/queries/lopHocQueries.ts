// src/hooks/queries/lopHocQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import lopHocService, {
  CreateLopHocPayload,
  GetLopHocParams,
  LopHocListItemResponse,
  PaginatedLopHocResponse,
  UpdateLopHocPayload,
} from '@/services/lopHoc.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const LOP_HOC_QUERY_KEYS = {
  all: ['lopHoc'] as const, // Tất cả các keys liên quan đến Lớp học
  lists: () => [...LOP_HOC_QUERY_KEYS.all, 'list'] as const, // Danh sách Lớp học
  list: (params: GetLopHocParams) =>
    [...LOP_HOC_QUERY_KEYS.lists(), params] as const, // Danh sách Lớp học với params
  details: () => [...LOP_HOC_QUERY_KEYS.all, 'detail'] as const, // Chi tiết Lớp học
  detail: (id: number | string | undefined) =>
    [...LOP_HOC_QUERY_KEYS.details(), id] as const, // Chi tiết Lớp học với ID
};

// Hooks để lấy danh sách và chi tiết Lớp học
export const useLopHocList = (
  params: GetLopHocParams,
  options?: Omit<
    UseQueryOptions<PaginatedLopHocResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedLopHocResponse, APIError>({
    queryKey: LOP_HOC_QUERY_KEYS.list(params),
    queryFn: () => lopHocService.getLopHocList(params),
    ...options,
  });
};

// Hook để lấy chi tiết Lớp học theo ID
export const useLopHocDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<LopHocListItemResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<LopHocListItemResponse, APIError>({
    queryKey: LOP_HOC_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID Lớp học là bắt buộc'));
      return lopHocService.getLopHocDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

// Hook để tạo Lớp học mới
export const useCreateLopHoc = (
  options?: UseMutationOptions<
    LopHocListItemResponse,
    APIError,
    CreateLopHocPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<LopHocListItemResponse, APIError, CreateLopHocPayload>({
    mutationFn: lopHocService.createLopHoc,
    onSuccess: (data, variables) => {
      toast.success(`Đã tạo lớp học "${data.tenLop}" thành công.`);
      queryClient.invalidateQueries({ queryKey: LOP_HOC_QUERY_KEYS.lists() });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError, variables) => {
      console.error('Create LopHoc error:', error, variables);
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo lớp học.'
      );
      if (options?.onError) {
        options.onError(error, variables, undefined);
      }
    },
    ...options,
  });
};

// Hook để cập nhật thông tin Lớp học
export const useUpdateLopHoc = (
  options?: UseMutationOptions<
    LopHocListItemResponse,
    APIError,
    { id: number | string; payload: UpdateLopHocPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    LopHocListItemResponse,
    APIError,
    { id: number | string; payload: UpdateLopHocPayload }
  >({
    mutationFn: ({ id, payload }) => lopHocService.updateLopHoc(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật lớp học "${data.tenLop}" thành công.`);
      queryClient.invalidateQueries({ queryKey: LOP_HOC_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: LOP_HOC_QUERY_KEYS.detail(variables.id),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError, variables) => {
      console.error('Update LopHoc error:', error, variables);
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật lớp học.'
      );
      if (options?.onError) {
        options.onError(error, variables, undefined);
      }
    },
    ...options,
  });
};

// Hook để xóa Lớp học
export const useDeleteLopHoc = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: lopHocService.deleteLopHoc,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa lớp học ID: ${id}.`);
      queryClient.invalidateQueries({ queryKey: LOP_HOC_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: LOP_HOC_QUERY_KEYS.detail(id) });
      if (options?.onSuccess) {
        options.onSuccess(data, id, undefined);
      }
    },
    onError: (error: APIError, id) => {
      console.error('Delete LopHoc error:', error, id);
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa lớp học. Có thể lớp đang có sinh viên.'
      );
      if (options?.onError) {
        options.onError(error, id, undefined);
      }
    },
    ...options,
  });
};
