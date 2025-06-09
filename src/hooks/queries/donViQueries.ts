/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/danhMucQueries.ts (Tạo file mới)
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { APIError } from '@/services/apiHelper';
import {
  CreateDonViPayload,
  DonViDetail,
  DonViSelectOption,
  donViService,
  GetDonViParams,
  LoaiDonViOption,
  PaginatedDonViResponse,
  UpdateDonViPayload,
} from '@/services/donVi.service';
import { DonViResponseMin } from '@/services/event.service';
import { toast } from 'sonner';

export const DON_VI_QUERY_KEYS = {
  donVi: (params?: GetDonViParams) => ['donVi', params || {}] as const,
  all: ['donVi'] as const,
  lists: () => [...DON_VI_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetDonViParams) =>
    [...DON_VI_QUERY_KEYS.lists(), params] as const,
  details: () => [...DON_VI_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...DON_VI_QUERY_KEYS.details(), id] as const,
  loaiDonViOptions: ['loaiDonViOptions'] as const,
  donViChaOptions: (excludeId?: number) =>
    ['donViChaOptions', excludeId ?? 'all'] as const,
};

// Hook lấy danh sách Đơn vị
export const useDonViList = (
  params: GetDonViParams,
  options?: Omit<
    UseQueryOptions<PaginatedDonViResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedDonViResponse, APIError>({
    queryKey: DON_VI_QUERY_KEYS.list(params),
    queryFn: () => donViService.getDonViList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook tạo mới Đơn vị
export const useCreateDonVi = (
  options?: UseMutationOptions<DonViDetail, APIError, CreateDonViPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation<DonViDetail, APIError, CreateDonViPayload>({
    mutationFn: donViService.createDonVi,
    onSuccess: (data) => {
      toast.success(`Đã tạo đơn vị "${data.tenDonVi}" thành công.`);
      queryClient.invalidateQueries({ queryKey: DON_VI_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: DON_VI_QUERY_KEYS.donViChaOptions(),
      }); // Làm mới cả options cho đơn vị cha
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateDonViPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo đơn vị.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateDonViPayload, undefined);
    },
    ...options,
  });
};

// Hook cập nhật Đơn vị
export const useUpdateDonVi = (
  options?: UseMutationOptions<
    DonViDetail,
    APIError,
    { id: number | string; payload: UpdateDonViPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    DonViDetail,
    APIError,
    { id: number | string; payload: UpdateDonViPayload }
  >({
    mutationFn: ({ id, payload }) => donViService.updateDonVi(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật đơn vị "${data.tenDonVi}" thành công.`);
      queryClient.invalidateQueries({ queryKey: DON_VI_QUERY_KEYS.lists() });
      queryClient.setQueryData(DON_VI_QUERY_KEYS.detail(variables.id), data);
      queryClient.invalidateQueries({
        queryKey: DON_VI_QUERY_KEYS.donViChaOptions(),
      });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật đơn vị.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hook xóa Đơn vị
export const useDeleteDonVi = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: donViService.deleteDonVi,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa đơn vị ID: ${id}.`);
      queryClient.invalidateQueries({ queryKey: DON_VI_QUERY_KEYS.lists() });
      queryClient.removeQueries({ queryKey: DON_VI_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({
        queryKey: DON_VI_QUERY_KEYS.donViChaOptions(),
      });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa đơn vị. Có thể đơn vị đang được sử dụng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};

// Hook lấy danh sách Loại Đơn Vị cho Select
export const useLoaiDonViOptions = (
  options?: Omit<
    UseQueryOptions<LoaiDonViOption[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<LoaiDonViOption[], APIError>({
    queryKey: DON_VI_QUERY_KEYS.loaiDonViOptions,
    queryFn: donViService.getLoaiDonViOptions,
    staleTime: Infinity, // Danh mục này ít thay đổi
    ...options,
  });
};

// Hook lấy danh sách Đơn vị cha tiềm năng cho Select
export const useDonViChaOptions = (
  excludeDonViId?: number,
  options?: Omit<
    UseQueryOptions<DonViSelectOption[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<DonViSelectOption[], APIError>({
    queryKey: DON_VI_QUERY_KEYS.donViChaOptions(excludeDonViId),
    queryFn: () => donViService.getDonViChaOptions(excludeDonViId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
