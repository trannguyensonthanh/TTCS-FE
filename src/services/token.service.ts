// src/services/token.service.ts
import { UserForContext } from '@/context/AuthContext'; // Import kiểu UserForContext

const USER_KEY = 'app_user'; // Đổi tên key cho rõ ràng hơn
const REFRESH_TOKEN_KEY = 'app_refresh_token';

const getLocalAccessToken = (): string | null => {
  const user = getUser();
  return user?.accessToken || null;
};

const getLocalRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

const updateLocalAccessToken = (newToken: string): void => {
  if (typeof window !== 'undefined') {
    const user = getUser();
    if (user) {
      user.accessToken = newToken;
      setUser(user); // Gọi lại hàm setUser để lưu toàn bộ object user đã cập nhật
    }
  }
};

const getUser = (): UserForContext | null => {
  if (typeof window !== 'undefined') {
    const userString = localStorage.getItem(USER_KEY);
    if (userString) {
      try {
        return JSON.parse(userString) as UserForContext;
      } catch (e) {
        console.error(
          'Error parsing user from localStorage in TokenService:',
          e
        );
        removeUser(); // Xóa nếu dữ liệu lỗi
        return null;
      }
    }
  }
  return null;
};

const setUser = (user: UserForContext | null): void => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }
};

const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
};

const removeRefreshToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

const TokenService = {
  getLocalAccessToken,
  getLocalRefreshToken,
  updateLocalAccessToken,
  getUser,
  setUser,
  setRefreshToken,
  removeUser,
  removeRefreshToken,
};

export default TokenService;
