// src/pages/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PTITLogo } from '@/assets/logo';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useResetPassword } from '@/hooks/queries/authQueries'; // Sử dụng hook
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const resetPasswordSchema = z
  .object({
    matKhauMoi: z
      .string()
      .min(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }),
    xacNhanMatKhauMoi: z
      .string()
      .min(1, { message: 'Vui lòng xác nhận mật khẩu mới.' }),
  })
  .refine((data) => data.matKhauMoi === data.xacNhanMatKhauMoi, {
    message: 'Mật khẩu nhập lại không khớp.',
    path: ['xacNhanMatKhauMoi'], // Chỉ định lỗi cho trường confirmPassword
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';
  const resetToken = queryParams.get('token') || ''; // Lấy resetToken từ URL

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      matKhauMoi: '',
      xacNhanMatKhauMoi: '',
    },
  });

  useEffect(() => {
    if (!email || !resetToken) {
      toast.error('Đường dẫn không hợp lệ hoặc đã hết hạn.');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, resetToken, navigate]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    await resetPasswordMutation.mutateAsync({
      resetToken,
      matKhauMoi: data.matKhauMoi,
    });
    // Logic điều hướng đã được xử lý trong hook onSuccess
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
            <h1 className="text-3xl font-bold mt-4">Đặt lại mật khẩu</h1>
            <p className="mt-2 text-muted-foreground">
              Nhập mật khẩu mới cho tài khoản: <br />
              {email ? (
                <span className="font-medium text-primary">{email}</span>
              ) : (
                ''
              )}
            </p>
          </div>

          <Card className="shadow-xl dark:border-slate-700">
            <CardHeader />
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="matKhauMoi"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="new-password-reset">Mật khẩu mới</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              id="new-password-reset"
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="Nhập mật khẩu mới"
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label={
                              showNewPassword
                                ? 'Ẩn mật khẩu mới'
                                : 'Hiện mật khẩu mới'
                            }
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="xacNhanMatKhauMoi"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="confirm-password-reset">
                          Xác nhận mật khẩu mới
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              id="confirm-password-reset"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Nhập lại mật khẩu mới"
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            aria-label={
                              showConfirmPassword
                                ? 'Ẩn xác nhận mật khẩu'
                                : 'Hiện xác nhận mật khẩu'
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt lại mật khẩu'
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
