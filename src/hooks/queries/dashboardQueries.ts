// src/hooks/queries/dashboardQueries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import dashboardService, {
  SuKienKPITongQuan,
  GetSuKienKpiParams,
  ThongKeTheoThoiGianItem,
  GetThongKeSuKienTheoThoiGianParams,
  SuKienSapDienRaDashboardItem,
  GetSuKienSapDienRaDashboardParams,
  YeuCauChoXuLyItem,
  GetYeuCauChoXuLyParams,
  ThongKeTheoLoaiItem,
  GetThongKeSuKienTheoLoaiParams,
  ThongKeDanhGiaItem,
  GetThongKeDanhGiaSuKienParams,
  GetCsVcKpiParams,
  GetSuDungPhongTheoThoiGianParams,
  GetLoaiPhongPhoBienParams,
  GetPhongBaoTriParams,
  GetThongKeThietBiParams,
  ThietBiTheoTinhTrangItem,
  LoaiPhongPhoBienItem,
  SuDungPhongTheoThoiGianItem,
  CsVcKPITongQuan,
  GetDashboardCongKhaiKpiParams,
  GetThongBaoCongKhaiParams,
  GetLichSuDungPhongCongKhaiParams,
  GetSuKienCongKhaiDashboardParams,
  MatDoSuDungPhongTheoGioItem,
  KhungGioPhongBanItem,
  ThongBaoChungItem,
  DashboardCongKhaiKPI,
} from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';
import { PaginatedPhongResponse } from '@/services/phong.service';

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboardStats'] as const,
  suKienKpi: (params?: GetSuKienKpiParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'suKienKpi', params || {}] as const,
  suKienTheoThoiGian: (params: GetThongKeSuKienTheoThoiGianParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'suKienTheoThoiGian', params] as const,
  suKienSapDienRa: (params?: GetSuKienSapDienRaDashboardParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'suKienSapDienRa', params || {}] as const,
  yeuCauChoXuLy: (params?: GetYeuCauChoXuLyParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'yeuCauChoXuLy', params || {}] as const,
  suKienTheoLoai: (params?: GetThongKeSuKienTheoLoaiParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'suKienTheoLoai', params || {}] as const,
  danhGiaSuKien: (params?: GetThongKeDanhGiaSuKienParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'danhGiaSuKien', params || {}] as const,

  csVcKpi: (params?: GetCsVcKpiParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'csVcKpi', params || {}] as const,
  suDungPhongTheoThoiGian: (params: GetSuDungPhongTheoThoiGianParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'suDungPhongTheoThoiGian', params] as const,
  loaiPhongPhoBien: (params?: GetLoaiPhongPhoBienParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'loaiPhongPhoBien', params || {}] as const,
  phongDangBaoTri: (params?: GetPhongBaoTriParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'phongDangBaoTri', params || {}] as const,
  thongKeThietBi: (params: GetThongKeThietBiParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'thongKeThietBi', params] as const,

  // Keys cho Public Overview Dashboard (MỚI)
  publicKpi: (params?: GetDashboardCongKhaiKpiParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'publicKpi', params || {}] as const,
  publicUpcomingEvents: (params?: GetSuKienCongKhaiDashboardParams) =>
    [
      ...DASHBOARD_QUERY_KEYS.all,
      'publicUpcomingEvents',
      params || {},
    ] as const,
  publicRoomUsageOverview: (params: GetLichSuDungPhongCongKhaiParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'publicRoomUsageOverview', params] as const,
  publicAnnouncements: (params?: GetThongBaoCongKhaiParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'publicAnnouncements', params || {}] as const,
};

export const useSuKienKpi = (
  params?: GetSuKienKpiParams,
  options?: Omit<
    UseQueryOptions<SuKienKPITongQuan, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<SuKienKPITongQuan, APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.suKienKpi(params),
    queryFn: () => dashboardService.getSuKienKpi(params),
    staleTime: 5 * 60 * 1000, // 5 phút
    ...options,
  });
};

export const useThongKeSuKienTheoThoiGian = (
  params: GetThongKeSuKienTheoThoiGianParams,
  options?: Omit<
    UseQueryOptions<ThongKeTheoThoiGianItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ThongKeTheoThoiGianItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.suKienTheoThoiGian(params),
    queryFn: () => dashboardService.getThongKeSuKienTheoThoiGian(params),
    enabled: !!params.tuNgay && !!params.denNgay, // Chỉ fetch khi có ngày
    staleTime: 10 * 60 * 1000, // 10 phút
    ...options,
  });
};

export const useSuKienSapDienRaDashboard = (
  params?: GetSuKienSapDienRaDashboardParams,
  options?: Omit<
    UseQueryOptions<SuKienSapDienRaDashboardItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<SuKienSapDienRaDashboardItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.suKienSapDienRa(params),
    queryFn: () => dashboardService.getSuKienSapDienRaDashboard(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useYeuCauChoXuLyCuaToi = (
  params?: GetYeuCauChoXuLyParams,
  options?: Omit<
    UseQueryOptions<YeuCauChoXuLyItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<YeuCauChoXuLyItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.yeuCauChoXuLy(params),
    queryFn: () => dashboardService.getYeuCauChoXuLyCuaToi(params),
    staleTime: 1 * 60 * 1000, // 1 phút, yêu cầu chờ xử lý cần cập nhật thường xuyên hơn
    refetchInterval: 2 * 60 * 1000, // Refetch mỗi 2 phút
    ...options,
  });
};

