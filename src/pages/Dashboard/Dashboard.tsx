// src/pages/Dashboard/Dashboard.tsx
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  CalendarDays,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIconLucide,
  AlertTriangle,
  Newspaper,
  ShieldCheck,
  Activity,
  TrendingUp,
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard'; // Đảm bảo đường dẫn đúng
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import {
  useDashboardCongKhaiKpi,
  // useLichSuDungPhongCongKhai,
  useThongBaoCongKhaiNoiBat,
  // Import các hook khác nếu Dashboard này cũng hiển thị một phần thống kê của các role khác
} from '@/hooks/queries/dashboardQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { APIError } from '@/services/apiHelper';
import {
  GetLichSuDungPhongCongKhaiParams,
  KhungGioPhongBanItem,
  GetDashboardCongKhaiKpiParams,
} from '@/services/dashboard.service';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Import các component con cho các section
import PublicUpcomingEventsSection from './components/PublicUpcomingEventsSection';
// import RoomUsageCalendarOverview from './components/RoomUsageCalendarOverview';
import AnnouncementsSection from './components/AnnouncementsSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const defaultKpiTimeRange: GetDashboardCongKhaiKpiParams['thoiGian'] =
  'SAP_TOI_7_NGAY';

const defaultCalendarRange: DateRange = {
  from: new Date(),
  to: addDays(new Date(), 6),
};

export default function Dashboard() {
  const { user } = useAuth();

  const [calendarToaNhaId, setCalendarToaNhaId] = useState<string | undefined>(
    undefined
  );
  const [calendarDateRange, setCalendarDateRange] =
    useState<DateRange>(defaultCalendarRange);

  // --- API Calls ---
  const {
    data: kpiData,
    isLoading: isLoadingKpi,
    isError: isErrorKpi,
    error: errorKpi, // Đổi tên error để tránh trùng lặp
  } = useDashboardCongKhaiKpi({ thoiGian: defaultKpiTimeRange });

  const roomUsageParams = useMemo(
    (): GetLichSuDungPhongCongKhaiParams => ({
      tuNgay: calendarDateRange.from
        ? format(calendarDateRange.from, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      denNgay: calendarDateRange.to
        ? format(calendarDateRange.to, 'yyyy-MM-dd')
        : format(addDays(new Date(), 6), 'yyyy-MM-dd'),
      toaNhaID: calendarToaNhaId ? parseInt(calendarToaNhaId) : undefined,
    }),
    [calendarDateRange, calendarToaNhaId]
  );

  // --- Helper Functions ---
  const renderKpiCard = (
    title: string,
    value?: string | number | null,
    description?: string,
    icon?: React.ReactNode,
    isLoadingFlag = isLoadingKpi,
    link?: string
  ) => {
    const cardContent = (
      <DashboardCard
        title={title}
        value={value ?? (isLoadingFlag ? '' : 'N/A')} // Hiển thị rỗng khi loading thay vì N/A
        description={description}
        icon={icon}
        className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card h-full flex flex-col"
      />
    );

    if (isLoadingFlag) {
      return (
        <Card className="shadow-sm animate-pulse h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-3/4" />
            </CardTitle>
            {icon && <Skeleton className="h-5 w-5 rounded-sm" />}
          </CardHeader>
          <CardContent className="pt-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-3 w-full mt-2" />
          </CardContent>
        </Card>
      );
    }

    return link ? (
      <Link to={link} className="block h-full">
        {cardContent}
      </Link>
    ) : (
      <div className="h-full">{cardContent}</div>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Chào đêm khuya';
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // --- Main Render ---
  return (
    <DashboardLayout pageTitle="Bảng Điều Khiển Tổng Quan">
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'circOut' }}
      >
        {/* Welcome Message */}
        <div className="pb-2 border-b dark:border-slate-700/60">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()},{' '}
            <span className="text-primary dark:text-ptit-red">
              {user?.hoTen || 'Bạn'}
            </span>
            !
          </h1>
          <p className="text-md text-muted-foreground mt-1.5">
            Đây là thông tin tổng quan về hoạt động sự kiện và cơ sở vật chất
            của trường.
          </p>
        </div>

        {/* KPI Cards Section */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-indigo-500" />
            Số Liệu Nổi Bật
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {renderKpiCard(
              'Sự Kiện Sắp Tới',
              kpiData?.suKienSapDienRa,
              `Trong ${
                defaultKpiTimeRange === 'SAP_TOI_7_NGAY'
                  ? '7 ngày'
                  : defaultKpiTimeRange.toLowerCase().replace('_', ' ')
              } tới`,
              <CalendarDays className="text-blue-500" />,
              isLoadingKpi,
              '/events-public?filter=upcoming' // Example link
            )}
            {renderKpiCard(
              'Sự Kiện Đang Diễn Ra',
              kpiData?.suKienDangDienRa,
              'Tại thời điểm hiện tại',
              <Activity className="text-green-500" />,
              isLoadingKpi,
              '/events-public?filter=ongoing' // Example link
            )}
            {renderKpiCard(
              'Phòng Đang Trống',
              kpiData?.tongSoPhongKhaDung,
              'Sẵn sàng cho đặt lịch',
              <ShieldCheck className="text-teal-500" />,
              isLoadingKpi,
              '/rooms-explorer?status=available' // Example link
            )}
            {renderKpiCard(
              kpiData?.tinTucMoiNhat?.tieuDe || 'Thông Báo Chung',
              kpiData?.tinTucMoiNhat?.tieuDe ? '' : 'Xem tất cả',
              kpiData?.tinTucMoiNhat?.tieuDe
                ? `Nhấn để xem chi tiết tin: "${kpiData.tinTucMoiNhat.tieuDe}"`
                : 'Xem các thông báo mới nhất',
              <Newspaper className="text-purple-500" />,
              isLoadingKpi, // Giả sử tin tức đã được gộp trong KPI
              kpiData?.tinTucMoiNhat?.link || '/notifications' // Link tới chi tiết tin hoặc trang tất cả thông báo
            )}
          </div>
          {isErrorKpi && (
            <Alert variant="destructive" className="mt-4 shadow-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi Tải Thông Số Tổng Quan</AlertTitle>
              <AlertDescription>
                {(errorKpi as APIError)?.body?.message ||
                  (errorKpi as Error)?.message ||
                  'Vui lòng thử lại sau.'}
              </AlertDescription>
            </Alert>
          )}
        </section>

        <Separator className="my-6 md:my-8" />

        {/* Public Upcoming Events Section */}
        <PublicUpcomingEventsSection />

        {/* <Separator className="my-6 md:my-8" /> */}

        {/* Room Usage Overview Section */}
        {/* <RoomUsageCalendarOverview
          data={roomUsageOverviewData as KhungGioPhongBanItem[] | undefined}
          isLoading={isLoadingRoomUsageOverview}
          isError={isErrorRoomUsageOverview}
          error={errorRoomUsageOverview}
          selectedToaNhaId={calendarToaNhaId}
          onToaNhaChange={setCalendarToaNhaId}
          // Thêm props để điều khiển date range cho calendar nếu muốn
          // initialDateRange={calendarDateRange}
          // onDateRangeChange={setCalendarDateRange}
        /> */}

        {/* Announcements Section (Có thể gộp vào KPI Card hoặc để riêng nếu nhiều) */}
        {/* Nếu API KPI đã có tin mới nhất, section riêng này có thể hiển thị nhiều tin hơn */}
        <>
          <Separator className="my-6 md:my-8" />
          <AnnouncementsSection />
        </>
      </motion.div>
    </DashboardLayout>
  );
}
