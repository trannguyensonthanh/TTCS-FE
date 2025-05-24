
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Search, Calendar, Info, Edit, Trash, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';

interface Room {
  id: string;
  name: string;
  code: string;
  type: 'conference' | 'seminar' | 'meeting' | 'lab' | 'classroom';
  capacity: number;
  building: string;
  floor: string;
  features: string[];
  status: 'available' | 'maintenance' | 'reserved';
}

// Mock data for rooms
const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Hội trường A',
    code: 'HTA',
    type: 'conference',
    capacity: 300,
    building: 'A',
    floor: '1',
    features: ['projector', 'sound-system', 'air-conditioner'],
    status: 'available'
  },
  {
    id: '2',
    name: 'Hội trường B',
    code: 'HTB',
    type: 'conference',
    capacity: 250,
    building: 'B',
    floor: '1',
    features: ['projector', 'sound-system', 'air-conditioner'],
    status: 'available'
  },
  {
    id: '3',
    name: 'Phòng hội thảo B2-01',
    code: 'B2-01',
    type: 'seminar',
    capacity: 80,
    building: 'B',
    floor: '2',
    features: ['projector', 'whiteboard', 'air-conditioner'],
    status: 'available'
  },
  {
    id: '4',
    name: 'Phòng họp A3-01',
    code: 'A3-01',
    type: 'meeting',
    capacity: 30,
    building: 'A',
    floor: '3',
    features: ['projector', 'whiteboard', 'air-conditioner'],
    status: 'available'
  },
  {
    id: '5',
    name: 'Phòng thực hành CNTT',
    code: 'THCNTT',
    type: 'lab',
    capacity: 60,
    building: 'C',
    floor: '1',
    features: ['computers', 'projector', 'air-conditioner'],
    status: 'maintenance'
  },
  {
    id: '6',
    name: 'Phòng học C2-01',
    code: 'C2-01',
    type: 'classroom',
    capacity: 100,
    building: 'C',
    floor: '2',
    features: ['projector', 'whiteboard', 'air-conditioner'],
    status: 'available'
  },
  {
    id: '7',
    name: 'Phòng học C2-02',
    code: 'C2-02',
    type: 'classroom',
    capacity: 100,
    building: 'C',
    floor: '2',
    features: ['projector', 'whiteboard', 'air-conditioner'],
    status: 'reserved'
  },
  {
    id: '8',
    name: 'Phòng học C2-03',
    code: 'C2-03',
    type: 'classroom',
    capacity: 100,
    building: 'C',
    floor: '2',
    features: ['projector', 'whiteboard', 'air-conditioner'],
    status: 'available'
  },
  {
    id: '9',
    name: 'Phòng học A2-01',
    code: 'A2-01',
    type: 'classroom',
    capacity: 80,
    building: 'A',
    floor: '2',
    features: ['projector', 'whiteboard', 'air-conditioner'],
    status: 'maintenance'
  },
  {
    id: '10',
    name: 'Phòng thực hành Vật lý',
    code: 'THVL',
    type: 'lab',
    capacity: 40,
    building: 'D',
    floor: '1',
    features: ['lab-equipment', 'projector', 'whiteboard'],
    status: 'available'
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

// Helper function to get room status badge
const getRoomStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return <Badge className="bg-green-500">Khả dụng</Badge>;
    case 'maintenance':
      return <Badge variant="destructive">Bảo trì</Badge>;
    case 'reserved':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Đã đặt</Badge>;
    default:
      return <Badge variant="outline">Không xác định</Badge>;
  }
};

