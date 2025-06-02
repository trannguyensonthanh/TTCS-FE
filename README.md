![image.png](attachment:2e419796-d9eb-45f4-ba60-0245af126816:image.png)

---

**I. QUẢN LÝ NGƯỜI DÙNG, VAI TRÒ, TÀI KHOẢN, HỌC VỤ (Phiên bản cuối cùng)**

**1. Bảng NguoiDung (Users - Thông tin cá nhân cốt lõi)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| NguoiDungID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaDinhDanh | VARCHAR(50) | UNIQUE, NULL (Mã nhân sự/SV chung nếu có) |
| HoTen | NVARCHAR(150) | NOT NULL |
| Email | VARCHAR(150) | UNIQUE, NOT NULL |
| SoDienThoai | VARCHAR(20) | UNIQUE, NULL |
| AnhDaiDien | VARCHAR(500) | NULL (URL ảnh) |
| NgayTao | DATETIME | DEFAULT GETDATE() |
| IsActive | BIT | DEFAULT 1 (Tài khoản người dùng còn hoạt động) |

**2. Bảng TaiKhoan (Accounts - Thông tin đăng nhập)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| TaiKhoanID | INT | PRIMARY KEY, IDENTITY(1,1) |
| NguoiDungID | INT | NOT NULL, UNIQUE, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) ON DELETE CASCADE |
| TenDangNhap | VARCHAR(100) | NOT NULL, UNIQUE |
| MatKhauHash | VARCHAR(255) | NOT NULL |
| Salt | VARCHAR(100) | NOT NULL |
| LanDangNhapCuoi | DATETIME | NULL |
| TrangThaiTk | VARCHAR(50) | NOT NULL, DEFAULT 'Active' (VD: 'Active', 'Locked', 'Disabled') |
| NgayTaoTk | DATETIME | DEFAULT GETDATE() |

**3. Bảng DonVi (Departments/Units - Khoa, Phòng, Ban, CLB, Bộ môn...)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| DonViID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenDonVi | NVARCHAR(200) | NOT NULL, UNIQUE |
| MaDonVi | VARCHAR(50) | UNIQUE, NULL |
| LoaiDonVi | NVARCHAR(100) | NOT NULL (VD: 'KHOA', 'PHONG', 'BAN', 'TRUNG_TAM', 'BO_MON', 'CLB') |
| DonViChaID | INT | NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| MoTaDv | NVARCHAR(500) | NULL |

**4. Bảng NganhHoc (Academic Programs/Majors)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| NganhHocID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenNganhHoc | NVARCHAR(200) | NOT NULL, UNIQUE |
| MaNganhHoc | VARCHAR(50) | UNIQUE, NULL |
| KhoaQuanLyID | INT | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| MoTaNH | NVARCHAR(MAX) | NULL |
| CoChuyenNganh | BIT | NOT NULL, DEFAULT 0 |

**5. Bảng ChuyenNganh (Specializations)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| ChuyenNganhID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenChuyenNganh | NVARCHAR(200) | NOT NULL |
| MaChuyenNganh | VARCHAR(50) | UNIQUE, NULL |
| NganhHocID | INT | NOT NULL, FOREIGN KEY REFERENCES NganhHoc(NganhHocID) |
| MoTaCN | NVARCHAR(MAX) | NULL |
|  |  | UNIQUE (NganhHocID, TenChuyenNganh) |

**6. Bảng LopHoc (Classes)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| LopID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenLop | NVARCHAR(100) | NOT NULL, UNIQUE |
| MaLop | VARCHAR(50) | UNIQUE, NULL |
| NganhHocID | INT | NOT NULL, FOREIGN KEY REFERENCES NganhHoc(NganhHocID) |
| ChuyenNganhID | INT | NULL, FOREIGN KEY REFERENCES ChuyenNganh(ChuyenNganhID) |
| NienKhoa | VARCHAR(50) | NULL |

