// src/pages/Dashboard/components/EventCategoryBarChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ThongKeTheoLoaiItem } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';

interface EventCategoryBarChartProps {
  data: ThongKeTheoLoaiItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF4560',
  '#775DD0',
];

const EventCategoryBarChart: React.FC<EventCategoryBarChartProps> = ({
  data,
  isLoading,
  isError,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-[300px] text-destructive">
        <AlertTriangle className="h-8 w-8 mb-1" />
        <p className="text-sm">Lỗi tải dữ liệu.</p>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        <p>Không có dữ liệu.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.tenLoaiSK,
    'Số Lượng': item.soLuongSuKien,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          strokeOpacity={0.2}
        />
        <XAxis type="number" fontSize={12} />
        <YAxis
          dataKey="name"
          type="category"
          width={100} // Điều chỉnh độ rộng của nhãn Y
          tick={{ fontSize: 11 }}
          interval={0} // Hiển thị tất cả nhãn
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          formatter={(value: number) => [
            `${value.toLocaleString()} sự kiện`,
            'Số Lượng',
          ]}
        />
        {/* <Legend wrapperStyle={{fontSize: "12px"}}/> */}
        <Bar dataKey="Số Lượng" barSize={20} radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EventCategoryBarChart;
