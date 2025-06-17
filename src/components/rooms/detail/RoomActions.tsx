// src/components/rooms/detail/RoomActions.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useDeletePhong } from '@/hooks/queries/phongQueries';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { PhongDetailResponse } from '@/services/phong.service';

interface RoomActionsProps {
  phong: PhongDetailResponse;
}

export const RoomActions: React.FC<RoomActionsProps> = ({ phong }) => {
  const navigate = useNavigate();
  const { hasRole } = useRole();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deletePhongMutation = useDeletePhong({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      navigate('/facilities/rooms');
    },
  });

  const canEditRoom =
    hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG);
  const canDeleteRoom = hasRole(MaVaiTro.ADMIN_HE_THONG);

  const handleDeleteConfirm = () => {
    deletePhongMutation.mutate(phong.phongID);
  };

  if (!canEditRoom && !canDeleteRoom) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        {canDeleteRoom && (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deletePhongMutation.isPending}
          >
            {deletePhongMutation.isPending &&
            deletePhongMutation.variables === phong.phongID ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Xóa Phòng
          </Button>
        )}
      </div>

      {/* Dialog Xác Nhận Xóa Phòng */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> Xác Nhận Xóa Phòng
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa vĩnh viễn phòng:{' '}
              <strong className="text-foreground">
                {phong.tenPhong} ({phong.maPhong})
              </strong>
              ?
              <br />
              Hành động này không thể hoàn tác và sẽ xóa cả các thiết bị đã gán.
              Chỉ thực hiện nếu phòng không có lịch đặt hoặc lịch sử quan trọng
              cần giữ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Không, Hủy bỏ</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletePhongMutation.isPending}
            >
              {deletePhongMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Có, Xóa Phòng Này
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
