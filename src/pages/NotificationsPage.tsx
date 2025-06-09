import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import DashboardLayout from '@/components/DashboardLayout'; // Hoặc một Layout chung nếu trang này không thuộc dashboard
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useAllMyNotifications, // Hook mới để lấy tất cả thông báo
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/queries/notificationQueries';
import {
  GetAllMyNotificationsParams,
  ThongBaoResponse,
  PaginatedNotificationsResponse,
} from '@/services/notification.service'; // Hoặc từ types/thongbao.types.ts
import LoaiThongBao from '@/enums/LoaiThongBao.enum'; // Enum loại thông báo
import { motion } from 'framer-motion'; // Thêm framer-motion để tạo hiệu ứng chuyển động
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox'; // Nếu muốn có action chọn nhiều để đánh dấu đã đọc
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Search,
  Filter,
  BellRing,
  Inbox,
  CheckCheck,
  MailOpen,
  CircleSlash,
  Settings2,
  CalendarCheck2,
  Info,
  AlertTriangle,
  Trash2,
  Eye,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext'; // Mặc dù trang này có thể không cần phân quyền phức tạp
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATION_QUERY_KEYS } from '@/hooks/queries/notificationQueries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

// Helper để lấy icon dựa trên loại thông báo (tương tự NotificationBell)
const getNotificationIcon = (
  loaiThongBao?: string,
  sizeClass = 'h-5 w-5'
): React.ReactNode => {
  switch (loaiThongBao) {
    case LoaiThongBao.SU_KIEN_MOI_CHO_DUYET_BGH:
    case LoaiThongBao.YC_HUY_SK_MOI_CHO_BGH:
    case LoaiThongBao.YC_PHONG_MOI_CHO_CSVC:
      return <MailOpen className={cn(sizeClass, 'text-amber-500')} />;
    case LoaiThongBao.SU_KIEN_DA_DUYET_BGH:
    case LoaiThongBao.YC_PHONG_DA_DUYET_CSVC:
    case LoaiThongBao.YC_HUY_SK_DA_DUYET:
      return <CheckCheck className={cn(sizeClass, 'text-green-500')} />;
    case LoaiThongBao.SU_KIEN_BI_TU_CHOI_BGH:
    case LoaiThongBao.YC_PHONG_BI_TU_CHOI_CSVC:
    case LoaiThongBao.YC_HUY_SK_BI_TU_CHOI:
      return <XCircle className={cn(sizeClass, 'text-destructive')} />; // Sử dụng XCircle cho nhất quán
    case LoaiThongBao.CSVC_YEU_CAU_CHINH_SUA_YCPCT: // Thêm từ yêu cầu chỉnh sửa
    case LoaiThongBao.BGH_YEU_CAU_CHINH_SUA_SK: // Thêm từ yêu cầu chỉnh sửa
      return <AlertTriangle className={cn(sizeClass, 'text-orange-500')} />;
    case LoaiThongBao.SK_SAP_DIEN_RA:
      return <CalendarCheck2 className={cn(sizeClass, 'text-indigo-500')} />;
    case LoaiThongBao.THONG_BAO_CHUNG:
    default:
      return <Info className={cn(sizeClass, 'text-muted-foreground')} />;
  }
};

const NotificationsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filterParams, setFilterParams] = useState<GetAllMyNotificationsParams>(
    {
      page: 1,
      limit: 15,
      sortBy: 'NgayTaoTB',
      sortOrder: 'desc',
    }
  );
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterDaDoc, setFilterDaDoc] = useState<string | undefined>(undefined); // 'true', 'false', or undefined
  const [filterLoaiTB, setFilterLoaiTB] = useState<string | undefined>(
    undefined
  );

  const {
    data: paginatedNotifications,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
  } = useAllMyNotifications(filterParams, {
    enabled: isAuthenticated, // Chỉ fetch khi đã đăng nhập
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead({
    onSuccess: () => {
      // Invalidate query để cập nhật lại số lượng chưa đọc và trạng thái các item
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.allMyNotifications(),
      });
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.myNotificationsSummary(),
      }); // Cập nhật bell
    },
  });

  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined,
      daDoc:
        filterDaDoc === 'all'
          ? undefined
          : filterDaDoc === 'true'
          ? true
          : filterDaDoc === 'false'
          ? false
          : undefined,
      loaiThongBao: filterLoaiTB === 'all' ? undefined : filterLoaiTB,
      page: 1,
    }));
  }, [debouncedSearchTerm, filterDaDoc, filterLoaiTB]);

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNotificationClick = (notification: ThongBaoResponse) => {
    if (!notification.daDocTB) {
      markAsReadMutation.mutate(notification.thongBaoID);
    }
    if (notification.duongDanLienQuan) {
      navigate(notification.duongDanLienQuan);
    }
  };

  const handleMarkAllReadClick = () => {
    if (
      paginatedNotifications &&
      paginatedNotifications.totalUnread &&
      paginatedNotifications.totalUnread > 0
    ) {
      markAllAsReadMutation.mutate();
    } else {
      toast.info('Không có thông báo chưa đọc nào.');
    }
  };

  const notifications = paginatedNotifications?.items || [];
  const totalPages = paginatedNotifications?.totalPages || 1;
  const currentPage = paginatedNotifications?.currentPage || 1;
  const totalUnread = paginatedNotifications?.totalUnread || 0;

  if (!isAuthenticated && !isLoading) {
    // Chuyển hướng nếu chưa đăng nhập và không phải đang loading ban đầu
    navigate('/login', { replace: true });
    return null;
  }

  if (isLoading && !notifications.length && !isFetching) {
    return (
      <DashboardLayout pageTitle="Thông Báo Của Bạn">
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Tất Cả Thông Báo"
      headerActions={
        totalUnread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllReadClick}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
            )}
            Đánh dấu tất cả đã đọc ({totalUnread})
          </Button>
        )
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card className="shadow-xl border-border dark:border-slate-700">
          <CardHeader className="border-b dark:border-slate-700">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BellRing className="h-6 w-6 text-primary dark:text-ptit-red" />
              Trung Tâm Thông Báo
            </CardTitle>
            <CardDescription>
              Xem lại tất cả các thông báo và cập nhật quan trọng từ hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
              <div className="lg:col-span-1">
                <Label
                  htmlFor="search-notification"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Tìm kiếm thông báo
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-notification"
                    type="search"
                    placeholder="Nội dung, sự kiện liên quan..."
                    className="pl-10 h-10 rounded-md shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor="filter-read-status"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Trạng thái đọc
                </Label>
                <Select
                  value={filterDaDoc}
                  onValueChange={(value) =>
                    setFilterDaDoc(value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger
                    id="filter-read-status"
                    className="h-10 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="false">Chưa đọc</SelectItem>
                    <SelectItem value="true">Đã đọc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="filter-notification-type"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Loại thông báo
                </Label>
                <Select
                  value={filterLoaiTB}
                  onValueChange={(value) =>
                    setFilterLoaiTB(value === 'all' ? undefined : value)
                  }
                >
                  <SelectTrigger
                    id="filter-notification-type"
                    className="h-10 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Tất cả loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {Object.entries(LoaiThongBao).map(([key, value]) => (
                      <SelectItem key={key} value={value as string}>
                        {String(value)
                          .replace(/_/g, ' ')
                          .toLocaleLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isFetching && !notifications.length ? (
              <div className="text-center py-10">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : !isLoading && notifications.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg dark:border-slate-700">
                <Inbox className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-xl font-semibold">
                  Hộp thư thông báo trống!
                </p>
                <p className="mt-2 text-sm">
                  Hiện tại không có thông báo nào phù hợp với bộ lọc của bạn.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-28rem)] md:h-[calc(100vh-25rem)] border rounded-lg dark:border-slate-800">
                {' '}
                {/* Điều chỉnh chiều cao */}
                <div className="divide-y dark:divide-slate-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.thongBaoID}
                      className={cn(
                        'flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 dark:hover:bg-slate-800/60 transition-colors',
                        !notification.daDocTB &&
                          'bg-primary/5 dark:bg-sky-900/30 border-l-4 border-primary dark:border-sky-500'
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mt-1 text-muted-foreground">
                        {getNotificationIcon(
                          notification.loaiThongBao,
                          'h-6 w-6'
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <h4
                            className={cn(
                              'text-sm font-semibold leading-snug line-clamp-1',
                              !notification.daDocTB &&
                                'text-primary dark:text-sky-400'
                            )}
                          >
                            {notification.tenSuKienLienQuan ||
                              notification.loaiThongBao?.replace(/_/g, ' ') ||
                              'Thông báo hệ thống'}
                          </h4>
                          <span
                            className={cn(
                              'text-xs text-muted-foreground whitespace-nowrap ml-2',
                              !notification.daDocTB && 'font-medium'
                            )}
                          >
                            {formatDistanceToNow(
                              parseISO(notification.ngayTaoTB),
                              { addSuffix: true, locale: vi }
                            )}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'text-sm text-muted-foreground line-clamp-2 mt-0.5',
                            !notification.daDocTB &&
                              'text-foreground dark:text-slate-300'
                          )}
                        >
                          {notification.noiDungTB}
                        </p>
                      </div>
                      {!notification.daDocTB && (
                        <div className="ml-auto flex-shrink-0 self-center pl-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-primary dark:bg-sky-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {paginatedNotifications && totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading || isFetching}
                className="mt-6"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
