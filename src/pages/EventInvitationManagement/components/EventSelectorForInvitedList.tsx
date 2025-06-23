// src/pages/EventInvitationManagement/components/EventSelectorForInvitedList.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Search,
  AlertTriangle,
  Check,
  ListChecks,
} from 'lucide-react';
import {
  PaginatedEventsWithInvitationsResponse,
  SuKienCoLoiMoiItem,
} from '@/services/eventInvitationManagement.service';
import { APIError } from '@/services/apiHelper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EventSelectorForInvitedListProps {
  paginatedEvents?: PaginatedEventsWithInvitationsResponse;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
  selectedEventId?: number;
  onEventSelect: (event: SuKienCoLoiMoiItem | null) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const EventSelectorForInvitedList: React.FC<
  EventSelectorForInvitedListProps
> = ({
  paginatedEvents,
  isLoading,
  isError,
  error,
  selectedEventId,
  onEventSelect,
  searchTerm,
  onSearchTermChange,
  currentPage,
  onPageChange,
}) => {
  const events = paginatedEvents?.items || [];
  const totalPages = paginatedEvents?.totalPages || 1;

  if (isLoading && events.length === 0) {
    // Chỉ hiện loading to nếu chưa có data
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Đang tải danh sách sự kiện...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border/70 dark:border-slate-700/70">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold flex items-center">
          <ListChecks className="mr-3 h-6 w-6 text-primary dark:text-ptit-blue" />
          Chọn Sự Kiện Để Xem Danh Sách Mời
        </CardTitle>
        <div className="relative mt-2 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm tên sự kiện..."
            className="pl-10 h-10 text-sm"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isError && (
          <div className="text-destructive p-4 bg-red-50 dark:bg-red-900/30 rounded-md text-center">
            <AlertTriangle className="inline h-5 w-5 mr-2" />
            Lỗi tải danh sách sự kiện:{' '}
            {(error as APIError)?.body?.message || (error as Error)?.message}
          </div>
        )}
        {!isLoading && !isError && events.length === 0 && (
          <p className="text-muted-foreground italic text-center py-8">
            Không tìm thấy sự kiện nào đã gửi lời mời.
          </p>
        )}
        {events.length > 0 && (
          <ScrollArea className="h-[250px] md:h-[300px] -mx-2">
            {' '}
            {/* -mx để ScrollArea không bị co lại bởi padding của CardContent */}
            <div className="space-y-2 px-2">
              {events.map((event) => (
                <Button
                  key={event.suKienID}
                  variant={
                    selectedEventId === event.suKienID ? 'default' : 'outline'
                  }
                  className={cn(
                    'w-full justify-start text-left h-auto py-2.5 px-3 flex items-center gap-3 transition-all',
                    selectedEventId === event.suKienID &&
                      'bg-primary text-primary-foreground dark:bg-ptit-blue dark:text-white ring-2 ring-primary/50 dark:ring-ptit-blue/60'
                  )}
                  onClick={() => onEventSelect(event)}
                >
                  {selectedEventId === event.suKienID && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {event.tenSK}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.donViChuTri.tenDonVi} -{' '}
                      {format(parseISO(event.tgBatDauDK), 'dd/MM/yy', {
                        locale: vi,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Trạng thái SK:{' '}
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {event.trangThaiSK.tenTrangThai}
                      </Badge>
                      <span className="mx-1.5">·</span>
                      Đã mời:{' '}
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {event.tongSoLuotMoi}
                      </Badge>
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <ReusablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              isLoading={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventSelectorForInvitedList;
