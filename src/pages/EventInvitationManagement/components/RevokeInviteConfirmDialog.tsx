// src/pages/EventInvitationManagement/components/RevokeInviteConfirmDialog.tsx
import React from 'react';
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
import { Loader2, AlertTriangle, UserX } from 'lucide-react';
import { NguoiDuocMoiChiTietItem } from '@/services/eventInvitationManagement.service'; // Hoặc từ invite.service

interface RevokeInviteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: NguoiDuocMoiChiTietItem | null;
  onConfirm: () => void;
  isPending: boolean;
}

const RevokeInviteConfirmDialog: React.FC<RevokeInviteConfirmDialogProps> = ({
  open,
  onOpenChange,
  invitation,
  onConfirm,
  isPending,
}) => {
  if (!invitation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Xác Nhận Thu Hồi Lời Mời
          </DialogTitle>
          <DialogDescription className="pt-2">
            Bạn có chắc chắn muốn thu hồi lời mời đã gửi đến{' '}
            <strong className="text-foreground">
              {invitation.nguoiDuocMoi.hoTen}
            </strong>{' '}
            tham gia sự kiện này không?
            <br />
            Hành động này không thể hoàn tác nếu người dùng chưa phản hồi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-5">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Hủy Bỏ
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <UserX className="mr-2 h-4 w-4" />
            Thu Hồi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevokeInviteConfirmDialog;
