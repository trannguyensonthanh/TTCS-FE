
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { School, PlusCircle, Search, Edit, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headId?: string;
  headName?: string;
  establishedDate: string;
  facultyCount: number;
  studentCount: number;
  majorCount: number;
}

// Mock data for departments
const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Khoa Công nghệ thông tin',
    code: 'CNTT',
    description: 'Đào tạo các chuyên ngành về công nghệ thông tin',
    headId: '4',
    headName: 'Phạm Thị D',
    establishedDate: '2005-05-15',
    facultyCount: 25,
    studentCount: 450,
    majorCount: 4,
  },
  {
    id: '2',
    name: 'Khoa Kinh tế',
    code: 'KT',
    description: 'Đào tạo các chuyên ngành về kinh tế và quản trị',
    headId: '6',
    headName: 'Nguyễn Văn G',
    establishedDate: '2004-03-10',
    facultyCount: 18,
    studentCount: 350,
    majorCount: 3,
  },
  {
    id: '3',
    name: 'Khoa Ngoại ngữ',
    code: 'NN',
    description: 'Đào tạo các chuyên ngành về ngôn ngữ',
    headId: '10',
    headName: 'Trần Thị M',
    establishedDate: '2006-09-01',
    facultyCount: 20,
    studentCount: 300,
    majorCount: 2,
  },
  {
    id: '4',
    name: 'Khoa Điện - Điện tử',
    code: 'DĐT',
    description: 'Đào tạo các chuyên ngành về điện, điện tử',
    headId: '11',
    headName: 'Lê Văn N',
    establishedDate: '2008-08-20',
    facultyCount: 22,
    studentCount: 380,
    majorCount: 3,
  },
  {
    id: '5',
    name: 'Khoa Cơ khí',
    code: 'CK',
    description: 'Đào tạo các chuyên ngành về cơ khí',
    headId: '12',
    headName: 'Phạm Văn O',
    establishedDate: '2007-06-15',
    facultyCount: 24,
    studentCount: 400,
    majorCount: 3,
  },
];

export default function Departments() {
  const [departments, setDepartments] = useState(mockDepartments);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý khoa</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm khoa mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách khoa</CardTitle>
            <CardDescription>
              Quản lý các khoa trong trường học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm khoa..."
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
                    <TableHead>Tên khoa</TableHead>
                    <TableHead>Trưởng khoa</TableHead>
                    <TableHead>Số giảng viên</TableHead>
                    <TableHead>Số sinh viên</TableHead>
                    <TableHead>Số ngành</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Không tìm thấy khoa nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <School className="h-4 w-4 text-blue-500" />
                            <span className="ml-2">{dept.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="ml-2">{dept.headName || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{dept.facultyCount}</TableCell>
                        <TableCell>{dept.studentCount}</TableCell>
                        <TableCell>{dept.majorCount}</TableCell>
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
