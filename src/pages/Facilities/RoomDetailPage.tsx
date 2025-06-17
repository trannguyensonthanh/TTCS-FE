import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns'; // Thêm các hàm date-fns
import { vi } from 'date-fns/locale';

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ReusablePagination } from '@/components/ui/ReusablePagination'; // Thêm Pagination cho lịch sử

import { usePhongDetail } from '@/hooks/queries/phongQueries'; // useDeletePhong sẽ dùng trong RoomActions
import { useLichDatPhongTheoPhong } from '@/hooks/queries/lichDatPhongQueries';

import { APIError } from '@/services/apiHelper';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import MaVaiTro from '@/enums/MaVaiTro.enum';

import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  CalendarDays as CalendarDaysIcon,
  ChevronLeft,
  ChevronRight,
  BuildingIcon,
} from 'lucide-react';

// Import các component con
import { RoomInfoSection } from '@/components/rooms/detail/RoomInfoSection';
import { RoomEquipmentList } from '@/components/rooms/detail/RoomEquipmentList';
import { RoomBookingHistoryTable } from '@/components/rooms/detail/RoomBookingHistoryTable';
import { RoomActions } from '@/components/rooms/detail/RoomActions'; // Component chứa nút Sửa/Xóa
import { DatePicker } from '@/components/ui/date-picker'; // Giả sử có component này
import { GetLichDatPhongTheoPhongParams } from '@/services/lichDatPhong.service';

// ---- Component Chính ----
const RoomDetailPage = () => {
  const { user } = useAuth();
  const { hasRole } = useRole();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  const [activeTab, setActiveTab] = useState('info'); // "info", "schedule"

  // --- State cho Lịch Đặt Phòng ---
  const [currentMonthView, setCurrentMonthView] = useState<Date>(
    startOfMonth(new Date())
  );
  const [lichDatPhongPage, setLichDatPhongPage] = useState(1);
  const lichDatPhongLimit = 10;

  const lichDatPhongParams = useMemo(
    (): GetLichDatPhongTheoPhongParams => ({
      page: lichDatPhongPage,
      limit: lichDatPhongLimit,
      sortBy: 'TgNhanPhongTT',
      sortOrder: 'asc',
      tuNgay: format(startOfMonth(currentMonthView), 'yyyy-MM-dd'),
      denNgay: format(endOfMonth(currentMonthView), 'yyyy-MM-dd'),
    }),
    [lichDatPhongPage, lichDatPhongLimit, currentMonthView]
  );

  // --- Data Fetching ---
  const {
    data: phongDetail,
    isLoading: isLoadingPhongDetail,
    isError: isErrorPhongDetail,
    error: errorPhongDetail,
    refetch: refetchPhongDetail,
  } = usePhongDetail(roomId, { enabled: !!roomId });

  const {
    data: paginatedLichDatPhong,
    isLoading: isLoadingLichDatPhong,
    isFetching: isFetchingLichDatPhong,
  } = useLichDatPhongTheoPhong(roomId, lichDatPhongParams, {
    enabled: !!roomId && !!phongDetail, // Chỉ fetch khi có roomId và chi tiết phòng đã load (để biết phòng tồn tại)
  });

  // --- Quyền ---
  const canManageRoom =
    hasRole(MaVaiTro.QUAN_LY_CSVC) || hasRole(MaVaiTro.ADMIN_HE_THONG);

  const handleLichDatPhongPageChange = (newPage: number) => {
    setLichDatPhongPage(newPage);
  };

  const goToPreviousMonth = () =>
    setCurrentMonthView((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonthView((prev) => addMonths(prev, 1));
  const goToCurrentMonth = () => setCurrentMonthView(startOfMonth(new Date()));
  // --- Xử lý khi không có roomId hoặc phòng không tồn tại ---
  if (!roomId) {
    return (
      <DashboardLayout pageTitle="Lỗi">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Không Tìm Thấy Phòng</h2>
          <p className="text-muted-foreground mb-6">
            ID phòng không hợp lệ hoặc không được cung cấp.
          </p>
          <Button onClick={() => navigate('/facilities/rooms-explorer')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Danh sách Phòng
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const pageTitle = isLoadingPhongDetail
    ? 'Đang tải chi tiết phòng...'
    : phongDetail
    ? `Chi tiết Phòng: ${phongDetail.tenPhong}`
    : 'Không tìm thấy phòng';

  return (
    <DashboardLayout
      pageTitle={pageTitle}
      headerActions={
        phongDetail && canManageRoom ? (
          <RoomActions phong={phongDetail} />
        ) : null
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'circOut' }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-2 self-start hover:bg-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Danh sách
          </Button>
          {/* Có thể thêm nút ở đây nếu cần, ví dụ nút yêu cầu mượn phòng này */}
        </div>

        {isLoadingPhongDetail && (
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
                <div className="lg:col-span-2 space-y-4">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isErrorPhongDetail && !isLoadingPhongDetail && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Lỗi Tải Dữ Liệu Phòng</AlertTitle>
            <AlertDescription>
              {(errorPhongDetail as APIError)?.body?.message ||
                (errorPhongDetail as Error)?.message ||
                'Không thể tải thông tin chi tiết của phòng này. Vui lòng thử lại.'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchPhongDetail()}
                className="ml-2 h-auto p-1 text-destructive hover:underline"
              >
                Tải lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoadingPhongDetail && !phongDetail && !isErrorPhongDetail && (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <BuildingIcon className="h-20 w-20 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Không tìm thấy thông tin phòng
              </h3>
              <p className="text-muted-foreground mt-2">
                Phòng bạn tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
            </CardContent>
          </Card>
        )}

        {phongDetail && !isLoadingPhongDetail && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              <motion.div
                className="lg:col-span-1 space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <RoomInfoSection
                  phongDetail={phongDetail}
                  isLoading={isLoadingPhongDetail}
                />
                <RoomEquipmentList
                  thietBiTrongPhong={phongDetail.thietBiTrongPhong}
                  isLoading={isLoadingPhongDetail}
                />
              </motion.div>

              <motion.div
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      Mô Tả Chi Tiết Phòng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm prose dark:prose-invert max-w-none whitespace-pre-line prose-sm leading-relaxed text-muted-foreground">
                    {phongDetail.moTaChiTietPhong || (
                      <span className="italic">
                        Không có mô tả chi tiết cho phòng này.
                      </span>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <CardTitle className="text-xl font-semibold">
                        Lịch Sử Dụng & Đặt Phòng
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={goToPreviousMonth}
                          disabled={isFetchingLichDatPhong}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <DatePicker
                          date={currentMonthView}
                          setDate={(date) =>
                            date && setCurrentMonthView(startOfMonth(date))
                          }
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={goToNextMonth}
                          disabled={isFetchingLichDatPhong}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={goToCurrentMonth}
                          disabled={
                            isFetchingLichDatPhong ||
                            format(currentMonthView, 'yyyy-MM') ===
                              format(new Date(), 'yyyy-MM')
                          }
                        >
                          Tháng này
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RoomBookingHistoryTable
                      paginatedBookings={paginatedLichDatPhong}
                      isLoading={
                        isLoadingLichDatPhong || isFetchingLichDatPhong
                      }
                      onPageChange={handleLichDatPhongPageChange}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};
export default RoomDetailPage;