**7. Bảng ThongTinSinhVien (Student Profile Information)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| NguoiDungID | INT | PRIMARY KEY, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) ON DELETE CASCADE |
| MaSinhVien | VARCHAR(50) | NOT NULL, UNIQUE |
| LopID | INT | NOT NULL, FOREIGN KEY REFERENCES LopHoc(LopID) |
| KhoaHoc | VARCHAR(50) | NULL (VD: 'K2020') |
| HeDaoTao | NVARCHAR(100) | NULL (VD: 'Chính quy', 'Chất lượng cao') |
| NgayNhapHoc | DATE | NULL |
| TrangThaiHocTap | NVARCHAR(50) | NULL (VD: 'Đang học', 'Tốt nghiệp', 'Bảo lưu') |

**8. Bảng ThongTinGiangVien (Lecturer Profile Information)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| NguoiDungID | INT | PRIMARY KEY, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) ON DELETE CASCADE |
| MaGiangVien | VARCHAR(50) | NOT NULL, UNIQUE |
| DonViCongTacID | INT | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) (Khoa/Bộ môn chính) |
| HocVi | NVARCHAR(100) | NULL |
| HocHam | NVARCHAR(100) | NULL (GS, PGS) |
| ChucDanhGD | NVARCHAR(100) | NULL (Giảng viên, GVC) |
| ChuyenMonChinh | NVARCHAR(255) | NULL |

**9. Bảng VaiTroHeThong (System Functional Roles - Chỉ chứa các chức vụ/quyền hạn)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| VaiTroID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaVaiTro | VARCHAR(50) | NOT NULL, UNIQUE (VD: 'TRUONG_KHOA', 'QUAN_LY_CSVC', 'BGH_DUYET_SK_TRUONG', 'CB_TO_CHUC_SU_KIEN', 'TRUONG_CLB', 'GV_CO_VAN_CLB', 'ADMIN_HE_THONG') |
| TenVaiTro | NVARCHAR(150) | NOT NULL |
| MoTaVT | NVARCHAR(500) | NULL |

**10. Bảng NguoiDung_VaiTro (User Functional Role Assignments)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| GanVaiTroID | INT | PRIMARY KEY, IDENTITY(1,1) |
| NguoiDungID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| VaiTroID | INT | NOT NULL, FOREIGN KEY REFERENCES VaiTroHeThong(VaiTroID) |
| DonViID | INT | NULL, FOREIGN KEY REFERENCES DonVi(DonViID) (Đơn vị nơi vai trò được thực thi) |
| NgayBatDau | DATE | NOT NULL, DEFAULT GETDATE() |
| NgayKetThuc | DATE | NULL |
| GhiChuGanVT | NVARCHAR(500) | NULL |
|  |  | UNIQUE (NguoiDungID, VaiTroID, DonViID, NgayBatDau) |

**II. QUẢN LÝ SỰ KIỆN**

**11. Bảng TrangThaiSK**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| TrangThaiSkID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaTrangThai | VARCHAR(50) | NOT NULL, UNIQUE |
| TenTrangThai | NVARCHAR(150) | NOT NULL |
| MoTa | NVARCHAR(500) | NULL |

**12. Bảng SuKien**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| SuKienID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenSK | NVARCHAR(300) | NOT NULL |
| TgBatDauDK | DATETIME | NOT NULL |
| TgKetThucDK | DATETIME | NOT NULL |
| NguoiChuTriID | INT | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| TenChuTriNgoai | NVARCHAR(150) | NULL |
| DonViChuTriNgoai | NVARCHAR(200) | NULL |
| DonViChuTriID | INT | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| SlThamDuDK | INT | NULL |
| MoTaChiTiet | NVARCHAR(MAX) | NULL |
| TrangThaiSkID | INT | NOT NULL, FOREIGN KEY REFERENCES TrangThaiSK(TrangThaiSkID) |
| NguoiTaoID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayTaoSK | DATETIME | DEFAULT GETDATE() |
| NguoiDuyetBGHID | INT | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayDuyetBGH | DATETIME | NULL |
| LyDoTuChoiBGH | NVARCHAR(MAX) | NULL |
| LyDoHuyNguoiTao | NVARCHAR(MAX) | NULL |
| IsCongKhaiNoiBo | BIT | DEFAULT 0 |
| KhachMoiNgoaiGhiChu | NVARCHAR(MAX) | NULL |
|  |  | CONSTRAINT CK_SK_CoChuTri CHECK ((NguoiChuTriID IS NOT NULL) OR (TenChuTriNgoai IS NOT NULL)) |
| LoaiSuKienID |  |  |
| TgBatDauThucTe  | DATETIME  | NULL |
| TgKetThucThucTe  | DATETIME  | NULL
CONSTRAINT CK_SuKien_ThoiGian CHECK (TgBatDauDK < TgKetThucDK),
CONSTRAINT CK_SuKien_ThoiGianThucTe CHECK (TgBatDauThucTe IS NULL OR TgKetThucThucTe IS NULL OR TgBatDauThucTe < TgKetThucThucTe) |

