// import DashboardLayout from "@/components/DashboardLayout";
// import {
//   Users,
//   CalendarDays,
//   User,
//   Award,
//   Star,
//   MapPin,
//   UserSquare
// } from "lucide-react";
// import DashboardCard from "@/components/dashboard/DashboardCard";
// import ChartCard from "@/components/dashboard/ChartCard";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";

// // Mock data
// const unionName = "Đoàn Thanh niên PTIT";

// const unionEventData = [
//   { name: "T1", value: 3 },
//   { name: "T2", value: 2 },
//   { name: "T3", value: 5 },
//   { name: "T4", value: 3 },
//   { name: "T5", value: 4 },
//   { name: "T6", value: 7 },
//   { name: "T7", value: 2 },
//   { name: "T8", value: 1 },
//   { name: "T9", value: 4 },
//   { name: "T10", value: 6 },
//   { name: "T11", value: 4 },
//   { name: "T12", value: 5 },
// ];

// const membershipData = [
//   { name: "Năm 1", value: 752 },
//   { name: "Năm 2", value: 685 },
//   { name: "Năm 3", value: 621 },
//   { name: "Năm 4", value: 576 },
//   { name: "Năm 5", value: 125 },
// ];

// const participationByDepartment = [
//   { name: "CNTT", value: 85 },
//   { name: "Điện tử", value: 75 },
//   { name: "Viễn thông", value: 80 },
//   { name: "Kinh tế", value: 65 },
//   { name: "Đa phương tiện", value: 70 },
// ];

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// const upcomingActivities = [
//   {
//     id: 1,
//     name: "Chiến dịch tình nguyện mùa hè xanh",
//     date: "15/07/2025 - 30/07/2025",
//     location: "Tỉnh Bình Phước",
//     participants: 120,
//     capacity: 150,
//     progress: 80
//   },
//   {
//     id: 2,
//     name: "Hiến máu tình nguyện",
//     date: "25/06/2025",
//     location: "Khuôn viên trường",
//     participants: 210,
//     capacity: 300,
//     progress: 70
//   },
//   {
//     id: 3,
//     name: "Hội thao sinh viên",
//     date: "02/07/2025 - 10/07/2025",
//     location: "Sân vận động trường",
//     participants: 320,
//     capacity: 500,
//     progress: 64
//   },
//   {
//     id: 4,
//     name: "Chương trình văn nghệ chào tân sinh viên",
//     date: "01/09/2025",
//     location: "Hội trường lớn",
//     participants: 45,
//     capacity: 150,
//     progress: 30
//   },
// ];

// const topContributors = [
//   { id: 1, name: "Nguyễn Văn A", department: "CNTT", year: "Năm 3", points: 245 },
//   { id: 2, name: "Trần Thị B", department: "Điện tử", year: "Năm 2", points: 230 },
//   { id: 3, name: "Lê Văn C", department: "CNTT", year: "Năm 4", points: 210 },
//   { id: 4, name: "Phạm Thị D", department: "Kinh tế", year: "Năm 3", points: 192 },
//   { id: 5, name: "Hoàng Văn E", department: "CNTT", year: "Năm 2", points: 178 },
//   { id: 6, name: "Ngô Thị F", department: "Viễn thông", year: "Năm 3", points: 165 },
// ];

// export default function UnionDashboard() {
//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <h1 className="text-2xl font-bold">{unionName}</h1>

//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <DashboardCard
//             title="Tổng số đoàn viên"
//             value="2,759"
//             description="85.2% sinh viên toàn trường"
//             icon={<Users />}
//             trend={{ value: 3.2, isPositive: true }}
//           />
//           <DashboardCard
//             title="Đoàn viên xuất sắc"
//             value="328"
//             description="11.9% tổng số đoàn viên"
//             icon={<Award />}
//           />
//           <DashboardCard
//             title="Hoạt động năm 2025"
//             value="46"
//             description="Tăng 15% so với năm trước"
//             icon={<CalendarDays />}
//             trend={{ value: 15, isPositive: true }}
//           />
//           <DashboardCard
//             title="Sinh viên 5 tốt"
//             value="125"
//             description="Tăng 25 sv so với năm trước"
//             icon={<Star />}
//           />
//         </div>

//         <div className="grid gap-4 md:grid-cols-2">
//           <ChartCard title="Thống kê hoạt động theo tháng">
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={unionEventData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="value" name="Số hoạt động" fill="#8884d8" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </ChartCard>

//           <ChartCard title="Phân bố đoàn viên theo năm học">
//             <div className="h-[300px]">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={membershipData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="value" name="Số đoàn viên" fill="#82ca9d" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </ChartCard>
//         </div>

//         <div className="grid gap-4 md:grid-cols-2">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-base">
//                 Tỷ lệ tham gia hoạt động đoàn theo khoa (%)
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[300px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={participationByDepartment}
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="value"
//                       label={({ name, value }) => `${name}: ${value}%`}
//                     >
//                       {participationByDepartment.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-base">Đoàn viên nổi bật</CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               <ScrollArea className="h-[300px]">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Họ và tên</TableHead>
//                       <TableHead>Khoa</TableHead>
//                       <TableHead className="text-right">Điểm tích lũy</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {topContributors.map(student => (
//                       <TableRow key={student.id}>
//                         <TableCell className="font-medium">{student.name}</TableCell>
//                         <TableCell>
//                           <div>{student.department}</div>
//                           <div className="text-xs text-muted-foreground">{student.year}</div>
//                         </TableCell>
//                         <TableCell className="text-right">{student.points}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </ScrollArea>
//             </CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle className="text-base">Hoạt động sắp tới</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-5">
//               {upcomingActivities.map(activity => (
//                 <div key={activity.id} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h4 className="font-medium text-base">{activity.name}</h4>
//                       <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
//                         <div className="flex items-center">
//                           <CalendarDays className="mr-1 h-3.5 w-3.5" />
//                           {activity.date}
//                         </div>
//                         <div className="flex items-center">
//                           <MapPin className="mr-1 h-3.5 w-3.5" />
//                           {activity.location}
//                         </div>
//                         <div className="flex items-center">
//                           <UserSquare className="mr-1 h-3.5 w-3.5" />
//                           {activity.participants}/{activity.capacity}
//                         </div>
//                       </div>
//                     </div>
//                     <Badge variant="outline">{activity.progress}%</Badge>
//                   </div>
//                   <Progress value={activity.progress} />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }
