/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard/components/MaintenanceRoomsTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Wrench, Eye } from 'lucide-react';
import {
  PaginatedPhongResponse,
  PhongListItemResponse,
} from '@/services/phong.service'; // Sử dụng lại type từ phong.service
import { APIError } from '@/services/apiHelper';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ReusablePagination } from '@/components/ui/ReusablePagination'; // Giả sử đã có
import { Tooltip } from '@/components/ui/tooltip';

interface MaintenanceRoomsTableProps {
  paginatedData: PaginatedPhongResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
  onPageChange: (page: number) => void;
  currentPage: number;
  itemsPerPage: number;
}

const MaintenanceRoomsTable: React.FC<MaintenanceRoomsTableProps> = ({
  paginatedData,
  isLoading,
  isError,
  error,
  onPageChange,
  currentPage,
  itemsPerPage,
}) => {
  const rooms = paginatedData?.items || [];
  const totalPages = paginatedData?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-destructive text-center p-4">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        Lỗi tải danh sách phòng bảo trì.
      </div>
    );
  }
  if (rooms.length === 0) {
    return (
      <div className="text-muted-foreground text-center p-10 italic">
        <Wrench className="mx-auto h-12 w-12 mb-3 text-gray-400" />
        Hiện không có phòng nào đang trong trạng thái bảo trì.
      </div>
    );
  }

  const formatDateNullable = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'dd/MM/yyyy', { locale: vi }) : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] rounded-md border dark:border-slate-700">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm dark:bg-slate-800/90 z-10">
            <TableRow>
              <TableHead className="font-semibold min-w-[180px]">
                Tên Phòng (Mã)
              </TableHead>
              <TableHead className="font-semibold">Loại Phòng</TableHead>
              <TableHead className="font-semibold">Tòa Nhà - Tầng</TableHead>
              {/* BE có thể trả về thông tin ngày bắt đầu/kết thúc dự kiến bảo trì nếu có */}
              {/* <TableHead className="font-semibold text-center">BĐ Bảo Trì DK</TableHead>
                <TableHead className="font-semibold text-center">KT Bảo Trì DK</TableHead> */}
              <TableHead className="font-semibold max-w-[250px]">
                Ghi Chú Bảo Trì
              </TableHead>
              <TableHead className="text-right font-semibold w-[100px]">
                Chi Tiết
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((phong) => (
              <TableRow
                key={phong.phongID}
                className="hover:bg-accent/50 dark:hover:bg-slate-800/50"
              >
                <TableCell>
                  <p className="font-medium text-primary dark:text-ptit-blue line-clamp-2">
                    {phong.tenPhong}
                  </p>
                  {phong.maPhong && (
                    <p className="text-xs text-muted-foreground font-mono">
                      ({phong.maPhong})
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {phong.loaiPhong.tenLoaiPhong}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {phong.toaNhaTang
                    ? `${phong.toaNhaTang.toaNha.tenToaNha} - ${phong.toaNhaTang.loaiTang.tenLoaiTang}`
                    : 'N/A'}
                </TableCell>
                {/* Cột ngày bảo trì nếu có */}
                {/* <TableCell className="text-center text-xs text-muted-foreground">
                    {formatDateNullable(phong.ngayBatDauBaoTriDuKien)}
                </TableCell>
                 <TableCell className="text-center text-xs text-muted-foreground">
                    {formatDateNullable(phong.ngayKetThucBaoTriDuKien)}
                </TableCell> */}
                <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate">
                  {(phong as any).ghiChuBaoTri ||
                    phong.trangThaiPhong.moTa ||
                    'Không có ghi chú'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 px-2"
                  >
                    {/* Điều hướng đến trang chi tiết phòng của QLCSVC */}
                    <Link to={`/facilities/rooms/${phong.phongID}`}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> Xem
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {totalPages > 1 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isLoading} // isFetching từ useQuery nữa
        />
      )}
    </div>
  );
};

export default MaintenanceRoomsTable;
