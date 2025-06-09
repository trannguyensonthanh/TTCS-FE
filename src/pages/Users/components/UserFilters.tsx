// src/pages/Users/components/UserFilters.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Users,
  Briefcase,
  GraduationCap,
  Building,
  FilterIcon,
} from 'lucide-react'; // Thêm FilterIcon
import {
  LoaiNguoiDungEnum,
  LoaiNguoiDungLabels,
} from '@/enums/loaiNguoiDung.enum';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DonViListItem } from '@/services/donVi.service';
import { VaiTroHeThongItem } from '@/services/vaiTro.service';

interface UserFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedLoaiNguoiDung: string | undefined;
  onLoaiNguoiDungChange: (value: string | undefined) => void;
  selectedDonVi: string | undefined;
  onDonViChange: (value: string | undefined) => void;
  selectedVaiTroChucNang: string | undefined;
  onVaiTroChucNangChange: (value: string | undefined) => void;
  selectedIsActive: string | undefined; // 'true', 'false', hoặc 'all'
  onIsActiveChange: (value: string | undefined) => void;

  donViOptions: DonViListItem[]; // Danh sách đơn vị để lọc
  vaiTroOptions: VaiTroHeThongItem[]; // Danh sách vai trò chức năng để lọc
  isLoadingDonVi: boolean;
  isLoadingVaiTro: boolean;
}

export function UserFilters({
  searchTerm,
  onSearchTermChange,
  selectedLoaiNguoiDung,
  onLoaiNguoiDungChange,
  selectedDonVi,
  onDonViChange,
  selectedVaiTroChucNang,
  onVaiTroChucNangChange,
  selectedIsActive,
  onIsActiveChange,
  donViOptions,
  vaiTroOptions,
  isLoadingDonVi,
  isLoadingVaiTro,
}: UserFiltersProps) {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-card dark:border-slate-700 shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-1 xl:col-span-2">
          <label
            htmlFor="user-search-input"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Tìm kiếm Người Dùng
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="user-search-input"
              type="search"
              placeholder="Họ tên, Email, Mã định danh..."
              className="pl-10 h-10 rounded-md shadow-inner"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filter by LoaiNguoiDung */}
        <div>
          <label
            htmlFor="filter-loaiNguoiDung"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Loại Người Dùng
          </label>
          <Select
            value={selectedLoaiNguoiDung || 'all'}
            onValueChange={(value) =>
              onLoaiNguoiDungChange(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="filter-loaiNguoiDung" className="h-10">
              <SelectValue placeholder="Tất cả Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Loại</SelectItem>
              {Object.values(LoaiNguoiDungEnum).map((loai) => (
                <SelectItem key={loai} value={loai}>
                  {LoaiNguoiDungLabels[loai]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter by DonVi (Đơn vị công tác/Lớp/Khoa) */}
        <div>
          <label
            htmlFor="filter-donVi"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Đơn Vị
          </label>
          <Select
            value={selectedDonVi || 'all'}
            onValueChange={(value) =>
              onDonViChange(value === 'all' ? undefined : value)
            }
            disabled={isLoadingDonVi}
          >
            <SelectTrigger id="filter-donVi" className="h-10">
              <SelectValue
                placeholder={isLoadingDonVi ? 'Đang tải...' : 'Tất cả Đơn Vị'}
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Tất cả Đơn Vị</SelectItem>
              {donViOptions.map((option) => (
                <SelectItem
                  key={option.donViID}
                  value={option.donViID.toString()}
                >
                  {option.tenDonVi} ({option.loaiDonVi})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter by VaiTroChucNang */}
        <div>
          <label
            htmlFor="filter-vaiTroChucNang"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Vai Trò Chức Năng
          </label>
          <Select
            value={selectedVaiTroChucNang || 'all'}
            onValueChange={(value) =>
              onVaiTroChucNangChange(value === 'all' ? undefined : value)
            }
            disabled={isLoadingVaiTro}
          >
            <SelectTrigger id="filter-vaiTroChucNang" className="h-10">
              <SelectValue
                placeholder={isLoadingVaiTro ? 'Đang tải...' : 'Tất cả Vai Trò'}
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="all">Tất cả Vai Trò</SelectItem>
              {vaiTroOptions.map((option) => (
                <SelectItem key={option.vaiTroID} value={option.maVaiTro}>
                  {option.tenVaiTro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter by IsActive (Trạng thái tài khoản) */}
        {/* <div>
                <label
                htmlFor="filter-isActive"
                className="block text-xs font-medium text-muted-foreground mb-1"
                >
                Trạng Thái TK
                </label>
                <Select
                value={selectedIsActive || 'all'}
                onValueChange={(value) => onIsActiveChange(value === 'all' ? undefined : value)}
                >
                <SelectTrigger id="filter-isActive" className="h-10">
                    <SelectValue placeholder="Tất cả Trạng Thái" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả Trạng Thái</SelectItem>
                    <SelectItem value="true">Hoạt động (Active)</SelectItem>
                    <SelectItem value="false">Vô hiệu hóa (Inactive)</SelectItem>
                </SelectContent>
                </Select>
            </div> */}
      </div>
    </div>
  );
}
