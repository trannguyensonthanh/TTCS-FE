
// Define all available system roles
export type UserRole = 
  | 'ADMIN_HE_THONG' 
  | 'CB_TO_CHUC_SU_KIEN'
  | 'BGH_DUYET_SK_TRUONG'
  | 'QUAN_LY_CSVC'
  | 'TRUONG_KHOA'
  | 'TRUONG_CLB'
  | 'BI_THU_DOAN'
  | 'SINH_VIEN'
  | 'GIANG_VIEN';

// User type information
export type UserType = 'NHAN_VIEN' | 'GIANG_VIEN' | 'SINH_VIEN';

// Map roles to user types for validation
export const roleToUserType: Record<UserRole, UserType> = {
  ADMIN_HE_THONG: 'NHAN_VIEN',
  CB_TO_CHUC_SU_KIEN: 'NHAN_VIEN',
  QUAN_LY_CSVC: 'NHAN_VIEN',
  BGH_DUYET_SK_TRUONG: 'GIANG_VIEN',
  TRUONG_KHOA: 'GIANG_VIEN',
  TRUONG_CLB: 'SINH_VIEN',
  BI_THU_DOAN: 'SINH_VIEN',
  SINH_VIEN: 'SINH_VIEN',
  GIANG_VIEN: 'GIANG_VIEN',
};

// Define permissions for each role
export interface Permission {
  canView: string[];
  canCreate: string[];
  canEdit: string[];
  canDelete: string[];
  canApprove: string[];
}

export const rolePermissions: Record<UserRole, Permission> = {
  ADMIN_HE_THONG: {
    canView: ['*'], // * means all resources
    canCreate: ['*'],
    canEdit: ['*'],
    canDelete: ['*'],
    canApprove: ['*'],
  },
  CB_TO_CHUC_SU_KIEN: {
    canView: ['SuKien', 'YeuCauHuySK', 'YeuCauMuonPhong', 'YcMuonPhongChiTiet', 'YeuCauDoiPhong', 'TaiLieuSK', 'SK_MoiThamGia', 'ThongKeSuKien'],
    canCreate: ['SuKien', 'YeuCauHuySK', 'YeuCauMuonPhong', 'YcMuonPhongChiTiet', 'YeuCauDoiPhong', 'TaiLieuSK', 'SK_MoiThamGia'],
    canEdit: ['SuKien', 'YeuCauMuonPhong', 'YcMuonPhongChiTiet', 'TaiLieuSK', 'SK_MoiThamGia'],
    canDelete: ['SuKien', 'YeuCauMuonPhong', 'YcMuonPhongChiTiet', 'TaiLieuSK'],
    canApprove: [],
  },
  BGH_DUYET_SK_TRUONG: {
    canView: ['SuKien', 'YeuCauHuySK', 'YeuCauMuonPhong', 'YcMuonPhongChiTiet', 'ChiTietDatPhong', 'ThongKeSuKien'],
    canCreate: [],
    canEdit: ['SuKien.TrangThaiSkID', 'YeuCauHuySK.TrangThaiYcHuySkID'],
    canDelete: [],
    canApprove: ['SuKien', 'YeuCauHuySK'],
  },
  QUAN_LY_CSVC: {
    canView: ['SuKien', 'YeuCauMuonPhong', 'YcMuonPhongChiTiet', 'ChiTietDatPhong', 'YeuCauDoiPhong', 'Phong', 'LoaiPhong', 'TrangThietBi', 'Phong_ThietBi', 'TrangThaiPhong', 'ThongKePhong'],
    canCreate: ['ChiTietDatPhong', 'Phong', 'LoaiPhong', 'TrangThietBi', 'Phong_ThietBi'],
    canEdit: ['YeuCauMuonPhong.TrangThaiChungID', 'YcMuonPhongChiTiet.TrangThaiCtID', 'YeuCauDoiPhong.TrangThaiYcDoiPID', 'ChiTietDatPhong', 'Phong', 'LoaiPhong', 'TrangThietBi', 'Phong_ThietBi', 'TrangThaiPhong'],
    canDelete: ['Phong', 'LoaiPhong', 'TrangThietBi', 'Phong_ThietBi'],
    canApprove: ['YeuCauMuonPhong', 'YcMuonPhongChiTiet', 'YeuCauDoiPhong'],
  },
  TRUONG_KHOA: {
    canView: ['SuKien.DaDuyet', 'YeuCauMuonPhong.DaDuyet', 'YcMuonPhongChiTiet.DaDuyet', 'ChiTietDatPhong', 'YeuCauDoiPhong', 'ThongTinGiangVien', 'ThongTinSinhVien', 'ThongKeKhoa'],
    canCreate: ['SK_MoiThamGia'],
    canEdit: ['SK_MoiThamGia'],
    canDelete: [],
    canApprove: [],
  },
  TRUONG_CLB: {
    canView: ['SuKien.DaDuyet', 'YeuCauMuonPhong.DaDuyet', 'YcMuonPhongChiTiet.DaDuyet', 'ChiTietDatPhong', 'YeuCauDoiPhong', 'ThanhVienCLB', 'ThongKeCLB'],
    canCreate: ['SK_MoiThamGia'],
    canEdit: ['SK_MoiThamGia', 'ThanhVienCLB'],
    canDelete: [],
    canApprove: [],
  },
  BI_THU_DOAN: {
    canView: ['SuKien.DaDuyet', 'YeuCauMuonPhong.DaDuyet', 'YcMuonPhongChiTiet.DaDuyet', 'ChiTietDatPhong', 'YeuCauDoiPhong', 'ThanhVienDoan', 'ThongKeDoan', 'ThongTinSinhVien'],
    canCreate: ['SK_MoiThamGia', 'SuKien_Doan', 'YeuCauMuonPhong_Doan'],
    canEdit: ['SK_MoiThamGia', 'ThanhVienDoan', 'SuKien_Doan'],
    canDelete: [],
    canApprove: ['SuKien_Doan.CapDuoi'],
  },
  SINH_VIEN: {
    canView: ['SuKien.DaDuyet', 'TaiLieuSK.CongKhai'],
    canCreate: ['DanhGiaSK'],
    canEdit: ['SK_MoiThamGia'],
    canDelete: [],
    canApprove: [],
  },
  GIANG_VIEN: {
    canView: ['SuKien.DaDuyet', 'TaiLieuSK.CongKhai'],
    canCreate: ['DanhGiaSK'],
    canEdit: ['SK_MoiThamGia'],
    canDelete: [],
    canApprove: [],
  },
};

