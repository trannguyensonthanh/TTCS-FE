import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useRoomChangeRequests,
  useCancelRoomChangeRequestByUser,
} from '@/hooks/queries/roomChangeRequestQueries';

import { APIError } from '@/services/apiHelper';

import MaTrangThaiYeuCauDoiPhong from '@/enums/MaTrangThaiYeuCauDoiPhong.enum';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Loader2,
  Search,
  Eye,
  PlusCircle,
  Trash2,
  Shuffle,
  ExternalLink,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import {
  GetYeuCauDoiPhongParams,
  YeuCauDoiPhongListItemResponse,
} from '@/services/roomChangeRequest.service';

// --- Helper Functions (Lấy từ code phụ) ---
const formatDate = (
  dateString?: string | Date,
  customFormat = 'dd/MM/yyyy HH:mm'
): string => {
  if (!dateString) return 'N/A';
  try {
    const date =
      typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return 'Ngày không hợp lệ';
    return format(date, customFormat, { locale: vi });
  } catch (e) {
    return 'Ngày không hợp lệ';
  }
};

const getStatusBadgeForYeuCauDoiPhong = (
  maTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai)
    return (
      <Badge variant="outline" className="text-xs whitespace-nowrap">
        Chưa rõ
      </Badge>
    );
  switch (maTrangThai) {
    case MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG:
      return (
        <Badge
          variant="destructive"
          className="text-xs whitespace-nowrap bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-500/30"
        >
          Chờ duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.DA_DUYET_DOI_PHONG:
      return (
        <Badge
          variant="secondary"
          className="text-xs whitespace-nowrap bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/30"
        >
          Đã duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.TU_CHOI_DOI_PHONG:
      return (
        <Badge
          variant="destructive"
          className="text-xs whitespace-nowrap bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500/30"
        >
          Bị từ chối
        </Badge>
      );
    case MaTrangThaiYeuCauDoiPhong.DA_HUY_BOI_NGUOI_TAO:
      return (
        <Badge
          variant="outline"
          className="text-xs whitespace-nowrap border-gray-400 text-gray-500"
        >
          Đã hủy
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs whitespace-nowrap">
          {maTrangThai}
        </Badge>
      );
  }
};

// ---- Component Chính: Trang danh sách ----
const RoomChangeRequestsListPage = () => {
  const { user } = useAuth();
  const { can } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Xác định tab mặc định dựa trên quyền của người dùng
  const getDefaultTab = useCallback(() => {
    if (can('approve', 'YeuCauDoiPhong')) return 'pending_approval_change';
    if (can('create', 'YeuCauDoiPhong')) return 'my_change_requests';
    return 'all_changes';
  }, [can]);

  const [activeTab, setActiveTab] = useState<string>(getDefaultTab());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filterParams, setFilterParams] = useState<GetYeuCauDoiPhongParams>({
    page: 1,
    limit: 10,
    sortBy: 'NgayYeuCauDoi',
    sortOrder: 'desc',
  });

  // Cập nhật filterParams khi tab hoặc searchTerm thay đổi
  useEffect(() => {
    setFilterParams((prev) => {
      const newParams: GetYeuCauDoiPhongParams = {
        ...prev, // Giữ lại các setting như sortBy, sortOrder
        page: 1, // Luôn reset về trang 1 khi filter thay đổi
        searchTerm: debouncedSearchTerm || undefined,
        trangThaiYcDoiPhongMa: undefined, // Reset filter theo tab
        nguoiYeuCauID: undefined, // Reset filter theo tab
      };

      if (activeTab === 'pending_approval_change') {
        newParams.trangThaiYcDoiPhongMa =
          MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG;
      } else if (activeTab === 'my_change_requests' && user?.nguoiDungID) {
        newParams.nguoiYeuCauID = user.nguoiDungID;
      }
      // Tab 'all_changes' không cần set thêm param nào

      return newParams;
    });
  }, [debouncedSearchTerm, activeTab, user?.nguoiDungID]);

  // --- Lấy dữ liệu danh sách ---
  const {
    data: paginatedChangeRequests,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch,
  } = useRoomChangeRequests(filterParams, {
    staleTime: 1 * 60 * 1000, // Cache trong 1 phút
  });

  // --- Mutation để hủy yêu cầu ---
  const cancelChangeRequestMutation = useCancelRoomChangeRequestByUser({
    onSuccess: () => {
      toast.success('Đã hủy yêu cầu đổi phòng thành công.');
      // Invalidate query của list để tự động fetch lại dữ liệu mới
      queryClient.invalidateQueries({ queryKey: ['roomChangeRequests'] });
    },
    onError: (error: APIError) => {
      toast.error('Lỗi khi hủy yêu cầu', {
        description: error.body?.message || 'Vui lòng thử lại.',
      });
    },
  });

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => setActiveTab(value);

  const handleUserCancelChangeRequest = (ycDoiPhongID: number) => {
    toast.warning(
      `Bạn có chắc chắn muốn hủy yêu cầu đổi phòng #${ycDoiPhongID} này không?`,
      {
        action: {
          label: 'Xác nhận hủy',
          onClick: () => cancelChangeRequestMutation.mutate(ycDoiPhongID),
        },
        cancel: { label: 'Không', onClick: () => {} },
        duration: 10000,
      }
    );
  };

  // --- Quyền hạn và Dữ liệu hiển thị ---
  const canCreateChangeRequest = can('create', 'YeuCauDoiPhong');
  const canProcessChangeRequests = can('approve', 'YeuCauDoiPhong');

  const requestsToDisplay = paginatedChangeRequests?.items || [];
  const totalPages = paginatedChangeRequests?.totalPages || 1;
  const currentPage = paginatedChangeRequests?.currentPage || 1;

  // --- Render Functions ---
  const renderChangeRequestsTable = (
    requests: YeuCauDoiPhongListItemResponse[]
  ) => (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="w-[25%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Sự kiện
            </TableHead>
            <TableHead className="w-[18%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Phòng Hiện Tại
            </TableHead>
            <TableHead className="w-[18%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Người Yêu Cầu
            </TableHead>
            <TableHead className="w-[15%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Ngày YC Đổi
            </TableHead>
            <TableHead className="text-center w-[12%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Trạng Thái
            </TableHead>
            <TableHead className="text-right w-[12%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow
              key={req.ycDoiPhongID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-medium py-2.5 px-4 align-top">
                <Link
                  to={`/events/${req.suKien.suKienID}`}
                  className="hover:underline text-primary dark:text-ptit-red font-semibold group text-sm line-clamp-2"
                  title={req.suKien.tenSK}
                >
                  {req.suKien.tenSK}
                  <ExternalLink className="inline-block ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </Link>
              </TableCell>
              <TableCell className="text-sm py-2.5 px-4 align-top">
                {req.phongHienTai.tenPhong}{' '}
                <span className="text-xs text-muted-foreground">
                  ({req.phongHienTai.maPhong})
                </span>
              </TableCell>
              <TableCell className="text-sm py-2.5 px-4 text-muted-foreground align-top">
                {req.nguoiYeuCau.hoTen}
              </TableCell>
              <TableCell className="text-sm py-2.5 px-4 text-muted-foreground align-top">
                {formatDate(req.ngayYeuCauDoi, 'dd/MM/yy HH:mm')}
              </TableCell>
              <TableCell className="text-center py-2.5 px-4 align-top">
                {getStatusBadgeForYeuCauDoiPhong(
                  req.trangThaiYeuCauDoiPhong.maTrangThai
                )}
              </TableCell>
              <TableCell className="text-right py-2.5 px-4 align-top">
                {/* ACTION: Điều hướng đến trang xử lý chi tiết thay vì mở dialog */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/facilities/room-change-requests/process/${req.ycDoiPhongID}`
                    )
                  }
                  className="mr-2 h-8 text-xs"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />{' '}
                  {canProcessChangeRequests ? 'Xử lý' : 'Xem'}
                </Button>
                {/* ACTION: Hủy yêu cầu (chỉ người tạo và khi YC đang chờ duyệt) */}
                {user?.nguoiDungID === req.nguoiYeuCau.nguoiDungID &&
                  req.trangThaiYeuCauDoiPhong.maTrangThai ===
                    MaTrangThaiYeuCauDoiPhong.CHO_DUYET_DOI_PHONG && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      onClick={() =>
                        handleUserCancelChangeRequest(req.ycDoiPhongID)
                      }
                      title="Hủy Yêu Cầu Đổi Phòng"
                      disabled={cancelChangeRequestMutation.isPending}
                    >
                      {cancelChangeRequestMutation.isPending &&
                      cancelChangeRequestMutation.variables ===
                        req.ycDoiPhongID ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout
      pageTitle="Quản Lý Yêu Cầu Đổi Phòng"
      headerActions={
        canCreateChangeRequest && (
          <Link to="/facilities/room-change-requests/new">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              <Shuffle className="mr-2 h-4 w-4" /> Tạo Yêu Cầu Đổi Phòng
            </Button>
          </Link>
        )
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <TabsList className="bg-card border dark:border-slate-700 p-1 rounded-lg shadow-sm">
              <TabsTrigger
                value="all_changes"
                className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
              >
                Tất cả
              </TabsTrigger>
              {canProcessChangeRequests && (
                <TabsTrigger
                  value="pending_approval_change"
                  className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
                >
                  Chờ Duyệt
                </TabsTrigger>
              )}
              {canCreateChangeRequest && (
                <TabsTrigger
                  value="my_change_requests"
                  className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
                >
                  YC của tôi
                </TabsTrigger>
              )}
            </TabsList>
            <div className="relative w-full sm:w-auto sm:max-w-sm mt-2 sm:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo tên sự kiện, phòng..."
                className="pl-10 h-10 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value={activeTab}>
            {(isLoading || isFetching) && !requestsToDisplay.length ? (
              <Card className="shadow-sm">
                <CardContent className="py-20 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                </CardContent>
              </Card>
            ) : !isLoading && requestsToDisplay.length === 0 ? (
              <Card className="shadow-sm border-dashed">
                <CardContent className="py-16 text-center">
                  <Shuffle className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-xl font-semibold text-muted-foreground">
                    Không có yêu cầu đổi phòng nào.
                  </p>
                  {canCreateChangeRequest &&
                    activeTab !== 'pending_approval_change' && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Bạn có thể{' '}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                          onClick={() =>
                            navigate('/facilities/room-change-requests/new')
                          }
                        >
                          tạo yêu cầu mới
                        </Button>
                        .
                      </p>
                    )}
                </CardContent>
              </Card>
            ) : (
              renderChangeRequestsTable(requestsToDisplay)
            )}
            {totalPages > 1 && (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading || isFetching}
                className="mt-8"
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
      {/* Tất cả các Dialog đã được loại bỏ khỏi trang này */}
    </DashboardLayout>
  );
};

export default RoomChangeRequestsListPage;
