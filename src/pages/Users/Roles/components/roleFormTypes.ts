// src/pages/Users/Roles/components/roleFormTypes.ts (Tạo file mới này)

import { VaiTroHeThongItem } from '@/services/vaiTro.service';
import * as z from 'zod';

// MaVaiTro nên là chữ IN HOA, không dấu, không khoảng trắng, có thể có gạch dưới
const MA_VAI_TRO_REGEX = /^[A-Z0-9_]+$/;

export const roleFormSchema = z.object({
  maVaiTro: z
    .string()
    .min(3, { message: 'Mã vai trò phải có ít nhất 3 ký tự.' })
    .max(50, { message: 'Mã vai trò không quá 50 ký tự.' })
    .regex(MA_VAI_TRO_REGEX, {
      message: 'Mã vai trò chỉ chứa chữ IN HOA, số, và gạch dưới (_).',
    })
    .transform((val) => val.toUpperCase()), // Tự động chuyển thành chữ IN HOA
  tenVaiTro: z
    .string()
    .min(3, { message: 'Tên vai trò phải có ít nhất 3 ký tự.' })
    .max(150, { message: 'Tên vai trò không quá 150 ký tự.' }),
  moTaVT: z
    .string()
    .max(500, { message: 'Mô tả không quá 500 ký tự.' })
    .optional()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

export interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRole?: VaiTroHeThongItem | null;
}
