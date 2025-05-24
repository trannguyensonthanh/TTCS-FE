/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/hooks/queries/authQueries'; // Giả định hook này đã được tạo

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner'; // Sử dụng sonner cho toast
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PTITLogo } from '@/assets/logo';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Định nghĩa schema validation với Zod
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email không được để trống.' })
    .email({ message: 'Email không hợp lệ.' }),
  matKhau: z
    .string({ required_error: 'Mật khẩu không được để trống.' })
    .min(1, { message: 'Mật khẩu không được để trống.' }),
  // Có thể thêm .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự." }) nếu backend yêu cầu
});

type LoginFormValues = {
  email: string;
  matKhau: string;
};

const Login: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth(); // Lấy loading từ AuthContext để biết khi nào context sẵn sàng
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      matKhau: '',
    },
  });

  // Nếu đã đăng nhập, chuyển hướng về trang chủ
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data); // mutateAsync để có thể await
      // AuthContext sẽ xử lý việc lưu user và token, sau đó điều hướng
      // Hoặc bạn có thể điều hướng ở đây sau khi loginMutation.onSuccess được gọi trong hook
      // navigate('/'); // Chuyển về hook useLogin để xử lý điều hướng sau khi AuthContext cập nhật xong
    } catch (error: any) {
      // Lỗi đã được toast trong useLogin hoặc AuthContext, không cần toast lại ở đây trừ khi muốn custom
      // console.error('Login page error:', error);
      // if (error?.body?.message) {
      //   toast.error(error.body.message);
      // } else if (error.message) {
      //   toast.error(error.message);
      // } else {
      //   toast.error('Đã có lỗi xảy ra khi đăng nhập.');
      // }
    }
  };

  if (authLoading && !isAuthenticated) {
    // Hiển thị màn hình chờ trong khi AuthContext đang kiểm tra trạng thái đăng nhập ban đầu
    // (để tránh việc redirect về login rồi lại redirect đi nếu user đã đăng nhập)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-background to-muted dark:from-slate-900 dark:to-slate-800">
      {/* Left side - background image */}
      <div
        className="hidden lg:block lg:w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=1974&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-ptit-blue/80 to-ptit-red/80 mix-blend-multiply dark:from-ptit-blue/70 dark:to-ptit-red/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-md"
          >
            <PTITLogo
              size={80}
              className="mx-auto mb-6 filter drop-shadow-lg"
            />
            <h1 className="text-4xl font-bold mb-4 drop-shadow-md">
              Học viện Công nghệ Bưu chính Viễn thông
            </h1>
            <p className="text-lg opacity-95 drop-shadow-sm">
              Hệ thống quản lý sự kiện và cơ sở vật chất
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <motion.div
          className="w-full max-w-md space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="text-center lg:hidden">
            <PTITLogo size={60} className="mx-auto" />
            <h1 className="text-2xl font-bold mt-4 text-foreground">
              Học viện Công nghệ Bưu chính Viễn thông
            </h1>
          </div>

          <Card className="shadow-xl dark:border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tight">
                Đăng nhập
              </CardTitle>
              <CardDescription className="mt-2">
                Nhập thông tin để truy cập vào hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email-login">Email</Label>{' '}
                        {/* Changed id to avoid conflict */}
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              id="email-login"
                              type="email"
                              placeholder="Email đăng nhập"
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="matKhau"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password-login">Mật khẩu</Label>{' '}
                          {/* Changed id */}
                          <Link
                            to="/forgot-password"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Quên mật khẩu?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              id="password-login"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Mật khẩu"
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                            }
                          >
                            {showPassword ? (
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
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="bg-card border rounded-lg p-4 shadow-md dark:border-slate-700 ">
            <p className="text-center text-sm font-medium mb-2 text-muted-foreground">
              Tài khoản demo
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.keys(MOCK_USERS_FOR_DEMO_DISPLAY).map((emailKey) => (
                <div
                  key={emailKey}
                  className="bg-muted dark:bg-slate-700 rounded px-2 py-1 truncate text-muted-foreground"
                >
                  {emailKey}
                  {MOCK_USERS_FOR_DEMO_DISPLAY[emailKey] && (
                    <span className="text-xs text-ptit-blue">
                      {String(MOCK_USERS_FOR_DEMO_DISPLAY[emailKey])}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

// Giả định MOCK_USERS_FOR_DEMO_DISPLAY chỉ để hiển thị, có thể lấy từ AuthContext hoặc định nghĩa riêng
const MOCK_USERS_FOR_DEMO_DISPLAY: Record<string, unknown> = {
  'sonthanhit35@gmail.com': 'admin',
  'sonthanh030504@gmail.com': 'event',
  'sonthanh1234567891011@gmail.com': 'facility',
  // 'dean@example.com': {},
  'sonthanh123456789101112@gmail.com': 'principal',
  // 'club@example.com': {},
  // 'student@example.com': {},
  // 'lecturer@example.com': {},
  'sonthanh12345678910@gmail.com': 'union',
  // 'secretary@example.com': {} // Bạn có thể thêm lại nếu cần
};
