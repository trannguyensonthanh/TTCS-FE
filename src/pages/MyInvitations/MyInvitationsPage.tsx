// src/pages/MyInvitations/MyInvitationsPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout'; // Hoặc ClientLayout tùy vào nơi bạn muốn đặt trang này
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  MailWarning,
  Inbox,
  CheckSquare,
  XSquare,
  AlertTriangle,
} from 'lucide-react';
import { useMyInvitationsList } from '@/hooks/queries/invitationResponseQueries';
import {
  GetMyInvitationsParams,
  LoiMoiSuKienItem,
} from '@/services/invitationResponse.service';
import { InvitationCard } from './components/InvitationCard';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import RespondToInvitationDialog from './components/RespondToInvitationDialog'; // Sẽ tạo component này
import { APIError } from '@/services/apiHelper';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type InvitationStatusTab = 'CHUA_PHAN_HOI' | 'DA_CHAP_NHAN' | 'DA_TU_CHOI';

const ITEMS_PER_PAGE = 9;

const MyInvitationsPage: React.FC = () => {
  const [activeTab, setActiveTab] =
    useState<InvitationStatusTab>('CHUA_PHAN_HOI');
  const [currentPage, setCurrentPage] = useState(1);

  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<LoiMoiSuKienItem | null>(null);

  const queryParams: GetMyInvitationsParams = {
    trangThaiPhanHoi: activeTab,
    sapDienRa:
      activeTab === 'CHUA_PHAN_HOI' || activeTab === 'DA_CHAP_NHAN'
        ? true
        : undefined, // Chỉ lấy sự kiện sắp diễn ra cho tab chưa phản hồi và đã chấp nhận
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy: 'SuKien.TgBatDauDK',
    sortOrder: 'asc',
  };

  const {
    data: paginatedInvitations,
    isLoading,
    isFetching,
    isError,
    error,
    refetch, // Thêm refetch
  } = useMyInvitationsList(queryParams);

  const invitations = paginatedInvitations?.items || [];
  const totalPages = paginatedInvitations?.totalPages || 1;

  const handleTabChange = (value: string) => {
    setActiveTab(value as InvitationStatusTab);
    setCurrentPage(1); // Reset về trang 1 khi đổi tab
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRespondModal = (invitation: LoiMoiSuKienItem) => {
    // Chỉ cho phép phản hồi nếu chưa phản hồi và sự kiện chưa qua (BE cũng nên check)
    if (invitation.isChapNhanMoi === null) {
      setSelectedInvitation(invitation);
      setIsRespondModalOpen(true);
    } else {
      // Có thể hiển thị thông báo hoặc mở modal chỉ để xem chi tiết
      toast.info('Bạn đã phản hồi lời mời này.');
      setSelectedInvitation(invitation); // Vẫn set để có thể xem chi tiết
      setIsRespondModalOpen(true); // Mở modal ở chế độ xem
    }
  };

  const handleModalClose = (responded: boolean) => {
    setIsRespondModalOpen(false);
    setSelectedInvitation(null);
    if (responded) {
      refetch(); // Refetch lại danh sách lời mời sau khi phản hồi thành công
    }
  };

  const tabItems = [
    {
      value: 'CHUA_PHAN_HOI',
      label: 'Chưa phản hồi',
      icon: MailWarning,
      count:
        activeTab === 'CHUA_PHAN_HOI'
          ? paginatedInvitations?.totalItems
          : undefined,
    },
    {
      value: 'DA_CHAP_NHAN',
      label: 'Đã chấp nhận',
      icon: CheckSquare,
      count:
        activeTab === 'DA_CHAP_NHAN'
          ? paginatedInvitations?.totalItems
          : undefined,
    },
    {
      value: 'DA_TU_CHOI',
      label: 'Đã từ chối',
      icon: XSquare,
      count:
        activeTab === 'DA_TU_CHOI'
          ? paginatedInvitations?.totalItems
          : undefined,
    },
  ];

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl border-border/70 dark:border-slate-700/70">
          <CardHeader className="border-b dark:border-slate-700/70">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Lời Mời Của Bạn
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Xem và phản hồi các lời mời tham gia sự kiện từ ban tổ chức.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 h-auto sm:h-12 mb-6 rounded-lg bg-muted dark:bg-slate-800 p-1">
                {tabItems.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-xs sm:text-sm md:text-base h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-0"
                  >
                    <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 px-1.5 py-0.5 text-xs h-5"
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value={activeTab} className="mt-0">
                    {isLoading && (
                      <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                      </div>
                    )}
                    {isError && (
                      <div className="text-center py-16 text-destructive bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                        <p className="text-lg font-semibold">
                          Lỗi khi tải lời mời!
                        </p>
                        <p className="text-sm mt-1">
                          {(error as APIError)?.body?.message ||
                            (error as Error)?.message ||
                            'Vui lòng thử lại sau.'}
                        </p>
                        <Button
                          onClick={() => refetch()}
                          variant="outline"
                          className="mt-4 border-destructive text-destructive hover:bg-destructive/10"
                        >
                          Thử lại
                        </Button>
                      </div>
                    )}
                    {!isLoading && !isError && invitations.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground">
                        <Inbox className="mx-auto h-20 w-20 mb-6 text-gray-400 dark:text-gray-500 opacity-70" />
                        <p className="text-xl font-semibold">
                          Không có lời mời nào.
                        </p>
                        <p className="mt-1 text-sm">
                          {activeTab === 'CHUA_PHAN_HOI'
                            ? 'Bạn không có lời mời mới nào cần phản hồi.'
                            : activeTab === 'DA_CHAP_NHAN'
                            ? 'Bạn chưa chấp nhận lời mời nào.'
                            : 'Bạn chưa từ chối lời mời nào.'}
                        </p>
                      </div>
                    )}
                    {!isLoading && !isError && invitations.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {invitations.map((invitation) => (
                          <InvitationCard
                            key={invitation.moiThamGiaID}
                            invitation={invitation}
                            onRespondClick={() =>
                              handleOpenRespondModal(invitation)
                            }
                          />
                        ))}
                      </div>
                    )}
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <ReusablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                          isLoading={isFetching}
                        />
                      </div>
                    )}
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {selectedInvitation && (
        <RespondToInvitationDialog
          open={isRespondModalOpen}
          onOpenChange={setIsRespondModalOpen}
          invitation={selectedInvitation}
          onCloseDialog={handleModalClose}
        />
      )}
    </div>
  );
};

export default MyInvitationsPage;
