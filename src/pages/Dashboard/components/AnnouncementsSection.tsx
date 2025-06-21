/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard/components/AnnouncementsSection.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  AlertTriangle,
  Newspaper,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useThongBaoCongKhaiNoiBat } from '@/hooks/queries/dashboardQueries';
import {
  GetThongBaoCongKhaiParams,
  ThongBaoChungItem,
} from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

// interface AnnouncementsSectionProps {
//   // Props có thể thêm sau này nếu cần filter hoặc tùy chỉnh số lượng
// }

const AnnouncementsSection: React.FC<any> = () => {
  const params: GetThongBaoCongKhaiParams = {
    limit: 5, // Lấy 5 thông báo/tin tức mới nhất
  };

  const {
    data: announcements,
    isLoading,
    isError,
    error,
  } = useThongBaoCongKhaiNoiBat(params);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 120,
      },
    },
  };

  return (
    <section id="announcements-section">
      <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <Newspaper className="mr-2.5 h-5 w-5 text-primary dark:text-ptit-blue" />
              Thông Báo & Tin Tức Nổi Bật
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Cập nhật những thông tin quan trọng và mới nhất từ nhà trường.
            </CardDescription>
          </div>
          {/* Có thể thêm nút "Xem tất cả tin tức" nếu có trang riêng */}
          {/* <Button variant="outline" size="sm" asChild className="ml-auto text-xs sm:text-sm">
            <Link to="/all-announcements">
              Xem Tất Cả <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button> */}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3 py-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-3 border rounded-md animate-pulse"
                >
                  <Skeleton className="h-8 w-8 rounded-md mt-1" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {isError && (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi Tải Thông Báo</AlertTitle>
              <AlertDescription>
                {(error as APIError)?.body?.message ||
                  (error as Error)?.message}
              </AlertDescription>
            </Alert>
          )}
          {!isLoading &&
            !isError &&
            (!announcements || announcements.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Newspaper className="mx-auto h-16 w-16 mb-4 text-gray-400 opacity-70" />
                <p className="text-lg font-medium">
                  Hiện chưa có thông báo nào.
                </p>
              </div>
            )}
          {!isLoading &&
            !isError &&
            announcements &&
            announcements.length > 0 && (
              <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {announcements.map((item) => (
                  <motion.div key={item.thongBaoID} variants={itemVariants}>
                    <Link
                      to={item.duongDanChiTiet}
                      className="block p-3 rounded-lg border bg-card hover:bg-accent dark:border-slate-700/80 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                        <h4 className="text-sm font-semibold text-primary dark:text-ptit-blue group-hover:underline line-clamp-2">
                          {item.tieuDe}
                        </h4>
                        {item.loaiThongBaoHienThi && (
                          <Badge
                            variant="secondary"
                            className="text-xs mt-1 sm:mt-0 whitespace-nowrap"
                          >
                            {item.loaiThongBaoHienThi}
                          </Badge>
                        )}
                      </div>
                      {item.tomTat && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                          {item.tomTat}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/80">
                        Đăng ngày:{' '}
                        {format(parseISO(item.ngayDang), 'dd/MM/yyyy HH:mm', {
                          locale: vi,
                        })}
                      </p>
                    </Link>
                  </motion.div>
                ))}
                {announcements.length >= (params.limit || 5) && ( // Chỉ hiển thị nếu có khả năng còn nhiều hơn
                  <div className="pt-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-primary dark:text-ptit-blue hover:underline"
                    >
                      <Link to="/notifications">
                        {' '}
                        {/* Hoặc trang tin tức nếu có */}
                        Xem tất cả thông báo{' '}
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
        </CardContent>
      </Card>
    </section>
  );
};

export default AnnouncementsSection;
