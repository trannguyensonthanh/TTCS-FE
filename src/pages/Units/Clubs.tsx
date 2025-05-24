import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Users, PlusCircle, Search, Edit, Trash2, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Club {
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
  active: boolean;
}

// Mock data for clubs
const mockClubs: Club[] = [
  {
    id: '1',
    name: 'CLB IT',
    code: 'CLB-IT',
    description: 'Câu lạc bộ về công nghệ thông tin',
    headId: '2',
    headName: 'Trần Thị B',
    parentId: '1',
    parentName: 'Khoa Công nghệ thông tin',
    establishedDate: '2018-09-15',
    memberCount: 45,
    active: true,
  },
  {
    id: '2',
    name: 'CLB Nhạc cụ dân tộc',
    code: 'CLB-NCDT',
    description: 'Câu lạc bộ về âm nhạc dân tộc',
    headId: '8',
    headName: 'Đinh Văn K',
    parentId: '4',
    parentName: 'Đoàn thanh niên trường',
    establishedDate: '2019-02-20',
    memberCount: 30,
    active: true,
  },
  {
    id: '3',
    name: 'CLB Tiếng Anh',
    code: 'CLB-TA',
    description: 'Câu lạc bộ thực hành tiếng Anh',
    headId: '15',
    headName: 'Lê Thị Q',
    parentId: '3',
    parentName: 'Khoa Ngoại ngữ',
    establishedDate: '2017-10-25',
    memberCount: 60,
    active: true,
  },
  {
    id: '4',
    name: 'CLB Kỹ năng mềm',
    code: 'CLB-KNM',
    description: 'Câu lạc bộ phát triển kỹ năng mềm',
    headId: '16',
    headName: 'Nguyễn Văn R',
    parentId: '4',
    parentName: 'Đoàn thanh niên trường',
    establishedDate: '2020-01-10',
    memberCount: 40,
    active: true,
  },
  {
    id: '5',
    name: 'CLB Võ thuật',
    code: 'CLB-VT',
    description: 'Câu lạc bộ về các bộ môn võ thuật',
    headId: '17',
    headName: 'Phạm Thị S',
    parentId: '4',
    parentName: 'Đoàn thanh niên trường',
    establishedDate: '2016-11-05',
    memberCount: 35,
    active: false,
  },
];

export default function Clubs() {
  const [clubs, setClubs] = useState(mockClubs);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    club.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý câu lạc bộ</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm CLB mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách câu lạc bộ</CardTitle>
            <CardDescription>
              Quản lý các câu lạc bộ trong trường học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm câu lạc bộ..."
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
                    <TableHead>Tên CLB</TableHead>
                    <TableHead>Chủ nhiệm</TableHead>
                    <TableHead>Đơn vị quản lý</TableHead>
                    <TableHead>Thành viên</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Không tìm thấy câu lạc bộ nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClubs.map((club) => (
                      <TableRow key={club.id}>
                        <TableCell className="font-medium">{club.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="ml-2">{club.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="ml-2">{club.headName || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{club.parentName || '-'}</TableCell>
                        <TableCell>{club.memberCount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={club.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {club.active ? "Hoạt động" : "Tạm ngưng"}
                          </Badge>
                        </TableCell>
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
