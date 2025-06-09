import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-mobile';

import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronLeft,
  Search,
  Users,
  Send,
  Calendar,
  MapPin,
  CheckCircle,
  Mail,
  UserPlus,
  Filter,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { Separator } from '@/components/ui/separator';

// Mock event data
const mockEvents = [
  {
    id: '1',
    title: 'Hội nghị Khoa học Công nghệ 2023',
    startDate: '2023-11-15T08:00:00',
    endDate: '2023-11-15T17:00:00',
    location: 'Hội trường A',
    hostUnit: 'Khoa Công nghệ Thông tin',
    hostUnitId: '2',
    status: 'approved',
    participants: 150,
  },
  {
    id: '3',
    title: 'Cuộc thi Lập trình IoT 2023',
    startDate: '2023-12-01T08:00:00',
    endDate: '2023-12-02T17:00:00',
    location: 'Khu vực thực hành',
    hostUnit: 'CLB IT',
    hostUnitId: '3',
    status: 'approved',
    participants: 200,
  },
  {
    id: '5',
    title: 'Đêm nhạc Chào tân sinh viên',
    startDate: '2023-10-25T18:30:00',
    endDate: '2023-10-25T21:30:00',
    location: 'Sân vận động',
    hostUnit: 'Đoàn Thanh niên',
    hostUnitId: '4',
    status: 'completed',
    participants: 500,
  },
];

// Mock students data
const mockStudents = [
  {
    id: 'SV001',
    name: 'Nguyễn Văn An',
    code: 'B19DCCN001',
    email: 'anb19dccn001@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    className: 'D19CQCN01',
    major: 'Công nghệ thông tin',
  },
  {
    id: 'SV002',
    name: 'Trần Thị Bình',
    code: 'B19DCCN002',
    email: 'binhb19dccn002@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    className: 'D19CQCN01',
    major: 'Công nghệ thông tin',
  },
  {
    id: 'SV003',
    name: 'Lê Văn Chính',
    code: 'B19DCCN003',
    email: 'chinhb19dccn003@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    className: 'D19CQCN01',
    major: 'Công nghệ thông tin',
  },
  {
    id: 'SV004',
    name: 'Phạm Thị Dung',
    code: 'B19DCCN004',
    email: 'dungb19dccn004@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    className: 'D19CQCN02',
    major: 'Công nghệ thông tin',
  },
  {
    id: 'SV005',
    name: 'Hoàng Văn Em',
    code: 'B19DCCN005',
    email: 'emb19dccn005@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    className: 'D19CQCN02',
    major: 'Công nghệ thông tin',
  },
  {
    id: 'SV006',
    name: 'Ngô Thị Phương',
    code: 'B19DCDT001',
    email: 'phuongb19dcdt001@ptit.edu.vn',
    unitId: '4',
    unitName: 'Khoa ĐTVT',
    className: 'D19CQDT01',
    major: 'Điện tử viễn thông',
  },
  {
    id: 'SV007',
    name: 'Vũ Văn Quang',
    code: 'B19DCDT002',
    email: 'quangb19dcdt002@ptit.edu.vn',
    unitId: '4',
    unitName: 'Khoa ĐTVT',
    className: 'D19CQDT01',
    major: 'Điện tử viễn thông',
  },
  {
    id: 'SV008',
    name: 'Mai Thị Liên',
    code: 'B20DCCN001',
    email: 'lienb20dccn001@ptit.edu.vn',
    unitId: '3',
    unitName: 'CLB IT',
    className: 'D20CQCN01',
    major: 'Công nghệ thông tin',
  },
  {
    id: 'SV009',
    name: 'Trương Văn Nam',
    code: 'B20DCCN002',
    email: 'namb20dccn002@ptit.edu.vn',
    unitId: '3',
    unitName: 'CLB IT',
    className: 'D20CQCN01',
    major: 'Công nghệ thông tin',
  },
  {
    id: 'SV010',
    name: 'Đỗ Thị Oanh',
    code: 'B20DCCN003',
    email: 'oanhb20dccn003@ptit.edu.vn',
    unitId: '3',
    unitName: 'CLB IT',
    className: 'D20CQCN01',
    major: 'Công nghệ thông tin',
  },
];

