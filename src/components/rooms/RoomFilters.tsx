import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import { TrangThaiPhongResponse } from '@/services/phong.service';
import { ToaNhaResponseMin } from '@/services/toaNha.service';
import { ToaNhaTangForSelectResponse } from '@/services/danhMuc.service';

interface RoomFiltersProps {
  // Giá trị filter hiện tại từ component cha
  currentSearchTerm: string;
  currentLoaiPhongID?: string;
  currentTrangThaiPhongID?: string;
  currentToaNhaID?: string;
  currentToaNhaTangID?: string;
  currentSucChua: [number, number];
  // currentAvailableDateRange?: DateRange; // Nếu có lọc theo ngày trống

  // Hàm callback để cập nhật state ở component cha
  onSearchTermChange: (term: string) => void;
  onLoaiPhongChange: (loaiPhongID?: string) => void;
  onTrangThaiPhongChange: (trangThaiPhongID?: string) => void;
  onToaNhaChange: (toaNhaID?: string) => void; // Sẽ reset tầng
  onToaNhaTangChange: (toaNhaTangID?: string) => void;
  onSucChuaChange: (value: [number, number]) => void; // Khi nhả chuột slider
  // onAvailableDateRangeChange?: (dateRange?: DateRange) => void; // Nếu có

  onResetFilters: () => void; // Hàm để reset tất cả bộ lọc

  // Data cho selects
  dsLoaiPhong?: LoaiPhongResponseMin[];
  isLoadingLoaiPhong?: boolean;
  dsTrangThaiPhong?: TrangThaiPhongResponse[];
  isLoadingTrangThaiPhong?: boolean;
  dsToaNha?: ToaNhaResponseMin[];
  isLoadingToaNha?: boolean;
  dsToaNhaTang?: ToaNhaTangForSelectResponse[]; // Danh sách tầng đã được lọc theo tòa nhà ở component cha
  isLoadingToaNhaTang?: boolean;
}

