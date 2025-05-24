
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText, 
  AlarmClock, 
  CalendarX 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { motion } from 'framer-motion';

// Mock data for cancel requests
const mockCancelRequests = [
  {
    id: '1',
    eventId: '3',
    eventTitle: 'Cuộc thi Lập trình IoT 2023',
    requestDate: '2023-11-01T10:23:45',
    reason: 'Không thể tổ chức do thiếu kinh phí và thiết bị cần thiết.',
    status: 'pending',
    requestor: 'Nguyễn Văn A',
    requestorUnit: 'CLB IT',
  },
  {
    id: '2',
    eventId: '5',
    eventTitle: 'Đêm nhạc Chào tân sinh viên',
    requestDate: '2023-10-10T08:15:30',
    reason: 'Thời tiết dự báo không thuận lợi, có nguy cơ mưa bão.',
    status: 'approved',
    requestor: 'Trần Thị B',
    requestorUnit: 'Đoàn Thanh niên',
    approvedBy: 'Lê Văn C',
    approveDate: '2023-10-12T14:30:15',
  },
  {
    id: '3',
    eventId: '2',
    eventTitle: 'Workshop Kỹ năng mềm cho sinh viên',
    requestDate: '2023-11-05T16:45:20',
    reason: 'Diễn giả chính không thể tham gia vào thời gian đã định.',
    status: 'rejected',
    requestor: 'Phạm Văn D',
    requestorUnit: 'Phòng Công tác Sinh viên',
    approvedBy: 'Hoàng Văn E',
    approveDate: '2023-11-07T09:10:05',
    rejectReason: 'Có thể tìm diễn giả thay thế hoặc điều chỉnh thời gian.',
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
    minute: '2-digit'
  }).format(date);
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch(status) {
    case 'approved':
      return <Badge className="bg-green-500">Đã duyệt</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">Chờ duyệt</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Đã từ chối</Badge>;
    default:
      return <Badge variant="outline">Không xác định</Badge>;
  }
};

const EventsCancelRequests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  
  // Filter requests based on search term
  const filteredRequests = mockCancelRequests.filter(request => {
    return (
      request.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestorUnit.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Check if user is BGH
  const isBGH = user?.roles.includes('BGH_DUYET_SK_TRUONG');
  
  // Handle approve request
  const handleApprove = () => {
    toast.success('Đã duyệt yêu cầu hủy sự kiện');
    setOpenApproveDialog(false);
  };
  
  // Handle reject request
  const handleReject = () => {
    if (!reasonText.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    toast.success('Đã từ chối yêu cầu hủy sự kiện');
    setOpenRejectDialog(false);
    setReasonText('');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      
      <main className="flex-1 container py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Yêu cầu hủy sự kiện</h1>
              <p className="text-muted-foreground">Danh sách các yêu cầu hủy sự kiện và trạng thái xử lý</p>
            </div>
            {user?.roles.includes('CB_TO_CHUC_SU_KIEN') && (
              <Button className="flex gap-2">
                <CalendarX className="h-4 w-4" />
                <span>Tạo yêu cầu hủy mới</span>
              </Button>
            )}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Danh sách yêu cầu hủy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm theo tên sự kiện, người yêu cầu hoặc đơn vị..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Sự kiện</TableHead>
                      <TableHead>Người yêu cầu</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Ngày yêu cầu</TableHead>
                      <TableHead className="w-[150px]">Lý do hủy</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.eventTitle}</TableCell>
                          <TableCell>{request.requestor}</TableCell>
                          <TableCell>{request.requestorUnit}</TableCell>
                          <TableCell>{formatDate(request.requestDate)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" className="h-8 text-blue-500 hover:text-blue-700">
                                  Xem lý do
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Lý do hủy sự kiện</DialogTitle>
                                  <DialogDescription>
                                    {request.eventTitle}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="p-4 border rounded-md bg-muted/50">
                                  <p>{request.reason}</p>
                                </div>
                                {request.status === 'rejected' && (
                                  <div>
                                    <h4 className="font-medium text-destructive mb-2">Lý do từ chối:</h4>
                                    <p className="p-4 border border-destructive rounded-md">
                                      {request.rejectReason}
                                    </p>
                                  </div>
                                )}
                                {request.status === 'approved' && (
                                  <div className="text-sm text-muted-foreground">
                                    Được duyệt bởi: {request.approvedBy}<br/>
                                    Ngày duyệt: {formatDate(request.approveDate)}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-right">
                            {isBGH && request.status === 'pending' ? (
                              <div className="flex gap-2 justify-end">
                                <Dialog open={openApproveDialog && selectedRequest === request.id} onOpenChange={(open) => {
                                  if (!open) setSelectedRequest(null);
                                  setOpenApproveDialog(open);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-green-600 border-green-600"
                                      onClick={() => setSelectedRequest(request.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Duyệt
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Duyệt yêu cầu hủy sự kiện</DialogTitle>
                                      <DialogDescription>
                                        Bạn có chắc chắn muốn duyệt yêu cầu hủy sự kiện "{request.eventTitle}"?
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => {
                                          setSelectedRequest(null);
                                          setOpenApproveDialog(false);
                                        }}
                                      >
                                        Hủy
                                      </Button>
                                      <Button onClick={handleApprove}>Xác nhận duyệt</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                
                                <Dialog open={openRejectDialog && selectedRequest === request.id} onOpenChange={(open) => {
                                  if (!open) setSelectedRequest(null);
                                  setOpenRejectDialog(open);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="text-red-600 border-red-600"
                                      onClick={() => setSelectedRequest(request.id)}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Từ chối
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Từ chối yêu cầu hủy sự kiện</DialogTitle>
                                      <DialogDescription>
                                        Vui lòng cung cấp lý do từ chối yêu cầu hủy sự kiện "{request.eventTitle}".
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      placeholder="Nhập lý do từ chối..."
                                      value={reasonText}
                                      onChange={(e) => setReasonText(e.target.value)}
                                      className="min-h-[100px]"
                                    />
                                    <DialogFooter>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => {
                                          setSelectedRequest(null);
                                          setOpenRejectDialog(false);
                                          setReasonText('');
                                        }}
                                      >
                                        Hủy
                                      </Button>
                                      <Button variant="destructive" onClick={handleReject}>
                                        Xác nhận từ chối
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                Chi tiết
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          Không có yêu cầu hủy sự kiện nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default EventsCancelRequests;
