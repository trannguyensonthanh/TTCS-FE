
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Shield, UserCheck, Search, Eye, Plus, PenSquare, Trash, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Permission {
  view: string[];
  create: string[];
  edit: string[];
  delete: string[];
  approve: string[];
}

interface RoleDisplay {
  id: UserRole;
  name: string;
  description: string;
  userType: UserType;
  permissions: Permission;
  userCount: number;
}

type UserRole = "ADMIN_HE_THONG" | "CB_TO_CHUC_SU_KIEN" | "QUAN_LY_CSVC" | "TRUONG_KHOA" | "TRUONG_CLB" | "BI_THU_DOAN" | "BGH_DUYET_SK_TRUONG";
type UserType = "SINH_VIEN" | "GIANG_VIEN" | "NHAN_VIEN";

const mockRoles: RoleDisplay[] = [
  {
    id: "ADMIN_HE_THONG",
    name: "Admin hệ thống",
    description: "Quyền quản trị cao nhất trong hệ thống",
    userType: "NHAN_VIEN",
    permissions: {
      view: ["ALL"],
      create: ["ALL"],
      edit: ["ALL"],
      delete: ["ALL"],
      approve: ["ALL"]
    },
    userCount: 2
  },
  {
    id: "CB_TO_CHUC_SU_KIEN",
    name: "Cán bộ tổ chức sự kiện",
    description: "Quyền tổ chức và quản lý sự kiện",
    userType: "NHAN_VIEN",
    permissions: {
      view: ["EVENT"],
      create: ["EVENT"],
      edit: ["EVENT"],
      delete: ["EVENT"],
      approve: ["EVENT"]
    },
    userCount: 5
  },
  {
    id: "QUAN_LY_CSVC",
    name: "Quản lý cơ sở vật chất",
    description: "Quyền quản lý và bảo trì cơ sở vật chất",
    userType: "NHAN_VIEN",
    permissions: {
      view: ["FACILITY"],
      create: ["FACILITY"],
      edit: ["FACILITY"],
      delete: ["FACILITY"],
      approve: ["FACILITY"]
    },
    userCount: 3
  },
  {
    id: "TRUONG_KHOA",
    name: "Trưởng khoa",
    description: "Quyền quản lý khoa",
    userType: "GIANG_VIEN",
    permissions: {
      view: ["STUDENT", "LECTURER"],
      create: [],
      edit: ["STUDENT", "LECTURER"],
      delete: ["STUDENT", "LECTURER"],
      approve: []
    },
    userCount: 10
  },
  {
    id: "TRUONG_CLB",
    name: "Chủ nhiệm câu lạc bộ",
    description: "Quyền quản lý câu lạc bộ",
    userType: "SINH_VIEN",
    permissions: {
      view: ["STUDENT"],
      create: [],
      edit: ["STUDENT"],
      delete: ["STUDENT"],
      approve: []
    },
    userCount: 7
  },
  {
    id: "BI_THU_DOAN",
    name: "Bí thư đoàn",
    description: "Quyền quản lý đoàn thanh niên",
    userType: "SINH_VIEN",
    permissions: {
      view: ["STUDENT", "UNION_MEMBER"],
      create: ["EVENT_UNION"],
      edit: ["STUDENT", "UNION_MEMBER"],
      delete: [],
      approve: ["EVENT_UNION"]
    },
    userCount: 8
  },
  {
    id: "BGH_DUYET_SK_TRUONG",
    name: "Ban giám hiệu duyệt sự kiện trường",
    description: "Quyền duyệt sự kiện cấp trường",
    userType: "NHAN_VIEN",
    permissions: {
      view: ["EVENT"],
      create: [],
      edit: [],
      delete: [],
      approve: ["EVENT"]
    },
    userCount: 1
  }
];

const getUserTypeName = (type: UserType) => {
  switch(type) {
    case 'SINH_VIEN': return 'Sinh viên';
    case 'GIANG_VIEN': return 'Giảng viên';
    case 'NHAN_VIEN': return 'Nhân viên';
    default: return type;
  }
};

const getPermissionsCount = (permissions: Permission) => {
  let count = 0;
  Object.values(permissions).forEach(permArr => {
    count += permArr.length;
  });
  return count;
};

