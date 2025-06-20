// src/pages/Invitations/components/ReviewInvitesStep.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  ArrowLeft,
  Send,
  CheckCircle,
  Info,
  User,
  Tag,
  MessageSquare,
  AlertTriangle,
  XCircle,
  UsersRound,
} from 'lucide-react';
import { SuKienCoTheMoiItem } from '@/services/event.service';
import { InvitedUserWithRole } from '../InviteToEventPage';
import {
  useGuiLoiMoiCaNhan,
  useGuiLoiMoiHangLoat,
} from '@/hooks/queries/inviteQueries'; // Import cả hai hook
import {
  MoiThamGiaPayloadItem,
  GuiLoiMoiHangLoatPayload,
  MoiThamGiaResultItem,
  TieuChiMoiHangLoat,
} from '@/services/invite.service';
import { APIError } from '@/services/apiHelper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/stringUtils';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

interface ReviewInvitesStepProps {
  selectedEvent: SuKienCoTheMoiItem;
  usersToInvite: InvitedUserWithRole[]; // Nếu isBulkInvite, mảng này chỉ chứa 1 item đại diện
  isBulkInvite?: boolean;
  bulkInviteCriteria?: TieuChiMoiHangLoat; // Dùng TieuChiMoiHangLoat từ service
  onInvitationSent: () => void;
  onBack: (currentInvites: InvitedUserWithRole[]) => void;
}

