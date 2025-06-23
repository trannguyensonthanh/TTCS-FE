/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ClientHeader.tsx
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu,
  LogOut,
  User,
  LayoutDashboard as DashboardIcon,
  Home,
  CalendarDays,
  InfoIcon,
  ShieldQuestion,
  Contact,
  Mail,
} from 'lucide-react';
import { Logo } from '@/assets/logo';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from './ThemeSwitcher'; // Giả sử đã có
import { ScrollArea } from '@/components/ui/scroll-area';

interface ClientNavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
  exact?: boolean;
}

const clientNavLinks: ClientNavItem[] = [
  { label: 'Trang Chủ', href: '/', icon: Home, exact: true },
  { label: 'Sự Kiện', href: '/events-public', icon: CalendarDays }, // Trang lịch sự kiện công khai
  { label: 'Danh Sách Phòng', href: '/rooms-explorer', icon: Home }, // Trang danh sách phòng
  { label: 'Giới Thiệu', href: '/about', icon: InfoIcon }, // Trang giới thiệu về trường/hệ thống
  { label: 'Hỗ Trợ', href: '/support', icon: ShieldQuestion }, // Trang FAQ, hướng dẫn
  { label: 'Liên Hệ', href: '/contact', icon: Contact }, // Trang liên hệ
];

export const ClientHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // navigate('/login'); // AuthContext đã xử lý việc điều hướng khi logout
  };

  const NavLinkItem = ({ href, label, icon: Icon, exact }: ClientNavItem) => (
    <NavLink
      to={href}
      end={exact} // Sử dụng end prop cho NavLink để khớp chính xác với path "/"
      className={({ isActive }) =>
        cn(
          'text-sm font-medium transition-colors hover:text-primary dark:hover:text-ptit-red px-3 py-2 rounded-md flex items-center gap-2',
          isActive
            ? 'text-primary dark:text-ptit-red bg-primary/10 dark:bg-ptit-red/10'
            : 'text-muted-foreground'
        )
      }
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm dark:border-slate-800">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 mr-6">
          <Logo className="h-8 w-8 text-primary dark:text-ptit-red" />
          <span className="font-bold text-xl hidden sm:inline-block text-foreground">
            PTIT Events
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1 items-center">
          {clientNavLinks.map((link) => (
            <NavLinkItem key={link.href} {...link} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <ThemeSwitcher />
          {/* Có thể thêm NotificationBell ở đây nếu client cũng cần xem thông báo */}
          {/* <NotificationBell /> */}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0"
                >
                  <Avatar className="h-10 w-10 border-2 border-transparent hover:border-primary dark:hover:border-ptit-red transition-colors">
                    <AvatarImage
                      src={user.anhDaiDien || undefined}
                      alt={user.hoTen}
                    />
                    <AvatarFallback className="text-base bg-muted font-semibold">
                      {user.hoTen.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.anhDaiDien || undefined}
                        alt={user.hoTen}
                      />
                      <AvatarFallback>
                        {user.hoTen.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold leading-none">
                        {user.hoTen}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.vaiTroChucNang && user.vaiTroChucNang.length > 0 && (
                  <Link
                    to={
                      user.vaiTroChucNang.some(
                        (v: any) => v.maVaiTro === 'ADMIN_HE_THONG'
                      )
                        ? '/facilities/rooms'
                        : '/dashboard'
                    }
                  >
                    <DropdownMenuItem className="cursor-pointer h-9">
                      <DashboardIcon className="mr-2 h-4 w-4" /> Bảng điều khiển
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer h-9">
                    <User className="mr-2 h-4 w-4" /> Thông tin cá nhân
                  </DropdownMenuItem>
                </Link>
                <Link to="/my-invitations">
                  <DropdownMenuItem className="cursor-pointer h-9">
                    <Mail className="mr-2 h-4 w-4 text-orange-500" /> Lời Mời Sự
                    Kiện
                    {/* Có thể hiển thị badge số lượng lời mời chưa đọc ở đây nếu BE có API */}
                  </DropdownMenuItem>
                </Link>
                <Link to="/my-attended-events">
                  <DropdownMenuItem className="cursor-pointer h-9">
                    <CalendarDays className="mr-2 h-4 w-4 text-sky-500" /> Sự
                    Kiện Đã Tham Dự
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 h-9"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button
                size="sm"
                className="bg-gradient-to-r from-ptit-blue to-sky-500 hover:from-ptit-blue/90 hover:to-sky-500/90 text-white shadow hover:shadow-md transition-all"
              >
                Đăng Nhập
              </Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
              <div className="flex h-16 items-center border-b px-4 sticky top-0 bg-background z-10 dark:border-slate-800">
                <Link
                  to="/"
                  className="flex items-center gap-2 font-semibold text-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Logo className="h-7 w-7 text-primary dark:text-ptit-red" />
                  <span>PTIT Events</span>
                </Link>
              </div>
              <ScrollArea className="flex-1 py-4">
                <nav className="grid gap-2 px-4">
                  {clientNavLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <NavLinkItem {...link} />
                    </SheetClose>
                  ))}
                </nav>
              </ScrollArea>
              {/* User info/login for mobile sheet footer */}
              <div className="mt-auto p-4 border-t dark:border-slate-800">
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    {' '}
                    {/* Có thể đơn giản hóa, không cần dropdown trong sheet */}
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 px-2 h-auto py-2 hover:bg-accent"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.anhDaiDien || undefined} />
                          <AvatarFallback>
                            {user.hoTen.split(' ').pop()?.[0]?.toUpperCase() ||
                              'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-medium truncate">
                            {user.hoTen}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56 mb-2"
                      align="end"
                      side="top"
                    >
                      {/* Các mục menu như desktop */}
                      <SheetClose asChild>
                        <Link
                          to={
                            user.vaiTroChucNang &&
                            user.vaiTroChucNang.some(
                              (v: any) => v.maVaiTro === 'ADMIN_HE_THONG'
                            )
                              ? '/facilities/rooms'
                              : '/dashboard'
                          }
                        >
                          <DropdownMenuItem className="cursor-pointer h-9">
                            <DashboardIcon className="mr-2 h-4 w-4" />
                            Bảng điều khiển
                          </DropdownMenuItem>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/profile">
                          <DropdownMenuItem className="cursor-pointer h-9">
                            <User className="mr-2 h-4 w-4" />
                            Cá nhân
                          </DropdownMenuItem>
                        </Link>
                      </SheetClose>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 h-9"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <SheetClose asChild>
                    <Link to="/login" className="w-full">
                      <Button className="w-full">Đăng nhập</Button>
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
