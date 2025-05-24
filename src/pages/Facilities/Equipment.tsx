import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Filter,
  FileSpreadsheet,
  BarChart3,
  Printer,
  Laptop,
  Tv,
  Mic,
  Speaker,
  Camera,
  PencilRuler,
  Box,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
interface TrangThietBiResponse {
  thietBiID: string; // Hoặc number
  tenThietBi: string;
  moTa?: string | null;
  // Các thông tin như quantity, available, location, status, imageUrl, category SẼ KHÔNG nằm ở bảng TrangThietBi gốc
  // mà phải được lấy từ bảng Phong_ThietBi hoặc một bảng quản lý kho/tồn kho thiết bị nếu có.
  // Trong phạm vi database hiện tại, bảng TrangThietBi chỉ là danh mục.
}
// Mock equipment categories
const EQUIPMENT_CATEGORIES = [
  { id: '1', name: 'Thiết bị điện tử' },
  { id: '2', name: 'Thiết bị âm thanh' },
  { id: '3', name: 'Thiết bị văn phòng' },
  { id: '4', name: 'Thiết bị khác' },
];

// Mock equipment data
const MOCK_EQUIPMENT = [
  {
    id: '1',
    name: 'Máy chiếu Epson EB-X05',
    category: '1',
    categoryName: 'Thiết bị điện tử',
    quantity: 10,
    available: 8,
    location: 'Kho thiết bị tầng 1',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    icon: <Tv className="h-8 w-8 text-blue-500" />,
  },
  {
    id: '2',
    name: 'Micro không dây Shure',
    category: '2',
    categoryName: 'Thiết bị âm thanh',
    quantity: 15,
    available: 12,
    location: 'Kho thiết bị tầng 2',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc',
    icon: <Mic className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: '3',
    name: 'Loa di động JBL Eon',
    category: '2',
    categoryName: 'Thiết bị âm thanh',
    quantity: 6,
    available: 4,
    location: 'Kho thiết bị tầng 2',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d',
    icon: <Speaker className="h-8 w-8 text-indigo-500" />,
  },
  {
    id: '4',
    name: 'Máy in HP LaserJet Pro',
    category: '3',
    categoryName: 'Thiết bị văn phòng',
    quantity: 5,
    available: 5,
    location: 'Văn phòng hành chính',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6',
    icon: <Printer className="h-8 w-8 text-green-500" />,
  },
  {
    id: '5',
    name: 'Laptop Dell Latitude',
    category: '1',
    categoryName: 'Thiết bị điện tử',
    quantity: 8,
    available: 2,
    location: 'Phòng CNTT',
    status: 'limited',
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
    icon: <Laptop className="h-8 w-8 text-blue-500" />,
  },
  {
    id: '6',
    name: 'Máy ảnh Canon EOS',
    category: '1',
    categoryName: 'Thiết bị điện tử',
    quantity: 3,
    available: 0,
    location: 'Phòng truyền thông',
    status: 'unavailable',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
    icon: <Camera className="h-8 w-8 text-blue-500" />,
  },
  {
    id: '7',
    name: 'Bảng vẽ điện tử',
    category: '4',
    categoryName: 'Thiết bị khác',
    quantity: 4,
    available: 3,
    location: 'Phòng thiết kế',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1519211975560-4ca611f5a72a',
    icon: <PencilRuler className="h-8 w-8 text-yellow-500" />,
  },
];

// Helper function to get status badge
const getStatusBadge = (
  status: string,
  available: number,
  quantity: number
) => {
  if (status === 'unavailable' || available === 0) {
    return <Badge variant="destructive">Không có sẵn</Badge>;
  } else if (available < quantity / 2) {
    return <Badge className="bg-yellow-500">Còn ít</Badge>;
  } else {
    return <Badge className="bg-green-500">Có sẵn</Badge>;
  }
};