// Mock lecturers data
const mockLecturers = [
  {
    id: 'GV001',
    name: 'PGS. TS. Nguyễn Văn X',
    code: 'NVXCNTT',
    email: 'xnv@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    position: 'Trưởng khoa',
  },
  {
    id: 'GV002',
    name: 'TS. Trần Thị Y',
    code: 'TTY',
    email: 'ytt@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    position: 'Phó trưởng khoa',
  },
  {
    id: 'GV003',
    name: 'ThS. Lê Văn Z',
    code: 'LVZ',
    email: 'zlv@ptit.edu.vn',
    unitId: '2',
    unitName: 'Khoa CNTT',
    position: 'Giảng viên',
  },
  {
    id: 'GV004',
    name: 'TS. Phạm Văn A',
    code: 'PVA',
    email: 'apv@ptit.edu.vn',
    unitId: '4',
    unitName: 'Khoa ĐTVT',
    position: 'Trưởng khoa',
  },
  {
    id: 'GV005',
    name: 'ThS. Hoàng Thị B',
    code: 'HTB',
    email: 'bht@ptit.edu.vn',
    unitId: '4',
    unitName: 'Khoa ĐTVT',
    position: 'Giảng viên',
  },
];

// Mock invited data
const mockInvited = [
  {
    userId: 'SV001',
    eventId: '1',
    status: 'accepted',
    invitedAt: '2023-10-20T10:00:00',
  },
  {
    userId: 'SV002',
    eventId: '1',
    status: 'pending',
    invitedAt: '2023-10-20T10:00:00',
  },
  {
    userId: 'SV003',
    eventId: '1',
    status: 'rejected',
    invitedAt: '2023-10-20T10:00:00',
  },
  {
    userId: 'GV001',
    eventId: '1',
    status: 'accepted',
    invitedAt: '2023-10-20T10:00:00',
  },
  {
    userId: 'SV008',
    eventId: '3',
    status: 'accepted',
    invitedAt: '2023-10-20T10:00:00',
  },
  {
    userId: 'SV009',
    eventId: '3',
    status: 'pending',
    invitedAt: '2023-10-20T10:00:00',
  },
];

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const EventParticipants = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('students');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedMajor, setSelectedMajor] = useState('all');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  // Find the current event
  const event = mockEvents.find((e) => e.id === eventId);

  // If event not found or user is not authorized
  if (!event || !user || user.donViId !== event.hostUnitId) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Không có quyền truy cập</CardTitle>
              <CardDescription>
                Bạn không có quyền truy cập vào trang này hoặc sự kiện không tồn
                tại.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link to="/events">
                <Button>Quay lại danh sách sự kiện</Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  // Get already invited participants
  const invitedParticipants = mockInvited
    .filter((invite) => invite.eventId === eventId)
    .map((invite) => invite.userId);

  // Filter students based on search and filters
  const filteredStudents = mockStudents.filter(
    (student) =>
      // Filter by unit
      student.unitId === user.donViId &&
      // Filter by search term
      (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      // Filter by class
      (selectedClass === 'all' || student.className === selectedClass) &&
      // Filter by major
      (selectedMajor === 'all' || student.major === selectedMajor)
  );

  // Filter lecturers based on search
  const filteredLecturers = mockLecturers.filter(
    (lecturer) =>
      // Filter by unit
      lecturer.unitId === user.donViId &&
      // Filter by search term
      (lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique classes for filter
  const classes = Array.from(
    new Set(
      mockStudents
        .filter((student) => student.unitId === user.donViId)
        .map((student) => student.className)
    )
  );

  // Get unique majors for filter
  const majors = Array.from(
    new Set(
      mockStudents
        .filter((student) => student.unitId === user.donViId)
        .map((student) => student.major)
    )
  );

  // Handle invite participants
  const handleInviteParticipants = () => {
    if (selectedParticipants.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một người tham gia');
      return;
    }

    // Mock invite logic - in a real app, this would be an API call
    toast.success(
      `Đã gửi lời mời đến ${selectedParticipants.length} người tham gia sự kiện`
    );
    setSelectedParticipants([]);
  };

  // Handle select all visible participants
  const handleSelectAll = () => {
    const currentList =
      currentTab === 'students' ? filteredStudents : filteredLecturers;
    const ids = currentList.map((person) => person.id);

    if (selectedParticipants.length === ids.length) {
      // If all are selected, deselect all
      setSelectedParticipants([]);
    } else {
      // Otherwise, select all
      setSelectedParticipants(ids);
    }
  };

  // Toggle selection of a participant
  const toggleSelection = (id: string) => {
    setSelectedParticipants((current) =>
      current.includes(id)
        ? current.filter((userId) => userId !== id)
        : [...current, id]
    );
  };

  // Check if a participant is already invited
  const isAlreadyInvited = (id: string) => {
    return invitedParticipants.includes(id);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/events">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Mời người tham gia sự kiện
            </h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Thông tin sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  Thời gian: {formatDate(event.startDate)}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Địa điểm: {event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  Đơn vị tổ chức: {event.hostUnit}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Số người đã mời</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Tổng số lời mời đã gửi:</span>
                </div>
                <Badge variant="secondary">
                  {
                    mockInvited.filter((invite) => invite.eventId === eventId)
                      .length
                  }
                </Badge>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">Đã xác nhận tham gia:</span>
                </div>
                <Badge className="bg-green-500">
                  {
                    mockInvited.filter(
                      (invite) =>
                        invite.eventId === eventId &&
                        invite.status === 'accepted'
                    ).length
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hành động</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInviteParticipants}
                className="w-full"
                disabled={selectedParticipants.length === 0}
              >
                <Send className="mr-2 h-4 w-4" />
                Gửi lời mời ({selectedParticipants.length})
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách người tham gia tiềm năng</CardTitle>
            <CardDescription>
              Chọn những người của đơn vị bạn mà bạn muốn mời tham gia sự kiện
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="students">Sinh viên</TabsTrigger>
                  <TabsTrigger value="lecturers">Giảng viên</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleSelectAll}>
                    {selectedParticipants.length ===
                    (currentTab === 'students'
                      ? filteredStudents.length
                      : filteredLecturers.length)
                      ? 'Bỏ chọn tất cả'
                      : 'Chọn tất cả'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Tìm kiếm ${
                      currentTab === 'students' ? 'sinh viên' : 'giảng viên'
                    }...`}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {currentTab === 'students' && (
                  <div className="flex gap-4 flex-wrap md:flex-nowrap">
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả lớp</SelectItem>
                        {classes.map((className) => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedMajor}
                      onValueChange={setSelectedMajor}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Ngành" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả ngành</SelectItem>
                        {majors.map((major) => (
                          <SelectItem key={major} value={major}>
                            {major}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <TabsContent value="students" className="m-0">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Chọn</TableHead>
                        <TableHead className="w-[100px]">MSSV</TableHead>
                        <TableHead>Họ và tên</TableHead>
                        {!isMobile && (
                          <>
                            <TableHead>Email</TableHead>
                            <TableHead>Lớp</TableHead>
                          </>
                        )}
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={selectedParticipants.includes(
                                    student.id
                                  )}
                                  onCheckedChange={() =>
                                    toggleSelection(student.id)
                                  }
                                />
                              </div>
                            </TableCell>
                            <TableCell>{student.code}</TableCell>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            {!isMobile && (
                              <>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.className}</TableCell>
                              </>
                            )}
                            <TableCell>
                              {isAlreadyInvited(student.id) ? (
                                <div className="flex items-center space-x-1">
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                  <span className="text-xs text-green-600">
                                    Đã mời
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <UserPlus className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs text-blue-600">
                                    Chưa mời
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={isMobile ? 4 : 6}
                            className="text-center py-6 text-muted-foreground"
                          >
                            Không tìm thấy sinh viên nào phù hợp
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="lecturers" className="m-0">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Chọn</TableHead>
                        <TableHead>Họ và tên</TableHead>
                        {!isMobile && (
                          <>
                            <TableHead>Email</TableHead>
                            <TableHead>Chức vụ</TableHead>
                          </>
                        )}
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLecturers.length > 0 ? (
                        filteredLecturers.map((lecturer) => (
                          <TableRow key={lecturer.id}>
                            <TableCell>
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  checked={selectedParticipants.includes(
                                    lecturer.id
                                  )}
                                  onCheckedChange={() =>
                                    toggleSelection(lecturer.id)
                                  }
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {lecturer.name}
                            </TableCell>
                            {!isMobile && (
                              <>
                                <TableCell>{lecturer.email}</TableCell>
                                <TableCell>{lecturer.position}</TableCell>
                              </>
                            )}
                            <TableCell>
                              {isAlreadyInvited(lecturer.id) ? (
                                <div className="flex items-center space-x-1">
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                  <span className="text-xs text-green-600">
                                    Đã mời
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <UserPlus className="h-4 w-4 text-blue-500" />
                                  <span className="text-xs text-blue-600">
                                    Chưa mời
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={isMobile ? 3 : 5}
                            className="text-center py-6 text-muted-foreground"
                          >
                            Không tìm thấy giảng viên nào phù hợp
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/events">
              <Button variant="outline">Quay lại</Button>
            </Link>
            <Button
              onClick={handleInviteParticipants}
              disabled={selectedParticipants.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Gửi lời mời ({selectedParticipants.length})
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default EventParticipants;
