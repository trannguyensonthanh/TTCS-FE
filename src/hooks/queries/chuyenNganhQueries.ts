// src/hooks/queries/chuyenNganhQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import chuyenNganhService, {
  ChuyenNganhResponse,
  CreateChuyenNganhPayload,
  GetChuyenNganhParams,
  PaginatedChuyenNganhResponse,
  UpdateChuyenNganhPayload,
} from '@/services/chuyenNganh.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
import { NGANH_HOC_QUERY_KEYS } from './nganhHocQueries'; // Để invalidate chi tiết ngành cha
import danhMucService, {
  ChuyenNganhResponseMin,
  GetChuyenNganhForSelectParams,
} from '@/services/danhMuc.service';

export const CHUYEN_NGANH_QUERY_KEYS = {
  all: ['chuyenNganh'] as const,
  listsByNganh: (nganhHocId: number) =>
    [...CHUYEN_NGANH_QUERY_KEYS.all, 'listByNganh', nganhHocId] as const,
  listByNganh: (nganhHocId: number, params: GetChuyenNganhParams) =>
    [...CHUYEN_NGANH_QUERY_KEYS.listsByNganh(nganhHocId), params] as const,
  details: () => [...CHUYEN_NGANH_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...CHUYEN_NGANH_QUERY_KEYS.details(), id] as const,
  selectOptionsByNganh: (
    nganhHocId?: number,
    params?: GetChuyenNganhForSelectParams
  ) =>
    [
      ...CHUYEN_NGANH_QUERY_KEYS.all,
      'selectOptionsByNganh',
      nganhHocId,
      params || {},
    ] as const,
};

// Hook lấy danh sách chuyên ngành theo ngành (cho CRUD, không phải select)
export const useChuyenNganhListByNganhCrud = (
  nganhHocId: number | undefined,
  params: GetChuyenNganhParams,
  options?: Omit<
    UseQueryOptions<PaginatedChuyenNganhResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<PaginatedChuyenNganhResponse, APIError>({
    queryKey: CHUYEN_NGANH_QUERY_KEYS.listByNganh(nganhHocId!, params),
    queryFn: () => {
      if (!nganhHocId)
        return Promise.reject(new Error('ID Ngành học là bắt buộc'));
      return chuyenNganhService.getChuyenNganhListByNganh(nganhHocId, params);
    },
    enabled: !!nganhHocId,
    ...options,
  });
};

export const useChuyenNganhDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<ChuyenNganhResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<ChuyenNganhResponse, APIError>({
    queryKey: CHUYEN_NGANH_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID Chuyên ngành là bắt buộc'));
      return chuyenNganhService.getChuyenNganhDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateChuyenNganh = (
  nganhHocId: number, // ID của ngành cha
  options?: UseMutationOptions<
    ChuyenNganhResponse,
    APIError,
    CreateChuyenNganhPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<ChuyenNganhResponse, APIError, CreateChuyenNganhPayload>({
    mutationFn: (payload) =>
      chuyenNganhService.createChuyenNganhForNganh(nganhHocId, payload),
    onSuccess: (data) => {
      toast.success(
        `Đã thêm chuyên ngành "${data.tenChuyenNganh}" thành công.`
      );
      queryClient.invalidateQueries({
        queryKey: NGANH_HOC_QUERY_KEYS.detail(nganhHocId),
      }); // Invalidate chi tiết ngành cha để load lại ds chuyên ngành
      queryClient.invalidateQueries({
        queryKey: CHUYEN_NGANH_QUERY_KEYS.listsByNganh(nganhHocId),
      });
      queryClient.invalidateQueries({
        queryKey: CHUYEN_NGANH_QUERY_KEYS.selectOptionsByNganh(nganhHocId),
      });
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateChuyenNganhPayload, undefined);
    },
    onError: (error: APIError) => {},
    ...options,
  });
};

export const useUpdateChuyenNganh = (
  nganhHocId: number, // ID của ngành cha để invalidate
  options?: UseMutationOptions<
    ChuyenNganhResponse,
    APIError,
    { id: number | string; payload: UpdateChuyenNganhPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    ChuyenNganhResponse,
    APIError,
    { id: number | string; payload: UpdateChuyenNganhPayload }
  >({
    mutationFn: ({ id, payload }) =>
      chuyenNganhService.updateChuyenNganh(id, payload),
    onSuccess: (data, variables) => {
      toast.success(
        `Đã cập nhật chuyên ngành "${data.tenChuyenNganh}" thành công.`
      );
      queryClient.invalidateQueries({
        queryKey: NGANH_HOC_QUERY_KEYS.detail(nganhHocId),
      });
      queryClient.invalidateQueries({
        queryKey: CHUYEN_NGANH_QUERY_KEYS.listsByNganh(nganhHocId),
      });
      queryClient.invalidateQueries({
        queryKey: CHUYEN_NGANH_QUERY_KEYS.selectOptionsByNganh(nganhHocId),
      });
      queryClient.setQueryData(
        CHUYEN_NGANH_QUERY_KEYS.detail(variables.id),
        data
      );
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {},
    ...options,
  });
};

export const useDeleteChuyenNganh = (
  nganhHocId: number, // ID của ngành cha để invalidate
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: chuyenNganhService.deleteChuyenNganh,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa chuyên ngành ID: ${id}.`);
      queryClient.invalidateQueries({
        queryKey: NGANH_HOC_QUERY_KEYS.detail(nganhHocId),
      });
      queryClient.invalidateQueries({
        queryKey: CHUYEN_NGANH_QUERY_KEYS.listsByNganh(nganhHocId),
      });
      queryClient.invalidateQueries({
        queryKey: CHUYEN_NGANH_QUERY_KEYS.selectOptionsByNganh(nganhHocId),
      });
      queryClient.removeQueries({
        queryKey: CHUYEN_NGANH_QUERY_KEYS.detail(id),
      });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {},
    ...options,
  });
};

// Hook lấy danh sách Chuyên Ngành cho Select theo Ngành Học ID (đã có từ trước)
export const useChuyenNganhListForSelectByNganh = (
  nganhHocId: number | undefined,
  params?: GetChuyenNganhForSelectParams,
  options?: Omit<
    UseQueryOptions<ChuyenNganhResponseMin[], APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<ChuyenNganhResponseMin[], APIError>({
    queryKey: CHUYEN_NGANH_QUERY_KEYS.selectOptionsByNganh(nganhHocId, params),
    queryFn: () => {
      if (!nganhHocId) return Promise.resolve([]);
      return danhMucService.getChuyenNganhListForSelectByNganh(
        nganhHocId,
        params
      );
    },
    enabled: !!nganhHocId,
    staleTime: 30 * 60 * 1000,
    ...options,
  });
};
