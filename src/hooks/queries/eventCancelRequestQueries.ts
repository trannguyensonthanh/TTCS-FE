/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/eventCancelRequestQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import eventCancelRequestService, {
  DuyetYcHuyPayload,
  GetYeuCauHuySKParams,
  PaginatedYeuCauHuySKResponse,
  TuChoiYcHuyPayload,
  YeuCauHuySKDetailResponse,
} from '@/services/eventCancelRequest.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
import { EVENT_QUERY_KEYS } from './eventQueries'; // Để invalidate sự kiện gốc

export const EVENT_CANCEL_REQUEST_QUERY_KEYS = {
  all: ['eventCancelRequests'] as const,
  lists: () => [...EVENT_CANCEL_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetYeuCauHuySKParams) =>
    [...EVENT_CANCEL_REQUEST_QUERY_KEYS.lists(), params] as const,
  details: () => [...EVENT_CANCEL_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...EVENT_CANCEL_REQUEST_QUERY_KEYS.details(), id] as const,
};

export const useEventCancelRequests = (
  params: GetYeuCauHuySKParams,
  options?: Omit<
    UseQueryOptions<PaginatedYeuCauHuySKResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedYeuCauHuySKResponse, APIError>({
    queryKey: EVENT_CANCEL_REQUEST_QUERY_KEYS.list(params),
    queryFn: () => eventCancelRequestService.getEventCancelRequests(params),
    ...options,
  });
};

export const useEventCancelRequestDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<YeuCauHuySKDetailResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  > & {
    enabled?: boolean;
    onSuccess?: (data: YeuCauHuySKDetailResponse) => void;
  }
) => {
  return useQuery<YeuCauHuySKDetailResponse, APIError>({
    queryKey: EVENT_CANCEL_REQUEST_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id) return Promise.reject(new Error('ID Yêu cầu hủy là bắt buộc'));
      return eventCancelRequestService.getEventCancelRequestDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

export const useApproveEventCancelRequest = (
  options?: UseMutationOptions<
    YeuCauHuySKDetailResponse,
    APIError,
    { id: number | string; payload: DuyetYcHuyPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    YeuCauHuySKDetailResponse,
    APIError,
    { id: number | string; payload: DuyetYcHuyPayload }
  >({
    mutationFn: ({ id, payload }) =>
      eventCancelRequestService.approveEventCancelRequest(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã duyệt yêu cầu hủy cho sự kiện: ${data.suKien.tenSK}.`);
      queryClient.invalidateQueries({
        queryKey: EVENT_CANCEL_REQUEST_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_CANCEL_REQUEST_QUERY_KEYS.detail(variables.id),
      });
      // Invalidate sự kiện gốc để cập nhật trạng thái
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
      });
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() }); // Cả danh sách sự kiện
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi duyệt yêu cầu hủy sự kiện.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
  });
};

export const useRejectEventCancelRequest = (
  options?: UseMutationOptions<
    YeuCauHuySKDetailResponse,
    APIError,
    { id: number | string; payload: TuChoiYcHuyPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    YeuCauHuySKDetailResponse,
    APIError,
    { id: number | string; payload: TuChoiYcHuyPayload }
  >({
    mutationFn: ({ id, payload }) =>
      eventCancelRequestService.rejectEventCancelRequest(id, payload),
    onSuccess: (data, variables) => {
      toast.info(`Đã từ chối yêu cầu hủy cho sự kiện: ${data.suKien.tenSK}.`);
      queryClient.invalidateQueries({
        queryKey: EVENT_CANCEL_REQUEST_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_CANCEL_REQUEST_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
      });
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi từ chối yêu cầu hủy sự kiện.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};
