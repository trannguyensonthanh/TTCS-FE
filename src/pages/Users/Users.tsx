import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  User,
  UsersIcon,
  GraduationCap,
  Briefcase,
  UserPlus,
  Upload,
  Filter,
  Search,
  Trash2,
  Edit,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ImportUsersDialog from "@/components/users/ImportUsersDialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Label } from "@/components/ui/label";
import { UserImportRow, formatDateOfBirthToPassword } from "@/lib/excelUtils";
import { UserRole, UserType } from "@/lib/roles";

// Mock user data
const mockUsers = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    userType: "SINH_VIEN",
    role: "SINH_VIEN",
    donViId: "1",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=NV&backgroundColor=1e88e5"
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    userType: "SINH_VIEN",
    role: "TRUONG_CLB",
    donViId: "3",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TTB&backgroundColor=1e88e5"
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@example.com",
    userType: "GIANG_VIEN",
    role: "GIANG_VIEN",
    donViId: "2",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=LVC&backgroundColor=1e88e5"
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    userType: "GIANG_VIEN",
    role: "TRUONG_KHOA",
    donViId: "2",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=PTD&backgroundColor=1e88e5"
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    userType: "NHAN_VIEN",
    role: "CB_TO_CHUC_SU_KIEN",
    donViId: "1",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=HVE&backgroundColor=1e88e5"
  },
];

// Mock department data
const departments = [
  { id: "1", name: "Phòng Công tác sinh viên" },
  { id: "2", name: "Khoa Công nghệ thông tin" },
  { id: "3", name: "CLB IT" },
  { id: "4", name: "Đoàn Thanh niên" },
];

const userTypeOptions = [
  { value: "SINH_VIEN", label: "Sinh viên" },
  { value: "GIANG_VIEN", label: "Giảng viên" },
  { value: "NHAN_VIEN", label: "Nhân viên" },
];

const roleOptions = {
  SINH_VIEN: [
    { value: "SINH_VIEN", label: "Sinh viên" },
    { value: "TRUONG_CLB", label: "Trưởng CLB" },
    { value: "BI_THU_DOAN", label: "Bí thư Đoàn" },
  ],
  GIANG_VIEN: [
    { value: "GIANG_VIEN", label: "Giảng viên" },
    { value: "TRUONG_KHOA", label: "Trưởng khoa" },
    { value: "BGH_DUYET_SK_TRUONG", label: "Ban giám hiệu" },
  ],
  NHAN_VIEN: [
    { value: "ADMIN_HE_THONG", label: "Admin hệ thống" },
    { value: "CB_TO_CHUC_SU_KIEN", label: "Cán bộ tổ chức sự kiện" },
    { value: "QUAN_LY_CSVC", label: "Quản lý CSVC" },
  ],
};

const getDepartmentName = (donViId: string | undefined) => {
  if (!donViId) return "N/A";
  const department = departments.find(d => d.id === donViId);
  return department ? department.name : "N/A";
};

const getRoleName = (role: string) => {
  for (const typeKey in roleOptions) {
    const found = roleOptions[typeKey as keyof typeof roleOptions].find(r => r.value === role);
    if (found) return found.label;
  }
  return role;
};

const getUserTypeName = (userType: string) => {
  const found = userTypeOptions.find(t => t.value === userType);
  return found ? found.label : userType;
};

