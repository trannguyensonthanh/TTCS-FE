
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  CalendarDays,
  User,
  Clock,
  Award,
  UserSquare
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

// Mock data
const clubName = "Câu Lạc Bộ IT";
const clubId = "3";

const clubEventsData = [
  { month: "T1", events: 1 },
  { month: "T2", events: 2 },
  { month: "T3", events: 3 },
  { month: "T4", events: 2 },
  { month: "T5", events: 4 },
  { month: "T6", events: 3 },
  { month: "T7", events: 1 },
  { month: "T8", events: 0 },
  { month: "T9", events: 2 },
  { month: "T10", events: 3 },
  { month: "T11", events: 2 },
  { month: "T12", events: 3 },
];

const membersByYearData = [
  { year: "Năm 1", count: 32 },
  { year: "Năm 2", count: 28 },
  { year: "Năm 3", count: 17 },
  { year: "Năm 4", count: 10 },
  { year: "Năm 5", count: 3 },
];

const membersByDepartmentData = [
  { name: "CNTT", value: 65 },
  { name: "Điện tử", value: 12 },
  { name: "Kinh tế", value: 8 },
  { name: "Truyền thông", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const topMembers = [
  { id: 1, name: "Nguyễn Văn A", position: "Phó chủ nhiệm", department: "CNTT", year: "Năm 3", points: 156 },
  { id: 2, name: "Trần Thị B", position: "Trưởng ban Truyền thông", department: "CNTT", year: "Năm 2", points: 142 },
  { id: 3, name: "Lê Văn C", position: "Thành viên", department: "CNTT", year: "Năm 2", points: 128 },
  { id: 4, name: "Phạm Thị D", position: "Trưởng ban Kỹ thuật", department: "Điện tử", year: "Năm 3", points: 120 },
  { id: 5, name: "Hoàng Văn E", position: "Thư ký", department: "CNTT", year: "Năm 2", points: 115 },
];

const upcomingClubEvents = [
  { 
    id: 1, 
    name: "Workshop Angular", 
    date: "15/06/2025", 
    time: "14:00 - 17:00", 
    location: "Phòng máy B2", 
    status: "confirmed" 
  },
  { 
    id: 2, 
    name: "Seminar AI/ML", 
    date: "20/06/2025", 
    time: "08:30 - 11:30", 
    location: "Hội trường A", 
    status: "pending" 
  },
  { 
    id: 3, 
    name: "Hackathon 2025", 
    date: "01/07/2025", 
    time: "08:00 - 20:00", 
    location: "Sảnh chính", 
    status: "confirmed" 
  },
  { 
    id: 4, 
    name: "IT Job Fair", 
    date: "15/07/2025", 
    time: "09:00 - 16:00", 
    location: "Sân trường", 
    status: "pending" 
  },
];

const newMemberRequests = [
  { id: 1, name: "Vũ Thị F", studentId: "SV22345", department: "CNTT", year: "Năm 1" },
  { id: 2, name: "Đặng Văn G", studentId: "SV22346", department: "Điện tử", year: "Năm 2" },
  { id: 3, name: "Ngô Thị H", studentId: "SV22347", department: "CNTT", year: "Năm 1" },
];

export default function ClubsDashboard() {
  const { user } = useAuth();

  // In a real app, we would fetch the club data based on the user's donViId
  // or filter from a list of clubs

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{clubName}</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Tổng số thành viên"
            value="90"
            description="17 thành viên mới"
            icon={<Users />}
            trend={{ value: 23.3, isPositive: true }}
          />
          <DashboardCard
            title="Sự kiện đã tổ chức"
            value="26"
            description="Trong năm 2025"
            icon={<CalendarDays />}
          />
          <DashboardCard
            title="Sự kiện sắp tới"
            value="4"
            description="Trong 30 ngày tới"
            icon={<Clock />}
          />
          <DashboardCard
            title="Thành viên tích cực"
            value="15"
            description="Đóng góp > 100 điểm"
            icon={<Award />}
          />
        </div>
        
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Thành viên</TabsTrigger>
            <TabsTrigger value="events">Sự kiện</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thành viên theo khoa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={membersByDepartmentData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {membersByDepartmentData.map((entry, index) => (
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
                  <CardTitle className="text-base">Thành viên theo năm học</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={membersByYearData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Số lượng" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Thành viên tích cực nhất</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Chức vụ</TableHead>
                        <TableHead className="text-right">Điểm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topMembers.map(member => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.position}</TableCell>
                          <TableCell className="text-right">{member.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Yêu cầu tham gia mới</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[215px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Họ tên</TableHead>
                          <TableHead>Khoa</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newMemberRequests.map(request => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="font-medium">{request.name}</div>
                              <div className="text-xs text-muted-foreground">{request.studentId}</div>
                            </TableCell>
                            <TableCell>
                              <div>{request.department}</div>
                              <div className="text-xs text-muted-foreground">{request.year}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <button className="text-green-500 hover:text-green-600">
                                  <Award className="h-4 w-4" />
                                </button>
                                <button className="text-red-500 hover:text-red-600">
                                  <User className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            <ChartCard title="Sự kiện theo tháng">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clubEventsData}>
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
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sự kiện sắp tới</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên sự kiện</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Giờ</TableHead>
                      <TableHead>Địa điểm</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingClubEvents.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>{event.time}</TableCell>
                        <TableCell>{event.location}</TableCell>
                        <TableCell>
                          <Badge variant={event.status === "confirmed" ? "outline" : "secondary"}>
                            {event.status === "confirmed" ? "Đã xác nhận" : "Chờ duyệt"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
