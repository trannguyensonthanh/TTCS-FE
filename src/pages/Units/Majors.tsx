
import React, { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, PlusCircle, Search, Edit, Trash2, School } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Major {
  id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  departmentName: string;
  degreeLevel: 'CU_NHAN' | 'KY_SU' | 'THAC_SI' | 'TIEN_SI';
  studentCount: number;
  classCount: number;
  established: string;
}

// Mock data for majors
const mockMajors: Major[] = [
  {
    id: '1',
    name: 'Kỹ thuật phần mềm',
    code: 'KTPM',
    description: 'Chuyên ngành đào tạo kỹ sư phần mềm',
    departmentId: '1',
    departmentName: 'Khoa Công nghệ thông tin',
    degreeLevel: 'KY_SU',
    studentCount: 200,
    classCount: 5,
    established: '2010-08-15',
  },
  {
    id: '2',
    name: 'Khoa học máy tính',
    code: 'KHMT',
    description: 'Chuyên ngành đào tạo về khoa học máy tính',
    departmentId: '1',
    departmentName: 'Khoa Công nghệ thông tin',
    degreeLevel: 'CU_NHAN',
    studentCount: 180,
    classCount: 4,
    established: '2008-09-10',
  },
  {
    id: '3',
    name: 'Hệ thống thông tin',
    code: 'HTTT',
    description: 'Chuyên ngành đào tạo về hệ thống thông tin',
    departmentId: '1',
    departmentName: 'Khoa Công nghệ thông tin',
    degreeLevel: 'CU_NHAN',
    studentCount: 150,
    classCount: 4,
    established: '2012-08-20',
  },
  {
    id: '4',
    name: 'Kế toán',
    code: 'KT',
    description: 'Chuyên ngành đào tạo về kế toán',
    departmentId: '2',
    departmentName: 'Khoa Kinh tế',
    degreeLevel: 'CU_NHAN',
    studentCount: 160,
    classCount: 4,
    established: '2009-08-15',
  },
  {
    id: '5',
    name: 'Quản trị kinh doanh',
    code: 'QTKD',
    description: 'Chuyên ngành đào tạo về quản trị kinh doanh',
    departmentId: '2',
    departmentName: 'Khoa Kinh tế',
    degreeLevel: 'CU_NHAN',
    studentCount: 190,
    classCount: 5,
    established: '2007-09-01',
  },
];

export default function Majors() {
  const [majors, setMajors] = useState(mockMajors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);

  const filteredMajors = majors.filter(major => {
    const matchesSearch = 
      major.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      major.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || major.departmentId === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getDegreeName = (degreeLevel: string) => {
    switch (degreeLevel) {
      case 'CU_NHAN': return 'Cử nhân';
      case 'KY_SU': return 'Kỹ sư';
      case 'THAC_SI': return 'Thạc sĩ';
      case 'TIEN_SI': return 'Tiến sĩ';
      default: return degreeLevel;
    }
  };

  const getDegreeBadgeColor = (degreeLevel: string) => {
    switch (degreeLevel) {
      case 'CU_NHAN': return 'bg-blue-100 text-blue-800';
      case 'KY_SU': return 'bg-green-100 text-green-800';
      case 'THAC_SI': return 'bg-purple-100 text-purple-800';
      case 'TIEN_SI': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique departments for filtering
  const departments = Array.from(
    new Set(majors.map(major => major.departmentId))
  ).map(departmentId => {
    const department = majors.find(major => major.departmentId === departmentId);
    return {
      id: departmentId,
      name: department?.departmentName || 'Unknown'
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold">Quản lý ngành học</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm ngành mới
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách ngành học</CardTitle>
            <CardDescription>
              Quản lý các ngành đào tạo trong trường học
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filterDepartment === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterDepartment(null)}
                >
                  Tất cả
                </Button>
                {departments.map(department => (
                  <Button 
                    key={department.id}
                    variant={filterDepartment === department.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterDepartment(department.id)}
                  >
                    <School className="mr-2 h-4 w-4" />
                    {department.name}
                  </Button>
                ))}
              </div>
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm ngành học..."
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
                    <TableHead>Tên ngành</TableHead>
                    <TableHead>Khoa</TableHead>
                    <TableHead>Bậc đào tạo</TableHead>
                    <TableHead>Sinh viên</TableHead>
                    <TableHead>Lớp</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMajors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Không tìm thấy ngành học nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMajors.map((major) => (
                      <TableRow key={major.id}>
                        <TableCell className="font-medium">{major.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 text-purple-500" />
                            <span className="ml-2">{major.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{major.departmentName}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getDegreeBadgeColor(major.degreeLevel)}>
                            {getDegreeName(major.degreeLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell>{major.studentCount}</TableCell>
                        <TableCell>{major.classCount}</TableCell>
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
