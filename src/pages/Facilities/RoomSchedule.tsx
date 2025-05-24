
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from "@/components/DashboardLayout";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, MapPin, Check, X, Filter, Building } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, isSameDay, parseISO, startOfDay, endOfDay, addHours, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Mock data for rooms
const mockRooms = [
  { id: '1', name: 'Hội trường A', type: 'conference', capacity: 300, building: 'A', floor: '1', status: 'available' },
  { id: '2', name: 'Hội trường B', type: 'conference', capacity: 250, building: 'B', floor: '1', status: 'available' },
  { id: '3', name: 'Phòng hội thảo B2-01', type: 'seminar', capacity: 80, building: 'B', floor: '2', status: 'available' },
  { id: '4', name: 'Phòng họp A3-01', type: 'meeting', capacity: 30, building: 'A', floor: '3', status: 'available' },
  { id: '5', name: 'Phòng thực hành CNTT', type: 'lab', capacity: 60, building: 'C', floor: '1', status: 'available' },
  { id: '6', name: 'Phòng học C2-01', type: 'classroom', capacity: 100, building: 'C', floor: '2', status: 'available' },
  { id: '7', name: 'Phòng học C2-02', type: 'classroom', capacity: 100, building: 'C', floor: '2', status: 'available' },
  { id: '8', name: 'Phòng học C2-03', type: 'classroom', capacity: 100, building: 'C', floor: '2', status: 'available' },
  { id: '9', name: 'Phòng học A2-01', type: 'classroom', capacity: 80, building: 'A', floor: '2', status: 'maintenance' },
  { id: '10', name: 'Phòng thực hành Vật lý', type: 'lab', capacity: 40, building: 'D', floor: '1', status: 'available' },
];

// Mock data for room bookings
const mockBookings = [
  {
    id: '1',
    roomId: '1',
    eventId: '1',
    eventName: 'Hội nghị Khoa học Công nghệ 2023',
    organizerName: 'Khoa Công nghệ Thông tin',
    startTime: '2025-05-15T08:00:00',
    endTime: '2025-05-15T17:00:00',
    status: 'approved',
    participantsCount: 250
  },
  {
    id: '2',
    roomId: '3',
    eventId: '2',
    eventName: 'Workshop Kỹ năng mềm cho sinh viên',
    organizerName: 'Phòng Công tác Sinh viên',
    startTime: '2025-05-20T13:30:00',
    endTime: '2025-05-20T17:00:00',
    status: 'approved',
    participantsCount: 70
  },
  {
    id: '3',
    roomId: '5',
    eventId: '3',
    eventName: 'Cuộc thi Lập trình IoT 2023',
    organizerName: 'CLB IT',
    startTime: '2025-05-22T08:00:00',
    endTime: '2025-05-22T17:00:00',
    status: 'approved',
    participantsCount: 55
  },
  {
    id: '4',
    roomId: '4',
    eventId: '4',
    eventName: 'Họp Hội đồng Khoa học',
    organizerName: 'Ban Giám hiệu',
    startTime: '2025-05-23T14:00:00',
    endTime: '2025-05-23T16:30:00',
    status: 'approved',
    participantsCount: 20
  },
  {
    id: '5',
    roomId: '1',
    eventId: '5',
    eventName: 'Đêm nhạc Chào tân sinh viên',
    organizerName: 'Đoàn Thanh niên',
    startTime: '2025-05-25T18:30:00',
    endTime: '2025-05-25T21:30:00',
    status: 'approved',
    participantsCount: 280
  },
  {
    id: '6',
    roomId: '2',
    eventId: '6',
    eventName: 'Hội thảo công nghệ AI trong giáo dục',
    organizerName: 'Khoa CNTT',
    startTime: '2025-05-24T09:00:00',
    endTime: '2025-05-24T16:00:00',
    status: 'approved',
    participantsCount: 160
  },
  {
    id: '7',
    roomId: '6',
    eventId: '7',
    eventName: 'Đào tạo kỹ năng nghiên cứu khoa học',
    organizerName: 'Phòng NCKH',
    startTime: '2025-05-21T08:00:00',
    endTime: '2025-05-21T11:30:00',
    status: 'approved',
    participantsCount: 85
  },
  {
    id: '8',
    roomId: '7',
    eventId: '8',
    eventName: 'Buổi giới thiệu việc làm',
    organizerName: 'Phòng Quan hệ doanh nghiệp',
    startTime: '2025-05-21T13:30:00',
    endTime: '2025-05-21T16:30:00',
    status: 'pending',
    participantsCount: 90
  },
];

