import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { APIError } from '@/services/apiHelper';

import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Layers,
  Building as BuildingIcon,
  Users as UsersIcon,
  MapPin,
  Tv,
  Settings as SettingsIcon, // Đổi tên Settings
  Wifi,
  AirVent,
  Mic,
  Zap,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import các component con (chỉ cần RoomInfoSection và RoomEquipmentList)
import { RoomInfoSection } from '@/components/rooms/detail/RoomInfoSection';
import { RoomEquipmentList } from '@/components/rooms/detail/RoomEquipmentList';
import { usePhongDetail } from '@/hooks/queries/phongQueries';

// Helper functions (getLoaiPhongIcon, getStatusBadgeForPhong - có thể đưa vào utils)
// Ví dụ:
const getStatusBadgeForPhong = (
  maTrangThai?: string,
  tenTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai && !tenTrangThai)
    return (
      <Badge variant="outline" className="text-xs">
        Chưa rõ
      </Badge>
    );
  const displayStatus = tenTrangThai || maTrangThai;
  const lowerStatus = maTrangThai?.toUpperCase();

  switch (lowerStatus) {
    case 'SAN_SANG':
      return (
        <Badge
          variant="outline"
          className="text-xs bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300 border-green-300 dark:border-green-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'DANG_SU_DUNG':
      return (
        <Badge
          variant="default"
          className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300 border-amber-300 dark:border-amber-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'DANG_DUOC_DAT':
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300 border-blue-300 dark:border-blue-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'DANG_BAO_TRI':
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300 border-red-300 dark:border-red-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'NGUNG_SU_DUNG':
      return (
        <Badge
          variant="outline"
          className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-700/20 dark:text-gray-300 border-gray-300 dark:border-gray-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'CHO_DON_DEP':
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-700/20 dark:text-cyan-300 border-cyan-300 dark:border-cyan-600"
        >
          {displayStatus}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          {displayStatus}
        </Badge>
      );
  }
};

const InfoRowDisplay = ({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}) => (
  <div
    className={cn(
      'flex items-start py-2.5 border-b border-dashed border-border/30 dark:border-slate-700/30 last:border-none',
      className
    )}
  >
    {Icon && (
      <Icon className="h-4.5 w-4.5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
    )}
    <span className="text-sm font-medium text-muted-foreground w-36 shrink-0">
      {label}:
    </span>
    <span className="text-sm text-foreground break-words flex-1">{value}</span>
  </div>
);

// ---- Component Chính ----
const PublicRoomDetailPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // --- Data Fetching ---
  const {
    data: phongDetail,
    isLoading: isLoadingPhongDetail,
    isError: isErrorPhongDetail,
    error: errorPhongDetail,
    refetch: refetchPhongDetail,
  } = usePhongDetail(roomId, {
    // Sử dụng hook cho public detail
    enabled: !!roomId,
    staleTime: 10 * 60 * 1000, // Cache lâu hơn cho trang public
  });

  // --- Xử lý khi không có roomId hoặc phòng không tồn tại ---
  if (!roomId) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-8 md:py-12">
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Không Tìm Thấy Phòng
            </h2>
            <p className="text-muted-foreground mb-6">
              ID phòng không hợp lệ hoặc không được cung cấp.
            </p>
            <Button onClick={() => navigate('/rooms-explorer')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Danh sách Phòng
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <main className="flex-1 container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'circOut' }}
          className="max-w-5xl mx-auto" // Giới hạn chiều rộng tối đa
        >
          <div className="mb-6 sm:mb-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="hover:bg-accent group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
              Quay lại
            </Button>
            {/* Không có nút headerActions cho trang public này */}
          </div>

          {isLoadingPhongDetail && (
            <Card className="shadow-xl border-border dark:border-slate-700">
              <CardHeader>
                <Skeleton className="h-10 w-3/5 rounded-md" />
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_1fr)_280px] lg:grid-cols-[minmax(0,_1fr)_320px] gap-6 lg:gap-8 items-start">
                  <div className="space-y-5">
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                  <div className="space-y-5">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isErrorPhongDetail && !isLoadingPhongDetail && (
            <Card className="shadow-lg border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle /> Lỗi Tải Dữ Liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">
                  {(errorPhongDetail as APIError)?.body?.message ||
                    (errorPhongDetail as Error)?.message ||
                    'Không thể tải thông tin chi tiết của phòng này. Vui lòng thử lại.'}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => refetchPhongDetail()}
                  className="mt-4"
                >
                  Tải lại
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoadingPhongDetail && !phongDetail && !isErrorPhongDetail && (
            <Card className="shadow-lg border-dashed">
              <CardContent className="py-20 text-center">
                <BuildingIcon className="h-24 w-24 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  Không tìm thấy thông tin phòng
                </h3>
                <p className="text-muted-foreground mt-3">
                  Phòng bạn đang tìm kiếm có thể không tồn tại hoặc đã bị xóa
                  khỏi hệ thống.
                </p>
              </CardContent>
            </Card>
          )}

          {phongDetail && !isLoadingPhongDetail && (
            <div className="space-y-6 md:space-y-8">
              {/* Phần Thông Tin Chung và Ảnh */}
              <Card className="shadow-xl border-border dark:border-slate-700 overflow-hidden">
                {phongDetail.anhMinhHoa ? (
                  <div className="aspect-[16/9] relative group overflow-hidden">
                    <img
                      src={phongDetail.anhMinhHoa}
                      alt={`Ảnh phòng ${phongDetail.tenPhong}`}
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                      <h1 className="text-3xl md:text-4xl font-bold text-white shadow-lg">
                        {phongDetail.tenPhong}
                      </h1>
                      {phongDetail.maPhong && (
                        <p className="text-sm text-slate-200 opacity-90 font-mono tracking-wider">
                          ({phongDetail.maPhong})
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <CardHeader className="border-b dark:border-slate-700/70">
                    <CardTitle className="text-3xl font-bold text-primary dark:text-ptit-red">
                      {phongDetail.tenPhong}{' '}
                      {phongDetail.maPhong && (
                        <span className="text-xl font-normal text-muted-foreground">
                          ({phongDetail.maPhong})
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                )}

                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRowDisplay
                    label="Loại phòng"
                    value={phongDetail.loaiPhong.tenLoaiPhong}
                    icon={Layers}
                  />
                  <InfoRowDisplay
                    label="Sức chứa"
                    value={
                      phongDetail.sucChua
                        ? `${phongDetail.sucChua} người`
                        : 'Không xác định'
                    }
                    icon={UsersIcon}
                  />
                  <InfoRowDisplay
                    label="Vị trí"
                    value={
                      phongDetail.toaNhaTang
                        ? `${phongDetail.toaNhaTang.toaNha.tenToaNha} - ${
                            phongDetail.toaNhaTang.loaiTang.tenLoaiTang
                          }${
                            phongDetail.soThuTuPhong
                              ? ` (P. ${phongDetail.soThuTuPhong})`
                              : ''
                          }`
                        : 'Chưa rõ'
                    }
                    icon={MapPin}
                  />
                  <InfoRowDisplay
                    label="Trạng thái"
                    value={getStatusBadgeForPhong(
                      phongDetail.trangThaiPhong.maTrangThai,
                      phongDetail.trangThaiPhong.tenTrangThai
                    )}
                  />
                </CardContent>
              </Card>

              {/* Phần Mô Tả Chi Tiết */}
              {phongDetail.moTaChiTietPhong && (
                <Card className="shadow-lg border-border dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <Info className="text-blue-500" /> Mô Tả Chi Tiết
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm prose dark:prose-invert max-w-none whitespace-pre-line leading-relaxed text-muted-foreground">
                    {phongDetail.moTaChiTietPhong}
                  </CardContent>
                </Card>
              )}

              {/* Phần Trang Thiết Bị */}
              <RoomEquipmentList
                thietBiTrongPhong={phongDetail.thietBiTrongPhong}
                isLoading={isLoadingPhongDetail}
              />

              {/* Không có phần Lịch sử đặt phòng ở đây nữa */}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PublicRoomDetailPage;
