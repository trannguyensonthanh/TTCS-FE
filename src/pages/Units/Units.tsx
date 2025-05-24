import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Building, PlusCircle, Search, Edit, Trash2, School, Users, BookOpen, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

interface Unit {
  id: string;
  name: string;
  code: string;
  type: 'KHOA' | 'CLB' | 'DOAN' | 'NGANH' | 'LOP';
  description: string;
  headId?: string;
  headName?: string;
  parentId?: string;
  parentName?: string;
  memberCount: number;
}

// Mock data for units
const mockUnits: Unit[] = [
  {
    id: '1',
    name: 'Khoa Công nghệ thông tin',
    code: 'CNTT',
    type: 'KHOA',
    description: 'Đào tạo các chuyên ngành về công nghệ thông tin',
    headId: '4',
    headName: 'Phạm Thị D',
    memberCount: 450,
  },
  {
    id: '2',
    name: 'Khoa Kinh tế',
    code: 'KT',
    type: 'KHOA',
    description: 'Đào tạo các chuyên ngành về kinh tế và quản trị',
    headId: '6',
    headName: 'Nguyễn Văn G',
    memberCount: 350,
  },
  {
    id: '3',
    name: 'CLB IT',
    code: 'CLB-IT',
    type: 'CLB',
    description: 'Câu lạc bộ về công nghệ thông tin',
    headId: '2',
    headName: 'Trần Thị B',
    parentId: '1',
    parentName: 'Khoa Công nghệ thông tin',
    memberCount: 45,
  },
  {
    id: '4',
    name: 'Đoàn thanh niên trường',
    code: 'DTN',
    type: 'DOAN',
    description: 'Tổ chức Đoàn TNCS Hồ Chí Minh cấp trường',
    headId: '7',
    headName: 'Lê Thị H',
    memberCount: 200,
  },
  {
    id: '5',
    name: 'Ngành Kỹ thuật phần mềm',
    code: 'KTPM',
    type: 'NGANH',
    description: 'Chuyên ngành đào tạo kỹ sư phần mềm',
    parentId: '1',
    parentName: 'Khoa Công nghệ thông tin',
    memberCount: 200,
  },
  {
    id: '6',
    name: 'Lớp KTPM01',
    code: 'KTPM01',
    type: 'LOP',
    description: 'Lớp kỹ thuật phần mềm khóa 2022',
    parentId: '5',
    parentName: 'Ngành Kỹ thuật phần mềm',
    memberCount: 40,
  },
  {
    id: '7',
    name: 'CLB Nhạc cụ dân tộc',
    code: 'CLB-NCDT',
    type: 'CLB',
    description: 'Câu lạc bộ về âm nhạc dân tộc',
    headId: '8',
    headName: 'Đinh Văn K',
    parentId: '4',
    parentName: 'Đoàn thanh niên trường',
    memberCount: 30,
  },
  {
    id: '8',
    name: 'Chi đoàn KTPM01',
    code: 'CD-KTPM01',
    type: 'DOAN',
    description: 'Chi đoàn lớp KTPM01',
    headId: '9',
    headName: 'Hoàng Văn L',
    parentId: '4',
    parentName: 'Đoàn thanh niên trường',
    memberCount: 35,
  }
];