**Bảng LoaiSuKien**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| LoaiSuKienID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaLoaiSK | VARCHAR(50) | NOT NULL, UNIQUE (VD: 'HOI_THAO_KH', 'VAN_NGHE') |
| TenLoaiSK | NVARCHAR(150) | NOT NULL (VD: 'Hội thảo Khoa học', 'Văn nghệ') |
| MoTaLoaiSK | NVARCHAR(500) | NULL |
| IsActive | BIT | DEFAULT 1 (Loại sự kiện này có còn được sử dụng không) |

**13. Bảng SK_DonViThamGia**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| SuKienID | INT | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) ON DELETE CASCADE |
| DonViID | INT | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| VaiTroDonViSK | NVARCHAR(500) | NULL |
|  |  | PRIMARY KEY (SuKienID, DonViID) |

**14. Bảng SK_MoiThamGia**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| MoiThamGiaID | BIGINT | PRIMARY KEY, IDENTITY(1,1) |
| SuKienID | INT | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) ON DELETE CASCADE |
| NguoiDuocMoiID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| VaiTroDuKienSK | NVARCHAR(200) | NULL |
| IsChapNhanMoi | BIT | NULL |
| TgPhanHoiMoi | DATETIME | NULL |
| GhiChuMoi | NVARCHAR(500) | NULL |

---

**III. QUẢN LÝ PHÒNG VÀ YÊU CẦU MƯỢN PHÒNG**

**15. Bảng LoaiPhong**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| LoaiPhongID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenLoaiPhong | NVARCHAR(100) | NOT NULL, UNIQUE |
| MoTa | NVARCHAR(255) | NULL |

**16. Bảng TrangThaiPhong**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| TrangThaiPhongID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenTrangThai | NVARCHAR(100) | NOT NULL, UNIQUE |
| MoTa | NVARCHAR(255) | NULL |

**Bảng ToaNha (Building)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| ToaNhaID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaToaNha | VARCHAR(20) | NOT NULL, UNIQUE |
| TenToaNha | NVARCHAR(100) | NOT NULL |
| CoSoID | INT | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| MoTaToaNha | NVARCHAR(255) | NULL |

**Bảng LoaiTang (Định nghĩa các loại/số tầng trừu tượng) - Tên cột cập nhật**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| LoaiTangID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaLoaiTang | VARCHAR(20) | NOT NULL, UNIQUE (VD: 'TRET', 'L1', 'L2', 'HB1') |
| TenLoaiTang | NVARCHAR(100) | NOT NULL (VD: 'Tầng Trệt', 'Tầng 1', 'Tầng 2', 'Hầm B1') |
| SoThuTu | INT | NULL (Dùng để sắp xếp hoặc logic, VD: 0, 1, 2, -1) |
| MoTa | NVARCHAR(255) | NULL (Đổi từ MoTaLoaiTang) |

