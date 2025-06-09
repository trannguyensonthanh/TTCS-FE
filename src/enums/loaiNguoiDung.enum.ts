// src/enums/loaiNguoiDung.enum.ts
export enum LoaiNguoiDungEnum {
  SINH_VIEN = 'SINH_VIEN',
  GIANG_VIEN = 'GIANG_VIEN',
  NHAN_VIEN_KHAC = 'NHAN_VIEN_KHAC', // Cho các cán bộ, nhân viên không phải là GV/SV
}

export const LoaiNguoiDungLabels: Record<LoaiNguoiDungEnum, string> = {
  [LoaiNguoiDungEnum.SINH_VIEN]: 'Sinh viên',
  [LoaiNguoiDungEnum.GIANG_VIEN]: 'Giảng viên',
  [LoaiNguoiDungEnum.NHAN_VIEN_KHAC]: 'Nhân viên/Cán bộ khác',
};
