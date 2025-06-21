// src/services/dashboard.service.ts
import { LoaiSuKienResponse } from '@/services/loaiSuKien.service';
import apiHelper, { APIError } from './apiHelper';
import { DonViResponseMin, NguoiDungResponseMin } from './event.service'; // Tái sử dụng types
import { LoaiPhongResponseMin } from '@/services/roomRequest.service';
import {
  GetPhongParams,
  PaginatedPhongResponse,
  TrangThaiPhongResponse,
} from '@/services/phong.service';

// --- Types for Dashboard ---

// 1.1. KPI Cards
export interface DanhGiaTrungBinhKPI {
  diemNoiDung?: number | null;
  diemToChuc?: number | null;
  diemDiaDiem?: number | null;
  diemTongQuat?: number | null; // Trung bình của 3 điểm trên hoặc một cách tính khác từ BE
  soLuotDanhGia: number;
}

export interface SuKienKPITongQuan {
  tongSuKien: number;
  suKienSapToi: number;
  tongLuotThamGiaDuKien: number;
  tongLuotThamGiaThucTe?: number | null; // Nếu có dữ liệu điểm danh
  trungBinhNguoiThamGiaMoiSuKien?: number | null;
  danhGiaTrungBinh: DanhGiaTrungBinhKPI;
}

export interface GetSuKienKpiParams {
  tuNgay?: string; // YYYY-MM-DD
  denNgay?: string; // YYYY-MM-DD
  donViID?: number; // Cho filter theo đơn vị (nếu vai trò không phải admin/BGH)
}

// 1.2. Event Stats Over Time (Line Chart)
export interface ThongKeTheoThoiGianItem {
  thoiGian: string; // VD: "2025-01", "2025-W01", "2025-Q1"
  soLuongSuKien: number;
  soNguoiThamGiaDuKien: number;
  soNguoiThamGiaThucTe?: number | null;
}

export interface GetThongKeSuKienTheoThoiGianParams {
  tuNgay: string; // YYYY-MM-DD
  denNgay: string; // YYYY-MM-DD
  donViThoiGian?: 'THANG' | 'TUAN' | 'QUY';
  donViID?: number;
}

// 1.3. Upcoming Events List
export interface SuKienSapDienRaDashboardItem {
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string; // ISO
  tgKetThucDK: string; // ISO
  diaDiemDaXep?: string | null;
  donViChuTri: Pick<DonViResponseMin, 'tenDonVi'>; // Chỉ cần tên đơn vị
  loaiSuKien?: Pick<LoaiSuKienResponse, 'tenLoaiSK'> | null;
  slThamDuDK?: number | null;
  soNguoiDaChapNhanMoi?: number; // Số người đã xác nhận tham gia (từ SK_MoiThamGia)
  // category (dùng ở mock data) có thể map từ loaiSuKien.tenLoaiSK ở FE nếu cần style khác nhau
}

export interface GetSuKienSapDienRaDashboardParams {
  limit?: number;
  donViID?: number;
}

// 1.4. Pending Requests List
export interface YeuCauChoXuLyItem {
  idYeuCau: string;
  loaiYeuCau:
    | 'DUYET_SU_KIEN'
    | 'DUYET_HUY_SU_KIEN'
    | 'DUYET_MUON_PHONG'
    | 'DUYET_DOI_PHONG'
    | string;
  tenYeuCau: string;
  nguoiGuiYeuCau: {
    hoTen: string;
    donVi?: string | null;
  };
  ngayGuiYeuCau: string;
  duongDanChiTiet: string;
}

export interface GetYeuCauChoXuLyParams {
  limit?: number;
  // BE sẽ tự lọc theo vai trò người dùng hiện tại
}

// 1.5. Event Categories (Pie/Bar Chart)
export interface ThongKeTheoLoaiItem {
  loaiSuKienID: number;
  tenLoaiSK: string;
  maLoaiSK?: string | null;
  soLuongSuKien: number;
  tyLePhanTram?: number; // BE có thể tính hoặc không
}

export interface GetThongKeSuKienTheoLoaiParams {
  tuNgay?: string;
  denNgay?: string;
  donViID?: number;
}

// 1.6. Event Ratings (Bar Chart)
export interface ThongKeDanhGiaItem {
  mucDiem: number | string; // 1, 2, 3, 4, 5 hoặc "1 sao", "2 sao"...
  soLuotDanhGia: number;
  tyLePhanTram?: number;
}

