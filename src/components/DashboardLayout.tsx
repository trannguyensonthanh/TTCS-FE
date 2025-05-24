import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  Fragment,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard as DashboardIcon,
  CalendarDays,
  Building,
  Settings,
  ClipboardList,
  CalendarPlus,
  ShieldCheck,
  CalendarClock,
  LineChartIcon,
  Building2,
  Calendar,
  ListChecks,
  History,
  Users as UsersIconLucide,
  UserSquare2,
  Library,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users2 as UsersGroupIcon,
  LogOut,
  User as UserIconLucide,
  Menu,
  ChevronDown,
  ChevronUp,
  Home,
  Grip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeSwitcher } from './ThemeSwitcher'; // Điều chỉnh đường dẫn nếu cần
import { NotificationBell } from './NotificationBell'; // Điều chỉnh đường dẫn nếu cần
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { Logo } from '@/assets/logo'; // Điều chỉnh đường dẫn nếu cần
import MaVaiTro from '@/enums/maVaiTro.enum'; // Điều chỉnh đường dẫn nếu cần
import { useIsMobile } from '@/hooks/use-mobile'; // Điều chỉnh đường dẫn nếu cần
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// --- Định nghĩa cấu trúc NavItem (có thể import từ MainNavigation nếu dùng chung) ---
interface NavItemStructure {
  label: string;
  href?: string;
  icon?: React.ElementType;
  activePaths?: string[];
  allowedRoles?: string[];
  subItems?: NavItemStructure[];
  exactMatch?: boolean;
  isTitle?: boolean;
}

// --- Props cho DashboardLayout ---
interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  headerActions?: ReactNode;
}

