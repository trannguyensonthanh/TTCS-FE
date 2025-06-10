import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, FileWarning, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PTITLogo } from '@/assets/logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher'; // Nếu muốn có theme switcher ở đây
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Có thể thêm một hình ảnh SVG hoặc ảnh nền nhẹ nhàng cho trang 404
// Ví dụ: một hình ảnh trừu tượng liên quan đến "tìm kiếm", "lạc đường" hoặc không gian
import NotFoundIllustration from '@/assets/images/not-found-illustration.jpg';

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = '404 - Không Tìm Thấy Trang | PTIT Events';
    // Gửi log lỗi lên server hoặc một dịch vụ theo dõi nếu cần
    console.error(
      `404 Error: Người dùng cố gắng truy cập đường dẫn không tồn tại: ${location.pathname}${location.search}`
    );
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-sky-900 p-6 text-center text-foreground">
      <div className="absolute top-6 right-6">
        <ThemeSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="max-w-lg w-full"
      >
        <Card className="shadow-2xl dark:bg-slate-800/70 backdrop-blur-sm border-border/50 dark:border-slate-700/50">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <FileWarning className="w-20 h-20 text-ptit-red mx-auto mb-6 opacity-80" />
              {/* Hoặc một illustration đẹp hơn */}
              {/* <img
                src="/src/assets/not-found-illustration.jpg" 
                alt="Page Not Found Illustration"
                className="w-48 h-48 mx-auto mb-6"
                // Hoặc dùng SVG inline
              /> */}
            </motion.div>
            <CardTitle className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-ptit-red via-orange-500 to-amber-400">
              404
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl font-semibold text-foreground mt-2">
              Ối! Trang bạn tìm không tồn tại.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-base md:text-lg">
              Có vẻ như bạn đã đi vào một đường dẫn không đúng hoặc trang đã
              được di chuyển. Đừng lo lắng, chúng tôi sẽ giúp bạn tìm lại đường!
            </p>

            <div className="relative w-full max-w-sm mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Thử tìm kiếm lại..."
                className="pl-10 h-11 text-base rounded-full shadow-inner"

                // Ví dụ: onKeyPress={(e) => { if(e.key === 'Enter') navigate(`/search?q=${e.currentTarget.value}`) }}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-ptit-blue hover:bg-ptit-blue/90 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" /> Về Trang Chủ
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-5 w-5" /> Quay Lại Trang Trước
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pt-8 justify-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <PTITLogo size={24} />
              <span>PTIT Events</span>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>

      <p className="mt-12 text-xs text-muted-foreground">
        Nếu bạn tin rằng đây là một lỗi, vui lòng{' '}
        <Link to="/contact" className="underline hover:text-primary">
          liên hệ với chúng tôi
        </Link>
        .
      </p>
    </div>
  );
};

export default NotFound;
