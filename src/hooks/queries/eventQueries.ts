/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/queries/eventQueries.ts
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import eventService, {
  GetSuKienParams as GetManagedSuKienParams,
  PaginatedSuKienResponse,
  SuKienDetailResponse,
  CreateYeuCauHuySKResponse,
  CreateYeuCauHuySKPayload,
  UpdateSuKienTrangThaiResponse,
  UpdateSuKienTrangThaiPayload,
  GetPublicSuKienParams,
  CreateSuKienSuccessResponse,
  CreateSuKienPayload,
  TuChoiSuKienPayload,
  DuyetHoacTuChoiSKResponse,
  DuyetSuKienPayload,
  GetSuKienForSelectParams,
  UpdateSuKienPayload,
  GetSuKienCoTheMoiParams,
  PaginatedSuKienCoTheMoiResponse,
  // Import các type khác nếu cần cho create/update
} from '@/services/event.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { SuKienForSelectResponse } from '@/services/danhMuc.service';

// --- Query Keys for Public Events ---
export const PUBLIC_EVENT_QUERY_KEYS = {
  all: ['publicEvents'] as const,
  lists: () => [...PUBLIC_EVENT_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetPublicSuKienParams) =>
    [...PUBLIC_EVENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...PUBLIC_EVENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...PUBLIC_EVENT_QUERY_KEYS.details(), id] as const,
};

// --- Query Keys for Managed Events ---
export const EVENT_QUERY_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENT_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetManagedSuKienParams) =>
    [...EVENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...EVENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...EVENT_QUERY_KEYS.details(), id] as const,
  suKienForSelect: (params?: GetSuKienForSelectParams) =>
    ['suKienForSelect', params || {}] as const,
};

export const EVENT_INVITABLE_QUERY_KEYS = {
  all: ['eventsForInvitation'] as const,
  lists: () => [...EVENT_INVITABLE_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetSuKienCoTheMoiParams) =>
    [...EVENT_INVITABLE_QUERY_KEYS.lists(), params] as const,
};

// Hook để lấy danh sách sự kiện có phân trang
export const useManagedEventsList = (
  params: GetManagedSuKienParams,
  options?: Omit<
    UseQueryOptions<PaginatedSuKienResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedSuKienResponse, APIError>({
    queryKey: EVENT_QUERY_KEYS.list(params),
    queryFn: () => eventService.getSuKienListForManagement(params),

    ...options,
  });
};

// Hook để lấy danh sách sự kiện CÔNG KHAI
export const usePublicEventsList = (
  params: GetPublicSuKienParams,
  options?: Omit<
    UseQueryOptions<PaginatedSuKienResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedSuKienResponse, APIError>({
    queryKey: PUBLIC_EVENT_QUERY_KEYS.list(params), // Key mới cho public events
    queryFn: () => eventService.getPublicSuKienList(params),
    ...options,
  });
};

// Hook để lấy chi tiết một sự kiện
export const useManagedEventDetail = (
  suKienID: number | string | undefined,
  options?: Omit<
    UseQueryOptions<SuKienDetailResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<SuKienDetailResponse, APIError>({
    queryKey: EVENT_QUERY_KEYS.detail(suKienID),
    queryFn: () => {
      if (!suKienID) {
        return Promise.reject(new Error('ID sự kiện là bắt buộc'));
      }
      return eventService.getSuKienDetailForManagement(suKienID);
    },
    enabled: !!suKienID, // Chỉ fetch khi suKienID có giá trị
    ...(options || {}),
  });
};

// Hook để lấy chi tiết một sự kiện CÔNG KHAI
export const usePublicEventDetail = (
  suKienID: number | string | undefined,
  options?: Omit<
    UseQueryOptions<SuKienDetailResponse, APIError>,
    'queryKey' | 'queryFn' | 'enabled'
  >
) => {
  return useQuery<SuKienDetailResponse, APIError>({
    queryKey: PUBLIC_EVENT_QUERY_KEYS.detail(suKienID), // Key mới
    queryFn: () => {
      if (!suKienID) return Promise.reject(new Error('ID sự kiện là bắt buộc'));
      return eventService.getPublicSuKienDetail(suKienID);
    },
    enabled: !!suKienID,
    ...options,
  });
};

