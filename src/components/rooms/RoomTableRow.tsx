// src/components/rooms/RoomTableRow.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ExternalLink } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns'; // Import nếu dùng trực tiếp
import { vi } from 'date-fns/locale'; // Import nếu dùng trực tiếp
import { PhongListItemResponse } from '@/services/phong.service';

// Helper functions (có thể import từ utils)
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
  switch (
    maTrangThai?.toUpperCase() // Giả sử có MaTrangThai trong TrangThaiPhongResponse
  ) {
    case 'SAN_SANG': // Cần định nghĩa hằng số cho MaTrangThaiPhong
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

interface RoomTableRowProps {
  phong: PhongListItemResponse;
}

export const RoomTableRow: React.FC<RoomTableRowProps> = ({ phong }) => {
  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
      <TableCell className="font-medium py-3 px-4 align-top">
        <Link
          to={`/facilities/rooms/${phong.phongID}`}
          className="hover:underline text-primary dark:text-ptit-red font-semibold group text-sm"
        >
          {phong.tenPhong}
          {phong.maPhong && (
            <span className="text-xs text-muted-foreground ml-1">
              ({phong.maPhong})
            </span>
          )}
        </Link>
      </TableCell>
      <TableCell className="text-xs py-3 px-4 text-muted-foreground align-top">
        {phong.toaNhaTang
          ? `${phong.toaNhaTang.toaNha.tenToaNha} - ${phong.toaNhaTang.loaiTang.tenLoaiTang}`
          : 'N/A'}
        {phong.soThuTuPhong ? ` - P.${phong.soThuTuPhong}` : ''}
        {phong.toaNhaTang?.toaNha.maToaNha && (
          <div className="text-slate-400 dark:text-slate-500">
            ({phong.toaNhaTang.toaNha.maToaNha})
          </div>
        )}
      </TableCell>
      <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
        {phong.loaiPhong.tenLoaiPhong}
      </TableCell>
      <TableCell className="text-center text-sm py-3 px-4 text-muted-foreground align-top">
        {phong.sucChua || '-'}
      </TableCell>
      <TableCell className="text-center py-3 px-4 align-top">
        {getStatusBadgeForPhong(
          phong.trangThaiPhong.maTrangThai,
          phong.trangThaiPhong.tenTrangThai
        )}
      </TableCell>
      <TableCell className="text-right py-3 px-4 align-top">
        <Link to={`/facilities/rooms/${phong.phongID}`}>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Xem
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
};
