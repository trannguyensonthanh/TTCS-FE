// src/hooks/queries/eventRatingQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import eventRatingService, {
  GetMyAttendedEventsParams,
  PaginatedSuKienDaThamGiaResponse,
  GuiDanhGiaPayload,
  DanhGiaSKResponse,
  CapNhatDanhGiaPayload,
  SuKienDaThamGiaItem, // Import để dùng trong optimistic update
} from '@/services/eventRating.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const EVENT_RATING_QUERY_KEYS = {
  all: ['myAttendedEventsAndRatings'] as const,
  lists: () => [...EVENT_RATING_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetMyAttendedEventsParams) =>
    [...EVENT_RATING_QUERY_KEYS.lists(), params] as const,
};

// Hook để lấy danh sách sự kiện đã tham gia và trạng thái đánh giá
export const useMyAttendedEventsList = (
  params: GetMyAttendedEventsParams,
  options?: Omit<
    UseQueryOptions<PaginatedSuKienDaThamGiaResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedSuKienDaThamGiaResponse, APIError>({
    queryKey: EVENT_RATING_QUERY_KEYS.list(params),
    queryFn: () => eventRatingService.getMyAttendedEvents(params),
    staleTime: 3 * 60 * 1000, // Cache 3 phút
    ...options,
  });
};

// Hook để gửi đánh giá sự kiện
export const useSubmitEventRating = (
  options?: UseMutationOptions<DanhGiaSKResponse, APIError, GuiDanhGiaPayload>
) => {
  const queryClient = useQueryClient();
  return useMutation<DanhGiaSKResponse, APIError, GuiDanhGiaPayload>({
    mutationFn: eventRatingService.submitEventRating,
    onSuccess: (data, variables) => {
      toast.success('Cảm ơn bạn đã gửi đánh giá sự kiện!');

      // Invalidate query danh sách sự kiện đã tham gia để cập nhật trạng thái đánh giá
      queryClient.invalidateQueries({
        queryKey: EVENT_RATING_QUERY_KEYS.lists(),
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi gửi đánh giá.'
      );
      if (options?.onError) {
        options.onError(error, {} as GuiDanhGiaPayload, undefined);
      }
    },
    ...options,
  });
};

// Hook để cập nhật đánh giá (nếu có)
export const useUpdateEventRating = (
  options?: UseMutationOptions<
    DanhGiaSKResponse,
    APIError,
    { danhGiaSkID: number | string; payload: CapNhatDanhGiaPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    DanhGiaSKResponse,
    APIError,
    { danhGiaSkID: number | string; payload: CapNhatDanhGiaPayload }
  >({
    mutationFn: ({ danhGiaSkID, payload }) =>
      eventRatingService.updateEventRating(danhGiaSkID, payload),
    onSuccess: (data, variables) => {
      toast.success('Đã cập nhật đánh giá của bạn.');
      queryClient.invalidateQueries({
        queryKey: EVENT_RATING_QUERY_KEYS.lists(),
      });
      // Cập nhật cache cho item cụ thể nếu cần
      queryClient.setQueryData<PaginatedSuKienDaThamGiaResponse | undefined>(
        EVENT_RATING_QUERY_KEYS.list({
          /* params của list hiện tại */
        }), // Cần params chính xác
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) => {
              if (
                item.danhGiaCuaToi &&
                item.danhGiaCuaToi.danhGiaSkID === variables.danhGiaSkID
              ) {
                return { ...item, danhGiaCuaToi: data };
              }
              return item;
            }),
          };
        }
      );
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật đánh giá.'
      );
      if (options?.onError) {
        options.onError(error, { danhGiaSkID: 0, payload: {} }, undefined);
      }
    },
    ...options,
  });
};

// Hook để xóa đánh giá (nếu có)
export const useDeleteEventRating = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: (danhGiaSkID) =>
      eventRatingService.deleteEventRating(danhGiaSkID),
    onSuccess: (data, danhGiaSkID) => {
      toast.success(data.message || 'Đã xóa đánh giá của bạn.');
      queryClient.invalidateQueries({
        queryKey: EVENT_RATING_QUERY_KEYS.lists(),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, danhGiaSkID, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi xóa đánh giá.'
      );
      if (options?.onError) {
        options.onError(error, 0, undefined);
      }
    },
    ...options,
  });
};
