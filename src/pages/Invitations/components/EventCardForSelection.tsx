// src/pages/Invitations/components/EventCardForSelection.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Users,
  Users2,
  MapPin,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import { SuKienCoTheMoiItem } from '@/services/event.service';
import { formatDateRangeForDisplay } from '@/utils/dateTimeUtils';

interface EventCardForSelectionProps {
  event: SuKienCoTheMoiItem;
  onSelect: () => void;
}

export const EventCardForSelection: React.FC<EventCardForSelectionProps> = ({
  event,
  onSelect,
}) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out dark:border-slate-700/80 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary dark:group-hover:text-ptit-blue transition-colors">
            {event.tenSK}
          </CardTitle>
          {event.loaiSuKien && (
            <Badge
              variant="outline"
              className="text-xs whitespace-nowrap ml-2 shrink-0"
            >
              {event.loaiSuKien.tenLoaiSK}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Đơn vị: {event.donViChuTri.tenDonVi}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
          <span>
            {formatDateRangeForDisplay(event.tgBatDauDK, event.tgKetThucDK)}
          </span>
        </div>
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <span>Dự kiến: {event.slThamDuDK || 'N/A'} người</span>
        </div>
        <div className="flex items-center">
          <Users2 className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span>Đã mời: {event.soLuongDaMoi || 0} người</span>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 dark:border-slate-700/60">
        <Button
          onClick={onSelect}
          className="w-full bg-primary hover:bg-primary/90 dark:bg-ptit-blue dark:hover:bg-ptit-blue/90 dark:text-white"
        >
          Chọn Sự Kiện Này <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
