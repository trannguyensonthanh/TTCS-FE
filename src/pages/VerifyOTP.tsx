// src/pages/VerifyOTP.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PTITLogo } from '@/assets/logo';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useVerifyOtp, useResendOtp } from '@/hooks/queries/authQueries'; // Sử dụng hooks
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  useEffect(() => {
    if (!email) {
      toast.error('Không tìm thấy thông tin email để xác thực OTP.');
      navigate('/forgot-password', { replace: true });
    }

    let timer: ReturnType<typeof setInterval> | null = null;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
      if (timer) clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [email, countdown, canResend, navigate]);

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    // Thêm optional cho e
    if (e) e.preventDefault(); // Chỉ gọi preventDefault nếu e tồn tại

    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    await verifyOtpMutation.mutateAsync({ email, otp });
    // Logic điều hướng đã được xử lý trong hook onSuccess
  };

  const handleResendOTP = async () => {
    if (!canResend || resendOtpMutation.isPending) return;

    try {
      await resendOtpMutation.mutateAsync({ email });
      // Toast success đã được xử lý trong hook
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      // Toast error đã được xử lý trong hook
      console.error('Resend OTP failed on page:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background to-muted dark:from-slate-900 dark:to-slate-800">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md mx-auto p-6 sm:p-8 flex flex-col justify-center">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="text-center">
            <PTITLogo size={60} className="mx-auto" />
            <h1 className="text-3xl font-bold mt-4">Xác nhận OTP</h1>
            <p className="mt-2 text-muted-foreground">
              Nhập mã OTP gồm 6 chữ số đã được gửi đến email: <br />
              {email ? (
                <span className="font-medium text-primary">{email}</span>
              ) : (
                'email của bạn'
              )}
            </p>
          </div>

          <Card className="shadow-xl dark:border-slate-700">
            <CardHeader />
            <CardContent>
              <form className="space-y-6" onSubmit={handleVerifyOTP}>
                <div className="space-y-2">
                  <Label
                    htmlFor="otp-input"
                    className="text-center block sr-only"
                  >
                    Mã xác nhận
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      id="otp-input"
                      maxLength={6}
                      value={otp}
                      onChange={setOtp} // InputOTP của shadcn thường nhận trực tiếp hàm set
                      onComplete={handleVerifyOTP} // Tự động submit khi đủ 6 số
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyOtpMutation.isPending || otp.length !== 6}
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    'Xác nhận OTP'
                  )}
                </Button>

                <div className="text-center text-sm">
                  {canResend ? (
                    <Button
                      variant="link"
                      type="button"
                      onClick={handleResendOTP}
                      className="p-0 h-auto text-primary hover:underline"
                      disabled={resendOtpMutation.isPending}
                    >
                      {resendOtpMutation.isPending
                        ? 'Đang gửi lại...'
                        : 'Gửi lại mã OTP'}
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">
                      Gửi lại mã OTP sau {countdown} giây
                    </p>
                  )}
                </div>

                <Link
                  to="/forgot-password"
                  className="flex items-center justify-center mt-4 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Link>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOTP;