const DashboardLayout = ({
  children,
  pageTitle,
  headerActions,
}: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { hasRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State cho sheet trên mobile
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
    // Cho phép /dashboard là trang chính, và các trang con /dashboard/* cũng active mục cha Dashboard
    if (
      mainPath === '/dashboard' &&
      (location.pathname === '/dashboard' ||
        location.pathname.startsWith('/dashboard/'))
    )
      return true;
    if (mainPath !== '/' && location.pathname.startsWith(mainPath)) return true;
    if (activePaths?.some((path) => location.pathname.startsWith(path)))
      return true;
    return false;
  };

  // Cấu trúc menu cho sidebar (Dựa trên cấu trúc MainNavigation đã thống nhất)
  const sidebarNavigationStructure = useMemo(
    (): NavItemStructure[] => [
      {
        label: 'Bảng Điều Khiển',
        href: '/dashboard',
        icon: DashboardIcon,
        exactMatch: true,
        allowedRoles: ['*'],
      },
      {
        isTitle: true,
        label: 'Quản lý Sự kiện',
        allowedRoles: [
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.TRUONG_KHOA,
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.BI_THU_DOAN,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.QUAN_LY_CSVC,
        ],
      },
      {
        label: 'Danh sách Sự kiện',
        href: '/events',
        icon: ClipboardList,
        activePaths: [
          '/events',
          '/events/new',
          '/events/edit',
          '/events/participants',
          '/events/approve',
          '/events/cancel-requests',
        ],
        allowedRoles: ['*'],
      },
      // Các sub-items của "Quản Lý Sự Kiện" (Tạo, Duyệt, Yêu cầu hủy) sẽ được truy cập từ trang Danh sách sự kiện
      // Hoặc có thể thêm các link trực tiếp ở đây nếu muốn, nhưng sẽ làm sidebar dài hơn.
      // Ví dụ:
      // { label: 'Tạo Sự kiện Mới', href: '/events/new', icon: CalendarPlus, allowedRoles: [MaVaiTro.CB_TO_CHUC_SU_KIEN, MaVaiTro.ADMIN_HE_THONG] },

      {
        isTitle: true,
        label: 'Quản lý CSVC',
        allowedRoles: [
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },
      {
        label: 'Danh sách Phòng',
        href: '/facilities/rooms',
        icon: Building2,
        allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Danh sách Thiết bị',
        href: '/facilities/equipment',
        icon: Settings,
        allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Lịch sử dụng Phòng',
        href: '/facilities/room-schedule',
        icon: Calendar,
        allowedRoles: ['*'],
      },
      {
        label: 'Yêu cầu Mượn Phòng',
        href: '/facilities/room-requests',
        icon: ListChecks,
        allowedRoles: [
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },
      {
        label: 'Yêu cầu Đổi Phòng',
        href: '/facilities/room-change-requests',
        icon: History,
        allowedRoles: [
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },

      {
        isTitle: true,
        label: 'Thống Kê Đơn Vị',
        allowedRoles: [
          MaVaiTro.TRUONG_KHOA,
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.BI_THU_DOAN,
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
        ],
      },
      {
        label: 'Thống kê Sự kiện Chung',
        href: '/dashboard/events',
        icon: LineChartIcon,
        allowedRoles: [
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
        ],
      },
      {
        label: 'Thống kê CSVC Chung',
        href: '/dashboard/facilities',
        icon: LineChartIcon,
        allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Dashboard Khoa',
        href: '/dashboard/department',
        icon: Briefcase,
        allowedRoles: [MaVaiTro.TRUONG_KHOA, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Dashboard CLB',
        href: '/dashboard/clubs',
        icon: UsersGroupIcon,
        allowedRoles: [
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.GV_CO_VAN_CLB,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },
      {
        label: 'Dashboard Đoàn',
        href: '/dashboard/union',
        icon: UsersGroupIcon,
        allowedRoles: [MaVaiTro.BI_THU_DOAN, MaVaiTro.ADMIN_HE_THONG],
      },

      {
        isTitle: true,
        label: 'Quản Trị Hệ Thống',
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Quản lý Người dùng',
        href: '/users',
        icon: UsersIconLucide,
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
    [user]
  ); // Phụ thuộc vào user để re-render khi user thay đổi

  const getVisibleSidebarItems = useCallback(
    (items: NavItemStructure[]): NavItemStructure[] => {
      return items.filter((item) => {
        if (!item.allowedRoles || item.allowedRoles.includes('*')) return true;
        if (!user || !user.vaiTroChucNang) return false;
        return item.allowedRoles.some((roleCode) => hasRole(roleCode));
      });
    },
    [user, hasRole]
  );

  const visibleSidebarNavigation = useMemo(
    () => getVisibleSidebarItems(sidebarNavigationStructure),
    [sidebarNavigationStructure, getVisibleSidebarItems]
  );

  const SidebarNavContent = () => (
    <div className="flex h-full max-h-screen flex-col border-r bg-sidebar dark:bg-slate-900 shadow-lg">
      <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-sidebar z-10 dark:bg-slate-900 dark:border-slate-800">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 font-bold text-lg text-sidebar-foreground hover:text-primary dark:hover:text-ptit-red transition-colors"
          onClick={() => {
            if (isMobile) setIsSidebarOpen(false);
          }}
        >
          <Logo className="h-8 w-8 text-primary dark:text-ptit-red" />
          <span className="whitespace-nowrap">PTIT Events</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-3">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-0.5">
          {visibleSidebarNavigation.map((item, index) =>
            item.isTitle ? (
              <h4
                key={`title-${item.label}-${index}`}
                className="px-3 pt-5 pb-1.5 text-xs font-semibold uppercase text-muted-foreground/70 tracking-wider"
              >
                {item.label}
              </h4>
            ) : item.href ? (
              isMobile ? (
                <SheetClose asChild key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3.5 rounded-md px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 ease-in-out hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-ptit-red dark:hover:bg-ptit-red/10',
                      isActive(item.href, item.activePaths, item.exactMatch) &&
                        'bg-primary/10 text-primary font-semibold dark:bg-ptit-red/15 dark:text-ptit-red'
                    )}
                    onClick={() => setIsSidebarOpen(false)} // Explicitly close sheet on mobile
                  >
                    {item.icon && (
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </Link>
                </SheetClose>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3.5 rounded-md px-3 py-2.5 text-sidebar-foreground/90 transition-all duration-200 ease-in-out hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-ptit-red dark:hover:bg-ptit-red/10',
                    isActive(item.href, item.activePaths, item.exactMatch) &&
                      'bg-primary/10 text-primary font-semibold dark:bg-ptit-red/15 dark:text-ptit-red'
                  )}
                >
                  {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            ) : null
          )}
        </nav>
      </ScrollArea>
      <div className="mt-auto p-3 border-t dark:border-slate-800">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2.5 px-2 h-auto py-2.5 hover:bg-primary/5 dark:hover:bg-ptit-red/5 rounded-md"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/20 dark:border-ptit-red/20">
                  <AvatarImage
                    src={user.anhDaiDien || undefined}
                    alt={user.hoTen}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                    {user.hoTen.split(' ').pop()?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[150px]">
                    {user.hoTen}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60 mb-2"
              align="start"
              sideOffset={isMobile ? 0 : 10}
              side={isMobile ? 'top' : 'right'}
            >
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
              {isMobile ? (
                <SheetClose asChild>
                  <Link to="/">
                    <DropdownMenuItem
                      className="cursor-pointer h-9"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <DashboardIcon className="mr-2 h-4 w-4" /> Giao diện người
                      dùng
                    </DropdownMenuItem>
                  </Link>
                </SheetClose>
              ) : (
                <Link to="/">
                  <DropdownMenuItem className="cursor-pointer h-9">
                    <DashboardIcon className="mr-2 h-4 w-4" /> Giao diện người
                    dùng
                  </DropdownMenuItem>
                </Link>
              )}
              {isMobile ? (
                <SheetClose asChild>
                  <Link to="/profile">
                    <DropdownMenuItem
                      className="cursor-pointer h-9"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <UserIconLucide className="mr-2 h-4 w-4" /> Thông tin cá
                      nhân
                    </DropdownMenuItem>
                  </Link>
                </SheetClose>
              ) : (
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer h-9">
                    <UserIconLucide className="mr-2 h-4 w-4" /> Thông tin cá
                    nhân
                  </DropdownMenuItem>
                </Link>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 h-9"
              >
                <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : isMobile ? (
          <SheetClose asChild>
            <Link to="/login" className="w-full">
              <Button
                className="w-full"
                onClick={() => setIsSidebarOpen(false)}
              >
                Đăng nhập
              </Button>
            </Link>
          </SheetClose>
        ) : (
          <Link to="/login" className="w-full">
            <Button className="w-full">Đăng nhập</Button>
          </Link>
        )}
      </div>
    </div>
  );

  const getCurrentPageTitle = () => {
    if (pageTitle) return pageTitle;

    const findActiveItem = (
      items: NavItemStructure[]
    ): NavItemStructure | undefined => {
      for (const item of items) {
        if (
          item.href &&
          isActive(item.href, item.activePaths, item.exactMatch)
        ) {
          return item;
        }
        if (item.subItems) {
          const activeSubItem = findActiveItem(item.subItems);
          if (activeSubItem) return activeSubItem;
        }
      }
      return undefined;
    };
    const activeItem = findActiveItem(sidebarNavigationStructure);
    return activeItem?.label || 'Trang Quản Lý';
  };

  return (
    <div
      className="flex min-h-screen w-full" // Removed md:grid layout
    >
      {/* Sidebar for Desktop (fixed) or Mobile (Sheet) */}
      {isMobile ? (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          {/* Trigger sẽ nằm ở Header */}
          <SheetContent
            side="left"
            className="w-[300px] p-0 flex flex-col"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SidebarNavContent />
          </SheetContent>
        </Sheet>
      ) : (
        // Desktop sidebar: fixed position, full height, set width
        <aside className="hidden md:block fixed top-0 left-0 h-screen w-[260px] z-40">
          {/* SidebarNavContent handles its own background, border, and shadow */}
          <SidebarNavContent />
        </aside>
      )}

      {/* Main content area: apply margin-left on desktop to account for fixed sidebar */}
      <div
        className={cn(
          'flex flex-col flex-1 overflow-hidden',
          !isMobile && 'md:ml-[260px]'
        )}
      >
        <header className="flex h-16 items-center gap-x-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30 dark:border-slate-800 shadow-sm">
          {/* Mobile Navigation Trigger */}
          {isMobile && (
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
          )}
          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <span className="block text-xl font-bold truncate text-foreground">
              {getCurrentPageTitle()}
            </span>
          </div>
          {/* Notification bell and custom header actions */}
          <NotificationBell />
          {headerActions}
          <ThemeSwitcher />
          {/* UserNav replaced with user avatar dropdown */}
          {/* User avatar dropdown is already implemented in SidebarNavContent for both desktop and mobile */}
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-muted/20 dark:bg-slate-950/60">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
