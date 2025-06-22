// src/components/layout/DashboardLayout.tsx
import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  Fragment,
  useEffect, // Fragment không thấy dùng, có thể bỏ
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard as DashboardIcon,
  CalendarDays, // Không thấy dùng trực tiếp
  Building,
  Settings,
  ClipboardList,
  CalendarPlus,
  ShieldCheck,
  CalendarClock,
  LineChartIcon as LineChartLucideIcon,
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
  Home, // Không thấy dùng trực tiếp
  Grip, // Không thấy dùng trực tiếp
  Layers,
  Send, // Dùng cho Quản lý Loại Tầng
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
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { Logo } from '@/assets/logo'; // Giả sử đường dẫn này đúng
import MaVaiTro from '@/enums/MaVaiTro.enum'; // Đảm bảo đường dẫn đúng
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { NotificationBell } from '@/components/NotificationBell';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// --- Định nghĩa cấu trúc NavItem ---
interface NavItemStructure {
  label: string;
  href?: string; // Bắt buộc nếu không phải isTitle và không có subItems
  icon?: React.ElementType; // Icon là optional để hỗ trợ isTitle
  activePaths?: string[]; // Dùng để highlight group cha khi một trong các subItems active
  allowedRoles?: string[];
  subItems?: NavItemStructure[];
  exactMatch?: boolean;
  isTitle?: boolean; // Cho các tiêu đề nhóm lớn không click được
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
  const navigate = useNavigate(); // navigate không được dùng trực tiếp, có thể bỏ nếu Link là đủ
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // State cho các Collapsible items trên desktop, key là label của parent item
  const [openDesktopSubmenus, setOpenDesktopSubmenus] = useState<
    Record<string, boolean>
  >({});

