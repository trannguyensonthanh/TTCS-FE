
import DashboardLayout from "@/components/DashboardLayout";
import {
  CalendarDays,
  Users,
  Building,
  GraduationCap,
  BookOpen,
  Clock,
  Calendar,
  Bell
} from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { useAuth } from "@/context/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Mock data
const eventsByMonthData = [
  { name: "T1", events: 20 },
  { name: "T2", events: 18 },
  { name: "T3", events: 25 },
  { name: "T4", events: 27 },
  { name: "T5", events: 30 },
  { name: "T6", events: 28 },
  { name: "T7", events: 24 },
  { name: "T8", events: 18 },
  { name: "T9", events: 22 },
  { name: "T10", events: 29 },
  { name: "T11", events: 33 },
  { name: "T12", events: 35 },
];

const studentsByDepartment = [
  { name: "CNTT", students: 523 },
  { name: "Kế toán", students: 345 },
  { name: "Kinh tế", students: 486 },
  { name: "Marketing", students: 287 },
  { name: "Ngoại ngữ", students: 190 },
  { name: "Xây dựng", students: 215 },
];

const upcomingEvents = [
  { 
    id: 1, 
    name: "Hội thảo công nghệ thông tin", 
    date: "2025-06-15", 
    time: "08:00 - 12:00", 
    location: "Hội trường A",
    organizer: "Khoa CNTT"
  },
  { 
    id: 2, 
    name: "Cuộc thi lập trình", 
    date: "2025-06-18", 
    time: "14:00 - 17:00", 
    location: "Phòng máy B2",
    organizer: "CLB IT" 
  },
  { 
    id: 3, 
    name: "Triển lãm đồ án sinh viên", 
    date: "2025-06-20", 
    time: "08:30 - 16:00", 
    location: "Sảnh chính",
    organizer: "Phòng đào tạo" 
  },
  { 
    id: 4, 
    name: "Workshop kỹ năng mềm", 
    date: "2025-06-22", 
    time: "13:30 - 16:30", 
    location: "Phòng hội thảo C3",
    organizer: "Đoàn Thanh niên" 
  },
  { 
    id: 5, 
    name: "Hội nghị khoa học sinh viên", 
    date: "2025-06-28", 
    time: "08:00 - 17:00", 
    location: "Hội trường B",
    organizer: "Phòng NCKH" 
  }
];

const recentNotifications = [
  { id: 1, title: "Yêu cầu mượn phòng mới", time: "5 phút trước" },
  { id: 2, title: "Đã duyệt sự kiện: Hội thảo công nghệ", time: "1 giờ trước" },
  { id: 3, title: "Yêu cầu sửa chữa thiết bị", time: "2 giờ trước" },
  { id: 4, title: "Cảnh báo: Trùng lịch sử dụng phòng", time: "3 giờ trước" },
  { id: 5, title: "Thông báo mới từ phòng đào tạo", time: "5 giờ trước" }
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Xin chào, {user?.name}!</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Tổng số sinh viên"
            value="8,259"
            description="Số lượng sinh viên hiện tại"
            icon={<BookOpen />}
            trend={{ value: 4.3, isPositive: true }}
          />
          <DashboardCard
            title="Giảng viên"
            value="432"
            description="Tổng số giảng viên và cán bộ"
            icon={<GraduationCap />}
          />
          <DashboardCard
            title="Sự kiện tháng này"
            value="35"
            description="Tăng 12% so với tháng trước"
            icon={<CalendarDays />}
            trend={{ value: 12, isPositive: true }}
          />
          <DashboardCard
            title="Phòng học và hội trường"
            value="120"
            description="95% đạt chuẩn"
            icon={<Building />}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Thống kê sự kiện theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventsByMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="events" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <ChartCard title="Phân bổ sinh viên theo khoa">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Sự kiện sắp diễn ra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-4 rounded-md border p-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CalendarDays className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{event.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(event.date).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <Building className="mr-1 h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            {event.organizer}
                          </div>
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
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Thông báo gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <div key={notification.id} className={cn(
                      "flex items-center space-x-4 rounded-md border p-3",
                      notification.id === 1 ? "bg-primary/5 border-primary/20" : ""
                    )}>
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        notification.id === 1 ? "bg-primary" : "bg-muted-foreground"
                      )} />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium leading-none">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
