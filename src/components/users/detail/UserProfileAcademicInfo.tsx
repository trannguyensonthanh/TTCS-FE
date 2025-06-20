// src/components/users/detail/UserProfileAcademicInfo.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Star,
  CalendarCheck2,
  Library,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ThongTinGiangVienChiTietResponse,
  ThongTinSinhVienChiTietResponse,
} from '@/services/nguoiDung.service';

const InfoRow = ({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex items-start py-2 border-b border-dashed border-border/30 dark:border-slate-700/30 last:border-none',
      className
    )}
  >
    {Icon && (
      <Icon className="h-4.5 w-4.5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
    )}
    <span className="text-sm font-medium text-muted-foreground w-36 shrink-0">
      {label}:
    </span>
    <span className="text-sm text-foreground break-words flex-1">
      {value || <span className="italic">Chưa có</span>}
    </span>
  </div>
);

interface UserProfileAcademicInfoProps {
  thongTinSinhVien?: ThongTinSinhVienChiTietResponse | null;
  thongTinGiangVien?: ThongTinGiangVienChiTietResponse | null;
  isLoading: boolean;
  vaiTroChucNang?: import('@/services/auth.service').VaiTroChucNangResponse[];
}

export const UserProfileAcademicInfo: React.FC<
  UserProfileAcademicInfoProps
> = ({ thongTinSinhVien, thongTinGiangVien, isLoading, vaiTroChucNang }) => {
  // Lấy đơn vị từ vai trò chức năng có mã THANH_VIEN_DON_VI
  const donViThanhVien = vaiTroChucNang?.find(
    (vt) => vt.maVaiTro === 'THANH_VIEN_DON_VI'
  )?.donViThucThi;

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-7 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-full" /> <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-full" /> <Skeleton className="h-5 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!thongTinSinhVien && !thongTinGiangVien) {
    return null; // Không có thông tin học vụ/công tác để hiển thị
  }

  return (
    <>
      {thongTinSinhVien && (
        <Card className="shadow-lg border-border dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <GraduationCap className="text-blue-600 dark:text-blue-400" />{' '}
              Thông Tin Sinh Viên
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="Mã Sinh viên" value={thongTinSinhVien.maSinhVien} />
            <InfoRow
              label="Lớp"
              value={`${thongTinSinhVien.lop.tenLop} ${
                thongTinSinhVien.lop.maLop
                  ? `(${thongTinSinhVien.lop.maLop})`
                  : ''
              }`}
            />
            <InfoRow
              label="Ngành học"
              value={`${thongTinSinhVien.nganhHoc.tenNganhHoc} ${
                thongTinSinhVien.nganhHoc.maNganhHoc
                  ? `(${thongTinSinhVien.nganhHoc.maNganhHoc})`
                  : ''
              }`}
            />
            {thongTinSinhVien.chuyenNganh && (
              <InfoRow
                label="Chuyên ngành"
                value={`${thongTinSinhVien.chuyenNganh.tenChuyenNganh} ${
                  thongTinSinhVien.chuyenNganh.maChuyenNganh
                    ? `(${thongTinSinhVien.chuyenNganh.maChuyenNganh})`
                    : ''
                }`}
              />
            )}
            <InfoRow
              label="Khoa quản lý"
              value={
                thongTinSinhVien.khoaQuanLy &&
                thongTinSinhVien.khoaQuanLy.tenDonVi
                  ? `${thongTinSinhVien.khoaQuanLy.tenDonVi} ${
                      thongTinSinhVien.khoaQuanLy.maDonVi
                        ? `(${thongTinSinhVien.khoaQuanLy.maDonVi})`
                        : ''
                    }`
                  : 'Chưa có'
              }
            />
            <InfoRow label="Khóa học" value={thongTinSinhVien.khoaHoc} />
            <InfoRow label="Hệ đào tạo" value={thongTinSinhVien.heDaoTao} />
            {thongTinSinhVien.ngayNhapHoc &&
              isValid(parseISO(thongTinSinhVien.ngayNhapHoc)) && (
                <InfoRow
                  label="Ngày nhập học"
                  value={format(
                    parseISO(thongTinSinhVien.ngayNhapHoc),
                    'dd/MM/yyyy',
                    { locale: vi }
                  )}
                />
              )}
            <InfoRow
              label="Trạng thái học tập"
              value={thongTinSinhVien.trangThaiHocTap}
            />
          </CardContent>
        </Card>
      )}

      {thongTinGiangVien && (
        <Card className="shadow-lg border-border dark:border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="text-green-600 dark:text-green-400" /> Thông
              Tin Giảng Viên / Công Tác
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow
              label="Mã Giảng viên"
              value={thongTinGiangVien.maGiangVien}
            />
            <InfoRow
              label="Đơn vị công tác"
              value={
                donViThanhVien
                  ? `${donViThanhVien.tenDonVi} (${donViThanhVien.loaiDonVi})`
                  : 'Chưa có'
              }
            />
            <InfoRow label="Học vị" value={thongTinGiangVien.hocVi} />
            <InfoRow label="Học hàm" value={thongTinGiangVien.hocHam} />
            <InfoRow
              label="Chức danh GD"
              value={thongTinGiangVien.chucDanhGD}
            />
            <InfoRow
              label="Chuyên môn chính"
              value={thongTinGiangVien.chuyenMonChinh}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
};
