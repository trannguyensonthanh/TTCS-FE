// src/pages/MyInvitations/components/InvitationCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Users,
  MapPin,
  ArrowRight,
  Check,
  X,
  MessageSquare,
  Tag,
  Clock4,
} from 'lucide-react';
import { LoiMoiSuKienItem } from '@/services/invitationResponse.service';
import { formatDateRangeForDisplay } from '@/utils/dateTimeUtils';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface InvitationCardProps {
  invitation: LoiMoiSuKienItem;
  onRespondClick: () => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onRespondClick,
}) => {
  const {
    suKien,
    vaiTroDuKienSK,
    ghiChuMoi,
    isChapNhanMoi,
    tgMoi,
    nguoiGuiMoi,
  } = invitation;

  const getStatusBadge = () => {
    if (isChapNhanMoi === true) {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300 border-green-300 dark:border-green-600"
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          Đã chấp nhận
        </Badge>
      );
    }
    if (isChapNhanMoi === false) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300 border-red-300 dark:border-red-600"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Đã từ chối
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300 border-amber-300 dark:border-amber-600"
      >
        Chờ phản hồi
      </Badge>
    );
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl dark:border-slate-700/80 group transition-all duration-300 ease-in-out hover:border-primary dark:hover:border-ptit-blue">
      <CardHeader className="pb-3 pt-4 bg-muted/30 dark:bg-slate-800/50">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 dark:bg-ptit-blue/20 rounded-md">
              <Users className="h-6 w-6 text-primary dark:text-ptit-blue" />
            </div>
            <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary dark:group-hover:text-ptit-blue transition-colors">
              {suKien.tenSK}
            </CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        {suKien.loaiSuKien && (
          <Badge variant="outline" className="text-xs mt-1.5 w-fit">
            {suKien.loaiSuKien.tenLoaiSK}
          </Badge>
        )}
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Đơn vị tổ chức: {suKien.donViChuTri.tenDonVi}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2.5 text-sm">
        <div className="flex items-start">
          <CalendarDays className="mr-2.5 h-4 w-4 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            {formatDateRangeForDisplay(suKien.tgBatDauDK, suKien.tgKetThucDK)}
          </span>
        </div>
        {suKien.diaDiemDaXep && (
          <div className="flex items-start">
            <MapPin className="mr-2.5 h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{suKien.diaDiemDaXep}</span>
          </div>
        )}
        {vaiTroDuKienSK && (
          <div className="flex items-start">
            <Tag className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              <strong>Vai trò của bạn:</strong> {vaiTroDuKienSK}
            </span>
          </div>
        )}
        {ghiChuMoi && (
          <div className="flex items-start p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-700/50">
            <MessageSquare className="mr-2.5 h-4 w-4 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-amber-800 dark:text-amber-300 italic">
              {ghiChuMoi}
            </span>
          </div>
        )}
        {nguoiGuiMoi && (
          <p className="text-xs text-muted-foreground/80 pt-1 border-t border-dashed mt-2.5">
            Mời bởi: <strong>{nguoiGuiMoi.hoTen}</strong>
            {nguoiGuiMoi.donViCongTac && ` (${nguoiGuiMoi.donViCongTac})`}
          </p>
        )}
      </CardContent>

      <CardFooter className="border-t pt-3 pb-3 dark:border-slate-700/60">
        <Button
          onClick={onRespondClick}
          variant={isChapNhanMoi === null ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'w-full text-sm h-9',
            isChapNhanMoi === null &&
              'bg-primary hover:bg-primary/90 dark:bg-ptit-blue dark:hover:bg-ptit-blue/90 dark:text-white'
          )}
        >
          {isChapNhanMoi === null ? (
            <>
              Phản Hồi Ngay <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>Xem Chi Tiết Lời Mời</>
          )}
        </Button>
      </CardFooter>
      <div className="px-4 pb-3 text-xs text-muted-foreground/70 flex items-center justify-end">
        <Clock4 className="mr-1 h-3 w-3" />
        <span>
          Mời{' '}
          {tgMoi
            ? formatDistanceToNowStrict(parseISO(tgMoi), {
                addSuffix: true,
                locale: vi,
              })
            : ''}
        </span>
      </div>
    </Card>
  );
};
