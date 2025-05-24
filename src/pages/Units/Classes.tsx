
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { GraduationCap, PlusCircle, Search, Edit, Trash2, BookOpen, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Class {
  id: string;
  name: string;
  code: string;
  majorId: string;
  majorName: string;
  departmentId: string;
  departmentName: string;
  advisorId?: string;
  advisorName?: string;
  startYear: number;
  endYear: number;
  studentCount: number;
  active: boolean;
}

// Mock data for classes
const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Lớp KTPM01',
    code: 'KTPM01',
    majorId: '1',
    majorName: 'Kỹ thuật phần mềm',
    departmentId: '1',
    departmentName: 'Khoa Công nghệ thông tin',
    advisorId: '3',
    advisorName: 'Lê Văn C',
    startYear: 2022,
    endYear: 2026,
    studentCount: 40,
    active: true,
  },
  {
    id: '2',
    name: 'Lớp KTPM02',
    code: 'KTPM02',
    majorId: '1',
    majorName: 'Kỹ thuật phần mềm',
    departmentId: '1',
    departmentName: 'Khoa Công nghệ thông tin',
    advisorId: '4',
    advisorName: 'Phạm Thị D',
    startYear: 2022,
    endYear: 2026,
    studentCount: 45,
    active: true,
  },
  {
    id: '3',
    name: 'Lớp KHMT01',
    code: 'KHMT01',
    majorId: '2',
    majorName: 'Khoa học máy tính',
    departmentId: '1',
    departmentName: 'Khoa Công nghệ thông tin',
    advisorId: '11',
    advisorName: 'Lê Văn N',
    startYear: 2021,
    endYear: 2025,
    studentCount: 42,
    active: true,
  },
  {
    id: '4',
    name: 'Lớp KHMT02',
    code: 'KHMT02',
    majorId: '2',
    majorName: 'Khoa học máy tính',
    departmentId: '1',
    departmentName: 'Khoa Công nghệ thông tin',
    advisorId: '12',
    advisorName: 'Phạm Văn O',
    startYear: 2021,
    endYear: 2025,
    studentCount: 38,
    active: true,
  },
  {
    id: '5',
    name: 'Lớp QTKD01',
    code: 'QTKD01',
    majorId: '5',
    majorName: 'Quản trị kinh doanh',
    departmentId: '2',
    departmentName: 'Khoa Kinh tế',
    advisorId: '6',
    advisorName: 'Nguyễn Văn G',
    startYear: 2023,
    endYear: 2027,
    studentCount: 50,
    active: true,
  },
];

export default function Classes() {
  const [classes, setClasses] = useState(mockClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMajor, setFilterMajor] = useState<string | null>(null);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cls.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMajor = !filterMajor || cls.majorId === filterMajor;
    
    return matchesSearch && matchesMajor;
  });

  // Get unique majors for filtering
  const majors = Array.from(
    new Set(classes.map(cls => cls.majorId))
  ).map(majorId => {
    const cls = classes.find(c => c.majorId === majorId);
    return {
      id: majorId,
      name: cls?.majorName || 'Unknown'
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý lớp học</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm lớp mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách lớp học</CardTitle>
            <CardDescription>
              Quản lý các lớp học trong trường
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterMajor === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterMajor(null)}
                >
                  Tất cả
                </Button>
                {majors.map(major => (
                  <Button 
                    key={major.id}
                    variant={filterMajor === major.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterMajor(major.id)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    {major.name}
                  </Button>
                ))}
              </div>
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm lớp học..."
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
                    <TableHead>Tên lớp</TableHead>
                    <TableHead>Ngành</TableHead>
                    <TableHead>GVCN</TableHead>
                    <TableHead>Khóa</TableHead>
                    <TableHead>Sinh viên</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Không tìm thấy lớp học nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 text-yellow-500" />
                            <span className="ml-2">{cls.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{cls.majorName}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="ml-2">{cls.advisorName || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{`${cls.startYear} - ${cls.endYear}`}</TableCell>
                        <TableCell>{cls.studentCount}</TableCell>
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
