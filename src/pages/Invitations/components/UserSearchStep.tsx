/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Invitations/components/UserSearchStep.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Thêm Tabs
import {
  Loader2,
  Search,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Trash2,
  Users,
  ListFilter,
  XCircle,
  Filter,
  UsersRound,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useTimKiemNguoiDungDeMoi } from '@/hooks/queries/nguoiDungQueries';
import {
  NguoiDungTimKiemItem,
  TimKiemNguoiDungDeMoiParams,
} from '@/services/nguoiDung.service';
import { SuKienCoTheMoiItem } from '@/services/event.service';
import { UserCardForSearch } from './UserCardForSearch';
import { InvitedUserWithRole } from '../InviteToEventPage';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { useDonViList } from '@/hooks/queries/donViQueries';
import { useNganhHocListForSelect } from '@/hooks/queries/nganhHocQueries'; // Hook lấy ngành
import { useLopHocList } from '@/hooks/queries/lopHocQueries'; // Hook lấy lớp
import { DonViListItem } from '@/services/donVi.service';
import { NganhHocResponseMin } from '@/services/danhMuc.service';
import { LopHocListItemResponse } from '@/services/lopHoc.service';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox'; // Thêm Checkbox
import { Label } from '@/components/ui/label'; // Thêm Label
import { Separator } from '@/components/ui/separator';
import { TieuChiMoiHangLoat } from '@/services/invite.service';

interface UserSearchStepProps {
  selectedEvent: SuKienCoTheMoiItem;
  onUsersSelected: (
    selectedUsers: InvitedUserWithRole[],
    isBulkInvite?: boolean,
    bulkInviteCriteria?: any
  ) => void; // Thêm isBulkInvite và criteria
  onBack: () => void;
  initialUsersToInvite: InvitedUserWithRole[];
}

const USER_SEARCH_LIMIT = 8;

// Type cho tiêu chí mời hàng loạt ở FE
interface BulkInviteCriteriaFE {
  loaiNguoiDung:
    | 'TAT_CA_SV'
    | 'TAT_CA_GV'
    | 'SINH_VIEN_THEO_KHOA'
    | 'GIANG_VIEN_THEO_KHOA'
    | 'SINH_VIEN_THEO_LOP'
    | 'SINH_VIEN_THEO_NGANH';
  donViIDs?: number[]; // Khoa IDs, Lớp IDs
  nganhHocIDs?: number[];
  nienKhoaSV?: string;
  // ... các tiêu chí khác
}

