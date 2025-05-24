
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  User,
  Award
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/context/AuthContext";

// Mock data
const departmentName = "Công Nghệ Thông Tin";

const studentsByClass = [
  { name: "Năm 1", value: 185 },
  { name: "Năm 2", value: 167 },
  { name: "Năm 3", value: 145 },
  { name: "Năm 4", value: 138 },
  { name: "Năm 5", value: 26 },
];

const studentGenderData = [
  { name: "Nam", value: 372 },
  { name: "Nữ", value: 289 },
];

const gpaDistribution = [
  { name: "Xuất sắc", value: 87 },
  { name: "Giỏi", value: 165 },
  { name: "Khá", value: 254 },
  { name: "Trung bình", value: 123 },
  { name: "Yếu", value: 32 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const GENDER_COLORS = ["#0088FE", "#FF6492"];

const topStudents = [
  { id: 1, name: "Nguyễn Văn A", studentId: "SV12345", className: "CNTT2023", gpa: 3.92 },
  { id: 2, name: "Trần Thị B", studentId: "SV12346", className: "CNTT2023", gpa: 3.89 },
  { id: 3, name: "Lê Văn C", studentId: "SV12347", className: "CNTT2022", gpa: 3.85 },
  { id: 4, name: "Phạm Thị D", studentId: "SV12348", className: "CNTT2022", gpa: 3.82 },
  { id: 5, name: "Hoàng Văn E", studentId: "SV12349", className: "CNTT2021", gpa: 3.81 },
  { id: 6, name: "Đặng Thị F", studentId: "SV12350", className: "CNTT2021", gpa: 3.80 },
  { id: 7, name: "Vũ Văn G", studentId: "SV12351", className: "CNTT2020", gpa: 3.79 },
];

const lecturersByRank = [
  { name: "Giáo sư", value: 2 },
  { name: "Phó Giáo sư", value: 5 },
  { name: "Tiến sĩ", value: 15 },
  { name: "Thạc sĩ", value: 23 },
  { name: "Cử nhân", value: 4 },
];

const eventData = [
  { month: "T1", events: 3 },
  { month: "T2", events: 2 },
  { month: "T3", events: 4 },
  { month: "T4", events: 5 },
  { month: "T5", events: 6 },
  { month: "T6", events: 3 },
  { month: "T7", events: 2 },
  { month: "T8", events: 1 },
  { month: "T9", events: 4 },
  { month: "T10", events: 7 },
  { month: "T11", events: 5 },
  { month: "T12", events: 3 },
];

const lecturers = [
  { id: 1, name: "TS. Nguyễn Văn X", position: "Trưởng bộ môn", expertise: "Trí tuệ nhân tạo", yearsOfService: 15 },
  { id: 2, name: "PGS.TS. Trần Thị Y", position: "Phó khoa", expertise: "Machine Learning", yearsOfService: 18 },
  { id: 3, name: "TS. Lê Văn Z", position: "Giảng viên", expertise: "Blockchain", yearsOfService: 10 },
  { id: 4, name: "ThS. Phạm Thị W", position: "Giảng viên", expertise: "Web Development", yearsOfService: 8 },
  { id: 5, name: "ThS. Hoàng Văn V", position: "Giảng viên", expertise: "Security", yearsOfService: 7 },
];

export default function DepartmentDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Thống kê Khoa {departmentName}</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Tổng số sinh viên"
            value="661"
            description="15% tổng sinh viên toàn trường"
            icon={<BookOpen />}
          />
          <DashboardCard
            title="Giảng viên"
            value="49"
            description="8 giảng viên tiến sĩ"
            icon={<GraduationCap />}
          />
          <DashboardCard
            title="Sự kiện trong năm"
            value="45"
            description="15 sự kiện học thuật"
            icon={<CalendarDays />}
          />
          <DashboardCard
            title="Sinh viên xuất sắc"
            value="87"
            description="13% tổng số sinh viên"
            icon={<Award />}
          />
        </div>
        
        <Tabs defaultValue="students">
          <TabsList>
            <TabsTrigger value="students">Sinh viên</TabsTrigger>
            <TabsTrigger value="lecturers">Giảng viên</TabsTrigger>
            <TabsTrigger value="activities">Hoạt động - Sự kiện</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Phân bố theo giới tính</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentGenderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={1}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {studentGenderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Phân bố theo năm học</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentsByClass}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Phân bố theo điểm trung bình</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gpaDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Danh sách sinh viên xuất sắc</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Họ tên</TableHead>
                          <TableHead>Mã SV</TableHead>
                          <TableHead className="text-right">GPA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topStudents.map(student => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell className="text-right">{student.gpa}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="lecturers" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phân bố theo học vị</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={lecturersByRank}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {lecturersByRank.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Danh sách giảng viên</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Họ tên</TableHead>
                          <TableHead>Chức vụ</TableHead>
                          <TableHead>Chuyên môn</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lecturers.map(lecturer => (
                          <TableRow key={lecturer.id}>
                            <TableCell className="font-medium">{lecturer.name}</TableCell>
                            <TableCell>{lecturer.position}</TableCell>
                            <TableCell>{lecturer.expertise}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-4">
            <ChartCard title="Sự kiện trong năm">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="events" name="Số lượng sự kiện" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
