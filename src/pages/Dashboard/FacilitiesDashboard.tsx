
import React from 'react';
import { Check, X, Building, BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart } from '@/components/ui/chart';

// Mock data for facility usage
const roomUsageData = [
  { name: 'Jan', usage: 45 },
  { name: 'Feb', usage: 52 },
  { name: 'Mar', usage: 61 },
  { name: 'Apr', usage: 58 },
  { name: 'May', usage: 65 },
  { name: 'Jun', usage: 48 },
  { name: 'Jul', usage: 40 },
  { name: 'Aug', usage: 35 },
  { name: 'Sep', usage: 70 },
  { name: 'Oct', usage: 75 },
  { name: 'Nov', usage: 68 },
  { name: 'Dec', usage: 55 },
];

const equipmentUsageData = [
  { name: 'Máy chiếu', count: 158 },
  { name: 'Micro', count: 210 },
  { name: 'Loa', count: 185 },
  { name: 'Máy tính', count: 120 },
  { name: 'Bàn ghế', count: 95 },
];

const roomMaintenanceData = [
  { name: 'Jan', scheduled: 5, emergency: 2 },
  { name: 'Feb', scheduled: 4, emergency: 1 },
  { name: 'Mar', scheduled: 6, emergency: 3 },
  { name: 'Apr', scheduled: 3, emergency: 2 },
  { name: 'May', scheduled: 7, emergency: 1 },
  { name: 'Jun', scheduled: 5, emergency: 0 },
];

// Mock stats data
const facilityStats = [
  { title: 'Tổng số phòng', value: '120', description: '15 phòng đang bảo trì', icon: Building, trend: '+5% so với kỳ trước', color: 'text-blue-500' },
  { title: 'Tỷ lệ sử dụng', value: '75%', description: 'Trung bình hàng tháng', icon: BarChart3, trend: '+8% so với kỳ trước', color: 'text-green-500' },
  { title: 'Thiết bị hoạt động', value: '95%', description: '5% thiết bị đang bảo trì', icon: Check, trend: '+2% so với kỳ trước', color: 'text-green-500' },
  { title: 'Yêu cầu đặt phòng', value: '230', description: 'Tháng hiện tại', icon: Calendar, trend: '+12% so với kỳ trước', color: 'text-blue-500' },
];

const FacilitiesDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Thống kê cơ sở vật chất</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {facilityStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <div className="flex items-center pt-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Tình trạng sử dụng phòng</CardTitle>
              <CardDescription>Thống kê lượt sử dụng phòng trong năm</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={roomUsageData}
                index="name"
                categories={["usage"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value} lượt`}
                className="h-72"
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Thiết bị được sử dụng nhiều</CardTitle>
              <CardDescription>Top 5 thiết bị được sử dụng nhiều nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={equipmentUsageData}
                index="name"
                categories={["count"]}
                colors={["green"]}
                valueFormatter={(value) => `${value} lượt`}
                className="h-72"
              />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bảo trì phòng học</CardTitle>
            <CardDescription>So sánh bảo trì định kỳ và khẩn cấp 6 tháng gần đây</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={roomMaintenanceData}
              index="name"
              categories={["scheduled", "emergency"]}
              colors={["blue", "red"]}
              valueFormatter={(value) => `${value} lần`}
              className="h-80"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quản lý tài sản</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="inventory" className="space-y-4">
              <TabsList>
                <TabsTrigger value="inventory">Thống kê tài sản</TabsTrigger>
                <TabsTrigger value="maintenance">Lịch bảo trì</TabsTrigger>
                <TabsTrigger value="purchase">Kế hoạch mua sắm</TabsTrigger>
              </TabsList>
              <TabsContent value="inventory" className="p-4 border rounded-md">
                <div className="text-sm">
                  <p className="mb-4">Tổng tài sản: <span className="font-medium">1,245 thiết bị</span></p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Thiết bị công nghệ</span>
                      <span>425 thiết bị</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bàn ghế</span>
                      <span>620 thiết bị</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thiết bị âm thanh</span>
                      <span>120 thiết bị</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thiết bị thí nghiệm</span>
                      <span>80 thiết bị</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="maintenance" className="p-4 border rounded-md">
                <div className="text-sm">
                  <p className="mb-4">Lịch bảo trì định kỳ tháng 5/2025</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>05/05 - Bảo trì máy chiếu tòa A</span>
                      <span className="text-green-500"><Check className="h-4 w-4 inline" /> Hoàn thành</span>
                    </div>
                    <div className="flex justify-between">
                      <span>12/05 - Bảo trì hệ thống điều hòa tòa B</span>
                      <span className="text-green-500"><Check className="h-4 w-4 inline" /> Hoàn thành</span>
                    </div>
                    <div className="flex justify-between">
                      <span>18/05 - Kiểm tra thiết bị phòng thí nghiệm</span>
                      <span className="text-yellow-500">Đang thực hiện</span>
                    </div>
                    <div className="flex justify-between">
                      <span>25/05 - Bảo trì hệ thống máy tính phòng máy</span>
                      <span className="text-gray-500">Chưa thực hiện</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="purchase" className="p-4 border rounded-md">
                <div className="text-sm">
                  <p className="mb-4">Kế hoạch mua sắm thiết bị Quý II/2025</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>10 máy chiếu mới cho tòa C</span>
                      <span className="text-yellow-500">Đang xét duyệt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>50 bộ bàn ghế cho phòng học</span>
                      <span className="text-green-500">Đã duyệt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5 bộ dàn âm thanh mới</span>
                      <span className="text-gray-500">Chưa duyệt</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nâng cấp hệ thống điều hòa tòa A</span>
                      <span className="text-green-500">Đã duyệt</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacilitiesDashboard;
