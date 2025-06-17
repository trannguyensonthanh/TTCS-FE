import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

import { ReusablePagination } from '@/components/ui/ReusablePagination'; // Component phân trang
import { RoomCard } from '@/components/rooms/RoomCard'; // Component thẻ phòng
import { RoomTableRow } from '@/components/rooms/RoomTableRow'; // Component dòng phòng trong bảng
import { RoomFilters } from '@/components/rooms/RoomFilters'; // Component bộ lọc
import { SkeletonCard } from '@/components/ui/SkeletonCard'; // Component Skeleton cho card
import { Skeleton } from '@/components/ui/skeleton'; // Component Skeleton cơ bản

import {
  usePhongList, // Sử dụng hook này từ phongQueries.ts
} from '@/hooks/queries/phongQueries';
import {
  useLoaiPhongList,
  useToaNhaListForSelect,
  useToaNhaTangListForSelect,
  useTrangThaiPhongList,
} from '@/hooks/queries/danhMucQueries';
import { APIError } from '@/services/apiHelper';
import { useAuth } from '@/context/AuthContext'; // Chỉ dùng để biết đã đăng nhập
import { useDebounce } from '@/hooks/useDebounce'; // Custom hook
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Chỉ dùng CardContent nếu Card cha ở ngoài
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Loader2,
  Building as BuildingIcon,
  History,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Badge } from '@/components/ui/badge';
import { GetPhongParams } from '@/services/phong.service';

