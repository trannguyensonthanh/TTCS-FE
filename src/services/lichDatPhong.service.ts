// src/services/lichDatPhong.service.ts
import { PhongResponseMin } from '@/services/danhMuc.service';
import apiHelper from './apiHelper';
import {
  DonViResponseMin,
  NguoiDungResponseMin,
} from '@/services/event.service';
export interface LichDatPhongItemResponse {
  datPhongID: number; // PK của ChiTietDatPhong
  phong: PhongResponseMin; // Thông tin phòng được đặt
  ycMuonPhongCtID: number; // Để có thể link lại nếu cần
  maTrangThaiDatPhong: string; // Mã trạng thái đặt phòng
  suKienID: number;
  tenSK: string;
  donViToChuc: DonViResponseMin;
  nguoiYeuCau?: NguoiDungResponseMin;
  tgNhanPhongTT: string; // ISO Date string
  tgTraPhongTT: string; // ISO Date string
}

export interface GetLichDatPhongParams {
  tuNgay: string; // YYYY-MM-DD
  denNgay: string; // YYYY-MM-DD
  phongIDs?: string; // VD: "1,2,3"
  toaNhaID?: number;
  loaiPhongID?: number;
  suKienID?: number;
  donViToChucID?: number;
}

export interface GetLichDatPhongTheoPhongParams {
  tuNgay?: string;
  denNgay?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedLichDatPhongResponse {
  items: LichDatPhongItemResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

const getLichDatPhong = async (
  params: GetLichDatPhongParams
): Promise<LichDatPhongItemResponse[]> => {
  return apiHelper.get('/lichsudungphong', params) as Promise<
    LichDatPhongItemResponse[]
  >;
};

const getLichDatPhongTheoPhong = async (
  phongId: number | string,
  params: GetLichDatPhongTheoPhongParams
): Promise<PaginatedLichDatPhongResponse> => {
  return apiHelper.get(
    `/lichsudungphong/theo-phong/${phongId}`,
    params
  ) as Promise<PaginatedLichDatPhongResponse>;
};

const lichDatPhongService = {
  getLichDatPhong,
  getLichDatPhongTheoPhong,
};

export default lichDatPhongService;