export default function Units() {
  const [units, setUnits] = useState(mockUnits);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredUnits = units.filter(unit => {
    // Filter by search term
    const matchesSearch = 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      unit.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab
    const matchesTab = activeTab === 'all' || unit.type.toLowerCase() === activeTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case 'KHOA': return <School className="h-4 w-4 text-blue-500" />;
      case 'CLB': return <Users className="h-4 w-4 text-green-500" />;
      case 'DOAN': return <Users className="h-4 w-4 text-red-500" />;
      case 'NGANH': return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'LOP': return <GraduationCap className="h-4 w-4 text-yellow-500" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getUnitTypeName = (type: string) => {
    switch (type) {
      case 'KHOA': return 'Khoa';
      case 'CLB': return 'Câu lạc bộ';
      case 'DOAN': return 'Đoàn';
      case 'NGANH': return 'Ngành';
      case 'LOP': return 'Lớp';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'KHOA': return 'bg-blue-100 text-blue-800';
      case 'CLB': return 'bg-green-100 text-green-800';
      case 'DOAN': return 'bg-red-100 text-red-800';
      case 'NGANH': return 'bg-purple-100 text-purple-800';
      case 'LOP': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý đơn vị</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm đơn vị mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách đơn vị</CardTitle>
            <CardDescription>
              Quản lý tất cả các đơn vị trong trường học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs onValueChange={setActiveTab} defaultValue="all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="khoa">Khoa</TabsTrigger>
                  <TabsTrigger value="clb">CLB</TabsTrigger>
                  <TabsTrigger value="doan">Đoàn</TabsTrigger>
                  <TabsTrigger value="nganh">Ngành</TabsTrigger>
                  <TabsTrigger value="lop">Lớp</TabsTrigger>
                </TabsList>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm đơn vị..."
                    className="w-full md:w-[300px] pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã</TableHead>
                        <TableHead>Tên đơn vị</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Trưởng đơn vị</TableHead>
                        <TableHead>Đơn vị cha</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Không tìm thấy đơn vị nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.code}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getUnitTypeIcon(unit.type)}
                                <span className="ml-2">{unit.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={getTypeBadgeColor(unit.type)}>
                                {getUnitTypeName(unit.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{unit.headName || '-'}</TableCell>
                            <TableCell>{unit.parentName || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/units/${unit.type.toLowerCase()}/${unit.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
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

              {/* Other tabs have the same content structure with filtered data */}
              <TabsContent value="khoa" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    {/* Same table structure */}
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã</TableHead>
                        <TableHead>Tên khoa</TableHead>
                        <TableHead>Trưởng khoa</TableHead>
                        <TableHead>Số lượng thành viên</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Không tìm thấy khoa nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.code}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <School className="h-4 w-4 text-blue-500" />
                                <span className="ml-2">{unit.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{unit.headName || '-'}</TableCell>
                            <TableCell>{unit.memberCount}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/units/departments/${unit.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
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

              <TabsContent value="clb" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã</TableHead>
                        <TableHead>Tên CLB</TableHead>
                        <TableHead>Chủ nhiệm</TableHead>
                        <TableHead>Đơn vị quản lý</TableHead>
                        <TableHead>Số lượng thành viên</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Không tìm thấy CLB nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.code}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-green-500" />
                                <span className="ml-2">{unit.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{unit.headName || '-'}</TableCell>
                            <TableCell>{unit.parentName || '-'}</TableCell>
                            <TableCell>{unit.memberCount}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/units/clubs/${unit.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
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

              <TabsContent value="doan" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã</TableHead>
                        <TableHead>Tên đơn vị đoàn</TableHead>
                        <TableHead>Bí thư</TableHead>
                        <TableHead>Đơn vị trực thuộc</TableHead>
                        <TableHead>Số lượng thành viên</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Không tìm thấy đơn vị đoàn nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.code}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-red-500" />
                                <span className="ml-2">{unit.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{unit.headName || '-'}</TableCell>
                            <TableCell>{unit.parentName || '-'}</TableCell>
                            <TableCell>{unit.memberCount}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/units/union/${unit.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
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

              <TabsContent value="nganh" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã</TableHead>
                        <TableHead>Tên ngành</TableHead>
                        <TableHead>Khoa</TableHead>
                        <TableHead>Số lượng sinh viên</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Không tìm thấy ngành nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.code}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-purple-500" />
                                <span className="ml-2">{unit.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{unit.parentName || '-'}</TableCell>
                            <TableCell>{unit.memberCount}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/units/majors/${unit.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
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

              <TabsContent value="lop" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Mã</TableHead>
                        <TableHead>Tên lớp</TableHead>
                        <TableHead>Ngành</TableHead>
                        <TableHead>Số lượng sinh viên</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Không tìm thấy lớp nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.code}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <GraduationCap className="h-4 w-4 text-yellow-500" />
                                <span className="ml-2">{unit.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{unit.parentName || '-'}</TableCell>
                            <TableCell>{unit.memberCount}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link to={`/units/classes/${unit.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
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
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