export interface GetThongKeDanhGiaSuKienParams {
  tuNgaySuKienKetThuc?: string;
  denNgaySuKienKetThuc?: string;
  donViID?: number;
  loaiSuKienID?: number;
  tieuChiDiem?: 'NOI_DUNG' | 'TO_CHUC' | 'DIA_DIEM' | 'TONG_QUAT';
}

// 1.1. KPI Cards for Facilities
export interface CsVcKPITongQuan {
  tongSoPhong: number;
  phongSanSang: number;
  phongDangSuDung: number;
  phongDangBaoTri: number;
  phongNgungSuDung: number;
  tyLeSuDungPhongHomNay?: number | null; // %
  tongSoThietBi: number;
  thietBiDangHoatDongTot: number;
  thietBiCanBaoTri: number;
  yeuCauMuonPhongChoDuyet: number;
  yeuCauDoiPhongChoDuyet: number;
}
export interface GetCsVcKpiParams {
  toaNhaID?: number;
  coSoID?: number;
  ngayHienTai?: string; // YYYY-MM-DD
}

// 1.2. Room Usage Over Time
export interface SuDungPhongTheoThoiGianItem {
  thoiGian: string; // "YYYY-MM-DD", "YYYY-Www", "YYYY-MM"
  soLuotDatPhong: number;
  tongGioSuDung?: number | null;
}
export interface GetSuDungPhongTheoThoiGianParams {
  tuNgay: string; // YYYY-MM-DD
  denNgay: string; // YYYY-MM-DD
  donViThoiGian?: 'NGAY' | 'TUAN' | 'THANG';
  toaNhaID?: number;
  loaiPhongID?: number;
}

// 1.3. Popular Room Types
export interface LoaiPhongPhoBienItem {
  loaiPhongID: number;
  tenLoaiPhong: string;
  soLuotDat: number;
  tongGioSuDung?: number | null;
}
export interface GetLoaiPhongPhoBienParams {
  tuNgay?: string; // YYYY-MM-DD
  denNgay?: string; // YYYY-MM-DD
  limit?: number;
}

