
import DashboardLayout from "@/components/DashboardLayout";
import {
  CalendarDays,
  Clock,
  Users,
  Calendar,
  MapPin,
  Check,
  X,
  Clock8,
  LineChart as LineChartIcon,
  GraduationCap,
  Award,
  Music2,
  Star
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data
const eventOverviewData = [
  { month: "T1", events: 18, attendees: 1240 },
  { month: "T2", events: 15, attendees: 980 },
  { month: "T3", events: 22, attendees: 1750 },
  { month: "T4", events: 28, attendees: 2300 },
  { month: "T5", events: 30, attendees: 2450 },
  { month: "T6", events: 25, attendees: 1920 }
];

const eventCategoryData = [
  { name: "Học thuật", value: 125 },
  { name: "Văn hóa", value: 87 },
  { name: "Thể thao", value: 65 },
  { name: "Cuộc thi", value: 43 },
  { name: "Đào tạo", value: 38 }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const satisfactionData = [
  { name: "5 sao", value: 65 },
  { name: "4 sao", value: 25 },
  { name: "3 sao", value: 7 },
  { name: "2 sao", value: 2 },
  { name: "1 sao", value: 1 }
];

const upcomingEvents = [
  { 
    id: 1, 
    name: "Hội thảo công nghệ thông tin", 
    date: "2025-06-15", 
    time: "08:00 - 12:00", 
    location: "Hội trường A",
    organizer: "Khoa CNTT",
    capacity: 300,
    registered: 187,
    category: "academic"
  },
  { 
    id: 2, 
    name: "Cuộc thi lập trình", 
    date: "2025-06-18", 
    time: "14:00 - 17:00", 
    location: "Phòng máy B2",
    organizer: "CLB IT",
    capacity: 80,
    registered: 76,
    category: "competition"
  },
  { 
    id: 3, 
    name: "Triển lãm đồ án sinh viên", 
    date: "2025-06-20", 
    time: "08:30 - 16:00", 
    location: "Sảnh chính",
    organizer: "Phòng đào tạo",
    capacity: 500,
    registered: 312,
    category: "exhibition"
  },
  { 
    id: 4, 
    name: "Workshop kỹ năng mềm", 
    date: "2025-06-22", 
    time: "13:30 - 16:30", 
    location: "Phòng hội thảo C3",
    organizer: "Đoàn Thanh niên",
    capacity: 100,
    registered: 98,
    category: "training"
  },
  { 
    id: 5, 
    name: "Hội nghị khoa học sinh viên", 
    date: "2025-06-28", 
    time: "08:00 - 17:00", 
    location: "Hội trường B",
    organizer: "Phòng NCKH",
    capacity: 250,
    registered: 112,
    category: "academic"
  }
];

const pendingRequests = [
  { id: 1, name: "Yêu cầu hủy sự kiện: Workshop kỹ năng mềm", requester: "Nguyễn Văn A", date: "13/06/2025" },
  { id: 2, name: "Yêu cầu đổi phòng: Cuộc thi lập trình", requester: "Trần Thị B", date: "12/06/2025" },
  { id: 3, name: "Yêu cầu thay đổi thời gian: Hội thảo công nghệ", requester: "Lê Văn C", date: "12/06/2025" }
];

// Event category icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'academic':
      return <GraduationCap className="h-5 w-5 text-blue-500" />;
    case 'competition':
      return <Award className="h-5 w-5 text-yellow-500" />;
    case 'training':
      return <GraduationCap className="h-5 w-5 text-green-500" />;
    case 'culture':
      return <Music2 className="h-5 w-5 text-purple-500" />;
    default:
      return <Calendar className="h-5 w-5 text-gray-500" />;
  }
};

export default function EventsDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Thống kê sự kiện</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Tổng số sự kiện"
            value="358"
            description="Trong năm học 2023-2024"
            icon={<CalendarDays />}
          />
          <DashboardCard
            title="Sự kiện sắp tới"
            value="12"
            description="Trong 7 ngày tới"
            icon={<Clock />}
          />
          <DashboardCard
            title="Tổng số người tham gia"
            value="28,945"
            description="Trung bình 81 người/sự kiện"
            icon={<Users />}
          />
          <DashboardCard
            title="Đánh giá trung bình"
            value="4.5/5"
            description="Từ 15,320 đánh giá"
            icon={<Star />}
          />
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="categories">Phân loại sự kiện</TabsTrigger>
            <TabsTrigger value="satisfaction">Đánh giá</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <ChartCard title="Thống kê sự kiện và người tham gia">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="events"
                      stroke="#8884d8"
                      name="Số sự kiện"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="attendees"
                      stroke="#82ca9d"
                      name="Số người tham gia"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sự kiện sắp diễn ra</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px]">
                    <div className="p-4 space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(event.category)}
                              <h4 className="font-medium">{event.name}</h4>
                            </div>
                            <Badge variant={event.registered >= event.capacity * 0.9 ? "destructive" : "outline"}>
                              {event.registered}/{event.capacity}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(event.date).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-1 h-3 w-3" />
                              {event.organizer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Yêu cầu chờ xử lý</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[350px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Yêu cầu</TableHead>
                          <TableHead>Người tạo</TableHead>
                          <TableHead>Ngày</TableHead>
                          <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.name}
                            </TableCell>
                            <TableCell>{request.requester}</TableCell>
                            <TableCell>{request.date}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <button className="text-green-500 hover:text-green-600">
                                  <Check className="h-4 w-4" />
                                </button>
                                <button className="text-red-500 hover:text-red-600">
                                  <X className="h-4 w-4" />
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
          
          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sự kiện theo loại</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={eventCategoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {eventCategoryData.map((entry, index) => (
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
                  <CardTitle className="text-base">Chi tiết phân loại</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Số lượng" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="satisfaction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thống kê đánh giá sự kiện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={satisfactionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Phần trăm" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
