// src/pages/EventInvitationManagement/components/InvitedUsersTable.tsx
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
import {
  Loader2,
  AlertTriangle,
  UserX,
  CheckCircle,
  HelpCircle,
  Clock,
  UserCircle2,
  Trash2,
  Eye,
  Users,
} from 'lucide-react';
import {
  PaginatedNguoiDuocMoiChiTietResponse,
  NguoiDuocMoiChiTietItem,
} from '@/services/eventInvitationManagement.service'; // Hoặc từ invite.service nếu dùng chung type
import { APIError } from '@/services/apiHelper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/stringUtils';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface InvitedUsersTableProps {
  paginatedInvitedUsers?: PaginatedNguoiDuocMoiChiTietResponse;
  isLoading: boolean;
  isFetching?: boolean; // Thêm isFetching cho pagination
  isError: boolean;
  error: APIError | Error | null;
  onRevokeInvite: (invitation: NguoiDuocMoiChiTietItem) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

const InvitedUsersTable: React.FC<InvitedUsersTableProps> = ({
  paginatedInvitedUsers,
  isLoading,
  isFetching,
  isError,
  error,
  onRevokeInvite,
  currentPage,
  onPageChange,
  itemsPerPage,
}) => {
  const invitedUsers = paginatedInvitedUsers?.items || [];
  const totalPages = paginatedInvitedUsers?.totalPages || 1;

  const getStatusBadge = (isChapNhanMoi: boolean | null | undefined) => {
    if (isChapNhanMoi === true) {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300 border-green-300 dark:border-green-600"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Đã chấp nhận
        </Badge>
      );
    }
    if (isChapNhanMoi === false) {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300 border-red-300 dark:border-red-600"
        >
          <UserX className="mr-1 h-3 w-3" />
          Đã từ chối
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300 border-amber-300 dark:border-amber-600"
      >
        <HelpCircle className="mr-1 h-3 w-3" />
        Chờ phản hồi
      </Badge>
    );
  };

  const formatDateNullable = (
    dateString?: string | null,
    formatString = 'dd/MM/yyyy HH:mm'
  ) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, formatString, { locale: vi }) : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  if (isLoading && invitedUsers.length === 0) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-destructive text-center p-6 bg-red-50 dark:bg-red-900/30 rounded-md">
        <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
        Lỗi tải danh sách người được mời.
      </div>
    );
  }
  if (!isLoading && invitedUsers.length === 0) {
    return (
      <div className="text-muted-foreground text-center p-10 italic">
        <Users className="mx-auto h-16 w-16 mb-4 text-gray-400" />
        Không có ai trong danh sách mời cho bộ lọc hiện tại.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <ScrollArea className="h-[calc(100vh-450px)] min-h-[300px] rounded-md border dark:border-slate-700">
          {' '}
          {/* Điều chỉnh chiều cao */}
          <Table>
            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-sm dark:bg-slate-800/90 z-10">
              <TableRow>
                <TableHead className="w-[250px] font-semibold">
                  Người Được Mời
                </TableHead>
                <TableHead className="font-semibold">
                  Thông Tin Đơn Vị/Lớp
                </TableHead>
                <TableHead className="font-semibold text-center">
                  Vai Trò Dự Kiến
                </TableHead>
                <TableHead className="font-semibold text-center">
                  Trạng Thái Phản Hồi
                </TableHead>
                {/* <TableHead className="font-semibold text-center">
                  Thời Gian Mời
                </TableHead> */}
                <TableHead className="font-semibold text-center">
                  Thời Gian Phản Hồi
                </TableHead>
                <TableHead className="text-right font-semibold w-[100px]">
                  Hành Động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitedUsers.map((invite) => (
                <TableRow
                  key={invite.moiThamGiaID}
                  className="hover:bg-muted/30 dark:hover:bg-slate-800/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={invite.nguoiDuocMoi.anhDaiDien || undefined}
                          alt={invite.nguoiDuocMoi.hoTen}
                        />
                        <AvatarFallback>
                          {getInitials(invite.nguoiDuocMoi.hoTen)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-foreground line-clamp-1">
                          {invite.nguoiDuocMoi.hoTen}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {invite.nguoiDuocMoi.email}
                        </p>
                        {invite.nguoiDuocMoi.maDinhDanh && (
                          <p className="text-xs text-muted-foreground font-mono">
                            ({invite.nguoiDuocMoi.maDinhDanh})
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {invite.nguoiDuocMoi.thongTinDonVi || 'N/A'}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {invite.vaiTroDuKienSK ? (
                      <Badge variant="outline" className="whitespace-nowrap">
                        {invite.vaiTroDuKienSK}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Không có
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(invite.isChapNhanMoi)}
                  </TableCell>
                  {/* <TableCell className="text-center text-xs text-muted-foreground">
                    {formatDateNullable(invite.tgGuiMoi)}
                  </TableCell> */}
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {formatDateNullable(invite.tgPhanHoiMoi)}
                  </TableCell>
                  <TableCell className="text-right">
                    {invite.isChapNhanMoi === null ? ( // Chỉ cho thu hồi nếu chưa phản hồi
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onRevokeInvite(invite)}
                          >
                            <UserX className="h-4 w-4" />
                            <span className="sr-only">Thu hồi lời mời</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Thu hồi lời mời</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Đã phản hồi
                      </span>
                    )}
                    {/* Nút xem chi tiết người dùng nếu cần */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <ReusablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              isLoading={isLoading || isFetching}
            />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default InvitedUsersTable;