const Equipment = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filter equipment based on search term and filters
  const filteredEquipment = MOCK_EQUIPMENT.filter((equipment) => {
    // Search term filter
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      filterCategory === 'all' || equipment.category === filterCategory;

    // Status filter
    const matchesStatus =
      filterStatus === 'all' || equipment.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get equipment per category for stats
  const categoryStats = EQUIPMENT_CATEGORIES.map((category) => {
    const equipmentInCategory = MOCK_EQUIPMENT.filter(
      (e) => e.category === category.id
    );
    const totalQuantity = equipmentInCategory.reduce(
      (sum, e) => sum + e.quantity,
      0
    );
    const availableQuantity = equipmentInCategory.reduce(
      (sum, e) => sum + e.available,
      0
    );

    return {
      ...category,
      total: totalQuantity,
      available: availableQuantity,
    };
  });

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
              <h1 className="text-3xl font-bold tracking-tight">
                Quản lý thiết bị
              </h1>
              <p className="text-muted-foreground">
                Theo dõi và quản lý thiết bị phục vụ sự kiện
              </p>
            </div>
            {user?.roles.includes('QUAN_LY_CSVC') && (
              <div className="flex gap-2">
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex gap-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>Thêm thiết bị mới</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Thêm thiết bị mới</DialogTitle>
                      <DialogDescription>
                        Nhập thông tin thiết bị cần thêm vào hệ thống.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Tên thiết bị
                        </label>
                        <Input id="name" placeholder="Nhập tên thiết bị..." />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="category"
                          className="text-sm font-medium"
                        >
                          Loại thiết bị
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại thiết bị" />
                          </SelectTrigger>
                          <SelectContent>
                            {EQUIPMENT_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="quantity"
                            className="text-sm font-medium"
                          >
                            Số lượng
                          </label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="location"
                            className="text-sm font-medium"
                          >
                            Vị trí
                          </label>
                          <Input id="location" placeholder="Nơi lưu trữ..." />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="image" className="text-sm font-medium">
                          Hình ảnh (tùy chọn)
                        </label>
                        <Input id="image" type="file" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                      >
                        Hủy
                      </Button>
                      <Button>Lưu thiết bị</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="flex gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Xuất báo cáo</span>
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Tổng thiết bị</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {MOCK_EQUIPMENT.reduce((sum, e) => sum + e.quantity, 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Đang sẵn có</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-500">
                  {MOCK_EQUIPMENT.reduce((sum, e) => sum + e.available, 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Đang sử dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-500">
                  {MOCK_EQUIPMENT.reduce(
                    (sum, e) => sum + (e.quantity - e.available),
                    0
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Loại thiết bị</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {EQUIPMENT_CATEGORIES.length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="grid" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <TabsList>
                <TabsTrigger value="grid">Hiển thị lưới</TabsTrigger>
                <TabsTrigger value="list">Hiển thị danh sách</TabsTrigger>
                <TabsTrigger value="categories">Theo loại</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm thiết bị..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Loại thiết bị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    {EQUIPMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Có sẵn</SelectItem>
                    <SelectItem value="limited">Còn ít</SelectItem>
                    <SelectItem value="unavailable">Không có sẵn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="grid" className="space-y-4">
              {filteredEquipment.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredEquipment.map((equipment) => (
                    <Card
                      key={equipment.id}
                      className="overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {equipment.imageUrl ? (
                          <img
                            src={equipment.imageUrl}
                            alt={equipment.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {equipment.icon}
                          </div>
                        )}
                        {getStatusBadge(
                          equipment.status,
                          equipment.available,
                          equipment.quantity
                        )}
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xl">
                          {equipment.name}
                        </CardTitle>
                        <CardDescription>
                          {equipment.categoryName} • {equipment.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {equipment.available}/{equipment.quantity} có sẵn
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{equipment.name}</DialogTitle>
                              <DialogDescription>
                                Thông tin chi tiết về thiết bị
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {equipment.imageUrl && (
                                <div className="aspect-video w-full overflow-hidden rounded-md">
                                  <img
                                    src={equipment.imageUrl}
                                    alt={equipment.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Loại thiết bị
                                  </h4>
                                  <p>{equipment.categoryName}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Vị trí
                                  </h4>
                                  <p>{equipment.location}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Tổng số lượng
                                  </h4>
                                  <p>{equipment.quantity}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Hiện có sẵn
                                  </h4>
                                  <p>{equipment.available}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">
                                  Lịch sử sử dụng
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Đã được sử dụng trong 12 sự kiện.
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {user?.roles.includes('QUAN_LY_CSVC') && (
                          <>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-muted-foreground text-center">
                      Không tìm thấy thiết bị nào phù hợp với tiêu chí tìm kiếm
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Tên thiết bị</th>
                        <th className="text-left p-4">Loại</th>
                        <th className="text-left p-4">Vị trí</th>
                        <th className="text-center p-4">Số lượng</th>
                        <th className="text-center p-4">Còn sẵn</th>
                        <th className="text-center p-4">Trạng thái</th>
                        <th className="text-right p-4">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEquipment.length > 0 ? (
                        filteredEquipment.map((equipment) => (
                          <tr
                            key={equipment.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                  {equipment.icon || (
                                    <Box className="h-5 w-5" />
                                  )}
                                </div>
                                <span className="font-medium">
                                  {equipment.name}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">{equipment.categoryName}</td>
                            <td className="p-4">{equipment.location}</td>
                            <td className="p-4 text-center">
                              {equipment.quantity}
                            </td>
                            <td className="p-4 text-center">
                              {equipment.available}
                            </td>
                            <td className="p-4 text-center">
                              {getStatusBadge(
                                equipment.status,
                                equipment.available,
                                equipment.quantity
                              )}
                            </td>
                            <td className="p-4 text-right space-x-1">
                              <Button size="sm" variant="outline">
                                Chi tiết
                              </Button>
                              {user?.roles.includes('QUAN_LY_CSVC') && (
                                <>
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="p-4 text-center text-muted-foreground"
                          >
                            Không tìm thấy thiết bị nào phù hợp với tiêu chí tìm
                            kiếm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryStats.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>
                        {category.available} / {category.total} thiết bị có sẵn
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (category.available / category.total) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFilterCategory(category.id);
                          document
                            .querySelector('[value="grid"]')
                            ?.dispatchEvent(
                              new Event('click', { bubbles: true })
                            );
                        }}
                      >
                        Xem thiết bị
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Equipment;
