import {
  NguoiDungTimKiemItem,
  TimKiemNguoiDungDeMoiParams,
} from './../../services/nguoiDung.service';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from '@/context/AuthContext';
import { APIError } from '@/services/apiHelper';
import { VaiTroChucNangResponse } from '@/services/auth.service';
import { NguoiDungResponseMin } from '@/services/event.service';
import {
  AssignFunctionalRolePayload,
  ChangePasswordPayload,
  ChangePasswordResponse,
  CreateNguoiDungPayload,
  GetNguoiDungParams,
  ImportUsersBatchPayload,
  ImportUsersBatchResponse,
  NguoiDungFullResponse,
  nguoiDungService,
  PaginatedNguoiDungResponse,
  PaginatedNguoiDungResponseFE,
  UpdateAssignedFunctionalRolePayload,
  UpdateNguoiDungAdminPayload,
  UpdateUserAccountStatusPayload,
  UserProfileResponse,
} from '@/services/nguoiDung.service';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';

export const NGUOI_DUNG_QUERY_KEYS = {
  nguoiDung: (params?: GetNguoiDungParams) =>
    ['nguoiDung', params || {}] as const,
  me: ['myProfile'] as const,
  all: ['userManagement'] as const,
  lists: () => [...NGUOI_DUNG_QUERY_KEYS.all, 'list'] as const,
  list: (params: GetNguoiDungParams) =>
    [...NGUOI_DUNG_QUERY_KEYS.lists(), params] as const,
  details: () => [...NGUOI_DUNG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string | undefined) =>
    [...NGUOI_DUNG_QUERY_KEYS.details(), id] as const,
};

export const USER_SEARCH_FOR_INVITE_QUERY_KEYS = {
  all: ['userSearchForInvite'] as const,
  search: (params: TimKiemNguoiDungDeMoiParams) =>
    [...USER_SEARCH_FOR_INVITE_QUERY_KEYS.all, params] as const,
};

