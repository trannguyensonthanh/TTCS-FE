// src/components/rooms/RoomCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  MapPin,
  Users as UsersIcon,
  Info,
  Layers,
  Building as BuildingIcon,
  Briefcase,
  Settings,
  Home,
} from 'lucide-react';
import { format, parseISO } from 'date-fns'; // Import nếu dùng trực tiếp
import { vi } from 'date-fns/locale'; // Import nếu dùng trực tiếp
import { PhongListItemResponse } from '@/services/phong.service';

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
  switch (maTrangThai?.toUpperCase()) {
    case 'SAN_SANG':
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40"
        >
          {displayStatus}
        </Badge>
      );
    case 'DANG_SU_DUNG':
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40"
        >
          {displayStatus}
        </Badge>
      );
    case 'BAO_TRI':
      return (
        <Badge
          variant="destructive"
          className="text-xs bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40"
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
  const lowerName = tenLoaiPhong?.toLowerCase() || '';
  if (lowerName.includes('hội trường') || lowerName.includes('hall'))
    return <UsersIcon className="h-4 w-4 text-primary" />;
  if (lowerName.includes('họp') || lowerName.includes('meeting'))
    return <Briefcase className="h-4 w-4 text-blue-500" />;
  if (lowerName.includes('lab') || lowerName.includes('thực hành'))
    return <Settings className="h-4 w-4 text-teal-500" />;
  return <Home className="h-4 w-4 text-gray-500" />;
};

interface RoomCardProps {
  phong: PhongListItemResponse;
  index: number; // For animation delay
}

export const RoomCard: React.FC<RoomCardProps> = ({ phong, index }) => {
  return (
    <motion.div
      key={phong.phongID}
      layout
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col group hover:shadow-2xl dark:hover:border-primary/50 transition-all duration-300">
        <Link to={`/rooms-explorer/${phong.phongID}`} className="block">
          <div className="aspect-video bg-muted relative overflow-hidden">
            {phong.anhMinhHoa ? (
              <img
                src={phong.anhMinhHoa}
                alt={phong.tenPhong}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700">
                <BuildingIcon className="h-20 w-20 text-slate-400 dark:text-slate-600" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              {getStatusBadgeForPhong(
                phong.trangThaiPhong.maTrangThai,
                phong.trangThaiPhong.tenTrangThai
              )}
            </div>
            {phong.loaiPhong && (
              <Badge
                variant="default"
                className="absolute top-3 left-3 bg-primary/80 text-primary-foreground backdrop-blur-sm text-xs px-2 py-1"
              >
                {getLoaiPhongIcon(phong.loaiPhong.tenLoaiPhong)}
                <span className="ml-1.5">{phong.loaiPhong.tenLoaiPhong}</span>
              </Badge>
            )}
          </div>
        </Link>
        <CardHeader className="p-4 pb-2">
          <Link
            to={`/rooms-explorer/${phong.phongID}`}
            className="hover:no-underline"
          >
            <CardTitle className="text-lg leading-tight line-clamp-2 h-[3.2em] group-hover:text-primary dark:group-hover:text-ptit-red transition-colors">
              {phong.tenPhong} {phong.maPhong && `(${phong.maPhong})`}
            </CardTitle>
          </Link>
          <CardDescription className="text-xs pt-1 text-muted-foreground flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
            {phong.toaNhaTang
              ? `${phong.toaNhaTang.toaNha.tenToaNha} - ${phong.toaNhaTang.loaiTang.tenLoaiTang}`
              : 'Chưa rõ vị trí'}
            {phong.soThuTuPhong && ` (Phòng ${phong.soThuTuPhong})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1 space-y-1.5 text-sm text-muted-foreground flex-grow">
          {phong.sucChua && (
            <div className="flex items-center">
              <UsersIcon className="mr-2 h-4 w-4 flex-shrink-0 text-teal-600 dark:text-teal-400" />
              <span>Sức chứa: {phong.sucChua} người</span>
            </div>
          )}
          <div className="flex items-center">
            <Layers className="mr-2 h-4 w-4 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
            <span>Loại: {phong.loaiPhong.tenLoaiPhong}</span>
          </div>
          {/* Thêm thông tin thiết bị tóm tắt nếu có */}
        </CardContent>
        <CardFooter className="p-4 pt-2 border-t dark:border-slate-700/50">
          <Link to={`/rooms-explorer/${phong.phongID}`} className="w-full">
            <Button
              variant="outline"
              className="w-full group-hover:bg-primary/5 group-hover:border-primary dark:group-hover:bg-ptit-red/5 dark:group-hover:border-ptit-red transition-colors"
            >
              <Info className="mr-2 h-4 w-4" /> Xem Chi Tiết
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
