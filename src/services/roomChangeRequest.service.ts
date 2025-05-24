// src/services/roomChangeRequest.service.ts
import { NguoiDungResponseMin } from '@/services/event.service';
import apiHelper, { APIError } from './apiHelper';
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import { PhongResponseMin } from '@/services/danhMuc.service';

export interface TrangThaiYeuCauDoiPhongResponse {
  trangThaiYcDoiPID: number; // ID của trạng thái (PK từ bảng TrangThaiYeuCauDoiPhong)
  maTrangThai: string; // Mã trạng thái (VD: 'CHO_DUYET_DOI_PHONG')
  tenTrangThai: string; // Tên trạng thái (VD: 'Chờ duyệt đổi phòng')
  // moTa?: string | null;     // Mô tả thêm về trạng thái (tùy chọn)
}

export interface XuLyYeuCauDoiPhongPayload {
  hanhDong: 'DUYET' | 'TU_CHOI';
  phongMoiID?: number | null; // Chỉ cần khi hanhDong = 'DUYET' (PhongID của phòng mới)
  ghiChuCSVC?: string | null; // Ghi chú thêm khi duyệt
  lyDoTuChoiDoiCSVC?: string | null; // Chỉ cần khi hanhDong = 'TU_CHOI'
}
export interface CreateYeuCauDoiPhongPayload {
  ycMuonPhongCtID: number; // ID của chi tiết yêu cầu phòng gốc (YcMuonPhongChiTiet)
  datPhongID_Cu: number; // ID của bản ghi ChiTietDatPhong hiện tại muốn đổi
  lyDoDoiPhong: string;
  ycPhongMoi_LoaiID?: number | null;
  ycPhongMoi_SucChua?: number | null;
  ycPhongMoi_ThietBi?: string | null;
  // Backend sẽ tự lấy NguoiYeuCauID từ token
  // Backend sẽ tự đặt TrangThaiYcDoiPID thành CHO_DUYET_DOI_PHONG
}

export interface YeuCauDoiPhongDetailResponse
  extends YeuCauDoiPhongListItemResponse {
  ycMuonPhongCtID: number; // Chi tiết yêu cầu phòng gốc
  lyDoDoiPhong: string;
  ycPhongMoi_LoaiPhong?: LoaiPhongResponseMin | null;
  ycPhongMoi_SucChua?: number | null;
  ycPhongMoi_ThietBi?: string | null;
  phongMoiDuocCap?: PhongResponseMin | null; // Thông tin phòng mới nếu đã duyệt
  nguoiDuyetCSVC?: NguoiDungResponseMin | null;
  ngayDuyetCSVC?: string | null; // ISO
  lyDoTuChoiDoiCSVC?: string | null;
}

export interface SuKienInfoForChangeRequest {
  suKienID: number;
  tenSK: string;
}

export interface YeuCauDoiPhongListItemResponse {
  ycDoiPhongID: number;
  suKien: SuKienInfoForChangeRequest;
  nguoiYeuCau: NguoiDungResponseMin;
  ngayYeuCauDoi: string; // ISO
  phongHienTai: PhongResponseMin; // Thông tin phòng đang muốn đổi
  trangThaiYeuCauDoiPhong: TrangThaiYeuCauDoiPhongResponse;
  lyDoDoiPhongNganGon?: string; // Có thể cắt ngắn lý do để hiển thị
}

export interface PaginatedYeuCauDoiPhongResponse {
  items: YeuCauDoiPhongListItemResponse[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

export interface GetYeuCauDoiPhongParams {
  searchTerm?: string | null;

  trangThaiYcDoiPhongMa?: string | null; // Sửa lại từ trangThaiYcDoiPIDMa cho nhất quán với các params khác

  suKienID?: number | null;

  nguoiYeuCauID?: number | null;

  donViNguoiYeuCauID?: number | null; // Đổi tên từ donViYeuCauID để rõ hơn là đơn vị của người yêu cầu

  phongCuID?: number | null;

  phongMoiID?: number | null;

  tuNgayYeuCau?: string | null;
  denNgayYeuCau?: string | null;
  page?: number | null;
  limit?: number | null;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | null;
}

// Type cho danh sách phòng đã đặt mà user có thể yêu cầu đổi
export interface ChiTietDatPhongForSelect {
  datPhongID: number;
  ycMuonPhongCtID: number; // Quan trọng để liên kết lại
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  tenSK: string; // Tên sự kiện liên quan
  tgNhanPhongTT: string; // ISO
  tgTraPhongTT: string; // ISO
}

const getRoomChangeRequests = async (
  params: GetYeuCauDoiPhongParams
): Promise<PaginatedYeuCauDoiPhongResponse> => {
  return apiHelper.get(
    '/yeucaudoipphong',
    params
  ) as Promise<PaginatedYeuCauDoiPhongResponse>;
};

const getRoomChangeRequestDetail = async (
  id: number | string
): Promise<YeuCauDoiPhongDetailResponse> => {
  return apiHelper.get(
    `/yeucaudoipphong/${id}`
  ) as Promise<YeuCauDoiPhongDetailResponse>;
};

const createRoomChangeRequest = async (
  payload: CreateYeuCauDoiPhongPayload
): Promise<YeuCauDoiPhongDetailResponse> => {
  return apiHelper.post(
    '/yeucaudoipphong',
    payload
  ) as Promise<YeuCauDoiPhongDetailResponse>;
};

const processRoomChangeRequest = async (
  id: number | string,
  payload: XuLyYeuCauDoiPhongPayload
): Promise<YeuCauDoiPhongDetailResponse> => {
  return apiHelper.put(
    `/yeucaudoipphong/${id}/xu-ly`,
    payload
  ) as Promise<YeuCauDoiPhongDetailResponse>;
};

const cancelRoomChangeRequestByUser = async (
  id: number | string
): Promise<{ message: string }> => {
  // Giả sử backend trả về message sau khi hủy (hoặc 204)
  return apiHelper.delete(`/yeucaudoipphong/${id}`) as Promise<{
    message: string;
  }>;
};

const getMyActiveBookedRooms = async (params: {
  nguoiYeuCauID?: number;
  limit?: number;
}): Promise<ChiTietDatPhongForSelect[]> => {
  return apiHelper.get('/chitietsudungphong/co-the-doi', params) as Promise<
    ChiTietDatPhongForSelect[]
  >;
};

const roomChangeRequestService = {
  getRoomChangeRequests,
  getRoomChangeRequestDetail,
  createRoomChangeRequest,
  processRoomChangeRequest,
  cancelRoomChangeRequestByUser,
  getMyActiveBookedRooms,
};

export default roomChangeRequestService;
