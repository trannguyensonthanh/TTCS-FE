// src/pages/Users/Roles/components/RoleFormDialog.tsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import {
  roleFormSchema,
  RoleFormValues,
  RoleFormDialogProps,
} from './roleFormTypes';
import {
  useCreateVaiTro,
  useUpdateVaiTro,
} from '@/hooks/queries/vaiTroQueries';

export function RoleFormDialog({
  open,
  onOpenChange,
  editingRole,
}: RoleFormDialogProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      maVaiTro: '',
      tenVaiTro: '',
      moTaVT: null,
    },
  });

  const createRoleMutation = useCreateVaiTro({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  const updateRoleMutation = useUpdateVaiTro({
    onSuccess: () => {
      onOpenChange(false);
      form.reset();
    },
  });

  useEffect(() => {
    if (editingRole) {
      form.reset({
        maVaiTro: editingRole.maVaiTro,
        tenVaiTro: editingRole.tenVaiTro,
        moTaVT: editingRole.moTaVT || null,
      });
    } else {
      form.reset({
        maVaiTro: '',
        tenVaiTro: '',
        moTaVT: null,
      });
    }
  }, [editingRole, form, open]);

  const onSubmit = (values: RoleFormValues) => {
    if (editingRole) {
      // Chỉ gửi các trường được phép cập nhật (tenVaiTro, moTaVT)
      const payloadForUpdate = {
        tenVaiTro: values.tenVaiTro,
        moTaVT: values.moTaVT,
      };
      updateRoleMutation.mutate({
        id: editingRole.vaiTroID,
        payload: payloadForUpdate,
      });
    } else {
      createRoleMutation.mutate({
        maVaiTro: values.maVaiTro,
        tenVaiTro: values.tenVaiTro,
        moTaVT: values.moTaVT ?? null,
      });
    }
  };

  const isSubmitting =
    createRoleMutation.isPending || updateRoleMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingRole ? 'Chỉnh Sửa Vai Trò Hệ Thống' : 'Thêm Vai Trò Mới'}
          </DialogTitle>
          <DialogDescription>
            {editingRole
              ? `Cập nhật thông tin cho vai trò "${editingRole.tenVaiTro}". Mã vai trò không thể thay đổi.`
              : 'Điền thông tin để tạo một vai trò chức năng mới trong hệ thống.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 overflow-y-auto flex-grow pr-2 -mr-2 pl-1"
          >
            <FormField
              control={form.control}
              name="maVaiTro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mã Vai Trò <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: QUAN_LY_TAI_CHINH"
                      {...field}
                      disabled={!!editingRole} // Không cho sửa Mã Vai Trò
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      } // Tự động uppercase
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tenVaiTro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên Vai Trò <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Quản lý Tài Chính" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moTaVT"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô Tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về quyền hạn và trách nhiệm của vai trò này..."
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
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Hủy
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingRole ? 'Lưu Thay Đổi' : 'Thêm Vai Trò'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
