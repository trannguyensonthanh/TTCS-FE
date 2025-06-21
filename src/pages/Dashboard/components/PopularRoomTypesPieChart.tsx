/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Dashboard/components/PopularRoomTypesPieChart.tsx
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { LoaiPhongPhoBienItem } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';

interface PopularRoomTypesPieChartProps {
  data: LoaiPhongPhoBienItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
  dataKeyToDisplay: 'soLuotDat' | 'tongGioSuDung'; // Key để lấy value cho pie chart
}

const PIE_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF4560',
  '#775DD0',
  '#FF6693',
  '#26A69A',
  '#D4526E',
]; // Thêm màu sắc

const RADIAN = Math.PI / 180;
const renderCustomizedPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  value,
}: any) => {
  if (percent * 100 < 3) return null; // Ẩn label quá nhỏ

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="11px"
      fontWeight="bold"
      // filter="url(#solid-background)" // Thử thêm viền cho text (cần định nghĩa SVG filter)
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PopularRoomTypesPieChart: React.FC<PopularRoomTypesPieChartProps> = ({
  data,
  isLoading,
  isError,
  error,
  dataKeyToDisplay,
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
      value: item[dataKeyToDisplay] || 0, // Lấy giá trị từ key được truyền vào
    }))
    .filter((item) => item.value > 0); // Chỉ hiển thị những loại phòng có dữ liệu

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        <p>Không có dữ liệu loại phòng phù hợp để hiển thị.</p>
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
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedPieLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          stroke="hsl(var(--background))"
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            valueFormatter(value),
            name,
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
        />
        <Legend
          iconSize={10}
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            fontSize: '11px',
            lineHeight: '16px',
            paddingLeft: '10px',
            paddingRight: '10px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PopularRoomTypesPieChart;
