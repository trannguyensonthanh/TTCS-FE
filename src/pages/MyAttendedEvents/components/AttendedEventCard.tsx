// src/pages/MyAttendedEvents/components/AttendedEventCard.tsx
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
  MapPin,
  Star,
  Edit2,
  CheckCircle,
  Award,
  Activity,
  Clock4,
} from 'lucide-react';
import { SuKienDaThamGiaItem } from '@/services/eventRating.service';
import { formatDateRangeForDisplay } from '@/utils/dateTimeUtils';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';
import { parseISO } from 'date-fns';

interface AttendedEventCardProps {
  eventItem: SuKienDaThamGiaItem;
  onRateClick: () => void; // Mở dialog đánh giá/sửa đánh giá
}

export const AttendedEventCard: React.FC<AttendedEventCardProps> = ({
  eventItem,
  onRateClick,
}) => {
  const { danhGiaCuaToi, coTheDanhGia, trangThaiSuKien } = eventItem;
  console.log('AttendedEventCard', eventItem);
  const getEventStatusBadge = () => {
    switch (trangThaiSuKien.maTrangThai) {
      case 'HOAN_THANH':
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300"
          >
            <CheckCircle className="mr-1 h-3.5 w-3.5" />
            Hoàn thành
          </Badge>
        );
      case 'DA_HUY':
        return <Badge variant="destructive">Đã hủy</Badge>;
      case 'DANG_DIEN_RA':
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/10 animate-pulse"
          >
            Đang diễn ra
          </Badge>
        );
      case 'SAP_DIEN_RA':
        return (
          <Badge
            variant="outline"
            className="border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10"
          >
            Sắp diễn ra
          </Badge>
        );
      default:
        return <Badge variant="outline">{trangThaiSuKien.tenTrangThai}</Badge>;
    }
  };

  const getEventIcon = (loaiSK?: string | null) => {
    const loai = loaiSK?.toLowerCase();
    if (loai?.includes('hội thảo') || loai?.includes('hội nghị')) return Award;
    if (loai?.includes('văn nghệ') || loai?.includes('văn hóa'))
      return Activity;
    return CalendarDays;
  };
  const EventIcon = getEventIcon(eventItem.loaiSuKien?.tenLoaiSK);

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg dark:border-slate-700/70 group transition-shadow duration-300">
      <CardHeader className="pb-3 pt-4 bg-muted/20 dark:bg-slate-800/40">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-1.5 bg-primary/10 dark:bg-ptit-blue/15 rounded-md">
              <EventIcon className="h-5 w-5 text-primary dark:text-ptit-blue" />
            </div>
            <CardTitle className="text-md font-semibold leading-tight line-clamp-2 group-hover:text-primary dark:group-hover:text-ptit-blue transition-colors">
              {eventItem.tenSK}
            </CardTitle>
          </div>
          {getEventStatusBadge()}
        </div>
        {eventItem.loaiSuKien && (
          <Badge variant="outline" className="text-xs mt-2 w-fit">
            {eventItem.loaiSuKien.tenLoaiSK}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-grow space-y-2.5 text-sm p-4">
        <div className="flex items-start">
          <CalendarDays className="mr-2 h-4 w-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground">
            {formatDateRangeForDisplay(eventItem.tgBatDau, eventItem.tgKetThuc)}
          </span>
        </div>
        {eventItem.diaDiemDaXep && (
          <div className="flex items-start">
            <MapPin className="mr-2 h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-muted-foreground">
              {eventItem.diaDiemDaXep}
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground/80">
          Đơn vị tổ chức: {eventItem.donViChuTri.tenDonVi}
        </p>

        {danhGiaCuaToi && (
          <div className="mt-3 pt-2 border-t border-dashed dark:border-slate-700">
            <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="mr-1.5 h-4 w-4" /> Bạn đã đánh giá sự kiện
              này.
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              <span>Nội dung: {danhGiaCuaToi.diemNoiDung}/5, </span>
              <span>Tổ chức: {danhGiaCuaToi.diemToChuc}/5, </span>
              <span>Địa điểm: {danhGiaCuaToi.diemDiaDiem}/5</span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-0.5">
              Lúc:{' '}
              {format(parseISO(danhGiaCuaToi.tgDanhGia), 'dd/MM/yyyy HH:mm', {
                locale: vi,
              })}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t pt-3 pb-3 px-4 dark:border-slate-700/60">
        {coTheDanhGia && !danhGiaCuaToi && (
          <Button
            onClick={onRateClick}
            size="sm"
            className="w-full bg-amber-500 hover:bg-amber-600 text-amber-foreground"
          >
            <Star className="mr-2 h-4 w-4" /> Gửi Đánh Giá
          </Button>
        )}
        {danhGiaCuaToi && ( // Giả sử cho phép sửa đánh giá (API 1.3)
          <Button
            onClick={onRateClick}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Edit2 className="mr-2 h-4 w-4" /> Xem/Sửa Đánh Giá
          </Button>
        )}
        {!coTheDanhGia &&
          !danhGiaCuaToi &&
          trangThaiSuKien.maTrangThai === 'HOAN_THANH' && (
            <p className="text-xs text-muted-foreground text-center w-full">
              Đã quá hạn đánh giá.
            </p>
          )}
        {trangThaiSuKien.maTrangThai !== 'HOAN_THANH' &&
          trangThaiSuKien.maTrangThai !== 'DA_HUY' &&
          !coTheDanhGia && (
            <p className="text-xs text-muted-foreground text-center w-full">
              Sự kiện chưa kết thúc để đánh giá.
            </p>
          )}
      </CardFooter>
    </Card>
  );
};
