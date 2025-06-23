// src/hooks/queries/eventInvitationManagementQueries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import eventInvitationManagementService, {
  GetEventsWithInvitationsParams,
  PaginatedEventsWithInvitationsResponse,
} from '@/services/eventInvitationManagement.service';
import { APIError } from '@/services/apiHelper';
import { toast } from '@/components/ui/sonner';
import { INVITE_QUERY_KEYS } from './inviteQueries'; // Import key của danh sách mời để invalidate
import { EVENT_INVITABLE_QUERY_KEYS } from './eventQueries'; // Import key của sự kiện có thể mời để invalidate soLuongDaMoi
import { GetDanhSachMoiParams } from '@/services/invite.service';

export const EVENT_INVITATION_MANAGEMENT_QUERY_KEYS = {
  all: ['eventInvitationManagement'] as const,
  eventsWithInvitationsLists: () =>
    [
      ...EVENT_INVITATION_MANAGEMENT_QUERY_KEYS.all,
      'eventsWithInvitationsList',
    ] as const,
  eventsWithInvitationsList: (params: GetEventsWithInvitationsParams) =>
    [
      ...EVENT_INVITATION_MANAGEMENT_QUERY_KEYS.eventsWithInvitationsLists(),
      params,
    ] as const,

  // Sử dụng lại key từ inviteQueries cho danh sách người được mời, nhưng có thể thêm context 'management'
  invitedListForEventManagement: (suKienID: number | string | undefined) =>
    [
      ...INVITE_QUERY_KEYS.listByEvent(suKienID || 'all'),
      'managementView',
    ] as const,
  invitedListManagement: (
    suKienID: number | string | undefined,
    params: GetDanhSachMoiParams
  ) =>
    [
      ...EVENT_INVITATION_MANAGEMENT_QUERY_KEYS.invitedListForEventManagement(
        suKienID
      ),
      params,
    ] as const,
};

// Hook lấy danh sách sự kiện đã có lời mời
export const useEventsWithInvitations = (
  params: GetEventsWithInvitationsParams,
  options?: Omit<
    UseQueryOptions<PaginatedEventsWithInvitationsResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedEventsWithInvitationsResponse, APIError>({
    queryKey:
      EVENT_INVITATION_MANAGEMENT_QUERY_KEYS.eventsWithInvitationsList(params),
    queryFn: () =>
      eventInvitationManagementService.getEventsWithInvitations(params),
    staleTime: 5 * 60 * 1000, // 5 phút
    ...options,
  });
};
