// src/services/notification.service.ts
import apiHelper, { APIError } from './apiHelper';

// --- Types (Nên đặt trong file types/thongbao.types.ts) ---
export interface ThongBaoResponse {
  thongBaoID: number;
  noiDungTB: string;
  duongDanLienQuan?: string | null;
  ngayTaoTB: string; // ISO Date string
  daDocTB: boolean;
  loaiThongBao?: string;
  tenSuKienLienQuan?: string | null;
}

export interface GetNotificationsParams {
  limit?: number;
  page?: number;
  chiChuaDoc?: boolean;
}

export interface PaginatedNotificationsResponse {
  items: ThongBaoResponse[];
  totalPages?: number; // Có thể không cần nếu bell chỉ lấy top N
  currentPage?: number; // Có thể không cần
  totalItems?: number; // Tổng số thông báo của user (kể cả đã đọc)
  totalUnread: number; // Quan trọng: Số lượng thông báo CHƯA ĐỌC
}

export interface MarkAsReadResponse {
  message: string;
  thongBao?: ThongBaoResponse;
}

export interface MarkAllAsReadResponse {
  message: string;
  countUpdated: number;
}

// --- API Functions ---

// Lấy danh sách thông báo mới nhất cho người dùng
const getMyNotifications = async (
  params?: GetNotificationsParams
): Promise<PaginatedNotificationsResponse> => {
  return apiHelper.get(
    '/thongbao/cua-toi',
    params || {}
  ) as Promise<PaginatedNotificationsResponse>;
};

// Đánh dấu một thông báo đã đọc
const markNotificationAsRead = async (
  thongBaoID: number
): Promise<MarkAsReadResponse> => {
  return apiHelper.post(
    `/thongbao/${thongBaoID}/danh-dau-da-doc`,
    {}
  ) as Promise<MarkAsReadResponse>;
};

// Đánh dấu tất cả thông báo đã đọc
const markAllNotificationsAsRead = async (): Promise<MarkAllAsReadResponse> => {
  return apiHelper.post(
    '/thongbao/danh-dau-tat-ca-da-doc',
    {}
  ) as Promise<MarkAllAsReadResponse>;
};

const notificationService = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;
