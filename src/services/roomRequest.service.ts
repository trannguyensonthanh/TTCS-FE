// src/services/roomRequest.service.ts
import {
  DonViResponseMin,
  NguoiDungResponseMin,
} from '@/services/event.service';
import apiHelper, { APIError } from './apiHelper';

// Type cho trạng thái yêu cầu phòng (chung hoặc chi tiết)
export interface TrangThaiYeuCauPhongResponse {
  trangThaiYcpID: number;
  maTrangThai: string;
  tenTrangThai: string;
  loaiApDung: 'CHUNG' | 'CHI_TIET'; // Để phân biệt
}

// Type cho thông tin tóm tắt của Loại Phòng (sử dụng trong YcMuonPhongChiTietResponse)
export interface LoaiPhongResponseMin {
  loaiPhongID: number;
  tenLoaiPhong: string;
}

// Type cho thông tin tóm tắt của Phòng đã được cấp (sử dụng trong YcMuonPhongChiTietResponse)
export interface PhongDuocCapResponse {
  datPhongID: number; // Từ ChiTietDatPhong
  phongID: number; // Từ Phong
  tenPhong: string; // Từ Phong
  maPhong?: string | null; // Từ Phong
  // Có thể thêm các thông tin khác của phòng nếu cần hiển thị ngay
}

// Type cho một chi tiết yêu cầu mượn phòng (trong response lấy chi tiết YeuCauMuonPhong)
export interface YcMuonPhongChiTietResponse {
  ycMuonPhongCtID: number;
  ycMuonPhongID: number; // Để biết thuộc yêu cầu header nào
  moTaNhomPhong?: string | null;
  slPhongNhomNay: number;
  loaiPhongYeuCau?: LoaiPhongResponseMin | null; // Join từ LoaiPhong
  sucChuaYc?: number | null;
  thietBiThemYc?: string | null;
  tgMuonDk: string; // ISO Date string
  tgTraDk: string; // ISO Date string
  trangThaiChiTiet: TrangThaiYeuCauPhongResponse; // Với LoaiApDung = 'CHI_TIET'
  ghiChuCtCSVC?: string | null;
  phongDuocCap: PhongDuocCapResponse[]; // Mảng các phòng được cấp cho chi tiết này (nếu SlPhongNhomNay > 1)
  // Lấy từ ChiTietDatPhong join Phong
}

// Type cho các tham số query khi lấy danh sách YeuCauMuonPhong (Header)
export interface GetYeuCauMuonPhongParams {
  searchTerm?: string;
  trangThaiChungMa?: string; // Lọc theo MaTrangThai của TrangThaiYeuCauPhong (CHUNG)
  suKienID?: number;
  nguoiYeuCauID?: number;
  donViYeuCauID?: number; // Đơn vị của người yêu cầu
  tuNgayYeuCau?: string; // YYYY-MM-DD
  denNgayYeuCau?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
  sortBy?: string; // VD: NgayYeuCau, SuKien.TenSK
  sortOrder?: 'asc' | 'desc';
}

export interface PhongDuocCapPayload {
  // Chỉ cần khi duyệt
  phongID: number;
  // tgNhanPhongTT, tgTraPhongTT có thể lấy từ tgMuonDk, tgTraDk của YcMuonPhongChiTiet
}
export interface XuLyYcChiTietPayload {
  hanhDong: 'DUYET' | 'TU_CHOI'; // 'DUYET' hoặc 'TU_CHOI'
  phongDuocCap?: PhongDuocCapPayload[]; // Mảng các phòng được cấp (nếu SlPhongNhomNay > 1)
  // Chỉ cần khi hanhDong = 'DUYET'
  ghiChuCSVC?: string | null; // Lý do từ chối hoặc ghi chú thêm
}