// 1.4. Rooms Under Maintenance
export interface PhongBaoTriItem {
  // Có thể tái sử dụng hoặc mở rộng từ PhongListItemResponse
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  loaiPhong: Pick<LoaiPhongResponseMin, 'tenLoaiPhong'>;
  toaNhaTang?: {
    toaNha: Pick<DonViResponseMin, 'tenDonVi'>; // Giả sử Tòa nhà là 1 Đơn vị
    loaiTang: { tenLoaiTang: string };
  } | null;
  trangThaiPhong: Pick<TrangThaiPhongResponse, 'tenTrangThai' | 'maTrangThai'>;
  ghiChuBaoTri?: string | null;
  ngayBatDauBaoTriDuKien?: string | null; // ISO
  ngayKetThucBaoTriDuKien?: string | null; // ISO
}
export interface PaginatedPhongBaoTriResponse {
  items: PhongBaoTriItem[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  pageSize: number;
}
export interface GetPhongBaoTriParams {
  toaNhaID?: number; // Lọc theo tòa nhà
  trangThaiPhongMa?: 'DANG_BAO_TRI'; // Hoặc truyền mã code
  limit?: number;
  page?: number;
  sortBy?: string; // ví dụ: 'TenPhong'
  sortOrder?: 'asc' | 'desc';
}

// 1.5. Equipment Statistics
export interface ThietBiSuDungNhieuItem {
  thietBiID: number;
  tenThietBi: string;
  soLuotSuDung: number; // Hoặc số giờ sử dụng
  // tongGioSuDung?: number | null; // Nếu có
}
export interface ThietBiTheoTinhTrangItem {
  tinhTrang: string; // "Hoạt động tốt", "Cần bảo trì", "Hỏng"
  soLuong: number;
  // tyLePhanTram?: number; // BE có thể tính
}
export interface GetThongKeThietBiParams {
  loaiThongKe: 'TINH_TRANG';
  tuNgay?: string; // YYYY-MM-DD (cho SU_DUNG_NHIEU)
  denNgay?: string; // YYYY-MM-DD (cho SU_DUNG_NHIEU)
  limit?: number; // Cho SU_DUNG_NHIEU
  toaNhaID?: number; // Lọc thiết bị theo tòa nhà
  loaiPhongID?: number; // Lọc thiết bị theo loại phòng
}

// --- Types for Public Overview Dashboard (MỚI) ---

// 1.1. KPI Cards for Public Overview
export interface DashboardCongKhaiKPI {
  suKienSapDienRa: number;
  suKienDangDienRa: number;
  tongSoPhongKhaDung?: number | null; // Optional, nếu thông tin này không phải lúc nào cũng public
  tinTucMoiNhat?: {
    tieuDe: string;
    link: string;
  } | null;
}
export interface GetDashboardCongKhaiKpiParams {
  thoiGian?: 'HOM_NAY' | 'TUAN_NAY' | 'THANG_NAY' | 'SAP_TOI_7_NGAY';
}

// 1.2. Upcoming Public Events List
export interface SuKienCongKhaiDashboardItem {
  suKienID: number;
  tenSK: string;
  tgBatDauDK: string; // ISO
  tgKetThucDK: string; // ISO
  diaDiemToChucDaXep?: string | null;
  loaiSuKien?: Pick<LoaiSuKienResponse, 'tenLoaiSK'> | null;
  donViChuTri: Pick<DonViResponseMin, 'tenDonVi'>;
}
export interface GetSuKienCongKhaiDashboardParams {
  limit?: number;
  chiCongKhaiNoiBo?: boolean; // Mặc định true
}

// 1.3. Public Room Usage Overview
export interface KhungGioPhongBanItem {
  ngay: string; // YYYY-MM-DD
  phongID: number;
  tenPhong: string;
  maPhong?: string | null;
  khungGioBan: { batDau: string; ketThuc: string }[]; // ISO strings
}
// Hoặc cấu trúc mật độ (nếu BE trả về theo cách này)
export interface MatDoSuDungPhongTheoGioItem {
  ngay: string; // YYYY-MM-DD
  gioTrongNgay: { gio: number; mucDoBan: number }[]; // mucDoBan: 0.0 - 1.0
}
export interface GetLichSuDungPhongCongKhaiParams {
  tuNgay: string; // YYYY-MM-DD
  denNgay: string; // YYYY-MM-DD
  toaNhaID?: number;
  loaiPhongID?: number;
}

// 1.4. Public Announcements/News
export interface ThongBaoChungItem {
  thongBaoID: number;
  tieuDe: string;
  tomTat?: string | null;
  ngayDang: string; // ISO
  duongDanChiTiet: string;
  loaiThongBaoHienThi?: string; // Ví dụ: "Quan trọng", "Tin tức"
}
export interface GetThongBaoCongKhaiParams {
  limit?: number;
}

// --- API Functions ---

const getSuKienKpi = async (
  params?: GetSuKienKpiParams
): Promise<SuKienKPITongQuan> => {
  return apiHelper.get(
    '/thong-ke/su-kien/tong-quan-kpi',
    params || {}
  ) as Promise<SuKienKPITongQuan>;
};

const getThongKeSuKienTheoThoiGian = async (
  params: GetThongKeSuKienTheoThoiGianParams
): Promise<ThongKeTheoThoiGianItem[]> => {
  return apiHelper.get('/thong-ke/su-kien/theo-thoi-gian', params) as Promise<
    ThongKeTheoThoiGianItem[]
  >;
};

const getSuKienSapDienRaDashboard = async (
  params?: GetSuKienSapDienRaDashboardParams
): Promise<SuKienSapDienRaDashboardItem[]> => {
  return apiHelper.get(
    '/sukien/sap-dien-ra-dashboard',
    params || {}
  ) as Promise<SuKienSapDienRaDashboardItem[]>;
};

const getYeuCauChoXuLyCuaToi = async (
  params?: GetYeuCauChoXuLyParams
): Promise<YeuCauChoXuLyItem[]> => {
  return apiHelper.get(
    '/thong-ke/yeu-cau-cho-xu-ly/cua-toi',
    params || {}
  ) as Promise<YeuCauChoXuLyItem[]>;
};

const getThongKeSuKienTheoLoai = async (
  params?: GetThongKeSuKienTheoLoaiParams
): Promise<ThongKeTheoLoaiItem[]> => {
  return apiHelper.get('/thong-ke/su-kien/theo-loai', params || {}) as Promise<
    ThongKeTheoLoaiItem[]
  >;
};

const getThongKeDanhGiaSuKien = async (
  params?: GetThongKeDanhGiaSuKienParams
): Promise<ThongKeDanhGiaItem[]> => {
  return apiHelper.get('/thong-ke/danh-gia-su-kien', params || {}) as Promise<
    ThongKeDanhGiaItem[]
  >;
};

// --- Facilities Dashboard ---

const getCsVcKpi = async (
  params?: GetCsVcKpiParams
): Promise<CsVcKPITongQuan> => {
  return apiHelper.get(
    '/thong-ke/co-so-vat-chat/tong-quan-kpi',
    params || {}
  ) as Promise<CsVcKPITongQuan>;
};

const getSuDungPhongTheoThoiGian = async (
  params: GetSuDungPhongTheoThoiGianParams
): Promise<SuDungPhongTheoThoiGianItem[]> => {
  return apiHelper.get(
    '/thong-ke/co-so-vat-chat/su-dung-phong-theo-thoi-gian',
    params
  ) as Promise<SuDungPhongTheoThoiGianItem[]>;
};

const getLoaiPhongPhoBien = async (
  params?: GetLoaiPhongPhoBienParams
): Promise<LoaiPhongPhoBienItem[]> => {
  return apiHelper.get(
    '/thong-ke/co-so-vat-chat/loai-phong-pho-bien',
    params || {}
  ) as Promise<LoaiPhongPhoBienItem[]>;
};

const getPhongDangBaoTri = async (
  params?: GetPhongParams
): Promise<PaginatedPhongResponse> => {
  // Gọi API lấy danh sách phòng với filter trạng thái là "Đang bảo trì"
  // BE cần đảm bảo endpoint /danhmuc/phong hỗ trợ param trangThaiPhongMa hoặc trangThaiPhongID
  return apiHelper.get('/danhmuc/phong', {
    ...params,
    trangThaiPhongMa: 'DANG_BAO_TRI', // Hoặc truyền ID nếu BE dùng ID
  }) as Promise<PaginatedPhongResponse>;
};

const getThongKeThietBi = async (
  params: GetThongKeThietBiParams
): Promise<ThietBiTheoTinhTrangItem[]> => {
  // Giờ chỉ có loaiThongKe: 'TINH_TRANG'
  return apiHelper.get('/thong-ke/co-so-vat-chat/thiet-bi', params) as Promise<
    ThietBiTheoTinhTrangItem[]
  >;
};

// --- API Functions for Public Overview Dashboard (MỚI) ---

const getDashboardCongKhaiKpi = async (
  params?: GetDashboardCongKhaiKpiParams
): Promise<DashboardCongKhaiKPI> => {
  return apiHelper.get(
    '/dashboard/tong-quan-cong-khai/kpi',
    params || {}
  ) as Promise<DashboardCongKhaiKPI>;
};

// const getLichSuDungPhongCongKhai = async (
//   params: GetLichSuDungPhongCongKhaiParams
// ): Promise<KhungGioPhongBanItem[] | MatDoSuDungPhongTheoGioItem[]> => {
//   // Cần xác định rõ cấu trúc trả về với BE
//   return apiHelper.get(
//     '/lichsudungphong/tong-quan-cong-khai',
//     params
//   ) as Promise<KhungGioPhongBanItem[] | MatDoSuDungPhongTheoGioItem[]>;
// };

const getThongBaoCongKhaiNoiBat = async (
  params?: GetThongBaoCongKhaiParams
): Promise<ThongBaoChungItem[]> => {
  return apiHelper.get('/thongbao/cong-khai-noi-bat', params || {}) as Promise<
    ThongBaoChungItem[]
  >;
};

const dashboardService = {
  getSuKienKpi,
  getThongKeSuKienTheoThoiGian,
  getSuKienSapDienRaDashboard,
  getYeuCauChoXuLyCuaToi,
  getThongKeSuKienTheoLoai,
  getThongKeDanhGiaSuKien,

  getCsVcKpi,
  getSuDungPhongTheoThoiGian,
  getLoaiPhongPhoBien,
  getPhongDangBaoTri,
  getThongKeThietBi,

  getDashboardCongKhaiKpi,
  // getLichSuDungPhongCongKhai,
  getThongBaoCongKhaiNoiBat,
};

export default dashboardService;
