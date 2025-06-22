// src/pages/MyInvitations/components/RespondToInvitationDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Check, X, Info, Send } from 'lucide-react';
import {
  LoiMoiSuKienItem,
  PhanHoiLoiMoiPayload,
} from '@/services/invitationResponse.service';
import { useRespondToInvitation } from '@/hooks/queries/invitationResponseQueries';
import { formatDateRangeForDisplay } from '@/utils/dateTimeUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { APIError } from '@/services/apiHelper';
import { Label } from '@/components/ui/label';

interface RespondToInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: LoiMoiSuKienItem | null;
  onCloseDialog: (responded: boolean) => void; // Callback khi dialog đóng, true nếu đã gửi phản hồi
}

const RespondToInvitationDialog: React.FC<RespondToInvitationDialogProps> = ({
  open,
  onOpenChange,
  invitation,
  onCloseDialog,
}) => {
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');
  const [showLyDoInput, setShowLyDoInput] = useState(false);

  const respondMutation = useRespondToInvitation({
    onSuccess: () => {
      // onCloseDialog(true) sẽ được gọi trong handleSubmitResponse để đảm bảo nó chạy sau khi mutation thành công
    },
    // onError đã được xử lý trong hook
  });

  const handleSubmitResponse = async (chapNhan: boolean) => {
    if (!invitation) return;

    const payload: PhanHoiLoiMoiPayload = {
      chapNhan,
      lyDoTuChoi:
        !chapNhan && showLyDoInput ? lyDoTuChoi.trim() || null : undefined,
    };
    if (chapNhan) {
      delete payload.lyDoTuChoi;
    }

    try {
      await respondMutation.mutateAsync({
        moiThamGiaID: invitation.moiThamGiaID,
        payload,
      });
      onCloseDialog(true); // Gọi callback sau khi mutation thành công
    } catch (e) {
      // Lỗi đã được toast bởi hook, không cần toast lại ở đây
      // onCloseDialog(false); // Không đóng dialog nếu có lỗi để user thử lại hoặc xem lỗi
      console.error('Error responding to invitation:', e);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Không gọi onCloseDialog ở đây vì nó sẽ được gọi bởi handleSubmitResponse
    // hoặc khi người dùng chủ động đóng bằng nút "Đóng" / X
    // Tuy nhiên, để đảm bảo reset state khi mở lại, nên gọi onCloseDialog(false)
    // nếu dialog bị đóng mà không phải do submit thành công
    if (!respondMutation.isSuccess) {
      onCloseDialog(false);
    }
    setShowLyDoInput(false);
    setLyDoTuChoi('');
  };

  if (!invitation) return null;

  const { suKien, vaiTroDuKienSK, ghiChuMoi, isChapNhanMoi, nguoiGuiMoi } =
    invitation;
  const daPhanHoi = isChapNhanMoi !== null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pr-6">
          {' '}
          {/* pr-6 để không bị che bởi nút X */}
          <DialogTitle className="text-xl md:text-2xl font-bold">
            {daPhanHoi
              ? 'Chi Tiết Lời Mời Tham Gia Sự Kiện'
              : 'Bạn Được Mời Tham Gia Sự Kiện'}
          </DialogTitle>
          <DialogDescription>{suKien.tenSK}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-6 -mr-6 pl-1 py-2">
          {' '}
          {/* Thêm padding cho scrollbar */}
          <div className="space-y-4 text-sm">
            {nguoiGuiMoi && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700/50">
                <p className="text-blue-700 dark:text-blue-300">
                  <Info className="inline h-4 w-4 mr-1.5 align-text-bottom" />
                  Lời mời từ: <strong>{nguoiGuiMoi.hoTen}</strong>
                  {nguoiGuiMoi.donViCongTac && ` (${nguoiGuiMoi.donViCongTac})`}
                  .
                </p>
              </div>
            )}

            <p>
              <strong>Thời gian:</strong>{' '}
              {formatDateRangeForDisplay(suKien.tgBatDauDK, suKien.tgKetThucDK)}
            </p>
            {suKien.diaDiemDaXep && (
              <p>
                <strong>Địa điểm:</strong> {suKien.diaDiemDaXep}
              </p>
            )}
            <p>
              <strong>Đơn vị tổ chức:</strong> {suKien.donViChuTri.tenDonVi}
            </p>
            {suKien.loaiSuKien && (
              <p>
                <strong>Loại sự kiện:</strong> {suKien.loaiSuKien.tenLoaiSK}
              </p>
            )}

            {vaiTroDuKienSK && (
              <p className="mt-2 pt-2 border-t border-dashed">
                <strong>Vai trò dự kiến của bạn:</strong>{' '}
                <Badge variant="secondary">{vaiTroDuKienSK}</Badge>
              </p>
            )}
            {ghiChuMoi && (
              <p className="mt-2 text-muted-foreground italic bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                <strong>Ghi chú từ người mời:</strong> {ghiChuMoi}
              </p>
            )}

            {daPhanHoi && (
              <div className="mt-4 pt-3 border-t">
                <h4 className="font-semibold mb-1">Phản hồi của bạn:</h4>
                {isChapNhanMoi ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 text-white text-base px-3 py-1"
                  >
                    <Check className="mr-2 h-5 w-5" /> Đã Chấp Nhận Tham Gia
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-base px-3 py-1">
                    <X className="mr-2 h-5 w-5" /> Đã Từ Chối Tham Gia
                  </Badge>
                )}
                {/* Thêm hiển thị lý do từ chối nếu có */}
              </div>
            )}

            {!daPhanHoi && showLyDoInput && (
              <div className="mt-3 space-y-1">
                <Label
                  htmlFor="lyDoTuChoiInput"
                  className="text-sm font-medium"
                >
                  Lý do từ chối ( ):
                </Label>
                <Textarea
                  id="lyDoTuChoiInput"
                  value={lyDoTuChoi}
                  onChange={(e) => setLyDoTuChoi(e.target.value)}
                  placeholder="Nhập lý do bạn không thể tham gia..."
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background pb-1 -mx-1">
          {!daPhanHoi ? (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showLyDoInput) {
                    // Nếu đang hiển thị input lý do và nhấn Từ chối lần nữa
                    handleSubmitResponse(false);
                  } else {
                    // Lần đầu nhấn Từ chối
                    setShowLyDoInput(true);
                    toast.info(
                      'Vui lòng cho biết lý do từ chối (nếu có) rồi nhấn Từ chối lần nữa, hoặc nhấn Chấp Nhận.'
                    );
                  }
                }}
                disabled={respondMutation.isPending}
                className="min-w-[120px]"
              >
                {respondMutation.isPending &&
                  respondMutation.variables?.payload.chapNhan === false && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                <X className="mr-2 h-4 w-4" /> Từ Chối
              </Button>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                onClick={() => handleSubmitResponse(true)}
                disabled={respondMutation.isPending}
              >
                {respondMutation.isPending &&
                  respondMutation.variables?.payload.chapNhan === true && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                <Check className="mr-2 h-4 w-4" /> Chấp Nhận
              </Button>
            </>
          ) : (
            <DialogClose asChild>
              <Button variant="outline" onClick={() => onCloseDialog(false)}>
                Đóng
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RespondToInvitationDialog;
