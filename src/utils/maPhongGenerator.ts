import { DonViResponseMin } from '@/services/event.service';
import {
  LoaiTangResponseMinForPhong,
  ToaNhaResponseMinForPhong,
} from '@/services/phong.service';

interface MaPhongParts {
  maCoSo?: string | null;
  maToaNha?: string | null;
  maLoaiTang?: string | null;
  soThuTuPhong?: string | null;
  maLoaiPhong?: string | null;
}

export const generateMaPhongGoiY = (parts: MaPhongParts): string => {
  const { maCoSo, maToaNha, maLoaiTang, soThuTuPhong, maLoaiPhong } = parts;

  if (maCoSo && maToaNha && maLoaiTang && soThuTuPhong) {
    const formattedSoThuTu = soThuTuPhong.match(/^\d+$/)
      ? soThuTuPhong.padStart(2, '0')
      : soThuTuPhong.toUpperCase();
    return `${maCoSo.toUpperCase()}${maToaNha.toUpperCase()}${maLoaiTang.toUpperCase()}${formattedSoThuTu}`;
  }

  if (maToaNha && maLoaiPhong) {
    if (soThuTuPhong) {
      const formattedSoThuTu = soThuTuPhong.match(/^\d+$/)
        ? soThuTuPhong.padStart(2, '0')
        : soThuTuPhong.toUpperCase();
      return `${
        maCoSo ? maCoSo.toUpperCase() : ''
      }${maToaNha.toUpperCase()}-${maLoaiPhong.toUpperCase()}${formattedSoThuTu}`;
    }
    return `${
      maCoSo ? maCoSo.toUpperCase() : ''
    }${maToaNha.toUpperCase()}-${maLoaiPhong.toUpperCase()}-DACBIET`;
  }

  return '';
};

export const getMaCoSoFromDonVi = (
  coSoDonVi?: DonViResponseMin
): string | undefined => {
  if (!coSoDonVi?.maDonVi) return undefined;
  if (coSoDonVi.maDonVi.includes('Q1')) return '1';
  if (coSoDonVi.maDonVi.includes('Q9')) return '2';
  return coSoDonVi.maDonVi.toUpperCase();
};

export const getMaToaNha = (
  toaNha?: ToaNhaResponseMinForPhong
): string | undefined => {
  return toaNha?.maToaNha?.toUpperCase();
};

export const getMaLoaiTang = (
  loaiTang?: LoaiTangResponseMinForPhong
): string | undefined => {
  return loaiTang?.maLoaiTang?.toUpperCase();
};
