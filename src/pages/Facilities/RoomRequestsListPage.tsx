import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import DashboardLayout from '@/components/DashboardLayout';
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
  useRoomRequests, // Hook lấy danh sách YC mượn phòng (header)
  useCancelRoomRequestByUser, // Hook để CBTC hủy YC của họ
} from '@/hooks/queries/roomRequestQueries';

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum';
import MaTrangThaiYeuCauPhong from '@/enums/MaTrangThaiYeuCauPhong.enum';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Không cần TabsContent ở đây
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Loader2,
  Search,
  Eye,
  PlusCircle,
  Trash2,
  ListChecks,
  ExternalLink,
  Edit,
  MoreHorizontal,
  Filter,
  CalendarDays,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { EVENT_QUERY_KEYS } from '@/hooks/queries/eventQueries';
import {
  GetYeuCauMuonPhongParams,
  YeuCauMuonPhongListItemResponse,
} from '@/services/roomRequest.service';

// --- Helper Functions ---
const formatDate = (
  dateString?: string | Date,
  customFormat = 'dd/MM/yyyy HH:mm'
) => {
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

const getStatusBadgeForYeuCauPhong = (
  maTrangThai?: string
): React.ReactNode => {
  if (!maTrangThai)
    return (
      <Badge variant="outline" className="text-xs whitespace-nowrap">
        Chưa rõ
      </Badge>
    );
  // Dựa trên MaTrangThaiYeuCauPhong (cho trạng thái CHUNG của YeuCauMuonPhong)
  switch (maTrangThai) {
    case MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY:
      return (
        <Badge
          variant="destructive"
          className="text-xs whitespace-nowrap bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40"
        >
          Chờ CSVC Xử Lý
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_DANG_XU_LY:
      return (
        <Badge
          variant="outline"
          className="text-xs whitespace-nowrap bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40"
        >
          CSVC Đang Xử Lý
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_DA_XU_LY_MOT_PHAN:
      return (
        <Badge className="text-xs whitespace-nowrap bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/40">
          Đã Xử Lý Một Phần
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_HOAN_TAT_DUYET:
      return (
        <Badge
          variant="secondary"
          className="text-xs whitespace-nowrap bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40"
        >
          Đã Hoàn Tất Duyệt
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_TU_CHOI_TOAN_BO:
      return (
        <Badge
          variant="destructive"
          className="text-xs whitespace-nowrap bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
        >
          CSVC Từ Chối Toàn Bộ
        </Badge>
      );
    case MaTrangThaiYeuCauPhong.YCCP_DA_HUY_BOI_NGUOI_TAO: // Mã trạng thái mới
      return (
        <Badge
          variant="outline"
          className="text-xs whitespace-nowrap border-gray-400 text-gray-500 dark:border-gray-600 dark:text-gray-400"
        >
          Đã Hủy Bởi Người YC
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

// ---- Component Chính ----
const RoomRequestsListPage = () => {
  const { user } = useAuth();
  const { hasRole, can } = useRole(); // Giả sử can(action, resource)
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getDefaultTab = () => {
    if (can('approve', 'YeuCauMuonPhong')) return 'pending_csvc'; // CSVC và Admin
    if (can('create', 'YeuCauMuonPhong')) return 'my_requests'; // CBTC
    return 'all'; // Fallback
  };
  console.log('Default tab:', getDefaultTab());
  const [activeTab, setActiveTab] = useState<string>(getDefaultTab());

  const [filterParams, setFilterParams] = useState<GetYeuCauMuonPhongParams>({
    page: 1,
    limit: 10,
    sortBy: 'NgayYeuCau',
    sortOrder: 'desc',
    // TrangThaiChungMa sẽ được set bởi tab
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- Data Fetching ---
  const {
    data: paginatedRequests,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchRoomRequests,
  } = useRoomRequests(filterParams, {
    staleTime: 1 * 60 * 1000,
    enabled: !!user, // Chỉ fetch khi đã có thông tin user (đã đăng nhập)
  });

  // --- Mutations ---
  const cancelRequestMutation = useCancelRoomRequestByUser({
    onSuccess: (data) => {
      refetchRoomRequests();
      if (data.suKien?.suKienID) {
        // API trả về YC đã cập nhật bao gồm thông tin sự kiện
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEYS.detail(data.suKien.suKienID),
        });
        queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
      }
    },
  });

  // --- Event Handlers ---
  useEffect(() => {
    const paramsUpdate: Partial<GetYeuCauMuonPhongParams> = {
      searchTerm: debouncedSearchTerm || undefined,
      page: 1,
    };
    if (activeTab === 'pending_csvc') {
      paramsUpdate.trangThaiChungMa = MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY;
      paramsUpdate.nguoiYeuCauID = undefined; // CSVC xem tất cả
    } else if (activeTab === 'my_requests' && user?.nguoiDungID) {
      paramsUpdate.nguoiYeuCauID = user.nguoiDungID;
      paramsUpdate.trangThaiChungMa = undefined; // Xem tất cả trạng thái YC của mình
    } else {
      // Tab 'all'
      paramsUpdate.trangThaiChungMa = undefined;
      paramsUpdate.nguoiYeuCauID = undefined;
      // Nếu user không phải CSVC/Admin, tab 'all' cũng chỉ nên hiện YC của họ hoặc đơn vị họ
      if (!can('approve', 'YeuCauMuonPhong') && user?.nguoiDungID) {
        // paramsUpdate.donViYeuCauID = user.donViID_chinh; // Cần logic lấy đơn vị chính của user
        // Hoặc để backend tự xử lý dựa trên vai trò người dùng
      }
    }
    setFilterParams((prev) => ({ ...prev, ...paramsUpdate }));
  }, [debouncedSearchTerm, activeTab, user?.nguoiDungID, can]);

  const handlePageChange = (newPage: number) => {
    setFilterParams((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (value: string) => setActiveTab(value);

  const handleUserCancelRequest = useCallback(
    (ycMuonPhongID: number) => {
      toast.warning(
        `Bạn có chắc chắn muốn hủy yêu cầu mượn phòng #${ycMuonPhongID} không? Hành động này sẽ chuyển yêu cầu sang trạng thái "Đã Hủy Bởi Người YC".`,
        {
          action: {
            label: 'Xác nhận hủy',
            onClick: () => cancelRequestMutation.mutate(ycMuonPhongID),
          },
          cancel: { label: 'Không', onClick: () => {} },
          duration: 10000,
        }
      );
    },
    [cancelRequestMutation]
  );

  // --- Quyền ---
  const canCreateNewRequest = can('create', 'YeuCauMuonPhong');
  const canProcessRequests = can('approve', 'YeuCauMuonPhong'); // Quyền của CSVC/Admin

  const requestsToDisplay = paginatedRequests?.items || [];
  const totalPages = paginatedRequests?.totalPages || 1;
  const currentPage = paginatedRequests?.currentPage || 1;
  const totalItems = paginatedRequests?.totalItems || 0;

  if (isLoading && !requestsToDisplay.length && !isFetching) {
    return (
      <DashboardLayout pageTitle="Yêu Cầu Mượn Phòng">
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  if (isError && !requestsToDisplay.length) {
    const errorBody = (fetchError as APIError)?.body;
    return (
      <DashboardLayout pageTitle="Lỗi Tải Dữ Liệu">
        <div className="text-red-500 text-center py-10">
          Lỗi:{' '}
          {errorBody?.message ||
            (fetchError as Error)?.message ||
            'Không xác định'}{' '}
          <Button onClick={() => refetchRoomRequests()} className="ml-4">
            Thử lại
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // --- JSX Render Function for Table ---
  const renderRequestsTable = (requests: YeuCauMuonPhongListItemResponse[]) => (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="w-[25%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Sự kiện
            </TableHead>
            <TableHead className="w-[18%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Người Yêu Cầu
            </TableHead>
            <TableHead className="w-[18%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Đơn Vị YC
            </TableHead>
            <TableHead className="w-[13%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Ngày Yêu Cầu
            </TableHead>
            <TableHead className="text-center w-[12%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Trạng Thái
            </TableHead>
            <TableHead className="text-center w-[7%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Items
            </TableHead>
            <TableHead className="text-right w-[7%] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow
              key={req.ycMuonPhongID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-medium py-2.5 px-4 align-top">
                <Link
                  to={`/events/${req.suKien.suKienID}`}
                  className="hover:underline text-primary dark:text-ptit-red font-semibold group text-sm"
                >
                  {req.suKien.tenSK}
                  <ExternalLink className="inline-block ml-1 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                </Link>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(parseISO(req.suKien.tgBatDauDK), 'dd/MM/yy HH:mm')}
                </div>
              </TableCell>
              <TableCell className="text-sm py-2.5 px-4 text-muted-foreground align-top">
                {req.nguoiYeuCau.hoTen}
              </TableCell>
              <TableCell className="text-sm py-2.5 px-4 text-muted-foreground align-top">
                {req?.donViYeuCau?.tenDonVi}
              </TableCell>
              <TableCell className="text-sm py-2.5 px-4 text-muted-foreground align-top">
                {formatDate(req.ngayYeuCau, 'dd/MM/yy HH:mm')}
              </TableCell>
              <TableCell className="text-center py-2.5 px-4 align-top">
                {getStatusBadgeForYeuCauPhong(req.trangThaiChung.maTrangThai)}
              </TableCell>
              <TableCell className="text-center text-sm py-2.5 px-4 font-medium align-top">
                <span className="text-green-600 dark:text-green-400">
                  {req.soLuongChiTietDaXepPhong}
                </span>{' '}
                / {req.soLuongChiTietYeuCau}
              </TableCell>
              <TableCell className="text-right py-2.5 px-4 align-top">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(
                          `/facilities/room-requests/process/${req.ycMuonPhongID}`
                        )
                      }
                    >
                      {' '}
                      {/* Luôn có thể xem chi tiết / xử lý */}
                      <Eye className="mr-2 h-4 w-4" />{' '}
                      {canProcessRequests ? 'Xem & Xử lý' : 'Xem Chi Tiết'}
                    </DropdownMenuItem>
                    {req.nguoiYeuCau.nguoiDungID === user?.nguoiDungID &&
                      req.trangThaiChung.maTrangThai ===
                        MaTrangThaiYeuCauPhong.YCCP_CHO_XU_LY && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/facilities/room-requests/edit/${req.ycMuonPhongID}`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" /> Sửa Yêu Cầu
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUserCancelRequest(req.ycMuonPhongID)
                            }
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            disabled={
                              cancelRequestMutation.isPending &&
                              cancelRequestMutation.variables ===
                                req.ycMuonPhongID
                            }
                          >
                            {cancelRequestMutation.isPending &&
                            cancelRequestMutation.variables ===
                              req.ycMuonPhongID ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Hủy Yêu Cầu
                          </DropdownMenuItem>
                        </>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout
      pageTitle="Danh Sách Yêu Cầu Mượn Phòng"
      headerActions={
        canCreateNewRequest && (
          <Link to="/facilities/room-requests/new">
            <Button className="bg-gradient-to-r from-ptit-blue to-sky-500 hover:from-ptit-blue/90 hover:to-sky-500/90 text-white">
              <PlusCircle className="mr-2 h-5 w-5" /> Tạo Yêu Cầu Mới
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
                value="all"
                className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
              >
                Tất cả YC
              </TabsTrigger>
              {canProcessRequests && (
                <TabsTrigger
                  value="pending_csvc"
                  className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
                >
                  Chờ CSVC Xử Lý
                </TabsTrigger>
              )}
              {hasRole(MaVaiTro.CB_TO_CHUC_SU_KIEN) && !canProcessRequests && (
                <TabsTrigger
                  value="my_requests"
                  className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm"
                >
                  Yêu cầu Của Tôi
                </TabsTrigger>
              )}
            </TabsList>
            <div className="relative w-full sm:w-auto sm:max-w-xs mt-2 sm:mt-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm theo tên sự kiện, người YC..."
                className="pl-10 h-10 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value={activeTab}>
            {(isLoading || isFetching) && !requestsToDisplay.length ? (
              <Card className="shadow-lg">
                <CardContent className="py-20 text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                </CardContent>
              </Card>
            ) : !isLoading && requestsToDisplay.length === 0 ? (
              <Card className="shadow-lg border-dashed">
                <CardContent className="py-16 text-center">
                  <ListChecks className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-xl font-semibold text-muted-foreground">
                    Không có yêu cầu mượn phòng nào.
                  </p>
                  {canCreateNewRequest && activeTab !== 'pending_csvc' && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Hãy bắt đầu bằng cách{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() =>
                          navigate('/facilities/create-room-request')
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
              renderRequestsTable(requestsToDisplay)
            )}
            {paginatedRequests && totalPages > 1 && (
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
      {/* Các Dialog cho Chi Tiết / Xử Lý sẽ được điều hướng sang trang riêng thay vì modal ở đây */}
    </DashboardLayout>
  );
};

export default RoomRequestsListPage;
