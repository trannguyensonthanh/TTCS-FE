// src/hooks/queries/notificationQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import notificationService, {
  GetNotificationsParams,
  PaginatedNotificationsResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  ThongBaoResponse,
} from '@/services/notification.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'] as const,
  myNotifications: (params?: GetNotificationsParams) =>
    [...NOTIFICATION_QUERY_KEYS.all, 'my', params || {}] as const,
};

// Hook để lấy danh sách thông báo của tôi
export const useMyNotifications = (
  params?: GetNotificationsParams,
  options?: Omit<
    UseQueryOptions<PaginatedNotificationsResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedNotificationsResponse, APIError>({
    queryKey: NOTIFICATION_QUERY_KEYS.myNotifications(params),
    queryFn: () => notificationService.getMyNotifications(params),
    staleTime: 1 * 60 * 1000, // Cache trong 1 phút, hoặc refetch thường xuyên hơn
    refetchInterval: 5 * 60 * 1000, // Tự động refetch sau mỗi 5 phút
    ...options,
  });
};

// Hook để đánh dấu một thông báo đã đọc
export const useMarkNotificationAsRead = (
  options?: UseMutationOptions<MarkAsReadResponse, APIError, number>
) => {
  const queryClient = useQueryClient();
  return useMutation<MarkAsReadResponse, APIError, number>({
    mutationFn: notificationService.markNotificationAsRead,
    onSuccess: (data, thongBaoID) => {
      // Cập nhật cache cho danh sách thông báo
      queryClient.setQueryData<PaginatedNotificationsResponse | undefined>(
        NOTIFICATION_QUERY_KEYS.myNotifications(), // Key của query chính, không cần params chi tiết nếu chỉ cập nhật 1 item
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.thongBaoID === thongBaoID ? { ...item, daDocTB: true } : item
            ),
            totalUnread: Math.max(0, (oldData.totalUnread || 1) - 1), // Giảm số lượng chưa đọc
          };
        }
      );
      // Không cần toast ở đây, hành động này thường ngầm
      if (options?.onSuccess) {
        options.onSuccess(data, thongBaoID, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi đánh dấu đã đọc.'
      );
      if (options?.onError) {
        options.onError(error, 0, undefined);
      }
    },
    ...options,
  });
};

// Hook để đánh dấu tất cả thông báo đã đọc
export const useMarkAllNotificationsAsRead = (
  options?: UseMutationOptions<MarkAllAsReadResponse, APIError, void>
) => {
  const queryClient = useQueryClient();
  return useMutation<MarkAllAsReadResponse, APIError, void>({
    mutationFn: notificationService.markAllNotificationsAsRead,
    onSuccess: (data) => {
      toast.success(
        data.message ||
          `${data.countUpdated} thông báo đã được đánh dấu đã đọc.`
      );
      // Invalidate query để fetch lại toàn bộ danh sách
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.myNotifications(),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, undefined, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi đánh dấu tất cả đã đọc.'
      );
      if (options?.onError) {
        options.onError(error, undefined, undefined);
      }
    },
    ...options,
  });
};
