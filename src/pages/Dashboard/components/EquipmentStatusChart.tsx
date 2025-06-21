// src/pages/Dashboard/components/EquipmentStatusChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ThietBiTheoTinhTrangItem } from '@/services/dashboard.service';
import { APIError } from '@/services/apiHelper';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

interface EquipmentStatusChartProps {
  data: ThietBiTheoTinhTrangItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: APIError | Error | null;
}

// Định nghĩa màu sắc cho từng trạng thái (có thể mở rộng)
const STATUS_COLORS: { [key: string]: string } = {
  'Hoạt động tốt': '#4CAF50', // Green
  Tốt: '#4CAF50',
  'Đang sử dụng': '#2196F3', // Blue
  'Cần bảo trì': '#FFC107', // Amber
  'Đang sửa chữa': '#FF9800', // Orange
  Hỏng: '#F44336', // Red
  'Chờ thay thế': '#E91E63', // Pink
  'Ngưng sử dụng': '#9E9E9E', // Grey
  // Thêm các màu khác cho các tình trạng khác nếu có
};

const defaultColor = '#8884d8'; // Màu mặc định nếu không khớp

const EquipmentStatusChart: React.FC<EquipmentStatusChartProps> = ({
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
        <p className="text-sm">Lỗi tải dữ liệu tình trạng thiết bị.</p>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        <AlertTriangle className="mr-2 h-6 w-6" />
        <p>Chưa có dữ liệu thống kê tình trạng thiết bị.</p>
      </div>
    );
  }

  // Sắp xếp dữ liệu để các trạng thái "tệ" hơn hiển thị ở dưới (tùy chọn)
  const sortedData = [...data].sort((a, b) => {
    // Logic sắp xếp tùy chỉnh nếu cần, ví dụ: ưu tiên "Hỏng", "Cần bảo trì"
    // Hiện tại chỉ giữ nguyên thứ tự từ API
    return 0;
  });

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.max(300, sortedData.length * 45)}
    >
      <>
        {/* Chiều cao động */}
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            strokeOpacity={0.2}
          />
          <XAxis type="number" fontSize={11} allowDecimals={false} />
          <YAxis
            dataKey="tinhTrang"
            type="category"
            width={130} // Tăng độ rộng cho tên trạng thái dài
            tick={{ fontSize: 11 }}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            formatter={(value: number) => [
              `${value.toLocaleString()} thiết bị`,
              'Số lượng',
            ]}
          />
          {/* Không cần Legend nếu chỉ có 1 series dữ liệu */}
          <Bar dataKey="soLuong" barSize={20} radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.tinhTrang] || defaultColor}
              />
            ))}
            <LabelList
              dataKey="soLuong"
              position="right"
              style={{ fontSize: '11px', fill: 'hsl(var(--foreground))' }}
              formatter={(value: number) => value.toLocaleString()}
            />
          </Bar>
        </BarChart>
      </>
    </ResponsiveContainer>
  );
};

export default EquipmentStatusChart;