// Authorization helper functions
export const canView = (role: UserRole, resource: string): boolean => {
  const permissions = rolePermissions[role];
  
  // Handle resources with .DaDuyet or .CongKhai qualifiers
  if (resource.includes('.')) {
    const [baseResource, qualifier] = resource.split('.');
    if (permissions.canView.includes('*')) return true;
    
    // Check if role can view this qualified resource
    return permissions.canView.some(perm => {
      if (perm === '*') return true;
      if (perm === resource) return true;
      
      // Check if there's a permission with the same base resource and qualifier
      const [permResource, permQualifier] = perm.split('.');
      return permResource === baseResource && permQualifier === qualifier;
    });
  }
  
  // Regular resource check
  return permissions.canView.includes('*') || permissions.canView.includes(resource);
};

export const canCreate = (role: UserRole, resource: string): boolean => {
  const permissions = rolePermissions[role];
  return permissions.canCreate.includes('*') || permissions.canCreate.includes(resource);
};

export const canEdit = (role: UserRole, resource: string): boolean => {
  const permissions = rolePermissions[role];
  return permissions.canEdit.includes('*') || permissions.canEdit.includes(resource);
};

export const canDelete = (role: UserRole, resource: string): boolean => {
  const permissions = rolePermissions[role];
  return permissions.canDelete.includes('*') || permissions.canDelete.includes(resource);
};

export const canApprove = (role: UserRole, resource: string): boolean => {
  const permissions = rolePermissions[role];
  return permissions.canApprove.includes('*') || permissions.canApprove.includes(resource);
};

// Check if a user has a specific permission on a resource
export const hasPermission = (
  role: UserRole,
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve',
  resource: string
): boolean => {
  switch (action) {
    case 'view':
      return canView(role, resource);
    case 'create':
      return canCreate(role, resource);
    case 'edit':
      return canEdit(role, resource);
    case 'delete':
      return canDelete(role, resource);
    case 'approve':
      return canApprove(role, resource);
    default:
      return false;
  }
};

// Check if event can be viewed based on its status and user's role
export const canViewEvent = (role: UserRole, eventStatus: string, isPublic: boolean): boolean => {
  // Admin, event organizers and approvers can see all events
  if(['ADMIN_HE_THONG', 'CB_TO_CHUC_SU_KIEN', 'BGH_DUYET_SK_TRUONG'].includes(role)) {
    return true;
  }
  
  // Others can only see approved and public events
  return eventStatus === 'approved' && isPublic;
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleDisplayMap: Record<UserRole, string> = {
    ADMIN_HE_THONG: 'Admin hệ thống',
    CB_TO_CHUC_SU_KIEN: 'Cán bộ tổ chức sự kiện',
    BGH_DUYET_SK_TRUONG: 'Ban giám hiệu duyệt sự kiện',
    QUAN_LY_CSVC: 'Quản lý cơ sở vật chất',
    TRUONG_KHOA: 'Trưởng khoa',
    TRUONG_CLB: 'Chủ nhiệm câu lạc bộ',
    BI_THU_DOAN: 'Bí thư đoàn',
    SINH_VIEN: 'Sinh viên',
    GIANG_VIEN: 'Giảng viên'
  };
  
  return roleDisplayMap[role] || role;
};
