// src/components/users/detail/AssignRoleDialog.tsx
import React, { useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input'; // For date inputs
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, CalendarIcon as Calendar } from 'lucide-react';
import {
  useVaiTroForSelect,
  useVaiTroList,
} from '@/hooks/queries/vaiTroQueries'; // Hook đã tạo
import { useDonViList } from '@/hooks/queries/donViQueries';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarShadcn } from '@/components/ui/calendar';
import { format, parseISO, isValid, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AssignFunctionalRolePayload,
  UpdateAssignedFunctionalRolePayload,
} from '@/services/nguoiDung.service';
import { VaiTroChucNangResponse } from '@/services/auth.service';

const assignRoleFormSchema = z
  .object({
    vaiTroID: z.string().min(1, 'Vui lòng chọn vai trò.'),
    donViID: z.string().optional().nullable(),
    ngayBatDau: z.date({ required_error: 'Ngày bắt đầu là bắt buộc.' }),
    ngayKetThuc: z.date().optional().nullable(),
    ghiChuGanVT: z
      .string()
      .max(500, 'Ghi chú tối đa 500 ký tự.')
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.ngayBatDau && data.ngayKetThuc) {
        return !isBefore(data.ngayKetThuc, data.ngayBatDau);
      }
      return true;
    },
    {
      message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
      path: ['ngayKetThuc'],
    }
  );

type AssignRoleFormValues = z.infer<typeof assignRoleFormSchema>;

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: AssignFunctionalRolePayload | UpdateAssignedFunctionalRolePayload
  ) => void;
  isSubmitting: boolean;
  editingRoleAssignment?: VaiTroChucNangResponse | null; // Thông tin vai trò đang sửa
  nguoiDungId: number; // Để biết đang gán cho ai (dùng cho logging hoặc logic nghiệp vụ nếu cần)
}

export const AssignRoleDialog: React.FC<AssignRoleDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  editingRoleAssignment,
  nguoiDungId,
}) => {
  const form = useForm<AssignRoleFormValues>({
    resolver: zodResolver(assignRoleFormSchema),
    defaultValues: {
      vaiTroID: '',
      donViID: undefined,
      ngayBatDau: new Date(),
      ngayKetThuc: undefined,
      ghiChuGanVT: '',
    },
  });

  const { data: dsVaiTro, isLoading: isLoadingVaiTro } = useVaiTroForSelect();
  const { data: dsDonVi, isLoading: isLoadingDonVi } = useDonViList({
    limit: 100,
    sortBy: 'TenDonVi',
  }); // Lấy nhiều đơn vị

  useEffect(() => {
    if (editingRoleAssignment) {
      form.reset({
        vaiTroID: editingRoleAssignment.vaiTroID.toString(),
        donViID:
          editingRoleAssignment.donViThucThi?.donViID?.toString() || undefined,
        ngayBatDau: editingRoleAssignment.ngayBatDau
          ? parseISO(editingRoleAssignment.ngayBatDau)
          : new Date(),
        ngayKetThuc: editingRoleAssignment.ngayKetThuc
          ? parseISO(editingRoleAssignment.ngayKetThuc)
          : undefined,
        ghiChuGanVT: editingRoleAssignment.ghiChuGanVT || '',
      });
    } else {
      form.reset({
        // Đảm bảo reset về default khi mở dialog mới
        vaiTroID: '',
        donViID: undefined,
        ngayBatDau: new Date(),
        ngayKetThuc: undefined,
        ghiChuGanVT: '',
      });
    }
  }, [editingRoleAssignment, form, open]); // Thêm open vào dependency

  const handleFormSubmit: SubmitHandler<AssignRoleFormValues> = (data) => {
    const payload = {
      vaiTroID: parseInt(data.vaiTroID),
      donViID: data.donViID ? parseInt(data.donViID) : null, // Gửi null nếu không chọn
      ngayBatDau: format(data.ngayBatDau, 'yyyy-MM-dd'), // Format sang YYYY-MM-DD cho backend
      ngayKetThuc: data.ngayKetThuc
        ? format(data.ngayKetThuc, 'yyyy-MM-dd')
        : null,
      ghiChuGanVT: data.ghiChuGanVT || null,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingRoleAssignment
              ? 'Chỉnh Sửa Vai Trò Chức Năng'
              : 'Gán Vai Trò Chức Năng Mới'}
          </DialogTitle>
          <DialogDescription>
            {editingRoleAssignment
              ? `Cập nhật vai trò "${editingRoleAssignment.tenVaiTro}" cho người dùng.`
              : 'Chọn vai trò và các thông tin liên quan để gán cho người dùng.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-5 py-2 max-h-[60vh] overflow-y-auto pr-3"
          >
            <FormField
              control={form.control}
              name="vaiTroID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vai trò chức năng{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={isLoadingVaiTro || !!editingRoleAssignment} // Không cho sửa VaiTroID khi edit
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingVaiTro ? 'Tải...' : 'Chọn vai trò'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dsVaiTro?.map((vt) => (
                        <SelectItem
                          key={vt.vaiTroID}
                          value={vt.vaiTroID.toString()}
                        >
                          {vt.tenVaiTro} ({vt.maVaiTro})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!!editingRoleAssignment && (
                    <FormDescription className="text-xs italic">
                      Không thể thay đổi loại vai trò sau khi đã gán. Hãy xóa và
                      tạo mới nếu cần.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="donViID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị thực thi (nếu có)</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      if (val === 'none') field.onChange(undefined);
                      else field.onChange(val);
                    }}
                    value={field.value || 'none'}
                    disabled={isLoadingDonVi}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingDonVi
                              ? 'Tải...'
                              : 'Chọn đơn vị (nếu vai trò gắn với đơn vị cụ thể)'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      <SelectItem value="none">
                        Không chọn (áp dụng toàn hệ thống/không cụ thể)
                      </SelectItem>
                      {dsDonVi?.items
                        .filter(
                          (dv) =>
                            dv.donViID !== undefined &&
                            dv.donViID !== null &&
                            dv.loaiDonVi === 'CO_SO'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ngayBatDau"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Ngày bắt đầu <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: vi })
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarShadcn
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      Ngày kết thúc (để trống nếu vô thời hạn)
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: vi })
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarShadcn
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < (form.getValues('ngayBatDau') || new Date(0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
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
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm về việc gán vai trò này..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRoleAssignment ? 'Lưu Thay Đổi Vai Trò' : 'Gán Vai Trò'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
