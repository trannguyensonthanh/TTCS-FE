// src/pages/Dashboard/components/PopularRoomTypesBarChart.tsx
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
import { LoaiPhongPhoBienItem } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';

interface PopularRoomTypesBarChartProps {
  data: LoaiPhongPhoBienItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
  dataKeyToDisplay: 'soLuotDat' | 'tongGioSuDung';
  barName: string;
  barColor: string;
}

const PopularRoomTypesBarChart: React.FC<PopularRoomTypesBarChartProps> = ({
  data,
  isLoading,
  isError,
  error,
  dataKeyToDisplay,
  barName,
  barColor,
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
        <p>Không có dữ liệu loại phòng.</p>
      </div>
    );
  }

  const chartData = data
    .map((item) => ({
      name: item.tenLoaiPhong,
      value: item[dataKeyToDisplay] || 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        <p>Không có dữ liệu loại phòng phù hợp.</p>
      </div>
    );
  }

  const valueFormatter = (value: number) => {
    return dataKeyToDisplay === 'soLuotDat'
      ? `${value.toLocaleString()} lượt`
      : `${value.toLocaleString()} giờ`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          strokeOpacity={0.2}
        />
        <XAxis type="number" fontSize={11} />
        <YAxis
          dataKey="name"
          type="category"
          width={120} // Tăng độ rộng cho tên loại phòng dài
          tick={{ fontSize: 10 }}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          formatter={(value: number) => [valueFormatter(value), barName]}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
        />
        {/* <Legend wrapperStyle={{fontSize: "12px"}}/> // Có thể không cần Legend nếu chỉ có 1 Bar */}
        <Bar
          dataKey="value"
          name={barName}
          barSize={18}
          radius={[0, 4, 4, 0]}
          fill={barColor}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PopularRoomTypesBarChart;
