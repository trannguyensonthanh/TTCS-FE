import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  MailOpen,
  CircleSlash,
  Settings2,
  CalendarCheck2,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton'; // Thêm Skeleton
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  useMyNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/queries/notificationQueries';
import { ThongBaoResponse } from '@/services/notification.service';
import LoaiThongBao from '@/enums/LoaiThongBao.enum'; // Import hằng số Loại Thông Báo
import { Badge } from '@/components/ui/badge';

// Helper để lấy icon dựa trên loại thông báo
const getNotificationIcon = (loaiThongBao?: string): React.ReactNode => {
  switch (loaiThongBao) {
    case LoaiThongBao.SU_KIEN_MOI_CHO_DUYET_BGH:
    case LoaiThongBao.YC_HUY_SK_MOI_CHO_BGH:
      return <MailOpen className="h-4 w-4 text-amber-500" />;
    case LoaiThongBao.SU_KIEN_DA_DUYET_BGH:
    case LoaiThongBao.YC_PHONG_DA_DUYET_CSVC:
    case LoaiThongBao.YC_HUY_SK_DA_DUYET:
      return <CheckCheck className="h-4 w-4 text-green-500" />;
    case LoaiThongBao.SU_KIEN_BI_TU_CHOI_BGH:
    case LoaiThongBao.YC_PHONG_BI_TU_CHOI_CSVC:
    case LoaiThongBao.YC_HUY_SK_BI_TU_CHOI:
      return <X className="h-4 w-4 text-destructive" />;
    case LoaiThongBao.YC_PHONG_MOI_CHO_CSVC:
      return <Settings2 className="h-4 w-4 text-blue-500" />;
    case LoaiThongBao.SK_SAP_DIEN_RA:
      return <CalendarCheck2 className="h-4 w-4 text-indigo-500" />;
    case LoaiThongBao.THONG_BAO_CHUNG:
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: notificationsData,
    isLoading,
    refetch: refetchNotifications,
  } = useMyNotifications(
    { limit: 7, chiChuaDoc: true }, // Lấy 7 thông báo chưa đọc gần nhất, hoặc nhiều hơn nếu không đủ 7
    { enabled: isAuthenticated } // Chỉ fetch khi đã đăng nhập
  );

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead({
    onSuccess: () => {
      // Không cần refetch ngay vì query chính sẽ tự refetch theo interval hoặc khi window focus
      // Hoặc có thể refetch ngay nếu muốn: refetchNotifications();
    },
  });

  const notifications = notificationsData?.items || [];
  const totalUnread = notificationsData?.totalUnread || 0;

  useEffect(() => {
    // Có thể refetch khi dropdown mở ra nếu muốn cập nhật ngay lập tức
    if (isAuthenticated && isOpen) {
      refetchNotifications();
    }
  }, [isOpen, isAuthenticated, refetchNotifications]);

  const handleNotificationClick = (notification: ThongBaoResponse) => {
    if (!notification.daDocTB) {
      markAsReadMutation.mutate(notification.thongBaoID);
    }
    if (notification.duongDanLienQuan) {
      navigate(notification.duongDanLienQuan);
    }
    setIsOpen(false); // Đóng dropdown sau khi click
  };

  const handleMarkAllAsRead = () => {
    if (totalUnread > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return null; // Không hiển thị chuông nếu chưa đăng nhập
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive" // Sử dụng variant destructive cho nổi bật
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </Badge>
          )}
          <span className="sr-only">Mở thông báo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96 " align="end" sideOffset={8}>
        <DropdownMenuLabel className="flex justify-between items-center px-3 py-2">
          <span className="font-semibold text-base">Thông Báo</span>
          {totalUnread > 0 && (
            <Button
              variant="link"
              size="sm"
              className="text-xs h-auto py-0.5 px-1 text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn dropdown đóng lại
                handleMarkAllAsRead();
              }}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Đánh dấu tất cả đã đọc'
              )}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[calc(100vh-200px)] md:max-h-[400px] overflow-auto">
          {' '}
          {/* Giới hạn chiều cao */}
          <DropdownMenuGroup>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start p-3 space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Bạn không có thông báo mới.
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.thongBaoID}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer transition-colors data-[highlighted]:bg-accent',
                    !notification.daDocTB && 'bg-primary/5 dark:bg-primary/10'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  // onSelect={(e) => e.preventDefault()} // Ngăn dropdown đóng khi click item (nếu không điều hướng)
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.loaiThongBao)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p
                      className={cn(
                        'text-sm font-medium leading-tight truncate',
                        !notification.daDocTB &&
                          'text-primary dark:text-sky-400'
                      )}
                    >
                      {notification.tenSuKienLienQuan ||
                        notification.loaiThongBao ||
                        'Thông báo mới'}
                    </p>
                    <p
                      className={cn(
                        'text-xs text-muted-foreground line-clamp-2 mt-0.5',
                        !notification.daDocTB && 'dark:text-slate-400'
                      )}
                    >
                      {notification.noiDungTB}
                    </p>
                    <p
                      className={cn(
                        'text-xs text-muted-foreground/80 mt-1',
                        !notification.daDocTB && 'dark:text-slate-500'
                      )}
                    >
                      {formatDistanceToNow(parseISO(notification.ngayTaoTB), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
                  {!notification.daDocTB && (
                    <div className="ml-auto flex-shrink-0 self-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    </div>
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center text-center text-primary cursor-pointer h-10 data-[highlighted]:bg-accent"
              onClick={() => {
                navigate('/notifications'); // Trang xem tất cả thông báo
                setIsOpen(false);
              }}
            >
              Xem tất cả thông báo
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
