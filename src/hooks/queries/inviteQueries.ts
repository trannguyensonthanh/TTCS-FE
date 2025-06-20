// src/hooks/queries/inviteQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import inviteService, {
  GuiLoiMoiResponse,
  MoiThamGiaPayloadItem,
  PaginatedNguoiDuocMoiResponse,
  GetDanhSachMoiParams,
  NguoiDuocMoiItem,
  GuiLoiMoiHangLoatPayload, // Import nếu cần cho optimistic update
} from '@/services/invite.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
import { EVENT_INVITABLE_QUERY_KEYS } from './eventQueries'; // Để invalidate số lượng đã mời

export const INVITE_QUERY_KEYS = {
  all: ['invitations'] as const,
  listByEvent: (suKienID: number | string) =>
    [...INVITE_QUERY_KEYS.all, 'byEvent', suKienID] as const,
  list: (suKienID: number | string, params: GetDanhSachMoiParams) =>
    [...INVITE_QUERY_KEYS.listByEvent(suKienID), params] as const,
};

// Hook mời cá nhân (nếu vẫn giữ API riêng)
export const useGuiLoiMoiCaNhan = (
  suKienID: number | string,
  options?: UseMutationOptions<
    GuiLoiMoiResponse,
    APIError,
    MoiThamGiaPayloadItem[]
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<GuiLoiMoiResponse, APIError, MoiThamGiaPayloadItem[]>({
    mutationFn: (payload) => inviteService.guiLoiMoiCaNhan(suKienID, payload),
    onSuccess: (data) => {
      // Xử lý tương tự như useGuiLoiMoiHangLoat hoặc tùy chỉnh
      const successCount =
        data.results?.filter((r) => r.status === 'success').length || 0;
      if (successCount > 0) {
        toast.success(`Đã gửi ${successCount} lời mời thành công.`);
      }
      // ... xử lý lỗi chi tiết ...
      queryClient.invalidateQueries({
        queryKey: INVITE_QUERY_KEYS.listByEvent(suKienID),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_INVITABLE_QUERY_KEYS.lists(),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, [], undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi gửi lời mời.'
      );
      if (options?.onError) {
        options.onError(error, [], undefined);
      }
    },
    ...options,
  });
};

// Hook mời hàng loạt (API mới)
export const useGuiLoiMoiHangLoat = (
  suKienID: number | string,
  options?: UseMutationOptions<
    GuiLoiMoiResponse,
    APIError,
    GuiLoiMoiHangLoatPayload // Thay đổi payload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<GuiLoiMoiResponse, APIError, GuiLoiMoiHangLoatPayload>({
    mutationFn: (payload) => inviteService.guiLoiMoiHangLoat(suKienID, payload),
    onSuccess: (data) => {
      if (data.jobId) {
        toast.info(
          `Yêu cầu mời hàng loạt đã được tiếp nhận (Job ID: ${data.jobId}). Hệ thống đang xử lý.`
        );
      } else {
        const successCount =
          data.soLuongMoiThanhCong ||
          data.results?.filter((r) => r.status === 'success').length ||
          0;
        const errorCount =
          data.soLuongMoiLoi ||
          data.results?.filter((r) => r.status === 'error').length ||
          0;

        if (successCount > 0) {
          toast.success(`Đã gửi ${successCount} lời mời thành công.`);
        }
        if (errorCount > 0) {
          toast.warning(
            `Có ${errorCount} lỗi khi gửi lời mời. Chi tiết: ${data.chiTietLoi
              ?.map((e) => e.lyDo)
              .join(', ')}`
          );
        }
        if (
          successCount === 0 &&
          errorCount === 0 &&
          data.tongSoNguoiDuKienMoi === 0
        ) {
          toast.info('Không có người dùng nào phù hợp với tiêu chí để mời.');
        }
      }
      queryClient.invalidateQueries({
        queryKey: INVITE_QUERY_KEYS.listByEvent(suKienID),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_INVITABLE_QUERY_KEYS.lists(),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, {} as GuiLoiMoiHangLoatPayload, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi thực hiện mời hàng loạt.'
      );
      if (options?.onError) {
        options.onError(error, {} as GuiLoiMoiHangLoatPayload, undefined);
      }
    },
    ...options,
  });
};

export const useDanhSachMoi = (
  suKienID: number | string | undefined,
  params: GetDanhSachMoiParams,
  options?: Omit<
    UseQueryOptions<PaginatedNguoiDuocMoiResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<PaginatedNguoiDuocMoiResponse, APIError>({
    queryKey: INVITE_QUERY_KEYS.list(suKienID!, params),
    queryFn: () => {
      if (!suKienID) return Promise.reject(new Error('Chưa chọn sự kiện'));
      return inviteService.getDanhSachMoi(suKienID!, params);
    },
    enabled: !!suKienID, // Chỉ fetch khi có suKienID
    ...options,
  });
};

export const useThuHoiLoiMoi = (
  suKienID: number | string, // Cần để invalidate danh sách mời của sự kiện đó
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: (moiThamGiaID) => inviteService.thuHoiLoiMoi(moiThamGiaID),
    onSuccess: (data) => {
      toast.success(data.message || 'Đã thu hồi lời mời.');
      queryClient.invalidateQueries({
        queryKey: INVITE_QUERY_KEYS.listByEvent(suKienID),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_INVITABLE_QUERY_KEYS.lists(),
      }); // Cập nhật soLuongDaMoi
      if (options?.onSuccess) {
        options.onSuccess(data, 0, undefined); // id không quan trọng ở đây
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi thu hồi lời mời.'
      );
      if (options?.onError) {
        options.onError(error, 0, undefined);
      }
    },
    ...options,
  });
};