export const ReviewInvitesStep: React.FC<ReviewInvitesStepProps> = ({
  selectedEvent,
  usersToInvite,
  isBulkInvite,
  bulkInviteCriteria,
  onInvitationSent,
  onBack,
}) => {
  const [submissionResults, setSubmissionResults] = useState<
    MoiThamGiaResultItem[] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state isSubmitting chung

  const commonMutationOptions = {
    onSettled: () => {
      setIsSubmitting(false);
    },
    onError: (error: APIError) => {
      // Toast đã được xử lý trong hook, ở đây có thể log thêm hoặc xử lý UI chung
      console.error('Mutation error in ReviewInvitesStep:', error);
      setSubmissionResults([
        {
          nguoiDuocMoiID: -1,
          status: 'error' as const,
          message:
            error.body?.message ||
            error.message ||
            'Lỗi không xác định khi gửi mời.',
        },
      ]);
    },
  };

  const guiLoiMoiCaNhanMutation = useGuiLoiMoiCaNhan(selectedEvent.suKienID, {
    ...commonMutationOptions,
    onSuccess: (data) => {
      setSubmissionResults(data.results || []);
      // Check if all individual invites were successful
      const allSuccess = data.results?.every((r) => r.status === 'success');
      if (allSuccess && data.results && data.results.length > 0) {
        // toast.success(`Đã gửi thành công ${data.results.length} lời mời cá nhân.`);
        // onInvitationSent(); // Chỉ gọi khi không có lỗi nào và thực sự có gửi mời
      } else if (
        data.results &&
        data.results.some((r) => r.status === 'error')
      ) {
        toast.warning(
          `Có lỗi xảy ra với một số lời mời. Vui lòng kiểm tra chi tiết.`
        );
      }
    },
  });

  const guiLoiMoiHangLoatMutation = useGuiLoiMoiHangLoat(
    selectedEvent.suKienID,
    {
      ...commonMutationOptions,
      onSuccess: (data) => {
        if (data.jobId) {
          setSubmissionResults([
            {
              nguoiDuocMoiID: -1,
              status: 'success',
              message: `Yêu cầu mời hàng loạt đã được tiếp nhận (Job ID: ${data.jobId}). Hệ thống đang xử lý.`,
            },
          ]);
          // onInvitationSent(); // Coi như thành công khi job đã được tạo
        } else {
          setSubmissionResults(
            data.results || [
              { nguoiDuocMoiID: -1, status: 'success', message: data.message },
            ]
          );
          // if (data.soLuongMoiThanhCong && data.soLuongMoiThanhCong > 0 && (data.soLuongMoiLoi === 0 || !data.soLuongMoiLoi) ) {
          //   onInvitationSent();
          // }
        }
      },
    }
  );

  const handleSubmitInvitations = () => {
    setIsSubmitting(true);
    setSubmissionResults(null);

    if (isBulkInvite && bulkInviteCriteria) {
      const payload: GuiLoiMoiHangLoatPayload = {
        loaiDoiTuongMoi: 'THEO_TIEU_CHI',
        tieuChiMoi: bulkInviteCriteria,
        vaiTroDuKienSK: usersToInvite[0]?.vaiTroDuKienSK || 'Người tham dự',
        ghiChuMoiChung: usersToInvite[0]?.ghiChuMoi || null,
      };
      guiLoiMoiHangLoatMutation.mutate(payload);
    } else {
      const payload: MoiThamGiaPayloadItem[] = usersToInvite.map((user) => ({
        nguoiDuocMoiID: user.nguoiDungID,
        vaiTroDuKienSK: user.vaiTroDuKienSK || null,
        ghiChuMoi: user.ghiChuMoi || null,
      }));
      guiLoiMoiCaNhanMutation.mutate(payload);
    }
  };

  const totalInvites = usersToInvite.length;
  const successfulInvitesCount =
    submissionResults?.filter((r) => r.status === 'success').length || 0;
  const failedInvitesCount =
    submissionResults?.filter((r) => r.status === 'error').length || 0;

  const isProcessCompleted =
    guiLoiMoiCaNhanMutation.isSuccess || guiLoiMoiHangLoatMutation.isSuccess;
  const allInvitesSuccessful =
    isProcessCompleted &&
    failedInvitesCount === 0 &&
    successfulInvitesCount > 0;
  // Trường hợp mời hàng loạt tạo job thành công cũng coi là "all successful" cho UI
  const bulkJobCreatedSuccessfully =
    isProcessCompleted &&
    guiLoiMoiHangLoatMutation.data?.jobId &&
    failedInvitesCount === 0;

  const getResultItemClass = (status?: 'success' | 'error' | 'skipped') => {
    if (status === 'success')
      return 'border-green-400 bg-green-50 dark:bg-green-900/30 dark:border-green-600/70';
    if (status === 'error')
      return 'border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-600/70';
    return 'border-border dark:border-slate-700';
  };

  if (allInvitesSuccessful || bulkJobCreatedSuccessfully) {
    return (
      <Card className="shadow-xl border-green-500 dark:border-green-600">
        <CardHeader className="text-center items-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-3" />
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            {guiLoiMoiHangLoatMutation.data?.jobId
              ? 'Yêu Cầu Mời Hàng Loạt Đã Được Gửi'
              : 'Gửi Lời Mời Thành Công!'}
          </CardTitle>
          <CardDescription className="text-base mt-1">
            {guiLoiMoiHangLoatMutation.data?.jobId
              ? `Hệ thống đang xử lý việc gửi ${
                  guiLoiMoiHangLoatMutation.data?.tongSoNguoiDuKienMoi ||
                  'nhiều'
                } lời mời cho sự kiện "${selectedEvent.tenSK}".`
              : `Đã gửi thành công ${successfulInvitesCount} lời mời tham gia sự kiện "${selectedEvent.tenSK}".`}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {guiLoiMoiHangLoatMutation.data?.jobId
            ? 'Bạn có thể theo dõi trạng thái xử lý của job nếu hệ thống hỗ trợ.'
            : 'Người dùng sẽ nhận được thông báo mời. Bạn có thể xem danh sách người đã mời trong trang quản lý sự kiện.'}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-6">
          <Button
            onClick={onInvitationSent}
            variant="default"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            Hoàn Tất & Mời Cho Sự Kiện Khác
          </Button>
          {/* Optionally, add a button to view the event's invitation list */}
          {/* <Button variant="outline" onClick={() => navigate(`/events/${selectedEvent.suKienID}/invited-list`)}>Xem Danh Sách Đã Mời</Button> */}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-border/70 dark:border-slate-700/70">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Bước 3: Xem Lại Danh Sách và Gửi Lời Mời
        </CardTitle>
        <CardDescription>
          Kiểm tra lại thông tin những người bạn sắp mời tham gia sự kiện{' '}
          <strong className="text-primary dark:text-ptit-blue">
            {selectedEvent.tenSK}
          </strong>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {submissionResults && (
          <Alert
            variant={
              failedInvitesCount > 0
                ? 'destructive'
                : successfulInvitesCount > 0
                ? 'default'
                : 'default'
            }
            className="shadow-md border-2"
          >
            <Info
              className={cn(
                'h-5 w-5',
                failedInvitesCount > 0
                  ? 'text-destructive'
                  : 'text-primary dark:text-ptit-blue'
              )}
            />
            <AlertTitle
              className={cn(
                'font-semibold',
                failedInvitesCount > 0
                  ? 'text-destructive'
                  : 'text-primary dark:text-ptit-blue'
              )}
            >
              Kết Quả Gửi Lời Mời
            </AlertTitle>
            <AlertDescription>
              Đã xử lý{' '}
              {isBulkInvite &&
              usersToInvite.length === 1 &&
              usersToInvite[0].nguoiDungID === -1
                ? 'yêu cầu mời hàng loạt'
                : `${totalInvites} lời mời cá nhân`}
              :
              <span className="font-medium text-green-600 dark:text-green-400">
                {' '}
                {successfulInvitesCount} thành công
              </span>
              ,
              <span className="font-medium text-red-600 dark:text-red-400">
                {' '}
                {failedInvitesCount} thất bại
              </span>
              .
              {failedInvitesCount > 0 &&
                ' Xem chi tiết lỗi bên dưới cho từng mục.'}
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[400px] md:h-[450px] border rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/30">
          <div className="p-2 md:p-3 space-y-3">
            {isBulkInvite &&
            usersToInvite.length === 1 &&
            usersToInvite[0].nguoiDungID === -1 ? (
              // Display for Bulk Invite Summary
              <Card
                className={cn(
                  'p-4 shadow-md border',
                  submissionResults &&
                    submissionResults.length > 0 &&
                    getResultItemClass(submissionResults[0].status)
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-primary/10 rounded-full dark:bg-ptit-blue/20">
                    <UsersRound className="h-10 w-10 text-primary dark:text-ptit-blue" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-foreground text-lg">
                      {usersToInvite[0].hoTen}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-0.5 italic">
                      {usersToInvite[0].thongTinThem}
                    </p>

                    {usersToInvite[0].vaiTroDuKienSK && (
                      <div className="mt-2.5 flex items-center text-sm text-foreground">
                        <Tag className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="font-medium">Vai trò dự kiến:</span>
                        {usersToInvite[0].vaiTroDuKienSK}
                      </div>
                    )}
                    {usersToInvite[0].ghiChuMoi && (
                      <div className="mt-1.5 flex items-start text-sm text-foreground">
                        <MessageSquare className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium">Ghi chú chung:</span>
                          <span className="italic text-muted-foreground whitespace-pre-wrap break-words">
                            {usersToInvite[0].ghiChuMoi}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {submissionResults && submissionResults.length > 0 && (
                    <div className="shrink-0 ml-2 text-center self-center p-2">
                      {submissionResults[0].status === 'success' ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                {submissionResults &&
                  submissionResults.length > 0 &&
                  submissionResults[0].status === 'error' &&
                  submissionResults[0].message && (
                    <p className="mt-2.5 text-sm text-destructive bg-red-100 dark:bg-red-900/40 p-2 rounded-md border border-red-300 dark:border-red-700">
                      <AlertTriangle className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                      Lỗi: {submissionResults[0].message}
                    </p>
                  )}
                {submissionResults &&
                  submissionResults.length > 0 &&
                  submissionResults[0].status === 'success' && (
                    <div className="mt-2.5 text-sm">
                      {guiLoiMoiHangLoatMutation.data?.jobId && (
                        <p className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md border border-blue-300 dark:border-blue-600">
                          <Info className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                          Job ID: {guiLoiMoiHangLoatMutation.data.jobId}. Hệ
                          thống đang xử lý...
                        </p>
                      )}
                      {guiLoiMoiHangLoatMutation.data?.tongSoNguoiDuKienMoi !==
                        undefined && (
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          Số lượng người dự kiến được mời:{' '}
                          {guiLoiMoiHangLoatMutation.data.tongSoNguoiDuKienMoi}
                        </p>
                      )}
                    </div>
                  )}
              </Card>
            ) : (
              // Display for Individual Invites
              usersToInvite.map((user, index) => {
                const resultItem = submissionResults?.find(
                  (r) => r.nguoiDuocMoiID === user.nguoiDungID
                );
                return (
                  <Card
                    key={user.nguoiDungID}
                    className={cn(
                      'p-3 shadow-sm border',
                      resultItem && getResultItemClass(resultItem.status)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0 border">
                        <AvatarImage
                          src={user.anhDaiDien || undefined}
                          alt={user.hoTen}
                        />
                        <AvatarFallback className="text-base">
                          {getInitials(user.hoTen)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="font-semibold text-foreground">
                          {user.hoTen}{' '}
                          <span className="text-xs text-muted-foreground">
                            ({user.maDinhDanh})
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          {user.thongTinThem}
                        </p>
                        {user.vaiTroDuKienSK && (
                          <p className="mt-1 text-xs">
                            <strong>Vai trò:</strong> {user.vaiTroDuKienSK}
                          </p>
                        )}
                        {user.ghiChuMoi && (
                          <p className="mt-0.5 text-xs italic text-gray-600 dark:text-gray-400">
                            <strong>Ghi chú:</strong> {user.ghiChuMoi}
                          </p>
                        )}
                      </div>
                      {resultItem && (
                        <div className="shrink-0 ml-2 text-center self-center p-1">
                          {resultItem.status === 'success' ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                    {resultItem &&
                      resultItem.status === 'error' &&
                      resultItem.message && (
                        <p className="mt-2 text-xs text-destructive bg-red-100 dark:bg-red-900/30 p-1.5 rounded-md">
                          Lỗi: {resultItem.message}
                        </p>
                      )}
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onBack(usersToInvite)}
            disabled={
              isSubmitting || allInvitesSuccessful || bulkJobCreatedSuccessfully
            }
            className="w-full sm:w-auto h-11 text-base"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Sửa Danh Sách
          </Button>

          {!(allInvitesSuccessful || bulkJobCreatedSuccessfully) && (
            <Button
              onClick={handleSubmitInvitations}
              disabled={isSubmitting || usersToInvite.length === 0}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white h-11 text-base px-6"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              {isSubmitting
                ? 'Đang Gửi...'
                : `Xác Nhận Gửi ${
                    isBulkInvite
                      ? 'Hàng Loạt'
                      : usersToInvite.length + ' Lời Mời'
                  }`}
              {!isSubmitting && <Send className="ml-2 h-5 w-5" />}
            </Button>
          )}
        </div>

        {isProcessCompleted &&
          (failedInvitesCount > 0 ||
            (guiLoiMoiHangLoatMutation.data?.jobId &&
              successfulInvitesCount > 0 &&
              !bulkJobCreatedSuccessfully)) && (
            <div className="mt-4 text-center space-x-3">
              <Button
                onClick={onInvitationSent}
                variant="outline"
                className="h-10"
              >
                Hoàn Tất & Mời Sự Kiện Khác
              </Button>
              {failedInvitesCount > 0 &&
                !guiLoiMoiHangLoatMutation.data?.jobId && (
                  <Button
                    onClick={handleSubmitInvitations}
                    disabled={isSubmitting}
                    className="h-10"
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Thử Gửi Lại Các Lời Mời Lỗi
                  </Button>
                )}
            </div>
          )}
      </CardContent>
    </Card>
  );
};
