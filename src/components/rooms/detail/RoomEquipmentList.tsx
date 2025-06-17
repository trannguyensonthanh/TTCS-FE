// src/components/rooms/detail/RoomEquipmentList.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Tv, Settings, Package, Wifi, AirVent, Mic, Zap } from 'lucide-react'; // Thêm các icon thiết bị
import { Skeleton } from '@/components/ui/skeleton';
import { ThietBiTrongPhongResponse } from '@/services/phong.service';

interface RoomEquipmentListProps {
  thietBiTrongPhong?: ThietBiTrongPhongResponse[];
  isLoading: boolean;
}

const getEquipmentIcon = (tenThietBi: string): React.ReactNode => {
  const lowerName = tenThietBi.toLowerCase();
  if (lowerName.includes('máy chiếu') || lowerName.includes('projector'))
    return <Tv className="h-4 w-4 text-blue-500" />;
  if (lowerName.includes('micro') || lowerName.includes('mic'))
    return <Mic className="h-4 w-4 text-purple-500" />;
  if (lowerName.includes('loa') || lowerName.includes('speaker'))
    return <Zap className="h-4 w-4 text-orange-500" />; // Zap cho âm thanh/điện
  if (lowerName.includes('wifi') || lowerName.includes('internet'))
    return <Wifi className="h-4 w-4 text-green-500" />;
  if (
    lowerName.includes('điều hòa') ||
    lowerName.includes('máy lạnh') ||
    lowerName.includes('air conditioner')
  )
    return <AirVent className="h-4 w-4 text-sky-500" />;
  return <Settings className="h-4 w-4 text-muted-foreground" />;
};

export const RoomEquipmentList: React.FC<RoomEquipmentListProps> = ({
  thietBiTrongPhong,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Trang Thiết Bị Trong Phòng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!thietBiTrongPhong || thietBiTrongPhong.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Trang Thiết Bị Trong Phòng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Không có thông tin thiết bị cụ thể cho phòng này.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Trang Thiết Bị Trong Phòng</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {thietBiTrongPhong.map((tb, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2.5 border rounded-lg bg-muted/30 dark:bg-slate-800/40 hover:bg-muted/50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {getEquipmentIcon(tb.thietBi.tenThietBi)}
                <span className="text-sm font-medium text-foreground">
                  {tb.thietBi.tenThietBi}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {tb.tinhTrang && (
                  <Badge variant="outline" className="text-xs">
                    {tb.tinhTrang}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs font-mono">
                  {tb.soLuong} cái
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
