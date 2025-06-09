/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/roomRequestQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import roomRequestService, {
  CreateYeuCauMuonPhongPayload,
  GetYeuCauMuonPhongParams,
  PaginatedYeuCauMuonPhongResponse,
  UpdateYeuCauMuonPhongPayload,
  XuLyYcChiTietPayload,
  YeuCauMuonPhongDetailResponse,
} from '@/services/roomRequest.service';

import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
import { EVENT_QUERY_KEYS } from './eventQueries'; // Để invalidate query sự kiện

export const ROOM_REQUEST_QUERY_KEYS = {
  all: ['roomRequests'] as const,
  lists: () => [...ROOM_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetYeuCauMuonPhongParams) =>
    [...ROOM_REQUEST_QUERY_KEYS.lists(), params] as const,
  details: () => [...ROOM_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...ROOM_REQUEST_QUERY_KEYS.details(), id] as const,
};

// Lấy danh sách Yêu cầu mượn phòng
export const useRoomRequests = (
  params: GetYeuCauMuonPhongParams,
  options?: Omit<
    UseQueryOptions<PaginatedYeuCauMuonPhongResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedYeuCauMuonPhongResponse, APIError>({
    queryKey: ROOM_REQUEST_QUERY_KEYS.list(params),
    queryFn: () => roomRequestService.getRoomRequests(params),
    ...options,
  });
};

// Lấy chi tiết Yêu cầu mượn phòng
export const useRoomRequestDetail = (
  id: number | string | undefined,
  options?: Omit<
    UseQueryOptions<YeuCauMuonPhongDetailResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<YeuCauMuonPhongDetailResponse, APIError>({
    queryKey: ROOM_REQUEST_QUERY_KEYS.detail(id),
    queryFn: () => {
      if (!id)
        return Promise.reject(new Error('ID Yêu cầu mượn phòng là bắt buộc'));
      return roomRequestService.getRoomRequestDetail(id);
    },
    enabled: !!id,
    ...options,
  });
};

// Tạo Yêu cầu mượn phòng mới
export const useCreateRoomRequest = (
  options?: UseMutationOptions<
    YeuCauMuonPhongDetailResponse,
    APIError,
    CreateYeuCauMuonPhongPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    YeuCauMuonPhongDetailResponse,
    APIError,
    CreateYeuCauMuonPhongPayload
  >({
    mutationFn: roomRequestService.createRoomRequest,
    onSuccess: (data, variables) => {
      toast.success('Đã gửi yêu cầu mượn phòng thành công.');
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.lists(),
      });
      // Cập nhật trạng thái sự kiện liên quan
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(variables.suKienID),
      });
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() }); // Cập nhật danh sách sự kiện
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi tạo yêu cầu mượn phòng.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateYeuCauMuonPhongPayload, undefined);
    },
    ...options,
  });
};

// CSVC xử lý một chi tiết yêu cầu phòng
export const useProcessRoomRequestDetailItem = (
  options?: UseMutationOptions<
    YeuCauMuonPhongDetailResponse,
    APIError,
    {
      ycMuonPhongID: number | string;
      ycMuonPhongCtID: number | string;
      payload: XuLyYcChiTietPayload;
    }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    YeuCauMuonPhongDetailResponse,
    APIError,
    {
      ycMuonPhongID: number | string;
      ycMuonPhongCtID: number | string;
      payload: XuLyYcChiTietPayload;
    }
  >({
    mutationFn: ({ ycMuonPhongID, ycMuonPhongCtID, payload }) =>
      roomRequestService.processRoomRequestDetail(
        ycMuonPhongID,
        ycMuonPhongCtID,
        payload
      ),
    onSuccess: (data, variables) => {
      toast.success(`Đã xử lý chi tiết yêu cầu phòng.`);
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.detail(variables.ycMuonPhongID),
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.lists(),
      }); // Làm mới danh sách yêu cầu
      // Làm mới cả chi tiết sự kiện liên quan nếu trạng thái sự kiện thay đổi
      if (data.suKien?.suKienID) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
        });
        queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      }
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi xử lý chi tiết yêu cầu phòng.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hủy yêu cầu mượn phòng bởi người tạo
export const useCancelRoomRequestByUser = (
  options?: UseMutationOptions<
    YeuCauMuonPhongDetailResponse,
    APIError,
    number | string
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<YeuCauMuonPhongDetailResponse, APIError, number | string>({
    mutationFn: roomRequestService.cancelRoomRequestByUser,
    onSuccess: (data, ycMuonPhongID) => {
      toast.success('Đã hủy yêu cầu mượn phòng.');
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.detail(ycMuonPhongID),
      });
      if (data.suKien?.suKienID) {
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
        });
        queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      }
      if (options?.onSuccess) options.onSuccess(data, ycMuonPhongID, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi hủy yêu cầu mượn phòng.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};

export const useUpdateRoomRequestDetailByUser = (
  options?: UseMutationOptions<
    YeuCauMuonPhongDetailResponse,
    APIError,
    { id: number | string; payload: UpdateYeuCauMuonPhongPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    YeuCauMuonPhongDetailResponse,
    APIError,
    { id: number | string; payload: UpdateYeuCauMuonPhongPayload }
  >({
    mutationFn: ({ id, payload }) =>
      roomRequestService.updateRoomRequestDetailByUser(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật chi tiết yêu cầu phòng.`);
      // Invalidate chi tiết của YeuCauMuonPhong header để nó load lại các chi tiết con
      // Giả sử `data` trả về có `ycMuonPhongID` (ID của header)
      if (data.ycMuonPhongID) {
        queryClient.invalidateQueries({
          queryKey: ROOM_REQUEST_QUERY_KEYS.detail(data.ycMuonPhongID),
        });
      }
      queryClient.invalidateQueries({
        queryKey: ROOM_REQUEST_QUERY_KEYS.lists(),
      }); // Làm mới danh sách YC Mượn Phòng
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi cập nhật chi tiết yêu cầu phòng.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
  });
};
