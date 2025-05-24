
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  ChevronDown,
  UserPlus,
  FileSpreadsheet
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
import ImportUsersDialog from "@/components/users/ImportUsersDialog";
import { toast } from "@/components/ui/sonner";
import { UserImportRow } from "@/lib/excelUtils";

// Mock student data
const mockStudents = [
  {
    id: "1",
    studentId: "SV001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    department: "Công nghệ thông tin",
    year: "2023",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=NVA&backgroundColor=1e88e5"
  },
  {
    id: "2",
    studentId: "SV002",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    department: "Công nghệ thông tin",
    year: "2023",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TTB&backgroundColor=1e88e5"
  },
  {
    id: "3",
    studentId: "SV003",
    name: "Lê Văn C",
    email: "levanc@example.com",
    department: "Kinh tế",
    year: "2022",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=LVC&backgroundColor=1e88e5"
  },
  {
    id: "4",
    studentId: "SV004",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    department: "Ngoại ngữ",
    year: "2021",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=PTD&backgroundColor=1e88e5"
  },
  {
    id: "5",
    studentId: "SV005",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    department: "Công nghệ thông tin",
    year: "2020",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=HVE&backgroundColor=1e88e5"
  },
];

// Mock departments
const departments = [
  "Công nghệ thông tin",
  "Kinh tế",
  "Ngoại ngữ",
  "Điện - Điện tử",
  "Đa phương tiện",
];

// Mock years
const years = ["2020", "2021", "2022", "2023", "2024"];

export default function Students() {
  const [students, setStudents] = useState(mockStudents);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(search.toLowerCase()) || 
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;
    const matchesYear = !selectedYear || student.year === selectedYear;
    
    return matchesSearch && matchesDepartment && matchesYear;
  });

  const handleImportComplete = (importedUsers: UserImportRow[]) => {
    const newStudents = importedUsers
      .filter(user => user.userType === "SINH_VIEN")
      .map((user, index) => ({
        id: String(students.length + index + 1),
        studentId: `SV${String(students.length + index + 1).padStart(3, '0')}`,
        name: user.name,
        email: user.email,
        department: "Công nghệ thông tin", // Default department
        year: "2023", // Default year
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name.substring(0, 2)}&backgroundColor=1e88e5`,
      }));
    
    if (newStudents.length === 0) {
      toast.error("Không có sinh viên nào được import");
      return;
    }
    
    setStudents([...students, ...newStudents]);
    toast.success(`Đã thêm ${newStudents.length} sinh viên từ file Excel`);
  };

  const handleDeleteStudents = () => {
    if (selectedStudents.length === 0) return;
    
    const remainingStudents = students.filter(student => !selectedStudents.includes(student.id));
    setStudents(remainingStudents);
    setSelectedStudents([]);
    
    toast.success(`Đã xóa ${selectedStudents.length} sinh viên`);
  };

  const toggleSelectStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };

  const exportToExcel = () => {
    // In a real app, this would generate and download an Excel file
    toast.success("Đã xuất danh sách sinh viên ra file Excel");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý sinh viên</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Nhập từ Excel
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm sinh viên
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách sinh viên</CardTitle>
            <CardDescription>
              Quản lý thông tin sinh viên trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center space-x-2 md:w-1/2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, mã SV, email..."
                      className="pl-10"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Khoa
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => setSelectedDepartment(null)}
                          className="flex items-center gap-2"
                        >
                          <span>Tất cả</span>
                        </DropdownMenuItem>
                        {departments.map(department => (
                          <DropdownMenuItem
                            key={department}
                            onClick={() => setSelectedDepartment(department)}
                            className="flex items-center gap-2"
                          >
                            <span>{department}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Năm
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => setSelectedYear(null)}
                          className="flex items-center gap-2"
                        >
                          <span>Tất cả</span>
                        </DropdownMenuItem>
                        {years.map(year => (
                          <DropdownMenuItem
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className="flex items-center gap-2"
                          >
                            <span>{year}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {selectedStudents.length > 0 && (
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={handleDeleteStudents}
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
                          checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                          onChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sinh viên</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Mã SV</TableHead>
                      <TableHead className="hidden md:table-cell">Khoa</TableHead>
                      <TableHead className="hidden xl:table-cell">Năm</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Không tìm thấy sinh viên nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="w-12">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleSelectStudent(student.id)}
                            />
                          </TableCell>
                          <TableCell className="flex items-center gap-3">
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground sm:hidden">
                                {student.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {student.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {student.studentId}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {student.department}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Badge variant="outline">
                              {student.year}
                            </Badge>
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
      
      {/*Import Students Dialog */}
      <ImportUsersDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={handleImportComplete}
      />
    </DashboardLayout>
  );
}
