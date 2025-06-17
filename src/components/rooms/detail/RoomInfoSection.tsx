// src/components/rooms/detail/RoomInfoSection.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  ImageIcon,
  Building as BuildingIcon,
  MapPin,
  Users as UsersIcon,
  Layers,
  CheckCircle,
  XCircle,
  AlertTriangle as AlertTriangleIcon,
  InfoIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PhongDetailResponse } from '@/services/phong.service';

// Helper getStatusBadgeForPhong và getLoaiPhongIcon (đã có trong RoomsExplorerPage, có thể đưa ra utils)
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
  const lowerStatus = maTrangThai?.toLowerCase();

  switch (lowerStatus) {
    case 'san_sang':
      return (
        <Badge
          variant="outline"
          className="text-xs bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300 border-green-300 dark:border-green-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'dang_su_dung':
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300 border-amber-300 dark:border-amber-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'dang_duoc_dat':
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-300 border-blue-300 dark:border-blue-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'dang_bao_tri':
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300 border-red-300 dark:border-red-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'ngung_su_dung':
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-gray-200 text-gray-600 dark:bg-gray-700/20 dark:text-gray-300 border-gray-300 dark:border-gray-600"
        >
          {displayStatus}
        </Badge>
      );
    case 'cho_don_dep':
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

const getLoaiPhongIcon = (tenLoaiPhong?: string): React.ReactNode => {
  /* ... như cũ ... */ return <Layers className="h-4 w-4 text-primary" />;
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
      'flex items-start py-2 border-b border-dashed border-border/30 dark:border-slate-700/30 last:border-none',
      className
    )}
  >
    {Icon && (
      <Icon className="h-4 w-4 mr-2.5 mt-0.5 text-muted-foreground flex-shrink-0" />
    )}
    <span className="text-sm font-medium text-muted-foreground w-32 shrink-0">
      {label}:
    </span>
    <span className="text-sm text-foreground break-words flex-1">{value}</span>
  </div>
);

interface RoomInfoSectionProps {
  phongDetail?: PhongDetailResponse | null;
  isLoading: boolean;
}

export const RoomInfoSection: React.FC<RoomInfoSectionProps> = ({
  phongDetail,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <Skeleton className="aspect-video w-full rounded-t-lg" />
        <CardHeader>
          <Skeleton className="h-7 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!phongDetail) {
    return null; // Hoặc một thông báo lỗi nếu cần
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      {phongDetail.anhMinhHoa ? (
        <img
          src={phongDetail.anhMinhHoa}
          alt={`Ảnh phòng ${phongDetail.tenPhong}`}
          className="w-full h-auto object-cover aspect-[16/10] border-b dark:border-slate-700"
          onError={(e) => (e.currentTarget.style.display = 'none')} // Ẩn nếu ảnh lỗi
        />
      ) : (
        <div className="aspect-[16/10] bg-muted flex items-center justify-center border-b dark:border-slate-700">
          <ImageIcon className="h-24 w-24 text-gray-300 dark:text-gray-600" />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-primary dark:text-ptit-red">
          {phongDetail.tenPhong}{' '}
          {phongDetail.maPhong && (
            <span className="text-lg font-normal text-muted-foreground">
              ({phongDetail.maPhong})
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          {phongDetail.toaNhaTang
            ? `${phongDetail.toaNhaTang.toaNha.tenToaNha} - ${
                phongDetail.toaNhaTang.loaiTang.tenLoaiTang
              }${
                phongDetail.soThuTuPhong
                  ? ` (Phòng số ${phongDetail.soThuTuPhong})`
                  : ''
              }`
            : 'Chưa rõ vị trí'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm space-y-1 pt-0">
        <InfoRowDisplay
          label="Loại phòng"
          value={phongDetail.loaiPhong.tenLoaiPhong}
          icon={
            getLoaiPhongIcon(phongDetail.loaiPhong.tenLoaiPhong)
              ? undefined
              : Layers
          } // Chỉ dùng Layers nếu getLoaiPhongIcon không trả icon cụ thể
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
          label="Trạng thái"
          value={getStatusBadgeForPhong(
            phongDetail.trangThaiPhong.maTrangThai,
            phongDetail.trangThaiPhong.tenTrangThai
          )}
          icon={
            phongDetail.trangThaiPhong.maTrangThai === 'SAN_SANG'
              ? CheckCircle
              : phongDetail.trangThaiPhong.maTrangThai === 'DANG_BAO_TRI'
              ? AlertTriangleIcon
              : InfoIcon
          }
        />
        {phongDetail.toaNhaTang?.toaNha.maToaNha && (
          <InfoRowDisplay
            label="Mã Tòa Nhà"
            value={phongDetail.toaNhaTang.toaNha.maToaNha}
            icon={BuildingIcon}
          />
        )}
      </CardContent>
    </Card>
  );
};
