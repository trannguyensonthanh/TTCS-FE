/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard/FacilitiesDashboard.tsx
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Building,
  BarChart3,
  CheckCircle as CheckCircleIcon,
  CalendarCheck2,
  Wrench,
  PieChart as PieChartIconLucide,
  ListFilter,
  AlertTriangle,
  Loader2,
  TrendingUp,
  ShieldAlert,
  PackageCheck,
  Tv2,
  Users,
  Clock,
  MapPin,
  Award,
  Activity,
  History,
  FileText,
  Eye,
} from 'lucide-react'; // Đảm bảo import đủ icon
import DashboardCard from '@/components/dashboard/DashboardCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import {
  addMonths,
  startOfYear,
  endOfYear,
  format,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import {
  useCsVcKpi,
  useSuDungPhongTheoThoiGian,
  useLoaiPhongPhoBien,
  usePhongDangBaoTri,
  useThongKeThietBi,
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
import {
  GetThongKeThietBiParams,
  GetSuDungPhongTheoThoiGianParams,
  GetLoaiPhongPhoBienParams,
  GetPhongBaoTriParams,
} from '@/services/dashboard.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import các component con
import RoomUsageChart from './components/RoomUsageChart';
import PopularRoomTypesPieChart from './components/PopularRoomTypesPieChart';
import PopularRoomTypesBarChart from './components/PopularRoomTypesBarChart';
import MaintenanceRoomsTable from './components/MaintenanceRoomsTable';
import EquipmentStatusChart from './components/EquipmentStatusChart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/DateRangePicker';

const defaultDateRangeCsVc: DateRange = {
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date()),
};

const ITEMS_PER_PAGE_MAINTENANCE = 5; // Cho bảng phòng bảo trì

