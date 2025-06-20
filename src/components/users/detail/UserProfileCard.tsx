// src/components/users/detail/UserProfileCard.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  Mail,
  Phone,
  UserCheck,
  UserX,
  CalendarDays,
  Fingerprint,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  NguoiDungFullResponse,
  TaiKhoanInfoResponse,
} from '@/services/nguoiDung.service';

interface UserProfileCardProps {
  nguoiDung?: NguoiDungFullResponse | null;
  taiKhoan?: TaiKhoanInfoResponse | null;
  isLoading: boolean;
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-start space-x-3 py-2">
    <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          'text-sm font-medium text-foreground break-words',
          valueClassName
        )}
      >
        {value || <span className="italic">Chưa có</span>}
      </p>
    </div>
  </div>
);

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  nguoiDung,
  taiKhoan,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-60" />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <Skeleton className="h-10 w-full" />{' '}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />{' '}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />{' '}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!nguoiDung || !taiKhoan) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Không có thông tin người dùng.
        </CardContent>
      </Card>
    );
  }

  const getTrangThaiTkBadge = () => {
    switch (taiKhoan.trangThaiTk?.toLowerCase()) {
      case 'active':
        return (
          <Badge variant="secondary" className="bg-green-500 text-white">
            Hoạt động
          </Badge>
        );
      case 'locked':
        return (
          <Badge variant="destructive" className="bg-yellow-500 text-black">
            Bị khóa
          </Badge>
        );
      case 'disabled':
        return <Badge variant="destructive">Vô hiệu hóa</Badge>;
      default:
        return <Badge variant="outline">{taiKhoan.trangThaiTk}</Badge>;
    }
  };

  return (
    <Card className="shadow-xl border-border dark:border-slate-700">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b dark:border-slate-700/60">
        <Avatar className="h-24 w-24 border-4 border-primary/20 dark:border-ptit-red/20 shadow-md">
          <AvatarImage
            src={nguoiDung.anhDaiDien || undefined}
            alt={nguoiDung.hoTen}
          />
          <AvatarFallback className="text-3xl font-semibold bg-muted">
            {(nguoiDung.hoTen &&
              typeof nguoiDung.hoTen === 'string' &&
              nguoiDung.hoTen.split(' ').pop()?.[0]?.toUpperCase()) ||
              'ND'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-3xl font-bold text-primary dark:text-ptit-red">
            {nguoiDung.hoTen ? nguoiDung.hoTen : 'Người dùng'}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            ID:{' '}
            <span className="font-mono text-foreground">
              {nguoiDung.nguoiDungID}
            </span>
            {nguoiDung.maDinhDanh && ` - Mã Định Danh: ${nguoiDung.maDinhDanh}`}
          </CardDescription>
          {nguoiDung.isActive ? (
            <Badge
              variant="outline"
              className="mt-2 border-green-500 text-green-600 dark:text-green-400"
            >
              <UserCheck className="h-3.5 w-3.5 mr-1.5" />
              Người dùng Active
            </Badge>
          ) : (
            <Badge variant="destructive" className="mt-2">
              <UserX className="h-3.5 w-3.5 mr-1.5" />
              Người dùng Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 gap-y-1">
        <InfoRow
          icon={Mail}
          label="Email"
          value={
            <a
              href={`mailto:${nguoiDung.email}`}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {nguoiDung.email}
            </a>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2">
          <InfoRow
            icon={Phone}
            label="Số điện thoại"
            value={nguoiDung.soDienThoai || 'Chưa cập nhật'}
          />
          {/* <InfoRow
        icon={Fingerprint}
        label="Tên đăng nhập"
        value={taiKhoan.tenDangNhap}
          /> */}
          <InfoRow
            icon={ShieldCheck}
            label="Trạng thái tài khoản"
            value={getTrangThaiTkBadge()}
          />
          <InfoRow
            icon={CalendarDays}
            label="Ngày tạo người dùng"
            value={
              nguoiDung.ngayTao
                ? format(parseISO(nguoiDung.ngayTao), 'dd/MM/yyyy HH:mm', {
                    locale: vi,
                  })
                : 'Chưa có'
            }
          />
          <InfoRow
            icon={CalendarDays}
            label="Ngày tạo tài khoản"
            value={
              taiKhoan?.ngayTaoTk
                ? format(parseISO(taiKhoan.ngayTaoTk), 'dd/MM/yyyy HH:mm', {
                    locale: vi,
                  })
                : 'Chưa có'
            }
          />
          {taiKhoan.lanDangNhapCuoi &&
            isValid(parseISO(taiKhoan.lanDangNhapCuoi)) && (
              <InfoRow
                icon={Clock}
                label="Đăng nhập cuối"
                value={format(
                  parseISO(taiKhoan.lanDangNhapCuoi),
                  'dd/MM/yyyy HH:mm:ss',
                  { locale: vi }
                )}
                valueClassName="md:col-span-2"
              />
            )}
        </div>
      </CardContent>
    </Card>
  );
};
