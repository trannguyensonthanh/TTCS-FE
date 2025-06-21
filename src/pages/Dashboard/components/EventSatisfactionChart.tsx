/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard/components/EventSatisfactionChart.tsx
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
import { Loader2, AlertTriangle, Star } from 'lucide-react';
import { ThongKeDanhGiaItem } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';

interface EventSatisfactionChartProps {
  data: ThongKeDanhGiaItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
  tieuChiDiemLabel: string; // "Nội dung", "Tổ chức", "Địa điểm", "Tổng quát"
}

const RATING_COLORS = {
  '5': '#4CAF50', // Green
  '4': '#8BC34A', // Light Green
  '3': '#FFEB3B', // Yellow
  '2': '#FF9800', // Orange
  '1': '#F44336', // Red
};

const EventSatisfactionChart: React.FC<EventSatisfactionChartProps> = ({
  data,
  isLoading,
  isError,
  error,
  tieuChiDiemLabel,
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
        <p className="text-sm">Lỗi tải dữ liệu đánh giá.</p>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        <p>Chưa có dữ liệu đánh giá cho tiêu chí này.</p>
      </div>
    );
  }

  const chartData = data
    .map((item) => ({
      name: `${item.mucDiem} sao`,
      'Số Lượt': item.soLuotDanhGia,
      // tyLe: item.tyLePhanTram // Có thể dùng cho tooltip hoặc label
    }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name)); // Sắp xếp từ 1 sao đến 5 sao

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="name" fontSize={12} tickMargin={5} />
        <YAxis
          fontSize={12}
          label={{
            value: 'Số Lượt Đánh Giá',
            angle: -90,
            position: 'insideLeft',
            offset: 0,
            fontSize: 12,
          }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          formatter={(value: number, name: string, props: any) => {
            const percent =
              props.payload.tyLe !== undefined
                ? ` (${props.payload.tyLe.toFixed(1)}%)`
                : '';
            return [`${value.toLocaleString()} lượt${percent}`, 'Số Lượt'];
          }}
        />
        <Legend
          formatter={(value, entry) => (
            <span
              style={{ color: entry.color }}
            >{`Thống kê cho ${tieuChiDiemLabel}`}</span>
          )}
          wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
        />
        <Bar dataKey="Số Lượt" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => {
            const ratingNumber = entry.name.charAt(0); // Lấy số từ "X sao"
            return (
              <Cell
                key={`cell-${index}`}
                fill={(RATING_COLORS as any)[ratingNumber] || '#8884d8'}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EventSatisfactionChart;