export const useThongKeSuKienTheoLoai = (
  params?: GetThongKeSuKienTheoLoaiParams,
  options?: Omit<
    UseQueryOptions<ThongKeTheoLoaiItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ThongKeTheoLoaiItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.suKienTheoLoai(params),
    queryFn: () => dashboardService.getThongKeSuKienTheoLoai(params),
    staleTime: 15 * 60 * 1000, // 15 phút
    ...options,
  });
};

export const useThongKeDanhGiaSuKien = (
  params?: GetThongKeDanhGiaSuKienParams,
  options?: Omit<
    UseQueryOptions<ThongKeDanhGiaItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ThongKeDanhGiaItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.danhGiaSuKien(params),
    queryFn: () => dashboardService.getThongKeDanhGiaSuKien(params),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
};

// Hooks cho Facilities Dashboard (MỚI)
export const useCsVcKpi = (
  params?: GetCsVcKpiParams,
  options?: Omit<
    UseQueryOptions<CsVcKPITongQuan, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<CsVcKPITongQuan, APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.csVcKpi(params),
    queryFn: () => dashboardService.getCsVcKpi(params),
    staleTime: 5 * 60 * 1000, // 5 phút
    ...options,
  });
};

export const useSuDungPhongTheoThoiGian = (
  params: GetSuDungPhongTheoThoiGianParams,
  options?: Omit<
    UseQueryOptions<SuDungPhongTheoThoiGianItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<SuDungPhongTheoThoiGianItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.suDungPhongTheoThoiGian(params),
    queryFn: () => dashboardService.getSuDungPhongTheoThoiGian(params),
    enabled: !!params.tuNgay && !!params.denNgay,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useLoaiPhongPhoBien = (
  params?: GetLoaiPhongPhoBienParams,
  options?: Omit<
    UseQueryOptions<LoaiPhongPhoBienItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<LoaiPhongPhoBienItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.loaiPhongPhoBien(params),
    queryFn: () => dashboardService.getLoaiPhongPhoBien(params),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
};

export const usePhongDangBaoTri = (
  params?: GetPhongBaoTriParams,
  options?: Omit<
    UseQueryOptions<PaginatedPhongResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedPhongResponse, APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.phongDangBaoTri(params),
    queryFn: () => dashboardService.getPhongDangBaoTri(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useThongKeThietBi = (
  params: GetThongKeThietBiParams,
  options?: Omit<
    UseQueryOptions<ThietBiTheoTinhTrangItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ThietBiTheoTinhTrangItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.thongKeThietBi(params),
    queryFn: () =>
      dashboardService.getThongKeThietBi(params) as Promise<
        ThietBiTheoTinhTrangItem[]
      >, // Ép kiểu vì giờ chỉ có 1 loại
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// Hooks cho Public Overview Dashboard (MỚI)
export const useDashboardCongKhaiKpi = (
  params?: GetDashboardCongKhaiKpiParams,
  options?: Omit<
    UseQueryOptions<DashboardCongKhaiKPI, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<DashboardCongKhaiKPI, APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.publicKpi(params),
    queryFn: () => dashboardService.getDashboardCongKhaiKpi(params),
    staleTime: 2 * 60 * 1000, // 2 phút
    ...options,
  });
};

// export const useLichSuDungPhongCongKhai = (
//   params: GetLichSuDungPhongCongKhaiParams,
//   // Kiểu trả về có thể là union, component sẽ xử lý
//   options?: Omit<
//     UseQueryOptions<
//       KhungGioPhongBanItem[] | MatDoSuDungPhongTheoGioItem[],
//       APIError
//     >,
//     'queryKey' | 'queryFn'
//   >
// ) => {
//   return useQuery<
//     KhungGioPhongBanItem[] | MatDoSuDungPhongTheoGioItem[],
//     APIError
//   >({
//     queryKey: DASHBOARD_QUERY_KEYS.publicRoomUsageOverview(params),
//     queryFn: () => dashboardService.getLichSuDungPhongCongKhai(params),
//     enabled: !!params.tuNgay && !!params.denNgay,
//     staleTime: 10 * 60 * 1000, // 10 phút
//     ...options,
//   });
// };

export const useThongBaoCongKhaiNoiBat = (
  params?: GetThongBaoCongKhaiParams,
  options?: Omit<
    UseQueryOptions<ThongBaoChungItem[], APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ThongBaoChungItem[], APIError>({
    queryKey: DASHBOARD_QUERY_KEYS.publicAnnouncements(params),
    queryFn: () => dashboardService.getThongBaoCongKhaiNoiBat(params),
    staleTime: 5 * 60 * 1000, // 5 phút
    ...options,
  });
};