  const toggleDesktopSubmenu = (label: string) => {
    setOpenDesktopSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Khởi tạo trạng thái mở cho các submenu dựa trên path hiện tại (chỉ cho desktop)
  useEffect(() => {
    if (!isMobile) {
      const initialOpenState: Record<string, boolean> = {};
      sidebarNavigationStructure.forEach((item) => {
        if (
          item.subItems &&
          item.activePaths?.some((p) => location.pathname.startsWith(p))
        ) {
          initialOpenState[item.label] = true;
        }
      });
      setOpenDesktopSubmenus(initialOpenState);
    }
  }, [location.pathname, isMobile]); // Không cần sidebarNavigationStructure vì nó được memoized

  const isActive = useCallback(
    (
      mainPath?: string,
      activePaths?: string[],
      exactMatch?: boolean
    ): boolean => {
      if (!mainPath && (!activePaths || activePaths.length === 0)) return false;

      if (mainPath) {
        if (exactMatch) return location.pathname === mainPath;
        // Cho phép /dashboard là trang chính, và các trang con /dashboard/* cũng active mục cha Dashboard
        if (
          mainPath === '/dashboard' &&
          (location.pathname === '/dashboard' ||
            location.pathname.startsWith('/dashboard/'))
        )
          return true;
        // Các trường hợp khác, active nếu path hiện tại bắt đầu bằng mainPath
        if (mainPath !== '/' && location.pathname.startsWith(mainPath))
          return true;
      }
      if (activePaths?.some((path) => location.pathname.startsWith(path)))
        return true;
      return false;
    },
    [location.pathname]
  );

  // Sidebar navigation structure, only include routes that are part of the dashboard ("/dashboard" and admin/management pages)
  const sidebarNavigationStructure = useMemo(
    (): NavItemStructure[] => [
      {
        label: 'Bảng Điều Khiển',
        href: '/dashboard',
        icon: DashboardIcon,
        exactMatch: true,
        allowedRoles: ['*'],
        activePaths: ['/dashboard'],
      },
      { isTitle: true, label: 'Nghiệp Vụ Chính', allowedRoles: ['*'] },
      {
        label: 'Quản Lý Sự Kiện',
        icon: ClipboardList,
        activePaths: [
          '/events',
          '/events/new',
          '/events/approve',
          '/events/cancel-requests',
        ],
        allowedRoles: [
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.QUAN_LY_CSVC,
        ],
        subItems: [
          {
            label: 'Danh sách Sự kiện',
            href: '/events',
            icon: ListChecks,
            allowedRoles: ['*'],
            activePaths: ['/events'],
          },
          {
            label: 'Tạo Sự kiện Mới',
            href: '/events/new',
            icon: CalendarPlus,
            allowedRoles: [
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
              MaVaiTro.ADMIN_HE_THONG,
            ],
            activePaths: ['/events/new'],
          },
          {
            label: 'Duyệt Sự kiện (BGH)',
            href: '/events/approve',
            icon: ShieldCheck,
            allowedRoles: [
              MaVaiTro.BGH_DUYET_SK_TRUONG,
              MaVaiTro.ADMIN_HE_THONG,
            ],
            activePaths: ['/events/approve'],
          },
          {
            label: 'Yêu cầu Hủy Sự kiện',
            href: '/events/cancel-requests',
            icon: History,
            allowedRoles: [
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
              MaVaiTro.ADMIN_HE_THONG,
              MaVaiTro.BGH_DUYET_SK_TRUONG, // Thêm quyền cho BGH duyệt sự kiện
            ],
            activePaths: ['/events/cancel-requests'],
          },
        ],
      },
      {
        label: 'Mời Tham Gia Sự Kiện',
        href: '/manage-invitations/new', // Đường dẫn đến trang mời
        icon: Send, // Hoặc UsersGroupIcon
        allowedRoles: [MaVaiTro.CONG_TAC_SINH_VIEN], // Chỉ CTSV mới được phép mời
        activePaths: ['/manage-invitations'], // Để active khi ở trang con (nếu có)
      },
      {
        label: 'Quản Lý CSVC',
        icon: Building,
        activePaths: [
          '/facilities/rooms',
          '/facilities/equipment',
          '/facilities/room-schedule',
          '/facilities/room-requests',
          '/facilities/room-change-requests',
        ],
        allowedRoles: [
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.ADMIN_HE_THONG,
        ],
        subItems: [
          {
            label: 'Phòng Học & Hội Trường',
            href: '/facilities/rooms',
            icon: Building2,
            allowedRoles: [
              MaVaiTro.QUAN_LY_CSVC,
              MaVaiTro.ADMIN_HE_THONG,
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
            ],
            activePaths: ['/facilities/rooms'],
          },
          {
            label: 'Trang Thiết Bị',
            href: '/facilities/equipment',
            icon: Settings,
            allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
            activePaths: ['/facilities/equipment'],
          },
          {
            label: 'Lịch Phòng',
            href: '/facilities/room-schedule',
            icon: Calendar,
            allowedRoles: [MaVaiTro.QUAN_LY_CSVC], // Chỉ QLCSVC mới được xem
            activePaths: ['/facilities/room-schedule'],
          },
          {
            label: 'Tạo YC Phòng',
            href: '/facilities/room-requests/new',
            icon: CalendarClock,
            allowedRoles: [
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
              MaVaiTro.ADMIN_HE_THONG,
            ],
            activePaths: ['/facilities/room-request'],
          },
          {
            label: 'Danh Sách YC Phòng',
            href: '/facilities/room-requests',
            icon: ListChecks,
            allowedRoles: [
              MaVaiTro.QUAN_LY_CSVC,
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
              MaVaiTro.ADMIN_HE_THONG,
            ],
            activePaths: ['/facilities/room-requests'],
          },
          {
            label: 'Danh Sách YC Đổi Phòng',
            href: '/facilities/room-change-requests',
            icon: History,
            allowedRoles: [
              MaVaiTro.QUAN_LY_CSVC,
              MaVaiTro.CB_TO_CHUC_SU_KIEN,
              MaVaiTro.ADMIN_HE_THONG,
            ],
            activePaths: ['/facilities/room-change-requests'],
          },
        ],
      },
      {
        isTitle: true,
        label: 'Thống Kê & Báo Cáo',
        allowedRoles: [MaVaiTro.BGH_DUYET_SK_TRUONG, MaVaiTro.QUAN_LY_CSVC], // Chỉ BGH và Quản lý CSVC thấy tiêu đề này
      },
      {
        label: 'Thống kê Sự kiện',
        href: '/dashboard/events',
        icon: LineChartLucideIcon,
        allowedRoles: [MaVaiTro.BGH_DUYET_SK_TRUONG], // Chỉ BGH mới được xem thống kê sự kiện
        activePaths: ['/dashboard/events'],
      },
      {
        label: 'Thống kê CSVC',
        href: '/dashboard/facilities',
        icon: LineChartLucideIcon,
        allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
        activePaths: ['/dashboard/facilities'],
      },
      {
        isTitle: true,
        label: 'Quản Trị Hệ Thống',
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Cấu Hình Hệ Thống',
        icon: Settings,
        activePaths: [
          '/users',
          '/users/roles',
          '/units',
          '/units/departments',
          '/units/clubs',
          '/units/union',
          '/units/majors',
          '/units/classes',
          '/units/buildings',
          '/units/floor-types',
        ],
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
        subItems: [
          {
            label: 'Người dùng',
            href: '/users',
            icon: UsersIconLucide,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
            activePaths: ['/users'],
          },

          {
            label: 'Vai trò & Quyền',
            href: '/users/roles',
            icon: UserSquare2,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
            activePaths: ['/users/roles'],
          },
          {
            label: 'Đơn vị',
            href: '/units',
            icon: Library,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
            activePaths: ['/units'],
          },
          // {
          //   label: 'Khoa/Bộ môn',
          //   href: '/units/departments',
          //   icon: Library,
          //   allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          //   activePaths: ['/units/departments'],
          // },
          // {
          //   label: 'CLB',
          //   href: '/units/clubs',
          //   icon: Library,
          //   allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          //   activePaths: ['/units/clubs'],
          // },
          // {
          //   label: 'Đoàn/Hội',
          //   href: '/units/union',
          //   icon: Library,
          //   allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
          //   activePaths: ['/units/union'],
          // },
          {
            label: 'Ngành học',
            href: '/units/majors',
            icon: BookOpen,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
            activePaths: ['/units/majors'],
          },
          {
            label: 'Lớp học',
            href: '/units/classes',
            icon: GraduationCap,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
            activePaths: ['/units/classes'],
          },
          {
            label: 'Tòa nhà',
            href: '/units/buildings',
            icon: Building,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
            activePaths: ['/units/buildings'],
          },
          {
            label: 'Loại tầng',
            href: '/units/floor-types',
            icon: Layers,
            allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
            activePaths: ['/units/floor-types'],
          },
        ],
      },
    ],
    []
  );

  const getVisibleSidebarItems = useCallback(
    (items: NavItemStructure[]): NavItemStructure[] => {
      return items.reduce((acc: NavItemStructure[], item) => {
        const isAllowed =
          !item.allowedRoles ||
          item.allowedRoles.includes('*') ||
          (user && item.allowedRoles.some((roleCode) => hasRole(roleCode)));
        if (isAllowed) {
          if (item.subItems) {
            const visibleSubItems = getVisibleSidebarItems(item.subItems);
            if (visibleSubItems.length > 0) {
              acc.push({ ...item, subItems: visibleSubItems });
            } else if (item.href) {
              // Nếu không có subItem nào được phép nhưng item cha có href, vẫn hiển thị item cha
              acc.push({ ...item, subItems: undefined });
            }
          } else {
            acc.push(item);
          }
        }
        return acc;
      }, []);
    },
    [user, hasRole]
  ); // Thêm hasRole vào dependencies

  const visibleSidebarNavigation = useMemo(
    () => getVisibleSidebarItems(sidebarNavigationStructure),
    [sidebarNavigationStructure, getVisibleSidebarItems]
  );

  const renderSidebarItem = (item: NavItemStructure, isSubItem = false) => {
    const commonClasses = cn(
      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200 ease-in-out',
      isSubItem
        ? 'text-muted-foreground hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10'
        : 'text-foreground/80 hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-ptit-red dark:hover:bg-ptit-red/10',
      isActive(item.href, item.activePaths, item.exactMatch) &&
        (isSubItem
          ? 'bg-primary/10 text-primary font-medium dark:bg-ptit-red/15 dark:text-ptit-red'
          : 'bg-primary/15 text-primary font-semibold dark:bg-ptit-red/20 dark:text-ptit-red')
    );

    if (item.isTitle) {
      return (
        <h4
          key={`title-${item.label}`}
          className="px-3 pt-5 pb-1.5 text-xs font-semibold uppercase text-muted-foreground/70 tracking-wider"
        >
          {item.label}
        </h4>
      );
    }

    if (item.subItems && item.subItems.length > 0) {
      return (
        <Collapsible
          key={item.label}
          open={openDesktopSubmenus[item.label]}
          onOpenChange={() => toggleDesktopSubmenu(item.label)}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm text-foreground/80 transition-all hover:text-primary hover:bg-primary/10 dark:text-slate-300 dark:hover:text-ptit-red dark:hover:bg-ptit-red/10',
                // Highlight group cha nếu một trong các con active hoặc group cha có activePaths khớp
                (isActive(undefined, item.activePaths) ||
                  item.subItems.some((sub) =>
                    isActive(sub.href, sub.activePaths, sub.exactMatch)
                  )) &&
                  'bg-primary/15 text-primary font-semibold dark:bg-ptit-red/20 dark:text-ptit-red'
              )}
            >
              <div className="flex items-center gap-3">
                {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
              </div>
              {openDesktopSubmenus[item.label] ? (
                <ChevronUp className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 ml-3 border-l border-muted/50 dark:border-slate-700/50 space-y-0.5 py-1 animate-accordion-down">
            {item.subItems.map((subItem) => renderSidebarItem(subItem, true))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    if (item.href) {
      const linkContent = (
        <>
          {item.icon && (
            <item.icon
              className={cn('h-5 w-5 flex-shrink-0', isSubItem && 'h-4 w-4')}
            />
          )}
          <span className="truncate">{item.label}</span>
        </>
      );

      if (isMobile) {
        return (
          <SheetClose asChild key={item.href}>
            <Link
              to={item.href}
              className={commonClasses}
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              {linkContent}
            </Link>
          </SheetClose>
        );
      } else {
        return (
          <Link key={item.href} to={item.href} className={commonClasses}>
            {linkContent}
          </Link>
        );
      }
    }
    return null;
  };

  const SidebarNavContent = () => (
    <div className="flex h-full max-h-screen flex-col border-r bg-card dark:bg-slate-900 shadow-lg">
      <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-card z-10 dark:bg-slate-900 dark:border-slate-800">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 font-bold text-lg text-foreground hover:text-primary dark:hover:text-ptit-red transition-colors"
          onClick={() => isMobile && setIsMobileSidebarOpen(false)}
        >
          <Logo className="h-8 w-8 text-primary dark:text-ptit-red" />
          <span className="whitespace-nowrap">PTIT Events</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-3">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-0.5">
          {visibleSidebarNavigation.map((item) => renderSidebarItem(item))}
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
                  <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
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
              sideOffset={10}
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
                    <DropdownMenuItem className="cursor-pointer h-9">
                      <Home className="mr-2 h-4 w-4" /> Trang chủ người dùng
                    </DropdownMenuItem>
                  </Link>
                </SheetClose>
              ) : (
                <Link to="/">
                  <DropdownMenuItem className="cursor-pointer h-9">
                    <Home className="mr-2 h-4 w-4" /> Trang chủ người dùng
                  </DropdownMenuItem>
                </Link>
              )}
              {isMobile ? (
                <SheetClose asChild>
                  <Link to="/profile">
                    <DropdownMenuItem className="cursor-pointer h-9">
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
                  if (isMobile) setIsMobileSidebarOpen(false);
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
                onClick={() => setIsMobileSidebarOpen(false)}
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

  const getCurrentPageTitle = useCallback(() => {
    if (pageTitle) return pageTitle;
    // Tìm item tương ứng với đường dẫn hiện tại trong cấu trúc điều hướng
    for (const item of sidebarNavigationStructure) {
      if (item.href === location.pathname) return item.label;
      // Kiểm tra trong các subItems nếu không tìm thấy ở cấp độ chính
      if (item.subItems) {
        for (const subItem of item.subItems) {
          if (subItem.href === location.pathname) return subItem.label;
        }
      }
    }
    return 'PTIT Events'; // Tiêu đề mặc định
  }, [pageTitle, location.pathname, sidebarNavigationStructure]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar cho màn hình lớn */}
      <div className="hidden lg:block w-64">
        <SidebarNavContent />
      </div>
      {/* Nội dung chính */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header cho màn hình lớn */}
        <div className="hidden lg:flex h-16 items-center border-b px-4 lg:px-6 sticky top-0 bg-card z-10 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">
              {getCurrentPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">{headerActions}</div>
        </div>
        <div className="flex-1 p-4 lg:p-6">{children}</div>
      </div>
      {/* Sidebar cho màn hình di động */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="absolute left-4 top-4 z-10 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          className="flex max-w-sm flex-col p-0"
          side="left"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex h-16 items-center border-b px-4 lg:px-6 sticky top-0 bg-card z-10 dark:bg-slate-900 dark:border-slate-800">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 font-bold text-lg text-foreground hover:text-primary dark:hover:text-ptit-red transition-colors"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <Logo className="h-8 w-8 text-primary dark:text-ptit-red" />
              <span className="whitespace-nowrap">PTIT Events</span>
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-0.5">
              {visibleSidebarNavigation.map((item) => renderSidebarItem(item))}
            </nav>
          </ScrollArea>
          <div className="p-3 border-t dark:border-slate-800">
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
                      <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
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
                  sideOffset={10}
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
                          {user.hoTen.split(' ').pop()?.[0]?.toUpperCase() ||
                            'U'}
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
                        <DropdownMenuItem className="cursor-pointer h-9">
                          <Home className="mr-2 h-4 w-4" /> Trang chủ người dùng
                        </DropdownMenuItem>
                      </Link>
                    </SheetClose>
                  ) : (
                    <Link to="/">
                      <DropdownMenuItem className="cursor-pointer h-9">
                        <Home className="mr-2 h-4 w-4" /> Trang chủ người dùng
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {isMobile ? (
                    <SheetClose asChild>
                      <Link to="/profile">
                        <DropdownMenuItem className="cursor-pointer h-9">
                          <UserIconLucide className="mr-2 h-4 w-4" /> Thông tin
                          cá nhân
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
                      if (isMobile) setIsMobileSidebarOpen(false);
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
                    onClick={() => setIsMobileSidebarOpen(false)}
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
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DashboardLayout;
