import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

import { APIError } from '@/services/apiHelper';
import MaVaiTro from '@/enums/MaVaiTro.enum'; // Nếu cần hiển thị vai trò

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Import Label
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Loader2,
  User,
  Mail,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  CalendarDays,
  Briefcase,
  ShieldCheck,
  GraduationCap,
  Building,
  Check,
  Save,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Để lấy thông tin user cơ bản nếu profile chưa load
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import {
  useChangePassword,
  useMyProfile,
} from '@/hooks/queries/nguoiDungQueries';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
// --- Zod Schema for Change Password Form ---
const changePasswordSchema = z
  .object({
    matKhauHienTai: z.string().min(1, 'Mật khẩu hiện tại không được trống.'),
    matKhauMoi: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.'),
    xacNhanMatKhauMoi: z.string(),
  })
  .refine((data) => data.matKhauMoi === data.xacNhanMatKhauMoi, {
    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.',
    path: ['xacNhanMatKhauMoi'],
  });
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ---- Component Chính ----
const ProfilePage = () => {
  const { user: authUser, logout } = useAuth(); // Lấy user từ context để hiển thị tạm thời
  const navigate = useNavigate();

  // --- Data Fetching for Profile ---
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    isError,
    error: fetchProfileError,
    refetch: refetchProfile,
  } = useMyProfile({
    staleTime: 5 * 60 * 1000,
  });

  // --- Mutation for Changing Password ---
  const changePasswordMutation = useChangePassword({
    onSuccess: () => {
      formPassword.reset();
    },
  });

  // --- Form Handling for Change Password ---
  const formPassword = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      matKhauHienTai: '',
      matKhauMoi: '',
      xacNhanMatKhauMoi: '',
    },
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const onSubmitChangePassword: SubmitHandler<ChangePasswordFormValues> = (
    data
  ) => {
    changePasswordMutation.mutate({
      matKhauHienTai: data.matKhauHienTai,
      matKhauMoi: data.matKhauMoi,
    });
  };

  // Lấy thông tin hiển thị (ưu tiên từ API, fallback về AuthContext)
  const displayUser = userProfile?.nguoiDung || authUser;
  const displayTenDangNhap = userProfile?.nguoiDung.email || '(Chưa có)';
  const displayThongTinSinhVien = userProfile?.thongTinSinhVien;
  const displayThongTinGiangVien = userProfile?.thongTinGiangVien;
  const displayVaiTroChucNang =
    userProfile?.vaiTroChucNang || authUser?.vaiTroChucNang || [];

  const getInitials = (name?: string | null) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoadingProfile && !authUser) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && !authUser) {
    return (
      <div className="text-red-500 text-center py-10">
        Lỗi khi tải thông tin cá nhân:{' '}
        {fetchProfileError?.message || 'Không xác định'}{' '}
        <Button onClick={() => refetchProfile()} className="ml-4">
          Thử lại
        </Button>
      </div>
    );
  }

  if (!displayUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Thông Tin Cá Nhân</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8 max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <Card className="shadow-xl overflow-hidden ">
          <div className="relative h-40 bg-gradient-to-r from-ptit-blue via-sky-500 to-ptit-red dark:from-slate-800 dark:via-slate-700 dark:to-slate-600">
            {/* Có thể thêm ảnh bìa ở đây nếu muốn */}
          </div>
          <CardContent className="pt-5">
            <div className="flex flex-col items-center sm:flex-row sm:items-end -mt-16 sm:-mt-12 space-y-4 sm:space-y-0 sm:space-x-6 p-2">
              <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                <AvatarImage
                  src={displayUser.anhDaiDien || undefined}
                  alt={displayUser.hoTen}
                />
                <AvatarFallback className="text-4xl font-semibold bg-muted">
                  {getInitials(displayUser.hoTen)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left pb-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {displayUser.hoTen}
                </h1>
                <p className="text-md text-muted-foreground">
                  {displayUser.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {authUser?.tuCachCoBan?.loai && (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {authUser.tuCachCoBan.loai === 'SINH_VIEN'
                        ? 'Sinh viên'
                        : authUser.tuCachCoBan.loai === 'GIANG_VIEN'
                        ? 'Giảng viên'
                        : 'Nhân sự'}
                    </Badge>
                  )}
                  {displayVaiTroChucNang.map((role) => (
                    <Badge
                      key={role.maVaiTro}
                      variant="outline"
                      className="text-sm px-3 py-1"
                    >
                      {role.tenVaiTro}{' '}
                      {role.donViThucThi
                        ? `(${role.donViThucThi.tenDonVi})`
                        : ''}
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Có thể thêm nút "Chỉnh sửa ảnh đại diện/ảnh bìa" nếu cho phép */}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personalInfo" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto shadow-sm">
            <TabsTrigger value="personalInfo" className="py-2.5 text-base">
              Thông tin Chung
            </TabsTrigger>
            <TabsTrigger value="security" className="py-2.5 text-base">
              Bảo mật & Tài khoản
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalInfo" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <User className="mr-3 h-6 w-6 text-primary dark:text-ptit-red" />
                  Thông Tin Cơ Bản
                </CardTitle>
                <CardDescription>
                  Các thông tin này được quản lý bởi nhà trường và không thể
                  thay đổi tại đây.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm">
                <InfoRowProfile
                  label="Mã định danh:"
                  value={displayUser.maDinhDanh || 'Chưa cập nhật'}
                  icon={<Info className="h-4 w-4" />}
                />
                <InfoRowProfile
                  label="Họ và tên:"
                  value={displayUser.hoTen}
                  icon={<User className="h-4 w-4" />}
                />
                <InfoRowProfile
                  label="Email:"
                  value={displayUser.email}
                  icon={<Mail className="h-4 w-4" />}
                />
                <InfoRowProfile
                  label="Số điện thoại:"
                  value={displayUser.soDienThoai || 'Chưa cập nhật'}
                  icon={<Phone className="h-4 w-4" />}
                />
                <InfoRowProfile
                  label="Ngày tạo tài khoản:"
                  value={
                    displayUser.ngayTao
                      ? format(
                          parseISO(displayUser.ngayTao),
                          'dd/MM/yyyy HH:mm',
                          { locale: vi }
                        )
                      : 'Chưa cập nhật'
                  }
                  icon={<CalendarDays className="h-4 w-4" />}
                />
                <InfoRowProfile
                  label="Trạng thái hoạt động:"
                  value={
                    displayUser?.isActive ? (
                      <Badge variant="secondary">Hoạt động</Badge>
                    ) : (
                      <Badge variant="destructive">Vô hiệu hóa</Badge>
                    )
                  }
                  icon={<ShieldCheck className="h-4 w-4" />}
                />

                {/* Thông tin Sinh Viên */}
                {displayThongTinSinhVien && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-md font-semibold mb-3 flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-primary dark:text-ptit-red" />
                      Thông Tin Sinh Viên
                    </h3>
                    <InfoRowProfile
                      label="Mã Sinh Viên:"
                      value={displayThongTinSinhVien.maSinhVien}
                    />
                    <InfoRowProfile
                      label="Lớp:"
                      value={`${displayThongTinSinhVien.lop.tenLop} (${
                        displayThongTinSinhVien.lop.maLop || 'N/A'
                      })`}
                    />
                    <InfoRowProfile
                      label="Ngành:"
                      value={`${
                        displayThongTinSinhVien.nganhHoc.tenNganhHoc
                      } (${
                        displayThongTinSinhVien.nganhHoc.maNganhHoc || 'N/A'
                      })`}
                    />
                    {displayThongTinSinhVien.chuyenNganh && (
                      <InfoRowProfile
                        label="Chuyên ngành:"
                        value={`${
                          displayThongTinSinhVien.chuyenNganh.tenChuyenNganh
                        } (${
                          displayThongTinSinhVien.chuyenNganh.maChuyenNganh ||
                          'N/A'
                        })`}
                      />
                    )}
                    <InfoRowProfile
                      label="Khoa quản lý:"
                      value={displayThongTinSinhVien.khoaQuanLy.tenDonVi}
                    />
                    <InfoRowProfile
                      label="Khóa học:"
                      value={displayThongTinSinhVien.khoaHoc || 'N/A'}
                    />
                    <InfoRowProfile
                      label="Hệ đào tạo:"
                      value={displayThongTinSinhVien.heDaoTao || 'N/A'}
                    />
                    {displayThongTinSinhVien.ngayNhapHoc && (
                      <InfoRowProfile
                        label="Ngày nhập học:"
                        value={format(
                          parseISO(displayThongTinSinhVien.ngayNhapHoc),
                          'dd/MM/yyyy',
                          { locale: vi }
                        )}
                      />
                    )}
                    <InfoRowProfile
                      label="Trạng thái học tập:"
                      value={displayThongTinSinhVien.trangThaiHocTap || 'N/A'}
                    />
                  </>
                )}

                {/* Thông tin Giảng Viên */}
                {displayThongTinGiangVien && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="text-md font-semibold mb-3 flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-primary dark:text-ptit-red" />
                      Thông Tin Giảng Viên/Cán Bộ
                    </h3>
                    <InfoRowProfile
                      label="Mã Giảng viên/CB:"
                      value={displayThongTinGiangVien.maGiangVien}
                    />
                    <InfoRowProfile
                      label="Đơn vị công tác:"
                      value={`${
                        displayThongTinGiangVien.donViCongTac.tenDonVi
                      } (${
                        displayThongTinGiangVien.donViCongTac.maDonVi || 'N/A'
                      })`}
                    />
                    {displayThongTinGiangVien.hocVi && (
                      <InfoRowProfile
                        label="Học vị:"
                        value={displayThongTinGiangVien.hocVi}
                      />
                    )}
                    {displayThongTinGiangVien.hocHam && (
                      <InfoRowProfile
                        label="Học hàm:"
                        value={displayThongTinGiangVien.hocHam}
                      />
                    )}
                    {displayThongTinGiangVien.chucDanhGD && (
                      <InfoRowProfile
                        label="Chức danh GD:"
                        value={displayThongTinGiangVien.chucDanhGD}
                      />
                    )}
                    {displayThongTinGiangVien.chuyenMonChinh && (
                      <InfoRowProfile
                        label="Chuyên môn:"
                        value={displayThongTinGiangVien.chuyenMonChinh}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <KeyRound className="mr-3 h-6 w-6 text-primary dark:text-ptit-red" />
                  Thay Đổi Mật Khẩu
                </CardTitle>
                <CardDescription>
                  Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và thay đổi
                  định kỳ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...formPassword}>
                  <form
                    onSubmit={formPassword.handleSubmit(onSubmitChangePassword)}
                    className="space-y-6"
                  >
                    <FormField
                      control={formPassword.control}
                      name="matKhauHienTai"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Mật khẩu hiện tại{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...field}
                                className="pr-10"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              <span className="sr-only">
                                {showCurrentPassword ? 'Ẩn' : 'Hiện'}
                              </span>
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formPassword.control}
                      name="matKhauMoi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Mật khẩu mới{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Ít nhất 6 ký tự"
                                {...field}
                                className="pr-10"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              <span className="sr-only">
                                {showNewPassword ? 'Ẩn' : 'Hiện'}
                              </span>
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formPassword.control}
                      name="xacNhanMatKhauMoi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Xác nhận mật khẩu mới{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                type={
                                  showConfirmNewPassword ? 'text' : 'password'
                                }
                                placeholder="Nhập lại mật khẩu mới"
                                {...field}
                                className="pr-10"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                              onClick={() =>
                                setShowConfirmNewPassword(
                                  !showConfirmNewPassword
                                )
                              }
                            >
                              <span className="sr-only">
                                {showConfirmNewPassword ? 'Ẩn' : 'Hiện'}
                              </span>
                              {showConfirmNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                          xử lý...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" /> Lưu Mật Khẩu Mới
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

// Helper component cho các dòng thông tin trên Profile
const InfoRowProfile = ({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'grid grid-cols-[auto_1fr] sm:grid-cols-[180px_1fr] items-center gap-x-3 gap-y-1 py-2 border-b border-border/30 dark:border-slate-700/30 last:border-b-0',
      className
    )}
  >
    <div className="flex items-center font-medium text-muted-foreground">
      {icon &&
        React.cloneElement(icon as React.ReactElement, {
          className: 'mr-2 h-4 w-4 text-muted-foreground',
        })}
      {label}
    </div>
    <div className="text-foreground font-medium break-words">{value}</div>
  </div>
);

export default ProfilePage;
