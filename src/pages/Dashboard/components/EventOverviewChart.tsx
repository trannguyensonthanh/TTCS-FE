// src/pages/Dashboard/components/EventOverviewChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ThongKeTheoThoiGianItem } from '@/services/dashboard.service'; // Import type
import { APIError } from '@/services/apiHelper';

interface EventOverviewChartProps {
  data: ThongKeTheoThoiGianItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
  timeUnitLabel: string; // "Tháng", "Tuần", "Quý"
}

const EventOverviewChart: React.FC<EventOverviewChartProps> = ({
  data,
  isLoading,
  isError,
  error,
  timeUnitLabel,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[350px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-[350px] text-destructive">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p className="font-semibold">Lỗi tải dữ liệu biểu đồ</p>
        <p className="text-xs">
          {(error as APIError)?.body?.message || (error as Error)?.message}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[350px] text-muted-foreground">
        <p>Không có dữ liệu để hiển thị cho khoảng thời gian đã chọn.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        {' '}
        {/* Giảm left margin */}
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
        <XAxis
          dataKey="thoiGian"
          tickFormatter={(value) => value} // BE đã format (VD: "2025-01" hoặc "T1/25")
          fontSize={12}
          tickMargin={5}
        />
        <YAxis
          yAxisId="left"
          label={{
            value: 'Số Sự Kiện',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            fontSize: 12,
            fill: '#8884d8',
          }}
          fontSize={12}
          stroke="#8884d8"
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{
            value: 'Số Người Tham Gia',
            angle: 90,
            position: 'insideRight',
            offset: 10,
            fontSize: 12,
            fill: '#82ca9d',
          }}
          fontSize={12}
          stroke="#82ca9d"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
          formatter={(value: number, name: string) => [
            value.toLocaleString(),
            name,
          ]}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="soLuongSuKien"
          stroke="#8884d8"
          strokeWidth={2}
          name="Số Sự Kiện"
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="soNguoiThamGiaDuKien" // Hoặc soNguoiThamGiaThucTe nếu có
          stroke="#82ca9d"
          strokeWidth={2}
          name="Lượt Tham Dự (Dự kiến)"
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EventOverviewChart;