export default function FacilitiesDashboard() {
  const { user, hasRole } = useAuth();

  // --- Filters chung ---
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>(
    defaultDateRangeCsVc
  );
  const [selectedToaNhaId, setSelectedToaNhaId] = useState<string | undefined>(
    undefined
  );
  // const [selectedCoSoId, setSelectedCoSoId] = useState<string | undefined>(undefined); // Nếu có nhiều cơ sở

  // --- State riêng cho từng tab/chart nếu cần filter khác filter chung ---
  const [roomUsageTimeUnit, setRoomUsageTimeUnit] = useState<
    'NGAY' | 'TUAN' | 'THANG'
  >('NGAY');
  // Date range cho room usage chart có thể khác filter chung nếu muốn
  const [roomUsageSpecificDateRange, setRoomUsageSpecificDateRange] = useState<
    DateRange | undefined
  >({
    from: addMonths(new Date(), -1),
    to: new Date(),
  });
  const [roomUsageTypeMetric, setRoomUsageTypeMetric] = useState<
    'soLuotDatPhong' | 'tongGioSuDung'
  >('soLuotDatPhong');

  const [popularRoomMetric, setPopularRoomMetric] = useState<
    'soLuotDat' | 'tongGioSuDung'
  >('soLuotDat');

  const [maintenancePage, setMaintenancePage] = useState(1);

  // --- Lấy dữ liệu cho Select Filter Tòa Nhà ---
  const { data: dsToaNha, isLoading: isLoadingToaNha } = useDonViList(
    { limit: 100, sortBy: 'TenDonVi' /*loaiDonVi: 'TOA_NHA'*/ }, // Lấy tất cả đơn vị, lọc ở FE hoặc BE có param loaiDonVi
    { enabled: true }
  );
  // Lọc ra danh sách chỉ gồm các tòa nhà (nếu dsDonViAll chứa nhiều loại)
  const toaNhaOptions = useMemo(() => {
    return (
      dsToaNha?.items.filter(
        (dv) => dv.loaiDonVi === 'TOA_NHA' || !dv.donViCha
      ) || []
    ); // Ví dụ: Tòa nhà là đơn vị cấp cao nhất hoặc có LoaiDonVi là TOA_NHA
  }, [dsToaNha]);

  // --- Logic lấy DonViID cho API params ---
  const getDonViFilterForApi = (): number | undefined => {
    if (
      hasRole(MaVaiTro.ADMIN_HE_THONG) ||
      hasRole(MaVaiTro.BGH_DUYET_SK_TRUONG)
    ) {
      return selectedToaNhaId ? parseInt(selectedToaNhaId) : undefined;
    }
    return selectedToaNhaId ? parseInt(selectedToaNhaId) : undefined;
  };

  // --- Params và Data Fetching cho KPI Cards ---
  const kpiParams = useMemo(
    () => ({
      ngayHienTai: format(new Date(), 'yyyy-MM-dd'),
      toaNhaID: getDonViFilterForApi(),
    }),
    [selectedToaNhaId, user]
  ); // Thêm user vì getDonViFilterForApi có thể phụ thuộc vào user
  const {
    data: csVcKpiData,
    isLoading: isLoadingCsVcKpi,
    isError: isErrorCsVcKpi,
    error: errorCsVcKpi,
  } = useCsVcKpi(kpiParams);

  // --- Params và Data Fetching cho Tab "Sử Dụng Phòng" ---
  const roomUsageChartParams = useMemo(
    (): GetSuDungPhongTheoThoiGianParams => ({
      tuNgay: roomUsageSpecificDateRange?.from
        ? format(roomUsageSpecificDateRange.from, 'yyyy-MM-dd')
        : format(addMonths(new Date(), -1), 'yyyy-MM-dd'),
      denNgay: roomUsageSpecificDateRange?.to
        ? format(roomUsageSpecificDateRange.to, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      donViThoiGian: roomUsageTimeUnit,
      toaNhaID: getDonViFilterForApi(), // Dùng filter chung
    }),
    [roomUsageSpecificDateRange, roomUsageTimeUnit, selectedToaNhaId, user]
  );
  const {
    data: roomUsageData,
    isLoading: isLoadingRoomUsage,
    isError: isErrorRoomUsage,
    error: errorRoomUsage,
  } = useSuDungPhongTheoThoiGian(roomUsageChartParams, {
    enabled: !!roomUsageChartParams.tuNgay && !!roomUsageChartParams.denNgay,
  });

  // --- Params và Data Fetching cho Tab "Loại Phòng Ưa Chuộng" ---
  const popularRoomParams = useMemo(
    (): GetLoaiPhongPhoBienParams => ({
      tuNgay: filterDateRange?.from
        ? format(filterDateRange.from, 'yyyy-MM-dd')
        : undefined, // Dùng filter chung
      denNgay: filterDateRange?.to
        ? format(filterDateRange.to, 'yyyy-MM-dd')
        : undefined,
      limit: 7,
    }),
    [filterDateRange]
  );
  const {
    data: popularRoomTypesData,
    isLoading: isLoadingPopularRoomTypes,
    isError: isErrorPopularRoomTypes,
    error: errorPopularRoomTypes,
  } = useLoaiPhongPhoBien(popularRoomParams);

  // --- Params và Data Fetching cho Tab "Phòng Bảo Trì" ---
  const maintenanceRoomsParams = useMemo(
    (): GetPhongBaoTriParams => ({
      toaNhaID: getDonViFilterForApi(),
      page: maintenancePage,
      limit: ITEMS_PER_PAGE_MAINTENANCE,
      sortBy: 'TenPhong',
      sortOrder: 'asc',
    }),
    [selectedToaNhaId, maintenancePage, user]
  );
  const {
    data: maintenanceRoomsData,
    isLoading: isLoadingMaintenanceRooms,
    isFetching: isFetchingMaintenanceRooms,
    isError: isErrorMaintenanceRooms,
    error: errorMaintenanceRooms,
  } = usePhongDangBaoTri(maintenanceRoomsParams);

  // --- Params và Data Fetching cho Tab "Tình Trạng Thiết Bị" ---
  const equipmentStatusParams = useMemo(
    (): GetThongKeThietBiParams => ({
      loaiThongKe: 'TINH_TRANG',
      toaNhaID: getDonViFilterForApi(),
    }),
    [selectedToaNhaId, user]
  );
  const {
    data: equipmentStatusData,
    isLoading: isLoadingEquipmentStatus,
    isError: isErrorEquipmentStatus,
    error: errorEquipmentStatus,
  } = useThongKeThietBi(equipmentStatusParams);

  const handleResetGeneralFilters = () => {
    setFilterDateRange(defaultDateRangeCsVc);
    setSelectedToaNhaId(undefined);
  };

  const renderKpiCard = (
    title: string,
    value?: string | number | null,
    description?: string,
    icon?: React.ReactNode,
    isLoadingFlag = isLoadingCsVcKpi
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
            <Skeleton className="h-8 w-1/2 mt-1" />
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

  return (
    <DashboardLayout pageTitle="Dashboard Quản Lý Cơ Sở Vật Chất">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Filters Section */}
        <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center">
              <ListFilter className="mr-2.5 h-5 w-5 text-primary dark:text-ptit-blue" />
              Bộ Lọc Chung Cho Dashboard
            </CardTitle>
            <CardDescription>
              Áp dụng cho KPI và một số biểu đồ/bảng bên dưới.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 items-end">
            <div>
              <Label
                htmlFor="toanha-filter-csvc"
                className="text-sm font-medium text-muted-foreground"
              >
                Lọc theo Tòa Nhà
              </Label>
              <Select
                value={selectedToaNhaId}
                onValueChange={(value) =>
                  setSelectedToaNhaId(value === 'all' ? undefined : value)
                }
                disabled={isLoadingToaNha}
              >
                <SelectTrigger
                  id="toanha-filter-csvc"
                  className="h-10 mt-1.5 text-sm"
                >
                  <SelectValue
                    placeholder={
                      isLoadingToaNha ? 'Đang tải...' : 'Tất cả tòa nhà'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                  {toaNhaOptions.map((dv) => (
                    <SelectItem key={dv.donViID} value={dv.donViID.toString()}>
                      {dv.tenDonVi} {dv.maDonVi && `(${dv.maDonVi})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="date-range-picker-dashboard-facility"
                className="text-sm font-medium text-muted-foreground"
              >
                Khoảng thời gian (cho một số biểu đồ)
              </Label>
              <DatePickerWithRange
                date={filterDateRange}
                setDate={setFilterDateRange}
                className="mt-1.5 [&>button]:h-10 [&>button]:text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleResetGeneralFilters}
                variant="outline"
                className="h-10 w-full lg:w-auto text-sm"
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards Section */}
        <h2 className="text-xl font-semibold text-foreground pt-2">
          Tổng Quan Nhanh Cơ Sở Vật Chất
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {' '}
          {/* Thay đổi thành 3 cột cho đẹp hơn */}
          {renderKpiCard(
            'Tổng Phòng',
            csVcKpiData?.tongSoPhong,
            `Đang bảo trì: ${csVcKpiData?.phongDangBaoTri || 0}`,
            <Building className="text-blue-600" />
          )}
          {renderKpiCard(
            'Phòng Sẵn Sàng',
            csVcKpiData?.phongSanSang,
            `Đang sử dụng: ${csVcKpiData?.phongDangSuDung || 0}`,
            <CheckCircleIcon className="text-green-600" />
          )}
          {renderKpiCard(
            'YC Phòng Chờ Xử Lý',
            csVcKpiData?.yeuCauMuonPhongChoDuyet,
            `YC đổi phòng: ${csVcKpiData?.yeuCauDoiPhongChoDuyet || 0}`,
            <CalendarCheck2 className="text-purple-600" />
          )}
          {renderKpiCard(
            'Tổng Thiết Bị',
            csVcKpiData?.tongSoThietBi?.toLocaleString(),
            `Hoạt động tốt: ${
              csVcKpiData?.thietBiDangHoatDongTot?.toLocaleString() || 0
            }`,
            <PackageCheck className="text-sky-600" />
          )}
          {renderKpiCard(
            'TB Cần Bảo Trì',
            csVcKpiData?.thietBiCanBaoTri,
            undefined,
            <ShieldAlert className="text-red-600" />
          )}
          {renderKpiCard(
            'Tỷ Lệ Sử Dụng (Nay)',
            `${csVcKpiData?.tyLeSuDungPhongHomNay?.toFixed(1) || 0}%`,
            undefined,
            <TrendingUp className="text-pink-600" />
          )}
        </div>

        {isErrorCsVcKpi && (
          <Alert variant="destructive" className="shadow-sm mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi Tải KPI CSVC</AlertTitle>
            <AlertDescription>
              {(errorCsVcKpi as APIError)?.body?.message ||
                (errorCsVcKpi as Error)?.message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="roomUsage" className="space-y-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5 shadow-inner">
            <TabsTrigger
              value="roomUsage"
              className="h-10 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center gap-1.5"
            >
              <BarChart3 className="h-4 w-4" />
              Sử Dụng Phòng
            </TabsTrigger>
            <TabsTrigger
              value="roomTypes"
              className="h-10 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center gap-1.5"
            >
              <PieChartIconLucide className="h-4 w-4" />
              Loại Phòng
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="h-10 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center gap-1.5"
            >
              <Wrench className="h-4 w-4" />
              Phòng Bảo Trì
            </TabsTrigger>
            <TabsTrigger
              value="equipment"
              className="h-10 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-ptit-blue rounded-md flex items-center gap-1.5"
            >
              <Tv2 className="h-4 w-4" />
              Thiết Bị
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key="dashboard-tabs-motion"
              initial={{ opacity: 0.8, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.8, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="roomUsage" className="mt-0 space-y-6">
                <ChartCard
                  title="Biểu Đồ Tình Trạng Sử Dụng Phòng"
                  action={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Select
                        value={roomUsageTypeMetric}
                        onValueChange={(v) => setRoomUsageTypeMetric(v as any)}
                      >
                        <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soLuotDatPhong">
                            Theo Số Lượt Đặt
                          </SelectItem>
                          <SelectItem value="tongGioSuDung">
                            Theo Tổng Giờ Sử Dụng
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={roomUsageTimeUnit}
                        onValueChange={(v) => setRoomUsageTimeUnit(v as any)}
                      >
                        <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NGAY">Theo Ngày</SelectItem>
                          <SelectItem value="TUAN">Theo Tuần</SelectItem>
                          <SelectItem value="THANG">Theo Tháng</SelectItem>
                        </SelectContent>
                      </Select>
                      <DatePickerWithRange
                        date={roomUsageSpecificDateRange}
                        setDate={setRoomUsageSpecificDateRange}
                        className="[&>button]:h-9 [&>button]:text-xs [&>button]:min-w-[220px] w-full sm:w-auto"
                      />
                    </div>
                  }
                >
                  <RoomUsageChart
                    data={roomUsageData}
                    isLoading={isLoadingRoomUsage}
                    isError={isErrorRoomUsage}
                    error={errorRoomUsage}
                    dataKeyUsage={roomUsageTypeMetric}
                    yAxisLabel={
                      roomUsageTypeMetric === 'soLuotDatPhong'
                        ? 'Số Lượt Đặt'
                        : 'Tổng Giờ'
                    }
                    lineName={
                      roomUsageTypeMetric === 'soLuotDatPhong'
                        ? 'Lượt đặt'
                        : 'Giờ sử dụng'
                    }
                    lineColor={
                      roomUsageTypeMetric === 'soLuotDatPhong'
                        ? '#3b82f6'
                        : '#10b981'
                    }
                  />
                </ChartCard>
              </TabsContent>

              <TabsContent value="roomTypes" className="mt-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <ChartCard
                    title="Tỷ Lệ Các Loại Phòng Phổ Biến"
                    action={
                      <Select
                        value={popularRoomMetric}
                        onValueChange={(v) => setPopularRoomMetric(v as any)}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soLuotDat">
                            Theo Số Lượt Đặt
                          </SelectItem>
                          <SelectItem value="tongGioSuDung">
                            Theo Tổng Giờ Sử Dụng
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    }
                  >
                    <PopularRoomTypesPieChart
                      data={popularRoomTypesData}
                      isLoading={isLoadingPopularRoomTypes}
                      isError={isErrorPopularRoomTypes}
                      error={errorPopularRoomTypes}
                      dataKeyToDisplay={popularRoomMetric}
                    />
                  </ChartCard>
                  <ChartCard
                    title="Chi Tiết Số Lượng Theo Loại Phòng"
                    action={
                      <span className="text-xs text-muted-foreground">
                        (Dựa trên:{' '}
                        {popularRoomMetric === 'soLuotDat'
                          ? 'Số lượt đặt'
                          : 'Tổng giờ sử dụng'}
                        )
                      </span>
                    }
                  >
                    <PopularRoomTypesBarChart
                      data={popularRoomTypesData}
                      isLoading={isLoadingPopularRoomTypes}
                      isError={isErrorPopularRoomTypes}
                      error={errorPopularRoomTypes}
                      dataKeyToDisplay={popularRoomMetric}
                      barName={
                        popularRoomMetric === 'soLuotDat'
                          ? 'Số lượt đặt'
                          : 'Tổng giờ'
                      }
                      barColor={
                        popularRoomMetric === 'soLuotDat'
                          ? '#3b82f6'
                          : '#10b981'
                      }
                    />
                  </ChartCard>
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="mt-0 space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Wrench className="mr-2 h-5 w-5 text-orange-500" />
                      Danh Sách Phòng Đang Bảo Trì
                    </CardTitle>
                    <CardDescription>
                      Các phòng hiện không khả dụng do bảo trì hoặc sửa chữa.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceRoomsTable
                      paginatedData={maintenanceRoomsData}
                      isLoading={
                        isLoadingMaintenanceRooms || isFetchingMaintenanceRooms
                      }
                      isError={isErrorMaintenanceRooms}
                      error={errorMaintenanceRooms}
                      onPageChange={setMaintenancePage}
                      currentPage={maintenancePage}
                      itemsPerPage={ITEMS_PER_PAGE_MAINTENANCE}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="equipment" className="mt-0 space-y-6">
                <ChartCard title="Thống Kê Tình Trạng Thiết Bị Chung">
                  <EquipmentStatusChart
                    data={equipmentStatusData}
                    isLoading={isLoadingEquipmentStatus}
                    isError={isErrorEquipmentStatus}
                    error={errorEquipmentStatus}
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
