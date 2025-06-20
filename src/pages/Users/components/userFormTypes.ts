/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Users/components/userFormTypes.ts
import {
  ThongTinGiangVienInput,
  ThongTinSinhVienInput,
} from '@/services/nguoiDung.service';
import * as z from 'zod';

// Các regex cho validation
const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})\b/; // Regex SĐT Việt Nam cơ bản

const baseUserSchema = {
  hoTen: z.string().min(3, 'Họ tên phải có ít nhất 3 ký tự.').max(150),
  email: z.string().email('Email không hợp lệ.'),
  maDinhDanh: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  soDienThoai: z
    .string()
    .regex(PHONE_REGEX, 'Số điện thoại không hợp lệ.')
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  ngaySinh: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) =>
        !v ||
        /^\d{4}-\d{2}-\d{2}$/.test(v) || // yyyy-MM-dd
        /^\d{2}\/\d{2}\/\d{4}$/.test(v), // dd/MM/yyyy
      {
        message: 'Ngày sinh phải đúng định dạng yyyy-MM-dd hoặc dd/MM/yyyy',
      }
    )
    .transform((v) => {
      if (!v || v === '') return null;
      // Chuyển dd/MM/yyyy về yyyy-MM-dd
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
        const [d, m, y] = v.split('/');
        return `${y}-${m}-${d}`;
      }
      return v;
    }), // Sẽ là string YYYY-MM-DD từ date picker
  anhDaiDien: z
    .string()
    .url('URL ảnh không hợp lệ.')
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  isActive: z.boolean().default(true),
};

const accountSchema = {
  matKhau: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 0 || val.length >= 6, {
      message:
        'Mật khẩu phải có ít nhất 6 ký tự (nếu tạo mới). Hoặc để trống để dùng mật khẩu mặc định.',
    }),
  trangThaiTk: z.string().optional(), // VD: 'Active', 'Locked'
};

const sinhVienSchema = z.object({
  lopID: z.preprocess(
    (val) => Number(val),
    z.number().int().positive('Vui lòng chọn lớp.')
  ),
  khoaHoc: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  heDaoTao: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  ngayNhapHoc: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)), // Sẽ là string YYYY-MM-DD từ date picker
  trangThaiHocTap: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
} satisfies Record<keyof ThongTinSinhVienInput, any>);

const giangVienSchema = z.object({
  hocVi: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  hocHam: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  chucDanhGD: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  chuyenMonChinh: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
} satisfies Record<keyof ThongTinGiangVienInput, any>);

export const userFormSchema = z
  .object({
    ...baseUserSchema,
    ...accountSchema,
    loaiNguoiDung: z.enum(['SINH_VIEN', 'GIANG_VIEN', 'NHAN_VIEN_KHAC'], {
      required_error: 'Vui lòng chọn loại người dùng.',
    }),
    donViCongTacID: z
      .preprocess(
        (val) => (val === '' || val == null ? null : Number(val)),
        z.number().int().positive('Vui lòng chọn đơn vị công tác.').nullable()
      )
      .optional(),
    thongTinSinhVien: sinhVienSchema.optional().nullable(),
    thongTinGiangVien: z
      .object({
        hocVi: z
          .string()
          .max(100)
          .optional()
          .nullable()
          .transform((v) => (v === '' ? null : v)),
        hocHam: z
          .string()
          .max(100)
          .optional()
          .nullable()
          .transform((v) => (v === '' ? null : v)),
        chucDanhGD: z
          .string()
          .max(100)
          .optional()
          .nullable()
          .transform((v) => (v === '' ? null : v)),
        chuyenMonChinh: z
          .string()
          .max(255)
          .optional()
          .nullable()
          .transform((v) => (v === '' ? null : v)),
      })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.loaiNguoiDung === 'SINH_VIEN' && !data.thongTinSinhVien) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thông tin sinh viên là bắt buộc.',
        path: ['thongTinSinhVien'],
      });
    }
    if (data.loaiNguoiDung === 'GIANG_VIEN' && !data.thongTinGiangVien) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thông tin giảng viên là bắt buộc.',
        path: ['thongTinGiangVien'],
      });
    }
  });

export type UserFormValues = z.infer<typeof userFormSchema>;

// Schema cho form gán vai trò
export const assignRoleFormSchema = z
  .object({
    vaiTroID: z.string().min(1, 'Vui lòng chọn vai trò chức năng.'),
    donViID: z
      .string()
      .optional()
      .nullable()
      .transform((v) => (v === 'null' || v === '' ? null : v)),
    ngayBatDau: z.date().optional().nullable(),
    ngayKetThuc: z.date().optional().nullable(),
    ghiChuGanVT: z
      .string()
      .max(500)
      .optional()
      .nullable()
      .transform((v) => (v === '' ? null : v)),
  })
  .refine(
    (data) => {
      if (
        data.ngayBatDau &&
        data.ngayKetThuc &&
        data.ngayKetThuc < data.ngayBatDau
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
      path: ['ngayKetThuc'],
    }
  );

export type AssignRoleFormValues = z.infer<typeof assignRoleFormSchema>;