export interface YcMuonPhongChiTietCreatePayload {
  moTaNhomPhong?: string | null;
  slPhongNhomNay: number;
  loaiPhongYcID?: number | null;
  sucChuaYc?: number | null;
  thietBiThemYc?: string | null;
  tgMuonDk: string; // ISO "yyyy-MM-ddTHH:mm:ss"
  tgTraDk: string; // ISO "yyyy-MM-ddTHH:mm:ss"
}
export interface CreateYeuCauMuonPhongPayload {
  suKienID: number; // Sự kiện phải ở trạng thái DA_DUYET_BGH
  ghiChuChungYc?: string | null;
  chiTietYeuCau: YcMuonPhongChiTietCreatePayload[]; // Mảng các yêu cầu chi tiết
}

// src/types/yeuCauMuonPhong.types.ts
export interface YeuCauMuonPhongDetailResponse
  extends Omit<
    YeuCauMuonPhongListItemResponse,
    'soLuongChiTietYeuCau' | 'soLuongChiTietDaXepPhong'
  > {
  ghiChuChungYc?: string | null;
  nguoiDuyetTongCSVC?: NguoiDungResponseMin | null;
  ngayDuyetTongCSVC?: string | null; // ISO
  chiTietYeuCau: YcMuonPhongChiTietResponse[]; // Đã định nghĩa ở file trước, bao gồm phòng được cấp
}

export interface YeuCauMuonPhongListItemResponse {
  // Cho danh sách
  ycMuonPhongID: number;
  suKien: {
    // Thông tin tóm tắt sự kiện
    suKienID: number;
    tenSK: string;
    tgBatDauDK: string; // ISO
    tgKetThucDK: string; // ISO
  };
  nguoiYeuCau: NguoiDungResponseMin;
  donViYeuCau: DonViResponseMin; // Đơn vị của người yêu cầu
  ngayYeuCau: string; // ISO
  trangThaiChung: TrangThaiYeuCauPhongResponse; // Với LoaiApDung = 'CHUNG'
  soLuongChiTietYeuCau: number; // Tổng số YcMuonPhongChiTiet
  soLuongChiTietDaXepPhong: number;
}

export interface PaginatedYeuCauMuonPhongResponse {
  items: YeuCauMuonPhongListItemResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

const getRoomRequests = async (
  params: GetYeuCauMuonPhongParams
): Promise<PaginatedYeuCauMuonPhongResponse> => {
  return apiHelper.get(
    '/yeucaumuonphong',
    params
  ) as Promise<PaginatedYeuCauMuonPhongResponse>;
};

const getRoomRequestDetail = async (
  id: number | string
): Promise<YeuCauMuonPhongDetailResponse> => {
  return apiHelper.get(
    `/yeucaumuonphong/${id}`
  ) as Promise<YeuCauMuonPhongDetailResponse>;
};

const createRoomRequest = async (
  payload: CreateYeuCauMuonPhongPayload
): Promise<YeuCauMuonPhongDetailResponse> => {
  return apiHelper.post(
    '/yeucaumuonphong',
    payload
  ) as Promise<YeuCauMuonPhongDetailResponse>;
};

const processRoomRequestDetail = async (
  ycMuonPhongID: number | string,
  ycMuonPhongCtID: number | string,
  payload: XuLyYcChiTietPayload
): Promise<YeuCauMuonPhongDetailResponse> => {
  return apiHelper.put(
    `/yeucaumuonphong/${ycMuonPhongID}/chitiet/${ycMuonPhongCtID}/xu-ly`,
    payload
  ) as Promise<YeuCauMuonPhongDetailResponse>;
};

const cancelRoomRequestByUser = async (
  ycMuonPhongID: number | string
): Promise<YeuCauMuonPhongDetailResponse> => {
  return apiHelper.put(
    `/yeucaumuonphong/${ycMuonPhongID}/huy`,
    {}
  ) as Promise<YeuCauMuonPhongDetailResponse>;
};

const roomRequestService = {
  getRoomRequests,
  getRoomRequestDetail,
  createRoomRequest,
  processRoomRequestDetail,
  cancelRoomRequestByUser,
};

export default roomRequestService;
