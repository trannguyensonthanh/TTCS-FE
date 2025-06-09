// src/pages/Units/components/UnitFilters.tsx

import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { DonViSelectOption, LoaiDonViOption } from '@/services/donVi.service';

interface UnitFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedLoaiDonVi: string | undefined;
  onLoaiDonViChange: (value: string | undefined) => void;
  selectedDonViCha: string | undefined;
  onDonViChaChange: (value: string | undefined) => void;
  loaiDonViOptions: LoaiDonViOption[];
  donViChaOptions: DonViSelectOption[]; // Danh sách tất cả đơn vị để làm cha
  isLoadingLoaiDonVi: boolean;
  isLoadingDonViCha: boolean;
}

export function UnitFilters({
  searchTerm,
  onSearchTermChange,
  selectedLoaiDonVi,
  onLoaiDonViChange,
  selectedDonViCha,
  onDonViChaChange,
  loaiDonViOptions,
  donViChaOptions,
  isLoadingLoaiDonVi,
  isLoadingDonViCha,
}: UnitFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
      {/* Search Input */}
      <div className="lg:col-span-1">
        <label
          htmlFor="unit-search"
          className="block text-sm font-medium text-muted-foreground mb-1"
        >
          Tìm kiếm Đơn vị
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="unit-search"
            type="search"
            placeholder="Tên hoặc Mã đơn vị..."
            className="pl-10 h-10 rounded-lg shadow-inner"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filter by LoaiDonVi */}
      <div>
        <label
          htmlFor="filter-loaiDonVi"
          className="block text-sm font-medium text-muted-foreground mb-1"
        >
          Lọc theo Loại Đơn Vị
        </label>
        <Select
          value={selectedLoaiDonVi || 'all'}
          onValueChange={(value) =>
            onLoaiDonViChange(value === 'all' ? undefined : value)
          }
          disabled={isLoadingLoaiDonVi}
        >
          <SelectTrigger id="filter-loaiDonVi" className="h-10">
            <SelectValue
              placeholder={
                isLoadingLoaiDonVi ? 'Đang tải...' : 'Tất cả Loại Đơn Vị'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Loại Đơn Vị</SelectItem>
            {loaiDonViOptions.map((option) => (
              <SelectItem key={option.maLoai} value={option.maLoai}>
                {option.tenLoai}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter by DonViCha */}
      <div>
        <label
          htmlFor="filter-donViCha"
          className="block text-sm font-medium text-muted-foreground mb-1"
        >
          Lọc theo Đơn Vị Cha
        </label>
        <Select
          value={selectedDonViCha || 'all'}
          onValueChange={(value) =>
            onDonViChaChange(value === 'all' ? undefined : value)
          }
          disabled={isLoadingDonViCha}
        >
          <SelectTrigger id="filter-donViCha" className="h-10">
            <SelectValue
              placeholder={
                isLoadingDonViCha ? 'Đang tải...' : 'Tất cả Đơn Vị Cha'
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {' '}
            {/* Giới hạn chiều cao cho danh sách dài */}
            <SelectItem value="all">Tất cả Đơn Vị Cha</SelectItem>
            {donViChaOptions.map((option) => (
              <SelectItem
                key={option.donViID}
                value={option.donViID.toString()}
              >
                {option.tenDonViHienThi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
