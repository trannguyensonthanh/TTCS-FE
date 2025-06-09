import { DANH_MUC_QUERY_KEYS } from '@/hooks/queries/danhMucQueries';
import { APIError } from '@/services/apiHelper';
import {
  CreateTrangThietBiPayload,
  GetTrangThietBiParams,
  PaginatedTrangThietBiResponse,
  TrangThietBiFullResponse,
  UpdateTrangThietBiPayload,
} from '@/services/danhMuc.service';
import trangThietBiService from '@/services/trangThietBi.service';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const TRANG_THIET_BI_QUERY_KEYS = {
  trangThietBi: (params?: GetTrangThietBiParams) =>
    ['trangThietBi', params || {}] as const,
  trangThietBiDetail: (id: number | string | undefined) =>
    ['trangThietBiDetail', id] as const,
};

// Hook lấy danh sách Trang Thiết Bị (cho trang CRUD)
export const useTrangThietBiCrudList = (
  params: GetTrangThietBiParams,
  options?: Omit<
    UseQueryOptions<PaginatedTrangThietBiResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedTrangThietBiResponse, APIError>({
    queryKey: TRANG_THIET_BI_QUERY_KEYS.trangThietBi(params),
    queryFn: () => trangThietBiService.getTrangThietBiList(params),
    ...options,
  });
};

// Hook lấy chi tiết Trang Thiết Bị
export const useTrangThietBiDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<TrangThietBiFullResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<TrangThietBiFullResponse, APIError>({
    queryKey: TRANG_THIET_BI_QUERY_KEYS.trangThietBiDetail(id),
    queryFn: () => {
      if (!id)
        return Promise.reject(new Error('ID Trang thiết bị là bắt buộc'));
      return trangThietBiService.getTrangThietBiDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

// Hook tạo Trang Thiết Bị
export const useCreateTrangThietBi = (
  options?: UseMutationOptions<
    TrangThietBiFullResponse,
    APIError,
    CreateTrangThietBiPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    TrangThietBiFullResponse,
    APIError,
    CreateTrangThietBiPayload
  >({
    mutationFn: trangThietBiService.createTrangThietBi,
    onSuccess: (data) => {
      toast.success(`Đã tạo thiết bị "${data.tenThietBi}" thành công.`);
      queryClient.invalidateQueries({
        queryKey: TRANG_THIET_BI_QUERY_KEYS.trangThietBi(),
      });
      queryClient.invalidateQueries({
        queryKey: DANH_MUC_QUERY_KEYS.trangThietBiForSelect(),
      });
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateTrangThietBiPayload, undefined);
    },
    onError: () => {},
    ...options,
  });
};

// Hook cập nhật Trang Thiết Bị
export const useUpdateTrangThietBi = (
  options?: UseMutationOptions<
    TrangThietBiFullResponse,
    APIError,
    { id: number | string; payload: UpdateTrangThietBiPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    TrangThietBiFullResponse,
    APIError,
    { id: number | string; payload: UpdateTrangThietBiPayload }
  >({
    mutationFn: ({ id, payload }) =>
      trangThietBiService.updateTrangThietBi(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật thiết bị "${data.tenThietBi}" thành công.`);
      queryClient.invalidateQueries({
        queryKey: TRANG_THIET_BI_QUERY_KEYS.trangThietBi(),
      });
      queryClient.invalidateQueries({
        queryKey: DANH_MUC_QUERY_KEYS.trangThietBiForSelect(),
      });
      queryClient.invalidateQueries({
        queryKey: TRANG_THIET_BI_QUERY_KEYS.trangThietBiDetail(variables.id),
      });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {},
    ...options,
  });
};

// Hook xóa Trang Thiết Bị
export const useDeleteTrangThietBi = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: trangThietBiService.deleteTrangThietBi,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa thiết bị ID: ${id}.`);
      queryClient.invalidateQueries({
        queryKey: TRANG_THIET_BI_QUERY_KEYS.trangThietBi(),
      });
      queryClient.invalidateQueries({
        queryKey: DANH_MUC_QUERY_KEYS.trangThietBiForSelect(),
      });
      queryClient.removeQueries({
        queryKey: TRANG_THIET_BI_QUERY_KEYS.trangThietBiDetail(id),
      });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa thiết bị. Có thể thiết bị đang được gán cho phòng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};
