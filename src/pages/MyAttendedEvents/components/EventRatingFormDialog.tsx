// src/pages/MyAttendedEvents/components/EventRatingFormDialog.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Star, Send, Trash2 } from 'lucide-react';
import {
  SuKienDaThamGiaItem,
  DanhGiaCuaToi,
  GuiDanhGiaPayload,
  CapNhatDanhGiaPayload,
} from '@/services/eventRating.service';
import {
  useSubmitEventRating,
  useUpdateEventRating,
  useDeleteEventRating,
} from '@/hooks/queries/eventRatingQueries';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const ratingValueSchema = z
  .number()
  .min(1, 'Điểm phải từ 1')
  .max(5, 'Điểm tối đa là 5');

const eventRatingFormSchema = z.object({
  diemNoiDung: ratingValueSchema,
  diemToChuc: ratingValueSchema,
  diemDiaDiem: ratingValueSchema,
  yKienDongGop: z
    .string()
    .max(2000, 'Ý kiến không quá 2000 ký tự.')
    .optional()
    .nullable(),
});

type EventRatingFormValues = z.infer<typeof eventRatingFormSchema>;

interface EventRatingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToRate: SuKienDaThamGiaItem | null;
  existingRating?: DanhGiaCuaToi | null; // Đánh giá hiện tại nếu có (để sửa)
  onCloseDialog: (submittedOrUpdated: boolean) => void;
}

const StarRatingInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'h-7 w-7 cursor-pointer transition-colors',
            star <= value
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 dark:text-gray-600',
            disabled ? 'cursor-not-allowed opacity-70' : 'hover:text-yellow-300'
          )}
          onClick={() => !disabled && onChange(star)}
        />
      ))}
    </div>
  );
};

const EventRatingFormDialog: React.FC<EventRatingFormDialogProps> = ({
  open,
  onOpenChange,
  eventToRate,
  existingRating,
  onCloseDialog,
}) => {
  const form = useForm<EventRatingFormValues>({
    resolver: zodResolver(eventRatingFormSchema),
    defaultValues: {
      diemNoiDung: existingRating?.diemNoiDung || 0,
      diemToChuc: existingRating?.diemToChuc || 0,
      diemDiaDiem: existingRating?.diemDiaDiem || 0,
      yKienDongGop: existingRating?.yKienDongGop || '',
    },
  });

  useEffect(() => {
    if (eventToRate && open) {
      // Reset form khi mở dialog hoặc event thay đổi
      form.reset({
        diemNoiDung: existingRating?.diemNoiDung || 0,
        diemToChuc: existingRating?.diemToChuc || 0,
        diemDiaDiem: existingRating?.diemDiaDiem || 0,
        yKienDongGop: existingRating?.yKienDongGop || '',
      });
    }
  }, [eventToRate, existingRating, open, form]);

  const submitRatingMutation = useSubmitEventRating();
  const updateRatingMutation = useUpdateEventRating();
  // const deleteRatingMutation = useDeleteEventRating(); // Nếu muốn thêm chức năng xóa

  const onSubmit = async (values: EventRatingFormValues) => {
    if (!eventToRate) return;

    if (existingRating && existingRating.danhGiaSkID) {
      // Chế độ cập nhật
      const payload: CapNhatDanhGiaPayload = {
        diemNoiDung:
          values.diemNoiDung === existingRating.diemNoiDung
            ? undefined
            : values.diemNoiDung,
        diemToChuc:
          values.diemToChuc === existingRating.diemToChuc
            ? undefined
            : values.diemToChuc,
        diemDiaDiem:
          values.diemDiaDiem === existingRating.diemDiaDiem
            ? undefined
            : values.diemDiaDiem,
        yKienDongGop:
          values.yKienDongGop === existingRating.yKienDongGop
            ? undefined
            : values.yKienDongGop || null,
      };
      // Chỉ gửi nếu có thay đổi
      if (Object.values(payload).some((v) => v !== undefined)) {
        try {
          await updateRatingMutation.mutateAsync({
            danhGiaSkID: existingRating.danhGiaSkID,
            payload,
          });
          onCloseDialog(true);
        } catch (e) {
          /* Lỗi đã được toast bởi hook */
        }
      } else {
        toast.info('Không có thay đổi nào để cập nhật.');
        onCloseDialog(false);
      }
    } else {
      // Chế độ tạo mới
      if (
        values.diemNoiDung === 0 ||
        values.diemToChuc === 0 ||
        values.diemDiaDiem === 0
      ) {
        toast.error('Vui lòng chọn điểm cho tất cả các mục.');
        return;
      }
      const payload: GuiDanhGiaPayload = {
        suKienID: eventToRate.suKienID,
        diemNoiDung: values.diemNoiDung,
        diemToChuc: values.diemToChuc,
        diemDiaDiem: values.diemDiaDiem,
        yKienDongGop: values.yKienDongGop || null,
      };
      try {
        await submitRatingMutation.mutateAsync(payload);
        onCloseDialog(true);
      } catch (e) {
        /* Lỗi đã được toast bởi hook */
      }
    }
  };

  const isSubmitting =
    submitRatingMutation.isPending || updateRatingMutation.isPending;

  if (!eventToRate) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isSubmitting) onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold flex items-center">
            <Star className="mr-2 h-6 w-6 text-yellow-400" />
            {existingRating ? 'Xem/Sửa Đánh Giá' : 'Đánh Giá Sự Kiện'}
          </DialogTitle>
          <DialogDescription>
            Cho sự kiện:{' '}
            <strong className="text-foreground">{eventToRate.tenSK}</strong>
            <br />
            Chia sẻ ý kiến của bạn để giúp chúng tôi cải thiện chất lượng sự
            kiện.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-grow overflow-hidden py-1"
          >
            <ScrollArea className="h-[calc(90vh-250px)] pr-5 -mr-2 pl-1">
              {' '}
              {/* Adjust height as needed */}
              <div className="space-y-5 py-2">
                <FormField
                  control={form.control}
                  name="diemNoiDung"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        1. Nội dung sự kiện:
                      </FormLabel>
                      <FormControl>
                        <StarRatingInput
                          value={field.value || 0}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diemToChuc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        2. Công tác tổ chức:
                      </FormLabel>
                      <FormControl>
                        <StarRatingInput
                          value={field.value || 0}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diemDiaDiem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        3. Địa điểm & Cơ sở vật chất:
                      </FormLabel>
                      <FormControl>
                        <StarRatingInput
                          value={field.value || 0}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yKienDongGop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        4. Ý kiến đóng góp thêm ( ):
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Chia sẻ cảm nghĩ, đề xuất của bạn..."
                          className="min-h-[120px] resize-y text-sm"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Tối đa 2000 ký tự.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-5 border-t sticky bottom-0 bg-background pb-1 -mx-1">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Hủy
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[130px]"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {existingRating ? 'Lưu Thay Đổi' : 'Gửi Đánh Giá'}
                {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventRatingFormDialog;
