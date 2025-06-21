// src/pages/Dashboard/components/UpcomingEventsTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  AlertTriangle,
  CalendarPlus,
  MapPin,
  Users,
  User,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { SuKienSapDienRaDashboardItem } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UpcomingEventsTableProps {
  data: SuKienSapDienRaDashboardItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
}

const UpcomingEventsTable: React.FC<UpcomingEventsTableProps> = ({
  data,
  isLoading,
  isError,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-destructive text-center p-4">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        Lỗi tải sự kiện sắp tới.
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-muted-foreground text-center p-4 italic">
        Không có sự kiện nào sắp diễn ra.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[370px] rounded-md border dark:border-slate-700">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm dark:bg-slate-800/90">
          <TableRow>
            <TableHead className="min-w-[200px] font-semibold">
              Tên Sự Kiện
            </TableHead>
            <TableHead className="font-semibold">Thời Gian</TableHead>
            <TableHead className="font-semibold">Địa Điểm</TableHead>
            <TableHead className="text-center font-semibold">
              Tham Dự (ĐK/DK)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((event) => (
            <TableRow
              key={event.suKienID}
              className="hover:bg-accent/50 dark:hover:bg-slate-800/50"
            >
              <TableCell>
                <p className="font-medium text-primary dark:text-ptit-blue line-clamp-2">
                  {event.tenSK}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.donViChuTri.tenDonVi}
                </p>
              </TableCell>
              <TableCell className="text-xs">
                <div className="flex items-center">
                  <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  {format(parseISO(event.tgBatDauDK), 'HH:mm', {
                    locale: vi,
                  })}{' '}
                  -{' '}
                  {format(parseISO(event.tgKetThucDK), 'HH:mm', { locale: vi })}
                </div>
                <div className="flex items-center mt-0.5">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  {format(parseISO(event.tgBatDauDK), 'dd/MM/yyyy', {
                    locale: vi,
                  })}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="mr-1.5 h-3.5 w-3.5 text-green-500" />{' '}
                  {event.diaDiemDaXep || 'Chưa xếp'}
                </div>
              </TableCell>
              <TableCell className="text-center text-xs">
                <Badge
                  variant={
                    (event.soNguoiDaChapNhanMoi || 0) >=
                    (event.slThamDuDK || Infinity) * 0.9
                      ? 'destructive'
                      : (event.soNguoiDaChapNhanMoi || 0) >=
                        (event.slThamDuDK || Infinity) * 0.7
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {event.soNguoiDaChapNhanMoi || 0} /{' '}
                  {event.slThamDuDK || 'N/A'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default UpcomingEventsTable;