export const UserSearchStep: React.FC<UserSearchStepProps> = ({
  selectedEvent,
  onUsersSelected,
  onBack,
  initialUsersToInvite,
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>(
    'individual'
  );

  // States cho mời cá nhân
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoaiNguoiDungIndividual, setSearchLoaiNguoiDungIndividual] =
    useState<'ALL' | 'SINH_VIEN' | 'GIANG_VIEN'>('ALL');
  const [searchDonViIDIndividual, setSearchDonViIDIndividual] = useState<
    number | undefined
  >(undefined);
  const [tempInvitedList, setTempInvitedList] =
    useState<InvitedUserWithRole[]>(initialUsersToInvite);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // States cho mời hàng loạt
  const [bulkInviteType, setBulkInviteType] = useState<
    BulkInviteCriteriaFE['loaiNguoiDung'] | ''
  >('');
  const [selectedBulkKhoaIDs, setSelectedBulkKhoaIDs] = useState<number[]>([]);
  const [selectedBulkNganhIDs, setSelectedBulkNganhIDs] = useState<number[]>(
    []
  );
  const [selectedBulkLopIDs, setSelectedBulkLopIDs] = useState<number[]>([]);
  const [bulkVaiTroDuKien, setBulkVaiTroDuKien] =
    useState<string>('Người tham dự');
  const [bulkGhiChu, setBulkGhiChu] = useState<string>(
    'Trân trọng kính mời bạn tham gia sự kiện của chúng tôi.'
  );

  // Data cho selects
  const { data: dsDonViAll, isLoading: isLoadingDonVi } = useDonViList({
    limit: 100,
    sortBy: 'LoaiDonVi,TenDonVi',
  });

  const dsKhoa = useMemo(
    () => dsDonViAll?.items.filter((dv) => dv.loaiDonVi === 'KHOA') || [],
    [dsDonViAll]
  );
  const dsLop = useMemo(
    () => dsDonViAll?.items.filter((dv) => dv.loaiDonVi === 'LOP_HOC') || [],
    [dsDonViAll]
  ); // Giả sử Lớp cũng là một loại Đơn Vị

  const { data: dsNganhHoc, isLoading: isLoadingNganh } =
    useNganhHocListForSelect(
      {
        limit: 100,
        khoaQuanLyID:
          selectedBulkKhoaIDs.length === 1 ? selectedBulkKhoaIDs[0] : undefined,
      },
      {
        enabled:
          selectedBulkKhoaIDs.length > 0 &&
          (bulkInviteType === 'SINH_VIEN_THEO_NGANH' ||
            bulkInviteType === 'SINH_VIEN_THEO_KHOA'),
      }
    );

  const queryParamsIndividual: TimKiemNguoiDungDeMoiParams = useMemo(
    () => ({
      suKienID: selectedEvent.suKienID,
      searchTerm: debouncedSearchTerm,
      loaiNguoiDung: searchLoaiNguoiDungIndividual,
      donViID: searchDonViIDIndividual,
      limit: USER_SEARCH_LIMIT,
    }),
    [
      selectedEvent.suKienID,
      debouncedSearchTerm,
      searchLoaiNguoiDungIndividual,
      searchDonViIDIndividual,
    ]
  );

  const {
    data: searchResults,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    isError: isErrorSearch,
    error: errorSearch,
  } = useTimKiemNguoiDungDeMoi(queryParamsIndividual, {
    enabled:
      activeTab === 'individual' &&
      !!debouncedSearchTerm &&
      debouncedSearchTerm.length >= 2,
  });

  const handleAddUserToInviteList = (user: NguoiDungTimKiemItem) => {
    if (tempInvitedList.find((u) => u.nguoiDungID === user.nguoiDungID)) {
      toast.info(`${user.hoTen} đã có trong danh sách mời.`);
      return;
    }
    setTempInvitedList((prev) => [
      ...prev,
      { ...user, vaiTroDuKienSK: '', ghiChuMoi: '' },
    ]);
    setSearchTerm('');
  };

  const handleRemoveUserFromInviteList = (nguoiDungID: number) => {
    setTempInvitedList((prev) =>
      prev.filter((u) => u.nguoiDungID !== nguoiDungID)
    );
  };

  const handleInviteFieldChange = (
    nguoiDungID: number,
    field: 'vaiTroDuKienSK' | 'ghiChuMoi',
    value: string
  ) => {
    setTempInvitedList((prev) =>
      prev.map((user) =>
        user.nguoiDungID === nguoiDungID ? { ...user, [field]: value } : user
      )
    );
  };

  const handleProceedToReview = () => {
    if (activeTab === 'individual') {
      if (tempInvitedList.length === 0) {
        toast.warning(
          'Vui lòng chọn ít nhất một người để mời theo danh sách cá nhân.'
        );
        return;
      }
      onUsersSelected(tempInvitedList, false);
    } else {
      // Bulk invite
      if (!bulkInviteType) {
        toast.warning('Vui lòng chọn một hình thức mời hàng loạt.');
        return;
      }
      const criteria: TieuChiMoiHangLoat = { loaiNguoiDung: bulkInviteType };
      if (
        bulkInviteType === 'SINH_VIEN_THEO_KHOA' ||
        bulkInviteType === 'GIANG_VIEN_THEO_KHOA'
      ) {
        if (selectedBulkKhoaIDs.length === 0) {
          toast.warning('Vui lòng chọn ít nhất một Khoa.');
          return;
        }
        criteria.donViIDs = selectedBulkKhoaIDs;
      }
      if (bulkInviteType === 'SINH_VIEN_THEO_LOP') {
        if (selectedBulkLopIDs.length === 0) {
          toast.warning('Vui lòng chọn ít nhất một Lớp.');
          return;
        }
        criteria.donViIDs = selectedBulkLopIDs; // Lớp cũng là đơn vị
      }
      if (bulkInviteType === 'SINH_VIEN_THEO_NGANH') {
        if (selectedBulkNganhIDs.length === 0) {
          toast.warning('Vui lòng chọn ít nhất một Ngành.');
          return;
        }
        criteria.nganhHocIDs = selectedBulkNganhIDs;
        if (selectedBulkKhoaIDs.length > 0)
          criteria.donViIDs = selectedBulkKhoaIDs; // Khoa chứa ngành
      }
      // Thêm các tiêu chí khác như niên khóa, etc. nếu có

      // Tạo một "dummy" user list cho review step, chỉ để hiển thị thông tin mời hàng loạt
      const bulkReviewItem: InvitedUserWithRole = {
        nguoiDungID: -1, // ID đặc biệt cho mời hàng loạt
        hoTen: `Mời hàng loạt: ${getBulkInviteTypeLabel(bulkInviteType)}`,
        email: `Theo tiêu chí đã chọn`,
        loaiNguoiDungHienThi: 'Nhóm người dùng',
        thongTinThem: generateBulkCriteriaDescription(
          criteria,
          dsKhoa,
          dsLop,
          dsNganhHoc || []
        ),
        vaiTroDuKienSK: bulkVaiTroDuKien,
        ghiChuMoi: bulkGhiChu,
      };
      onUsersSelected([bulkReviewItem], true, criteria);
    }
  };

  const getBulkInviteTypeLabel = (
    type: BulkInviteCriteriaFE['loaiNguoiDung'] | ''
  ): string => {
    switch (type) {
      case 'TAT_CA_SV':
        return 'Tất cả Sinh viên';
      case 'TAT_CA_GV':
        return 'Tất cả Giảng viên';
      case 'SINH_VIEN_THEO_KHOA':
        return 'Sinh viên theo Khoa';
      case 'GIANG_VIEN_THEO_KHOA':
        return 'Giảng viên theo Khoa';
      case 'SINH_VIEN_THEO_LOP':
        return 'Sinh viên theo Lớp';
      case 'SINH_VIEN_THEO_NGANH':
        return 'Sinh viên theo Ngành';
      default:
        return 'Chưa chọn hình thức';
    }
  };

  const generateBulkCriteriaDescription = (
    criteria: TieuChiMoiHangLoat,
    khoaList: DonViListItem[],
    lopList: DonViListItem[],
    nganhList: NganhHocResponseMin[]
  ): string => {
    let desc = getBulkInviteTypeLabel(criteria.loaiNguoiDung);
    if (criteria.donViIDs && criteria.donViIDs.length > 0) {
      const relevantDonVis = [...khoaList, ...lopList].filter((dv) =>
        criteria.donViIDs?.includes(dv.donViID)
      );
      if (relevantDonVis.length > 0) {
        desc += `: ${relevantDonVis.map((dv) => dv.tenDonVi).join(', ')}`;
      }
    }
    if (criteria.nganhHocIDs && criteria.nganhHocIDs.length > 0) {
      const relevantNganhs = nganhList.filter((ng) =>
        criteria.nganhHocIDs?.includes(ng.nganhHocID)
      );
      if (relevantNganhs.length > 0) {
        desc += ` (Ngành: ${relevantNganhs
          .map((ng) => ng.tenNganhHoc)
          .join(', ')})`;
      }
    }

    return desc;
  };

  // Toggle selection for Khoa, Nganh, Lop for bulk invite
  const toggleSelection = (
    id: number,
    list: number[],
    setList: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Bước 2: Chọn Đối Tượng Mời Cho Sự Kiện "{selectedEvent.tenSK}"
        </CardTitle>
        <CardDescription>
          Bạn có thể mời từng cá nhân hoặc mời hàng loạt theo các tiêu chí.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'individual' | 'bulk')
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger
              value="individual"
              className="text-base h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-ptit-blue/20 dark:data-[state=active]:text-ptit-blue"
            >
              <UserPlus className="mr-2 h-5 w-5" /> Mời Cá Nhân
            </TabsTrigger>
            <TabsTrigger
              value="bulk"
              className="text-base h-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary dark:data-[state=active]:bg-ptit-blue/20 dark:data-[state=active]:text-ptit-blue"
            >
              <UsersRound className="mr-2 h-5 w-5" /> Mời Hàng Loạt
            </TabsTrigger>
          </TabsList>

          {/* Tab Mời Cá Nhân */}
          <TabsContent value="individual" className="mt-6 space-y-6">
            {/* Search and Filters for Individual Invite */}
            <div className="p-4 border rounded-lg bg-muted/30 dark:bg-slate-800/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label
                    htmlFor="user-search-invite-individual"
                    className="block text-sm font-medium mb-1"
                  >
                    Tìm kiếm (Tên, Email, Mã số)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="user-search-invite-individual"
                      type="search"
                      placeholder="Nhập từ khóa tìm kiếm..."
                      className="pl-10 pr-4 py-2 text-base"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="filter-loaiNguoiDung-invite-individual"
                    className="block text-sm font-medium mb-1"
                  >
                    Loại người dùng
                  </label>
                  <Select
                    value={searchLoaiNguoiDungIndividual}
                    onValueChange={(
                      value: 'ALL' | 'SINH_VIEN' | 'GIANG_VIEN'
                    ) => setSearchLoaiNguoiDungIndividual(value)}
                  >
                    <SelectTrigger id="filter-loaiNguoiDung-invite-individual">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tất cả (SV & GV)</SelectItem>
                      <SelectItem value="SINH_VIEN">Sinh viên</SelectItem>
                      <SelectItem value="GIANG_VIEN">Giảng viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="filter-donVi-invite-individual"
                  className="block text-sm font-medium mb-1"
                >
                  Đơn vị (Khoa/Lớp/Bộ môn)
                </label>
                <Select
                  value={searchDonViIDIndividual?.toString() || 'all'}
                  onValueChange={(value) =>
                    setSearchDonViIDIndividual(
                      value === 'all' ? undefined : Number(value)
                    )
                  }
                  disabled={isLoadingDonVi}
                >
                  <SelectTrigger id="filter-donVi-invite-individual">
                    <SelectValue
                      placeholder={
                        isLoadingDonVi ? 'Đang tải đơn vị...' : 'Tất cả đơn vị'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">Tất cả đơn vị</SelectItem>
                    {(dsDonViAll?.items || []).map(
                      (
                        dv // Dùng dsDonViAll
                      ) => (
                        <SelectItem
                          key={dv.donViID}
                          value={dv.donViID.toString()}
                        >
                          {dv.tenDonVi} ({dv.loaiDonVi})
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Results for Individual */}
            {(isLoadingSearch || isFetchingSearch) &&
              debouncedSearchTerm.length >= 2 && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Đang tìm kiếm...
                  </p>
                </div>
              )}

            {debouncedSearchTerm.length >= 2 &&
              !isLoadingSearch &&
              !isFetchingSearch &&
              searchResults && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-md font-semibold">
                    Kết quả tìm kiếm ({searchResults.length}):
                  </h4>
                  {searchResults.length === 0 ? (
                    <p className="text-muted-foreground italic">
                      Không tìm thấy người dùng nào phù hợp.
                    </p>
                  ) : (
                    <ScrollArea className="h-[250px] border rounded-md p-2 bg-background dark:bg-slate-900/50">
                      <div className="space-y-2">
                        {searchResults.map((user) => (
                          <UserCardForSearch
                            key={user.nguoiDungID}
                            user={user}
                            onAdd={() => handleAddUserToInviteList(user)}
                            isAdded={
                              !!tempInvitedList.find(
                                (u) => u.nguoiDungID === user.nguoiDungID
                              )
                            }
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}

            <Separator className="my-6" />

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Users className="mr-2 h-6 w-6 text-primary" />
                Danh Sách Cá Nhân Sẽ Mời ({tempInvitedList.length})
              </h3>

              {tempInvitedList.length === 0 ? (
                <p className="text-muted-foreground italic">
                  Chưa có ai trong danh sách mời cá nhân.
                </p>
              ) : (
                <ScrollArea className="h-[300px] border rounded-lg p-1 md:p-2 bg-slate-50 dark:bg-slate-800/20">
                  <div className="space-y-3 p-2">
                    {tempInvitedList.map((user, index) => (
                      <Card
                        key={user.nguoiDungID}
                        className="p-3 shadow-sm bg-card"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-grow">
                            <Badge
                              variant="secondary"
                              className="text-sm h-7 w-7 flex items-center justify-center shrink-0"
                            >
                              {index + 1}
                            </Badge>
                            <img
                              src={
                                user.anhDaiDien ||
                                'https://jbagy.me/wp-content/uploads/2025/03/anh-dai-dien-zalo-dep-1.jpg'
                              }
                              alt={user.hoTen}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-foreground">
                                {user.hoTen}{' '}
                                <span className="text-xs text-muted-foreground">
                                  ({user.maDinhDanh})
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.thongTinThem}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0 sm:ml-auto"
                            onClick={() =>
                              handleRemoveUserFromInviteList(user.nguoiDungID)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa khỏi danh sách</span>
                          </Button>
                        </div>
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor={`vaiTro-${user.nguoiDungID}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Vai trò dự kiến ( )
                            </label>
                            <Input
                              id={`vaiTro-${user.nguoiDungID}`}
                              placeholder="VD: Khách mời, Ban tổ chức..."
                              value={user.vaiTroDuKienSK || ''}
                              onChange={(e) =>
                                handleInviteFieldChange(
                                  user.nguoiDungID,
                                  'vaiTroDuKienSK',
                                  e.target.value
                                )
                              }
                              className="mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`ghiChu-${user.nguoiDungID}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Ghi chú thêm ( )
                            </label>
                            <Textarea
                              id={`ghiChu-${user.nguoiDungID}`}
                              placeholder="Lời nhắn riêng cho người này..."
                              value={user.ghiChuMoi || ''}
                              onChange={(e) =>
                                handleInviteFieldChange(
                                  user.nguoiDungID,
                                  'ghiChuMoi',
                                  e.target.value
                                )
                              }
                              className="mt-1 text-sm h-[60px] resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>

          {/* Tab Mời Hàng Loạt */}
          <TabsContent value="bulk" className="mt-6 space-y-6">
            <Card className="p-4 md:p-6 shadow-sm border bg-muted/20 dark:bg-slate-800/20">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-xl flex items-center">
                  <Filter className="mr-2 h-5 w-5 text-primary" />
                  Tiêu Chí Mời Hàng Loạt
                </CardTitle>
                <CardDescription>
                  Chọn các tiêu chí để xác định nhóm người dùng bạn muốn mời.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <Label htmlFor="bulk-invite-type" className="font-semibold">
                    Hình thức mời
                  </Label>
                  <Select
                    value={bulkInviteType}
                    onValueChange={(val) =>
                      setBulkInviteType(
                        val as BulkInviteCriteriaFE['loaiNguoiDung']
                      )
                    }
                  >
                    <SelectTrigger id="bulk-invite-type" className="mt-1">
                      <SelectValue placeholder="Chọn hình thức mời hàng loạt..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TAT_CA_SV">
                        Tất cả Sinh viên
                      </SelectItem>
                      <SelectItem value="TAT_CA_GV">
                        Tất cả Giảng viên
                      </SelectItem>
                      <SelectItem value="SINH_VIEN_THEO_KHOA">
                        Sinh viên theo Khoa
                      </SelectItem>
                      <SelectItem value="GIANG_VIEN_THEO_KHOA">
                        Giảng viên theo Khoa
                      </SelectItem>
                      <SelectItem value="SINH_VIEN_THEO_LOP">
                        Sinh viên theo Lớp
                      </SelectItem>
                      <SelectItem value="SINH_VIEN_THEO_NGANH">
                        Sinh viên theo Ngành (trong Khoa đã chọn)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Các bộ lọc chi tiết cho mời hàng loạt */}
                {(bulkInviteType === 'SINH_VIEN_THEO_KHOA' ||
                  bulkInviteType === 'GIANG_VIEN_THEO_KHOA' ||
                  bulkInviteType === 'SINH_VIEN_THEO_NGANH') && (
                  <div>
                    <Label className="font-semibold">Chọn Khoa</Label>
                    <ScrollArea className="h-32 border rounded-md mt-1 p-2">
                      {dsKhoa.map((khoa) => (
                        <div
                          key={khoa.donViID}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={`khoa-${khoa.donViID}`}
                            checked={selectedBulkKhoaIDs.includes(khoa.donViID)}
                            onCheckedChange={() =>
                              toggleSelection(
                                khoa.donViID,
                                selectedBulkKhoaIDs,
                                setSelectedBulkKhoaIDs
                              )
                            }
                          />
                          <Label
                            htmlFor={`khoa-${khoa.donViID}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {khoa.tenDonVi}
                          </Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {bulkInviteType === 'SINH_VIEN_THEO_NGANH' &&
                  selectedBulkKhoaIDs.length > 0 && (
                    <div>
                      <Label className="font-semibold">
                        Chọn Ngành (thuộc Khoa đã chọn)
                      </Label>
                      <ScrollArea className="h-32 border rounded-md mt-1 p-2">
                        {isLoadingNganh && (
                          <p className="text-xs italic text-muted-foreground">
                            Đang tải ngành...
                          </p>
                        )}
                        {!isLoadingNganh &&
                          dsNganhHoc &&
                          dsNganhHoc.map((nganh) => (
                            <div
                              key={nganh.nganhHocID}
                              className="flex items-center space-x-2 py-1"
                            >
                              <Checkbox
                                id={`nganh-${nganh.nganhHocID}`}
                                checked={selectedBulkNganhIDs.includes(
                                  nganh.nganhHocID
                                )}
                                onCheckedChange={() =>
                                  toggleSelection(
                                    nganh.nganhHocID,
                                    selectedBulkNganhIDs,
                                    setSelectedBulkNganhIDs
                                  )
                                }
                              />
                              <Label
                                htmlFor={`nganh-${nganh.nganhHocID}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {nganh.tenNganhHoc}
                              </Label>
                            </div>
                          ))}
                        {!isLoadingNganh &&
                          (!dsNganhHoc || dsNganhHoc.length === 0) && (
                            <p className="text-xs italic">
                              Không có ngành nào cho khoa đã chọn.
                            </p>
                          )}
                      </ScrollArea>
                    </div>
                  )}

                {bulkInviteType === 'SINH_VIEN_THEO_LOP' && (
                  <div>
                    <Label className="font-semibold">Chọn Lớp</Label>
                    <ScrollArea className="h-40 border rounded-md mt-1 p-2">
                      {dsLop.map((lop) => (
                        <div
                          key={lop.donViID}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={`lop-${lop.donViID}`}
                            checked={selectedBulkLopIDs.includes(lop.donViID)}
                            onCheckedChange={() =>
                              toggleSelection(
                                lop.donViID,
                                selectedBulkLopIDs,
                                setSelectedBulkLopIDs
                              )
                            }
                          />
                          <Label
                            htmlFor={`lop-${lop.donViID}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {lop.tenDonVi} {lop.maDonVi && `(${lop.maDonVi})`}
                          </Label>
                        </div>
                      ))}
                      {dsLop.length === 0 && (
                        <p className="text-xs italic">Không có dữ liệu lớp.</p>
                      )}
                    </ScrollArea>
                  </div>
                )}

                {/* Vai trò và Ghi chú chung cho mời hàng loạt */}
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="bulk-vaitro" className="font-semibold">
                      Vai trò dự kiến (chung)
                    </Label>
                    <Input
                      id="bulk-vaitro"
                      value={bulkVaiTroDuKien}
                      onChange={(e) => setBulkVaiTroDuKien(e.target.value)}
                      placeholder="VD: Người tham dự, Khách mời..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulk-ghichu" className="font-semibold">
                      Ghi chú mời (chung)
                    </Label>
                    <Textarea
                      id="bulk-ghichu"
                      value={bulkGhiChu}
                      onChange={(e) => setBulkGhiChu(e.target.value)}
                      placeholder="Lời mời chung cho tất cả mọi người trong nhóm này..."
                      className="mt-1 h-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t dark:border-slate-700">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay Lại (Chọn sự kiện)
          </Button>
          <Button
            onClick={handleProceedToReview}
            disabled={
              (activeTab === 'individual' && tempInvitedList.length === 0) ||
              (activeTab === 'bulk' && !bulkInviteType)
            }
            className="bg-primary hover:bg-primary/90"
          >
            Tiếp Tục (Xem lại) <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
