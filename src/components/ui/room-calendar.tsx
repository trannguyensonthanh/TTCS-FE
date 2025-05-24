import * as React from 'react';
import {
  format,
  addHours,
  addDays,
  startOfWeek,
  parseISO,
  isWithinInterval,
  isSameDay,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
}

interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: Date;
  end: Date;
  status: 'approved' | 'pending' | 'rejected';
}

interface RoomCalendarProps {
  rooms?: { id: string; name: string }[];
  bookings?: Booking[];
  date: Date;
  onDateChange?: (date: Date) => void;
  onTimeSlotClick?: (roomId: string, timeSlot: TimeSlot) => void;
  selectedSlots?: TimeSlot[];
  mode?: 'view' | 'select';
}

export const RoomCalendar = ({
  rooms = [],
  bookings = [],
  date,
  onDateChange,
  onTimeSlotClick,
  selectedSlots = [],
  mode = 'view',
}: RoomCalendarProps) => {
  // Generate days for the current week
  const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Generate time slots (7:00 to 22:00)
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let i = 7; i < 22; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Navigate to previous/next week
  const handlePrevWeek = () => {
    if (onDateChange) onDateChange(addDays(date, -7));
  };

  const handleNextWeek = () => {
    if (onDateChange) onDateChange(addDays(date, 7));
  };

  const handleToday = () => {
    if (onDateChange) onDateChange(new Date());
  };

  // Check if a time slot is booked
  const isSlotBooked = (roomId: string, day: Date, timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0]);
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotStart.getHours() + 1, 0, 0, 0);

    return bookings.find(
      (booking) =>
        (booking.roomId === roomId &&
          isWithinInterval(slotStart, {
            start: booking.start,
            end: booking.end,
          })) ||
        isWithinInterval(slotEnd, { start: booking.start, end: booking.end }) ||
        (slotStart <= booking.start && slotEnd >= booking.end)
    );
  };

  // Check if a time slot is selected
  const isSlotSelected = (roomId: string, day: Date, timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0]);

    return selectedSlots.some((slot) => {
      const slotDay = new Date(slot.start);
      return (
        slot.id.includes(roomId) &&
        isSameDay(slotDay, day) &&
        slotDay.getHours() === hour
      );
    });
  };

  // Handle time slot click
  const handleTimeSlotClick = (roomId: string, day: Date, timeStr: string) => {
    if (!onTimeSlotClick || mode === 'view') return;

    const hour = parseInt(timeStr.split(':')[0]);
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 1, 0, 0, 0);

    const timeSlot: TimeSlot = {
      id: `${roomId}-${format(start, 'yyyy-MM-dd-HH')}`,
      start,
      end,
    };

    onTimeSlotClick(roomId, timeSlot);
  };

  // Get booking for a specific slot
  const getBookingForSlot = (roomId: string, day: Date, timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0]);
    const slotStart = new Date(day);
    slotStart.setHours(hour, 0, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotStart.getHours() + 1, 0, 0, 0);

    return bookings.find(
      (booking) =>
        booking.roomId === roomId &&
        (isWithinInterval(slotStart, {
          start: booking.start,
          end: booking.end,
        }) ||
          isWithinInterval(slotEnd, {
            start: booking.start,
            end: booking.end,
          }) ||
          (slotStart <= booking.start && slotEnd >= booking.end))
    );
  };

  // Get status color for booking
  const getStatusColor = (status: 'approved' | 'pending' | 'rejected') => {
    switch (status) {
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return '';
    }
  };

  return (
    <div className="border rounded-md">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Hôm nay
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="font-semibold">
          {format(days[0], 'dd/MM/yyyy', { locale: vi })} -{' '}
          {format(days[6], 'dd/MM/yyyy', { locale: vi })}
        </div>
      </div>

      <div className="min-w-[800px] overflow-auto">
        {/* Days header */}
        <div className="flex">
          <div className="w-[120px] shrink-0 border-r p-2 bg-muted flex items-center justify-center">
            <span className="font-medium">Phòng</span>
          </div>
          <div className="grid grid-cols-7 flex-1">
            {days.map((day, index) => (
              <div
                key={index}
                className={cn(
                  'border-r p-2 text-center',
                  isSameDay(day, new Date()) && 'bg-primary/5'
                )}
              >
                <div className="font-medium">
                  {format(day, 'EEEE', { locale: vi })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(day, 'dd/MM', { locale: vi })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[600px] overflow-y-auto">
          {/* Room rows */}
          {rooms.map((room) => (
            <div key={room.id} className="flex border-t">
              <div className="w-[120px] shrink-0 border-r p-2 flex items-center justify-center">
                <span className="font-medium">{room.name}</span>
              </div>
              <div className="grid grid-cols-7 flex-1">
                {days.map((day, dayIndex) => (
                  <div key={dayIndex} className="border-r">
                    {timeSlots.map((timeSlot, timeIndex) => {
                      const isBooked = isSlotBooked(room.id, day, timeSlot);
                      const booking = isBooked
                        ? getBookingForSlot(room.id, day, timeSlot)
                        : null;
                      const isSelected = isSlotSelected(room.id, day, timeSlot);

                      return (
                        <TooltipProvider
                          key={`${room.id}-${dayIndex}-${timeIndex}`}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  'border-b h-12 relative cursor-pointer hover:bg-muted/50',
                                  isBooked && booking
                                    ? getStatusColor(booking.status)
                                    : '',
                                  isSelected &&
                                    'bg-primary/20 dark:bg-primary/30',
                                  timeIndex % 2 === 0 && 'border-dashed'
                                )}
                                onClick={() =>
                                  handleTimeSlotClick(room.id, day, timeSlot)
                                }
                              >
                                <div className="absolute top-0 left-0 p-1 text-xs">
                                  {timeSlot}
                                </div>
                                {booking && (
                                  <div className="h-full w-full flex items-center justify-center p-1 text-center">
                                    <span className="text-xs font-medium truncate">
                                      {booking.title}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {booking ? (
                                <div className="text-xs">
                                  <div className="font-bold">
                                    {booking.title}
                                  </div>
                                  <div>
                                    {format(booking.start, 'HH:mm')} -{' '}
                                    {format(booking.end, 'HH:mm')}
                                  </div>
                                  <div>
                                    Trạng thái:{' '}
                                    {booking.status === 'approved'
                                      ? 'Đã duyệt'
                                      : booking.status === 'pending'
                                      ? 'Chờ duyệt'
                                      : 'Đã từ chối'}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs">
                                  {timeSlot} - Trống
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};