export const RoomFilters: React.FC<RoomFiltersProps> = ({
  currentSearchTerm,
  currentLoaiPhongID,
  currentTrangThaiPhongID,
  currentToaNhaID,
  currentToaNhaTangID,
  currentSucChua,
  onSearchTermChange,
  onLoaiPhongChange,
  onTrangThaiPhongChange,
  onToaNhaChange,
  onToaNhaTangChange,
  onSucChuaChange,
  onResetFilters,
  dsLoaiPhong,
  isLoadingLoaiPhong,
  dsTrangThaiPhong,
  isLoadingTrangThaiPhong,
  dsToaNha,
  isLoadingToaNha,
  dsToaNhaTang,
  isLoadingToaNhaTang,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Local state cho slider để tránh re-render liên tục khi kéo
  const [localSliderSucChua, setLocalSliderSucChua] =
    useState<[number, number]>(currentSucChua);

  // Cập nhật localSliderSucChua khi prop currentSucChua thay đổi (ví dụ khi reset filter)
  useEffect(() => {
    setLocalSliderSucChua(currentSucChua);
  }, [currentSucChua]);

  const handleSliderValueChange = (value: [number, number]) => {
    setLocalSliderSucChua(value);
  };

  const handleSliderValueCommit = (value: [number, number]) => {
    onSucChuaChange(value); // Gọi callback chính khi nhả chuột
  };

  return (
    <Card className="mb-8 shadow-xl border-border dark:border-slate-800 bg-card top-16 z-20">
      {' '}
      {/* Sticky filters */}
      <CardHeader className="pb-4 border-b dark:border-slate-700/70">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center gap-2 mb-3 sm:mb-0">
            <Filter className="h-6 w-6 text-primary dark:text-ptit-red" />
            <CardTitle className="text-xl font-semibold">
              Bộ Lọc Tìm Kiếm Phòng
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm hover:bg-transparent p-0 h-auto text-primary"
            >
              {showAdvancedFilters ? 'Ẩn bộ lọc nâng cao' : 'Lọc nâng cao'}
              <ChevronDown
                className={cn(
                  'ml-1.5 h-4 w-4 transition-transform duration-200',
                  showAdvancedFilters && 'rotate-180'
                )}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-sm h-auto py-1.5 px-3"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Xóa bộ lọc
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 items-end">
          <div className="lg:col-span-2">
            <Label
              htmlFor="search-room-public"
              className="text-xs font-medium text-muted-foreground"
            >
              Tên hoặc Mã phòng
            </Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-room-public"
                type="search"
                placeholder="Nhập từ khóa..."
                className="pl-10 h-10 rounded-md bg-background/50 dark:bg-slate-800/50 focus:ring-primary dark:focus:ring-ptit-red"
                value={currentSearchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="filter-loaiphong-public"
              className="text-xs font-medium text-muted-foreground"
            >
              Loại phòng
            </Label>
            <Select
              value={currentLoaiPhongID || 'all'}
              onValueChange={(value) =>
                onLoaiPhongChange(value === 'all' ? undefined : value)
              }
              disabled={isLoadingLoaiPhong}
            >
              <SelectTrigger
                id="filter-loaiphong-public"
                className="h-10 rounded-md mt-1 bg-background/50 dark:bg-slate-800/50"
              >
                <SelectValue
                  placeholder={
                    isLoadingLoaiPhong ? 'Đang tải...' : 'Tất cả loại'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại phòng</SelectItem>
                {dsLoaiPhong?.map((lp) => (
                  <SelectItem
                    key={lp.loaiPhongID}
                    value={lp.loaiPhongID.toString()}
                  >
                    {lp.tenLoaiPhong}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="filter-trangthaiphong-public"
              className="text-xs font-medium text-muted-foreground"
            >
              Trạng thái phòng
            </Label>
            <Select
              value={currentTrangThaiPhongID || 'all'}
              onValueChange={(value) =>
                onTrangThaiPhongChange(value === 'all' ? undefined : value)
              }
              disabled={isLoadingTrangThaiPhong}
            >
              <SelectTrigger
                id="filter-trangthaiphong-public"
                className="h-10 rounded-md mt-1 bg-background/50 dark:bg-slate-800/50"
              >
                <SelectValue
                  placeholder={
                    isLoadingTrangThaiPhong
                      ? 'Đang tải...'
                      : 'Tất cả trạng thái'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {dsTrangThaiPhong?.map((tt) => (
                  <SelectItem
                    key={tt.trangThaiPhongID}
                    value={tt.trangThaiPhongID.toString()}
                  >
                    {tt.tenTrangThai}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: '1.25rem' }} // 1.25rem = mt-5
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 items-end overflow-hidden"
            >
              <div>
                <Label
                  htmlFor="filter-toanha-public"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Tòa nhà
                </Label>
                <Select
                  value={currentToaNhaID || 'all'}
                  onValueChange={(value) =>
                    onToaNhaChange(value === 'all' ? undefined : value)
                  }
                  disabled={isLoadingToaNha}
                >
                  <SelectTrigger
                    id="filter-toanha-public"
                    className="h-10 rounded-md mt-1 bg-background/50 dark:bg-slate-800/50"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingToaNha ? 'Đang tải...' : 'Tất cả tòa nhà'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                    {dsToaNha?.map((tn) => (
                      <SelectItem
                        key={tn.toaNhaID}
                        value={tn.toaNhaID.toString()}
                      >
                        {tn.tenToaNha} {tn.maToaNha && `(${tn.maToaNha})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="filter-tang-public"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Tầng
                </Label>
                <Select
                  value={currentToaNhaTangID || 'all'}
                  onValueChange={(value) =>
                    onToaNhaTangChange(value === 'all' ? undefined : value)
                  }
                  disabled={isLoadingToaNhaTang || !currentToaNhaID}
                >
                  <SelectTrigger
                    id="filter-tang-public"
                    className="h-10 rounded-md mt-1 bg-background/50 dark:bg-slate-800/50"
                  >
                    <SelectValue
                      placeholder={
                        isLoadingToaNhaTang
                          ? 'Đang tải...'
                          : currentToaNhaID
                          ? 'Tất cả tầng'
                          : 'Chọn tòa nhà trước'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tầng</SelectItem>
                    {dsToaNhaTang?.map((tnt) => (
                      <SelectItem
                        key={tnt.toaNhaTangID}
                        value={tnt.toaNhaTangID.toString()}
                      >
                        {tnt.tenHienThi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1 space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="filter-succhua-public"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Sức chứa (người)
                  </Label>
                  <span className="text-xs font-semibold text-primary dark:text-ptit-red">
                    {localSliderSucChua[0]} -{' '}
                    {localSliderSucChua[1] >= 500
                      ? '500+'
                      : localSliderSucChua[1]}
                  </span>
                </div>
                <Slider
                  id="filter-succhua-public"
                  min={0}
                  max={500}
                  step={10}
                  value={localSliderSucChua}
                  onValueChange={handleSliderValueChange} // Cập nhật local state khi kéo
                  onValueCommit={handleSliderValueCommit} // Gọi callback chính khi nhả chuột
                  className="pt-2 [&>span:first-child]:h-1.5 [&>span:first-child>span]:h-1.5 [&>span:nth-child(2)>span]:h-3.5 [&>span:nth-child(2)>span]:w-3.5 [&>span:nth-child(2)>span]:border-2 [&>span:nth-child(3)>span]:h-3.5 [&>span:nth-child(3)>span]:w-3.5 [&>span:nth-child(3)>span]:border-2"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
