/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/roomChangeRequestQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import roomChangeRequestService, {
  ChiTietDatPhongForSelect,
  CreateYeuCauDoiPhongPayload,
  GetYeuCauDoiPhongParams,
  PaginatedYeuCauDoiPhongResponse,
  XuLyYeuCauDoiPhongPayload,
  YeuCauDoiPhongDetailResponse,
} from '@/services/roomChangeRequest.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
// Import query keys của YeuCauMuonPhong để invalidate nếu cần
import { ROOM_REQUEST_QUERY_KEYS } from './roomRequestQueries';

export const ROOM_CHANGE_REQUEST_QUERY_KEYS = {
  all: ['roomChangeRequests'] as const,
  lists: () => [...ROOM_CHANGE_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetYeuCauDoiPhongParams) =>
    [...ROOM_CHANGE_REQUEST_QUERY_KEYS.lists(), params] as const,
  details: () => [...ROOM_CHANGE_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...ROOM_CHANGE_REQUEST_QUERY_KEYS.details(), id] as const,
};

// Lấy danh sách Yêu cầu đổi phòng
export const useRoomChangeRequests = (
  params: GetYeuCauDoiPhongParams,
  options?: Omit<
    UseQueryOptions<PaginatedYeuCauDoiPhongResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedYeuCauDoiPhongResponse, APIError>({
    queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.list(params),
    queryFn: () => roomChangeRequestService.getRoomChangeRequests(params),

    ...options,
  });
};

// Lấy chi tiết Yêu cầu đổi phòng
export const useRoomChangeRequestDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<YeuCauDoiPhongDetailResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<YeuCauDoiPhongDetailResponse, APIError>({
    queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id)
        return Promise.reject(new Error('ID Yêu cầu đổi phòng là bắt buộc'));
      return roomChangeRequestService.getRoomChangeRequestDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

// Tạo Yêu cầu đổi phòng mới
export const useCreateRoomChangeRequest = (
  options?: UseMutationOptions<
    YeuCauDoiPhongDetailResponse,
    APIError,
    CreateYeuCauDoiPhongPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    YeuCauDoiPhongDetailResponse,
    APIError,
    CreateYeuCauDoiPhongPayload
  >({
    mutationFn: roomChangeRequestService.createRoomChangeRequest,
    onSuccess: (data, variables) => {
      toast.success('Đã gửi yêu cầu đổi phòng thành công.');
      queryClient.invalidateQueries({
        queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.lists(),
      });
      // Invalidate chi tiết YeuCauMuonPhong gốc nếu cần
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.detail(variables.ycMuonPhongCtID),
      }); // Giả sử ycMuonPhongCtID là ID của YeuCauMuonPhong header
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo yêu cầu đổi phòng.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateYeuCauDoiPhongPayload, undefined);
    },
    ...options,
  });
};

// CSVC Xử lý yêu cầu đổi phòng
export const useProcessRoomChangeRequest = (
  options?: UseMutationOptions<
    YeuCauDoiPhongDetailResponse,
    APIError,
    { id: number | string; payload: XuLyYeuCauDoiPhongPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    YeuCauDoiPhongDetailResponse,
    APIError,
    { id: number | string; payload: XuLyYeuCauDoiPhongPayload }
  >({
    mutationFn: ({ id, payload }) =>
      roomChangeRequestService.processRoomChangeRequest(id, payload),
    onSuccess: (data, variables) => {
      toast.success(
        `Đã ${
          variables.payload.hanhDong === 'DUYET' ? 'duyệt' : 'từ chối'
        } yêu cầu đổi phòng.`
      );
      queryClient.invalidateQueries({
        queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(variables.id),
      });
      // Invalidate cả chi tiết YeuCauMuonPhong gốc vì phòng đã thay đổi
      if (data.ycMuonPhongCtID) {
        // ycMuonPhongCtID trỏ về chi tiết yêu cầu phòng gốc
        const detailRequest =
          queryClient.getQueryData<YeuCauDoiPhongDetailResponse>(
            ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(variables.id)
          );
        if (detailRequest) {
          // Cần tìm ra YcMuonPhongID (header) từ YcMuonPhongCtID
          // Điều này cần backend trả về hoặc FE có cách lấy được
          // queryClient.invalidateQueries({ queryKey: ROOM_REQUEST_QUERY_KEYS.detail(ID_CUA_YEUCAUMUONPHONG_HEADER) });
        }
      }
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xử lý yêu cầu đổi phòng.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hủy Yêu Cầu Đổi Phòng (bởi người tạo)
export const useCancelRoomChangeRequestByUser = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: roomChangeRequestService.cancelRoomChangeRequestByUser,
    onSuccess: (data, id) => {
      toast.success(data.message || 'Đã hủy yêu cầu đổi phòng.');
      queryClient.invalidateQueries({
        queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_CHANGE_REQUEST_QUERY_KEYS.detail(id),
      });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi hủy yêu cầu đổi phòng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};

// Hook lấy danh sách phòng đã được xếp cho sự kiện của người dùng hiện tại
// mà có thể tạo yêu cầu đổi phòng
export const useMyActiveBookedRoomsForChangeEvent = (
  params: { nguoiYeuCauID?: number; limit?: number }, // Backend sẽ dựa vào NguoiYeuCauID của YeuCauMuonPhong gốc
  options?: Omit<
    UseQueryOptions<ChiTietDatPhongForSelect[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ChiTietDatPhongForSelect[], APIError>({
    queryKey: ['myActiveBookedRoomsForChange', params],
    queryFn: () => {
      // Giả định có hàm này trong service, gọi API GET /v1/chitietsudungphong/co-the-doi
      if (!params.nguoiYeuCauID) return Promise.resolve([]); // Không fetch nếu không có ID người dùng
      return roomChangeRequestService.getMyActiveBookedRooms(params); // Cần tạo hàm này trong service
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