export default function Users() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    userType: "SINH_VIEN" as UserType,
    role: "SINH_VIEN" as UserRole,
    donViId: "",
    dateOfBirth: "",
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) || 
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesUserType = !selectedUserType || user.userType === selectedUserType;
    
    return matchesSearch && matchesUserType;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.userType || !newUser.role || !newUser.dateOfBirth) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    
    const password = formatDateOfBirthToPassword(newUser.dateOfBirth);
    
    const newUserWithId = {
      id: String(users.length + 1),
      name: newUser.name,
      email: newUser.email,
      userType: newUser.userType,
      role: newUser.role,
      donViId: newUser.donViId || undefined,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${newUser.name.substring(0, 2)}&backgroundColor=1e88e5`,
    };
    
    setUsers([...users, newUserWithId]);
    setIsAddUserOpen(false);
    setNewUser({
      name: "",
      email: "",
      userType: "SINH_VIEN" as UserType,
      role: "SINH_VIEN" as UserRole,
      donViId: "",
      dateOfBirth: "",
    });
    
    toast.success(`Đã thêm người dùng ${newUser.name} với mật khẩu ${password}`);
  };

  const handleImportComplete = (importedUsers: UserImportRow[]) => {
    const newUsersWithIds = importedUsers.map((user, index) => ({
      id: String(users.length + index + 1),
      name: user.name,
      email: user.email,
      userType: user.userType as UserType,
      role: user.role as UserRole,
      donViId: user.donViId,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name.substring(0, 2)}&backgroundColor=1e88e5`,
    }));
    
    setUsers([...users, ...newUsersWithIds]);
    toast.success(`Đã thêm ${importedUsers.length} người dùng từ file Excel`);
  };

  const handleDeleteUsers = () => {
    if (selectedUsers.length === 0) return;
    
    const remainingUsers = users.filter(user => !selectedUsers.includes(user.id));
    setUsers(remainingUsers);
    setSelectedUsers([]);
    
    toast.success(`Đã xóa ${selectedUsers.length} người dùng`);
  };

  const toggleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Nhập từ Excel
            </Button>
            <Button onClick={() => setIsAddUserOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>
              Quản lý tất cả tài khoản trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center space-x-2 md:w-1/2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, email..."
                      className="pl-10"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Lọc
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => setSelectedUserType(null)}
                          className="flex items-center gap-2"
                        >
                          <UsersIcon className="h-4 w-4" />
                          <span>Tất cả</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedUserType("SINH_VIEN")}
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          <span>Sinh viên</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedUserType("GIANG_VIEN")}
                          className="flex items-center gap-2"
                        >
                          <GraduationCap className="h-4 w-4" />
                          <span>Giảng viên</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedUserType("NHAN_VIEN")}
                          className="flex items-center gap-2"
                        >
                          <Briefcase className="h-4 w-4" />
                          <span>Nhân viên</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {selectedUsers.length > 0 && (
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={handleDeleteUsers}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                          onChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Loại</TableHead>
                      <TableHead className="hidden lg:table-cell">Vai trò</TableHead>
                      <TableHead className="hidden xl:table-cell">Đơn vị</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Không tìm thấy người dùng nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell className="w-12">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                            />
                          </TableCell>
                          <TableCell className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground md:hidden">
                                {user.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">
                              {getUserTypeName(user.userType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {getRoleName(user.role)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {getDepartmentName(user.donViId)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản mới trong hệ thống. Mật khẩu sẽ được tạo dựa trên ngày sinh.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="example@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-of-birth">Ngày sinh (dùng làm mật khẩu mặc định)</Label>
              <Input
                id="date-of-birth"
                type="date"
                value={newUser.dateOfBirth}
                onChange={e => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
              />
              <span className="text-xs text-muted-foreground">
                Mật khẩu sẽ được tạo theo định dạng DDMMYYYY
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-type">Loại người dùng</Label>
              <Select 
                value={newUser.userType} 
                onValueChange={(value: UserType) => {
                  setNewUser({ 
                    ...newUser, 
                    userType: value,
                    // Reset role when user type changes
                    role: roleOptions[value][0].value as UserRole
                  });
                }}
              >
                <SelectTrigger id="user-type">
                  <SelectValue placeholder="Chọn loại người dùng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {userTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roleOptions[newUser.userType].map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Đơn vị (nếu có)</Label>
              <Select 
                value={newUser.donViId} 
                onValueChange={value => setNewUser({ ...newUser, donViId: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không có</SelectItem>
                  {departments.map(department => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddUser}>Thêm người dùng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Users Dialog */}
      <ImportUsersDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={handleImportComplete}
      />
    </DashboardLayout>
  );
}
