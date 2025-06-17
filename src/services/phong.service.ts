// src/services/phong.service.ts
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import apiHelper, { API_BASE_URL } from './apiHelper';
import { TrangThietBiResponseMin } from '@/services/danhMuc.service';

export interface TrangThaiPhongResponse {
  // Định nghĩa nếu chưa có
  trangThaiPhongID: number;
  maTrangThai?:
    | 'SAN_SANG'
    | 'DANG_SU_DUNG'
    | 'DANG_DUOC_DAT'
    | 'DANG_BAO_TRI'
    | 'NGUNG_SU_DUNG'
    | 'CHO_DON_DEP';
  tenTrangThai: string;
}

export interface ToaNhaResponseMinForPhong {
  // Tóm tắt Tòa nhà
  toaNhaID: number;
  tenToaNha: string;
  maToaNha?: string | null;
}
export interface LoaiTangResponseMinForPhong {
  // Tóm tắt Loại tầng
  loaiTangID: number;
  tenLoaiTang: string;
  maLoaiTang?: string | null;
}
export interface ToaNhaTangResponseMinForPhong {
  // Tóm tắt Tầng vật lý
  toaNhaTangID: number;
  toaNha: ToaNhaResponseMinForPhong;
  loaiTang: LoaiTangResponseMinForPhong;
  moTa?: string | null; // Mô tả của ToaNha_Tang
}

export interface PhongListItemResponse {
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  loaiPhong: LoaiPhongResponseMin;
  sucChua?: number | null;
  trangThaiPhong: TrangThaiPhongResponse;
  toaNhaTang?: ToaNhaTangResponseMinForPhong | null; // Thông tin tầng và tòa nhà
  soThuTuPhong?: string | null;
  anhMinhHoa?: string | null; // URL ảnh minh họa
  // soLuongThietBi?: number; // Tính toán từ Phong_ThietBi
}

export interface PaginatedPhongResponse {
  items: PhongListItemResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}
// src/types/phong.types.ts
export interface ThietBiTrongPhongInput {
  thietBiID: number;
  soLuong: number;
  tinhTrang?: string | null;
}

export interface CreatePhongPayload {
  tenPhong: string; // NOT NULL
  maPhong?: string | null; // UNIQUE
  loaiPhongID: number; // NOT NULL
  sucChua?: number | null;
  trangThaiPhongID: number; // NOT NULL
  moTaChiTietPhong?: string | null;
  anhMinhHoa?: string | null;
  toaNhaTangID: number;
  soThuTuPhong?: string | null;
  thietBiTrongPhong?: ThietBiTrongPhongInput[];
}

export interface UpdatePhongPayload {
  tenPhong?: string;
  maPhong?: string | null;
  loaiPhongID?: number;
  sucChua?: number | null;
  trangThaiPhongID?: number;
  moTaChiTietPhong?: string | null;
  anhMinhHoa?: string | null;
  toaNhaTangID?: number;
  soThuTuPhong?: string | null;
  thietBiTrongPhong?: ThietBiTrongPhongInput[];
}

export interface ThietBiTrongPhongResponse {
  // phongThietBiID: number;
  thietBi: TrangThietBiResponseMin;
  soLuong: number;
  tinhTrang?: string | null;
}

export interface PhongDetailResponse extends PhongListItemResponse {
  moTaChiTietPhong?: string | null;
  anhMinhHoa?: string | null;
  thietBiTrongPhong: ThietBiTrongPhongResponse[];
}

export interface GetPhongParams {
  searchTerm?: string;
  loaiPhongID?: number;
  trangThaiPhongID?: number;
  toaNhaID?: number;
  toaNhaTangID?: number;
  sucChuaTu?: number;
  sucChuaDen?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetMaPhongDetailParams {
  toaNhaTangID?: number;
  loaiPhongID?: number;
  soThuTuPhong?: string;
  phongID?: number | null;
}

export interface ImportPhongRowResult {
  rowNumber: number; // Số dòng trong file Excel (để dễ đối chiếu)
  tenPhong?: string; // Tên phòng từ file
  maPhong?: string | null;
  status: 'success' | 'error';
  message?: string; // Thông báo lỗi chi tiết nếu status là 'error'
  phongID?: number; // ID của phòng nếu tạo thành công
}

export interface ImportPhongResponse {
  totalRows: number;
  successCount: number;
  errorCount: number;
  results: ImportPhongRowResult[];
  overallMessage: string; // Thông báo tổng quan
}

const getPhongList = async (
  params: GetPhongParams
): Promise<PaginatedPhongResponse> => {
  return apiHelper.get(
    '/danhmuc/phong',
    params
  ) as Promise<PaginatedPhongResponse>;
};

const getPhongDetail = async (
  id: number | string
): Promise<PhongDetailResponse> => {
  return apiHelper.get(`/danhmuc/phong/${id}`) as Promise<PhongDetailResponse>;
};

const createPhong = async (
  payload: CreatePhongPayload
): Promise<PhongDetailResponse> => {
  return apiHelper.post(
    '/danhmuc/phong',
    payload
  ) as Promise<PhongDetailResponse>;
};

const updatePhong = async (
  id: number | string,
  payload: UpdatePhongPayload
): Promise<PhongDetailResponse> => {
  return apiHelper.put(
    `/danhmuc/phong/${id}`,
    payload
  ) as Promise<PhongDetailResponse>;
};

const deletePhong = async (
  id: number | string
): Promise<{ message: string }> => {
  return apiHelper.delete(`/danhmuc/phong/${id}`) as Promise<{
    message: string;
  }>;
};

const generateMaPhong = async (
  params: GetMaPhongDetailParams
): Promise<{ maPhongGoiY: string; isUnique: boolean; message: string }> => {
  const response = await apiHelper.get(
    `${API_BASE_URL}/danhmuc/phong/generate-ma-phong`,
    {
      ...params,
    }
  );

  return {
    maPhongGoiY: response.maPhongGoiY,
    isUnique: !response.isUnique,
    message: response.message
      ? 'Mã phòng gợi ý đã được sử dụng.'
      : 'Tạo mã phòng gợi ý thành công.',
  };
};

const importPhongFromExcel = async (
  file: File
): Promise<ImportPhongResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/danhmuc/phong/import-excel', {
    method: 'POST',
    body: formData,
    // Không cần set Content-Type, trình duyệt sẽ tự động set cho FormData
    credentials: 'include', // Nếu API yêu cầu cookie/session
  });

  if (!response.ok) {
    throw new Error('Lỗi khi import file Excel');
  }

  return response.json() as Promise<ImportPhongResponse>;
};

const phongService = {
  getPhongList,
  getPhongDetail,
  createPhong,
  updatePhong,
  deletePhong,
  generateMaPhong,
  importPhongFromExcel,
};

export default phongService;