// Hook lấy danh sách Người dùng (cho autocomplete/select)
export const useNguoiDungListForSelect = (
  params?: GetNguoiDungParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedNguoiDungResponse | NguoiDungResponseMin[],
      APIError,
      NguoiDungResponseMin[]
    >,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useQuery<
    PaginatedNguoiDungResponse | NguoiDungResponseMin[],
    APIError,
    NguoiDungResponseMin[]
  >({
    queryKey: NGUOI_DUNG_QUERY_KEYS.nguoiDung(params),
    queryFn: () => nguoiDungService.getNguoiDungList({ limit: 50, ...params }), // Mặc định limit cho select
    select: (data) => (Array.isArray(data) ? data : data.items),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook để lấy thông tin cá nhân của người dùng hiện tại
export const useMyProfile = (
  options?: Omit<
    UseQueryOptions<UserProfileResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  const { isAuthenticated } = useAuth();
  return useQuery<UserProfileResponse, APIError>({
    queryKey: NGUOI_DUNG_QUERY_KEYS.me,
    queryFn: nguoiDungService.getMyProfile,
    enabled: isAuthenticated, // Chỉ fetch khi đã đăng nhập
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    ...options,
  });
};

// Hook để đổi mật khẩu
export const useChangePassword = (
  options?: UseMutationOptions<
    ChangePasswordResponse,
    APIError,
    ChangePasswordPayload
  >
) => {
  // const queryClient = useQueryClient(); // Không cần invalidate query profile sau khi đổi pass
  return useMutation<ChangePasswordResponse, APIError, ChangePasswordPayload>({
    mutationFn: nguoiDungService.changeMyPassword,
    onSuccess: (data) => {
      console.log('Đổi mật khẩu thành công:', data);
      toast.success(data.message || 'Đổi mật khẩu thành công!');

      if (options?.onSuccess)
        options.onSuccess(data, {} as ChangePasswordPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi đổi mật khẩu.'
      );
      if (options?.onError)
        options.onError(error, {} as ChangePasswordPayload, undefined);
    },
  });
};

// Hook lấy danh sách người dùng cho trang quản lý
export const useUserManagementList = (
  params: GetNguoiDungParams,
  options?: Omit<
    UseQueryOptions<PaginatedNguoiDungResponseFE, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedNguoiDungResponseFE, APIError>({
    queryKey: NGUOI_DUNG_QUERY_KEYS.list(params),
    queryFn: () => nguoiDungService.getNguoiDungList(params), // Gọi hàm mới getNguoiDungListFE
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook lấy chi tiết người dùng cho admin xem/sửa
export const useUserDetailForAdmin = (
  nguoiDungId: number | string | undefined,
  options?: Omit<
    UseQueryOptions<UserProfileResponse, APIError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<UserProfileResponse, APIError>({
    queryKey: NGUOI_DUNG_QUERY_KEYS.detail(nguoiDungId),
    queryFn: () => {
      if (!nguoiDungId)
        return Promise.reject(new Error('ID Người dùng là bắt buộc'));
      return nguoiDungService.getNguoiDungDetailForAdmin(nguoiDungId);
    },
    enabled: !!nguoiDungId,
    ...options,
  });
};

// Hook admin tạo người dùng
export const useAdminCreateUser = (
  options?: UseMutationOptions<
    UserProfileResponse,
    APIError,
    CreateNguoiDungPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<UserProfileResponse, APIError, CreateNguoiDungPayload>({
    mutationFn: nguoiDungService.createNguoiDungByAdmin,
    onSuccess: (data) => {
      toast.success(`Đã tạo người dùng "${data.nguoiDung.hoTen}" thành công.`);
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      });
      if (options?.onSuccess)
        options.onSuccess(data, {} as CreateNguoiDungPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi tạo người dùng.'
      );
      if (options?.onError)
        options.onError(error, {} as CreateNguoiDungPayload, undefined);
    },
    ...options,
  });
};

// Hook admin cập nhật người dùng
export const useAdminUpdateUser = (
  options?: UseMutationOptions<
    UserProfileResponse,
    APIError,
    { id: number | string; payload: UpdateNguoiDungAdminPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    UserProfileResponse,
    APIError,
    { id: number | string; payload: UpdateNguoiDungAdminPayload }
  >({
    mutationFn: ({ id, payload }) =>
      nguoiDungService.updateNguoiDungByAdmin(id, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật người dùng "${data.nguoiDung.hoTen}".`);
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      });
      queryClient.setQueryData(
        NGUOI_DUNG_QUERY_KEYS.detail(variables.id),
        data
      );
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật người dùng.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hook admin cập nhật trạng thái tài khoản
export const useAdminUpdateUserAccountStatus = (
  options?: UseMutationOptions<
    { message: string; nguoiDung: NguoiDungFullResponse },
    APIError,
    { id: number | string; payload: UpdateUserAccountStatusPayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string; nguoiDung: NguoiDungFullResponse },
    APIError,
    { id: number | string; payload: UpdateUserAccountStatusPayload }
  >({
    mutationFn: ({ id, payload }) =>
      nguoiDungService.updateUserAccountStatusByAdmin(id, payload),
    onSuccess: (data, variables) => {
      toast.success(
        data.message ||
          `Đã cập nhật trạng thái tài khoản cho người dùng ID: ${variables.id}.`
      );
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.detail(variables.id),
      });
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi khi cập nhật trạng thái tài khoản.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hook admin gán vai trò chức năng
export const useAdminAssignFunctionalRole = (
  nguoiDungId: number | string,
  options?: UseMutationOptions<
    VaiTroChucNangResponse,
    APIError,
    AssignFunctionalRolePayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    VaiTroChucNangResponse,
    APIError,
    AssignFunctionalRolePayload
  >({
    mutationFn: (payload) =>
      nguoiDungService.assignFunctionalRole(nguoiDungId, payload),
    onSuccess: (data) => {
      toast.success(`Đã gán vai trò "${data.tenVaiTro}" thành công.`);
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.detail(nguoiDungId),
      }); // Cập nhật chi tiết user để thấy vai trò mới
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      }); // Cập nhật danh sách user (  hiển thị vai trò)
      if (options?.onSuccess)
        options.onSuccess(data, {} as AssignFunctionalRolePayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi gán vai trò.'
      );
      if (options?.onError)
        options.onError(error, {} as AssignFunctionalRolePayload, undefined);
    },
    ...options,
  });
};

// Hook admin cập nhật vai trò chức năng đã gán
export const useAdminUpdateAssignedRole = (
  options?: UseMutationOptions<
    VaiTroChucNangResponse,
    APIError,
    { ganVaiTroCnID: number; payload: UpdateAssignedFunctionalRolePayload }
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    VaiTroChucNangResponse,
    APIError,
    { ganVaiTroCnID: number; payload: UpdateAssignedFunctionalRolePayload }
  >({
    mutationFn: ({ ganVaiTroCnID, payload }) =>
      nguoiDungService.updateAssignedFunctionalRole(ganVaiTroCnID, payload),
    onSuccess: (data, variables) => {
      toast.success(`Đã cập nhật thông tin gán vai trò "${data.tenVaiTro}".`);
      // Cần nguoiDungId để invalidate chi tiết user
      // const nguoiDungId = queryClient.getQueryData<UserProfileResponse>(USER_MANAGEMENT_QUERY_KEYS.detail( SOME_ID_HERE ))?.nguoiDung.nguoiDungID;
      // if (nguoiDungId) {
      //   queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_QUERY_KEYS.detail(nguoiDungId) });
      // }
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      });
      // Tốt nhất là invalidate theo nguoiDungId nếu biết
      if (options?.onSuccess) options.onSuccess(data, variables, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi cập nhật gán vai trò.'
      );
      if (options?.onError) options.onError(error, {} as any, undefined);
    },
    ...options,
  });
};

// Hook admin gỡ vai trò chức năng
export const useAdminRemoveAssignedRole = (
  options?: UseMutationOptions<{ message: string }, APIError, number> // ganVaiTroCnID
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number>({
    mutationFn: (ganVaiTroCnID) =>
      nguoiDungService.removeAssignedFunctionalRole(ganVaiTroCnID),
    onSuccess: (data, ganVaiTroCnID) => {
      toast.success(data.message || `Đã gỡ vai trò.`);
      // Cần invalidate chi tiết user và danh sách user
      queryClient.invalidateQueries({ queryKey: NGUOI_DUNG_QUERY_KEYS.all }); // Invalidate tất cả liên quan đến user management
      if (options?.onSuccess) options.onSuccess(data, ganVaiTroCnID, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi gỡ vai trò.'
      );
      if (options?.onError) options.onError(error, 0, undefined);
    },
    ...options,
  });
};

export const useImportUsersBatch = (
  options?: UseMutationOptions<
    ImportUsersBatchResponse,
    APIError,
    ImportUsersBatchPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation<
    ImportUsersBatchResponse,
    APIError,
    ImportUsersBatchPayload
  >({
    mutationFn: nguoiDungService.importUsersBatch,
    onSuccess: (data) => {
      // Toast sẽ hiển thị chi tiết hơn ở component sau khi nhận response
      if (data.totalError > 0) {
        toast.warning(
          data.summaryMessage ||
            `${data.totalSuccess} người dùng được import thành công, ${data.totalError} lỗi.`
        );
      } else {
        toast.success(
          data.summaryMessage ||
            `Đã import ${data.totalSuccess} người dùng thành công.`
        );
      }
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      });
      if (options?.onSuccess)
        options.onSuccess(data, {} as ImportUsersBatchPayload, undefined);
    },
    onError: (error: APIError) => {
      toast.error(
        error.body?.message ||
          error.message ||
          'Lỗi nghiêm trọng khi import người dùng.'
      );
      if (options?.onError)
        options.onError(error, {} as ImportUsersBatchPayload, undefined);
    },
    ...options,
  });
};

// Hook xóa cứng người dùng (chỉ Admin)
export const useAdminDeleteUser = (
  options?: UseMutationOptions<{ message: string }, APIError, number | string>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, APIError, number | string>({
    mutationFn: nguoiDungService.deleteNguoiDungById,
    onSuccess: (data, id) => {
      toast.success(data.message || 'Đã xóa người dùng thành công.');
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      });
      if (options?.onSuccess) options.onSuccess(data, id, undefined);
    },
    onError: (error, id) => {
      toast.error(
        error.body?.message || error.message || 'Lỗi khi xóa người dùng.'
      );
      if (options?.onError) options.onError(error, id, undefined);
    },
    ...options,
  });
};

export const useTimKiemNguoiDungDeMoi = (
  params: TimKiemNguoiDungDeMoiParams,
  options?: Omit<
    UseQueryOptions<NguoiDungTimKiemItem[], APIError>,
    'queryKey' | 'queryFn' // enabled sẽ được quản lý bởi component
  >
) => {
  return useQuery<NguoiDungTimKiemItem[], APIError>({
    queryKey: USER_SEARCH_FOR_INVITE_QUERY_KEYS.search(params),
    queryFn: () => {
      // Chỉ thực hiện query nếu có searchTerm và suKienID
      if (!params.searchTerm || !params.suKienID) {
        return Promise.resolve([]); // Trả về mảng rỗng nếu không có searchTerm hoặc suKienID
      }
      return nguoiDungService.timKiemNguoiDungDeMoi(params);
    },
    enabled: !!params.searchTerm && !!params.suKienID,
    staleTime: 1 * 60 * 1000, // Cache 1 phút cho kết quả tìm kiếm
    ...options,
  });
};