**Bảng ToaNha_Tang (Bảng trung gian N-N, đại diện tầng vật lý) - Tên cột cập nhật**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| ToaNhaTangID | INT | PRIMARY KEY, IDENTITY(1,1) |
| ToaNhaID | INT | NOT NULL, FK REFERENCES dbo.ToaNha(ToaNhaID) |
| LoaiTangID | INT | NOT NULL, FK REFERENCES dbo.LoaiTang(LoaiTangID) |
| SoPhong | INT | NULL (Đổi từ SoPhongDuKien) |
| MoTa | NVARCHAR(500) | NULL (Đổi từ MoTaChiTietTang) |
|  |  | UNIQUE (ToaNhaID, LoaiTangID) |

**17. Bảng Phong**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| PhongID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenPhong | NVARCHAR(100) | NOT NULL |
| MaPhong | VARCHAR(50) | UNIQUE, NULL |
| LoaiPhongID | INT | NOT NULL, FOREIGN KEY REFERENCES LoaiPhong(LoaiPhongID) |
| SucChua | INT | NULL |
| TrangThaiPhongID | INT | NOT NULL, FOREIGN KEY REFERENCES TrangThaiPhong(TrangThaiPhongID) |
| MoTaChiTietPhong | NVARCHAR(MAX) | NULL |
| AnhMinhHoa | VARCHAR(500) | NULL |
| ToaNhaTangID | INT | FK REFERENCES ToaNha_Tang(ToaNhaTangID) (Sẽ đặt là NOT NULL sau khi cập nhật data cũ) |
| SoThuTuPhong | NVARCHAR(20) | NULL (Số phòng hoặc mã định danh trên tầng đó) |

**18. Bảng TrangThietBi**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| ThietBiID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenThietBi | NVARCHAR(150) | NOT NULL, UNIQUE |
| MoTa | NVARCHAR(500) | NULL |

**19. Bảng Phong_ThietBi**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| PhongID | INT | NOT NULL, FOREIGN KEY REFERENCES Phong(PhongID) |
| ThietBiID | INT | NOT NULL, FOREIGN KEY REFERENCES TrangThietBi(ThietBiID) |
| SoLuong | INT | DEFAULT 1 |
| TinhTrang | NVARCHAR(200) | NULL |
|  |  | PRIMARY KEY (PhongID, ThietBiID) |

**20. Bảng TrangThaiYeuCauPhong**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| TrangThaiYcpID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaTrangThai | VARCHAR(50) | NOT NULL, UNIQUE |
| TenTrangThai | NVARCHAR(150) | NOT NULL |
| LoaiApDung | VARCHAR(20) | NOT NULL ('CHUNG', 'CHI_TIET') |
| MoTa | NVARCHAR(500) | NULL |

**21. Bảng YeuCauMuonPhong (Header)**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| YcMuonPhongID | INT | PRIMARY KEY, IDENTITY(1,1) |
| SuKienID | INT | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) |
| NguoiYeuCauID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayYeuCau | DATETIME | DEFAULT GETDATE() |
| TrangThaiChungID | INT | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauPhong(TrangThaiYcpID) |
| NguoiDuyetTongCSVCID | INT | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayDuyetTongCSVC | DATETIME | NULL |
| GhiChuChungYc | NVARCHAR(MAX) | NULL |

**22. Bảng YcMuonPhongChiTiet (Detail)**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| YcMuonPhongCtID | INT | PRIMARY KEY, IDENTITY(1,1) |
| YcMuonPhongID | INT | NOT NULL, FOREIGN KEY REFERENCES YeuCauMuonPhong(YcMuonPhongID) ON DELETE CASCADE |
| MoTaNhomPhong | NVARCHAR(200) | NULL |
| SlPhongNhomNay | INT | NOT NULL, DEFAULT 1 |
| LoaiPhongYcID | INT | NULL, FOREIGN KEY REFERENCES LoaiPhong(LoaiPhongID) |
| SucChuaYc | INT | NULL |
| ThietBiThemYc | NVARCHAR(MAX) | NULL |
| TgMuonDk | DATETIME | NOT NULL |
| TgTraDk | DATETIME | NOT NULL |
| TrangThaiCtID | INT | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauPhong(TrangThaiYcpID) |
| GhiChuCtCSVC | NVARCHAR(MAX) | NULL |

