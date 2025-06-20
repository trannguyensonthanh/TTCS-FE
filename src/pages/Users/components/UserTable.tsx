// src/pages/Users/components/UserTable.tsx

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  Edit,
  Trash2,
  MoreHorizontal,
  ShieldCheck,
  UserCog,
  Eye,
  KeyRound,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { NguoiDungListItemFE } from '@/services/nguoiDung.service';
import { getInitials } from '@/utils/stringUtils';
import { useNavigate } from 'react-router-dom';

interface UserTableProps {
  users: NguoiDungListItemFE[];
  onEditUser: (user: NguoiDungListItemFE) => void;
  onManageRoles: (user: NguoiDungListItemFE) => void; // Mở dialog gán vai trò
  onChangePassword?: (user: NguoiDungListItemFE) => void; // Tùy chọn: Mở dialog đổi mật khẩu cho user (admin làm)
  onToggleAccountStatus?: (user: NguoiDungListItemFE) => void; // Tùy chọn: Mở dialog/confirm thay đổi trạng thái TK
  onDeleteUser?: (user: NguoiDungListItemFE) => void; // Thêm props xóa cứng
  canManageUsers: boolean; // Quyền sửa người dùng
  canManageRolesForUser: boolean; // Quyền gán vai trò
}

export function UserTable({
  users,
  onEditUser,
  onManageRoles,
  onChangePassword,
  onToggleAccountStatus,
  onDeleteUser,
  canManageUsers,
  canManageRolesForUser,
}: UserTableProps) {
  const navigate = useNavigate();
  console.log('UserTable rendered with users:', users);
  return (
    <div className="rounded-md border shadow-sm bg-card dark:border-slate-800 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-slate-800/30">
            <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground w-[280px]">
              Người Dùng
            </TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
              Mã Số
            </TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
              Loại User
            </TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
              Đơn Vị Chính
            </TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground">
              Vai Trò CN
            </TableHead>
            <TableHead className="px-4 py-3 text-sm font-semibold text-muted-foreground text-center w-[120px]">
              Trạng Thái TK
            </TableHead>
            {(canManageUsers || canManageRolesForUser) && (
              <TableHead className="text-right w-[100px] px-4 py-3 text-sm font-semibold text-muted-foreground">
                Thao tác
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.nguoiDungID}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <TableCell className="font-medium py-2.5 px-4 align-top">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.anhDaiDien || undefined}
                      alt={user.hoTen}
                    />
                    <AvatarFallback>{getInitials(user.hoTen)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-primary dark:text-sky-400">
                      {user.hoTen}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5 px-4 text-sm text-muted-foreground align-top font-mono">
                {user.maDinhDanh || '-'}
              </TableCell>
              <TableCell className="py-2.5 px-4 text-sm align-top">
                <Badge
                  variant={
                    user.loaiNguoiDungHienThi === 'Sinh viên'
                      ? 'default'
                      : user.loaiNguoiDungHienThi === 'Giảng viên'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="whitespace-nowrap"
                >
                  {user.loaiNguoiDungHienThi}
                </Badge>
              </TableCell>
              <TableCell className="py-2.5 px-4 text-sm text-muted-foreground align-top">
                {user.donViCongTacChinh || '-'}
                {user.loaiNguoiDungHienThi === 'Sinh viên' &&
                  user.thongTinSinhVien && (
                    <div className="text-xs italic mt-0.5">
                      Ngành: {user.thongTinSinhVien.nganhHoc.tenNganhHoc} -
                      Chuyên ngành:{' '}
                      {user.thongTinSinhVien.chuyenNganh?.tenChuyenNganh ||
                        'Không có'}
                    </div>
                  )}
              </TableCell>
              <TableCell className="py-2.5 px-4 text-sm text-muted-foreground align-top">
                {user.vaiTroChucNang && user.vaiTroChucNang.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.vaiTroChucNang.slice(0, 2).map((vt, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {vt.tenVaiTro || vt.maVaiTro || String(vt)}
                      </Badge>
                    ))}
                    {user.vaiTroChucNang.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.vaiTroChucNang.length - 2} khác
                      </Badge>
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="py-2.5 px-4 text-center align-top">
                <Badge
                  variant={
                    user.trangThaiTaiKhoan === 'Active'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className={cn(
                    'text-xs',
                    user.trangThaiTaiKhoan === 'Active' &&
                      'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
                  )}
                >
                  {user.trangThaiTaiKhoan ||
                    (user.isActive ? 'Hoạt động' : 'Vô hiệu hóa')}
                </Badge>
              </TableCell>
              {(canManageUsers || canManageRolesForUser) && (
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
                          navigate(`/users/${user.nguoiDungID}/detail`)
                        }
                      >
                        {' '}
                        {/* Giả sử có trang chi tiết */}
                        <Eye className="mr-2 h-4 w-4" /> Xem Chi Tiết
                      </DropdownMenuItem>
                      {canManageUsers && (
                        <DropdownMenuItem onClick={() => onEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" /> Sửa Thông Tin
                        </DropdownMenuItem>
                      )}
                      {/* {canManageRolesForUser && (
                        <DropdownMenuItem onClick={() => onManageRoles(user)}>
                          <UserCog className="mr-2 h-4 w-4" /> Quản Lý Vai Trò
                        </DropdownMenuItem>
                      )} */}
                      {canManageUsers && onChangePassword && (
                        <DropdownMenuItem
                          onClick={() => onChangePassword(user)}
                        >
                          <KeyRound className="mr-2 h-4 w-4" /> Đổi Mật Khẩu
                          (Admin)
                        </DropdownMenuItem>
                      )}
                      {canManageUsers && onToggleAccountStatus && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onToggleAccountStatus(user)}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {user.trangThaiTaiKhoan === 'Active' ||
                            user.isActive
                              ? 'Vô Hiệu Hóa/Khóa TK'
                              : 'Kích Hoạt TK'}
                          </DropdownMenuItem>
                        </>
                      )}
                      {canManageUsers && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteUser && onDeleteUser(user)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa cứng Người
                            Dùng
                          </DropdownMenuItem>
                        </>
                      )}
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
