// src/pages/Dashboard/components/PublicUpcomingEventCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Building2,
  Award,
  Activity,
  Clock,
} from 'lucide-react';
import { SuKienCongKhaiDashboardItem } from '@/services/dashboard.service';
import { formatDateRangeForDisplay } from '@/utils/dateTimeUtils'; // Giả sử đã có
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PublicUpcomingEventCardProps {
  event: SuKienCongKhaiDashboardItem;
}

const getEventIconForCard = (loaiSK?: string | null) => {
  const loai = loaiSK?.toLowerCase();
  if (
    loai?.includes('hội thảo') ||
    loai?.includes('hội nghị') ||
    loai?.includes('workshop')
  )
    return Award;
  if (
    loai?.includes('văn nghệ') ||
    loai?.includes('văn hóa') ||
    loai?.includes('âm nhạc')
  )
    return Activity; // Hoặc Music2
  if (loai?.includes('tuyển dụng') || loai?.includes('việc làm')) return Users;
  if (loai?.includes('thể thao')) return Award; // Hoặc một icon thể thao
  return CalendarDays;
};

const formatRelativeDate = (dateString: string) => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Hôm nay';
  if (isTomorrow(date)) return 'Ngày mai';
  return format(date, 'EEEE, dd/MM', { locale: vi }); // Thứ, ngày/tháng
};

export const PublicUpcomingEventCard: React.FC<
  PublicUpcomingEventCardProps
> = ({ event }) => {
  const EventIcon = getEventIconForCard(event.loaiSuKien?.tenLoaiSK);

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out group dark:border-slate-700/60 bg-card hover:border-primary/30 dark:hover:border-ptit-blue/30">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-1">
          <Badge
            variant="outline"
            className="text-xs font-medium border-primary/50 text-primary dark:border-ptit-blue/50 dark:text-ptit-blue"
          >
            {event.loaiSuKien?.tenLoaiSK || 'Sự kiện'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(event.tgBatDauDK)}
          </span>
        </div>
        <CardTitle className="text-md font-semibold leading-snug line-clamp-2 group-hover:text-primary dark:group-hover:text-ptit-blue transition-colors h-[2.75em]">
          <Link
            to={`/events-public/${event.suKienID}`}
            className="hover:underline"
          >
            {' '}
            {/* Link tới trang chi tiết sự kiện công khai */}
            {event.tenSK}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex-grow space-y-1.5 text-sm">
        <div className="flex items-center text-xs text-muted-foreground">
          <Building2 className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <span>{event.donViChuTri.tenDonVi}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <span>
            {format(parseISO(event.tgBatDauDK), 'HH:mm', { locale: vi })} -{' '}
            {format(parseISO(event.tgKetThucDK), 'HH:mm', { locale: vi })}
          </span>
        </div>
        {event.diaDiemToChucDaXep && (
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <span>{event.diaDiemToChucDaXep}</span>
          </div>
        )}
      </CardContent>
      {/* <CardFooter className="p-3 border-t dark:border-slate-700/50">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-full text-xs h-8 text-primary hover:bg-primary/5 hover:text-primary dark:text-ptit-blue dark:hover:bg-ptit-blue/10 dark:hover:text-ptit-blue"
        >
          <Link to={`/events-public/${event.suKienID}`}>
       
           
            Xem Chi Tiết <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter> */}
    </Card>
  );
};
