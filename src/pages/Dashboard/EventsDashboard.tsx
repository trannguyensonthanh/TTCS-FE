/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard/EventsDashboard.tsx
import React, { useState, useMemo, Suspense } from 'react'; // Thêm Suspense nếu dùng React.lazy
import DashboardLayout from '@/components/DashboardLayout';
import {
  CalendarDays,
  Clock,
  Users,
  Star,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIconLucide,
  ListFilter,
  CalendarRange,
  Loader2,
  AlertTriangle,
  FileText,
  Users2,
  CalendarCheck2,
  CheckCircle,
  XSquare,
  Clock8,
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { addMonths, startOfYear, endOfYear, format } from 'date-fns';
import {
  useSuKienKpi,
  useThongKeSuKienTheoThoiGian,
  useSuKienSapDienRaDashboard,
  useYeuCauChoXuLyCuaToi,
  useThongKeSuKienTheoLoai,
  useThongKeDanhGiaSuKien,
} from '@/hooks/queries/dashboardQueries';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DonViListItem } from '@/services/donVi.service';
import { useDonViList } from '@/hooks/queries/donViQueries';
import { useAuth } from '@/context/AuthContext';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import { cn } from '@/lib/utils';
import { APIError } from '@/services/apiHelper';
import { GetThongKeDanhGiaSuKienParams } from '@/services/dashboard.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react'; // Đã có Search từ UserFilters nhưng import lại cho rõ ràng
import { useDebounce } from '@/hooks/useDebounce';

// Import các component con (giả sử chúng nằm trong ./components/)
import EventOverviewChart from './components/EventOverviewChart';
import UpcomingEventsTable from './components/UpcomingEventsTable';
import PendingRequestsTable from './components/PendingRequestsTable';
import EventCategoryPieChart from './components/EventCategoryPieChart';
import EventCategoryBarChart from './components/EventCategoryBarChart';
import EventSatisfactionChart from './components/EventSatisfactionChart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/DateRangePicker';

const defaultDateRange: DateRange = {
  from: startOfYear(new Date()), // Mặc định từ đầu năm nay
  to: new Date(), // Đến ngày hiện tại
};

const ITEMS_PER_PAGE_TABLES = 5; // Số item cho bảng upcoming/pending

