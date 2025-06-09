// src/pages/Users/components/UserFormDialog.tsx

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Nếu cần cho mô tả User sau này
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker'; // Giả sử bạn có component này
import { Loader2, UserPlus, Save } from 'lucide-react';
import { UserFormValues, userFormSchema } from './userFormTypes';

import { useLopHocList } from '@/hooks/queries/lopHocQueries'; // Cần hook lấy danh sách lớp
import { useDonViList } from '@/hooks/queries/donViQueries'; // Cần hook lấy danh sách đơn vị (cho Khoa, Phòng ban)
import {
  LoaiNguoiDungEnum,
  LoaiNguoiDungLabels,
} from '@/enums/loaiNguoiDung.enum';
import { parseISO, format } from 'date-fns';
import {
  useAdminCreateUser,
  useAdminUpdateUser,
} from '@/hooks/queries/nguoiDungQueries';
import {
  CreateNguoiDungPayload,
  UpdateNguoiDungAdminPayload,
  UserProfileResponse,
} from '@/services/nguoiDung.service';
import { motion } from 'framer-motion';
interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser?: UserProfileResponse | null; // Dữ liệu chi tiết của người dùng đang sửa
  onFormSubmitSuccess?: () => void; // Callback sau khi submit thành công
}

export function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  onFormSubmitSuccess,
}: UserFormDialogProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      // Thông tin NguoiDung
      hoTen: '',
      email: '',
      maDinhDanh: null,
      soDienThoai: null,
      anhDaiDien: null,
      isActive: true,
      ngaySinh: null, // Để trống ban đầu, sẽ xử lý khi submit
      // Thông tin TaiKhoan (chỉ cần khi tạo mới)
      matKhau: '', // Để trống, backend sẽ xử lý nếu admin không nhập
      trangThaiTk: 'Active',
      // Thông tin hồ sơ
      loaiNguoiDung: undefined, // Để trống ban đầu
      thongTinSinhVien: null,
      thongTinGiangVien: null,
    },
  });

  const selectedLoaiNguoiDung = form.watch('loaiNguoiDung');

  // Hooks gọi API
  const createUserMutation = useAdminCreateUser({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      onFormSubmitSuccess?.();
    },
  });
  const updateUserMutation = useAdminUpdateUser({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
      onFormSubmitSuccess?.();
    },
  });

  // Data cho Selects
  const { data: dsLopHoc, isLoading: isLoadingLopHoc } = useLopHocList(
    { limit: 100, sortBy: 'TenLop' }, // Lấy nhiều lớp
    { enabled: open && selectedLoaiNguoiDung === LoaiNguoiDungEnum.SINH_VIEN }
  );
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList(
    { limit: 100, sortBy: 'TenDonVi' }, // Lấy nhiều đơn vị
    {
      enabled:
        open &&
        (selectedLoaiNguoiDung === LoaiNguoiDungEnum.GIANG_VIEN ||
          selectedLoaiNguoiDung === LoaiNguoiDungEnum.NHAN_VIEN_KHAC),
    }
  );

  useEffect(() => {
    if (editingUser && open) {
      const ngDung = editingUser.nguoiDung;
      let loaiNguoiDung: LoaiNguoiDungEnum | undefined = undefined;
      if (editingUser.thongTinSinhVien)
        loaiNguoiDung = LoaiNguoiDungEnum.SINH_VIEN;
      else if (editingUser.thongTinGiangVien)
        loaiNguoiDung = LoaiNguoiDungEnum.GIANG_VIEN;
      else loaiNguoiDung = LoaiNguoiDungEnum.NHAN_VIEN_KHAC;

      form.reset({
        hoTen: ngDung.hoTen,
        email: ngDung.email,
        maDinhDanh: ngDung.maDinhDanh || null,
        soDienThoai: ngDung.soDienThoai || null,
        anhDaiDien: ngDung.anhDaiDien || null,
        isActive: ngDung.isActive,
        matKhau: '', // Không hiển thị/sửa mật khẩu ở form này
        trangThaiTk: editingUser.nguoiDung.isActive ? 'Active' : 'Disabled', // Cần logic map từ TaiKhoan.TrangThaiTk thực tế nếu có
        loaiNguoiDung: loaiNguoiDung,
        ngaySinh: ngDung.ngaySinh
          ? format(parseISO(ngDung.ngaySinh), 'yyyy-MM-dd')
          : null,
        thongTinSinhVien: editingUser.thongTinSinhVien
          ? {
              lopID: editingUser.thongTinSinhVien.lop.lopID,
              khoaHoc: editingUser.thongTinSinhVien.khoaHoc || null,
              heDaoTao: editingUser.thongTinSinhVien.heDaoTao || null,
              ngayNhapHoc: editingUser.thongTinSinhVien.ngayNhapHoc
                ? format(
                    parseISO(editingUser.thongTinSinhVien.ngayNhapHoc),
                    'yyyy-MM-dd'
                  )
                : null,
              trangThaiHocTap:
                editingUser.thongTinSinhVien.trangThaiHocTap || null,
            }
          : null,
        thongTinGiangVien: editingUser.thongTinGiangVien
          ? {
              donViCongTacID:
                editingUser.thongTinGiangVien.donViCongTac.donViID,
              hocVi: editingUser.thongTinGiangVien.hocVi || null,
              hocHam: editingUser.thongTinGiangVien.hocHam || null,
              chucDanhGD: editingUser.thongTinGiangVien.chucDanhGD || null,
              chuyenMonChinh:
                editingUser.thongTinGiangVien.chuyenMonChinh || null,
            }
          : null,
      });
    } else if (!editingUser && open) {
      // Reset hoàn toàn khi mở dialog để tạo mới
      form.reset({
        hoTen: '',
        email: '',
        maDinhDanh: null,
        soDienThoai: null,
        anhDaiDien: null,
        isActive: true,
        matKhau: '',
        trangThaiTk: 'Active',
        loaiNguoiDung: undefined,
        ngaySinh: null,
        thongTinSinhVien: null,
        thongTinGiangVien: null,
      });
    }
  }, [editingUser, open, form]);

  const onSubmit = (values: UserFormValues) => {
    // Xóa các object thông tin chi tiết không phù hợp với loaiNguoiDung đã chọn
    const cleanValues = { ...values };
    if (values.loaiNguoiDung !== LoaiNguoiDungEnum.SINH_VIEN)
      cleanValues.thongTinSinhVien = null;
    if (values.loaiNguoiDung !== LoaiNguoiDungEnum.GIANG_VIEN)
      cleanValues.thongTinGiangVien = null;

    // Chuyển đổi ngày nhập học sang ISO string nếu có
    if (cleanValues.thongTinSinhVien?.ngayNhapHoc) {
      try {
        // Đảm bảo parseISO nhận đúng định dạng nếu nó là string, hoặc format nếu là Date object
        const dateObj =
          typeof cleanValues.thongTinSinhVien.ngayNhapHoc === 'string'
            ? parseISO(cleanValues.thongTinSinhVien.ngayNhapHoc)
            : cleanValues.thongTinSinhVien.ngayNhapHoc;
        cleanValues.thongTinSinhVien.ngayNhapHoc = format(
          dateObj,
          "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
        );
      } catch (error) {
        console.error(
          'Invalid date format for ngayNhapHoc',
          cleanValues.thongTinSinhVien.ngayNhapHoc
        );
        // Xử lý lỗi hoặc để null nếu không parse được
        cleanValues.thongTinSinhVien.ngayNhapHoc = null;
      }
    }

    // Chuyển đổi ngày sinh sang ISO string nếu có
    if (cleanValues.ngaySinh) {
      try {
        const dateObj =
          typeof cleanValues.ngaySinh === 'string'
            ? parseISO(cleanValues.ngaySinh)
            : cleanValues.ngaySinh;
        cleanValues.ngaySinh = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      } catch (error) {
        console.error('Invalid date format for ngaySinh', cleanValues.ngaySinh);
        // Xử lý lỗi hoặc để null nếu không parse được
        cleanValues.ngaySinh = null;
      }
    }

    if (editingUser) {
      const updatePayload: UpdateNguoiDungAdminPayload = {
        hoTen: cleanValues.hoTen,
        maDinhDanh: cleanValues.maDinhDanh,
        soDienThoai: cleanValues.soDienThoai,
        anhDaiDien: cleanValues.anhDaiDien,
        isActive: cleanValues.isActive,
        ngaySinh: cleanValues.ngaySinh,
        thongTinSinhVien: cleanValues.thongTinSinhVien,
        thongTinGiangVien: cleanValues.thongTinGiangVien,
      };
      updateUserMutation.mutate({
        id: editingUser.nguoiDung.nguoiDungID,
        payload: updatePayload,
      });
    } else {
      // Ensure required fields for nested objects are present or set to null
      const createPayload: CreateNguoiDungPayload = {
        hoTen: cleanValues.hoTen,
        email: cleanValues.email,
        matKhau: cleanValues.matKhau || 'sonthanh123',
        loaiNguoiDung: cleanValues.loaiNguoiDung!,
        maDinhDanh: cleanValues.maDinhDanh ?? undefined,
        soDienThoai: cleanValues.soDienThoai ?? undefined,
        anhDaiDien: cleanValues.anhDaiDien ?? undefined,
        ngaySinh: cleanValues.ngaySinh ?? undefined,
        isActive: cleanValues.isActive,
        thongTinSinhVien:
          cleanValues.loaiNguoiDung === LoaiNguoiDungEnum.SINH_VIEN &&
          cleanValues.thongTinSinhVien &&
          cleanValues.thongTinSinhVien.lopID
            ? {
                lopID: cleanValues.thongTinSinhVien.lopID,
                khoaHoc: cleanValues.thongTinSinhVien.khoaHoc ?? undefined,
                heDaoTao: cleanValues.thongTinSinhVien.heDaoTao ?? undefined,
                ngayNhapHoc:
                  cleanValues.thongTinSinhVien.ngayNhapHoc ?? undefined,
                trangThaiHocTap:
                  cleanValues.thongTinSinhVien.trangThaiHocTap ?? undefined,
              }
            : undefined,
        thongTinGiangVien:
          cleanValues.loaiNguoiDung === LoaiNguoiDungEnum.GIANG_VIEN &&
          cleanValues.thongTinGiangVien &&
          cleanValues.thongTinGiangVien.donViCongTacID
            ? {
                donViCongTacID: cleanValues.thongTinGiangVien.donViCongTacID,
                hocVi: cleanValues.thongTinGiangVien.hocVi ?? undefined,
                hocHam: cleanValues.thongTinGiangVien.hocHam ?? undefined,
                chucDanhGD:
                  cleanValues.thongTinGiangVien.chucDanhGD ?? undefined,
                chuyenMonChinh:
                  cleanValues.thongTinGiangVien.chuyenMonChinh ?? undefined,
              }
            : undefined,
      };
      createUserMutation.mutate(createPayload);
    }
  };

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <UserPlus className="mr-3 h-7 w-7 text-primary" />
            {editingUser
              ? 'Chỉnh Sửa Thông Tin Người Dùng'
              : 'Thêm Người Dùng Mới'}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? `Cập nhật hồ sơ cho ${editingUser.nguoiDung.hoTen}.`
              : 'Điền đầy đủ thông tin để tạo tài khoản và hồ sơ người dùng.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-grow overflow-hidden"
          >
            <ScrollArea className="h-[calc(90vh-180px)] pr-5 -mr-2 pl-1">
              {' '}
              {/* Điều chỉnh chiều cao và padding */}
              <div className="space-y-6 py-2">
                {/* Phần Thông Tin Cơ Bản & Tài Khoản */}
                <div className="p-4 border rounded-lg bg-background dark:bg-slate-900/30">
                  <h3 className="text-lg font-semibold mb-3 text-primary">
                    Thông Tin Cơ Bản & Tài Khoản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hoTen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Họ Tên <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn Văn A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="nguyenvana@ptit.edu.vn"
                              {...field}
                              disabled={!!editingUser}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maDinhDanh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã Định Danh (chung)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Mã cán bộ/giảng viên/sinh viên chung"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="soDienThoai"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số Điện Thoại</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="09xxxxxxxx"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ngaySinh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày Sinh</FormLabel>
                          <DatePicker
                            date={
                              field.value
                                ? typeof field.value === 'string'
                                  ? parseISO(field.value)
                                  : field.value
                                : undefined
                            }
                            setDate={(date) =>
                              field.onChange(
                                date ? format(date, 'yyyy-MM-dd') : null
                              )
                            }
                            buttonClassName="w-full"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!editingUser && ( // Chỉ hiển thị khi tạo mới
                      <>
                        <FormField
                          control={form.control}
                          name="matKhau"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mật Khẩu Ban Đầu</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Để trống sẽ tự sinh: sonthanh123"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Nếu bỏ trống, mật khẩu mặc định là
                                "sonthanh123". Người dùng nên đổi sau khi đăng
                                nhập.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    <FormField
                      control={form.control}
                      name="anhDaiDien"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Ảnh Đại Diện</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/avatar.jpg"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {editingUser && ( // Chỉ hiển thị khi sửa
                      <FormField
                        control={form.control}
                        name="trangThaiTk"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trạng Thái Tài Khoản</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || 'Active'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Active">
                                  Hoạt động (Active)
                                </SelectItem>
                                <SelectItem value="Locked">
                                  Bị khóa (Locked)
                                </SelectItem>
                                <SelectItem value="Disabled">
                                  Vô hiệu hóa (Disabled)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Phần Chọn Loại Người Dùng và Thông Tin Chi Tiết */}
                <div className="p-4 border rounded-lg mt-6 bg-background dark:bg-slate-900/30">
                  <FormField
                    control={form.control}
                    name="loaiNguoiDung"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Loại Người Dùng{' '}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset các thông tin chi tiết khác khi loại thay đổi
                            form.setValue('thongTinSinhVien', null);
                            form.setValue('thongTinGiangVien', null);
                          }}
                          value={field.value || ''}
                          disabled={!!editingUser} // Không cho sửa loại người dùng khi đã tạo
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại người dùng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(LoaiNguoiDungEnum).map((loai) => (
                              <SelectItem key={loai} value={loai}>
                                {LoaiNguoiDungLabels[loai]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedLoaiNguoiDung === LoaiNguoiDungEnum.SINH_VIEN && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      <Separator />
                      <h4 className="text-md font-semibold text-primary">
                        Thông Tin Sinh Viên
                      </h4>

                      <FormField
                        control={form.control}
                        name="thongTinSinhVien.lopID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Lớp Học{' '}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={field.value?.toString() || ''}
                              disabled={isLoadingLopHoc}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isLoadingLopHoc
                                        ? 'Đang tải lớp...'
                                        : 'Chọn lớp'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {dsLopHoc?.items.map((lop) => (
                                  <SelectItem
                                    key={lop.lopID}
                                    value={lop.lopID.toString()}
                                  >
                                    {lop.tenLop} ({lop.nganhHoc.tenNganhHoc})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinSinhVien.khoaHoc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Khóa Học</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="K2020"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinSinhVien.heDaoTao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hệ Đào Tạo</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Chính quy"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinSinhVien.ngayNhapHoc"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Ngày Nhập Học</FormLabel>
                            <DatePicker
                              date={
                                field.value
                                  ? typeof field.value === 'string'
                                    ? parseISO(field.value)
                                    : field.value
                                  : undefined
                              }
                              setDate={(date) =>
                                field.onChange(
                                  date ? format(date, 'yyyy-MM-dd') : null
                                )
                              }
                              buttonClassName="w-full"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinSinhVien.trangThaiHocTap"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trạng Thái Học Tập</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Đang học"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {selectedLoaiNguoiDung === LoaiNguoiDungEnum.GIANG_VIEN && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      <Separator />
                      <h4 className="text-md font-semibold text-primary">
                        Thông Tin Giảng Viên
                      </h4>
                      <FormField
                        control={form.control}
                        name="thongTinGiangVien.donViCongTacID"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Đơn Vị Công Tác (Khoa/Bộ môn){' '}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={field.value?.toString() || ''}
                              disabled={isLoadingDonVi}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      isLoadingDonVi
                                        ? 'Đang tải đơn vị...'
                                        : 'Chọn đơn vị'
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {dsDonVi?.items
                                  .filter((dv) =>
                                    ['KHOA', 'BO_MON', 'TRUNG_TAM'].includes(
                                      dv.loaiDonVi
                                    )
                                  )
                                  .map((dv) => (
                                    <SelectItem
                                      key={dv.donViID}
                                      value={dv.donViID.toString()}
                                    >
                                      {dv.tenDonVi} ({dv.loaiDonVi})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinGiangVien.hocVi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Học Vị</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tiến sĩ"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinGiangVien.hocHam"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Học Hàm</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Phó Giáo sư"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinGiangVien.chucDanhGD"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chức Danh Giảng Dạy</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Giảng viên chính"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thongTinGiangVien.chuyenMonChinh"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chuyên Môn Chính</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="An toàn thông tin"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  {selectedLoaiNguoiDung ===
                    LoaiNguoiDungEnum.NHAN_VIEN_KHAC && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      <Separator />
                      <h4 className="text-md font-semibold text-primary">
                        Thông Tin Nhân Viên/Cán Bộ
                      </h4>
                    </motion.div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-1 border-t dark:border-slate-800">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Hủy Bỏ
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingUser ? 'Lưu Thay Đổi' : 'Tạo Người Dùng'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
