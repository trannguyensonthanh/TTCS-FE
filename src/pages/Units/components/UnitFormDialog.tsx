// src/pages/Units/components/UnitFormDialog.tsx

import React, { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2 } from 'lucide-react';
import {
  unitFormSchema,
  UnitFormValues,
  UnitFormDialogProps,
} from './unitFormTypes'; // Giả sử types ở file riêng
import { useCreateDonVi, useUpdateDonVi } from '@/hooks/queries/donViQueries';

export function UnitFormDialog({
  open,
  onOpenChange,
  editingUnit,
  loaiDonViOptions,
  donViChaOptions,
  isLoadingLoaiDonVi,
  isLoadingDonViCha,
}: UnitFormDialogProps) {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      tenDonVi: '',
      maDonVi: null,
      loaiDonVi: '',
      donViChaID: null,
      moTaDv: null,
    },
  });

  const createDonViMutation = useCreateDonVi({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  const updateDonViMutation = useUpdateDonVi({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  useEffect(() => {
    if (editingUnit) {
      form.reset({
        tenDonVi: editingUnit.tenDonVi,
        maDonVi: editingUnit.maDonVi || null,
        loaiDonVi: editingUnit.loaiDonVi,
        donViChaID: editingUnit.donViCha?.donViID?.toString() || null,
        moTaDv: editingUnit.moTaDv || null,
      });
    } else {
      form.reset({
        // Reset về giá trị rỗng khi tạo mới
        tenDonVi: '',
        maDonVi: null,
        loaiDonVi: '',
        donViChaID: null,
        moTaDv: null,
      });
    }
  }, [editingUnit, form, open]); // Thêm 'open' vào dependencies để reset form khi dialog mở lại cho việc tạo mới

  const onSubmit = (values: UnitFormValues) => {
    const payload = {
      tenDonVi: values.tenDonVi,
      maDonVi: values.maDonVi ?? null,
      loaiDonVi: values.loaiDonVi,
      donViChaID: values.donViChaID ? parseInt(values.donViChaID, 10) : null,
      moTaDv: values.moTaDv ?? null,
    };

    if (editingUnit) {
      updateDonViMutation.mutate({ id: editingUnit.donViID, payload });
    } else {
      createDonViMutation.mutate(payload);
    }
  };

  const isSubmitting =
    createDonViMutation.isPending || updateDonViMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingUnit ? 'Chỉnh Sửa Đơn Vị' : 'Thêm Đơn Vị Mới'}
          </DialogTitle>
          <DialogDescription>
            {editingUnit
              ? `Cập nhật thông tin cho đơn vị "${editingUnit.tenDonVi}".`
              : 'Điền thông tin để tạo một đơn vị tổ chức mới.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 overflow-y-auto flex-grow pr-2 -mr-2 pl-1"
          >
            <FormField
              control={form.control}
              name="tenDonVi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên Đơn Vị <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Khoa Công nghệ Thông tin"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maDonVi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Đơn Vị</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: CNTT ( )"
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
              name="loaiDonVi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Loại Đơn Vị <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    disabled={isLoadingLoaiDonVi}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingLoaiDonVi
                              ? 'Đang tải...'
                              : 'Chọn loại đơn vị'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loaiDonViOptions.map((option) => (
                        <SelectItem key={option.maLoai} value={option.maLoai}>
                          {option.tenLoai}
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
              name="donViChaID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn Vị Cha ( )</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'null' ? null : value)
                    }
                    value={field.value || 'null'} // 'null' string để hiển thị placeholder đúng cách
                    disabled={isLoadingDonViCha}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingDonViCha
                              ? 'Đang tải...'
                              : 'Chọn đơn vị cha'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Không có đơn vị cha</SelectItem>
                      {donViChaOptions
                        .filter(
                          (option) =>
                            !editingUnit ||
                            option.donViID !== editingUnit.donViID
                        ) // Loại trừ chính nó
                        .map((option) => (
                          <SelectItem
                            key={option.donViID}
                            value={option.donViID.toString()}
                          >
                            {option.tenDonViHienThi}
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
              name="moTaDv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô Tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về chức năng, nhiệm vụ của đơn vị..."
                      className="resize-y min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mx-1 -mb-0">
              {' '}
              {/* Footer dính dưới */}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingUnit ? 'Lưu Thay Đổi' : 'Thêm Đơn Vị'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
