
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Users, PlusCircle, Search, Edit, Trash2, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UnionUnit {
  id: string;
  name: string;
  code: string;
  description: string;
  headId?: string;
  headName?: string;
  parentId?: string;
  parentName?: string;
  establishedDate: string;
  memberCount: number;
  level: 'TRUONG' | 'KHOA' | 'LOP';
}

// Mock data for union units
const mockUnionUnits: UnionUnit[] = [
  {
    id: '1',
    name: 'Đoàn thanh niên trường',
    code: 'DTN-TRUONG',
    description: 'Tổ chức Đoàn TNCS Hồ Chí Minh cấp trường',
    headId: '7',
    headName: 'Lê Thị H',
    establishedDate: '2000-01-01',
    memberCount: 2000,
    level: 'TRUONG',
  },
  {
    id: '2',
    name: 'Liên chi đoàn Khoa CNTT',
    code: 'LCD-CNTT',
    description: 'Liên chi đoàn Khoa Công nghệ thông tin',
    headId: '18',
    headName: 'Nguyễn Văn T',
    parentId: '1',
    parentName: 'Đoàn thanh niên trường',
    establishedDate: '2005-09-15',
    memberCount: 450,
    level: 'KHOA',
  },
  {
    id: '3',
    name: 'Liên chi đoàn Khoa Kinh tế',
    code: 'LCD-KT',
    description: 'Liên chi đoàn Khoa Kinh tế',
    headId: '19',
    headName: 'Trần Thị U',
    parentId: '1',
    parentName: 'Đoàn thanh niên trường',
    establishedDate: '2006-09-15',
    memberCount: 350,
    level: 'KHOA',
  },
  {
    id: '4',
    name: 'Chi đoàn KTPM01',
    code: 'CD-KTPM01',
    description: 'Chi đoàn lớp KTPM01',
    headId: '9',
    headName: 'Hoàng Văn L',
    parentId: '2',
    parentName: 'Liên chi đoàn Khoa CNTT',
    establishedDate: '2022-09-05',
    memberCount: 35,
    level: 'LOP',
  },
  {
    id: '5',
    name: 'Chi đoàn KTPM02',
    code: 'CD-KTPM02',
    description: 'Chi đoàn lớp KTPM02',
    headId: '20',
    headName: 'Lê Văn V',
    parentId: '2',
    parentName: 'Liên chi đoàn Khoa CNTT',
    establishedDate: '2022-09-05',
    memberCount: 40,
    level: 'LOP',
  },
];

export default function Union() {
  const [unionUnits, setUnionUnits] = useState(mockUnionUnits);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUnits = unionUnits.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    unit.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelName = (level: string) => {
    switch (level) {
      case 'TRUONG': return 'Cấp trường';
      case 'KHOA': return 'Cấp khoa';
      case 'LOP': return 'Cấp lớp';
      default: return level;
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'TRUONG': return 'bg-red-100 text-red-800';
      case 'KHOA': return 'bg-blue-100 text-blue-800';
      case 'LOP': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý đoàn thanh niên</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm đơn vị đoàn mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách đơn vị đoàn</CardTitle>
            <CardDescription>
              Quản lý các đơn vị đoàn thanh niên trong trường học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm đơn vị đoàn..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Mã</TableHead>
                    <TableHead>Tên đơn vị</TableHead>
                    <TableHead>Bí thư</TableHead>
                    <TableHead>Cấp</TableHead>
                    <TableHead>Đơn vị trực thuộc</TableHead>
                    <TableHead>Thành viên</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
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
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="ml-2">{unit.headName || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getLevelBadgeColor(unit.level)}>
                            {getLevelName(unit.level)}
                          </Badge>
                        </TableCell>
                        <TableCell>{unit.parentName || '-'}</TableCell>
                        <TableCell>{unit.memberCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
