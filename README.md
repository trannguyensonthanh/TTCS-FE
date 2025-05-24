import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeSwitcher } from './ThemeSwitcher'; // Giả định đường dẫn đúng
import { NotificationBell } from './NotificationBell'; // Giả định đường dẫn đúng
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext'; // Hook đã được điều chỉnh
import { Logo } from '@/assets/logo'; // Giả định đường dẫn đúng
import maVaiTro from '@/enums/maVaiTro.enum'; // Import hằng số maVaiTro
import {
LayoutDashboard,
CalendarDays,
Building2,
Users,
UserSquare2,
Settings,
LogOut,
Menu,
ChevronDown,
ClipboardList,
ListChecks,
ShieldCheck,
CalendarClock,
History,
GanttChartSquare,
BookOpen, // Cho ngành học
GraduationCap, // Cho lớp học
Library, // Cho đơn vị chung
Users2, // Cho CLB, Đoàn thể
Briefcase,
Calendar,
LineChartIcon,
Building,
CalendarPlus,
User, // Cho Phòng/Ban
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface NavItemStructure {
label: string;
href?: string; // Optional for top-level triggers
icon: React.ElementType;
activePaths?: string[]; // Các path con cũng được coi là active
allowedRoles?: string[]; // Mảng các MaVaiTro được phép xem
subItems?: NavItemStructure[]; // Cho sub-menu trong NavigationMenuContent hoặc Sheet
}

const MainNavigation = () => {
const { user, logout } = useAuth();
const { hasRole, can } = useRole(); // Sử dụng can() để kiểm tra quyền chi tiết hơn nếu cần
const location = useLocation();
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const isMobile = useMediaQuery('(max-width: 768px)');
const isActive = (mainPath?: string, activePaths?: string[]) => {
if (!mainPath) return false;
if (mainPath === '/' && location.pathname === '/') return true;
if (mainPath !== '/' && location.pathname.startsWith(mainPath)) return true;
if (activePaths?.some((path) => location.pathname.startsWith(path)))
return true;
return false;
};

const navigationStructure = useMemo((): NavItemStructure[] => [
// 1. TỔNG QUAN CHUNG (Dành cho các vai trò quản lý/điều hành)
{
label: 'Tổng Quan Chung',
href: '/dashboard',
icon: LayoutDashboard,
activePaths: ['/dashboard'], // Chỉ active khi đúng /dashboard
allowedRoles: [
maVaiTro.ADMIN_HE_THONG,
maVaiTro.BGH_DUYET_SK_TRUONG,
maVaiTro.QUAN_LY_CSVC,
// CBTC có thể có dashboard riêng hoặc xem mục này
],
},

// 2. LỊCH SỰ KIỆN (Dành cho tất cả người dùng đã đăng nhập để xem)
{
label: 'Lịch Sự Kiện Trường',
href: '/events-public', // Route cho trang hiển thị sự kiện công khai
icon: CalendarDays,
activePaths: ['/events-public'],
allowedRoles: ['*'], // '\*' cho tất cả người dùng đã đăng nhập
},

// 3. QUẢN LÝ SỰ KIỆN (Dành cho các vai trò liên quan đến quy trình sự kiện)
{
label: 'Quản Lý Sự Kiện',
icon: ClipboardList, // Icon chính cho nhóm
activePaths: ['/events', '/events/new', '/events/approve', '/events/cancel-requests'],
allowedRoles: [ // Ai có thể thấy nhóm menu "Quản Lý Sự Kiện"
maVaiTro.ADMIN_HE_THONG,
maVaiTro.CB_TO_CHUC_SU_KIEN,
maVaiTro.BGH_DUYET_SK_TRUONG,
// TK, TCLB, BTĐ có thể xem danh sách sự kiện liên quan đến đơn vị họ
maVaiTro.TRUONG_KHOA,
maVaiTro.TRUONG_CLB,
maVaiTro.BI_THU_DOAN,
],
subItems: [
{
label: 'Danh sách Sự kiện', // Đây là trang /events (EventsList.tsx)
href: '/events',
icon: ClipboardList, // Icon lặp lại hoặc có thể chọn icon khác
// Quyền xem danh sách này sẽ được lọc ở backend và FE dựa trên vai trò cụ thể
allowedRoles: [
maVaiTro.ADMIN_HE_THONG, maVaiTro.CB_TO_CHUC_SU_KIEN, maVaiTro.BGH_DUYET_SK_TRUONG,
maVaiTro.QUAN_LY_CSVC, // CSVC có thể cần xem danh sách để nắm tình hình
maVaiTro.TRUONG_KHOA, maVaiTro.TRUONG_CLB, maVaiTro.BI_THU_DOAN
],
},
{
label: 'Tạo Sự kiện Mới',
href: '/events/new',
icon: CalendarPlus,
allowedRoles: [maVaiTro.CB_TO_CHUC_SU_KIEN, maVaiTro.ADMIN_HE_THONG],
// Giai đoạn 2: có thể thêm vai trò tạo sự kiện cấp đơn vị cho TK, TCLB, BTĐ
},
{
label: 'Duyệt Sự kiện (BGH)',
href: '/events/approve', // Trang cho BGH duyệt
icon: ShieldCheck,
allowedRoles: [maVaiTro.BGH_DUYET_SK_TRUONG, maVaiTro.ADMIN_HE_THONG],
},
{
label: 'Yêu cầu Hủy Sự kiện',
href: '/events/cancel-requests', // Trang quản lý các yêu cầu hủy
icon: CalendarClock,
allowedRoles: [
maVaiTro.CB_TO_CHUC_SU_KIEN, // Để xem yêu cầu của mình
maVaiTro.BGH_DUYET_SK_TRUONG, // Để duyệt yêu cầu hủy
maVaiTro.ADMIN_HE_THONG,
],
},
],
},

// 4. QUẢN LÝ CƠ SỞ VẬT CHẤT
{
label: 'Quản Lý CSVC',
icon: Building, // Icon chính cho nhóm
activePaths: ['/facilities', '/dashboard/facilities'],
allowedRoles: [ // Ai có thể thấy nhóm menu "Quản Lý CSVC"
maVaiTro.ADMIN_HE_THONG,
maVaiTro.QUAN_LY_CSVC,
// Các vai trò khác có thể chỉ xem Lịch sử dụng phòng
],
subItems: [
{
label: 'Quản lý Phòng',
href: '/facilities/rooms',
icon: Building2,
allowedRoles: [maVaiTro.ADMIN_HE_THONG, maVaiTro.QUAN_LY_CSVC],
},
{
label: 'Quản lý Thiết bị',
href: '/facilities/equipment',
icon: Settings, // Có thể đổi icon này
allowedRoles: [maVaiTro.ADMIN_HE_THONG, maVaiTro.QUAN_LY_CSVC],
},
{
label: 'Lịch sử dụng Phòng',
href: '/facilities/room-schedule',
icon: Calendar,
allowedRoles: ['*'], // Mọi người đều có thể xem lịch phòng
},
{
label: 'Yêu cầu Mượn Phòng', // Trang CBTC tạo YC và CSVC duyệt
href: '/facilities/room-requests',
icon: ListChecks,
allowedRoles: [
maVaiTro.ADMIN_HE_THONG,
maVaiTro.QUAN_LY_CSVC,
maVaiTro.CB_TO_CHUC_SU_KIEN,
],
},
{
label: 'Yêu cầu Đổi Phòng',
href: '/facilities/room-change-requests',
icon: History,
allowedRoles: [
maVaiTro.ADMIN_HE_THONG,
maVaiTro.QUAN_LY_CSVC,
maVaiTro.CB_TO_CHUC_SU_KIEN,
],
},
{
label: 'Thống kê CSVC',
href: '/dashboard/facilities',
icon: LineChartIcon,
allowedRoles: [maVaiTro.ADMIN_HE_THONG, maVaiTro.QUAN_LY_CSVC],
},
],
},

// 5. CÁC DASHBOARD ĐƠN VỊ (Dành cho Trưởng Khoa, Trưởng CLB, Bí thư Đoàn)
{
label: 'Dashboard Đơn Vị',
icon: Briefcase, // Icon chung
activePaths: ['/dashboard/department', '/dashboard/clubs', '/dashboard/union'],
// Mục cha này sẽ hiển thị nếu người dùng có ít nhất 1 trong các vai trò quản lý đơn vị
allowedRoles: [maVaiTro.TRUONG_KHOA, maVaiTro.TRUONG_CLB, maVaiTro.BI_THU_DOAN, maVaiTro.ADMIN_HE_THONG],
subItems: [
{
label: 'Dashboard Khoa',
href: '/dashboard/department',
icon: Briefcase, // Hoặc School
allowedRoles: [maVaiTro.TRUONG_KHOA, maVaiTro.ADMIN_HE_THONG],
},
{
label: 'Dashboard CLB',
href: '/dashboard/clubs',
icon: Users2,
allowedRoles: [maVaiTro.TRUONG_CLB, maVaiTro.GV_CO_VAN_CLB, maVaiTro.ADMIN_HE_THONG], // GV Cố vấn cũng có thể xem
},
{
label: 'Dashboard Đoàn',
href: '/dashboard/union',
icon: Users2,
allowedRoles: [maVaiTro.BI_THU_DOAN, maVaiTro.ADMIN_HE_THONG],
},
]
},

// 6. QUẢN TRỊ HỆ THỐNG (Chỉ dành cho ADMIN_HE_THONG)
{
label: 'Quản Trị Hệ Thống',
icon: Settings,
activePaths: ['/users', '/units', '/admin-settings'],
allowedRoles: [maVaiTro.ADMIN_HE_THONG],
subItems: [
{
label: 'Quản lý Người dùng',
href: '/users', // Trang tổng hợp quản lý user (có thể có các tab SV, GV, NV)
icon: Users,
allowedRoles: [maVaiTro.ADMIN_HE_THONG],
},
{
label: 'Vai trò & Phân quyền',
href: '/users/roles', // Trang quản lý VaiTroHeThong và NguoiDung_VaiTroChucNang
icon: UserSquare2,
allowedRoles: [maVaiTro.ADMIN_HE_THONG],
},
{
label: 'Quản lý Đơn vị',
href: '/units', // Trang tổng hợp quản lý các loại đơn vị
icon: Library,
allowedRoles: [maVaiTro.ADMIN_HE_THONG],
},
{
label: 'Quản lý Ngành học',
href: '/units/majors',
icon: BookOpen,
allowedRoles: [maVaiTro.ADMIN_HE_THONG],
},
{
label: 'Quản lý Lớp học',
href: '/units/classes',
icon: GraduationCap,
allowedRoles: [maVaiTro.ADMIN_HE_THONG],
},
// { label: "Cấu hình Hệ thống", href: "/admin-settings", icon: Settings, allowedRoles: [maVaiTro.ADMIN_HE_THONG] },
],
},
], []); // Không cần dependencies vì không dùng trực tiếp các biến bên trong

const getVisibleNavItems = (
items: NavItemStructure[]
): NavItemStructure[] => {
return items
.filter((item) => {
if (!item.allowedRoles || item.allowedRoles.includes('_')) return true; // '_' means accessible to all logged-in users
if (!user || !user.vaiTroChucNang) return false;
return item.allowedRoles.some((roleCode) => hasRole(roleCode));
})
.map((item) => ({
...item,
subItems: item.subItems ? getVisibleNavItems(item.subItems) : undefined,
}));
};

const visibleNavigation = useMemo(
() => getVisibleNavItems(navigationStructure),
[navigationStructure, user]
);

const renderDesktopSubMenu = (item: NavItemStructure) => (
<NavigationMenuContent>

<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
{item.subItems?.map(
(subItem) =>
(subItem.allowedRoles?.some((role) => hasRole(role)) ||
subItem.allowedRoles?.includes('_') ||
hasRole(maVaiTro.ADMIN_HE_THONG)) && (
<ListItem
                key={subItem.label}
                to={subItem.href!}
                title={subItem.label}
                icon={subItem.icon}
              >
{/_ Mô tả ngắn cho subItem nếu có \*/}
</ListItem>
)
)}
</ul>
</NavigationMenuContent>
);

const renderMobileSubMenu = (items?: NavItemStructure[]) => (

<div className="pl-4 border-l border-muted ml-1">
{items?.map(
(subItem) =>
(subItem.allowedRoles?.some((role) => hasRole(role)) ||
subItem.allowedRoles?.includes('\*') ||
hasRole(maVaiTro.ADMIN_HE_THONG)) && (
<Link
key={subItem.label}
to={subItem.href!}
className={cn(
'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
isActive(subItem.href, subItem.activePaths) &&
'bg-primary/10 text-primary font-medium'
)}
onClick={() => setIsMobileMenuOpen(false)} >
{subItem.icon && <subItem.icon className="h-4 w-4" />}
{subItem.label}
</Link>
)
)}
</div>
);

const renderNavItems = (items: NavItemStructure[], isMobile: boolean) => {
return items.map((item) => (
<NavigationMenuItem
key={item.label}
asChild={!isMobile && !item.subItems} >
{item.subItems && !isMobile ? (
<>
<NavigationMenuTrigger
className={cn(
isActive(item.href, item.activePaths) &&
'bg-accent text-accent-foreground'
)} >
<item.icon className="h-5 w-5 mr-2 md:hidden lg:inline-flex" />{' '}
{item.label}
</NavigationMenuTrigger>
{renderDesktopSubMenu(item)}
</>
) : item.href ? (

<Link
to={item.href}
onClick={() => isMobile && setIsMobileMenuOpen(false)} >
<NavigationMenuLink
className={cn(
navigationMenuTriggerStyle(),
'flex items-center gap-3',
isActive(item.href, item.activePaths) &&
'bg-accent text-accent-foreground font-semibold'
)} >
<item.icon className="h-5 w-5" /> {item.label}
</NavigationMenuLink>
</Link>
) : null}
</NavigationMenuItem>
));
};

const SidebarContent = () => (

<div className="flex h-full max-h-screen flex-col gap-2">
<div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
<Link
to="/"
className="flex items-center gap-2 font-semibold"
onClick={() => setIsMobileMenuOpen(false)} >
<Logo className="h-7 w-7" />
<span className="text-lg">PTIT Events</span>
</Link>
</div>
<div className="flex-1">
<nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1 py-4">
{visibleNavigation.map((item) => (
<React.Fragment key={item.label}>
{item.href ? (
<Link
to={item.href}
className={cn(
'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
isActive(item.href, item.activePaths) &&
'bg-primary/10 text-primary font-medium'
)}
onClick={() => setIsMobileMenuOpen(false)} >
{item.icon && <item.icon className="h-5 w-5" />}
{item.label}
</Link>
) : (
item.subItems && ( // For mobile dropdown-like structure
<details
className="group [&_summary::-webkit-details-marker]:hidden"
open={isActive(undefined, item.activePaths)} >
<summary
className={cn(
'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer',
isActive(undefined, item.activePaths) &&
'text-primary font-medium'
)} >
<div className="flex items-center gap-3">
{item.icon && <item.icon className="h-5 w-5" />}
{item.label}
</div>
<ChevronDown className="h-4 w-4 shrink-0 transition duration-200 group-open:rotate-180" />
</summary>
{renderMobileSubMenu(item.subItems)}
</details>
)
)}
</React.Fragment>
))}
</nav>
</div>
<div className="mt-auto p-4 border-t">
{user ? (
<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2"
              >
<Avatar className="h-8 w-8">
<AvatarImage
src={user.anhDaiDien || undefined}
alt={user.hoTen}
/>
<AvatarFallback>
{user.hoTen.charAt(0).toUpperCase()}
</AvatarFallback>
</Avatar>
<div className="flex flex-col items-start">
<span className="text-sm font-medium truncate max-w-[150px]">
{user.hoTen}
</span>
<span className="text-xs text-muted-foreground truncate max-w-[150px]">
{user.email}
</span>
</div>
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
<Link to="/profile">
<DropdownMenuItem className="cursor-pointer">
<User className="mr-2 h-4 w-4" /> Thông tin cá nhân
</DropdownMenuItem>
</Link>
<DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
<LogOut className="mr-2 h-4 w-4" /> Đăng xuất
</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
) : (
<Link
to="/login"
className="w-full"
onClick={() => setIsMobileMenuOpen(false)} >
<Button className="w-full">Đăng nhập</Button>
</Link>
)}
</div>
</div>
);

return (

<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
<div className="container flex h-16 items-center">
{' '}
{/_ Tăng chiều cao header một chút _/}
{/_ Mobile Menu Trigger _/}
<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
<SheetTrigger asChild>
<Button variant="ghost" size="icon" className="md:hidden mr-2">
<Menu className="h-6 w-6" />
<span className="sr-only">Mở menu</span>
</Button>
</SheetTrigger>
<SheetContent side="left" className="w-[300px] p-0">
{' '}
{/_ Tăng chiều rộng SheetContent _/}
<SidebarContent />
</SheetContent>
</Sheet>
{/_ Logo and Desktop Navigation _/}
<div className="mr-4 hidden md:flex items-center">
<Link
            to="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
<Logo className="h-7 w-7" />
<span>PTIT Events</span>
</Link>
</div>
{!isMobile && (
<NavigationMenu className="hidden md:flex flex-1">
<NavigationMenuList>
{renderNavItems(visibleNavigation, false)}
</NavigationMenuList>
</NavigationMenu>
)}
{/_ Right side actions _/}
<div
className={cn(
'flex items-center gap-2 ml-auto',
isMobile && 'flex-1 justify-end'
)} >
<NotificationBell />
<ThemeSwitcher />
{!isMobile &&
user && ( // Chỉ hiển thị User Dropdown trên desktop nếu đã login
<DropdownMenu>
<DropdownMenuTrigger asChild>
<Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
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
<Link to="/profile">
<DropdownMenuItem className="cursor-pointer">
<User className="mr-2 h-4 w-4" /> Thông tin cá nhân
</DropdownMenuItem>
</Link>
<DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
<LogOut className="mr-2 h-4 w-4" /> Đăng xuất
</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
)}
{!isMobile && !user && (
<Link to="/login">
<Button>Đăng nhập</Button>
</Link>
)}
</div>
</div>
</header>
);
};

// ListItem component for NavigationMenuContent
const ListItem = React.forwardRef<
React.ElementRef<'a'>,
React.ComponentPropsWithoutRef<typeof Link> & {
title: string;
icon?: React.ElementType;
}

> (({ className, title, children, icon: Icon, to, ...props }, ref) => {
> return (

    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {Icon && <Icon className="h-4 w-4" />}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>

);
});
ListItem.displayName = 'ListItem';

export default MainNavigation;
