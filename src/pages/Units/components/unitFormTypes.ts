// src/pages/Units/components/UnitFormDialog.tsx (hoặc một file types riêng nếu muốn)

import {
  DonViDetail,
  DonViSelectOption,
  LoaiDonViOption,
} from '@/services/donVi.service';
import * as z from 'zod';

const ALLOWED_LOAI_DON_VI = [
  'KHOA',
  'PHONG',
  'BAN',
  'TRUNG_TAM',
  'BO_MON',
  'CLB',
  'DOAN_THE',
  'CO_SO',
] as const;

export const unitFormSchema = z.object({
  tenDonVi: z
    .string()
    .min(3, { message: 'Tên đơn vị phải có ít nhất 3 ký tự.' })
    .max(200, { message: 'Tên đơn vị không quá 200 ký tự.' }),
  maDonVi: z
    .string()
    .max(50, { message: 'Mã đơn vị không quá 50 ký tự.' })
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)), // Chuyển chuỗi rỗng thành null
  loaiDonVi: z
    .string({ required_error: 'Vui lòng chọn loại đơn vị.' })
    .refine(
      (val) =>
        ALLOWED_LOAI_DON_VI.includes(
          val as (typeof ALLOWED_LOAI_DON_VI)[number]
        ),
      {
        message: 'Loại đơn vị không hợp lệ.',
      }
    ),
  donViChaID: z
    .string() // Sẽ là string từ Select, backend sẽ parse sang number
    .optional()
    .nullable()
    .transform((val) =>
      val === '' || val === 'null' || val === undefined ? null : val
    ),
  moTaDv: z
    .string()
    .max(500, { message: 'Mô tả không quá 500 ký tự.' })
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

// Props cho UnitFormDialog
export interface UnitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUnit?: DonViDetail | null; // DonViDetail từ donVi.types.ts
  loaiDonViOptions: LoaiDonViOption[]; // LoaiDonViOption từ donVi.types.ts
  donViChaOptions: DonViSelectOption[]; // DonViSelectOption từ donVi.types.ts
  isLoadingLoaiDonVi: boolean;
  isLoadingDonViCha: boolean;
}
