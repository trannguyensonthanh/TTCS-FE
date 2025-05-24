import React, { useState, useMemo, Fragment, useCallback } from 'react'; // Thêm Fragment
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'; // Thêm SheetClose
import { ThemeSwitcher } from './ThemeSwitcher';
import { NotificationBell } from './NotificationBell';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { Logo } from '@/assets/logo';
import MaVaiTro from '@/enums/maVaiTro.enum';
import {
  LayoutDashboard,
  CalendarDays,
  Building,
  Settings,
  ClipboardList,
  CalendarPlus,
  ShieldCheck,
  CalendarClock,
  LineChart as LineChartIcon,
  Building2,
  Calendar,
  ListChecks,
  History,
  Users,
  UserSquare2,
  Library,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users2,
  LogOut,
  User as UserIcon,
  Menu,
  ChevronDown,
  ChevronUp,
  Home,
  LayoutDashboardIcon, // Thêm Home Icon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItemStructure {
  label?: string;
  href?: string;
  icon?: React.ElementType;
  activePaths?: string[];
  allowedRoles?: string[]; // Mảng MaVaiTro
  subItems?: NavItemStructure[];
  isDivider?: boolean;
  exactMatch?: boolean; // Thêm cờ này để so sánh chính xác href
}

const MainNavigation = () => {
  const { user, logout } = useAuth();
  const { hasRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<
    Record<string, boolean>
  >({});

  const toggleMobileSubmenu = (label: string) => {
    setOpenMobileSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (
    mainPath?: string,
    activePaths?: string[],
    exactMatch?: boolean
  ) => {
    if (!mainPath) return false;
    if (exactMatch) return location.pathname === mainPath;
    if (mainPath === '/' && location.pathname === '/') return true;
    if (mainPath !== '/' && location.pathname.startsWith(mainPath)) return true;
    if (activePaths?.some((path) => location.pathname.startsWith(path)))
      return true;
    return false;
  };

  const navigationStructure = useMemo(
    (): NavItemStructure[] => [
      {
        label: 'Trang Chủ',
        href: '/',
        icon: Home,
        exactMatch: true, // Trang chủ cần khớp chính xác
        allowedRoles: ['*'],
      },
      {
        label: 'Lịch Sự Kiện', // Đổi tên từ "Lịch Sự Kiện Trường" cho gọn
        href: '/events-public',
        icon: CalendarDays,
        activePaths: ['/events-public'],
        allowedRoles: ['*'],
      },
      {
        isDivider: true,
        allowedRoles: [
          // Dòng kẻ phân cách
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.TRUONG_KHOA,
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.BI_THU_DOAN,
        ],
      },
      {
        label: 'Tổng Quan', // Dashboard chung cho các vai trò quản lý
        href: '/dashboard',
        icon: LayoutDashboard,
        activePaths: ['/dashboard'],
        // Chỉ active khi đúng /dashboard
        allowedRoles: [
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.TRUONG_KHOA,
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.BI_THU_DOAN,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
        ],

        subItems: [
          {
            label: 'Danh sách Sự kiện',
            href: '/events',
            icon: ClipboardList,
            allowedRoles: ['*'],
          }, // Ai thấy mục cha đều thấy cái này
          {
            label: 'Tạo Sự kiện Mới',
            href: '/events/new',
            icon: CalendarPlus,
            allowedRoles: [
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
              MaVaiTro.ADMIN_HE_THONG,
            ],
          },
          {
            label: 'Duyệt Sự kiện (BGH)',
            href: '/events/approve',
            icon: ShieldCheck,
            allowedRoles: [
              MaVaiTro.BGH_DUYET_SK_TRUONG,
              MaVaiTro.ADMIN_HE_THONG,
            ],
          },
          {
            label: 'Yêu cầu Hủy Sự kiện',
            href: '/events/cancel-requests',
            icon: CalendarClock,
            allowedRoles: [
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
              MaVaiTro.BGH_DUYET_SK_TRUONG,
              MaVaiTro.ADMIN_HE_THONG,
            ],
          },
          {
            label: 'Thống kê Sự kiện',
            href: '/dashboard/events',
            icon: LineChartIcon,
            allowedRoles: [
              MaVaiTro.ADMIN_HE_THONG,
              MaVaiTro.BGH_DUYET_SK_TRUONG,
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
            ],
          },
        ],
      },
      {
        label: 'Quản Lý CSVC',
        icon: Building,
        activePaths: ['/facilities', '/dashboard/facilities'],
        allowedRoles: [
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
        ],
        subItems: [
          {
            label: 'Quản lý Phòng',
            href: '/facilities/rooms',
            icon: Building2,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
          },
          {
            label: 'Quản lý Thiết bị',
            href: '/facilities/equipment',
            icon: Settings,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
          },
          {
            label: 'Lịch sử dụng Phòng',
            href: '/facilities/room-schedule',
            icon: Calendar,
            allowedRoles: ['*'],
          }, // Mọi người trong nhóm allowedRoles của cha
          {
            label: 'Yêu cầu Mượn Phòng',
            href: '/facilities/room-requests',
            icon: ListChecks,
            allowedRoles: [
              MaVaiTro.ADMIN_HE_THONG,
              MaVaiTro.QUAN_LY_CSVC,
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
            ],
          },
          {
            label: 'Yêu cầu Đổi Phòng',
            href: '/facilities/room-change-requests',
            icon: History,
            allowedRoles: [
              MaVaiTro.ADMIN_HE_THONG,
              MaVaiTro.QUAN_LY_CSVC,
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
            ],
          },
          {
            label: 'Thống kê CSVC',
            href: '/dashboard/facilities',
            icon: LineChartIcon,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
          },
        ],
      },
      {
        label: 'Dashboard Đơn Vị',
        icon: Briefcase,
        activePaths: [
          '/dashboard/department',
          '/dashboard/clubs',
          '/dashboard/union',
        ],
        allowedRoles: [
          MaVaiTro.TRUONG_KHOA,
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.BI_THU_DOAN,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.GV_CO_VAN_CLB,
        ],
        subItems: [
          {
            label: 'Khoa Của Tôi',
            href: '/dashboard/department',
            icon: Briefcase,
            allowedRoles: [MaVaiTro.TRUONG_KHOA, MaVaiTro.ADMIN_HE_THONG],
          },
          {
            label: 'CLB Của Tôi',
            href: '/dashboard/clubs',
            icon: Users2,
            allowedRoles: [
              MaVaiTro.TRUONG_CLB,
              MaVaiTro.GV_CO_VAN_CLB,
              MaVaiTro.ADMIN_HE_THONG,
            ],
          },
          {
            label: 'Đoàn Của Tôi',
            href: '/dashboard/union',
            icon: Users2,
            allowedRoles: [MaVaiTro.BI_THU_DOAN, MaVaiTro.ADMIN_HE_THONG],
          },
        ],
      },
      {
        label: 'Quản Trị Hệ Thống',
        icon: Settings,
        activePaths: ['/users', '/units'],
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
        subItems: [
          {
            label: 'Quản lý Người dùng',
            href: '/users',
            icon: Users,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          },
          {
            label: 'Vai trò & Phân quyền',
            href: '/users/roles',
            icon: UserSquare2,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          },
          {
            label: 'Quản lý Đơn vị',
            href: '/units',
            icon: Library,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          },
          {
            label: 'Quản lý Ngành học',
            href: '/units/majors',
            icon: BookOpen,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          },
          {
            label: 'Quản lý Lớp học',
            href: '/units/classes',
            icon: GraduationCap,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          },
        ],
      },
    ],
    []
  ); // Bỏ location và hasRole vì chúng không thay đổi cấu trúc menu

  const getVisibleNavItems = useCallback(
    (items: NavItemStructure[]): NavItemStructure[] => {
      return items
        .filter((item) => {
          if (item.isDivider) {
            // Luôn hiển thị divider nếu nó được phép bởi vai trò của parent
            return true; // Logic hiển thị divider sẽ được xử lý khi render
          }
          if (!item.allowedRoles || item.allowedRoles.includes('*'))
            return true;
          if (!user || !user.vaiTroChucNang) return false; // Nếu không có user hoặc vai trò, không hiển thị
          return item.allowedRoles.some((roleCode) => hasRole(roleCode));
        })
        .map((item) => ({
          ...item,
          subItems: item.subItems
            ? getVisibleNavItems(item.subItems)
            : undefined,
        }))
        .filter(
          (item) =>
            item.isDivider ||
            item.href ||
            (item.subItems && item.subItems.length > 0)
        ); // Loại bỏ mục cha không có href và không có subItems nào được phép
    },
    [user, hasRole]
  );

  const visibleNavigation = useMemo(
    () => getVisibleNavItems(navigationStructure),
    [navigationStructure, getVisibleNavItems]
  );

  const renderDesktopSubMenu = (item: NavItemStructure) => (
    <NavigationMenuContent>
      <ul
        className={cn(
          'grid gap-3 p-4',
          item.subItems && item.subItems.length > 2
            ? 'md:w-[500px] md:grid-cols-2 lg:w-[600px]'
            : 'md:w-[300px] lg:w-[350px]'
        )}
      >
        {item.subItems?.map((subItem) => (
          // Logic allowedRoles đã được xử lý bởi getVisibleNavItems
          <ListItem
            key={subItem.label}
            to={subItem.href!}
            title={subItem.label}
            icon={subItem.icon}
          >
            {/* Mô tả ngắn cho subItem nếu có */}
          </ListItem>
        ))}
      </ul>
    </NavigationMenuContent>
  );

  const renderMobileSubMenuRecursive = (
    items: NavItemStructure[],
    level = 0
  ): React.ReactNode => {
    return items.map((item) => {
      if (item.isDivider) {
        return (
          <hr
            key={`divider-mobile-${item.label || Math.random()}`}
            className="my-2 border-muted"
          />
        );
      }
      if (item.subItems && item.subItems.length > 0) {
        const isOpen = openMobileSubmenus[item.label] || false;
        return (
          <div key={item.label} className="py-1">
            <button
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive(undefined, item.activePaths) &&
                  'text-primary font-semibold'
              )}
              onClick={() => toggleMobileSubmenu(item.label)}
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon className="h-5 w-5" />}
                {item.label}
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {isOpen && (
              <div
                className={cn(
                  'ml-4 mt-1 pl-3 border-l border-muted/50',
                  `animate-accordion-down`
                )}
              >
                {renderMobileSubMenuRecursive(item.subItems, level + 1)}
              </div>
            )}
          </div>
        );
      }
      return (
        <SheetClose asChild key={item.label}>
          <Link
            to={item.href!}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive(item.href, item.activePaths, item.exactMatch) &&
                'bg-primary/10 text-primary font-medium'
            )}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            {item.label}
          </Link>
        </SheetClose>
      );
    });
  };

  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Logo className="h-7 w-7 text-primary" />{' '}
          {/* Thêm class text-primary cho logo */}
          <span>PTIT Events</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        {' '}
        {/* Bọc nav bằng ScrollArea */}
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-0.5 py-4">
          {' '}
          {/* Giảm gap */}
          {renderMobileSubMenuRecursive(visibleNavigation)}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-4 border-t">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2 h-auto py-2"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user.anhDaiDien || undefined}
                    alt={user.hoTen}
                  />
                  <AvatarFallback>
                    {user.hoTen.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {user.hoTen}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 mb-2"
              align="start"
              side="top"
              forceMount
            >
              {' '}
              {/* Điều chỉnh align và side */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.hoTen}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              //{' '}
              <SheetClose asChild>
                {' '}
                {/* Bọc Link bằng SheetClose */}
                <Link to="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <LayoutDashboardIcon className="mr-2 h-4 w-4" /> Bảng điều
                    khiển
                  </DropdownMenuItem>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" /> Thông tin cá nhân
                  </DropdownMenuItem>
                </Link>
              </SheetClose>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
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
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
              {' '}
              {/* Thêm flex flex-col */}
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Logo className="h-7 w-7 text-primary" />
            <span className="hidden sm:inline-block">PTIT Events</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          {' '}
          {/* Navigations cho desktop */}
          <NavigationMenu>
            <NavigationMenuList>
              {visibleNavigation.map((item) =>
                !item.isDivider && item.href && !item.subItems ? (
                  <NavigationMenuItem key={item.label}>
                    <Link to={item.href}>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive(
                            item.href,
                            item.activePaths,
                            item.exactMatch
                          ) && 'bg-accent text-accent-foreground font-semibold'
                        )}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ) : !item.isDivider &&
                  item.subItems &&
                  item.subItems.length > 0 ? (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger
                      className={cn(
                        isActive(undefined, item.activePaths) &&
                          'bg-accent text-accent-foreground font-semibold'
                      )}
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    {renderDesktopSubMenu(item)}
                  </NavigationMenuItem>
                ) : null
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeSwitcher />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.anhDaiDien || undefined}
                      alt={user.hoTen}
                    />
                    <AvatarFallback>
                      {user.hoTen.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.hoTen}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to="/dashboard">
                  {' '}
                  <DropdownMenuItem className="cursor-pointer">
                    <LayoutDashboardIcon className="mr-2 h-4 w-4" /> Bảng điều
                    khiển
                  </DropdownMenuItem>
                </Link>
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" /> Thông tin cá nhân
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!user && ( // Nút đăng nhập cho desktop nếu chưa login
            <Link to="/login" className="hidden md:inline-flex">
              <Button>Đăng nhập</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

const ListItem = React.forwardRef<
  HTMLAnchorElement, // Sửa thành HTMLAnchorElement
  React.ComponentPropsWithoutRef<typeof Link> & {
    title: string;
    icon?: React.ElementType;
  }
>(({ className, title, children, icon: Icon, to, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to} // Đảm bảo 'to' được truyền đúng
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}{' '}
            {/* Thêm màu cho icon */}
            {title}
          </div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export default MainNavigation;
