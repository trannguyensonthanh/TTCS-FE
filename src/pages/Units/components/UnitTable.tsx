// src/pages/Units/components/UnitTable.tsx

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DonViListItem } from '@/services/donVi.service';

interface UnitTableProps {
  units: DonViListItem[];
  onEdit: (unit: DonViListItem) => void;
  onDelete: (unit: DonViListItem) => void;
  canManage: boolean; // Quyền quản lý (sửa, xóa)
}

export function UnitTable({
  units,
  onEdit,
  onDelete,
  canManage,
}: UnitTableProps) {
  const getLoaiDonViBadgeVariant = (
    loaiDonVi?: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (loaiDonVi?.toUpperCase()) {
      case 'KHOA':
        return 'default';
      case 'PHONG':
      case 'TRUNG_TAM':
        return 'secondary';
      case 'BAN':
        return 'outline';
      case 'CLB':
      case 'DOAN_THE':
        return 'destructive'; // Hoặc một màu khác, ví dụ 'warning'
      case 'BO_MON':
      case 'CO_SO':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="w-[250px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Tên Đơn Vị
            </TableHead>
            <TableHead className="w-[150px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Mã Đơn Vị
            </TableHead>
            <TableHead className="w-[180px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Loại Đơn Vị
            </TableHead>
            <TableHead className="min-w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Đơn Vị Cha
            </TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
              Mô Tả
            </TableHead>
            {canManage && (
              <TableHead className="text-right w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                Thao tác
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow
              key={unit.donViID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-medium py-3 px-4 text-primary dark:text-sky-400 align-top">
                {unit.tenDonVi}
              </TableCell>
              <TableCell className="font-mono py-3 px-4 text-sm text-muted-foreground align-top">
                {unit.maDonVi || '-'}
              </TableCell>
              <TableCell className="py-3 px-4 align-top">
                <Badge
                  variant={getLoaiDonViBadgeVariant(unit.loaiDonVi)}
                  className="text-xs"
                >
                  {unit.tenLoaiDonVi || unit.loaiDonVi}
                </Badge>
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top">
                {unit.donViCha?.tenDonVi || '-'}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top truncate max-w-xs">
                {unit.moTaDv || 'Không có mô tả'}
              </TableCell>
              {canManage && (
                <TableCell className="text-right py-3 px-4 align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(unit)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(unit)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