export default function EventsDashboard() {
  const { user, hasRole } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultDateRange
  );
  const [selectedDonViIdKpi, setSelectedDonViIdKpi] = useState<
    string | undefined
  >(undefined); // Filter cho KPI và các chart

  // State riêng cho filter của tab "Tổng Quan Theo Thời Gian"
  const [overviewChartTimeUnit, setOverviewChartTimeUnit] = useState<
    'THANG' | 'TUAN' | 'QUY'
  >('THANG');

  // State riêng cho filter của tab "Mức Độ Hài Lòng"
  const [satisfactionChartCriteria, setSatisfactionChartCriteria] = useState<
    'TONG_QUAT' | 'NOI_DUNG' | 'TO_CHUC' | 'DIA_DIEM'
  >('TONG_QUAT');

  const getDonViFilterForApi = (): number | undefined => {
    if (
      hasRole(MaVaiTro.ADMIN_HE_THONG) ||
      hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG)
    ) {
      return selectedDonViIdKpi ? parseInt(selectedDonViIdKpi) : undefined;
    }
    // CBTCISK có thể chỉ xem đơn vị của mình, hoặc chọn từ danh sách được phép
    // Ví dụ:
    // const cbtciSKRole = user?.vaiTroChucNang.find(vt => vt.maVaiTro === MaVaiTro.CB_TO_CHUC_SU_KIEN);
    // if (cbtciSKRole && cbtciSKRole.donViThucThi) {
    //   return cbtciSKRole.donViThucThi.donViID;
    // }
    return selectedDonViIdKpi ? parseInt(selectedDonViIdKpi) : undefined; // Tạm thời cho phép chọn
  };

  const commonApiParams = useMemo(
    () => ({
      tuNgay: dateRange?.from
        ? format(dateRange.from, 'yyyy-MM-dd')
        : undefined,
      denNgay: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      donViID: getDonViFilterForApi(),
    }),
    [dateRange, selectedDonViIdKpi, user]
  ); // Thêm user vào dependencies

  // KPI Data
  const {
    data: kpiData,
    isLoading: isLoadingKpi,
    isError: isErrorKpi,
    error: errorKpi,
  } = useSuKienKpi(commonApiParams);

  // Overview Chart Data
  const overviewChartApiParams = useMemo(
    () => ({
      ...commonApiParams,
      donViThoiGian: overviewChartTimeUnit,
    }),
    [commonApiParams, overviewChartTimeUnit]
  );
  const {
    data: eventOverviewData,
    isLoading: isLoadingEventOverviewChart,
    isError: isErrorEventOverviewChart,
    error: errorEventOverviewChart,
  } = useThongKeSuKienTheoThoiGian(overviewChartApiParams, {
    enabled:
      !!overviewChartApiParams.tuNgay && !!overviewChartApiParams.denNgay,
  });

  // Upcoming Events Data
  const {
    data: upcomingEventsData,
    isLoading: isLoadingUpcomingEvents,
    isError: isErrorUpcomingEvents,
    error: errorUpcomingEvents,
  } = useSuKienSapDienRaDashboard({
    limit: ITEMS_PER_PAGE_TABLES,
    donViID: getDonViFilterForApi(),
  });

  // Pending Requests Data
  const {
    data: pendingRequestsData,
    isLoading: isLoadingPendingRequests,
    isError: isErrorPendingRequests,
    error: errorPendingRequests,
  } = useYeuCauChoXuLyCuaToi({ limit: ITEMS_PER_PAGE_TABLES });

  // Event Categories Data
  const {
    data: eventCategoryData,
    isLoading: isLoadingEventCategory,
    isError: isErrorEventCategory,
    error: errorEventCategory,
  } = useThongKeSuKienTheoLoai(commonApiParams);

  // Event Satisfaction Data
  const satisfactionChartApiParams =
    useMemo((): GetThongKeDanhGiaSuKienParams => {
      // Loại bỏ tuNgay, denNgay khỏi commonApiParams
      const { tuNgay, denNgay, ...rest } = commonApiParams;
      return {
        ...rest,
        tieuChiDiem: satisfactionChartCriteria,
        tuNgaySuKienKetThuc: tuNgay, // Sử dụng chung dateRange
        denNgaySuKienKetThuc: denNgay,
      };
    }, [commonApiParams, satisfactionChartCriteria]);
  const {
    data: eventSatisfactionData,
    isLoading: isLoadingEventSatisfaction,
    isError: isErrorEventSatisfaction,
    error: errorEventSatisfaction,
  } = useThongKeDanhGiaSuKien(satisfactionChartApiParams);

  // Đơn vị cho filter (nếu là Admin/BGH)
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList(
    {
      limit: 100,
      sortBy: 'TenDonVi',
      loaiDonVi: 'KHOA,PHONG,BAN,TRUNG_TAM,CLB,DOAN_THE',
    }, // Lấy các loại đơn vị tổ chức chính
    {
      enabled:
        hasRole(MaVaiTro.ADMIN_HE_THONG) ||
        hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG),
    }
  );

  const handleResetFilters = () => {
    setDateRange(defaultDateRange);
    setSelectedDonViIdKpi(undefined);
    // Không reset timeUnitChart và satisfactionChartCriteria để giữ lựa chọn của người dùng trong tab
  };

  const renderKpiCard = (
    title: string,
    value?: string | number,
    description?: string,
    icon?: React.ReactNode,
    isLoadingFlag = isLoadingKpi
  ) => {
    if (isLoadingFlag) {
      return (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-3/4" />
            </CardTitle>
            {icon && <Skeleton className="h-5 w-5 rounded-sm" />}
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-1/2 mt-1" />
            <Skeleton className="h-3 w-full mt-2" />
          </CardContent>
        </Card>
      );
    }
    return (
      <DashboardCard
        title={title}
        value={value ?? 'N/A'}
        description={description}
        icon={icon}
        className="shadow-sm"
      />
    );
  };

  const getTimeUnitChartLabel = (unit: 'THANG' | 'TUAN' | 'QUY') => {
    if (unit === 'TUAN') return 'Tuần';
    if (unit === 'QUY') return 'Quý';
    return 'Tháng';
  };

  const getRatingCriteriaLabel = (
    criteria: typeof satisfactionChartCriteria
  ): string => {
    switch (criteria) {
      case 'NOI_DUNG':
        return 'Nội Dung';
      case 'TO_CHUC':
        return 'Tổ Chức';
      case 'DIA_DIEM':
        return 'Địa Điểm';
      case 'TONG_QUAT':
      default:
        return 'Tổng Quát';
    }
  };

  return (
    <DashboardLayout pageTitle="Dashboard Thống Kê Sự Kiện">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Filters Section */}
        <Card className="shadow-md border-border/60 dark:border-slate-700/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center">
              <ListFilter className="mr-2.5 h-5 w-5 text-primary dark:text-ptit-blue" />
              Bộ Lọc Dữ Liệu Thống Kê
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
            <div>
              <Label
                htmlFor="date-range-picker-dashboard"
                className="text-sm font-medium text-muted-foreground"
              >
                Khoảng thời gian
              </Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
                className="mt-1.5 [&>button]:h-10 [&>button]:text-sm"
              />
            </div>
            {(hasRole(MaVaiTro.ADMIN_HE_THONG) ||
              hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG)) && (
              <div>
                <Label
                  htmlFor="donvi-filter-dashboard"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Đơn vị tổ chức
                </Label>
                <Select
                  value={selectedDonViIdKpi}
                  onValueChange={(value) =>
                    setSelectedDonViIdKpi(value === 'all' ? undefined : value)
                  }
                  disabled={isLoadingDonVi}
                >
                  <SelectTrigger
                    id="donvi-filter-dashboard"
                    className="h-10 mt-1.5 text-sm"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingDonVi ? 'Đang tải...' : 'Tất cả đơn vị'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đơn vị</SelectItem>
                    {dsDonVi?.items.map((dv) => (
                      <SelectItem
                        key={dv.donViID}
                        value={dv.donViID.toString()}
                      >
                        {dv.tenDonVi} ({dv.loaiDonVi})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div
              className={cn(
                'flex items-end',
                hasRole(MaVaiTro.ADMIN_HE_THONG) ||
                  hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG)
                  ? ''
                  : 'lg:col-start-3'
              )}
            >
              <Button
                onClick={handleResetFilters}
                variant="outline"
                className="h-10 w-full lg:w-auto text-sm"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards Section */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {renderKpiCard(
            'Tổng Sự Kiện',
            kpiData?.tongSuKien,
            `Trong kỳ đã chọn`,
            <CalendarRange className="text-blue-500" />
          )}
          {renderKpiCard(
            'Sắp Tới (30 ngày)',
            kpiData?.suKienSapToi,
            undefined,
            <Clock className="text-amber-500" />
          )}
          {renderKpiCard(
            'Lượt Tham Dự DK',
            kpiData?.tongLuotThamGiaDuKien?.toLocaleString(),
            `TB: ${
              kpiData?.trungBinhNguoiThamGiaMoiSuKien?.toFixed(1) || 'N/A'
            } người/SK`,
            <Users className="text-green-500" />
          )}
          {renderKpiCard(
            'Đánh Giá Ø',
            kpiData?.danhGiaTrungBinh?.diemTongQuat?.toFixed(2) + '/5' || 'N/A',
            `${
              kpiData?.danhGiaTrungBinh?.soLuotDanhGia.toLocaleString() || 0
            } lượt`,
            <Star className="text-yellow-500" />
          )}
        </div>

        {isErrorKpi && (
          <Alert variant="destructive" className="shadow-sm">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi Tải Dữ Liệu Tổng Quan</AlertTitle>
            <AlertDescription>
              {(errorKpi as APIError)?.body?.message ||
                (errorKpi as Error)?.message ||
                'Vui lòng thử lại.'}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5 shadow-inner">
            <TabsTrigger
              value="overview"
              className="h-10 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center gap-2"
            >
              <LineChartIcon className="h-4 w-4" />
              Tổng Quan
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="h-10 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center gap-2"
            >
              <PieChartIconLucide className="h-4 w-4" />
              Phân Loại
            </TabsTrigger>
            <TabsTrigger
              value="satisfaction"
              className="h-10 text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              Đánh Giá
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key="overview"
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.8, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview" className="mt-0 space-y-6">
                <ChartCard
                  title={`Thống kê Sự kiện & Tham dự (Theo ${getTimeUnitChartLabel(
                    overviewChartTimeUnit
                  )})`}
                  action={
                    <Select
                      value={overviewChartTimeUnit}
                      onValueChange={(v) => setOverviewChartTimeUnit(v as any)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THANG">Theo Tháng</SelectItem>
                        <SelectItem value="TUAN">Theo Tuần</SelectItem>
                        <SelectItem value="QUY">Theo Quý</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                >
                  <EventOverviewChart
                    data={eventOverviewData}
                    isLoading={isLoadingEventOverviewChart}
                    isError={isErrorEventOverviewChart}
                    error={errorEventOverviewChart}
                    timeUnitLabel={getTimeUnitChartLabel(overviewChartTimeUnit)}
                  />
                </ChartCard>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold flex items-center">
                        <CalendarCheck2 className="mr-2 h-5 w-5 text-green-600" />
                        Sự Kiện Sắp Diễn Ra (Top 5)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <UpcomingEventsTable
                        data={upcomingEventsData}
                        isLoading={isLoadingUpcomingEvents}
                        isError={isErrorUpcomingEvents}
                        error={errorUpcomingEvents}
                      />
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold flex items-center">
                        <Clock8 className="mr-2 h-5 w-5 text-amber-600" />
                        Yêu Cầu Chờ Xử Lý (Top 5)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <PendingRequestsTable
                        data={pendingRequestsData}
                        isLoading={isLoadingPendingRequests}
                        isError={isErrorPendingRequests}
                        error={errorPendingRequests}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="mt-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <ChartCard title="Tỷ Lệ Sự Kiện Theo Loại">
                    <EventCategoryPieChart
                      data={eventCategoryData}
                      isLoading={isLoadingEventCategory}
                      isError={isErrorEventCategory}
                      error={errorEventCategory}
                    />
                  </ChartCard>
                  <ChartCard title="Số Lượng Sự Kiện Theo Loại (Chi tiết)">
                    <EventCategoryBarChart
                      data={eventCategoryData}
                      isLoading={isLoadingEventCategory}
                      isError={isErrorEventCategory}
                      error={errorEventCategory}
                    />
                  </ChartCard>
                </div>
              </TabsContent>

              <TabsContent value="satisfaction" className="mt-0 space-y-6">
                <ChartCard
                  title={`Thống Kê Đánh Giá Sự Kiện - Theo ${getRatingCriteriaLabel(
                    satisfactionChartCriteria
                  )}`}
                  action={
                    <Select
                      value={satisfactionChartCriteria}
                      onValueChange={(v) =>
                        setSatisfactionChartCriteria(v as any)
                      }
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TONG_QUAT">
                          Đánh giá Tổng quát
                        </SelectItem>
                        <SelectItem value="NOI_DUNG">Điểm Nội dung</SelectItem>
                        <SelectItem value="TO_CHUC">Điểm Tổ chức</SelectItem>
                        <SelectItem value="DIA_DIEM">Điểm Địa điểm</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                >
                  <EventSatisfactionChart
                    data={eventSatisfactionData}
                    isLoading={isLoadingEventSatisfaction}
                    isError={isErrorEventSatisfaction}
                    error={errorEventSatisfaction}
                    tieuChiDiemLabel={getRatingCriteriaLabel(
                      satisfactionChartCriteria
                    )}
                  />
                </ChartCard>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
