// src/components/rooms/detail/RoomBookingHistoryTable.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  CalendarClock,
  ExternalLink,
  Info,
  Loader2,
  ListX,
} from 'lucide-react';
import {
  format,
  parseISO,
  isBefore,
  isAfter,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isValid,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { PaginatedLichDatPhongResponse } from '@/services/lichDatPhong.service';

// Helper (có thể đưa ra utils)
const formatDateForHistory = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Ngày không hợp lệ';
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch (e) {
    return 'Ngày không hợp lệ';
  }
};

const getBookingStatusBadge = (
  startDateStr?: string,
  endDateStr?: string
): React.ReactNode => {
  if (!startDateStr || !endDateStr)
    return <Badge variant="outline">Chưa rõ</Badge>;
  try {
    const now = new Date();
    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);
    if (!isValid(startDate) || !isValid(endDate))
      return <Badge variant="outline">Lỗi ngày</Badge>;

    if (isBefore(now, startDate))
      return (
        <Badge
          variant="outline"
          className="bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300 border-sky-300 dark:border-sky-600"
        >
          Sắp tới
        </Badge>
      );
    if (isWithinInterval(now, { start: startDate, end: endDate }))
      return (
        <Badge
          variant="destructive"
          className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300 border-amber-300 dark:border-amber-600"
        >
          Đang diễn ra
        </Badge>
      );
    if (isAfter(now, endDate))
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300 border-green-300 dark:border-green-600"
        >
          Đã hoàn thành
        </Badge>
      );
  } catch (e) {
    return <Badge variant="outline">Lỗi ngày</Badge>;
  }
  return <Badge variant="secondary">Khác</Badge>;
};

interface RoomBookingHistoryTableProps {
  paginatedBookings?: PaginatedLichDatPhongResponse | null;
  isLoading: boolean;
  isFetching?: boolean; // Để biết khi nào đang fetch lại
  onPageChange: (page: number) => void;
}

export const RoomBookingHistoryTable: React.FC<
  RoomBookingHistoryTableProps
> = ({ paginatedBookings, isLoading, isFetching, onPageChange }) => {
  const bookings = paginatedBookings?.items || [];
  const totalPages = paginatedBookings?.totalPages || 1;
  const currentPage = paginatedBookings?.currentPage || 1;

  if (isLoading && !bookings.length && !isFetching) {
    return (
      <div className="space-y-2 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <ListX className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
        <p className="text-sm">Không có lịch sử đặt phòng nào được tìm thấy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border dark:border-slate-700/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 dark:bg-slate-800/30 hover:bg-muted/40 dark:hover:bg-slate-800/40">
              <TableHead className="px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[35%]">
                Tên Sự Kiện
              </TableHead>
              <TableHead className="px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">
                Đơn Vị Tổ Chức
              </TableHead>
              <TableHead className="px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">
                Thời Gian Sử Dụng
              </TableHead>
              <TableHead className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                Trạng Thái
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow
                key={booking.datPhongID}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-sm"
              >
                <TableCell className="font-medium py-2.5 px-3 align-top">
                  <Link
                    to={`/events/${booking.suKienID}`}
                    className="hover:underline text-primary dark:text-ptit-red group"
                  >
                    {booking.tenSK}
                    <ExternalLink className="inline-block ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                </TableCell>
                <TableCell className="py-2.5 px-3 text-muted-foreground align-top">
                  {booking.donViToChuc.tenDonVi}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-muted-foreground align-top">
                  {formatDateForHistory(booking.tgNhanPhongTT)} -{' '}
                  {formatDateForHistory(booking.tgTraPhongTT)}
                </TableCell>
                <TableCell className="text-center py-2.5 px-3 align-top">
                  {getBookingStatusBadge(
                    booking.tgNhanPhongTT,
                    booking.tgTraPhongTT
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isFetching}
        />
      )}
    </div>
  );
};
