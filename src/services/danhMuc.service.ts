// Danh mục service: Các hàm lấy danh sách loại phòng, phòng, trạng thái phòng, tòa nhà tầng, trang thiết bị (dạng select/minimal)

import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import apiHelper from './apiHelper';
import { TrangThaiPhongResponse } from '@/services/phong.service';
import {
  PaginatedToaNhaResponse,
  ToaNhaResponseMin,
} from '@/services/toaNha.service';

export interface TrangThietBiResponseMin {
  thietBiID: number;
  tenThietBi: string;
}

export interface TrangThietBiFullResponse extends TrangThietBiResponseMin {
  moTa?: string | null;
}

export interface CreateTrangThietBiPayload {
  tenThietBi: string;
  moTa?: string | null;
}

export interface UpdateTrangThietBiPayload {
  tenThietBi?: string;
  moTa?: string | null;
}

export interface GetTrangThietBiParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTrangThietBiResponse {
  items: TrangThietBiFullResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface SuKienForSelectResponse {
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string;
  tgKetThucDK: string;
  donViChuTri: {
    tenDonVi: string;
  };
}

export interface PhongForSelectResponse {
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  sucChua?: number | null;
  tenLoaiPhong: string;
  loaiPhongID?: number | null;
  toaNhaTangID: string | number;
}

export interface PhongResponseMin {
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  sucChua?: number | null;
  loaiPhong?: LoaiPhongResponseMin | null;
  toaNhaTangID: string | number;
  tgNhanPhongTT?: string;
  tgTraPhongTT?: string;
}

export interface NganhHocResponseMin {
  nganhHocID: number;
  tenNganhHoc: string;
  maNganhHoc?: string | null;
  coChuyenNganh?: boolean;
}

export interface ChuyenNganhResponseMin {
  chuyenNganhID: number;
  tenChuyenNganh: string;
  maChuyenNganh?: string | null;
}

export interface GetLoaiPhongParams {
  limit?: number;
}

export interface ToaNhaTangForSelectResponse {
  toaNhaTangID: number;
  tenHienThi: string;
  toaNhaID: number;
  tenToaNha: string;
  loaiTangID: number;
  tenLoaiTang: string;
  moTaTang?: string | null;
}

const getLoaiPhongList = async (
  params?: GetLoaiPhongParams
): Promise<LoaiPhongResponseMin[]> => {
  return apiHelper.get('/danhmuc/loai-phong', params || {}) as Promise<
    LoaiPhongResponseMin[]
  >;
};

export interface GetPhongForSelectParams {
  searchTerm?: string;
  loaiPhongID?: number;
  sucChuaToiThieu?: number;
  thoiGianMuon?: string;
  thoiGianTra?: string;
  trangThaiPhongMa?: string;
  limit?: number;
}

const getPhongListForSelect = async (
  params?: GetPhongForSelectParams
): Promise<PhongForSelectResponse[]> => {
  return apiHelper.get('/danhmuc/phong/cho-chon', params || {}) as Promise<
    PhongForSelectResponse[]
  >;
};

export interface GetTrangThaiPhongParams {
  limit?: number;
}

const getTrangThaiPhongList = async (
  params?: GetTrangThaiPhongParams
): Promise<TrangThaiPhongResponse[]> => {
  return apiHelper.get('/danhmuc/trang-thai-phong', params || {}) as Promise<
    TrangThaiPhongResponse[]
  >;
};

export interface GetToaNhaTangForSelectParams {
  toaNhaID?: number;
  searchTerm?: string;
  limit?: number;
}

const getToaNhaTangListForSelect = async (
  params?: GetToaNhaTangForSelectParams
): Promise<ToaNhaTangForSelectResponse[]> => {
  return apiHelper.get(
    '/danhmuc/toa-nha-tang/cho-chon',
    params || {}
  ) as Promise<ToaNhaTangForSelectResponse[]>;
};

export interface GetTrangThietBiForSelectParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getTrangThietBiListForSelect = async (
  params?: GetTrangThietBiForSelectParams
): Promise<TrangThietBiResponseMin[]> => {
  return apiHelper.get(
    '/danhmuc/trang-thiet-bi/cho-chon',
    params || {}
  ) as Promise<TrangThietBiResponseMin[]>;
};

// --- Ngành Học cho Select ---
export interface GetNganhHocForSelectParams {
  searchTerm?: string;
  khoaQuanLyID?: number;

  limit?: number; // Mặc định lấy hết hoặc một số lượng lớn (vd: 200)
}

// Lấy danh sách Ngành Học cho Select
const getNganhHocListForSelect = async (
  params?: GetNganhHocForSelectParams
): Promise<NganhHocResponseMin[]> => {
  return apiHelper.get(
    '/danhmuc/nganh-hoc/select-options',
    params || {}
  ) as Promise<NganhHocResponseMin[]>;
};

// --- Chuyên Ngành cho Select (theo Ngành Học ID) ---
export interface GetChuyenNganhForSelectParams {
  searchTerm?: string;
  limit?: number;
}

// Lấy danh sách Chuyên Ngành cho Select theo Ngành Học ID
const getChuyenNganhListForSelectByNganh = async (
  nganhHocId: number,
  params?: GetChuyenNganhForSelectParams
): Promise<ChuyenNganhResponseMin[]> => {
  return apiHelper.get(
    `/danhmuc/nganh-hoc/${nganhHocId}/chuyen-nganh/select-options`,
    params || {}
  ) as Promise<ChuyenNganhResponseMin[]>;
};

export interface GetToaNhaForSelectParams {
  coSoID?: number;
  searchTerm?: string;
  limit?: number;
}
const getToaNhaListForSelect = async (
  params?: GetToaNhaForSelectParams
): Promise<ToaNhaResponseMin[]> => {
  // API này có thể là GET /v1/danhmuc/toa-nha/select-options
  // Hoặc dùng chung GET /v1/danhmuc/toa-nha với params phù hợp
  const response = (await apiHelper.get('/danhmuc/toa-nha', {
    ...params,
    limit: params?.limit || 100,
  })) as Promise<PaginatedToaNhaResponse>;
  return (await response).items.map((item) => ({
    toaNhaID: item.toaNhaID,
    tenToaNha: item.tenToaNha,
    maToaNha: item.maToaNha,
  }));
};

const danhMucService = {
  getLoaiPhongList, // Lấy danh sách loại phòng
  getPhongListForSelect, // Lấy danh sách phòng cho Select
  getTrangThaiPhongList, // Lấy danh sách trạng thái phòng
  getToaNhaTangListForSelect, // Lấy danh sách tòa nhà tầng cho Select
  getTrangThietBiListForSelect, // Lấy danh sách trang thiết bị cho Select
  getNganhHocListForSelect, // Lấy danh sách ngành học cho Select
  getChuyenNganhListForSelectByNganh, // Lấy danh sách chuyên ngành theo ngành học ID
  getToaNhaListForSelect, // Lấy danh sách tòa nhà cho Select
};

export default danhMucService;
