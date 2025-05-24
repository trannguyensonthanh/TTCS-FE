
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
  UserPlus
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

// Mock lecturer data
const mockLecturers = [
  {
    id: "1",
    lecturerId: "GV001",
    name: "TS. Nguyễn Văn X",
    email: "nguyenvanx@example.com",
    department: "Công nghệ thông tin",
    position: "Trưởng bộ môn",
    degree: "Tiến sĩ",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=NVX&backgroundColor=1e88e5"
  },
  {
    id: "2",
    lecturerId: "GV002",
    name: "PGS.TS. Trần Thị Y",
    email: "tranthiy@example.com",
    department: "Công nghệ thông tin",
    position: "Phó khoa",
    degree: "Phó Giáo sư",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TTY&backgroundColor=1e88e5"
  },
  {
    id: "3",
    lecturerId: "GV003",
    name: "TS. Lê Văn Z",
    email: "levanz@example.com",
    department: "Công nghệ thông tin",
    position: "Giảng viên",
    degree: "Tiến sĩ",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=LVZ&backgroundColor=1e88e5"
  },
  {
    id: "4",
    lecturerId: "GV004",
    name: "ThS. Phạm Thị W",
    email: "phamthiw@example.com",
    department: "Kinh tế",
    position: "Giảng viên",
    degree: "Thạc sĩ",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=PTW&backgroundColor=1e88e5"
  },
  {
    id: "5",
    lecturerId: "GV005",
    name: "ThS. Hoàng Văn V",
    email: "hoangvanv@example.com",
    department: "Ngoại ngữ",
    position: "Giảng viên",
    degree: "Thạc sĩ",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=HVV&backgroundColor=1e88e5"
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

// Mock degrees
const degrees = ["Cử nhân", "Thạc sĩ", "Tiến sĩ", "Phó Giáo sư", "Giáo sư"];

export default function Lecturers() {
  const [lecturers, setLecturers] = useState(mockLecturers);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);
  const [selectedLecturers, setSelectedLecturers] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = 
      lecturer.name.toLowerCase().includes(search.toLowerCase()) || 
      lecturer.email.toLowerCase().includes(search.toLowerCase()) ||
      lecturer.lecturerId.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || lecturer.department === selectedDepartment;
    const matchesDegree = !selectedDegree || lecturer.degree === selectedDegree;
    
    return matchesSearch && matchesDepartment && matchesDegree;
  });

  const handleImportComplete = (importedUsers: UserImportRow[]) => {
    const newLecturers = importedUsers
      .filter(user => user.userType === "GIANG_VIEN")
      .map((user, index) => ({
        id: String(lecturers.length + index + 1),
        lecturerId: `GV${String(lecturers.length + index + 1).padStart(3, '0')}`,
        name: user.name,
        email: user.email,
        department: "Công nghệ thông tin", // Default department
        position: "Giảng viên", // Default position
        degree: "Thạc sĩ", // Default degree
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name.substring(0, 2)}&backgroundColor=1e88e5`,
      }));
    
    if (newLecturers.length === 0) {
      toast.error("Không có giảng viên nào được import");
      return;
    }
    
    setLecturers([...lecturers, ...newLecturers]);
    toast.success(`Đã thêm ${newLecturers.length} giảng viên từ file Excel`);
  };

  const handleDeleteLecturers = () => {
    if (selectedLecturers.length === 0) return;
    
    const remainingLecturers = lecturers.filter(lecturer => !selectedLecturers.includes(lecturer.id));
    setLecturers(remainingLecturers);
    setSelectedLecturers([]);
    
    toast.success(`Đã xóa ${selectedLecturers.length} giảng viên`);
  };

  const toggleSelectLecturer = (lecturerId: string) => {
    if (selectedLecturers.includes(lecturerId)) {
      setSelectedLecturers(selectedLecturers.filter(id => id !== lecturerId));
    } else {
      setSelectedLecturers([...selectedLecturers, lecturerId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLecturers.length === filteredLecturers.length) {
      setSelectedLecturers([]);
    } else {
      setSelectedLecturers(filteredLecturers.map(lecturer => lecturer.id));
    }
  };

  const exportToExcel = () => {
    // In a real app, this would generate and download an Excel file
    toast.success("Đã xuất danh sách giảng viên ra file Excel");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý giảng viên</h1>
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
              Thêm giảng viên
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Danh sách giảng viên</CardTitle>
            <CardDescription>
              Quản lý thông tin giảng viên trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center space-x-2 md:w-1/2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên, mã GV, email..."
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
                        Học vị
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => setSelectedDegree(null)}
                          className="flex items-center gap-2"
                        >
                          <span>Tất cả</span>
                        </DropdownMenuItem>
                        {degrees.map(degree => (
                          <DropdownMenuItem
                            key={degree}
                            onClick={() => setSelectedDegree(degree)}
                            className="flex items-center gap-2"
                          >
                            <span>{degree}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {selectedLecturers.length > 0 && (
                    <Button 
                      variant="destructive"
                      size="icon"
                      onClick={handleDeleteLecturers}
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
                          checked={filteredLecturers.length > 0 && selectedLecturers.length === filteredLecturers.length}
                          onChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Giảng viên</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="hidden lg:table-cell">Mã GV</TableHead>
                      <TableHead className="hidden md:table-cell">Khoa</TableHead>
                      <TableHead className="hidden xl:table-cell">Học vị</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLecturers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Không tìm thấy giảng viên nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLecturers.map(lecturer => (
                        <TableRow key={lecturer.id}>
                          <TableCell className="w-12">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={selectedLecturers.includes(lecturer.id)}
                              onChange={() => toggleSelectLecturer(lecturer.id)}
                            />
                          </TableCell>
                          <TableCell className="flex items-center gap-3">
                            <img
                              src={lecturer.avatarUrl}
                              alt={lecturer.name}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{lecturer.name}</p>
                              <p className="text-sm text-muted-foreground sm:hidden">
                                {lecturer.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {lecturer.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {lecturer.lecturerId}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {lecturer.department}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Badge variant="outline" className={
                              lecturer.degree === 'Tiến sĩ' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              lecturer.degree === 'Phó Giáo sư' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              lecturer.degree === 'Giáo sư' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                              ''
                            }>
                              {lecturer.degree}
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
      
      {/* Import Lecturers Dialog */}
      <ImportUsersDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportComplete={handleImportComplete}
      />
    </DashboardLayout>
  );
}
