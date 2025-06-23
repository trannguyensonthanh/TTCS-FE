/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/EventInvitationManagement/EventInvitedListPage.tsx
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Users,
  ListFilter,
  MailSearch,
  UserX,
  AlertTriangle,
  Search,
  ArrowLeftRight,
  MessageCircleDashed,
} from 'lucide-react';
import {
  GetEventsWithInvitationsParams,
  SuKienCoLoiMoiItem,
  PaginatedNguoiDuocMoiChiTietResponse, // Import đúng type này
  NguoiDuocMoiChiTietItem, // Import đúng type này
} from '@/services/eventInvitationManagement.service'; // Đảm bảo service trả về type này
import { GetDanhSachMoiParams } from '@/services/invite.service';
import { useEventsWithInvitations } from '@/hooks/queries/eventInvitationManagementQueries';
import EventSelectorForInvitedList from './components/EventSelectorForInvitedList';
import InvitedUsersTable from './components/InvitedUsersTable';
import RevokeInviteConfirmDialog from './components/RevokeInviteConfirmDialog';
import { toast } from '@/components/ui/sonner';
import { APIError } from '@/services/apiHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useDanhSachMoi, useThuHoiLoiMoi } from '@/hooks/queries/inviteQueries';

const ITEMS_PER_PAGE_EVENTS = 5; // Giảm để dễ test
const ITEMS_PER_PAGE_INVITED_USERS = 10;

const EventInvitedListPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<SuKienCoLoiMoiItem | null>(
    null
  );
  const [eventSearchTerm, setEventSearchTerm] = useState('');
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const debouncedEventSearchTerm = useDebounce(eventSearchTerm, 500);

  const [invitedUserSearchTerm, setInvitedUserSearchTerm] = useState('');
  const [invitedUserStatusFilter, setInvitedUserStatusFilter] = useState<
    'ALL' | 'CHUA_PHAN_HOI' | 'CHAP_NHAN' | 'TU_CHOI'
  >('ALL');
  const [invitedUserCurrentPage, setInvitedUserCurrentPage] = useState(1);
  const debouncedInvitedUserSearchTerm = useDebounce(
    invitedUserSearchTerm,
    500
  );

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [invitationToRevoke, setInvitationToRevoke] =
    useState<NguoiDuocMoiChiTietItem | null>(null);

  const eventListParams: GetEventsWithInvitationsParams = useMemo(
    () => ({
      searchTerm: debouncedEventSearchTerm,
      page: eventCurrentPage,
      limit: ITEMS_PER_PAGE_EVENTS,
      sortBy: 'SuKien.TgBatDauDK', // Sắp xếp theo ngày bắt đầu sự kiện
      sortOrder: 'desc', // Sự kiện mới nhất hoặc sắp diễn ra lên đầu
    }),
    [debouncedEventSearchTerm, eventCurrentPage]
  );

  const {
    data: paginatedEventsData, // Đổi tên để tránh trùng với biến trong hook
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
    error: errorEvents,
  } = useEventsWithInvitations(eventListParams);

  const invitedListParams: GetDanhSachMoiParams = useMemo(
    () => ({
      searchTerm: debouncedInvitedUserSearchTerm,
      trangThaiPhanHoi:
        invitedUserStatusFilter === 'ALL' ? undefined : invitedUserStatusFilter,
      page: invitedUserCurrentPage,
      limit: ITEMS_PER_PAGE_INVITED_USERS,
      sortBy: 'NguoiDung.HoTen', // Sắp xếp theo tên người được mời
      sortOrder: 'asc',
    }),
    [
      debouncedInvitedUserSearchTerm,
      invitedUserStatusFilter,
      invitedUserCurrentPage,
    ]
  );

  const {
    data: paginatedInvitedUsersData, // Đổi tên
    isLoading: isLoadingInvitedUsers,
    isFetching: isFetchingInvitedUsers,
    isError: isErrorInvitedUsers,
    error: errorInvitedUsers,
    refetch: refetchInvitedList,
  } = useDanhSachMoi(selectedEvent?.suKienID, invitedListParams, {
    enabled: !!selectedEvent,
  });

  const revokeInvitationMutation = useThuHoiLoiMoi(
    selectedEvent?.suKienID || 0,
    {
      onSuccess: () => {
        toast.success('Đã thu hồi lời mời thành công.');
        setIsRevokeModalOpen(false);
        setInvitationToRevoke(null);
        refetchInvitedList();
      },
      onError: (error: APIError) => {
        // Toast lỗi đã có trong hook, không cần xử lý lại ở đây
        // console.error("Revoke invitation failed:", error);
      },
    }
  );

  const handleEventSelect = (event: SuKienCoLoiMoiItem | null) => {
    setSelectedEvent(event);
    setInvitedUserCurrentPage(1);
    setInvitedUserSearchTerm('');
    setInvitedUserStatusFilter('ALL');
  };

  const handleRevokeInviteClick = (invitation: NguoiDuocMoiChiTietItem) => {
    setInvitationToRevoke(invitation);
    setIsRevokeModalOpen(true);
  };

  const confirmRevokeInviteAction = () => {
    if (invitationToRevoke) {
      revokeInvitationMutation.mutate(invitationToRevoke.moiThamGiaID);
    }
  };

  const pageTitle = selectedEvent
    ? `Danh Sách Mời: ${selectedEvent.tenSK}`
    : 'Quản Lý Lời Mời Sự Kiện';

  return (
    <DashboardLayout pageTitle={pageTitle}>
      <div className="space-y-6 md:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'circOut' }}
        >
          <EventSelectorForInvitedList
            paginatedEvents={paginatedEventsData}
            isLoading={isLoadingEvents}
            isError={isErrorEvents}
            error={errorEvents as APIError | Error | null}
            selectedEventId={selectedEvent?.suKienID}
            onEventSelect={handleEventSelect}
            searchTerm={eventSearchTerm}
            onSearchTermChange={setEventSearchTerm}
            currentPage={eventCurrentPage}
            onPageChange={setEventCurrentPage}
          />
        </motion.div>

        {selectedEvent && (
          <motion.div
            key={selectedEvent.suKienID}
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
            className="mt-6"
          >
            <Card className="shadow-xl border-border/70 dark:border-slate-700/70">
              <CardHeader className="border-b dark:border-slate-700/70 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-xl md:text-2xl font-bold flex items-center">
                      <Users className="mr-3 h-6 w-6 text-primary dark:text-ptit-blue" />
                      Danh Sách Người Được Mời
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Quản lý và theo dõi các lời mời cho sự kiện:{' '}
                      <strong className="text-foreground">
                        {selectedEvent.tenSK}
                      </strong>
                      .
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm whitespace-nowrap self-start sm:self-center"
                  >
                    Tổng số: {paginatedInvitedUsersData?.totalItems || 0} lời
                    mời
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-3 border-t dark:border-slate-700/50">
                  <div>
                    <Label
                      htmlFor="invited-user-search"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Tìm trong danh sách mời (Tên, Email, Mã)
                    </Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="invited-user-search"
                        type="search"
                        placeholder="Nhập từ khóa..."
                        className="pl-9 h-9 text-sm rounded-md"
                        value={invitedUserSearchTerm}
                        onChange={(e) => {
                          setInvitedUserSearchTerm(e.target.value);
                          setInvitedUserCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="invited-user-status-filter"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Lọc theo trạng thái phản hồi
                    </Label>
                    <Select
                      value={invitedUserStatusFilter}
                      onValueChange={(val) => {
                        setInvitedUserStatusFilter(val as any);
                        setInvitedUserCurrentPage(1);
                      }}
                    >
                      <SelectTrigger
                        id="invited-user-status-filter"
                        className="h-9 text-sm mt-1 rounded-md"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                        <SelectItem value="CHUA_PHAN_HOI">
                          Chưa phản hồi
                        </SelectItem>
                        <SelectItem value="CHAP_NHAN">Đã chấp nhận</SelectItem>
                        <SelectItem value="TU_CHOI">Đã từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-0 sm:px-2 md:px-4">
                {' '}
                {/* Remove default padding and manage it in child */}
                <InvitedUsersTable
                  paginatedInvitedUsers={paginatedInvitedUsersData}
                  isLoading={isLoadingInvitedUsers}
                  isFetching={isFetchingInvitedUsers}
                  isError={isErrorInvitedUsers}
                  error={errorInvitedUsers as APIError | Error | null}
                  onRevokeInvite={handleRevokeInviteClick}
                  currentPage={invitedUserCurrentPage}
                  onPageChange={setInvitedUserCurrentPage}
                  itemsPerPage={ITEMS_PER_PAGE_INVITED_USERS}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!selectedEvent && !isLoadingEvents && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mt-6 shadow-md border-dashed border-slate-300 dark:border-slate-700">
              <CardContent className="py-16 text-center">
                <MailSearch className="mx-auto h-20 w-20 text-slate-400 dark:text-slate-500 mb-6" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                  Chưa Chọn Sự Kiện
                </h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Vui lòng tìm kiếm và chọn một sự kiện từ danh sách ở trên để
                  xem và quản lý danh sách người đã được mời tham gia.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {invitationToRevoke && (
          <RevokeInviteConfirmDialog
            open={isRevokeModalOpen}
            onOpenChange={setIsRevokeModalOpen}
            invitation={invitationToRevoke}
            onConfirm={confirmRevokeInviteAction}
            isPending={revokeInvitationMutation.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventInvitedListPage;
