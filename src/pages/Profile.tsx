
import React, { useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, Save, User, Phone, Mail, Calendar, School, Briefcase } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '0123456789', // Mock data
    dob: '01/01/1990', // Mock data
    address: 'Quận 1, TP.HCM', // Mock data
  });
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({
      ...personalInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Đổi mật khẩu thành công');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN_HE_THONG': 'Quản trị hệ thống',
      'CB_TO_CHUC_SU_KIEN': 'Cán bộ tổ chức sự kiện',
      'QUAN_LY_CSVC': 'Quản lý cơ sở vật chất',
      'BGH_DUYET_SK_TRUONG': 'Ban giám hiệu duyệt sự kiện',
      'TRUONG_KHOA': 'Trưởng khoa',
      'TRUONG_CLB': 'Trưởng câu lạc bộ'
    };
    
    return roleMap[role] || role;
  };

  // Get user type display name
  const getUserTypeDisplayName = (userType: string | undefined) => {
    if (!userType) return '';
    
    const userTypeMap: Record<string, string> = {
      'SINH_VIEN': 'Sinh viên',
      'GIANG_VIEN': 'Giảng viên',
      'NHAN_VIEN': 'Nhân viên'
    };
    
    return userTypeMap[userType] || userType;
  };

  // Make initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      
      <main className="flex-1 bg-muted/40 py-8">
        <div className="container">
          <div className="flex flex-col gap-8">
            {/* Profile header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{user?.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {getUserTypeDisplayName(user?.userType)}
                  </div>
                  {user?.roles.map((role, index) => (
                    <div 
                      key={index}
                      className="bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {getRoleDisplayName(role)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="personal-info" className="w-full">
              <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                <TabsTrigger value="personal-info">Thông tin cá nhân</TabsTrigger>
                <TabsTrigger value="security">Bảo mật</TabsTrigger>
              </TabsList>
              
              {/* Personal info tab */}
              <TabsContent value="personal-info">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                    <CardDescription>
                      Cập nhật thông tin cá nhân của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="flex items-center gap-2">
                            <User size={16} /> Họ và tên
                          </Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={personalInfo.fullName}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail size={16} /> Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            value={personalInfo.email}
                            onChange={handlePersonalInfoChange}
                            disabled
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone size={16} /> Số điện thoại
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={personalInfo.phone}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dob" className="flex items-center gap-2">
                            <Calendar size={16} /> Ngày sinh
                          </Label>
                          <Input
                            id="dob"
                            name="dob"
                            value={personalInfo.dob}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address" className="flex items-center gap-2">
                            <Briefcase size={16} /> Địa chỉ
                          </Label>
                          <Input
                            id="address"
                            name="address"
                            value={personalInfo.address}
                            onChange={handlePersonalInfoChange}
                          />
                        </div>
                      </div>

                      {user?.userType === 'SINH_VIEN' && (
                        <div className="border rounded-md p-4 bg-muted/50">
                          <h3 className="text-md font-medium mb-2 flex items-center gap-2">
                            <School size={16} /> Thông tin sinh viên
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">MSSV</Label>
                              <p>N19DCCN123</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Lớp</Label>
                              <p>D19CQCN01-N</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Ngành</Label>
                              <p>Công nghệ thông tin</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Khoa</Label>
                              <p>Công nghệ thông tin</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {user?.userType === 'GIANG_VIEN' && (
                        <div className="border rounded-md p-4 bg-muted/50">
                          <h3 className="text-md font-medium mb-2 flex items-center gap-2">
                            <School size={16} /> Thông tin giảng viên
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">Mã giảng viên</Label>
                              <p>GV12345</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Bộ môn</Label>
                              <p>Kỹ thuật phần mềm</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Khoa</Label>
                              <p>Công nghệ thông tin</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Học hàm/học vị</Label>
                              <p>Tiến sĩ</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Bảo mật</CardTitle>
                    <CardDescription>
                      Thay đổi mật khẩu và thiết lập bảo mật khác
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Mật khẩu mới</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={isChangingPassword}>
                          {isChangingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-muted py-6 border-t">
        <div className="container">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Học viện Công nghệ Bưu chính Viễn thông TPHCM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
