// src/pages/Users/Roles/components/RolesTable.tsx

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
import { Badge } from '@/components/ui/badge'; // Có thể dùng Badge để hiển thị số người dùng
import { Edit, Trash2, MoreHorizontal, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VaiTroHeThongItem } from '@/services/vaiTro.service';

interface RolesTableProps {
  roles: VaiTroHeThongItem[];
  onEdit: (role: VaiTroHeThongItem) => void;
  onDelete: (role: VaiTroHeThongItem) => void;
  canManage: boolean;
}

export function RolesTable({
  roles,
  onEdit,
  onDelete,
  canManage,
}: RolesTableProps) {
  return (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="w-[200px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Mã Vai Trò
            </TableHead>
            <TableHead className="min-w-[250px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Tên Vai Trò
            </TableHead>
            <TableHead className="min-w-[300px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Mô Tả
            </TableHead>
            <TableHead className="text-center w-[150px] px-4 py-3 text-sm font-semibold text-muted-foreground">
              Số Người Dùng
            </TableHead>
            {canManage && (
              <TableHead className="text-right w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                Thao tác
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow
              key={role.vaiTroID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-mono py-3 px-4 text-sm text-primary dark:text-sky-400 align-top">
                {role.maVaiTro}
              </TableCell>
              <TableCell className="font-medium py-3 px-4 align-top">
                {role.tenVaiTro}
              </TableCell>
              <TableCell className="text-sm py-3 px-4 text-muted-foreground align-top truncate max-w-md">
                {role.moTaVT || 'Không có mô tả'}
              </TableCell>
              <TableCell className="text-center py-3 px-4 text-sm text-muted-foreground align-top">
                {role.soNguoiDungSuDung !== undefined ? (
                  <Badge
                    variant={
                      role.soNguoiDungSuDung > 0 ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    <Users className="mr-1.5 h-3 w-3" />{' '}
                    {role.soNguoiDungSuDung}
                  </Badge>
                ) : (
                  '-'
                )}
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
                      <DropdownMenuItem onClick={() => onEdit(role)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Sửa
                      </DropdownMenuItem>
                      {/* Chỉ cho phép xóa vai trò nếu chưa có ai sử dụng hoặc có logic nghiệp vụ khác */}
                      <DropdownMenuItem
                        onClick={() => onDelete(role)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        disabled={
                          role.soNguoiDungSuDung !== undefined &&
                          role.soNguoiDungSuDung > 0
                        }
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