**23. Bảng ChiTietDatPhong**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| DatPhongID | INT | PRIMARY KEY, IDENTITY(1,1) |
| YcMuonPhongCtID | INT | NOT NULL, FOREIGN KEY REFERENCES YcMuonPhongChiTiet(YcMuonPhongCtID) |
| PhongID | INT | NOT NULL, FOREIGN KEY REFERENCES Phong(PhongID) |
| TgNhanPhongTT | DATETIME | NULL |
| TgTraPhongTT | DATETIME | NULL |
| GhiChuDatPhong | NVARCHAR(MAX) | NULL |
|  |  | UNIQUE (YcMuonPhongCtID, PhongID) |

---

**IV. QUẢN LÝ CÁC YÊU CẦU HỦY/ĐỔI**

**24. Bảng TrangThaiYeuCauHuySK**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| TrangThaiYcHuySkID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaTrangThai | VARCHAR(50) | NOT NULL, UNIQUE |
| TenTrangThai | NVARCHAR(150) | NOT NULL |
| MoTa | NVARCHAR(500) | NULL |

**25. Bảng YeuCauHuySK**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| YcHuySkID | INT | PRIMARY KEY, IDENTITY(1,1) |
| SuKienID | INT | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) |
| NguoiYeuCauID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayYeuCauHuy | DATETIME | DEFAULT GETDATE() |
| LyDoHuy | NVARCHAR(MAX) | NOT NULL |
| TrangThaiYcHuySkID | INT | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauHuySK(TrangThaiYcHuySkID) |
| NguoiDuyetHuyBGHID | INT | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayDuyetHuyBGH | DATETIME | NULL |
| LyDoTuChoiHuyBGH | NVARCHAR(MAX) | NULL |

**26. Bảng TrangThaiYeuCauDoiPhong**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| TrangThaiYcDoiPID | INT | PRIMARY KEY, IDENTITY(1,1) |
| MaTrangThai | VARCHAR(50) | NOT NULL, UNIQUE |
| TenTrangThai | NVARCHAR(150) | NOT NULL |
| MoTa | NVARCHAR(500) | NULL |

**27. Bảng YeuCauDoiPhong**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| YcDoiPhongID | INT | PRIMARY KEY, IDENTITY(1,1) |
| YcMuonPhongCtID | INT | NOT NULL, FOREIGN KEY REFERENCES YcMuonPhongChiTiet(YcMuonPhongCtID) |
| DatPhongID_Cu | INT | NOT NULL, FOREIGN KEY REFERENCES ChiTietDatPhong(DatPhongID) |
| NguoiYeuCauID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayYeuCauDoi | DATETIME | DEFAULT GETDATE() |
| LyDoDoiPhong | NVARCHAR(MAX) | NOT NULL |
| YcPhongMoi_LoaiID | INT | NULL, FOREIGN KEY REFERENCES LoaiPhong(LoaiPhongID) |
| YcPhongMoi_SucChua | INT | NULL |
| YcPhongMoi_ThietBi | NVARCHAR(MAX) | NULL |
| TrangThaiYcDoiPID | INT | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauDoiPhong(TrangThaiYcDoiPID) |
| NguoiDuyetDoiCSVCID | INT | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayDuyetDoiCSVC | DATETIME | NULL |
| DatPhongID_Moi | INT | NULL, FOREIGN KEY REFERENCES ChiTietDatPhong(DatPhongID) |
| LyDoTuChoiDoiCSVC | NVARCHAR(MAX) | NULL |

---

**V. TIỆN ÍCH VÀ HỖ TRỢ KHÁC**

**28. Bảng LoaiTaiLieuSK**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| LoaiTaiLieuID | INT | PRIMARY KEY, IDENTITY(1,1) |
| TenLoaiTL | NVARCHAR(100) | NOT NULL, UNIQUE |

