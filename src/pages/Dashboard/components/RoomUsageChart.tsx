// src/pages/Dashboard/components/RoomUsageChart.tsx
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { SuDungPhongTheoThoiGianItem } from '@/services/dashboard.service'; // Import type
import { APIError } from '@/services/apiHelper';

interface RoomUsageChartProps {
  data: SuDungPhongTheoThoiGianItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
  dataKeyUsage: 'soLuotDatPhong' | 'tongGioSuDung'; // Key để vẽ line
  yAxisLabel: string; // Nhãn cho trục Y
  lineName: string; // Tên cho đường line trong legend/tooltip
  lineColor: string; // Màu cho đường line
}

const RoomUsageChart: React.FC<RoomUsageChartProps> = ({
  data,
  isLoading,
  isError,
  error,
  dataKeyUsage,
  yAxisLabel,
  lineName,
  lineColor,
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
        <p className="text-sm">Lỗi tải dữ liệu biểu đồ.</p>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        <p>Không có dữ liệu sử dụng phòng cho bộ lọc hiện tại.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
        <XAxis
          dataKey="thoiGian"
          fontSize={11}
          tickMargin={5}
          // tickFormatter={(value) => format(parseISO(value), "dd/MM")} // Nếu 'thoiGian' là ISO date đầy đủ
        />
        <YAxis
          fontSize={11}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            fontSize: 12,
            fill: lineColor,
          }}
          stroke={lineColor}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
          formatter={(value: number) => [value.toLocaleString(), lineName]}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line
          type="monotone"
          dataKey={dataKeyUsage}
          stroke={lineColor}
          strokeWidth={2}
          name={lineName}
          dot={{ r: 3, strokeWidth: 1, fill: lineColor }}
          activeDot={{ r: 5, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RoomUsageChart;
