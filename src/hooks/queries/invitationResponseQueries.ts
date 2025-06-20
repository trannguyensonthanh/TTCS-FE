// src/hooks/queries/invitationResponseQueries.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import invitationResponseService, {
  GetMyInvitationsParams,
  PaginatedLoiMoiSuKienResponse,
  PhanHoiLoiMoiPayload,
  PhanHoiLoiMoiResponse,
  LoiMoiSuKienItem, // Import để dùng trong optimistic update
} from '@/services/invitationResponse.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';

export const MY_INVITATIONS_QUERY_KEYS = {
  all: ['myInvitations'] as const,
  lists: () => [...MY_INVITATIONS_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetMyInvitationsParams) =>
    [...MY_INVITATIONS_QUERY_KEYS.lists(), params] as const,
  // detail: (moiThamGiaID: number | string) => [...MY_INVITATIONS_QUERY_KEYS.all, 'detail', moiThamGiaID] as const, // Nếu có API detail
};

// Hook để lấy danh sách lời mời của người dùng hiện tại
export const useMyInvitationsList = (
  params: GetMyInvitationsParams,
  options?: Omit<
    UseQueryOptions<PaginatedLoiMoiSuKienResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedLoiMoiSuKienResponse, APIError>({
    queryKey: MY_INVITATIONS_QUERY_KEYS.list(params),
    queryFn: () => invitationResponseService.getMyInvitations(params),
    staleTime: 2 * 60 * 1000, // Cache 2 phút, lời mời có thể được cập nhật
    refetchInterval: 5 * 60 * 1000, // Tự động refetch mỗi 5 phút khi tab active
    ...options,
  });
};

// Hook để phản hồi một lời mời
export const useRespondToInvitation = (
  options?: UseMutationOptions<
    PhanHoiLoiMoiResponse,
    APIError,
    { moiThamGiaID: number | string; payload: PhanHoiLoiMoiPayload }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    PhanHoiLoiMoiResponse,
    APIError,
    { moiThamGiaID: number | string; payload: PhanHoiLoiMoiPayload }
  >({
    mutationFn: ({ moiThamGiaID, payload }) =>
      invitationResponseService.respondToInvitation(moiThamGiaID, payload),
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Phản hồi của bạn đã được ghi nhận.');

      // Optimistic update hoặc invalidate query
      queryClient.invalidateQueries({
        queryKey: MY_INVITATIONS_QUERY_KEYS.lists(),
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi gửi phản hồi.'
      );
      if (options?.onError) {
        // payload không được dùng trong onError của react-query type
        options.onError(
          error,
          { moiThamGiaID: 0, payload: { chapNhan: false } },
          undefined
        );
      }
    },
    ...options,
  });
};
