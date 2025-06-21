// src/pages/Dashboard/components/PublicUpcomingEventsSection.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  AlertTriangle,
  CalendarSearch,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import { GetSuKienCongKhaiDashboardParams } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';
import { PublicUpcomingEventCard } from './PublicUpcomingEventCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicEventsList } from '@/hooks/queries/eventQueries';

const PublicUpcomingEventsSection: React.FC = () => {
  const params: GetSuKienCongKhaiDashboardParams = {
    limit: 6, // Lấy 6 sự kiện để hiển thị dạng grid 3 cột
    // sapDienRa: true, // Mặc định trong service/hook
    // chiCongKhaiNoiBo: true, // Mặc định trong service/hook
  };

  const {
    data: upcomingEvents,
    isLoading,
    isError,
    error,
  } = usePublicEventsList(params);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delay giữa các card
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <section id="public-upcoming-events-section">
      <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <CalendarSearch className="mr-2.5 h-5 w-5 text-primary dark:text-ptit-blue" />
              Sự Kiện Công Khai Sắp Diễn Ra
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Những sự kiện nổi bật dành cho mọi người trong thời gian tới.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="ml-auto text-xs sm:text-sm"
          >
            <Link to="/events-public">
              Xem Tất Cả <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          {isError && (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi Tải Sự Kiện</AlertTitle>
              <AlertDescription>
                {(error as APIError)?.body?.message ||
                  (error as Error)?.message}
              </AlertDescription>
            </Alert>
          )}
          {!isLoading &&
            !isError &&
            (!upcomingEvents || upcomingEvents.items.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="mx-auto h-16 w-16 mb-4 text-gray-400 opacity-70" />
                <p className="text-lg font-medium">
                  Chưa có sự kiện công khai nào sắp diễn ra.
                </p>
                <p className="text-sm mt-1">Vui lòng kiểm tra lại sau.</p>
              </div>
            )}
          {!isLoading &&
            !isError &&
            upcomingEvents &&
            upcomingEvents.items.length > 0 && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {upcomingEvents.items.map((event) => (
                  <motion.div key={event.suKienID} variants={itemVariants}>
                    <PublicUpcomingEventCard event={event} />
                  </motion.div>
                ))}
              </motion.div>
            )}
        </CardContent>
      </Card>
    </section>
  );
};

export default PublicUpcomingEventsSection;
