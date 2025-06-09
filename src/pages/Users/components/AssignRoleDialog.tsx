// src/pages/Users/components/AssignRoleDialog.tsx

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker'; // Giả sử bạn có component này
import { Loader2, UserCog, CalendarDays } from 'lucide-react';
import { AssignRoleFormValues, assignRoleFormSchema } from './userFormTypes'; // Lấy từ file types đã tạo

import { useVaiTroList } from '@/hooks/queries/vaiTroQueries'; // Để lấy danh sách vai trò chức năng
import { useDonViList } from '@/hooks/queries/donViQueries'; // Để lấy danh sách đơn vị
import { format, parseISO } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AssignFunctionalRolePayload,
  UpdateAssignedFunctionalRolePayload,
  UserProfileResponse,
} from '@/services/nguoiDung.service';
import { VaiTroChucNangResponse } from '@/services/auth.service';
import {
  useAdminAssignFunctionalRole,
  useAdminUpdateAssignedRole,
} from '@/hooks/queries/nguoiDungQueries';

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToAssignRole?: UserProfileResponse['nguoiDung'] | null; // Chỉ cần thông tin cơ bản của người dùng
  existingRoleAssignment?: VaiTroChucNangResponse | null; // Vai trò chức năng đang được sửa
  onSuccess?: () => void; // Callback sau khi submit thành công
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  userToAssignRole,
  existingRoleAssignment,
  onSuccess,
}: AssignRoleDialogProps) {
  const form = useForm<AssignRoleFormValues>({
    resolver: zodResolver(assignRoleFormSchema),
    defaultValues: {
      vaiTroID: '',
      donViID: null,
      ngayBatDau: new Date(),
      ngayKetThuc: null,
      ghiChuGanVT: null,
    },
  });

  // Hooks gọi API
  const assignRoleMutation = useAdminAssignFunctionalRole(
    userToAssignRole?.nguoiDungID || 0
  ); // Cần NguoiDungID
  const updateAssignedRoleMutation = useAdminUpdateAssignedRole();
  // const removeAssignedRoleMutation = useAdminRemoveAssignedRole(); // Sẽ dùng nếu có nút xóa trực tiếp ở đây

  // Data cho Selects
  const { data: dsVaiTro, isLoading: isLoadingVaiTro } = useVaiTroList(
    { limit: 100, sortBy: 'TenVaiTro' }, // Lấy nhiều vai trò
    { enabled: open }
  );
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList(
    { limit: 100, sortBy: 'TenDonVi' }, // Lấy nhiều đơn vị
    { enabled: open }
  );

  useEffect(() => {
    if (existingRoleAssignment && open) {
      form.reset({
        vaiTroID: existingRoleAssignment.vaiTroID.toString(),
        donViID:
          existingRoleAssignment.donViThucThi?.donViID?.toString() || null,
        ngayBatDau: existingRoleAssignment.ngayBatDau
          ? parseISO(existingRoleAssignment.ngayBatDau)
          : new Date(),
        ngayKetThuc: existingRoleAssignment.ngayKetThuc
          ? parseISO(existingRoleAssignment.ngayKetThuc)
          : null,
        ghiChuGanVT: existingRoleAssignment.ghiChuGanVT || null,
      });
    } else if (!existingRoleAssignment && open) {
      form.reset({
        vaiTroID: '',
        donViID: null,
        ngayBatDau: new Date(),
        ngayKetThuc: null,
        ghiChuGanVT: null,
      });
    }
  }, [existingRoleAssignment, open, form]);

  const onSubmit = (values: AssignRoleFormValues) => {
    if (!userToAssignRole) {
      toast.error('Lỗi: Không tìm thấy thông tin người dùng để gán vai trò.');
      return;
    }

    const payloadCommon = {
      donViID: values.donViID ? parseInt(values.donViID, 10) : null,
      ngayBatDau: values.ngayBatDau
        ? format(values.ngayBatDau, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        : undefined,
      ngayKetThuc: values.ngayKetThuc
        ? format(values.ngayKetThuc, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        : null,
      ghiChuGanVT: values.ghiChuGanVT,
    };

    if (existingRoleAssignment?.ganVaiTroID) {
      // Chế độ sửa
      const updatePayload: UpdateAssignedFunctionalRolePayload = {
        ...payloadCommon,
      };
      // VaiTroID không cho sửa khi đang update một bản ghi gán cụ thể
      updateAssignedRoleMutation.mutate(
        {
          ganVaiTroCnID: existingRoleAssignment.ganVaiTroID,
          payload: updatePayload,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
            onSuccess?.();
          },
        }
      );
    } else {
      // Chế độ tạo mới
      if (!values.vaiTroID) {
        form.setError('vaiTroID', { message: 'Vui lòng chọn vai trò.' });
        return;
      }
      const createPayload: AssignFunctionalRolePayload = {
        ...payloadCommon,
        vaiTroID: parseInt(values.vaiTroID, 10),
      };
      assignRoleMutation.mutate(createPayload, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        },
      });
    }
  };

  const isSubmitting =
    assignRoleMutation.isPending || updateAssignedRoleMutation.isPending;

  const dialogTitle = existingRoleAssignment
    ? `Chỉnh Sửa Vai Trò Cho ${userToAssignRole?.hoTen}`
    : `Gán Vai Trò Mới Cho ${userToAssignRole?.hoTen}`;

  const dialogDescription = existingRoleAssignment
    ? `Cập nhật thông tin gán vai trò "${existingRoleAssignment.tenVaiTro}"${
        existingRoleAssignment.donViThucThi
          ? ` tại ${existingRoleAssignment.donViThucThi.tenDonVi}`
          : ''
      }.`
    : 'Chọn vai trò chức năng, đơn vị thực thi (nếu có) và thời gian hiệu lực.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <UserCog className="mr-2 h-6 w-6 text-primary" />
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {userToAssignRole ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-grow overflow-hidden"
            >
              <ScrollArea className="h-[calc(90vh-220px)] pr-5 -mr-2 pl-1">
                {' '}
                {/* Điều chỉnh chiều cao */}
                <div className="space-y-5 py-2">
                  <FormField
                    control={form.control}
                    name="vaiTroID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Vai Trò Chức Năng{' '}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                          disabled={isLoadingVaiTro || !!existingRoleAssignment} // Không cho sửa vai trò khi update
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingVaiTro
                                    ? 'Đang tải...'
                                    : 'Chọn vai trò'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {dsVaiTro?.items.map((vt) => (
                              <SelectItem
                                key={vt.vaiTroID}
                                value={vt.vaiTroID.toString()}
                              >
                                {vt.tenVaiTro} ({vt.maVaiTro})
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
                    name="donViID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn Vị Thực Thi (nếu có)</FormLabel>
                        <Select
                          onValueChange={(val) =>
                            field.onChange(val === 'null' ? null : val)
                          }
                          value={field.value || 'null'}
                          disabled={isLoadingDonVi}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingDonVi
                                    ? 'Đang tải...'
                                    : 'Không chọn (áp dụng toàn hệ thống)'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            <SelectItem value="null">
                              Không chọn (áp dụng toàn hệ thống)
                            </SelectItem>
                            {dsDonVi?.items.map((dv) => (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ngayBatDau"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày Bắt Đầu Hiệu Lực</FormLabel>
                          <DatePicker
                            date={
                              field.value
                                ? typeof field.value === 'string'
                                  ? parseISO(field.value)
                                  : field.value
                                : undefined
                            }
                            setDate={(date) => field.onChange(date)}
                            buttonClassName="w-full"
                            placeholder="Chọn ngày bắt đầu"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ngayKetThuc"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Ngày Kết Thúc Hiệu Lực (bỏ trống nếu không thời hạn)
                          </FormLabel>
                          <DatePicker
                            date={
                              field.value
                                ? typeof field.value === 'string'
                                  ? parseISO(field.value)
                                  : field.value
                                : undefined
                            }
                            setDate={(date) => field.onChange(date)}
                            buttonClassName="w-full"
                            placeholder="Chọn ngày kết thúc"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="ghiChuGanVT"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi Chú</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ghi chú thêm về việc gán vai trò này (nếu có)..."
                            className="resize-y min-h-[80px]"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
              <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-1 border-t dark:border-slate-800">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Hủy Bỏ
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {existingRoleAssignment ? 'Lưu' : 'Gán Vai Trò'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            Vui lòng chọn một người dùng để gán vai trò.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
