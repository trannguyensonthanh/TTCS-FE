// src/utils/maPhongGenerator.ts (Tạo file mới)

import { DonViResponseMin } from '@/services/event.service';
import {
  LoaiTangResponseMinForPhong,
  ToaNhaResponseMinForPhong,
} from '@/services/phong.service';

// Giả định bạn có các hàm hoặc cách để lấy thông tin chi tiết từ ID
// Ví dụ: getCoSoById, getToaNhaById, getLoaiTangById

interface MaPhongParts {
  maCoSo?: string | null; // VD: '1' (Q1), '9' (Q9)
  maToaNha?: string | null; // VD: 'A', 'C1'
  maLoaiTang?: string | null; // VD: '1', '2', 'T' (Tầng 1, Tầng 2, Trệt)
  soThuTuPhong?: string | null; // VD: '01', '12', 'A' (Phòng 01, Phòng 12, Phòng A trên tầng đó)
  maLoaiPhong?: string | null; // VD: 'HT' (Hội trường), 'PH' (Phòng học) - Dùng cho các phòng đặc biệt
}

/**
 * Tạo mã phòng gợi ý dựa trên các thành phần.
 * Cần điều chỉnh logic này cho phù hợp với quy tắc đặt mã chính xác của PTITHCM.
 */
export const generateMaPhongGoiY = (parts: MaPhongParts): string => {
  const { maCoSo, maToaNha, maLoaiTang, soThuTuPhong, maLoaiPhong } = parts;

  // Trường hợp phòng học thông thường có đủ thông tin
  if (maCoSo && maToaNha && maLoaiTang && soThuTuPhong) {
    // Đảm bảo soThuTuPhong có 2 chữ số nếu là số (ví dụ: 1 -> 01, 12 -> 12)
    const formattedSoThuTu = soThuTuPhong.match(/^\d+$/)
      ? soThuTuPhong.padStart(2, '0')
      : soThuTuPhong.toUpperCase();
    return `${maCoSo.toUpperCase()}${maToaNha.toUpperCase()}${maLoaiTang.toUpperCase()}${formattedSoThuTu}`;
  }

  // Trường hợp phòng đặc biệt (ví dụ: Hội trường)
  // Có thể dựa vào Loại Phòng và Tòa Nhà
  if (maToaNha && maLoaiPhong) {
    // Ví dụ: Nếu là Hội trường (HT) ở tòa A, có thể là A-HT01, A-HT02
    // Cần một quy tắc rõ ràng hơn cho các phòng này.
    // Giả sử chúng ta thêm một số thứ tự ngẫu nhiên hoặc dựa trên số lượng đã có
    // Đây là phần bạn cần định nghĩa quy tắc cụ thể hơn.
    // Ví dụ đơn giản:
    if (soThuTuPhong) {
      // Nếu vẫn có số thứ tự cho phòng đặc biệt này
      const formattedSoThuTu = soThuTuPhong.match(/^\d+$/)
        ? soThuTuPhong.padStart(2, '0')
        : soThuTuPhong.toUpperCase();
      return `${
        maCoSo ? maCoSo.toUpperCase() : ''
      }${maToaNha.toUpperCase()}-${maLoaiPhong.toUpperCase()}${formattedSoThuTu}`;
    }
    return `${
      maCoSo ? maCoSo.toUpperCase() : ''
    }${maToaNha.toUpperCase()}-${maLoaiPhong.toUpperCase()}-DACBIET`; // Cần quy tắc tốt hơn
  }

  // Nếu không đủ thông tin để tạo mã chuẩn
  return '';
};

// Helper để lấy mã cho các thành phần (bạn cần API để lấy dữ liệu này)
// Đây chỉ là ví dụ, bạn sẽ dùng hook React Query để lấy dữ liệu thực tế
export const getMaCoSoFromDonVi = (
  coSoDonVi?: DonViResponseMin
): string | undefined => {
  // Logic để lấy mã viết tắt của cơ sở từ DonVi.MaDonVi hoặc một trường riêng
  // Ví dụ: nếu MaDonVi là "CS_Q1" -> "1", "CS_Q9" -> "9"
  if (!coSoDonVi?.maDonVi) return undefined;
  if (coSoDonVi.maDonVi.includes('Q1')) return '1';
  if (coSoDonVi.maDonVi.includes('Q9')) return '2'; // Hoặc một mã khác bạn quy định
  return coSoDonVi.maDonVi.toUpperCase(); // Fallback
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
