// src/pages/Dashboard/components/PendingRequestsTable.tsx
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
import { Loader2, AlertTriangle, Eye, FileText } from 'lucide-react';
import { YeuCauChoXuLyItem } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface PendingRequestsTableProps {
  data: YeuCauChoXuLyItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
}

const getRequestTypeBadge = (type: string) => {
  switch (type) {
    case 'DUYET_SU_KIEN':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Duyệt Sự Kiện
        </Badge>
      );
    case 'DUYET_HUY_SU_KIEN':
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700">
          Duyệt Hủy
        </Badge>
      );
    case 'DUYET_MUON_PHONG':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          Duyệt Phòng
        </Badge>
      );
    case 'DUYET_DOI_PHONG':
      return (
        <Badge variant="outline" className="border-orange-400 text-orange-600">
          Duyệt Đổi Phòng
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const PendingRequestsTable: React.FC<PendingRequestsTableProps> = ({
  data,
  isLoading,
  isError,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-destructive text-center p-4">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        Lỗi tải yêu cầu chờ xử lý.
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="text-muted-foreground text-center p-4 italic">
        Không có yêu cầu nào đang chờ xử lý.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[370px] rounded-md border dark:border-slate-700">
      <Table>
        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm dark:bg-slate-800/90">
          <TableRow>
            <TableHead className="font-semibold min-w-[250px]">
              Nội Dung Yêu Cầu
            </TableHead>
            <TableHead className="font-semibold">Loại Yêu Cầu</TableHead>
            <TableHead className="font-semibold">Người Gửi</TableHead>
            <TableHead className="font-semibold text-center w-[120px]">
              Thời Gian Gửi
            </TableHead>
            <TableHead className="text-right font-semibold w-[100px]">
              Xử Lý
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((request) => (
            <TableRow
              key={request.idYeuCau + request.loaiYeuCau}
              className="hover:bg-accent/50 dark:hover:bg-slate-800/50"
            >
              <TableCell>
                <p className="font-medium text-foreground line-clamp-2">
                  {request.tenYeuCau}
                </p>
              </TableCell>
              <TableCell>{getRequestTypeBadge(request.loaiYeuCau)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {request.nguoiGuiYeuCau.hoTen}
                {request.nguoiGuiYeuCau.donVi && (
                  <span className="block text-muted-foreground/70">
                    ({request.nguoiGuiYeuCau.donVi})
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center text-xs text-muted-foreground">
                {formatDistanceToNowStrict(parseISO(request.ngayGuiYeuCau), {
                  addSuffix: true,
                  locale: vi,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="h-8 px-2.5 bg-primary/90 hover:bg-primary text-primary-foreground"
                >
                  <Link to={request.duongDanChiTiet || '#'}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Xử lý
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default PendingRequestsTable;
