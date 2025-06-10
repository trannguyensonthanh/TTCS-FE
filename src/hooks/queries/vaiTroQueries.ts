/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/vaiTroQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import vaiTroService, {
  CreateVaiTroHeThongPayload,
  GetVaiTroHeThongParams,
  PaginatedVaiTroHeThongResponse,
  UpdateVaiTroHeThongPayload,
  VaiTroHeThongItem,
} from '@/services/vaiTro.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const VAI_TRO_QUERY_KEYS = {
  all: ['vaiTroHeThong'] as const,
  lists: () => [...VAI_TRO_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetVaiTroHeThongParams) =>
    [...VAI_TRO_QUERY_KEYS.lists(), params] as const,
  // details: () => [...VAI_TRO_QUERY_KEYS.all, 'detail'] as const, //   API chi tiết
  // detail: (id: number | string | undefined) => [...VAI_TRO_QUERY_KEYS.details(), id] as const,
};

export const useVaiTroList = (
  params: GetVaiTroHeThongParams,
  options?: Omit<
    UseQueryOptions<PaginatedVaiTroHeThongResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedVaiTroHeThongResponse, APIError>({
    queryKey: VAI_TRO_QUERY_KEYS.list(params),
    queryFn: () => vaiTroService.getVaiTroList(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateVaiTro = (
  options?: UseMutationOptions<
    VaiTroHeThongItem,
    APIError,
    CreateVaiTroHeThongPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<VaiTroHeThongItem, APIError, CreateVaiTroHeThongPayload>({
    mutationFn: vaiTroService.createVaiTro,
    onSuccess: (data) => {
      toast.success(`Đã tạo vai trò "${data.tenVaiTro}" thành công.`);
      queryClient.invalidateQueries({ queryKey: VAI_TRO_QUERY_KEYS.lists() });
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateVaiTroHeThongPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo vai trò.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateVaiTroHeThongPayload, undefined);
    },
    ...options,
  });
};

export const useUpdateVaiTro = (
  options?: UseMutationOptions<
    VaiTroHeThongItem,
    APIError,
    { id: number | string; payload: UpdateVaiTroHeThongPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    VaiTroHeThongItem,
    APIError,
    { id: number | string; payload: UpdateVaiTroHeThongPayload }
  >({
    mutationFn: ({ id, payload }) => vaiTroService.updateVaiTro(id, payload),
    onSuccess: (data) => {
      toast.success(`Đã cập nhật vai trò "${data.tenVaiTro}" thành công.`);
      queryClient.invalidateQueries({ queryKey: VAI_TRO_QUERY_KEYS.lists() });
      // queryClient.setQueryData(VAI_TRO_QUERY_KEYS.detail(variables.id), data); //   API chi tiết
      if (options?.onSuccess) options.onSuccess(data, {} as any, undefined); // Bỏ qua variables vì không có id trong payload
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật vai trò.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

export const useDeleteVaiTro = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: vaiTroService.deleteVaiTro,
    onSuccess: (data, id) => {
      toast.success(data.message || `Đã xóa vai trò ID: ${id}.`);
      queryClient.invalidateQueries({ queryKey: VAI_TRO_QUERY_KEYS.lists() });
      // queryClient.removeQueries({ queryKey: VAI_TRO_QUERY_KEYS.detail(id) }); //   API chi tiết
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xóa vai trò. Có thể vai trò đang được sử dụng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};
