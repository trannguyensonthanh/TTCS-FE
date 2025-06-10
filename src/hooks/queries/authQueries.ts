// src/hooks/queries/authQueries.ts
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService, {
  LoginCredentials,
  LoginSuccessResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  ResendOtpPayload,
  ResendOtpResponse,
} from '@/services/auth.service';
import { APIError } from '@/services/apiHelper';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

// --- Login Hook ---
export const useLogin = (
  options?: UseMutationOptions<LoginSuccessResponse, APIError, LoginCredentials>
) => {
  const { login: contextLogin } = useAuth();

  return useMutation<LoginSuccessResponse, APIError, LoginCredentials>({
    mutationFn: authService.loginApi,
    onSuccess: (data) => {
      console.log('Login mutation successful:', data);

      contextLogin(data, data.tokens.accessToken, data.tokens.refreshToken);
      // Toast success đã có trong contextLogin
      if (options?.onSuccess) {
        options.onSuccess(data, {} as LoginCredentials, undefined); // Gọi lại onSuccess từ options
      }
    },
    onError: (error: APIError) => {
      console.error('Login mutation failed:', error);
      toast.error(
        error.body?.message || error.message || 'Đăng nhập thất bại.'
      );
      if (options?.onError) {
        options.onError(error, {} as LoginCredentials, undefined);
      }
    },
    ...options, // Spread các options khác từ bên ngoài
  });
};

// --- Forgot Password Hook ---
export const useForgotPassword = (
  options?: UseMutationOptions<
    ForgotPasswordResponse,
    APIError,
    ForgotPasswordPayload
  >
) => {
  const navigate = useNavigate();
  return useMutation<ForgotPasswordResponse, APIError, ForgotPasswordPayload>({
    mutationFn: authService.forgotPasswordApi,
    onSuccess: (data, variables) => {
      toast.success(
        data.message || 'Yêu cầu đã được gửi. Vui lòng kiểm tra email.'
      );
      navigate(`/verify-otp?email=${encodeURIComponent(variables.email)}`);
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError) => {
      console.error('Forgot password mutation failed:', error);
      toast.error(
        error.body?.message || error.message || 'Gửi yêu cầu thất bại.'
      );
      if (options?.onError) {
        options.onError(error, {} as ForgotPasswordPayload, undefined);
      }
    },
    ...options,
  });
};

// --- Verify OTP Hook ---
export const useVerifyOtp = (
  options?: UseMutationOptions<VerifyOtpResponse, APIError, VerifyOtpPayload>
) => {
  const navigate = useNavigate();
  return useMutation<VerifyOtpResponse, APIError, VerifyOtpPayload>({
    mutationFn: authService.verifyOtpApi,
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Xác thực OTP thành công.');
      // Lưu resetToken vào đâu đó (có thể là state của component cha hoặc query params) để dùng ở trang ResetPassword
      navigate(
        `/reset-password?email=${encodeURIComponent(
          variables.email
        )}&token=${encodeURIComponent(data.resetToken)}`
      );
      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    onError: (error: APIError) => {
      console.error('Verify OTP mutation failed:', error);
      toast.error(
        error.body?.message ||
          error.message ||
          'Mã OTP không đúng hoặc đã hết hạn.'
      );
      if (options?.onError) {
        options.onError(error, {} as VerifyOtpPayload, undefined);
      }
    },
    ...options,
  });
};

// --- Reset Password Hook ---
export const useResetPassword = (
  options?: UseMutationOptions<
    ResetPasswordResponse,
    APIError,
    ResetPasswordPayload
  >
) => {
  const navigate = useNavigate();
  return useMutation<ResetPasswordResponse, APIError, ResetPasswordPayload>({
    mutationFn: authService.resetPasswordApi,
    onSuccess: (data) => {
      toast.success(
        data.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.'
      );
      navigate('/login');
      if (options?.onSuccess) {
        options.onSuccess(data, {} as ResetPasswordPayload, undefined);
      }
    },
    onError: (error: APIError) => {
      console.error('Reset password mutation failed:', error);
      toast.error(
        error.body?.message || error.message || 'Đặt lại mật khẩu thất bại.'
      );
      if (options?.onError) {
        options.onError(error, {} as ResetPasswordPayload, undefined);
      }
    },
    ...options,
  });
};

// --- Resend OTP Hook ---
export const useResendOtp = (
  options?: UseMutationOptions<ResendOtpResponse, APIError, ResendOtpPayload>
) => {
  return useMutation<ResendOtpResponse, APIError, ResendOtpPayload>({
    mutationFn: authService.resendOtpApi,
    onSuccess: (data) => {
      toast.success(data.message || 'Mã OTP mới đã được gửi.');
      if (options?.onSuccess) {
        options.onSuccess(data, {} as ResendOtpPayload, undefined);
      }
    },
    onError: (error: APIError) => {
      console.error('Resend OTP mutation failed:', error);
      toast.error(
        error.body?.message || error.message || 'Không thể gửi lại mã OTP.'
      );
      if (options?.onError) {
        options.onError(error, {} as ResendOtpPayload, undefined);
      }
    },
    ...options,
  });
};