// Helper function to get room type display name
const getRoomTypeDisplay = (type: string) => {
  const typeMap: Record<string, string> = {
    'conference': 'Hội trường',
    'seminar': 'Phòng hội thảo',
    'meeting': 'Phòng họp',
    'lab': 'Phòng thực hành',
    'classroom': 'Phòng học',
  };
  return typeMap[type] || type;
};

// Generate time slots from 7:00 to 22:00
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 7; i < 22; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Define work hours for the calendar
const workHourStart = 7; // 7:00 AM
const workHourEnd = 22;  // 10:00 PM

const RoomSchedule = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  
  // Get all buildings for filter
  const buildings = Array.from(new Set(mockRooms.map(room => room.building)));
  
  // Get all room types for filter
  const roomTypes = Array.from(new Set(mockRooms.map(room => room.type)));
  
  // Filter rooms based on selected building and type
  const filteredRooms = mockRooms.filter(room => 
    (selectedBuilding === 'all' || room.building === selectedBuilding) &&
    (selectedType === 'all' || room.type === selectedType)
  );
  
  // Get bookings for the selected date
  const getDayBookings = (roomId?: string) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return mockBookings.filter(booking => {
      const bookingStart = parseISO(booking.startTime);
      const bookingEnd = parseISO(booking.endTime);
      
      const isInDay = isWithinInterval(bookingStart, { start: dayStart, end: dayEnd }) || 
                       isWithinInterval(bookingEnd, { start: dayStart, end: dayEnd }) ||
                       (isBefore(bookingStart, dayStart) && isAfter(bookingEnd, dayEnd));
      
      return isInDay && (roomId ? booking.roomId === roomId : true);
    });
  };
  
  const dayBookings = getDayBookings();
  
  // Check if a time slot is booked for a specific room
  const isTimeSlotBooked = (roomId: string, timeSlot: string) => {
    const slotHour = parseInt(timeSlot.split(':')[0]);
    const slotStart = addHours(startOfDay(date), slotHour);
    const slotEnd = addHours(slotStart, 1);
    
    return mockBookings.some(booking => {
      const bookingStart = parseISO(booking.startTime);
      const bookingEnd = parseISO(booking.endTime);
      
      return booking.roomId === roomId && 
             (isWithinInterval(slotStart, { start: bookingStart, end: bookingEnd }) ||
              isWithinInterval(slotEnd, { start: bookingStart, end: bookingEnd }) ||
              (isBefore(slotStart, bookingStart) && isAfter(slotEnd, bookingEnd)));
    });
  };
  
  // Get booking for a specific room and time slot
  const getBookingForTimeSlot = (roomId: string, timeSlot: string) => {
    const slotHour = parseInt(timeSlot.split(':')[0]);
    const slotStart = addHours(startOfDay(date), slotHour);
    const slotEnd = addHours(slotStart, 1);
    
    return mockBookings.find(booking => {
      const bookingStart = parseISO(booking.startTime);
      const bookingEnd = parseISO(booking.endTime);
      
      return booking.roomId === roomId && 
             (isWithinInterval(slotStart, { start: bookingStart, end: bookingEnd }) ||
              isWithinInterval(slotEnd, { start: bookingStart, end: bookingEnd }) ||
              (isBefore(slotStart, bookingStart) && isAfter(slotEnd, bookingEnd)));
    });
  };
  
  // Move to previous day
  const previousDay = () => {
    setDate(prev => addDays(prev, -1));
  };
  
  // Move to next day
  const nextDay = () => {
    setDate(prev => addDays(prev, 1));
  };
  
  // Move to today
  const goToToday = () => {
    setDate(new Date());
  };
  
  // Handle opening booking details
  const handleOpenBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  // Calculate max rows for overflow scrolling
  const maxVisibleRows = 5; // Show at most 5 rooms at a time
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Lịch sử dụng phòng</h1>
            <p className="text-muted-foreground">Quản lý lịch đặt phòng và xem tình trạng sử dụng</p>
          </div>
          <div className="flex gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left md:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "dd/MM/yyyy", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setDate(d);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon" onClick={previousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Hôm nay
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger>
                <Building className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Chọn tòa nhà" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building} value={building}>
                    Tòa nhà {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại phòng</SelectItem>
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getRoomTypeDisplay(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Lịch sử dụng phòng - {format(date, "EEEE, dd/MM/yyyy", { locale: vi })}</CardTitle>
            <CardDescription>
              Sử dụng bảng thời gian để xem và quản lý lịch sử dụng phòng
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-md overflow-auto">
              <div className="min-w-[800px]">
                {/* Time slots header */}
                <div className="flex border-b">
                  <div className="w-[200px] shrink-0 border-r p-2 bg-muted flex items-center justify-center">
                    <span className="font-medium">Phòng</span>
                  </div>
                  <div className="flex flex-1">
                    {timeSlots.map(slot => (
                      <div key={slot} className="w-[60px] shrink-0 border-r p-2 text-center text-sm">
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room rows */}
                <ScrollArea className="h-[500px]">
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map(room => (
                      <div key={room.id} className="flex border-b hover:bg-muted/50">
                        <div 
                          className="w-[200px] shrink-0 border-r p-2 cursor-pointer"
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <div className="text-sm font-medium">{room.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center justify-between mt-1">
                            <span>
                              <Users className="inline h-3 w-3 mr-1" />
                              {room.capacity} người
                            </span>
                            <span>
                              {room.status === 'available' ? (
                                <Badge className="bg-green-500">Khả dụng</Badge>
                              ) : (
                                <Badge variant="outline" className="border-red-500 text-red-500">
                                  Bảo trì
                                </Badge>
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-1">
                          {timeSlots.map(slot => {
                            const isBooked = isTimeSlotBooked(room.id, slot);
                            const booking = isBooked ? getBookingForTimeSlot(room.id, slot) : null;
                            
                            return (
                              <div 
                                key={`${room.id}-${slot}`} 
                                className={cn(
                                  "w-[60px] shrink-0 border-r p-1 text-center text-xs overflow-hidden",
                                  isBooked ? "bg-blue-100 dark:bg-blue-900/30 cursor-pointer" : ""
                                )}
                                onClick={() => booking && handleOpenBookingDetails(booking)}
                              >
                                {isBooked && (
                                  <div className="truncate text-blue-600 dark:text-blue-400">
                                    {booking?.eventName?.split(' ').slice(0, 2).join(' ')}...
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      Không tìm thấy phòng phù hợp với bộ lọc hiện tại
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Danh sách đặt phòng trong ngày</CardTitle>
              <CardDescription>
                {dayBookings.length} lịch đặt phòng vào {format(date, "dd/MM/yyyy", { locale: vi })}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                {dayBookings.length > 0 ? (
                  <div className="space-y-4 p-4">
                    {dayBookings.map(booking => {
                      const room = mockRooms.find(r => r.id === booking.roomId);
                      const startTime = parseISO(booking.startTime);
                      const endTime = parseISO(booking.endTime);
                      
                      return (
                        <div 
                          key={booking.id} 
                          className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleOpenBookingDetails(booking)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{booking.eventName}</div>
                            <Badge className={booking.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {booking.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{room?.name}</span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                              </span>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{booking.participantsCount} người</span>
                            </div>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            Đơn vị: {booking.organizerName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Không có lịch đặt phòng nào trong ngày này
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Tổng số phòng:</div>
                <div className="flex justify-between items-center">
                  <span>Tổng số:</span>
                  <Badge variant="outline">{filteredRooms.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Đã sử dụng:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {new Set(dayBookings.map(b => b.roomId)).size}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Còn trống:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {filteredRooms.length - new Set(dayBookings.map(b => b.roomId)).size}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="font-medium">Số lịch đặt phòng:</div>
                <div className="flex justify-between items-center">
                  <span>Đã duyệt:</span>
                  <Badge className="bg-green-500">
                    {dayBookings.filter(b => b.status === 'approved').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Chờ duyệt:</span>
                  <Badge className="bg-yellow-500">
                    {dayBookings.filter(b => b.status === 'pending').length}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/facilities/room-requests">
                    Quản lý yêu cầu mượn phòng
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Booking Detail Dialog */}
      {selectedBooking && (
        <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBooking.eventName}</DialogTitle>
              <DialogDescription>
                Chi tiết về lịch đặt phòng này
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium">Sự kiện:</div>
                <div className="col-span-3">{selectedBooking.eventName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium">Đơn vị:</div>
                <div className="col-span-3">{selectedBooking.organizerName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium">Phòng:</div>
                <div className="col-span-3">{mockRooms.find(r => r.id === selectedBooking.roomId)?.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium">Thời gian:</div>
                <div className="col-span-3">
                  {format(parseISO(selectedBooking.startTime), 'HH:mm dd/MM/yyyy')} - 
                  {format(parseISO(selectedBooking.endTime), ' HH:mm dd/MM/yyyy')}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium">Số người:</div>
                <div className="col-span-3">{selectedBooking.participantsCount} người</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-sm font-medium">Trạng thái:</div>
                <div className="col-span-3">
                  <Badge className={selectedBooking.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {selectedBooking.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        toast.success('Đã phê duyệt yêu cầu mượn phòng');
                        setShowBookingDetails(false);
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Phê duyệt
                    </Button>
                    
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        toast.error('Đã từ chối yêu cầu mượn phòng');
                        setShowBookingDetails(false);
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Từ chối
                    </Button>
                  </>
                )}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowBookingDetails(false)}
                className="ml-auto"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default RoomSchedule;