// Hook cho việc cập nhật trạng thái sự kiện (ví dụ: tự hủy bởi người tạo)
export const useUpdateEventStatus = (
  options?: UseMutationOptions<
    UpdateSuKienTrangThaiResponse,
    APIError,
    { suKienID: number | string; payload: UpdateSuKienTrangThaiPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    UpdateSuKienTrangThaiResponse,
    APIError,
    { suKienID: number | string; payload: UpdateSuKienTrangThaiPayload }
  >({
    mutationFn: ({ suKienID, payload }) =>
      eventService.updateSuKienTrangThai(suKienID, payload),
    onSuccess: (data, variables) => {
      toast.success(
        data.message ||
          `Cập nhật trạng thái sự kiện ID: ${variables.suKienID} thành công.`
      );
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(variables.suKienID),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError, variables) => {
      toast.error(
        error.body?.message ||
          error.message ||
          `Lỗi khi cập nhật trạng thái sự kiện ID: ${variables.suKienID}.`
      );
      if (options?.onError) {
        options.onError(error, variables, undefined);
      }
    },
    ...options,
  });
};

// Hook cho việc tạo yêu cầu hủy sự kiện
export const useCreateEventCancelRequest = (
  options?: UseMutationOptions<
    CreateYeuCauHuySKResponse,
    APIError,
    CreateYeuCauHuySKPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    CreateYeuCauHuySKResponse,
    APIError,
    CreateYeuCauHuySKPayload
  >({
    mutationFn: eventService.createYeuCauHuySK,
    onSuccess: (data, variables) => {
      toast.success(
        data.message ||
          `Yêu cầu hủy cho sự kiện ID: ${variables.suKienID} đã được tạo.`
      );
      // Invalidate danh sách sự kiện và chi tiết sự kiện để cập nhật trạng thái mới (CHO_DUYET_HUY_BGH)
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(variables.suKienID),
      });
      // Có thể cần invalidate query của danh sách yêu cầu hủy sự kiện nữa
      // queryClient.invalidateQueries({ queryKey: ['eventCancelRequests'] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError, variables) => {
      toast.error(
        error.body?.message ||
          error.message ||
          `Lỗi khi tạo yêu cầu hủy cho sự kiện ID: ${variables.suKienID}.`
      );
      if (options?.onError) {
        options.onError(error, variables, undefined);
      }
    },
    ...options,
  });
};
// Hook cho việc Tạo Sự Kiện Mới
export const useCreateEvent = (
  options?: UseMutationOptions<
    CreateSuKienSuccessResponse,
    APIError,
    CreateSuKienPayload
  >
) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Để điều hướng sau khi tạo thành công

  return useMutation<
    CreateSuKienSuccessResponse,
    APIError,
    CreateSuKienPayload
  >({
    mutationFn: eventService.createSuKien,
    onSuccess: (data) => {
      toast.success(`Đã tạo yêu cầu cho sự kiện "${data.tenSK}" thành công!`);
      queryClient.invalidateQueries({
        queryKey: PUBLIC_EVENT_QUERY_KEYS.lists(),
      }); // Làm mới danh sách sự kiện
      navigate('/events'); // Hoặc đến trang chi tiết sự kiện vừa tạo: /events/${data.suKienID}
      if (options?.onSuccess) {
        options.onSuccess(data, {} as CreateSuKienPayload, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo sự kiện.'
      );
      if (options?.onError) {
        options.onError(error, {} as CreateSuKienPayload, undefined);
      }
    },
    ...options,
  });
};

// Hook cho BGH duyệt sự kiện
export const useApproveEventBGH = (
  options?: UseMutationOptions<
    DuyetHoacTuChoiSKResponse,
    APIError,
    { suKienID: number | string; payload: DuyetSuKienPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    DuyetHoacTuChoiSKResponse,
    APIError,
    { suKienID: number | string; payload: DuyetSuKienPayload }
  >({
    mutationFn: ({ suKienID, payload }) =>
      eventService.approveEventByBGH(suKienID, payload),
    onSuccess: (data, variables) => {
      toast.success(
        data.message || `Đã duyệt thành công sự kiện ID: ${variables.suKienID}.`
      );
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(variables.suKienID),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError, variables) => {
      toast.error(
        error.body?.message ||
          error.message ||
          `Lỗi khi duyệt sự kiện ID: ${variables.suKienID}.`
      );
      if (options?.onError) {
        options.onError(error, variables, undefined);
      }
    },
    ...options,
  });
};

// Hook cho BGH từ chối sự kiện
export const useRejectEventBGH = (
  options?: UseMutationOptions<
    DuyetHoacTuChoiSKResponse,
    APIError,
    { suKienID: number | string; payload: TuChoiSuKienPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    DuyetHoacTuChoiSKResponse,
    APIError,
    { suKienID: number | string; payload: TuChoiSuKienPayload }
  >({
    mutationFn: ({ suKienID, payload }) =>
      eventService.rejectEventByBGH(suKienID, payload),
    onSuccess: (data, variables) => {
      toast.success(
        data.message || `Đã từ chối sự kiện ID: ${variables.suKienID}.`
      );
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: EVENT_QUERY_KEYS.detail(variables.suKienID),
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError, variables) => {
      toast.error(
        error.body?.message ||
          error.message ||
          `Lỗi khi từ chối sự kiện ID: ${variables.suKienID}.`
      );
      if (options?.onError) {
        options.onError(error, variables, undefined);
      }
    },
    ...options,
  });
};

// Hook lấy danh sách Sự kiện để chọn khi tạo Yêu Cầu Phòng
export const useSuKienListForSelection = (
  params?: GetSuKienForSelectParams,
  options?: Omit<
    UseQueryOptions<SuKienForSelectResponse[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<SuKienForSelectResponse[], APIError>({
    queryKey: EVENT_QUERY_KEYS.suKienForSelect(params),
    queryFn: () => eventService.getSuKienListForSelection(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook cho việc Cập Nhật Sự Kiện
export const useUpdateEvent = (
  options?: UseMutationOptions<
    SuKienDetailResponse,
    APIError,
    { id: number | string; payload: UpdateSuKienPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    SuKienDetailResponse,
    APIError,
    { id: number | string; payload: UpdateSuKienPayload }
  >({
    mutationFn: ({ id, payload }) => eventService.updateSuKien(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật sự kiện "${data.tenSK}" thành công.`);
      // Invalidate cả danh sách và chi tiết để làm mới dữ liệu
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      queryClient.setQueryData(EVENT_QUERY_KEYS.detail(variables.id), data); // Cập nhật cache chi tiết ngay
      // Nếu sự kiện vừa được sửa đang ở trạng thái BGH_YEU_CAU_CHINH_SUA, có thể cần một hành động "Gửi lại duyệt"
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật sự kiện.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    // ...options,
  });
};

export const useSuKienCoTheMoi = (
  params: GetSuKienCoTheMoiParams,
  options?: Omit<
    UseQueryOptions<PaginatedSuKienCoTheMoiResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedSuKienCoTheMoiResponse, APIError>({
    queryKey: EVENT_INVITABLE_QUERY_KEYS.list(params),
    queryFn: () => eventService.getSuKienCoTheMoi(params),
    staleTime: 5 * 60 * 1000, // 5 phút
    ...options,
  });
};