export default function Rooms() {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const filteredRooms = mockRooms.filter(room => {
    return (
      (room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === 'all' || room.type === filterType) &&
      (filterBuilding === 'all' || room.building === filterBuilding) &&
      (filterStatus === 'all' || room.status === filterStatus)
    );
  });

  const handleOpenRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setRoomDetailsOpen(true);
  };

  // Get unique buildings from mock data
  const buildings = Array.from(new Set(mockRooms.map(room => room.building)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản lý phòng</h1>
            <p className="text-muted-foreground">Quản lý các phòng học, phòng họp và phòng hội thảo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/facilities/room-schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Lịch sử dụng phòng
              </Link>
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Thêm phòng mới
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Danh sách phòng</CardTitle>
            <CardDescription>
              Quản lý tất cả các phòng trong cơ sở
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm phòng..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Tòa nhà" />
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
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại phòng</SelectItem>
                    <SelectItem value="conference">Hội trường</SelectItem>
                    <SelectItem value="seminar">Phòng hội thảo</SelectItem>
                    <SelectItem value="meeting">Phòng họp</SelectItem>
                    <SelectItem value="lab">Phòng thực hành</SelectItem>
                    <SelectItem value="classroom">Phòng học</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="available">Khả dụng</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="reserved">Đã đặt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue={isMobile ? "cards" : "table"}>
              <TabsList className="mb-4">
                <TabsTrigger value="cards">Hiển thị thẻ</TabsTrigger>
                <TabsTrigger value="table">Hiển thị bảng</TabsTrigger>
              </TabsList>

              <TabsContent value="cards">
                {filteredRooms.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRooms.map(room => (
                      <Card key={room.id} className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleOpenRoomDetails(room)}>
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{room.name}</CardTitle>
                              <CardDescription>Mã: {room.code}</CardDescription>
                            </div>
                            <div>
                              {getRoomStatusBadge(room.status)}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-4 w-4" />
                            <span>Tòa nhà {room.building}, Tầng {room.floor}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-1 h-4 w-4" />
                            <span>Sức chứa: {room.capacity} người</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="mr-2">Loại phòng:</span>
                            <Badge variant="outline">{getRoomTypeDisplay(room.type)}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {room.features.map((feature, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {feature.split('-').join(' ')}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    Không tìm thấy phòng nào phù hợp với tiêu chí tìm kiếm
                  </div>
                )}
              </TabsContent>

              <TabsContent value="table">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Tên phòng</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Tòa nhà</TableHead>
                        <TableHead className="text-center">Sức chứa</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                          <TableRow key={room.id}>
                            <TableCell className="font-medium">{room.code}</TableCell>
                            <TableCell>{room.name}</TableCell>
                            <TableCell>{getRoomTypeDisplay(room.type)}</TableCell>
                            <TableCell>Tòa nhà {room.building}, Tầng {room.floor}</TableCell>
                            <TableCell className="text-center">{room.capacity} người</TableCell>
                            <TableCell>{getRoomStatusBadge(room.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenRoomDetails(room)}>
                                  <Info className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            Không tìm thấy phòng nào phù hợp với tiêu chí tìm kiếm
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {selectedRoom && (
        <Dialog open={roomDetailsOpen} onOpenChange={setRoomDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedRoom.name}</DialogTitle>
              <DialogDescription>Mã phòng: {selectedRoom.code}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-muted-foreground">Tòa nhà:</div>
                <div className="col-span-2">Tòa nhà {selectedRoom.building}, Tầng {selectedRoom.floor}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-muted-foreground">Loại phòng:</div>
                <div className="col-span-2">{getRoomTypeDisplay(selectedRoom.type)}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-muted-foreground">Sức chứa:</div>
                <div className="col-span-2">{selectedRoom.capacity} người</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-muted-foreground">Trạng thái:</div>
                <div className="col-span-2">{getRoomStatusBadge(selectedRoom.status)}</div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <div className="text-muted-foreground">Trang thiết bị:</div>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {selectedRoom.features.map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature.split('-').join(' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <div className="flex gap-2 order-2 sm:order-1">
                <Button variant="outline" onClick={() => setRoomDetailsOpen(false)}>
                  Đóng
                </Button>
              </div>

              <div className="flex gap-2 order-1 sm:order-2">
                <Button asChild variant="default" className="w-full sm:w-auto">
                  <Link to="/facilities/room-schedule">
                    <Calendar className="mr-2 h-4 w-4" />
                    Xem lịch sử dụng
                  </Link>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
