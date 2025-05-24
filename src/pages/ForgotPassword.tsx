// src/pages/ForgotPassword.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PTITLogo } from '@/assets/logo';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForgotPassword } from '@/hooks/queries/authQueries'; // Sử dụng hook
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc.' })
    .email({ message: 'Email không hợp lệ.' }),
});

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await forgotPasswordMutation.mutateAsync(data);
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
            <h1 className="text-3xl font-bold mt-4">Quên mật khẩu</h1>
            <p className="mt-2 text-muted-foreground">
              Nhập email của bạn để nhận mã xác nhận OTP.
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email-forgot">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input
                              id="email-forgot"
                              type="email"
                              placeholder="Nhập email đã đăng ký"
                              className="pl-10"
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi mã xác nhận'
                    )}
                  </Button>

                  <Link
                    to="/login"
                    className="flex items-center justify-center mt-4 text-sm font-medium text-primary hover:underline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đăng nhập
                  </Link>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
