// src/pages/Invitations/InviteToEventPage.tsx
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card'; // Bỏ CardHeader, CardTitle vì đã có trong step
import { EventSelectionStep } from './components/EventSelectionStep';
import { UserSearchStep } from './components/UserSearchStep';
import { ReviewInvitesStep } from './components/ReviewInvitesStep';
import { SuKienCoTheMoiItem } from '@/services/event.service';
import { NguoiDungTimKiemItem } from '@/services/nguoiDung.service';
import { toast } from '@/components/ui/sonner';
import { ListChecks, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Thêm framer-motion
import { TieuChiMoiHangLoat } from '@/services/invite.service';

// Interface này nên được định nghĩa ở một nơi có thể chia sẻ nếu các component khác cũng dùng
// Hoặc đặt trong inviteFormTypes.ts như dự kiến ban đầu
export interface InvitedUserWithRole extends NguoiDungTimKiemItem {
  vaiTroDuKienSK?: string;
  ghiChuMoi?: string;
}

const InviteToEventPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<SuKienCoTheMoiItem | null>(
    null
  );
  const [usersToInvite, setUsersToInvite] = useState<InvitedUserWithRole[]>([]);
  const [isBulkInviteAttempt, setIsBulkInviteAttempt] = useState(false);
  const [currentBulkCriteria, setCurrentBulkCriteria] = useState<
    TieuChiMoiHangLoat | undefined
  >(undefined);
  // Lưu kết quả submit từ ReviewInvitesStep để có thể xử lý sau khi gửi (nếu cần)
  // Hiện tại chưa dùng, nhưng có thể hữu ích nếu muốn hiển thị thông báo tổng kết ở đây
  // const [submissionOutcome, setSubmissionOutcome] = useState<{ success: boolean, message?: string } | null>(null);

  const handleEventSelected = (event: SuKienCoTheMoiItem) => {
    setSelectedEvent(event);
    setCurrentStep(2);
    setUsersToInvite([]); // Reset danh sách mời khi chọn sự kiện mới
    // setSubmissionOutcome(null); // Reset kết quả submit
  };

  const handleUsersSelectedForInvite = (
    selectedUsers: InvitedUserWithRole[],
    isBulk: boolean = false, // Mặc định là mời cá nhân
    bulkCriteria?: TieuChiMoiHangLoat // Tiêu chí nếu là mời hàng loạt
  ) => {
    setUsersToInvite(selectedUsers);
    setIsBulkInviteAttempt(isBulk);
    setCurrentBulkCriteria(bulkCriteria);
    setCurrentStep(3);
  };

  const handleBackToUserSearch = (currentInvites: InvitedUserWithRole[]) => {
    setUsersToInvite(currentInvites);
    setCurrentStep(2);
    // setSubmissionOutcome(null);
  };

  const handleBackToEventSelection = () => {
    setSelectedEvent(null);
    setUsersToInvite([]);
    setCurrentStep(1);
    // setSubmissionOutcome(null);
  };

  const steps = [
    {
      id: 1,
      title: 'Chọn Sự Kiện',
      icon: ListChecks,
      description: 'Lựa chọn sự kiện cần gửi lời mời.',
    },
    {
      id: 2,
      title: 'Chọn Người Mời',
      icon: Users,
      description: 'Tìm kiếm và thêm người vào danh sách.',
    },
    {
      id: 3,
      title: 'Xem Lại & Gửi',
      icon: CheckCircle,
      description: 'Kiểm tra và xác nhận gửi lời mời.',
    },
  ];

  const pageVariants = {
    initial: { opacity: 0, x: currentStep === 1 ? 0 : -30 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 30 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <EventSelectionStep onEventSelected={handleEventSelected} />;
      case 2:
        if (!selectedEvent) {
          setCurrentStep(1);
          return null;
        }
        return (
          <UserSearchStep
            selectedEvent={selectedEvent}
            onUsersSelected={handleUsersSelectedForInvite}
            onBack={handleBackToEventSelection}
            initialUsersToInvite={usersToInvite}
          />
        );
      case 3:
        if (
          !selectedEvent ||
          (usersToInvite.length === 0 && currentStep === 3)
        ) {
          // Thêm kiểm tra currentStep để tránh lỗi loop
          toast.warning(
            'Chưa có ai trong danh sách mời. Vui lòng chọn người mời.'
          );
          setCurrentStep(2); // Quay lại bước chọn người
          return null;
        }
        return (
          <ReviewInvitesStep
            selectedEvent={selectedEvent!}
            usersToInvite={usersToInvite}
            isBulkInvite={isBulkInviteAttempt} // Truyền trạng thái
            bulkInviteCriteria={currentBulkCriteria} // Truyền tiêu chí
            onInvitationSent={handleBackToEventSelection}
            onBack={handleBackToUserSearch}
          />
        );
      default:
        return <EventSelectionStep onEventSelected={handleEventSelected} />;
    }
  };

  return (
    <DashboardLayout pageTitle="Gửi Lời Mời Tham Gia Sự Kiện">
      <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
        {/* Stepper UI - Nâng cấp */}
        <Card className="mb-8 shadow-lg border-border/70 dark:border-slate-700/70 bg-card h-32">
          <CardContent className="p-5 md:p-6">
            <nav aria-label="Progress">
              <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                  <li
                    key={step.title}
                    className={`relative flex-1 ${
                      stepIdx < steps.length - 1 ? 'pr-8 sm:pr-12' : ''
                    }`}
                  >
                    {currentStep > step.id ? (
                      // Completed Step
                      <>
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="h-1 w-full bg-primary dark:bg-ptit-blue transition-colors duration-300" />
                        </div>
                        <button
                          onClick={() => {
                            if (step.id === 1) handleBackToEventSelection();
                            // Chỉ cho phép quay lại bước 2 nếu đang ở bước 3 và có selectedEvent
                            if (
                              step.id === 2 &&
                              currentStep === 3 &&
                              selectedEvent
                            )
                              handleBackToUserSearch(usersToInvite);
                          }}
                          disabled={step.id >= currentStep} // Không cho click bước tương lai
                          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary dark:bg-ptit-blue hover:bg-primary/90 dark:hover:bg-ptit-blue/90 transition-colors"
                        >
                          <step.icon
                            className="h-5 w-5 text-primary-foreground dark:text-white"
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            {step.title} - Hoàn thành
                          </span>
                        </button>
                      </>
                    ) : currentStep === step.id ? (
                      // Current Step
                      <>
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="h-1 w-full bg-gray-200 dark:bg-slate-700" />
                        </div>
                        <div
                          className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary dark:border-ptit-blue bg-card shadow-md"
                          aria-current="step"
                        >
                          <step.icon
                            className="h-5 w-5 text-primary dark:text-ptit-blue"
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            {step.title} - Hiện tại
                          </span>
                        </div>
                      </>
                    ) : (
                      // Upcoming Step
                      <>
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="h-1 w-full bg-gray-200 dark:bg-slate-700" />
                        </div>
                        <div className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-card hover:border-gray-400 dark:border-slate-700 dark:hover:border-slate-500 transition-colors">
                          <step.icon
                            className="h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-slate-500 dark:group-hover:text-slate-400"
                            aria-hidden="true"
                          />
                          <span className="sr-only">
                            {step.title} - Sắp tới
                          </span>
                        </div>
                      </>
                    )}
                    {/* Line connector for larger screens */}
                    {stepIdx < steps.length - 1 ? (
                      <div
                        className="absolute inset-0 left-auto top-0 h-full w-px translate-x-[-50%] transform transition-colors duration-300 md:hidden"
                        aria-hidden="true"
                      >
                        <div
                          className={`h-full w-full ${
                            currentStep > step.id
                              ? 'bg-primary dark:bg-ptit-blue'
                              : 'bg-gray-200 dark:bg-slate-700'
                          }`}
                        />
                      </div>
                    ) : null}

                    <div className="absolute top-full pt-2 text-center w-max max-w-[100px] sm:max-w-[120px] transform -translate-x-1/2 left-1/2 px-1">
                      <p
                        className={`text-xs font-medium ${
                          currentStep === step.id
                            ? 'text-primary dark:text-ptit-blue'
                            : currentStep > step.id
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block truncate">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep} // Key thay đổi sẽ trigger animation
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={pageTransition}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default InviteToEventPage;