**29. Bảng TaiLieuSK**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| TaiLieuSkID | BIGINT | PRIMARY KEY, IDENTITY(1,1) |
| SuKienID | INT | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) ON DELETE CASCADE |
| LoaiTaiLieuID | INT | NOT NULL, FOREIGN KEY REFERENCES LoaiTaiLieuSK(LoaiTaiLieuID) |
| TenHienThiTL | NVARCHAR(255) | NOT NULL |
| DuongDanFile | VARCHAR(500) | NOT NULL |
| MoTaTL | NVARCHAR(MAX) | NULL |
| NguoiTaiLenID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| NgayTaiLen | DATETIME | DEFAULT GETDATE() |
| IsCongKhaiTL | BIT | DEFAULT 0 |

**30. Bảng DanhGiaSK**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| DanhGiaSkID | BIGINT | PRIMARY KEY, IDENTITY(1,1) |
| SuKienID | INT | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) |
| NguoiDanhGiaID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| DiemNoiDung | TINYINT | NULL, CHECK (DiemNoiDung BETWEEN 1 AND 5) |
| DiemToChuc | TINYINT | NULL, CHECK (DiemToChuc BETWEEN 1 AND 5) |
| DiemDiaDiem | TINYINT | NULL, CHECK (DiemDiaDiem BETWEEN 1 AND 5) |
| YKienDongGop | NVARCHAR(MAX) | NULL |
| TgDanhGia | DATETIME | DEFAULT GETDATE() |
|  |  | UNIQUE(SuKienID, NguoiDanhGiaID) |

**31. Bảng ThongBao**

