// src/services/lichDatPhong.service.ts
import { PhongResponseMin } from '@/services/danhMuc.service';
import apiHelper from './apiHelper';
import { DonViResponseMin } from '@/services/event.service';
export interface LichDatPhongItemResponse {
  datPhongID: number; // PK của ChiTietDatPhong
  phong: PhongResponseMin; // Thông tin phòng được đặt
  ycMuonPhongCtID: number; // Để có thể link lại nếu cần
  maTrangThaiDatPhong: string; // Mã trạng thái đặt phòng
  suKienID: number;
  tenSK: string;
  donViToChuc: DonViResponseMin;

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

const getLichDatPhong = async (
  params: GetLichDatPhongParams
): Promise<LichDatPhongItemResponse[]> => {
  return apiHelper.get('/lichsudungphong', params) as Promise<
    LichDatPhongItemResponse[]
  >;
};

const lichDatPhongService = {
  getLichDatPhong,
};

export default lichDatPhongService;