const Roles = () => {
  const [roles, setRoles] = useState<RoleDisplay[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleDisplay | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPermissions = (role: RoleDisplay) => {
    setSelectedRole(role);
    setShowPermissions(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý vai trò</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm vai trò mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách vai trò</CardTitle>
            <CardDescription>
              Quản lý các vai trò và phân quyền trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm vai trò..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="sinh-vien">Sinh viên</TabsTrigger>
                <TabsTrigger value="giang-vien">Giảng viên</TabsTrigger>
                <TabsTrigger value="nhan-vien">Nhân viên</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Vai trò</TableHead>
                        <TableHead className="w-[120px]">Loại người dùng</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="w-[120px]">Số quyền</TableHead>
                        <TableHead className="w-[100px]">Người dùng</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Không tìm thấy vai trò nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                                <div>
                                  <div className="font-medium">{role.name}</div>
                                  <div className="text-sm text-muted-foreground">{role.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-100">
                                {getUserTypeName(role.userType)}
                              </Badge>
                            </TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell className="text-center">{getPermissionsCount(role.permissions)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <UserCheck className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{role.userCount}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Dialog open={showPermissions && selectedRole?.id === role.id} onOpenChange={(open) => !open && setShowPermissions(false)}>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleViewPermissions(role)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>{selectedRole?.name} - Phân quyền</DialogTitle>
                                      <DialogDescription>
                                        Danh sách các quyền của vai trò {selectedRole?.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    {selectedRole && (
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Quyền xem:</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedRole.permissions.view.length === 0 ? (
                                              <Badge variant="outline">Không có quyền</Badge>
                                            ) : selectedRole.permissions.view.map((perm, idx) => (
                                              <Badge key={`view-${idx}`} variant="outline" className="bg-blue-50 text-blue-700">
                                                {perm === 'ALL' ? 'Tất cả' : perm}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Quyền tạo mới:</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedRole.permissions.create.length === 0 ? (
                                              <Badge variant="outline">Không có quyền</Badge>
                                            ) : selectedRole.permissions.create.map((perm, idx) => (
                                              <Badge key={`create-${idx}`} variant="outline" className="bg-green-50 text-green-700">
                                                {perm === 'ALL' ? 'Tất cả' : perm}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Quyền chỉnh sửa:</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedRole.permissions.edit.length === 0 ? (
                                              <Badge variant="outline">Không có quyền</Badge>
                                            ) : selectedRole.permissions.edit.map((perm, idx) => (
                                              <Badge key={`edit-${idx}`} variant="outline" className="bg-yellow-50 text-yellow-700">
                                                {perm === 'ALL' ? 'Tất cả' : perm}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Quyền xóa:</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedRole.permissions.delete.length === 0 ? (
                                              <Badge variant="outline">Không có quyền</Badge>
                                            ) : selectedRole.permissions.delete.map((perm, idx) => (
                                              <Badge key={`delete-${idx}`} variant="outline" className="bg-red-50 text-red-700">
                                                {perm === 'ALL' ? 'Tất cả' : perm}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <h4 className="font-medium">Quyền phê duyệt:</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedRole.permissions.approve.length === 0 ? (
                                              <Badge variant="outline">Không có quyền</Badge>
                                            ) : selectedRole.permissions.approve.map((perm, idx) => (
                                              <Badge key={`approve-${idx}`} variant="outline" className="bg-purple-50 text-purple-700">
                                                {perm === 'ALL' ? 'Tất cả' : perm}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setShowPermissions(false)}>
                                        Đóng
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon">
                                  <PenSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="sinh-vien">
                <div className="rounded-md border">
                  <Table>
                    {/* Similar structure to "all" tab but filtered for student roles */}
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Vai trò</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="w-[120px]">Số quyền</TableHead>
                        <TableHead className="w-[100px]">Người dùng</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.filter(role => role.userType === 'SINH_VIEN').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Không tìm thấy vai trò nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRoles.filter(role => role.userType === 'SINH_VIEN').map((role) => (
                          <TableRow key={role.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                                <div>
                                  <div className="font-medium">{role.name}</div>
                                  <div className="text-sm text-muted-foreground">{role.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell className="text-center">{getPermissionsCount(role.permissions)}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <UserCheck className="h-4 w-4 mr-1 text-gray-500" />
                                <span>{role.userCount}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {/* Same actions as in "all" tab */}
                                <Button variant="ghost" size="icon" onClick={() => handleViewPermissions(role)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <PenSquare className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="giang-vien">
                {/* Similar structure to sinh-vien tab but for faculty roles */}
              </TabsContent>
              
              <TabsContent value="nhan-vien">
                {/* Similar structure to sinh-vien tab but for staff roles */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Roles;