| Tên cột | Kiểu dữ liệu | Ràng buộc/Ghi chú |
| --- | --- | --- |
| ThongBaoID | BIGINT | PRIMARY KEY, IDENTITY(1,1) |
| NguoiNhanID | INT | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| DonViNhanID | INT | NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| SkLienQuanID | INT | NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) |
| YcLienQuanID | INT | NULL |
| LoaiYcLienQuan | VARCHAR(50) | NULL |
| NoiDungTB | NVARCHAR(MAX) | NOT NULL |
| DuongDanTB | VARCHAR(500) | NULL |
| NgayTaoTB | DATETIME | DEFAULT GETDATE() |
| DaDocTB | BIT | DEFAULT 0 |
| NgayDocTB | DATETIME | NULL |
| LoaiThongBao | VARCHAR(50) | NULL |
1. **ThanhVienCLB (Club Membership)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú** |
| --- | --- | --- |
| ThanhVienClbID | INT | PRIMARY KEY, IDENTITY(1,1) |
| NguoiDungID | INT | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| DonViID_CLB | INT | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) (Ràng buộc DonVi.LoaiDonVi phải là 'CLB') |
| ChucVuTrongCLB | NVARCHAR(100) | NULL (VD: 'Thành viên', 'Phó Ban Kỹ thuật', 'Trưởng Ban Nội dung'. Nếu là Trưởng CLB, có thể vẫn lưu ở đây hoặc ưu tiên vai trò trong NguoiDung_VaiTro) |
| NgayGiaNhap | DATE | DEFAULT GETDATE() |
| NgayRoiCLB | DATE | NULL |
| IsActiveInCLB | BIT | DEFAULT 1 (Còn là thành viên tích cực không) |
|  |  | UNIQUE (NguoiDungID, DonViID_CLB) (Mỗi người chỉ là thành viên của một CLB một lần tại một thời điểm) |



  const sidebarNavigationStructure = useMemo(
    (): NavItemStructure[] => [
      {
        label: 'Bảng Điều Khiển',
        href: '/dashboard',
        icon: DashboardIcon,
        exactMatch: true,
        allowedRoles: ['*'],
      },
      {
        isTitle: true,
        label: 'Quản lý Sự kiện',
        allowedRoles: [
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.TRUONG_KHOA,
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.BI_THU_DOAN,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.QUAN_LY_CSVC,
        ],
      },
      {
        label: 'Danh sách Sự kiện',
        href: '/events',
        icon: ClipboardList,
        activePaths: [
          '/events',
          '/events/new',
          '/events/edit',
          '/events/participants',
          '/events/approve',
          '/events/cancel-requests',
        ],
        allowedRoles: ['*'],
      },
      // Các sub-items của "Quản Lý Sự Kiện" (Tạo, Duyệt, Yêu cầu hủy) sẽ được truy cập từ trang Danh sách sự kiện
      // Hoặc có thể thêm các link trực tiếp ở đây nếu muốn, nhưng sẽ làm sidebar dài hơn.
      // Ví dụ:
      // { label: 'Tạo Sự kiện Mới', href: '/events/new', icon: CalendarPlus, allowedRoles: [MaVaiTro.CB_TO_CHUC_SU_KIEN, MaVaiTro.ADMIN_HE_THONG] },

      {
        isTitle: true,
        label: 'Quản lý CSVC',
        allowedRoles: [
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },
      {
        label: 'Danh sách Phòng',
        href: '/facilities/rooms',
        icon: Building2,
        allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Danh sách Thiết bị',
        href: '/facilities/equipment',
        icon: Settings,
        allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Lịch sử dụng Phòng',
        href: '/facilities/room-schedule',
        icon: Calendar,
        allowedRoles: ['*'],
      },
      {
        label: 'Yêu cầu Mượn Phòng',
        href: '/facilities/room-requests',
        icon: ListChecks,
        allowedRoles: [
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },
      {
        label: 'Yêu cầu Đổi Phòng',
        href: '/facilities/room-change-requests',
        icon: History,
        allowedRoles: [
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },

      {
        isTitle: true,
        label: 'Thống Kê Đơn Vị',
        allowedRoles: [
          MaVaiTro.TRUONG_KHOA,
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.BI_THU_DOAN,
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.QUAN_LY_CSVC,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
        ],
      },
      {
        label: 'Thống kê Sự kiện Chung',
        href: '/dashboard/events',
        icon: LineChartIcon,
        allowedRoles: [
          MaVaiTro.BGH_DUYET_SK_TRUONG,
          MaVaiTro.ADMIN_HE_THONG,
          MaVaiTro.CB_TO_CHUC_SU_KIEN,
        ],
      },
      {
        label: 'Thống kê CSVC Chung',
        href: '/dashboard/facilities',
        icon: LineChartIcon,
        allowedRoles: [MaVaiTro.QUAN_LY_CSVC, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Dashboard Khoa',
        href: '/dashboard/department',
        icon: Briefcase,
        allowedRoles: [MaVaiTro.TRUONG_KHOA, MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Dashboard CLB',
        href: '/dashboard/clubs',
        icon: UsersGroupIcon,
        allowedRoles: [
          MaVaiTro.TRUONG_CLB,
          MaVaiTro.GV_CO_VAN_CLB,
          MaVaiTro.ADMIN_HE_THONG,
        ],
      },
      {
        label: 'Dashboard Đoàn',
        href: '/dashboard/union',
        icon: UsersGroupIcon,
        allowedRoles: [MaVaiTro.BI_THU_DOAN, MaVaiTro.ADMIN_HE_THONG],
      },

      {
        isTitle: true,
        label: 'Quản Trị Cơ Sở Hạ Tầng',
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
      },
      {
        label: 'Quản lý Tòa Nhà',
        href: '/units/buildings',
        icon: Building,
        activePaths: ['/units/buildings'],
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
      },
      {
        label: 'Quản lý Loại Tầng',
        href: '/units/floor-types',
        icon: Layers,
        activePaths: ['/units/floor-types'],
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG, MaVaiTro.QUAN_LY_CSVC],
      },

      {
        isTitle: true,
        label: 'Quản Trị Hệ Thống',
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Quản lý Người dùng',
        href: '/users',
        icon: UsersIconLucide,
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Vai trò & Phân quyền',
        href: '/users/roles',
        icon: UserSquare2,
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Quản lý Đơn vị',
        href: '/units',
        icon: Library,
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Quản lý Ngành học',
        href: '/units/majors',
        icon: BookOpen,
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
      {
        label: 'Quản lý Lớp học',
        href: '/units/classes',
        icon: GraduationCap,
        allowedRoles: [MaVaiTro.ADMIN_HE_THONG],
      },
    ],
    [user]
  );