// ---- Component Chính ----
const RoomsExplorerPage = () => {
  const navigate = useNavigate();

  // --- States cho Bộ lọc ---
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedLoaiPhongID, setSelectedLoaiPhongID] = useState<
    string | undefined
  >(undefined);
  const [selectedTrangThaiPhongID, setSelectedTrangThaiPhongID] = useState<
    string | undefined
  >(undefined);
  const [selectedToaNhaID, setSelectedToaNhaID] = useState<string | undefined>(
    undefined
  );
  const [selectedToaNhaTangID, setSelectedToaNhaTangID] = useState<
    string | undefined
  >(undefined);
  const [selectedSucChua, setSelectedSucChua] = useState<[number, number]>([
    0, 500,
  ]);

  // --- State cho Phân trang và Hiển thị ---
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // Số lượng phòng trên mỗi trang
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // --- Build filterParams từ các state lọc ---
  const filterParams = useMemo(
    (): GetPhongParams => ({
      page,
      limit,
      sortBy: 'TenPhong',
      sortOrder: 'asc',
      searchTerm: debouncedSearchTerm || undefined,
      loaiPhongID: selectedLoaiPhongID
        ? parseInt(selectedLoaiPhongID)
        : undefined,
      trangThaiPhongID: selectedTrangThaiPhongID
        ? parseInt(selectedTrangThaiPhongID)
        : undefined,
      toaNhaID: selectedToaNhaID ? parseInt(selectedToaNhaID) : undefined,
      toaNhaTangID: selectedToaNhaTangID
        ? parseInt(selectedToaNhaTangID)
        : undefined,
      sucChuaTu: selectedSucChua[0] > 0 ? selectedSucChua[0] : undefined,
      sucChuaDen: selectedSucChua[1] < 500 ? selectedSucChua[1] : undefined,
    }),
    [
      page,
      limit,
      debouncedSearchTerm,
      selectedLoaiPhongID,
      selectedTrangThaiPhongID,
      selectedToaNhaID,
      selectedToaNhaTangID,
      selectedSucChua,
    ]
  );

  // --- Data Fetching ---
  const {
    data: paginatedPhong,
    isLoading,
    isFetching,
    isError,
    error: fetchError,
    refetch: refetchPhongList,
  } = usePhongList(filterParams, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: dsLoaiPhong, isLoading: isLoadingLoaiPhong } = useLoaiPhongList(
    { limit: 100 }
  );
  const { data: dsTrangThaiPhong, isLoading: isLoadingTrangThaiPhong } =
    useTrangThaiPhongList({ limit: 50 });
  const { data: dsToaNha, isLoading: isLoadingToaNha } = useToaNhaListForSelect(
    { limit: 200 }
  );
  const { data: dsToaNhaTang, isLoading: isLoadingToaNhaTang } =
    useToaNhaTangListForSelect(
      {
        toaNhaID: selectedToaNhaID ? parseInt(selectedToaNhaID) : undefined,
        limit: 200,
      },
      { enabled: !!selectedToaNhaID }
    );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Cuộn lên đầu phần danh sách khi chuyển trang
    const listElement = document.getElementById('room-list-section');
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const phongList = paginatedPhong?.items || [];
  const totalPages = paginatedPhong?.totalPages || 1;
  const currentPage = paginatedPhong?.currentPage || 1;
  const totalItems = paginatedPhong?.totalItems || 0;

  const isLoadingInitial = isLoading && !phongList.length && !isFetching; // Chỉ true khi tải lần đầu và chưa có data
  const isListCurrentlyFetching = isFetching && phongList.length > 0; // True khi đang fetch lại (ví dụ đổi page/filter) nhưng đã có data cũ
  const isErrorInitial = isError && !phongList.length; // True khi lỗi xảy ra và chưa có data nào
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLoaiPhongID(undefined);
    setSelectedTrangThaiPhongID(undefined);
    setSelectedToaNhaID(undefined);
    setSelectedToaNhaTangID(undefined); // Tầng cũng reset
    setSelectedSucChua([0, 500]); // Reset về giá trị mặc định của slider
    setPage(1); // Quay về trang đầu
  };
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <main className="flex-1 container py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'circOut' }}
          className="mb-10 md:mb-12"
        >
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 dark:from-green-400 dark:via-teal-400 dark:to-cyan-300">
              Khám Phá Không Gian Học Tập & Sự Kiện
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Tìm kiếm và xem thông tin chi tiết về các phòng học, hội trường,
              phòng chức năng và trạng thái sử dụng tại PTITHCM.
            </p>
          </div>
        </motion.div>

        <RoomFilters
          currentSearchTerm={searchTerm}
          currentLoaiPhongID={selectedLoaiPhongID}
          currentTrangThaiPhongID={selectedTrangThaiPhongID}
          currentToaNhaID={selectedToaNhaID}
          currentToaNhaTangID={selectedToaNhaTangID}
          currentSucChua={selectedSucChua}
          onSearchTermChange={setSearchTerm} // Truyền thẳng hàm setSearchTerm
          onLoaiPhongChange={setSelectedLoaiPhongID}
          onTrangThaiPhongChange={setSelectedTrangThaiPhongID}
          onToaNhaChange={(toaNhaId) => {
            setSelectedToaNhaID(toaNhaId);
            setSelectedToaNhaTangID(undefined); // Reset tầng khi tòa nhà thay đổi
          }}
          onToaNhaTangChange={setSelectedToaNhaTangID}
          onSucChuaChange={setSelectedSucChua}
          onResetFilters={handleResetFilters} // Truyền hàm reset
          dsLoaiPhong={dsLoaiPhong}
          isLoadingLoaiPhong={isLoadingLoaiPhong}
          dsTrangThaiPhong={dsTrangThaiPhong}
          isLoadingTrangThaiPhong={isLoadingTrangThaiPhong}
          dsToaNha={dsToaNha}
          isLoadingToaNha={isLoadingToaNha}
          dsToaNhaTang={dsToaNhaTang}
          isLoadingToaNhaTang={isLoadingToaNhaTang}
        />
        <motion.div
          id="room-list-section" // ID để cuộn tới
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
              {(isLoadingInitial || isListCurrentlyFetching) && (
                <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
              )}
              Hiển thị{' '}
              {phongList.length > 0 ? (currentPage - 1) * limit + 1 : 0} -{' '}
              {Math.min(currentPage * limit, totalItems)} của {totalItems}{' '}
              phòng.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">
                Chế độ xem:
              </span>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Xem dạng lưới"
                className="h-9 w-9 rounded-md"
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="Xem dạng danh sách"
                className="h-9 w-9 rounded-md"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {isLoadingInitial ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: limit }).map((_, idx) => (
                  <SkeletonCard key={`skel-card-${idx}`} />
                ))}
              </div>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên Phòng</TableHead>
                        <TableHead>Vị Trí</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead className="text-center">SC</TableHead>
                        <TableHead className="text-center">
                          Trạng Thái
                        </TableHead>
                        <TableHead className="text-right">Chi tiết</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: limit }).map((_, idx) => (
                        <SkeletonTableRow key={`skel-row-${idx}`} />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          ) : isErrorInitial ? (
            <Card className="shadow-none border-dashed bg-card">
              <CardContent className="py-16 text-center">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                <h3 className="text-xl font-semibold text-destructive">
                  Lỗi khi tải dữ liệu phòng
                </h3>
                <p className="text-muted-foreground mt-2">
                  {fetchError?.body?.message ||
                    fetchError?.message ||
                    'Không thể kết nối đến máy chủ.'}
                </p>
                <Button
                  onClick={() => refetchPhongList()}
                  variant="outline"
                  className="mt-6"
                >
                  <History className="mr-2 h-4 w-4" /> Tải lại
                </Button>
              </CardContent>
            </Card>
          ) : phongList.length === 0 ? (
            <Card className="shadow-none border-dashed bg-card">
              <CardContent className="py-16 text-center">
                <BuildingIcon className="h-20 w-20 mx-auto mb-6 text-gray-300 dark:text-gray-700" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Không tìm thấy phòng nào
                </h3>
                <p className="text-muted-foreground mt-2">
                  Vui lòng thử lại với các bộ lọc khác hoặc làm mới trang.
                </p>
                <Button
                  onClick={() => handleResetFilters()}
                  variant="outline"
                  className="mt-6"
                >
                  <Filter className="mr-2 h-4 w-4" /> Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {phongList.map((phong, index) => (
                  <RoomCard key={phong.phongID} phong={phong} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // List View
            <Card className="shadow-lg border-border dark:border-slate-700 bg-card">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 dark:bg-slate-800/50 hover:bg-muted/30 dark:hover:bg-slate-800/40">
                      <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">
                        Tên Phòng (Mã)
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[20%]">
                        Vị Trí
                      </TableHead>
                      <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                        Loại Phòng
                      </TableHead>
                      <TableHead className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[10%]">
                        Sức Chứa
                      </TableHead>
                      <TableHead className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                        Trạng Thái
                      </TableHead>
                      <TableHead className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">
                        Chi tiết
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phongList.map((phong) => (
                      <RoomTableRow key={phong.phongID} phong={phong} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {totalPages > 1 && (
            <ReusablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading || isFetching} // Disable nút khi đang fetch
              className="mt-10"
            />
          )}
        </motion.div>
      </main>
      {/* Không có Dialog chi tiết phòng ở trang này, sẽ điều hướng sang trang riêng */}
    </div>
  );
};

// Skeleton Row for Table (tạo component này nếu chưa có)
const SkeletonTableRow = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-5 w-4/5 my-1" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-3/4 my-1" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-2/3 my-1" />
    </TableCell>
    <TableCell className="text-center">
      <Skeleton className="h-5 w-10 mx-auto my-1" />
    </TableCell>
    <TableCell className="text-center">
      <Skeleton className="h-6 w-20 mx-auto rounded-full my-1" />
    </TableCell>
    <TableCell className="text-right">
      <Skeleton className="h-8 w-20 ml-auto rounded-md my-1" />
    </TableCell>
  </TableRow>
);

export default RoomsExplorerPage;
