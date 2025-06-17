// src/components/users/detail/UserFunctionalRolesTable.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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

import {
  Edit3,
  Trash2,
  UserPlus,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { format, parseISO, isAfter, isValid, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { VaiTroChucNangResponse } from '@/services/auth.service';

interface UserFunctionalRolesTableProps {
  roles: VaiTroChucNangResponse[];
  isLoading: boolean;
  onEditRole: (roleAssignment: VaiTroChucNangResponse) => void;
  onDeleteRole: (roleAssignment: VaiTroChucNangResponse) => void;
  onAssignNewRole: () => void; // Callback để mở dialog gán vai trò mới
  canManageRoles: boolean; // Quyền để hiển thị nút Thêm/Sửa/Xóa
}

const formatDateNullable = (dateString?: string | null) => {
  if (!dateString)
    return <span className="italic text-muted-foreground">Vô thời hạn</span>;
  try {
    const date = parseISO(dateString);
    if (!isValid(date))
      return <span className="italic text-destructive">Ngày không hợp lệ</span>;
    return format(date, 'dd/MM/yyyy', { locale: vi });
  } catch (e) {
    return <span className="italic text-destructive">Lỗi ngày</span>;
  }
};

export const UserFunctionalRolesTable: React.FC<
  UserFunctionalRolesTableProps
> = ({
  roles,
  isLoading,
  onEditRole,
  onDeleteRole,
  onAssignNewRole,
  canManageRoles,
}) => {
  const isRoleActive = (role: VaiTroChucNangResponse): boolean => {
    const now = new Date();
    if (!role.ngayBatDau) return false;
    const startDate = parseISO(role.ngayBatDau);
    if (!isValid(startDate) || isAfter(startDate, now)) return false; // Chưa bắt đầu
    if (role.ngayKetThuc) {
      const endDate = parseISO(role.ngayKetThuc);
      if (!isValid(endDate) || isBefore(endDate, now)) return false; // Đã kết thúc
    }
    return true; // Đang hiệu lực
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">
              Vai Trò Chức Năng Được Gán
            </CardTitle>
            {canManageRoles && <Skeleton className="h-9 w-32 rounded-md" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  console.log('Rendering UserFunctionalRolesTable with roles:', roles);
  return (
    <Card className="shadow-lg border-border dark:border-slate-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-500" /> Vai Trò Chức
              Năng & Quyền Hạn
            </CardTitle>
            <CardDescription className="mt-1">
              Danh sách các vai trò chức năng người dùng này đang nắm giữ trong
              hệ thống.
            </CardDescription>
          </div>
          {canManageRoles && (
            <Button
              onClick={onAssignNewRole}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white shadow"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Gán Vai Trò Mới
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {roles.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
            <p>Người dùng này chưa được gán vai trò chức năng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 dark:bg-slate-800/40">
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[25%]">
                    Tên Vai Trò
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[25%]">
                    Đơn Vị Thực Thi
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[15%]">
                    Từ Ngày
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[15%]">
                    Đến Ngày
                  </TableHead>
                  <TableHead className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[10%]">
                    Hiệu Lực
                  </TableHead>
                  {canManageRoles && (
                    <TableHead className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[10%]">
                      Thao tác
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((roleAssignment) => (
                  <TableRow
                    key={roleAssignment.ganVaiTroID}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium py-2.5 px-4 text-sm">
                      {roleAssignment.tenVaiTro}
                      <p className="text-xs text-muted-foreground font-mono">
                        ({roleAssignment.maVaiTro})
                      </p>
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-sm text-muted-foreground">
                      {roleAssignment.donViThucThi ? (
                        `${roleAssignment.donViThucThi.tenDonVi} (${roleAssignment.donViThucThi.loaiDonVi})`
                      ) : (
                        <span className="italic">Toàn hệ thống</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-sm text-muted-foreground">
                      {formatDateNullable(roleAssignment.ngayBatDau)}
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-sm text-muted-foreground">
                      {formatDateNullable(roleAssignment.ngayKetThuc)}
                    </TableCell>
                    <TableCell className="text-center py-2.5 px-4">
                      {isRoleActive(roleAssignment) ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600"
                        >
                          Còn hiệu lực
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-gray-400 text-gray-500"
                        >
                          Hết hiệu lực
                        </Badge>
                      )}
                    </TableCell>
                    {canManageRoles && (
                      <TableCell className="text-right py-2.5 px-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditRole(roleAssignment)}
                            title="Sửa vai trò đã gán"
                          >
                            <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteRole(roleAssignment)}
                            title="Thu hồi vai trò này"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
