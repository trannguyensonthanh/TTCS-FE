![image.png](attachment:2e419796-d9eb-45f4-ba60-0245af126816:image.png)

---

**I. QUẢN LÝ NGƯỜI DÙNG, VAI TRÒ, TÀI KHOẢN, HỌC VỤ (Phiên bản cuối cùng)**

**1. Bảng NguoiDung (Users - Thông tin cá nhân cốt lõi)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                          |
| ----------- | ---------------- | ---------------------------------------------- |
| NguoiDungID | INT              | PRIMARY KEY, IDENTITY(1,1)                     |
| MaDinhDanh  | VARCHAR(50)      | UNIQUE, NULL (Mã nhân sự/SV chung )            |
| HoTen       | NVARCHAR(150)    | NOT NULL                                       |
| Email       | VARCHAR(150)     | UNIQUE, NOT NULL                               |
| SoDienThoai | VARCHAR(20)      | UNIQUE, NULL                                   |
| AnhDaiDien  | VARCHAR(500)     | NULL (URL ảnh)                                 |
| NgayTao     | DATETIME         | DEFAULT GETDATE()                              |
| IsActive    | BIT              | DEFAULT 1 (Tài khoản người dùng còn hoạt động) |

**2. Bảng TaiKhoan (Accounts - Thông tin đăng nhập)**

| **Tên cột**     | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                                             |
| --------------- | ---------------- | --------------------------------------------------------------------------------- |
| TaiKhoanID      | INT              | PRIMARY KEY, IDENTITY(1,1)                                                        |
| NguoiDungID     | INT              | NOT NULL, UNIQUE, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) ON DELETE CASCADE |
| TenDangNhap     | VARCHAR(100)     | NOT NULL, UNIQUE                                                                  |
| MatKhauHash     | VARCHAR(255)     | NOT NULL                                                                          |
| Salt            | VARCHAR(100)     | NOT NULL                                                                          |
| LanDangNhapCuoi | DATETIME         | NULL                                                                              |
| TrangThaiTk     | VARCHAR(50)      | NOT NULL, DEFAULT 'Active' (VD: 'Active', 'Locked', 'Disabled')                   |
| NgayTaoTk       | DATETIME         | DEFAULT GETDATE()                                                                 |

**3. Bảng DonVi (Departments/Units - Khoa, Phòng, Ban, CLB, Bộ môn...)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                               |
| ----------- | ---------------- | ------------------------------------------------------------------- |
| DonViID     | INT              | PRIMARY KEY, IDENTITY(1,1)                                          |
| TenDonVi    | NVARCHAR(200)    | NOT NULL, UNIQUE                                                    |
| MaDonVi     | VARCHAR(50)      | UNIQUE, NULL                                                        |
| LoaiDonVi   | NVARCHAR(100)    | NOT NULL (VD: 'KHOA', 'PHONG', 'BAN', 'TRUNG_TAM', 'BO_MON', 'CLB') |
| DonViChaID  | INT              | NULL, FOREIGN KEY REFERENCES DonVi(DonViID)                         |
| MoTaDv      | NVARCHAR(500)    | NULL                                                                |

**4. Bảng NganhHoc (Academic Programs/Majors)**

| **Tên cột**   | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                           |
| ------------- | ---------------- | ----------------------------------------------- |
| NganhHocID    | INT              | PRIMARY KEY, IDENTITY(1,1)                      |
| TenNganhHoc   | NVARCHAR(200)    | NOT NULL, UNIQUE                                |
| MaNganhHoc    | VARCHAR(50)      | UNIQUE, NULL                                    |
| KhoaQuanLyID  | INT              | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| MoTaNH        | NVARCHAR(MAX)    | NULL                                            |
| CoChuyenNganh | BIT              | NOT NULL, DEFAULT 0                             |

**5. Bảng ChuyenNganh (Specializations)**

| **Tên cột**    | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                 |
| -------------- | ---------------- | ----------------------------------------------------- |
| ChuyenNganhID  | INT              | PRIMARY KEY, IDENTITY(1,1)                            |
| TenChuyenNganh | NVARCHAR(200)    | NOT NULL                                              |
| MaChuyenNganh  | VARCHAR(50)      | UNIQUE, NULL                                          |
| NganhHocID     | INT              | NOT NULL, FOREIGN KEY REFERENCES NganhHoc(NganhHocID) |
| MoTaCN         | NVARCHAR(MAX)    | NULL                                                  |
|                |                  | UNIQUE (NganhHocID, TenChuyenNganh)                   |

**6. Bảng LopHoc (Classes)**

| **Tên cột**   | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                   |
| ------------- | ---------------- | ------------------------------------------------------- |
| LopID         | INT              | PRIMARY KEY, IDENTITY(1,1)                              |
| TenLop        | NVARCHAR(100)    | NOT NULL, UNIQUE                                        |
| MaLop         | VARCHAR(50)      | UNIQUE, NULL                                            |
| NganhHocID    | INT              | NOT NULL, FOREIGN KEY REFERENCES NganhHoc(NganhHocID)   |
| ChuyenNganhID | INT              | NULL, FOREIGN KEY REFERENCES ChuyenNganh(ChuyenNganhID) |
| NienKhoa      | VARCHAR(50)      | NULL                                                    |

**7. Bảng ThongTinSinhVien (Student Profile Information)**

| **Tên cột**     | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                                        |
| --------------- | ---------------- | ---------------------------------------------------------------------------- |
| NguoiDungID     | INT              | PRIMARY KEY, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) ON DELETE CASCADE |
| MaSinhVien      | VARCHAR(50)      | NOT NULL, UNIQUE                                                             |
| LopID           | INT              | NOT NULL, FOREIGN KEY REFERENCES LopHoc(LopID)                               |
| KhoaHoc         | VARCHAR(50)      | NULL (VD: 'K2020')                                                           |
| HeDaoTao        | NVARCHAR(100)    | NULL (VD: 'Chính quy', 'Chất lượng cao')                                     |
| NgayNhapHoc     | DATE             | NULL                                                                         |
| TrangThaiHocTap | NVARCHAR(50)     | NULL (VD: 'Đang học', 'Tốt nghiệp', 'Bảo lưu')                               |

**8. Bảng ThongTinGiangVien (Lecturer Profile Information)**

| **Tên cột**    | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                                        |
| -------------- | ---------------- | ---------------------------------------------------------------------------- |
| NguoiDungID    | INT              | PRIMARY KEY, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) ON DELETE CASCADE |
| MaGiangVien    | VARCHAR(50)      | NOT NULL, UNIQUE                                                             |
| DonViCongTacID | INT              | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) (Khoa/Bộ môn chính)          |
| HocVi          | NVARCHAR(100)    | NULL                                                                         |
| HocHam         | NVARCHAR(100)    | NULL (GS, PGS)                                                               |
| ChucDanhGD     | NVARCHAR(100)    | NULL (Giảng viên, GVC)                                                       |
| ChuyenMonChinh | NVARCHAR(255)    | NULL                                                                         |

**9. Bảng VaiTroHeThong (System Functional Roles - Chỉ chứa các chức vụ/quyền hạn)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                                                                                                              |
| ----------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| VaiTroID    | INT              | PRIMARY KEY, IDENTITY(1,1)                                                                                                                         |
| MaVaiTro    | VARCHAR(50)      | NOT NULL, UNIQUE (VD: 'TRUONG_KHOA', 'QUAN_LY_CSVC', 'BGH_DUYET_SK_TRUONG', 'CB_TO_CHUC_SU_KIEN', 'TRUONG_CLB', 'GV_CO_VAN_CLB', 'ADMIN_HE_THONG') |
| TenVaiTro   | NVARCHAR(150)    | NOT NULL                                                                                                                                           |
| MoTaVT      | NVARCHAR(500)    | NULL                                                                                                                                               |

**10. Bảng NguoiDung_VaiTro (User Functional Role Assignments)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                                          |
| ----------- | ---------------- | ------------------------------------------------------------------------------ |
| GanVaiTroID | INT              | PRIMARY KEY, IDENTITY(1,1)                                                     |
| NguoiDungID | INT              | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                        |
| VaiTroID    | INT              | NOT NULL, FOREIGN KEY REFERENCES VaiTroHeThong(VaiTroID)                       |
| DonViID     | INT              | NULL, FOREIGN KEY REFERENCES DonVi(DonViID) (Đơn vị nơi vai trò được thực thi) |
| NgayBatDau  | DATE             | NOT NULL, DEFAULT GETDATE()                                                    |
| NgayKetThuc | DATE             | NULL                                                                           |
| GhiChuGanVT | NVARCHAR(500)    | NULL                                                                           |
|             |                  | UNIQUE (NguoiDungID, VaiTroID, DonViID, NgayBatDau)                            |

**II. QUẢN LÝ SỰ KIỆN**

**11. Bảng TrangThaiSK**

| Tên cột       | Kiểu dữ liệu  | Ràng buộc/Ghi chú          |
| ------------- | ------------- | -------------------------- |
| TrangThaiSkID | INT           | PRIMARY KEY, IDENTITY(1,1) |
| MaTrangThai   | VARCHAR(50)   | NOT NULL, UNIQUE           |
| TenTrangThai  | NVARCHAR(150) | NOT NULL                   |
| MoTa          | NVARCHAR(500) | NULL                       |

**12. Bảng SuKien**

| Tên cột             | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                                             |
| ------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| SuKienID            | INT           | PRIMARY KEY, IDENTITY(1,1)                                                                    |
| TenSK               | NVARCHAR(300) | NOT NULL                                                                                      |
| TgBatDauDK          | DATETIME      | NOT NULL                                                                                      |
| TgKetThucDK         | DATETIME      | NOT NULL                                                                                      |
| NguoiChuTriID       | INT           | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                                           |
| TenChuTriNgoai      | NVARCHAR(150) | NULL                                                                                          |
| DonViChuTriNgoai    | NVARCHAR(200) | NULL                                                                                          |
| DonViChuTriID       | INT           | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID)                                               |
| SlThamDuDK          | INT           | NULL                                                                                          |
| MoTaChiTiet         | NVARCHAR(MAX) | NULL                                                                                          |
| TrangThaiSkID       | INT           | NOT NULL, FOREIGN KEY REFERENCES TrangThaiSK(TrangThaiSkID)                                   |
| NguoiTaoID          | INT           | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                                       |
| NgayTaoSK           | DATETIME      | DEFAULT GETDATE()                                                                             |
| NguoiDuyetBGHID     | INT           | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                                           |
| NgayDuyetBGH        | DATETIME      | NULL                                                                                          |
| LyDoTuChoiBGH       | NVARCHAR(MAX) | NULL                                                                                          |
| LyDoHuyNguoiTao     | NVARCHAR(MAX) | NULL                                                                                          |
| IsCongKhaiNoiBo     | BIT           | DEFAULT 0                                                                                     |
| KhachMoiNgoaiGhiChu | NVARCHAR(MAX) | NULL                                                                                          |
|                     |               | CONSTRAINT CK_SK_CoChuTri CHECK ((NguoiChuTriID IS NOT NULL) OR (TenChuTriNgoai IS NOT NULL)) |
| LoaiSuKienID        |               |                                                                                               |
| TgBatDauThucTe      | DATETIME      | NULL                                                                                          |
| TgKetThucThucTe     | DATETIME      | NULL                                                                                          |

CONSTRAINT CK_SuKien_ThoiGian CHECK (TgBatDauDK < TgKetThucDK),
CONSTRAINT CK_SuKien_ThoiGianThucTe CHECK (TgBatDauThucTe IS NULL OR TgKetThucThucTe IS NULL OR TgBatDauThucTe < TgKetThucThucTe) |

**Bảng LoaiSuKien**

| **Tên cột**  | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                  |
| ------------ | ---------------- | ------------------------------------------------------ |
| LoaiSuKienID | INT              | PRIMARY KEY, IDENTITY(1,1)                             |
| MaLoaiSK     | VARCHAR(50)      | NOT NULL, UNIQUE (VD: 'HOI_THAO_KH', 'VAN_NGHE')       |
| TenLoaiSK    | NVARCHAR(150)    | NOT NULL (VD: 'Hội thảo Khoa học', 'Văn nghệ')         |
| MoTaLoaiSK   | NVARCHAR(500)    | NULL                                                   |
| IsActive     | BIT              | DEFAULT 1 (Loại sự kiện này có còn được sử dụng không) |

**13. Bảng SK_DonViThamGia**

| Tên cột       | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                   |
| ------------- | ------------- | ------------------------------------------------------------------- |
| SuKienID      | INT           | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) ON DELETE CASCADE |
| DonViID       | INT           | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID)                     |
| VaiTroDonViSK | NVARCHAR(500) | NULL                                                                |
|               |               | PRIMARY KEY (SuKienID, DonViID)                                     |

**14. Bảng SK_MoiThamGia**

| Tên cột        | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                   |
| -------------- | ------------- | ------------------------------------------------------------------- |
| MoiThamGiaID   | BIGINT        | PRIMARY KEY, IDENTITY(1,1)                                          |
| SuKienID       | INT           | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) ON DELETE CASCADE |
| NguoiDuocMoiID | INT           | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)             |
| VaiTroDuKienSK | NVARCHAR(200) | NULL                                                                |
| IsChapNhanMoi  | BIT           | NULL                                                                |
| TgPhanHoiMoi   | DATETIME      | NULL                                                                |
| GhiChuMoi      | NVARCHAR(500) | NULL                                                                |

---

**III. QUẢN LÝ PHÒNG VÀ YÊU CẦU MƯỢN PHÒNG**

**15. Bảng LoaiPhong**

| Tên cột      | Kiểu dữ liệu  | Ràng buộc/Ghi chú          |
| ------------ | ------------- | -------------------------- |
| LoaiPhongID  | INT           | PRIMARY KEY, IDENTITY(1,1) |
| TenLoaiPhong | NVARCHAR(100) | NOT NULL, UNIQUE           |
| MoTa         | NVARCHAR(255) | NULL                       |

**16. Bảng TrangThaiPhong**

| Tên cột          | Kiểu dữ liệu  | Ràng buộc/Ghi chú          |
| ---------------- | ------------- | -------------------------- |
| TrangThaiPhongID | INT           | PRIMARY KEY, IDENTITY(1,1) |
| TenTrangThai     | NVARCHAR(100) | NOT NULL, UNIQUE           |
| MoTa             | NVARCHAR(255) | NULL                       |

**Bảng ToaNha (Building)**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                           |
| ----------- | ---------------- | ----------------------------------------------- |
| ToaNhaID    | INT              | PRIMARY KEY, IDENTITY(1,1)                      |
| MaToaNha    | VARCHAR(20)      | NOT NULL, UNIQUE                                |
| TenToaNha   | NVARCHAR(100)    | NOT NULL                                        |
| CoSoID      | INT              | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) |
| MoTaToaNha  | NVARCHAR(255)    | NULL                                            |

**Bảng LoaiTang (Định nghĩa các loại/số tầng trừu tượng) - Tên cột cập nhật**

| **Tên cột** | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                    |
| ----------- | ---------------- | -------------------------------------------------------- |
| LoaiTangID  | INT              | PRIMARY KEY, IDENTITY(1,1)                               |
| MaLoaiTang  | VARCHAR(20)      | NOT NULL, UNIQUE (VD: 'TRET', 'L1', 'L2', 'HB1')         |
| TenLoaiTang | NVARCHAR(100)    | NOT NULL (VD: 'Tầng Trệt', 'Tầng 1', 'Tầng 2', 'Hầm B1') |
| SoThuTu     | INT              | NULL (Dùng để sắp xếp hoặc logic, VD: 0, 1, 2, -1)       |
| MoTa        | NVARCHAR(255)    | NULL (Đổi từ MoTaLoaiTang)                               |

**Bảng ToaNha_Tang (Bảng trung gian N-N, đại diện tầng vật lý) - Tên cột cập nhật**

| **Tên cột**  | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                            |
| ------------ | ---------------- | ------------------------------------------------ |
| ToaNhaTangID | INT              | PRIMARY KEY, IDENTITY(1,1)                       |
| ToaNhaID     | INT              | NOT NULL, FK REFERENCES dbo.ToaNha(ToaNhaID)     |
| LoaiTangID   | INT              | NOT NULL, FK REFERENCES dbo.LoaiTang(LoaiTangID) |
| SoPhong      | INT              | NULL (Đổi từ SoPhongDuKien)                      |
| MoTa         | NVARCHAR(500)    | NULL (Đổi từ MoTaChiTietTang)                    |
|              |                  | UNIQUE (ToaNhaID, LoaiTangID)                    |

**17. Bảng Phong**

| Tên cột          | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                                     |
| ---------------- | ------------- | ------------------------------------------------------------------------------------- |
| PhongID          | INT           | PRIMARY KEY, IDENTITY(1,1)                                                            |
| TenPhong         | NVARCHAR(100) | NOT NULL                                                                              |
| MaPhong          | VARCHAR(50)   | UNIQUE, NULL                                                                          |
| LoaiPhongID      | INT           | NOT NULL, FOREIGN KEY REFERENCES LoaiPhong(LoaiPhongID)                               |
| SucChua          | INT           | NULL                                                                                  |
| TrangThaiPhongID | INT           | NOT NULL, FOREIGN KEY REFERENCES TrangThaiPhong(TrangThaiPhongID)                     |
| MoTaChiTietPhong | NVARCHAR(MAX) | NULL                                                                                  |
| AnhMinhHoa       | VARCHAR(500)  | NULL                                                                                  |
| ToaNhaTangID     | INT           | FK REFERENCES ToaNha_Tang(ToaNhaTangID) (Sẽ đặt là NOT NULL sau khi cập nhật data cũ) |
| SoThuTuPhong     | NVARCHAR(20)  | NULL (Số phòng hoặc mã định danh trên tầng đó)                                        |

**18. Bảng TrangThietBi**

| Tên cột    | Kiểu dữ liệu  | Ràng buộc/Ghi chú          |
| ---------- | ------------- | -------------------------- |
| ThietBiID  | INT           | PRIMARY KEY, IDENTITY(1,1) |
| TenThietBi | NVARCHAR(150) | NOT NULL, UNIQUE           |
| MoTa       | NVARCHAR(500) | NULL                       |

**19. Bảng Phong_ThietBi**

| Tên cột   | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                        |
| --------- | ------------- | -------------------------------------------------------- |
| PhongID   | INT           | NOT NULL, FOREIGN KEY REFERENCES Phong(PhongID)          |
| ThietBiID | INT           | NOT NULL, FOREIGN KEY REFERENCES TrangThietBi(ThietBiID) |
| SoLuong   | INT           | DEFAULT 1                                                |
| TinhTrang | NVARCHAR(200) | NULL                                                     |
|           |               | PRIMARY KEY (PhongID, ThietBiID)                         |

**20. Bảng TrangThaiYeuCauPhong**

| Tên cột        | Kiểu dữ liệu  | Ràng buộc/Ghi chú              |
| -------------- | ------------- | ------------------------------ |
| TrangThaiYcpID | INT           | PRIMARY KEY, IDENTITY(1,1)     |
| MaTrangThai    | VARCHAR(50)   | NOT NULL, UNIQUE               |
| TenTrangThai   | NVARCHAR(150) | NOT NULL                       |
| LoaiApDung     | VARCHAR(20)   | NOT NULL ('CHUNG', 'CHI_TIET') |
| MoTa           | NVARCHAR(500) | NULL                           |

**21. Bảng YeuCauMuonPhong (Header)**

| Tên cột              | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                     |
| -------------------- | ------------- | --------------------------------------------------------------------- |
| YcMuonPhongID        | INT           | PRIMARY KEY, IDENTITY(1,1)                                            |
| SuKienID             | INT           | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID)                     |
| NguoiYeuCauID        | INT           | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)               |
| NgayYeuCau           | DATETIME      | DEFAULT GETDATE()                                                     |
| TrangThaiChungID     | INT           | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauPhong(TrangThaiYcpID) |
| NguoiDuyetTongCSVCID | INT           | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                   |
| NgayDuyetTongCSVC    | DATETIME      | NULL                                                                  |
| GhiChuChungYc        | NVARCHAR(MAX) | NULL                                                                  |

**22. Bảng YcMuonPhongChiTiet (Detail)**

| Tên cột         | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                                 |
| --------------- | ------------- | --------------------------------------------------------------------------------- |
| YcMuonPhongCtID | INT           | PRIMARY KEY, IDENTITY(1,1)                                                        |
| YcMuonPhongID   | INT           | NOT NULL, FOREIGN KEY REFERENCES YeuCauMuonPhong(YcMuonPhongID) ON DELETE CASCADE |
| MoTaNhomPhong   | NVARCHAR(200) | NULL                                                                              |
| SlPhongNhomNay  | INT           | NOT NULL, DEFAULT 1                                                               |
| LoaiPhongYcID   | INT           | NULL, FOREIGN KEY REFERENCES LoaiPhong(LoaiPhongID)                               |
| SucChuaYc       | INT           | NULL                                                                              |
| ThietBiThemYc   | NVARCHAR(MAX) | NULL                                                                              |
| TgMuonDk        | DATETIME      | NOT NULL                                                                          |
| TgTraDk         | DATETIME      | NOT NULL                                                                          |
| TrangThaiCtID   | INT           | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauPhong(TrangThaiYcpID)             |
| GhiChuCtCSVC    | NVARCHAR(MAX) | NULL                                                                              |

**23. Bảng ChiTietDatPhong**

| Tên cột         | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                    |
| --------------- | ------------- | -------------------------------------------------------------------- |
| DatPhongID      | INT           | PRIMARY KEY, IDENTITY(1,1)                                           |
| YcMuonPhongCtID | INT           | NOT NULL, FOREIGN KEY REFERENCES YcMuonPhongChiTiet(YcMuonPhongCtID) |
| PhongID         | INT           | NOT NULL, FOREIGN KEY REFERENCES Phong(PhongID)                      |
| TgNhanPhongTT   | DATETIME      | NULL                                                                 |
| TgTraPhongTT    | DATETIME      | NULL                                                                 |
| GhiChuDatPhong  | NVARCHAR(MAX) | NULL                                                                 |
|                 |               | UNIQUE (YcMuonPhongCtID, PhongID)                                    |

---

**IV. QUẢN LÝ CÁC YÊU CẦU HỦY/ĐỔI**

**24. Bảng TrangThaiYeuCauHuySK**

| Tên cột            | Kiểu dữ liệu  | Ràng buộc/Ghi chú          |
| ------------------ | ------------- | -------------------------- |
| TrangThaiYcHuySkID | INT           | PRIMARY KEY, IDENTITY(1,1) |
| MaTrangThai        | VARCHAR(50)   | NOT NULL, UNIQUE           |
| TenTrangThai       | NVARCHAR(150) | NOT NULL                   |
| MoTa               | NVARCHAR(500) | NULL                       |

**25. Bảng YeuCauHuySK**

| Tên cột            | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                         |
| ------------------ | ------------- | ------------------------------------------------------------------------- |
| YcHuySkID          | INT           | PRIMARY KEY, IDENTITY(1,1)                                                |
| SuKienID           | INT           | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID)                         |
| NguoiYeuCauID      | INT           | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                   |
| NgayYeuCauHuy      | DATETIME      | DEFAULT GETDATE()                                                         |
| LyDoHuy            | NVARCHAR(MAX) | NOT NULL                                                                  |
| TrangThaiYcHuySkID | INT           | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauHuySK(TrangThaiYcHuySkID) |
| NguoiDuyetHuyBGHID | INT           | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                       |
| NgayDuyetHuyBGH    | DATETIME      | NULL                                                                      |
| LyDoTuChoiHuyBGH   | NVARCHAR(MAX) | NULL                                                                      |

**26. Bảng TrangThaiYeuCauDoiPhong**

| Tên cột           | Kiểu dữ liệu  | Ràng buộc/Ghi chú          |
| ----------------- | ------------- | -------------------------- |
| TrangThaiYcDoiPID | INT           | PRIMARY KEY, IDENTITY(1,1) |
| MaTrangThai       | VARCHAR(50)   | NOT NULL, UNIQUE           |
| TenTrangThai      | NVARCHAR(150) | NOT NULL                   |
| MoTa              | NVARCHAR(500) | NULL                       |

**27. Bảng YeuCauDoiPhong**

| Tên cột             | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                           |
| ------------------- | ------------- | --------------------------------------------------------------------------- |
| YcDoiPhongID        | INT           | PRIMARY KEY, IDENTITY(1,1)                                                  |
| YcMuonPhongCtID     | INT           | NOT NULL, FOREIGN KEY REFERENCES YcMuonPhongChiTiet(YcMuonPhongCtID)        |
| DatPhongID_Cu       | INT           | NOT NULL, FOREIGN KEY REFERENCES ChiTietDatPhong(DatPhongID)                |
| NguoiYeuCauID       | INT           | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                     |
| NgayYeuCauDoi       | DATETIME      | DEFAULT GETDATE()                                                           |
| LyDoDoiPhong        | NVARCHAR(MAX) | NOT NULL                                                                    |
| YcPhongMoi_LoaiID   | INT           | NULL, FOREIGN KEY REFERENCES LoaiPhong(LoaiPhongID)                         |
| YcPhongMoi_SucChua  | INT           | NULL                                                                        |
| YcPhongMoi_ThietBi  | NVARCHAR(MAX) | NULL                                                                        |
| TrangThaiYcDoiPID   | INT           | NOT NULL, FOREIGN KEY REFERENCES TrangThaiYeuCauDoiPhong(TrangThaiYcDoiPID) |
| NguoiDuyetDoiCSVCID | INT           | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                         |
| NgayDuyetDoiCSVC    | DATETIME      | NULL                                                                        |
| DatPhongID_Moi      | INT           | NULL, FOREIGN KEY REFERENCES ChiTietDatPhong(DatPhongID)                    |
| LyDoTuChoiDoiCSVC   | NVARCHAR(MAX) | NULL                                                                        |

---

**V. TIỆN ÍCH VÀ HỖ TRỢ KHÁC**

**28. Bảng LoaiTaiLieuSK**

| Tên cột       | Kiểu dữ liệu  | Ràng buộc/Ghi chú          |
| ------------- | ------------- | -------------------------- |
| LoaiTaiLieuID | INT           | PRIMARY KEY, IDENTITY(1,1) |
| TenLoaiTL     | NVARCHAR(100) | NOT NULL, UNIQUE           |

**29. Bảng TaiLieuSK**

| Tên cột       | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                                   |
| ------------- | ------------- | ------------------------------------------------------------------- |
| TaiLieuSkID   | BIGINT        | PRIMARY KEY, IDENTITY(1,1)                                          |
| SuKienID      | INT           | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID) ON DELETE CASCADE |
| LoaiTaiLieuID | INT           | NOT NULL, FOREIGN KEY REFERENCES LoaiTaiLieuSK(LoaiTaiLieuID)       |
| TenHienThiTL  | NVARCHAR(255) | NOT NULL                                                            |
| DuongDanFile  | VARCHAR(500)  | NOT NULL                                                            |
| MoTaTL        | NVARCHAR(MAX) | NULL                                                                |
| NguoiTaiLenID | INT           | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)             |
| NgayTaiLen    | DATETIME      | DEFAULT GETDATE()                                                   |
| IsCongKhaiTL  | BIT           | DEFAULT 0                                                           |

**30. Bảng DanhGiaSK**

| Tên cột        | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                       |
| -------------- | ------------- | ------------------------------------------------------- |
| DanhGiaSkID    | BIGINT        | PRIMARY KEY, IDENTITY(1,1)                              |
| SuKienID       | INT           | NOT NULL, FOREIGN KEY REFERENCES SuKien(SuKienID)       |
| NguoiDanhGiaID | INT           | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| DiemNoiDung    | TINYINT       | NULL, CHECK (DiemNoiDung BETWEEN 1 AND 5)               |
| DiemToChuc     | TINYINT       | NULL, CHECK (DiemToChuc BETWEEN 1 AND 5)                |
| DiemDiaDiem    | TINYINT       | NULL, CHECK (DiemDiaDiem BETWEEN 1 AND 5)               |
| YKienDongGop   | NVARCHAR(MAX) | NULL                                                    |
| TgDanhGia      | DATETIME      | DEFAULT GETDATE()                                       |
|                |               | UNIQUE(SuKienID, NguoiDanhGiaID)                        |

**31. Bảng ThongBao**

| Tên cột        | Kiểu dữ liệu  | Ràng buộc/Ghi chú                                   |
| -------------- | ------------- | --------------------------------------------------- |
| ThongBaoID     | BIGINT        | PRIMARY KEY, IDENTITY(1,1)                          |
| NguoiNhanID    | INT           | NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID) |
| DonViNhanID    | INT           | NULL, FOREIGN KEY REFERENCES DonVi(DonViID)         |
| SkLienQuanID   | INT           | NULL, FOREIGN KEY REFERENCES SuKien(SuKienID)       |
| YcLienQuanID   | INT           | NULL                                                |
| LoaiYcLienQuan | VARCHAR(50)   | NULL                                                |
| NoiDungTB      | NVARCHAR(MAX) | NOT NULL                                            |
| DuongDanTB     | VARCHAR(500)  | NULL                                                |
| NgayTaoTB      | DATETIME      | DEFAULT GETDATE()                                   |
| DaDocTB        | BIT           | DEFAULT 0                                           |
| NgayDocTB      | DATETIME      | NULL                                                |
| LoaiThongBao   | VARCHAR(50)   | NULL                                                |

1. **ThanhVienCLB (Club Membership)**

| **Tên cột**    | **Kiểu dữ liệu** | **Ràng buộc/Ghi chú**                                                                                                                                   |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ThanhVienClbID | INT              | PRIMARY KEY, IDENTITY(1,1)                                                                                                                              |
| NguoiDungID    | INT              | NOT NULL, FOREIGN KEY REFERENCES NguoiDung(NguoiDungID)                                                                                                 |
| DonViID_CLB    | INT              | NOT NULL, FOREIGN KEY REFERENCES DonVi(DonViID) (Ràng buộc DonVi.LoaiDonVi phải là 'CLB')                                                               |
| ChucVuTrongCLB | NVARCHAR(100)    | NULL (VD: 'Thành viên', 'Phó Ban Kỹ thuật', 'Trưởng Ban Nội dung'. Nếu là Trưởng CLB, có thể vẫn lưu ở đây hoặc ưu tiên vai trò trong NguoiDung_VaiTro) |
| NgayGiaNhap    | DATE             | DEFAULT GETDATE()                                                                                                                                       |
| NgayRoiCLB     | DATE             | NULL                                                                                                                                                    |
| IsActiveInCLB  | BIT              | DEFAULT 1 (Còn là thành viên tích cực không)                                                                                                            |
|                |                  | UNIQUE (NguoiDungID, DonViID_CLB) (Mỗi người chỉ là thành viên của một CLB một lần tại một thời điểm)                                                   |

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

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

import DashboardLayout from '@/components/DashboardLayout'; // Hoặc một Layout chung nếu trang này không thuộc dashboard
import { ReusablePagination } from '@/components/ui/ReusablePagination';
import {
useAllMyNotifications, // Hook mới để lấy tất cả thông báo
useMarkNotificationAsRead,
useMarkAllNotificationsAsRead,
} from '@/hooks/queries/notificationQueries';
import {
GetAllMyNotificationsParams,
ThongBaoResponse,
PaginatedNotificationsResponse,
} from '@/services/notification.service'; // Hoặc từ types/thongbao.types.ts
import LoaiThongBao from '@/enums/LoaiThongBao.enum'; // Enum loại thông báo
import { motion } from 'framer-motion'; // Thêm framer-motion để tạo hiệu ứng chuyển động
import { Button } from '@/components/ui/button';
import {
Card,
CardHeader,
CardTitle,
CardDescription,
CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox'; // Nếu muốn có action chọn nhiều để đánh dấu đã đọc
import { Separator } from '@/components/ui/separator';
import {
Loader2,
Search,
Filter,
BellRing,
Inbox,
CheckCheck,
MailOpen,
CircleSlash,
Settings2,
CalendarCheck2,
Info,
AlertTriangle,
Trash2,
Eye,
XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext'; // Mặc dù trang này có thể không cần phân quyền phức tạp
import { toast } from '@/components/ui/sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATION_QUERY_KEYS } from '@/hooks/queries/notificationQueries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

// Helper để lấy icon dựa trên loại thông báo (tương tự NotificationBell)
const getNotificationIcon = (
loaiThongBao?: string,
sizeClass = 'h-5 w-5'
): React.ReactNode => {
switch (loaiThongBao) {
case LoaiThongBao.SU_KIEN_MOI_CHO_DUYET_BGH:
case LoaiThongBao.YC_HUY_SK_MOI_CHO_BGH:
case LoaiThongBao.YC_PHONG_MOI_CHO_CSVC:
return <MailOpen className={cn(sizeClass, 'text-amber-500')} />;
case LoaiThongBao.SU_KIEN_DA_DUYET_BGH:
case LoaiThongBao.YC_PHONG_DA_DUYET_CSVC:
case LoaiThongBao.YC_HUY_SK_DA_DUYET:
return <CheckCheck className={cn(sizeClass, 'text-green-500')} />;
case LoaiThongBao.SU_KIEN_BI_TU_CHOI_BGH:
case LoaiThongBao.YC_PHONG_BI_TU_CHOI_CSVC:
case LoaiThongBao.YC_HUY_SK_BI_TU_CHOI:
return <XCircle className={cn(sizeClass, 'text-destructive')} />; // Sử dụng XCircle cho nhất quán
case LoaiThongBao.CSVC_YEU_CAU_CHINH_SUA_YCPCT: // Thêm từ yêu cầu chỉnh sửa
case LoaiThongBao.BGH_YEU_CAU_CHINH_SUA_SK: // Thêm từ yêu cầu chỉnh sửa
return <AlertTriangle className={cn(sizeClass, 'text-orange-500')} />;
case LoaiThongBao.SK_SAP_DIEN_RA:
return <CalendarCheck2 className={cn(sizeClass, 'text-indigo-500')} />;
case LoaiThongBao.THONG_BAO_CHUNG:
default:
return <Info className={cn(sizeClass, 'text-muted-foreground')} />;
}
};

const NotificationsPage = () => {
const { user, isAuthenticated } = useAuth();
const navigate = useNavigate();
const queryClient = useQueryClient();

const [filterParams, setFilterParams] = useState<GetAllMyNotificationsParams>(
{
page: 1,
limit: 15,
sortBy: 'NgayTaoTB',
sortOrder: 'desc',
}
);
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);
const [filterDaDoc, setFilterDaDoc] = useState<string | undefined>(undefined); // 'true', 'false', or undefined
const [filterLoaiTB, setFilterLoaiTB] = useState<string | undefined>(
undefined
);

const {
data: paginatedNotifications,
isLoading,
isFetching,
isError,
error: fetchError,
} = useAllMyNotifications(filterParams, {
enabled: isAuthenticated, // Chỉ fetch khi đã đăng nhập
});

const markAsReadMutation = useMarkNotificationAsRead();
const markAllAsReadMutation = useMarkAllNotificationsAsRead({
onSuccess: () => {
// Invalidate query để cập nhật lại số lượng chưa đọc và trạng thái các item
queryClient.invalidateQueries({
queryKey: NOTIFICATION_QUERY_KEYS.allMyNotifications(),
});
queryClient.invalidateQueries({
queryKey: NOTIFICATION_QUERY_KEYS.myNotificationsSummary(),
}); // Cập nhật bell
},
});

useEffect(() => {
setFilterParams((prev) => ({
...prev,
searchTerm: debouncedSearchTerm || undefined,
daDoc:
filterDaDoc === 'all'
? undefined
: filterDaDoc === 'true'
? true
: filterDaDoc === 'false'
? false
: undefined,
loaiThongBao: filterLoaiTB === 'all' ? undefined : filterLoaiTB,
page: 1,
}));
}, [debouncedSearchTerm, filterDaDoc, filterLoaiTB]);

const handlePageChange = (newPage: number) => {
setFilterParams((prev) => ({ ...prev, page: newPage }));
window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleNotificationClick = (notification: ThongBaoResponse) => {
if (!notification.daDocTB) {
markAsReadMutation.mutate(notification.thongBaoID);
}
if (notification.duongDanLienQuan) {
navigate(notification.duongDanLienQuan);
}
};

const handleMarkAllReadClick = () => {
if (
paginatedNotifications &&
paginatedNotifications.totalUnread &&
paginatedNotifications.totalUnread > 0
) {
markAllAsReadMutation.mutate();
} else {
toast.info('Không có thông báo chưa đọc nào.');
}
};

const notifications = paginatedNotifications?.items || [];
const totalPages = paginatedNotifications?.totalPages || 1;
const currentPage = paginatedNotifications?.currentPage || 1;
const totalUnread = paginatedNotifications?.totalUnread || 0;

if (!isAuthenticated && !isLoading) {
// Chuyển hướng nếu chưa đăng nhập và không phải đang loading ban đầu
navigate('/login', { replace: true });
return null;
}

if (isLoading && !notifications.length && !isFetching) {
return (
<DashboardLayout pageTitle="Thông Báo Của Bạn">

<div className="flex justify-center items-center h-[calc(100vh-12rem)]">
<Loader2 className="h-12 w-12 animate-spin text-primary" />
</div>
</DashboardLayout>
);
}

return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
className="space-y-6" >
<Card className="shadow-xl border-border w-[90%] mx-auto mt-4 mb-4 dark:border-slate-700">
<CardHeader className="border-b dark:border-slate-700">
<CardTitle className="text-2xl flex items-center gap-2">
<BellRing className="h-6 w-6 text-primary dark:text-ptit-red" />
Trung Tâm Thông Báo
</CardTitle>
<CardDescription>
Xem lại tất cả các thông báo và cập nhật quan trọng từ hệ thống.
</CardDescription>
<Separator className="my-4" />

<div className="flex items-center justify-between">
<div className="text-sm text-muted-foreground">
Tổng số thông báo: {paginatedNotifications?.totalItems || 0}
</div>
<div className="text-sm text-muted-foreground">
Số lượng chưa đọc: {totalUnread}
</div>
{totalUnread > 0 && (
<Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllReadClick}
                disabled={markAllAsReadMutation.isPending}
              >
{markAllAsReadMutation.isPending ? (
<Loader2 className="mr-2 h-4 w-4 animate-spin" />
) : (
<CheckCheck className="mr-2 h-4 w-4 text-green-500" />
)}
Đánh dấu tất cả đã đọc ({totalUnread})
</Button>
)}
</div>
</CardHeader>
<CardContent className="pt-6">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end">
<div className="lg:col-span-1">
<Label
                htmlFor="search-notification"
                className="text-xs font-semibold text-muted-foreground"
              >
Tìm kiếm thông báo
</Label>
<div className="relative mt-1">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
<Input
id="search-notification"
type="search"
placeholder="Nội dung, sự kiện liên quan..."
className="pl-10 h-10 rounded-md shadow-sm"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
/>
</div>
</div>
<div>
<Label
                htmlFor="filter-read-status"
                className="text-xs font-semibold text-muted-foreground"
              >
Trạng thái đọc
</Label>
<Select
value={filterDaDoc}
onValueChange={(value) =>
setFilterDaDoc(value === 'all' ? undefined : value)
} >
<SelectTrigger
                  id="filter-read-status"
                  className="h-10 rounded-md shadow-sm"
                >
<SelectValue placeholder="Tất cả trạng thái" />
</SelectTrigger>
<SelectContent>
<SelectItem value="all">Tất cả trạng thái</SelectItem>
<SelectItem value="false">Chưa đọc</SelectItem>
<SelectItem value="true">Đã đọc</SelectItem>
</SelectContent>
</Select>
</div>
<div>
<Label
                htmlFor="filter-notification-type"
                className="text-xs font-semibold text-muted-foreground"
              >
Loại thông báo
</Label>
<Select
value={filterLoaiTB}
onValueChange={(value) =>
setFilterLoaiTB(value === 'all' ? undefined : value)
} >
<SelectTrigger
                  id="filter-notification-type"
                  className="h-10 rounded-md shadow-sm"
                >
<SelectValue placeholder="Tất cả loại" />
</SelectTrigger>
<SelectContent>
<SelectItem value="all">Tất cả loại</SelectItem>
{Object.entries(LoaiThongBao).map(([key, value]) => (
<SelectItem key={key} value={value as string}>
{String(value)
.replace(/\_/g, ' ')
.toLocaleLowerCase()
.replace(/\b\w/g, (l) => l.toUpperCase())}
</SelectItem>
))}
</SelectContent>
</Select>
</div>
</div>

          {isFetching && !notifications.length ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : !isLoading && notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg dark:border-slate-700">
              <Inbox className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-xl font-semibold">Hộp thư thông báo trống!</p>
              <p className="mt-2 text-sm">
                Hiện tại không có thông báo nào phù hợp với bộ lọc của bạn.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-28rem)] md:h-[calc(100vh-25rem)] border rounded-lg dark:border-slate-800">
              {' '}
              {/* Điều chỉnh chiều cao */}
              <div className="divide-y dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.thongBaoID}
                    className={cn(
                      'flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 dark:hover:bg-slate-800/60 transition-colors',
                      !notification.daDocTB &&
                        'bg-primary/5 dark:bg-sky-900/30 border-l-4 border-primary dark:border-sky-500'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-1 text-muted-foreground">
                      {getNotificationIcon(
                        notification.loaiThongBao,
                        'h-6 w-6'
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h4
                          className={cn(
                            'text-sm font-semibold leading-snug line-clamp-1',
                            !notification.daDocTB &&
                              'text-primary dark:text-sky-400'
                          )}
                        >
                          {notification.tenSuKienLienQuan ||
                            notification.loaiThongBao?.replace(/_/g, ' ') ||
                            'Thông báo hệ thống'}
                        </h4>
                        <span
                          className={cn(
                            'text-xs text-muted-foreground whitespace-nowrap ml-2',
                            !notification.daDocTB && 'font-medium'
                          )}
                        >
                          {formatDistanceToNow(
                            parseISO(notification.ngayTaoTB),
                            { addSuffix: true, locale: vi }
                          )}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-sm text-muted-foreground line-clamp-2 mt-0.5',
                          !notification.daDocTB &&
                            'text-foreground dark:text-slate-300'
                        )}
                      >
                        {notification.noiDungTB}
                      </p>
                    </div>
                    {!notification.daDocTB && (
                      <div className="ml-auto flex-shrink-0 self-center pl-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary dark:bg-sky-500 animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {paginatedNotifications && totalPages > 1 && (
            <ReusablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoading || isFetching}
              className="mt-6"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>

);
};

export default NotificationsPage;


USE [master]
GO
/****** Object:  Database [PTIT_EventRoomBooking]    Script Date: 6/16/2025 10:35:20 PM ******/
CREATE DATABASE [PTIT_EventRoomBooking]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'PTIT_EventRoomBooking', FILENAME = N'D:\Download\appName\SQL server\data\MSSQL16.MSSQLSERVER\MSSQL\DATA\PTIT_EventRoomBooking.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'PTIT_EventRoomBooking_log', FILENAME = N'D:\Download\appName\SQL server\data\MSSQL16.MSSQLSERVER\MSSQL\DATA\PTIT_EventRoomBooking_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [PTIT_EventRoomBooking].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET ARITHABORT OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET  ENABLE_BROKER 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET RECOVERY FULL 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET  MULTI_USER 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET DB_CHAINING OFF 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'PTIT_EventRoomBooking', N'ON'
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET QUERY_STORE = ON
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [PTIT_EventRoomBooking]
GO
/****** Object:  UserDefinedTableType [dbo].[DonViIDList]    Script Date: 6/16/2025 10:35:21 PM ******/
CREATE TYPE [dbo].[DonViIDList] AS TABLE(
	[DonViID] [int] NOT NULL,
	PRIMARY KEY CLUSTERED 
(
	[DonViID] ASC
)WITH (IGNORE_DUP_KEY = OFF)
)
GO
/****** Object:  Table [dbo].[ChiTietDatPhong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietDatPhong](
	[DatPhongID] [int] IDENTITY(1,1) NOT NULL,
	[YcMuonPhongCtID] [int] NOT NULL,
	[PhongID] [int] NOT NULL,
	[TgNhanPhongTT] [datetime] NULL,
	[TgTraPhongTT] [datetime] NULL,
	[GhiChuDatPhong] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[DatPhongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChuyenNganh]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChuyenNganh](
	[ChuyenNganhID] [int] IDENTITY(1,1) NOT NULL,
	[TenChuyenNganh] [nvarchar](200) NOT NULL,
	[MaChuyenNganh] [varchar](50) NULL,
	[NganhHocID] [int] NOT NULL,
	[MoTaCN] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[ChuyenNganhID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DanhGiaSK]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DanhGiaSK](
	[DanhGiaSkID] [bigint] IDENTITY(1,1) NOT NULL,
	[SuKienID] [int] NOT NULL,
	[NguoiDanhGiaID] [int] NOT NULL,
	[DiemNoiDung] [tinyint] NULL,
	[DiemToChuc] [tinyint] NULL,
	[DiemDiaDiem] [tinyint] NULL,
	[YKienDongGop] [nvarchar](max) NULL,
	[TgDanhGia] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DanhGiaSkID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DonVi]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DonVi](
	[DonViID] [int] IDENTITY(1,1) NOT NULL,
	[TenDonVi] [nvarchar](200) NOT NULL,
	[MaDonVi] [varchar](50) NULL,
	[LoaiDonVi] [nvarchar](100) NOT NULL,
	[DonViChaID] [int] NULL,
	[MoTaDv] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[DonViID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LoaiPhong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LoaiPhong](
	[LoaiPhongID] [int] IDENTITY(1,1) NOT NULL,
	[TenLoaiPhong] [nvarchar](100) NOT NULL,
	[MoTa] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[LoaiPhongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LoaiSuKien]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LoaiSuKien](
	[LoaiSuKienID] [int] IDENTITY(1,1) NOT NULL,
	[MaLoaiSK] [varchar](50) NOT NULL,
	[TenLoaiSK] [nvarchar](150) NOT NULL,
	[MoTaLoaiSK] [nvarchar](500) NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[LoaiSuKienID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LoaiTaiLieuSK]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LoaiTaiLieuSK](
	[LoaiTaiLieuID] [int] IDENTITY(1,1) NOT NULL,
	[TenLoaiTL] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[LoaiTaiLieuID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LoaiTang]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LoaiTang](
	[LoaiTangID] [int] IDENTITY(1,1) NOT NULL,
	[MaLoaiTang] [varchar](20) NOT NULL,
	[TenLoaiTang] [nvarchar](100) NOT NULL,
	[SoThuTu] [int] NULL,
	[MoTa] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[LoaiTangID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LopHoc]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LopHoc](
	[LopID] [int] IDENTITY(1,1) NOT NULL,
	[TenLop] [nvarchar](100) NOT NULL,
	[MaLop] [varchar](50) NULL,
	[NganhHocID] [int] NOT NULL,
	[ChuyenNganhID] [int] NULL,
	[NienKhoa] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[LopID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NganhHoc]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NganhHoc](
	[NganhHocID] [int] IDENTITY(1,1) NOT NULL,
	[TenNganhHoc] [nvarchar](200) NOT NULL,
	[MaNganhHoc] [varchar](50) NULL,
	[KhoaQuanLyID] [int] NOT NULL,
	[MoTaNH] [nvarchar](max) NULL,
	[CoChuyenNganh] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NganhHocID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NguoiDung]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NguoiDung](
	[NguoiDungID] [int] IDENTITY(1,1) NOT NULL,
	[MaDinhDanh] [varchar](50) NOT NULL,
	[HoTen] [nvarchar](150) NOT NULL,
	[Email] [varchar](150) NOT NULL,
	[SoDienThoai] [varchar](20) NULL,
	[AnhDaiDien] [varchar](500) NULL,
	[NgayTao] [datetime] NULL,
	[IsActive] [bit] NULL,
	[NgaySinh] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[NguoiDungID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NguoiDung_VaiTro]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NguoiDung_VaiTro](
	[GanVaiTroID] [int] IDENTITY(1,1) NOT NULL,
	[NguoiDungID] [int] NOT NULL,
	[VaiTroID] [int] NOT NULL,
	[DonViID] [int] NULL,
	[NgayBatDau] [date] NOT NULL,
	[NgayKetThuc] [date] NULL,
	[GhiChuGanVT] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[GanVaiTroID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OtpVaResetToken]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OtpVaResetToken](
	[TokenID] [int] IDENTITY(1,1) NOT NULL,
	[Email] [varchar](150) NOT NULL,
	[Otp] [varchar](10) NULL,
	[OtpExpiresAt] [datetime] NULL,
	[ResetToken] [varchar](255) NULL,
	[ResetTokenExpiresAt] [datetime] NULL,
	[LoaiToken] [varchar](30) NOT NULL,
	[DaSuDung] [bit] NOT NULL,
	[NgayTao] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TokenID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Phong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Phong](
	[PhongID] [int] IDENTITY(1,1) NOT NULL,
	[TenPhong] [nvarchar](100) NOT NULL,
	[MaPhong] [varchar](50) NULL,
	[LoaiPhongID] [int] NOT NULL,
	[SucChua] [int] NULL,
	[TrangThaiPhongID] [int] NOT NULL,
	[MoTaChiTietPhong] [nvarchar](max) NULL,
	[AnhMinhHoa] [varchar](500) NULL,
	[ToaNhaTangID] [int] NULL,
	[SoThuTuPhong] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[PhongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Phong_ThietBi]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Phong_ThietBi](
	[PhongID] [int] NOT NULL,
	[ThietBiID] [int] NOT NULL,
	[SoLuong] [int] NULL,
	[TinhTrang] [nvarchar](200) NULL,
PRIMARY KEY CLUSTERED 
(
	[PhongID] ASC,
	[ThietBiID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SK_DonViThamGia]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SK_DonViThamGia](
	[SuKienID] [int] NOT NULL,
	[DonViID] [int] NOT NULL,
	[VaiTroDonViSK] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[SuKienID] ASC,
	[DonViID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SK_MoiThamGia]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SK_MoiThamGia](
	[MoiThamGiaID] [bigint] IDENTITY(1,1) NOT NULL,
	[SuKienID] [int] NOT NULL,
	[NguoiDuocMoiID] [int] NOT NULL,
	[VaiTroDuKienSK] [nvarchar](200) NULL,
	[IsChapNhanMoi] [bit] NULL,
	[TgPhanHoiMoi] [datetime] NULL,
	[GhiChuMoi] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[MoiThamGiaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SuKien]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SuKien](
	[SuKienID] [int] IDENTITY(1,1) NOT NULL,
	[TenSK] [nvarchar](300) NOT NULL,
	[TgBatDauDK] [datetime] NOT NULL,
	[TgKetThucDK] [datetime] NOT NULL,
	[NguoiChuTriID] [int] NULL,
	[TenChuTriNgoai] [nvarchar](150) NULL,
	[DonViChuTriNgoai] [nvarchar](200) NULL,
	[DonViChuTriID] [int] NOT NULL,
	[SlThamDuDK] [int] NULL,
	[MoTaChiTiet] [nvarchar](max) NULL,
	[TrangThaiSkID] [int] NOT NULL,
	[NguoiTaoID] [int] NOT NULL,
	[NgayTaoSK] [datetime] NULL,
	[NguoiDuyetBGHID] [int] NULL,
	[NgayDuyetBGH] [datetime] NULL,
	[LyDoTuChoiBGH] [nvarchar](max) NULL,
	[LyDoHuyNguoiTao] [nvarchar](max) NULL,
	[IsCongKhaiNoiBo] [bit] NULL,
	[KhachMoiNgoaiGhiChu] [nvarchar](max) NULL,
	[LoaiSuKienID] [int] NULL,
	[TgBatDauThucTe] [datetime] NULL,
	[TgKetThucThucTe] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[SuKienID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TaiKhoan]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaiKhoan](
	[TaiKhoanID] [int] IDENTITY(1,1) NOT NULL,
	[NguoiDungID] [int] NOT NULL,
	[MatKhauHash] [varchar](255) NOT NULL,
	[LanDangNhapCuoi] [datetime] NULL,
	[TrangThaiTk] [varchar](50) NOT NULL,
	[NgayTaoTk] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[TaiKhoanID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TaiLieuSK]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaiLieuSK](
	[TaiLieuSkID] [bigint] IDENTITY(1,1) NOT NULL,
	[SuKienID] [int] NOT NULL,
	[LoaiTaiLieuID] [int] NOT NULL,
	[TenHienThiTL] [nvarchar](255) NOT NULL,
	[DuongDanFile] [varchar](500) NOT NULL,
	[MoTaTL] [nvarchar](max) NULL,
	[NguoiTaiLenID] [int] NOT NULL,
	[NgayTaiLen] [datetime] NULL,
	[IsCongKhaiTL] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[TaiLieuSkID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ThanhVienCLB]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ThanhVienCLB](
	[ThanhVienClbID] [int] IDENTITY(1,1) NOT NULL,
	[NguoiDungID] [int] NOT NULL,
	[DonViID_CLB] [int] NOT NULL,
	[ChucVuTrongCLB] [nvarchar](100) NULL,
	[NgayGiaNhap] [date] NOT NULL,
	[NgayRoiCLB] [date] NULL,
	[IsActiveInCLB] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ThanhVienClbID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ThongBao]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ThongBao](
	[ThongBaoID] [bigint] IDENTITY(1,1) NOT NULL,
	[NguoiNhanID] [int] NULL,
	[DonViNhanID] [int] NULL,
	[SkLienQuanID] [int] NULL,
	[YcLienQuanID] [int] NULL,
	[LoaiYcLienQuan] [varchar](50) NULL,
	[NoiDungTB] [nvarchar](max) NOT NULL,
	[DuongDanTB] [varchar](500) NULL,
	[NgayTaoTB] [datetime] NULL,
	[DaDocTB] [bit] NULL,
	[NgayDocTB] [datetime] NULL,
	[LoaiThongBao] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[ThongBaoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ThongTinGiangVien]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ThongTinGiangVien](
	[NguoiDungID] [int] NOT NULL,
	[DonViCongTacID] [int] NOT NULL,
	[HocVi] [nvarchar](100) NULL,
	[HocHam] [nvarchar](100) NULL,
	[ChucDanhGD] [nvarchar](100) NULL,
	[ChuyenMonChinh] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[NguoiDungID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ThongTinSinhVien]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ThongTinSinhVien](
	[NguoiDungID] [int] NOT NULL,
	[LopID] [int] NOT NULL,
	[KhoaHoc] [varchar](50) NULL,
	[HeDaoTao] [nvarchar](100) NULL,
	[NgayNhapHoc] [date] NULL,
	[TrangThaiHocTap] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[NguoiDungID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ToaNha]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ToaNha](
	[ToaNhaID] [int] IDENTITY(1,1) NOT NULL,
	[MaToaNha] [varchar](20) NOT NULL,
	[TenToaNha] [nvarchar](100) NOT NULL,
	[CoSoID] [int] NOT NULL,
	[MoTaToaNha] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[ToaNhaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ToaNha_Tang]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ToaNha_Tang](
	[ToaNhaTangID] [int] IDENTITY(1,1) NOT NULL,
	[ToaNhaID] [int] NOT NULL,
	[LoaiTangID] [int] NOT NULL,
	[SoPhong] [int] NULL,
	[MoTa] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[ToaNhaTangID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TrangThaiPhong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TrangThaiPhong](
	[TrangThaiPhongID] [int] IDENTITY(1,1) NOT NULL,
	[TenTrangThai] [nvarchar](100) NOT NULL,
	[MoTa] [nvarchar](255) NULL,
	[MaTrangThai] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TrangThaiPhongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TrangThaiSK]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TrangThaiSK](
	[TrangThaiSkID] [int] IDENTITY(1,1) NOT NULL,
	[MaTrangThai] [varchar](50) NOT NULL,
	[TenTrangThai] [nvarchar](150) NOT NULL,
	[MoTa] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[TrangThaiSkID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TrangThaiYeuCauDoiPhong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TrangThaiYeuCauDoiPhong](
	[TrangThaiYcDoiPID] [int] IDENTITY(1,1) NOT NULL,
	[MaTrangThai] [varchar](50) NOT NULL,
	[TenTrangThai] [nvarchar](150) NOT NULL,
	[MoTa] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[TrangThaiYcDoiPID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TrangThaiYeuCauHuySK]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TrangThaiYeuCauHuySK](
	[TrangThaiYcHuySkID] [int] IDENTITY(1,1) NOT NULL,
	[MaTrangThai] [varchar](50) NOT NULL,
	[TenTrangThai] [nvarchar](150) NOT NULL,
	[MoTa] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[TrangThaiYcHuySkID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TrangThaiYeuCauPhong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TrangThaiYeuCauPhong](
	[TrangThaiYcpID] [int] IDENTITY(1,1) NOT NULL,
	[MaTrangThai] [varchar](50) NOT NULL,
	[TenTrangThai] [nvarchar](150) NOT NULL,
	[LoaiApDung] [varchar](20) NOT NULL,
	[MoTa] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[TrangThaiYcpID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TrangThietBi]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TrangThietBi](
	[ThietBiID] [int] IDENTITY(1,1) NOT NULL,
	[TenThietBi] [nvarchar](150) NOT NULL,
	[MoTa] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[ThietBiID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VaiTroHeThong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VaiTroHeThong](
	[VaiTroID] [int] IDENTITY(1,1) NOT NULL,
	[MaVaiTro] [varchar](50) NOT NULL,
	[TenVaiTro] [nvarchar](150) NOT NULL,
	[MoTaVT] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[VaiTroID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[YcMuonPhongChiTiet]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[YcMuonPhongChiTiet](
	[YcMuonPhongCtID] [int] IDENTITY(1,1) NOT NULL,
	[YcMuonPhongID] [int] NOT NULL,
	[MoTaNhomPhong] [nvarchar](200) NULL,
	[SlPhongNhomNay] [int] NOT NULL,
	[LoaiPhongYcID] [int] NULL,
	[SucChuaYc] [int] NULL,
	[ThietBiThemYc] [nvarchar](max) NULL,
	[TgMuonDk] [datetime] NOT NULL,
	[TgTraDk] [datetime] NOT NULL,
	[TrangThaiCtID] [int] NOT NULL,
	[GhiChuCtCSVC] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[YcMuonPhongCtID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[YeuCauDoiPhong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[YeuCauDoiPhong](
	[YcDoiPhongID] [int] IDENTITY(1,1) NOT NULL,
	[YcMuonPhongCtID] [int] NOT NULL,
	[DatPhongID_Cu] [int] NOT NULL,
	[NguoiYeuCauID] [int] NOT NULL,
	[NgayYeuCauDoi] [datetime] NULL,
	[LyDoDoiPhong] [nvarchar](max) NOT NULL,
	[YcPhongMoi_LoaiID] [int] NULL,
	[YcPhongMoi_SucChua] [int] NULL,
	[YcPhongMoi_ThietBi] [nvarchar](max) NULL,
	[TrangThaiYcDoiPID] [int] NOT NULL,
	[NguoiDuyetDoiCSVCID] [int] NULL,
	[NgayDuyetDoiCSVC] [datetime] NULL,
	[DatPhongID_Moi] [int] NULL,
	[LyDoTuChoiDoiCSVC] [nvarchar](max) NULL,
	[GhiChuDoiCSVC] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[YcDoiPhongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[YeuCauHuySK]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[YeuCauHuySK](
	[YcHuySkID] [int] IDENTITY(1,1) NOT NULL,
	[SuKienID] [int] NOT NULL,
	[NguoiYeuCauID] [int] NOT NULL,
	[NgayYeuCauHuy] [datetime] NULL,
	[LyDoHuy] [nvarchar](max) NOT NULL,
	[TrangThaiYcHuySkID] [int] NOT NULL,
	[NguoiDuyetHuyBGHID] [int] NULL,
	[NgayDuyetHuyBGH] [datetime] NULL,
	[LyDoTuChoiHuyBGH] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[YcHuySkID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[YeuCauMuonPhong]    Script Date: 6/16/2025 10:35:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[YeuCauMuonPhong](
	[YcMuonPhongID] [int] IDENTITY(1,1) NOT NULL,
	[SuKienID] [int] NOT NULL,
	[NguoiYeuCauID] [int] NOT NULL,
	[NgayYeuCau] [datetime] NULL,
	[TrangThaiChungID] [int] NOT NULL,
	[NguoiDuyetTongCSVCID] [int] NULL,
	[NgayDuyetTongCSVC] [datetime] NULL,
	[GhiChuChungYc] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[YcMuonPhongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[ChiTietDatPhong] ON 

INSERT [dbo].[ChiTietDatPhong] ([DatPhongID], [YcMuonPhongCtID], [PhongID], [TgNhanPhongTT], [TgTraPhongTT], [GhiChuDatPhong]) VALUES (3, 1, 1, CAST(N'2025-06-03T01:00:00.000' AS DateTime), CAST(N'2025-06-03T10:00:00.000' AS DateTime), NULL)
INSERT [dbo].[ChiTietDatPhong] ([DatPhongID], [YcMuonPhongCtID], [PhongID], [TgNhanPhongTT], [TgTraPhongTT], [GhiChuDatPhong]) VALUES (4, 2, 1, CAST(N'2025-06-07T01:00:00.000' AS DateTime), CAST(N'2025-06-07T10:00:00.000' AS DateTime), NULL)
INSERT [dbo].[ChiTietDatPhong] ([DatPhongID], [YcMuonPhongCtID], [PhongID], [TgNhanPhongTT], [TgTraPhongTT], [GhiChuDatPhong]) VALUES (6, 2, 2, CAST(N'2025-06-07T01:00:00.000' AS DateTime), CAST(N'2025-06-07T10:00:00.000' AS DateTime), NULL)
SET IDENTITY_INSERT [dbo].[ChiTietDatPhong] OFF
GO
SET IDENTITY_INSERT [dbo].[DonVi] ON 

INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (1, N'Ban Giám Hiệu PTITHCM', N'BGH_PTIT', N'BAN', NULL, N'Ban Giám Hiệu Học viện')
INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (2, N'Phòng Quản trị Cơ sở Vật chất', N'P_CSVC', N'PHONG', NULL, N'Phòng quản lý cơ sở vật chất, phòng ốc')
INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (3, N'Đoàn Thanh niên Trường', N'DOAN_TRUONG', N'DOAN_THE', NULL, N'Đoàn Thanh niên CSHCM cấp Trường')
INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (4, N'Khoa Công nghệ Thông tin', N'K_CNTT', N'KHOA', NULL, NULL)
INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (5, N'Phòng Công tác Sinh viên', N'P_CTSV', N'PHONG', NULL, N'Phòng chịu trách nhiệm các hoạt động liên quan đến sinh viên')
INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (6, N'Phòng Chủ trì Sự kiện', N'P_CTSK', N'PHONG', NULL, N'Phòng chịu trách nhiệm tổ chức và điều phối các sự kiện trong trường')
INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (7, N'PTITHCM - Cơ sở Quận 1', N'CS_Q1', N'CO_SO', NULL, N'Cơ sở tại Quận 1, TP.HCM')
INSERT [dbo].[DonVi] ([DonViID], [TenDonVi], [MaDonVi], [LoaiDonVi], [DonViChaID], [MoTaDv]) VALUES (8, N'PTITHCM - Cơ sở Quận 9', N'CS_Q9', N'CO_SO', NULL, N'Cơ sở tại Quận 9, TP. Thủ Đức')
SET IDENTITY_INSERT [dbo].[DonVi] OFF
GO
SET IDENTITY_INSERT [dbo].[LoaiPhong] ON 

INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (1, N'Phòng học Tiêu chuẩn', N'Phòng học thông thường, có bảng, máy chiếu cơ bản.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (2, N'Phòng học Lớn', N'Phòng học có sức chứa lớn hơn, phù hợp cho các lớp đông hoặc buổi nói chuyện nhỏ.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (3, N'Phòng Hội thảo Nhỏ', N'Phòng họp/hội thảo quy mô nhỏ, trang bị cho thuyết trình.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (4, N'Phòng Hội thảo Trung bình', N'Phòng họp/hội thảo quy mô vừa, trang bị đầy đủ âm thanh, máy chiếu.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (5, N'Hội trường', N'Không gian lớn, có sân khấu, âm thanh, ánh sáng chuyên nghiệp cho các sự kiện lớn.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (6, N'Phòng Thực hành Máy tính', N'Phòng được trang bị đầy đủ máy tính cho việc thực hành.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (7, N'Phòng Lab Chuyên Dụng', N'Phòng thí nghiệm/thực hành với các thiết bị chuyên ngành cụ thể.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (8, N'Phòng Truyền thống', N'Phòng trưng bày hoặc mang ý nghĩa lịch sử, văn hóa của trường.')
INSERT [dbo].[LoaiPhong] ([LoaiPhongID], [TenLoaiPhong], [MoTa]) VALUES (9, N'Không gian Mở / Sảnh', N'Các khu vực sảnh, không gian chung có thể sử dụng cho các hoạt động nhỏ, trưng bày.')
SET IDENTITY_INSERT [dbo].[LoaiPhong] OFF
GO
SET IDENTITY_INSERT [dbo].[LoaiSuKien] ON 

INSERT [dbo].[LoaiSuKien] ([LoaiSuKienID], [MaLoaiSK], [TenLoaiSK], [MoTaLoaiSK], [IsActive]) VALUES (1, N'HOI_THAO', N'Hội thảo / Hội nghị', N'Các sự kiện học thuật, chia sẻ kiến thức', 1)
INSERT [dbo].[LoaiSuKien] ([LoaiSuKienID], [MaLoaiSK], [TenLoaiSK], [MoTaLoaiSK], [IsActive]) VALUES (2, N'VAN_NGHE', N'Văn hóa - Văn nghệ', N'Các chương trình biểu diễn nghệ thuật, giao lưu văn hóa', 1)
INSERT [dbo].[LoaiSuKien] ([LoaiSuKienID], [MaLoaiSK], [TenLoaiSK], [MoTaLoaiSK], [IsActive]) VALUES (3, N'THE_THAO', N'Thể dục - Thể thao', N'Các giải đấu, hoạt động thể chất', 1)
INSERT [dbo].[LoaiSuKien] ([LoaiSuKienID], [MaLoaiSK], [TenLoaiSK], [MoTaLoaiSK], [IsActive]) VALUES (4, N'TUYEN_DUNG', N'Ngày hội Tuyển dụng', N'Sự kiện kết nối doanh nghiệp và sinh viên', 1)
INSERT [dbo].[LoaiSuKien] ([LoaiSuKienID], [MaLoaiSK], [TenLoaiSK], [MoTaLoaiSK], [IsActive]) VALUES (5, N'WORKSHOP', N'Workshop / Tập huấn', N'Buổi thực hành, đào tạo kỹ năng', 1)
INSERT [dbo].[LoaiSuKien] ([LoaiSuKienID], [MaLoaiSK], [TenLoaiSK], [MoTaLoaiSK], [IsActive]) VALUES (6, N'KHAC', N'Sự kiện Khác', N'Các loại sự kiện không thuộc nhóm trên', 1)
SET IDENTITY_INSERT [dbo].[LoaiSuKien] OFF
GO
SET IDENTITY_INSERT [dbo].[LoaiTang] ON 

INSERT [dbo].[LoaiTang] ([LoaiTangID], [MaLoaiTang], [TenLoaiTang], [SoThuTu], [MoTa]) VALUES (1, N'TRET', N'Tầng Trệt', 0, N'Tầng sát mặt đất')
INSERT [dbo].[LoaiTang] ([LoaiTangID], [MaLoaiTang], [TenLoaiTang], [SoThuTu], [MoTa]) VALUES (2, N'LUNG', N'Tầng Lửng', 0, N'Tầng trung gian')
INSERT [dbo].[LoaiTang] ([LoaiTangID], [MaLoaiTang], [TenLoaiTang], [SoThuTu], [MoTa]) VALUES (3, N'TANG_1', N'Tầng 1', 1, NULL)
INSERT [dbo].[LoaiTang] ([LoaiTangID], [MaLoaiTang], [TenLoaiTang], [SoThuTu], [MoTa]) VALUES (4, N'TANG_2', N'Tầng 2', 2, NULL)
SET IDENTITY_INSERT [dbo].[LoaiTang] OFF
GO
SET IDENTITY_INSERT [dbo].[LopHoc] ON 

INSERT [dbo].[LopHoc] ([LopID], [TenLop], [MaLop], [NganhHocID], [ChuyenNganhID], [NienKhoa]) VALUES (1, N'D20CNTT01-SEED-F', N'D20CN01_SEED_F', 1, NULL, N'2020-2025')
SET IDENTITY_INSERT [dbo].[LopHoc] OFF
GO
SET IDENTITY_INSERT [dbo].[NganhHoc] ON 

INSERT [dbo].[NganhHoc] ([NganhHocID], [TenNganhHoc], [MaNganhHoc], [KhoaQuanLyID], [MoTaNH], [CoChuyenNganh]) VALUES (1, N'Công nghệ Thông tin (Mẫu F)', N'7480201_SEED_F', 4, N'', 1)
SET IDENTITY_INSERT [dbo].[NganhHoc] OFF
GO
SET IDENTITY_INSERT [dbo].[NguoiDung] ON 

INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (1, N'ADMIN001F', N'Quản Trị Viên Hệ Thống Chính', N'sonthanhit35@gmail.com', N'0912345001', NULL, CAST(N'2025-05-23T15:31:56.933' AS DateTime), 1, NULL)
INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (2, N'GVBTD001F', N'Nguyễn Văn Bí Thư', N'sonthanh12345678910@gmail.com', N'0912345002', NULL, CAST(N'2025-05-23T15:31:56.943' AS DateTime), 1, NULL)
INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (3, N'CSVC001F', N'Trần Thị Vật Chất', N'sonthanh1234567891011@gmail.com', N'0912345003', NULL, CAST(N'2025-05-23T15:31:56.947' AS DateTime), 1, NULL)
INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (4, N'GVBGH001F', N'Lê Ban Giám Hiệu', N'sonthanh123456789101112@gmail.com', N'0912345004', NULL, CAST(N'2025-05-23T15:31:56.950' AS DateTime), 1, NULL)
INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (5, N'CBCTSV001F2', N'Phạm Thị Kế Hoạch V2', N'sonthanh030504@gmail.com', N'0912345015', NULL, CAST(N'2025-05-23T16:29:20.033' AS DateTime), 1, NULL)
INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (11, N'GV007', N'Lê Minh Cường', N'cuong.lm@ptithcm.edu.vn', N'0912345610', NULL, CAST(N'2025-06-07T16:37:29.790' AS DateTime), 1, CAST(N'1985-10-20' AS Date))
INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (12, N'GV008', N'Phạm Thị Dung', N'dung.pt@ptithcm.edu.vn', N'0912345611', NULL, CAST(N'2025-06-07T16:37:29.893' AS DateTime), 1, CAST(N'1990-05-11' AS Date))
INSERT [dbo].[NguoiDung] ([NguoiDungID], [MaDinhDanh], [HoTen], [Email], [SoDienThoai], [AnhDaiDien], [NgayTao], [IsActive], [NgaySinh]) VALUES (13, N'NV003', N'Hoàng Văn Em', N'em.hv@ptithcm.edu.vn', N'0912345612', NULL, CAST(N'2025-06-07T16:37:29.987' AS DateTime), 1, CAST(N'1995-01-01' AS Date))
SET IDENTITY_INSERT [dbo].[NguoiDung] OFF
GO
SET IDENTITY_INSERT [dbo].[NguoiDung_VaiTro] ON 

INSERT [dbo].[NguoiDung_VaiTro] ([GanVaiTroID], [NguoiDungID], [VaiTroID], [DonViID], [NgayBatDau], [NgayKetThuc], [GhiChuGanVT]) VALUES (1, 1, 1, NULL, CAST(N'2025-05-23' AS Date), NULL, NULL)
INSERT [dbo].[NguoiDung_VaiTro] ([GanVaiTroID], [NguoiDungID], [VaiTroID], [DonViID], [NgayBatDau], [NgayKetThuc], [GhiChuGanVT]) VALUES (2, 2, 4, 3, CAST(N'2025-05-23' AS Date), NULL, NULL)
INSERT [dbo].[NguoiDung_VaiTro] ([GanVaiTroID], [NguoiDungID], [VaiTroID], [DonViID], [NgayBatDau], [NgayKetThuc], [GhiChuGanVT]) VALUES (3, 3, 3, 2, CAST(N'2025-05-23' AS Date), NULL, NULL)
INSERT [dbo].[NguoiDung_VaiTro] ([GanVaiTroID], [NguoiDungID], [VaiTroID], [DonViID], [NgayBatDau], [NgayKetThuc], [GhiChuGanVT]) VALUES (4, 4, 2, 1, CAST(N'2025-05-23' AS Date), NULL, NULL)
INSERT [dbo].[NguoiDung_VaiTro] ([GanVaiTroID], [NguoiDungID], [VaiTroID], [DonViID], [NgayBatDau], [NgayKetThuc], [GhiChuGanVT]) VALUES (5, 5, 5, 6, CAST(N'2025-05-23' AS Date), NULL, NULL)
SET IDENTITY_INSERT [dbo].[NguoiDung_VaiTro] OFF
GO
SET IDENTITY_INSERT [dbo].[OtpVaResetToken] ON 

INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (1, N'sonthanhit35@gmail.com', N'116535', CAST(N'2025-05-24T16:00:24.367' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-24T22:50:24.413' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (2, N'sonthanh030504@gmail.com', N'466427', CAST(N'2025-05-24T16:27:41.300' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-24T23:17:41.383' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (3, N'sonthanh030504@gmail.com', N'684270', CAST(N'2025-05-24T16:29:41.597' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-24T23:19:41.620' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (4, N'sonthanh030504@gmail.com', N'215576', CAST(N'2025-05-24T16:40:55.973' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-24T23:30:56.000' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (5, N'sonthanh030504@gmail.com', N'727408', CAST(N'2025-05-24T16:53:44.230' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-24T16:43:44.230' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (6, N'sonthanh030504@gmail.com', N'448296', CAST(N'2025-05-24T23:58:04.237' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-24T23:48:04.237' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (7, N'sonthanh030504@gmail.com', NULL, NULL, N'5faab0a578f2fe51d8853321c7675d0e4ff3cec80e067551e6648c2c2b423990', CAST(N'2025-05-24T17:48:27.723' AS DateTime), N'RESET_PASSWORD_TOKEN', 0, CAST(N'2025-05-24T23:48:27.743' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (8, N'sonthanhit35@gmail.com', N'974205', CAST(N'2025-05-25T00:00:57.303' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-24T23:50:57.303' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (9, N'sonthanhit35@gmail.com', NULL, NULL, N'd0617d6fbcce977f148ed278c82ef818a7a33425fc4217a26d826ce7afab4034', CAST(N'2025-05-25T00:51:18.593' AS DateTime), N'RESET_PASSWORD_TOKEN', 1, CAST(N'2025-05-24T23:51:18.593' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (10, N'sonthanhit35@gmail.com', N'256310', CAST(N'2025-05-31T11:09:12.510' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 1, CAST(N'2025-05-31T10:59:12.510' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (11, N'sonthanhit35@gmail.com', NULL, NULL, N'2f9e7cb460660bd2214dd1c160c2f583cb5d8e718946454d9ee3e673ae6405f4', CAST(N'2025-05-31T12:00:22.410' AS DateTime), N'RESET_PASSWORD_TOKEN', 1, CAST(N'2025-05-31T11:00:22.410' AS DateTime))
INSERT [dbo].[OtpVaResetToken] ([TokenID], [Email], [Otp], [OtpExpiresAt], [ResetToken], [ResetTokenExpiresAt], [LoaiToken], [DaSuDung], [NgayTao]) VALUES (12, N'sonthanhit35@gmail.com', N'131282', CAST(N'2025-06-04T11:00:43.413' AS DateTime), NULL, NULL, N'OTP_QUEN_MK', 0, CAST(N'2025-06-04T10:50:43.413' AS DateTime))
SET IDENTITY_INSERT [dbo].[OtpVaResetToken] OFF
GO
SET IDENTITY_INSERT [dbo].[Phong] ON 

INSERT [dbo].[Phong] ([PhongID], [TenPhong], [MaPhong], [LoaiPhongID], [SucChua], [TrangThaiPhongID], [MoTaChiTietPhong], [AnhMinhHoa], [ToaNhaTangID], [SoThuTuPhong]) VALUES (1, N'sfsf', N'ddd?', 1, 144, 1, N'dsfefe', N'https://kenh14cdn.com/2018/9/24/152-15377941961531521458985.jpg', 1, N'101')
INSERT [dbo].[Phong] ([PhongID], [TenPhong], [MaPhong], [LoaiPhongID], [SucChua], [TrangThaiPhongID], [MoTaChiTietPhong], [AnhMinhHoa], [ToaNhaTangID], [SoThuTuPhong]) VALUES (2, N'sfsf', N'd', 1, 160, 1, N'qqqqqqqqqqqqq', N'https://kenh14cdn.com/2018/9/24/152-15377941961531521458985.jpg', 1, N'101')
INSERT [dbo].[Phong] ([PhongID], [TenPhong], [MaPhong], [LoaiPhongID], [SucChua], [TrangThaiPhongID], [MoTaChiTietPhong], [AnhMinhHoa], [ToaNhaTangID], [SoThuTuPhong]) VALUES (4, N'phòng học ', N'1A_Q1TANG_201', 1, 100, 1, N'aaa', N'https://kenh14cdn.com/2018/9/24/152-15377941961531521458985.jpg', 2, N'1')
SET IDENTITY_INSERT [dbo].[Phong] OFF
GO
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (3, 4, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (3, 5, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (3, 8, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (4, 3, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (4, 4, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (4, 5, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (5, 2, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (5, 4, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (5, 7, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (6, 3, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (6, 6, NULL)
INSERT [dbo].[SK_DonViThamGia] ([SuKienID], [DonViID], [VaiTroDonViSK]) VALUES (6, 7, NULL)
GO
SET IDENTITY_INSERT [dbo].[SuKien] ON 

INSERT [dbo].[SuKien] ([SuKienID], [TenSK], [TgBatDauDK], [TgKetThucDK], [NguoiChuTriID], [TenChuTriNgoai], [DonViChuTriNgoai], [DonViChuTriID], [SlThamDuDK], [MoTaChiTiet], [TrangThaiSkID], [NguoiTaoID], [NgayTaoSK], [NguoiDuyetBGHID], [NgayDuyetBGH], [LyDoTuChoiBGH], [LyDoHuyNguoiTao], [IsCongKhaiNoiBo], [KhachMoiNgoaiGhiChu], [LoaiSuKienID], [TgBatDauThucTe], [TgKetThucThucTe]) VALUES (3, N'Hội thảo là dùyyyyy', CAST(N'2025-06-03T01:00:00.000' AS DateTime), CAST(N'2025-06-03T10:00:00.000' AS DateTime), NULL, N'hello', N'công ty qualcomn', 3, 10000, N'cạvaihvuoidsbv', 9, 1, CAST(N'2025-06-02T17:02:51.060' AS DateTime), 1, CAST(N'2025-06-02T10:07:29.957' AS DateTime), NULL, NULL, 1, N'hong cóa', 1, NULL, NULL)
INSERT [dbo].[SuKien] ([SuKienID], [TenSK], [TgBatDauDK], [TgKetThucDK], [NguoiChuTriID], [TenChuTriNgoai], [DonViChuTriNgoai], [DonViChuTriID], [SlThamDuDK], [MoTaChiTiet], [TrangThaiSkID], [NguoiTaoID], [NgayTaoSK], [NguoiDuyetBGHID], [NgayDuyetBGH], [LyDoTuChoiBGH], [LyDoHuyNguoiTao], [IsCongKhaiNoiBo], [KhachMoiNgoaiGhiChu], [LoaiSuKienID], [TgBatDauThucTe], [TgKetThucThucTe]) VALUES (4, N'helllo ae', CAST(N'2025-06-05T01:00:00.000' AS DateTime), CAST(N'2025-06-05T10:00:00.000' AS DateTime), NULL, N'hello', N'công ty qualcomn', 6, NULL, N'sgisrjiosrgersh', 11, 5, CAST(N'2025-06-04T09:55:39.980' AS DateTime), 1, CAST(N'2025-06-04T02:56:10.953' AS DateTime), NULL, NULL, 1, N'fhntdntdynty', 3, NULL, NULL)
INSERT [dbo].[SuKien] ([SuKienID], [TenSK], [TgBatDauDK], [TgKetThucDK], [NguoiChuTriID], [TenChuTriNgoai], [DonViChuTriNgoai], [DonViChuTriID], [SlThamDuDK], [MoTaChiTiet], [TrangThaiSkID], [NguoiTaoID], [NgayTaoSK], [NguoiDuyetBGHID], [NgayDuyetBGH], [LyDoTuChoiBGH], [LyDoHuyNguoiTao], [IsCongKhaiNoiBo], [KhachMoiNgoaiGhiChu], [LoaiSuKienID], [TgBatDauThucTe], [TgKetThucThucTe]) VALUES (5, N'ỳghgfgxx', CAST(N'2025-06-06T01:00:00.000' AS DateTime), CAST(N'2025-06-06T10:00:00.000' AS DateTime), NULL, N'hello', N'công ty qualcomn', 1, 150, N'thth', 12, 1, CAST(N'2025-06-04T21:15:46.873' AS DateTime), 1, CAST(N'2025-06-06T10:57:50.570' AS DateTime), N'vdvdvddđdđ', N'Người tạo tự hủy', 1, N' jhbjsdgdgddddrrrr', 4, NULL, NULL)
INSERT [dbo].[SuKien] ([SuKienID], [TenSK], [TgBatDauDK], [TgKetThucDK], [NguoiChuTriID], [TenChuTriNgoai], [DonViChuTriNgoai], [DonViChuTriID], [SlThamDuDK], [MoTaChiTiet], [TrangThaiSkID], [NguoiTaoID], [NgayTaoSK], [NguoiDuyetBGHID], [NgayDuyetBGH], [LyDoTuChoiBGH], [LyDoHuyNguoiTao], [IsCongKhaiNoiBo], [KhachMoiNgoaiGhiChu], [LoaiSuKienID], [TgBatDauThucTe], [TgKetThucThucTe]) VALUES (6, N'ỳghgfg', CAST(N'2025-06-07T01:00:00.000' AS DateTime), CAST(N'2025-06-07T10:00:00.000' AS DateTime), NULL, N'hello', N'sqdsdwdw', 8, 159, N'sderrwefwe', 10, 1, CAST(N'2025-06-06T17:49:22.240' AS DateTime), 1, CAST(N'2025-06-06T11:10:58.637' AS DateTime), NULL, NULL, 1, N'ưdwdwdwdwdwdwdwdwdwdwdwd', 6, NULL, NULL)
SET IDENTITY_INSERT [dbo].[SuKien] OFF
GO
SET IDENTITY_INSERT [dbo].[TaiKhoan] ON 

INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (1, 1, N'$2b$10$s6AHIKBiaQ1n724ar5K/zu7KI8D2KGNtkVosutT3gtcT7ewQumtsW', NULL, N'Active', CAST(N'2025-05-23T15:31:56.940' AS DateTime))
INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (2, 2, N'$2a$10$lzSCXzXHtCquOzo6yCJ31uACJiCNjC3FRUGoMLMbZHFZrI21G8LYu', NULL, N'Active', CAST(N'2025-05-23T15:31:56.943' AS DateTime))
INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (3, 3, N'$2a$10$lzSCXzXHtCquOzo6yCJ31uACJiCNjC3FRUGoMLMbZHFZrI21G8LYu', NULL, N'Active', CAST(N'2025-05-23T15:31:56.950' AS DateTime))
INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (4, 4, N'$2a$10$lzSCXzXHtCquOzo6yCJ31uACJiCNjC3FRUGoMLMbZHFZrI21G8LYu', NULL, N'Active', CAST(N'2025-05-23T15:31:56.950' AS DateTime))
INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (5, 5, N'$2b$10$Mo13jgeEM5KbGw2C6hLcnuuRrHPJCwET695/DKtbOFMR5fbAfdytm', NULL, N'Active', CAST(N'2025-05-23T16:29:20.037' AS DateTime))
INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (11, 11, N'$2b$10$a6UwlxWvoGAMw0vkOkgzWeIoJxboTAUBws6OaRxlJEf4J5/ZYOVJa', NULL, N'Active', CAST(N'2025-06-07T16:37:29.873' AS DateTime))
INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (12, 12, N'$2b$10$4UGqb1kwkDeUmMj3sK.CU.quFH/PX./iadtAgrGeBF2.Uq9AkBjxG', NULL, N'Active', CAST(N'2025-06-07T16:37:29.977' AS DateTime))
INSERT [dbo].[TaiKhoan] ([TaiKhoanID], [NguoiDungID], [MatKhauHash], [LanDangNhapCuoi], [TrangThaiTk], [NgayTaoTk]) VALUES (13, 13, N'$2b$10$8kz8NJUHxUU2JJjKzfa7E.HP/nR0y4h72VNQLvRYeQBBGd7ebsRQi', NULL, N'Active', CAST(N'2025-06-07T16:37:30.070' AS DateTime))
SET IDENTITY_INSERT [dbo].[TaiKhoan] OFF
GO
SET IDENTITY_INSERT [dbo].[ThongBao] ON 

INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (1, 4, NULL, 3, NULL, NULL, N'Có sự kiện mới "[Hội thảo là dùyyyyy]" đang chờ Ban Giám Hiệu duyệt.', N'/admin/su-kien-cho-duyet/3', CAST(N'2025-06-02T17:02:51.237' AS DateTime), 0, NULL, N'SU_KIEN_MOI_CHO_DUYET_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (2, 1, NULL, 3, NULL, NULL, N'Sự kiện "[Hội thảo là dùyyyyy]" của bạn đã được Ban Giám Hiệu duyệt. Vui lòng tiến hành đăng ký phòng.', N'/quan-ly-su-kien/3/chi-tiet', CAST(N'2025-06-02T17:07:30.083' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'SU_KIEN_DA_DUYET_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (3, 1, NULL, NULL, 1, N'YEUCAUMUONPHONG', N'Chi tiết yêu cầu phòng (ID: 1) cho sự kiện "[Hội thảo là dùyyyyy]" đã được duyệt và xếp phòng.', N'/yeu-cau-muon-phong/1', CAST(N'2025-06-03T19:35:15.553' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'YC_PHONG_DA_DUYET_CSVC')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (4, 4, NULL, 4, NULL, NULL, N'Có sự kiện mới "[helllo ae]" đang chờ Ban Giám Hiệu duyệt.', N'/admin/su-kien-cho-duyet/4', CAST(N'2025-06-04T09:55:40.140' AS DateTime), 0, NULL, N'SU_KIEN_MOI_CHO_DUYET_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (5, 5, NULL, 4, NULL, NULL, N'Sự kiện "[helllo ae]" của bạn đã được Ban Giám Hiệu duyệt. Vui lòng tiến hành đăng ký phòng.', N'/quan-ly-su-kien/4/chi-tiet', CAST(N'2025-06-04T09:56:11.043' AS DateTime), 0, NULL, N'SU_KIEN_DA_DUYET_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (6, 4, NULL, 3, NULL, NULL, N'Có yêu cầu hủy cho sự kiện "[Hội thảo là dùyyyyy]" đang chờ Ban Giám Hiệu duyệt.', N'/admin/yeu-cau-huy-cho-duyet/3', CAST(N'2025-06-04T17:17:11.687' AS DateTime), 0, NULL, N'YC_HUY_SK_MOI_CHO_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (7, 1, NULL, 3, NULL, NULL, N'Yêu cầu hủy sự kiện "[Hội thảo là dùyyyyy]" của bạn đã được Ban Giám Hiệu DUYỆT. Sự kiện đã được hủy thành công. Các phòng đã đặt đã được giải phóng.', N'/quan-ly-su-kien/3/chi-tiet', CAST(N'2025-06-04T18:55:47.833' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'YC_HUY_SK_DA_DUYET')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (8, 3, NULL, 3, NULL, NULL, N'Sự kiện "[Hội thảo là dùyyyyy]" (ID: 3) đã được BGH duyệt hủy. Các phòng liên quan đã được cập nhật trạng thái sẵn sàng. Vui lòng kiểm tra.', N'/admin/quan-ly-phong/lich-su-dung?suKienID=3', CAST(N'2025-06-04T18:55:47.843' AS DateTime), 0, NULL, N'PHONG_DA_GIAI_PHONG_DO_HUY_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (9, 4, NULL, 5, NULL, NULL, N'Có sự kiện mới "[ỳghgfg]" đang chờ Ban Giám Hiệu duyệt.', N'/admin/su-kien-cho-duyet/5', CAST(N'2025-06-04T21:15:46.980' AS DateTime), 0, NULL, N'SU_KIEN_MOI_CHO_DUYET_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (10, 1, NULL, 5, NULL, NULL, N'Yêu cầu chỉnh sửa cho su kien "[ỳghgfg]": như cccccccccccccc (Từ: Hệ thống)', NULL, CAST(N'2025-06-04T21:55:24.797' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'BGH_YEU_CAU_CHINH_SUA_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (11, 1, NULL, 5, NULL, NULL, N'Yêu cầu chỉnh sửa cho su kien "[ỳghgfg]": như cccccccccccccc (Từ: Hệ thống)', NULL, CAST(N'2025-06-04T21:55:30.773' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'BGH_YEU_CAU_CHINH_SUA_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (12, 1, NULL, 5, NULL, NULL, N'Yêu cầu chỉnh sửa cho su kien "[ỳghgfg]": như cccccccccccccc (Từ: Hệ thống)', NULL, CAST(N'2025-06-04T21:55:49.557' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'BGH_YEU_CAU_CHINH_SUA_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (13, 1, NULL, 5, NULL, NULL, N'Yêu cầu chỉnh sửa cho su kien "[ỳghgfg]": sdfbsaeufgvseirhujgergs (Từ: Hệ thống)', N'/quan-ly-su-kien/5/chinh-sua', CAST(N'2025-06-05T00:52:29.050' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'BGH_YEU_CAU_CHINH_SUA_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (14, 1, NULL, 5, NULL, NULL, N'Yêu cầu chỉnh sửa cho su kien "[ỳghgfg]": dwwwwwwwwwwwwwwwwwwww (Từ: Hệ thống)', N'/quan-ly-su-kien/5/chinh-sua', CAST(N'2025-06-05T00:59:31.263' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'BGH_YEU_CAU_CHINH_SUA_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (15, 4, NULL, 5, NULL, NULL, N'Sự kiện "[ỳghgfg]" đã được người tạo chỉnh sửa (Phản hồi: Không có) và đang chờ duyệt lại.', N'/admin/su-kien-cho-duyet/5', CAST(N'2025-06-06T15:16:39.283' AS DateTime), 0, NULL, N'SU_KIEN_DA_CHINH_SUA_CHO_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (16, 1, NULL, 5, NULL, NULL, N'Yêu cầu chỉnh sửa cho su kien "[ỳghgfg]": ưefpesjfejfojerifuhrugbruyghrughrieugoeriug (Từ: Hệ thống)', N'/quan-ly-su-kien/5/chinh-sua', CAST(N'2025-06-06T15:28:02.427' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'BGH_YEU_CAU_CHINH_SUA_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (17, 4, NULL, 5, NULL, NULL, N'Sự kiện "[ỳghgfg]" đã được người tạo chỉnh sửa (Phản hồi: dfgretyhr6hefsdgfergrgrgrgrg) và đang chờ duyệt lại.', N'/admin/su-kien-cho-duyet/5', CAST(N'2025-06-06T15:28:28.887' AS DateTime), 0, NULL, N'SU_KIEN_DA_CHINH_SUA_CHO_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (18, 5, NULL, 4, NULL, NULL, N'Sự kiện "[helllo ae]" của bạn đã bị tự động hủy do quá hạn xếp phòng và đã đến thời gian dự kiến bắt đầu.', N'/quan-ly-su-kien/4/chi-tiet', CAST(N'2025-06-06T16:01:00.140' AS DateTime), 0, NULL, N'SU_KIEN_TU_DONG_HUY_QUA_HAN')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (19, 4, NULL, 5, NULL, NULL, N'Sự kiện "[ỳghgfg]" đã được người tạo chỉnh sửa (Phản hồi: Không có) và đang chờ duyệt lại.', N'/admin/su-kien-cho-duyet/5', CAST(N'2025-06-06T17:47:12.940' AS DateTime), 0, NULL, N'SU_KIEN_DA_CHINH_SUA_CHO_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (20, 4, NULL, 6, NULL, NULL, N'Có sự kiện mới "[ỳghgfg]" đang chờ Ban Giám Hiệu duyệt.', N'/admin/su-kien-cho-duyet/6', CAST(N'2025-06-06T17:49:22.367' AS DateTime), 0, NULL, N'SU_KIEN_MOI_CHO_DUYET_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (21, 1, NULL, 5, NULL, NULL, N'Sự kiện "[ỳghgfg]" của bạn đã bị Ban Giám Hiệu từ chối. Lý do: vdvdvddđdđ', N'/quan-ly-su-kien/5/chi-tiet', CAST(N'2025-06-06T17:57:50.607' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'SU_KIEN_BI_TU_CHOI_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (22, 4, NULL, 5, NULL, NULL, N'Sự kiện "[ỳghgfgxx]" đã được người tạo chỉnh sửa (Phản hồi: Không có) và đang chờ duyệt lại.', N'/admin/su-kien-cho-duyet/5', CAST(N'2025-06-06T18:06:14.383' AS DateTime), 0, NULL, N'SU_KIEN_DA_CHINH_SUA_CHO_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (23, 1, NULL, 5, NULL, NULL, N'Yêu cầu chỉnh sửa cho su kien "[ỳghgfgxx]": xcsxxxxxxxxxxxxxxxx (Từ: Hệ thống)', N'/quan-ly-su-kien/5/chinh-sua', CAST(N'2025-06-06T18:09:33.000' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'BGH_YEU_CAU_CHINH_SUA_SK')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (24, 1, NULL, 6, NULL, NULL, N'Sự kiện "[ỳghgfg]" của bạn đã được Ban Giám Hiệu duyệt. Vui lòng tiến hành đăng ký phòng.', N'/quan-ly-su-kien/6/chi-tiet', CAST(N'2025-06-06T18:10:58.753' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'SU_KIEN_DA_DUYET_BGH')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (25, 3, NULL, NULL, 2, N'YEUCAUMUONPHONG', N'Có yêu cầu mượn phòng mới cho sự kiện "[ỳghgfg]" đang chờ xử lý.', N'/admin/yeu-cau-phong/2', CAST(N'2025-06-06T18:21:24.690' AS DateTime), 0, NULL, N'YC_PHONG_MOI_CHO_CSVC')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (26, 1, NULL, 6, 2, N'YEUCAUMUONPHONG_CHITIET', N'Yêu cầu chỉnh sửa cho yc muon phong chi tiet "[chi tiết yêu cầu phòng cho sự kiện "ỳghgfg"]": xxxxxxxxxxxxxxxxxxxxxxxxxx (Từ: Hệ thống)', N'/yeu-cau-muon-phong/2/chi-tiet/2/chinh-sua', CAST(N'2025-06-06T18:53:33.660' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'CSVC_YEU_CAU_CHINH_SUA_YCPCT')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (27, 1, NULL, 6, 2, N'YEUCAUMUONPHONG_CHITIET', N'Yêu cầu chỉnh sửa cho yc muon phong chi tiet "[chi tiết yêu cầu phòng cho sự kiện "ỳghgfg"]": 1 phòng thôiiii (Từ: Hệ thống)', N'/yeu-cau-muon-phong/2/chi-tiet/2/chinh-sua', CAST(N'2025-06-07T00:42:46.170' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'CSVC_YEU_CAU_CHINH_SUA_YCPCT')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (28, 3, NULL, NULL, 2, N'YEUCAUMUONPHONG', N'Người dùng đã cập nhật yêu cầu mượn phòng cho sự kiện "[ỳghgfg]" và gửi phản hồi: noooo', N'/admin/yeu-cau-phong/2', CAST(N'2025-06-07T00:44:54.753' AS DateTime), 0, NULL, NULL)
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (29, 1, NULL, 6, 2, N'YEUCAUMUONPHONG_CHITIET', N'Yêu cầu chỉnh sửa cho yc muon phong chi tiet "[chi tiết yêu cầu phòng cho sự kiện "ỳghgfg"]": t r oi 100 thôiii (Từ: Hệ thống)', N'/yeu-cau-muon-phong/2/chi-tiet/2/chinh-sua', CAST(N'2025-06-07T00:48:43.563' AS DateTime), 1, CAST(N'2025-06-07T01:09:59.067' AS DateTime), N'CSVC_YEU_CAU_CHINH_SUA_YCPCT')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (30, 1, NULL, 6, 2, N'YEUCAUMUONPHONG_CHITIET', N'Yêu cầu chỉnh sửa cho yc muon phong chi tiet "[chi tiết yêu cầu phòng cho sự kiện "ỳghgfg"]": tr oi phòng tiêu chuẩn má oiiiiiii (Từ: Hệ thống)', N'/yeu-cau-muon-phong/2/chi-tiet/2/chinh-sua', CAST(N'2025-06-07T00:49:53.720' AS DateTime), 1, CAST(N'2025-06-07T01:09:53.747' AS DateTime), N'CSVC_YEU_CAU_CHINH_SUA_YCPCT')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (31, 3, NULL, NULL, 2, N'YEUCAUMUONPHONG', N'Người dùng đã cập nhật yêu cầu mượn phòng cho sự kiện "[ỳghgfg]" và gửi phản hồi: dạ rồi ạ ', N'/admin/yeu-cau-phong/2', CAST(N'2025-06-07T00:51:05.920' AS DateTime), 0, NULL, NULL)
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (32, 1, NULL, NULL, 2, N'YEUCAUMUONPHONG', N'Chi tiết yêu cầu phòng (ID: 2) cho sự kiện "[ỳghgfg]" đã được duyệt và xếp phòng.', N'/yeu-cau-muon-phong/2', CAST(N'2025-06-07T00:51:39.020' AS DateTime), 1, CAST(N'2025-06-07T01:09:39.070' AS DateTime), N'YC_PHONG_DA_DUYET_CSVC')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (33, 1, NULL, NULL, 1, N'YEUCAUDOIPHONG', N'Yêu cầu đổi phòng (ID: 1) cho sự kiện "[ỳghgfg]" đã bị từ chối. Lý do: assssssssssssssssssssssssssssss', N'/yeu-cau-doi-phong/1/chi-tiet', CAST(N'2025-06-07T11:11:48.680' AS DateTime), 0, NULL, N'YC_DOI_PHONG_BI_TU_CHOI')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (34, 3, NULL, NULL, 2, N'YEUCAUDOIPHONG', N'Có yêu cầu đổi phòng mới cho sự kiện "[SK_ID: undefined]" (YC Đổi ID: 2) đang chờ xử lý.', N'/admin/yeu-cau-doi-phong/2', CAST(N'2025-06-07T12:41:21.443' AS DateTime), 0, NULL, N'YC_DOI_PHONG_MOI_CHO_CSVC')
INSERT [dbo].[ThongBao] ([ThongBaoID], [NguoiNhanID], [DonViNhanID], [SkLienQuanID], [YcLienQuanID], [LoaiYcLienQuan], [NoiDungTB], [DuongDanTB], [NgayTaoTB], [DaDocTB], [NgayDocTB], [LoaiThongBao]) VALUES (35, 1, NULL, 6, NULL, NULL, N'Sự kiện "[ỳghgfg]" của bạn đã kết thúc và được đánh dấu hoàn thành.', N'/quan-ly-su-kien/6/chi-tiet', CAST(N'2025-06-16T19:05:00.230' AS DateTime), 0, NULL, NULL)
SET IDENTITY_INSERT [dbo].[ThongBao] OFF
GO
INSERT [dbo].[ThongTinGiangVien] ([NguoiDungID], [DonViCongTacID], [HocVi], [HocHam], [ChucDanhGD], [ChuyenMonChinh]) VALUES (2, 4, N'Thạc sĩ', NULL, N'Giảng viên', NULL)
INSERT [dbo].[ThongTinGiangVien] ([NguoiDungID], [DonViCongTacID], [HocVi], [HocHam], [ChucDanhGD], [ChuyenMonChinh]) VALUES (4, 4, N'Tiến sĩ', N'Phó Giáo sư', N'Giảng viên Cao cấp', NULL)
INSERT [dbo].[ThongTinGiangVien] ([NguoiDungID], [DonViCongTacID], [HocVi], [HocHam], [ChucDanhGD], [ChuyenMonChinh]) VALUES (11, 1, N'Tiến sĩ', N'Phó Giáo sư', N'Giảng viên chính', N'Trí tuệ nhân tạo')
INSERT [dbo].[ThongTinGiangVien] ([NguoiDungID], [DonViCongTacID], [HocVi], [HocHam], [ChucDanhGD], [ChuyenMonChinh]) VALUES (12, 2, N'Thạc sĩ', NULL, N'Giảng viên', N'Mạng máy tính')
GO
SET IDENTITY_INSERT [dbo].[ToaNha] ON 

INSERT [dbo].[ToaNha] ([ToaNhaID], [MaToaNha], [TenToaNha], [CoSoID], [MoTaToaNha]) VALUES (1, N'A_Q1', N'Tòa A - Cơ sở Q1', 7, NULL)
INSERT [dbo].[ToaNha] ([ToaNhaID], [MaToaNha], [TenToaNha], [CoSoID], [MoTaToaNha]) VALUES (2, N'B_Q1', N'Tòa B - Cơ sở Q1', 7, NULL)
INSERT [dbo].[ToaNha] ([ToaNhaID], [MaToaNha], [TenToaNha], [CoSoID], [MoTaToaNha]) VALUES (3, N'E_Q9', N'Tòa E - Cơ sở Q9', 8, NULL)
SET IDENTITY_INSERT [dbo].[ToaNha] OFF
GO
SET IDENTITY_INSERT [dbo].[ToaNha_Tang] ON 

INSERT [dbo].[ToaNha_Tang] ([ToaNhaTangID], [ToaNhaID], [LoaiTangID], [SoPhong], [MoTa]) VALUES (1, 1, 3, 10, NULL)
INSERT [dbo].[ToaNha_Tang] ([ToaNhaTangID], [ToaNhaID], [LoaiTangID], [SoPhong], [MoTa]) VALUES (2, 1, 4, 12, NULL)
INSERT [dbo].[ToaNha_Tang] ([ToaNhaTangID], [ToaNhaID], [LoaiTangID], [SoPhong], [MoTa]) VALUES (3, 3, 3, 8, NULL)
SET IDENTITY_INSERT [dbo].[ToaNha_Tang] OFF
GO
SET IDENTITY_INSERT [dbo].[TrangThaiPhong] ON 

INSERT [dbo].[TrangThaiPhong] ([TrangThaiPhongID], [TenTrangThai], [MoTa], [MaTrangThai]) VALUES (1, N'Sẵn sàng', N'Phòng trống, có thể sử dụng ngay.', N'SAN_SANG')
INSERT [dbo].[TrangThaiPhong] ([TrangThaiPhongID], [TenTrangThai], [MoTa], [MaTrangThai]) VALUES (2, N'Đang sử dụng', N'Phòng hiện đang có sự kiện hoặc lớp học diễn ra.', N'DANG_SU_DUNG')
INSERT [dbo].[TrangThaiPhong] ([TrangThaiPhongID], [TenTrangThai], [MoTa], [MaTrangThai]) VALUES (3, N'Đang được đặt', N'Phòng đã được xếp cho một sự kiện/yêu cầu sắp tới, chưa đến giờ sử dụng.', N'DANG_DUOC_DAT')
INSERT [dbo].[TrangThaiPhong] ([TrangThaiPhongID], [TenTrangThai], [MoTa], [MaTrangThai]) VALUES (4, N'Đang bảo trì', N'Phòng đang trong quá trình sửa chữa, bảo dưỡng, không thể sử dụng.', N'DANG_BAO_TRI')
INSERT [dbo].[TrangThaiPhong] ([TrangThaiPhongID], [TenTrangThai], [MoTa], [MaTrangThai]) VALUES (5, N'Ngưng sử dụng', N'Phòng tạm thời hoặc vĩnh viễn không còn được đưa vào sử dụng.', N'NGUNG_SU_DUNG')
INSERT [dbo].[TrangThaiPhong] ([TrangThaiPhongID], [TenTrangThai], [MoTa], [MaTrangThai]) VALUES (6, N'Chờ dọn dẹp', N'Phòng vừa được sử dụng xong, đang chờ vệ sinh trước khi sẵn sàng cho lượt tiếp theo.', N'CHO_DON_DEP')
SET IDENTITY_INSERT [dbo].[TrangThaiPhong] OFF
GO
SET IDENTITY_INSERT [dbo].[TrangThaiSK] ON 

INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (1, N'CHO_DUYET_BGH', N'Chờ duyệt BGH', N'Chờ Ban Giám hiệu duyệt')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (2, N'DA_DUYET_BGH', N'Đã duyệt BGH', N'Đã được BGH duyệt (chờ duyệt phòng)')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (3, N'BI_TU_CHOI_BGH', N'Bị từ chối BGH', N'Bị BGH từ chối')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (4, N'DA_HUY_BOI_NGUOI_TAO', N'Đã hủy bởi người tạo', N'Người tạo tự hủy trước khi BGH duyệt')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (5, N'CHO_DUYET_PHONG', N'Chờ duyệt phòng', N'Đã được BGH duyệt, đang chờ CSVC duyệt phòng')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (6, N'DA_XAC_NHAN_PHONG', N'Đã xác nhận phòng', N'CSVC đã xếp phòng')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (7, N'PHONG_BI_TU_CHOI', N'Phòng bị từ chối', N'Yêu cầu phòng bị CSVC từ chối (Sự kiện quay lại CHO_DUYET_PHONG hoặc cần hành động khác)')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (8, N'CHO_DUYET_HUY_SAU_DUYET', N'Chờ duyệt hủy', N'Chờ BGH duyệt yêu cầu hủy (sau khi sự kiện đã từng được BGH duyệt)')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (9, N'DA_HUY', N'Đã hủy', N'Sự kiện đã được hủy chính thức (sau khi BGH duyệt hủy)')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (10, N'HOAN_THANH', N'Hoàn thành', N'Sự kiện đã diễn ra và hoàn thành')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (11, N'HUY_DO_QUA_HAN_XU_LY', N'Hủy do quá hạn xử lý', N'Sự kiện bị tự động hủy do quá hạn duyệt hoặc không được xếp phòng kịp thời.')
INSERT [dbo].[TrangThaiSK] ([TrangThaiSkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (12, N'BGH_YEU_CAU_CHINH_SUA_SK', N'BGH Yêu cầu Chỉnh sửa', N'Sự kiện cần được người tạo chỉnh sửa lại theo yêu cầu của Ban Giám Hiệu trước khi duyệt lại.')
SET IDENTITY_INSERT [dbo].[TrangThaiSK] OFF
GO
SET IDENTITY_INSERT [dbo].[TrangThaiYeuCauDoiPhong] ON 

INSERT [dbo].[TrangThaiYeuCauDoiPhong] ([TrangThaiYcDoiPID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (1, N'CHO_DUYET_DOI_PHONG', N'Chờ duyệt đổi phòng', N'Yêu cầu đổi phòng đang chờ CSVC phê duyệt.')
INSERT [dbo].[TrangThaiYeuCauDoiPhong] ([TrangThaiYcDoiPID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (2, N'DA_DUYET_DOI_PHONG', N'Đã duyệt đổi phòng', N'Yêu cầu đổi phòng đã được CSVC đồng ý.')
INSERT [dbo].[TrangThaiYeuCauDoiPhong] ([TrangThaiYcDoiPID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (3, N'TU_CHOI_DOI_PHONG', N'Từ chối đổi phòng', N'Yêu cầu đổi phòng đã bị CSVC từ chối.')
INSERT [dbo].[TrangThaiYeuCauDoiPhong] ([TrangThaiYcDoiPID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (4, N'DA_HUY_YEU_CAU_DOI', N'Đã hủy yêu cầu đổi', N'Yêu cầu đổi phòng đã bị người dùng hủy.')
SET IDENTITY_INSERT [dbo].[TrangThaiYeuCauDoiPhong] OFF
GO
SET IDENTITY_INSERT [dbo].[TrangThaiYeuCauHuySK] ON 

INSERT [dbo].[TrangThaiYeuCauHuySK] ([TrangThaiYcHuySkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (1, N'CHO_DUYET_HUY_BGH', N'Chờ BGH duyệt hủy', N'Yêu cầu hủy sự kiện đang chờ Ban Giám Hiệu xem xét và phê duyệt.')
INSERT [dbo].[TrangThaiYeuCauHuySK] ([TrangThaiYcHuySkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (2, N'DA_DUYET_HUY', N'Đã duyệt hủy', N'Ban Giám Hiệu đã đồng ý với yêu cầu hủy sự kiện. Sự kiện sẽ được hủy.')
INSERT [dbo].[TrangThaiYeuCauHuySK] ([TrangThaiYcHuySkID], [MaTrangThai], [TenTrangThai], [MoTa]) VALUES (3, N'TU_CHOI_HUY', N'Từ chối hủy', N'Ban Giám Hiệu đã từ chối yêu cầu hủy sự kiện. Sự kiện vẫn tiếp tục.')
SET IDENTITY_INSERT [dbo].[TrangThaiYeuCauHuySK] OFF
GO
SET IDENTITY_INSERT [dbo].[TrangThaiYeuCauPhong] ON 

INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (1, N'YCCP_CHO_XU_LY', N'Chờ xử lý', N'CHUNG', N'Toàn bộ yêu cầu mượn phòng đang chờ Bộ phận CSVC xử lý.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (2, N'YCCP_DANG_XU_LY', N'Đang xử lý', N'CHUNG', N'Bộ phận CSVC đang trong quá trình duyệt các chi tiết yêu cầu phòng.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (3, N'YCCP_DA_XU_LY_MOT_PHAN', N'Đã xử lý một phần', N'CHUNG', N'Một số chi tiết yêu cầu phòng đã được duyệt, một số bị từ chối/không phù hợp.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (4, N'YCCP_HOAN_TAT_DUYET', N'Hoàn tất duyệt', N'CHUNG', N'Tất cả các chi tiết yêu cầu phòng đã được CSVC xử lý (duyệt hoặc từ chối).')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (5, N'YCCP_TU_CHOI_TOAN_BO', N'Từ chối toàn bộ', N'CHUNG', N'Toàn bộ các chi tiết yêu cầu phòng đã bị từ chối bởi CSVC.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (6, N'YCCP_DA_HUY_BOI_NGUOI_TAO', N'Đã hủy bởi người tạo', N'CHUNG', N'Yêu cầu mượn phòng đã được hủy bởi người tạo trước khi CSVC xử lý.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (7, N'YCCPCT_CHO_DUYET', N'Chờ duyệt chi tiết', N'CHI_TIET', N'Chi tiết yêu cầu phòng này đang chờ Bộ phận CSVC duyệt.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (8, N'YCCPCT_DA_XEP_PHONG', N'Đã xếp phòng', N'CHI_TIET', N'Đã xếp phòng thành công cho chi tiết yêu cầu này.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (9, N'YCCPCT_KHONG_PHU_HOP', N'Không phù hợp/Từ chối', N'CHI_TIET', N'Không có phòng phù hợp hoặc bị CSVC từ chối cho chi tiết yêu cầu này.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (10, N'YCCPCT_DA_HUY', N'Đã hủy chi tiết', N'CHI_TIET', N'Chi tiết yêu cầu phòng này đã bị hủy (ví dụ: do yêu cầu header bị hủy).')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (11, N'CSVC_YEU_CAU_CHINH_SUA_CT', N'CSVC Yêu cầu Chỉnh sửa Chi tiết', N'CHI_TIET', N'Chi tiết yêu cầu phòng này cần được người yêu cầu chỉnh sửa lại theo góp ý của Bộ phận CSVC.')
INSERT [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID], [MaTrangThai], [TenTrangThai], [LoaiApDung], [MoTa]) VALUES (12, N'YCCP_TU_DONG_HUY', N'Tự động hủy', N'CHUNG', N'Tự động hủy yêu cầu phòng vì chưa được phân đúng thời gian')
SET IDENTITY_INSERT [dbo].[TrangThaiYeuCauPhong] OFF
GO
SET IDENTITY_INSERT [dbo].[VaiTroHeThong] ON 

INSERT [dbo].[VaiTroHeThong] ([VaiTroID], [MaVaiTro], [TenVaiTro], [MoTaVT]) VALUES (1, N'ADMIN_HE_THONG', N'Quản trị viên Hệ thống', N'Quyền cao nhất quản lý hệ thống')
INSERT [dbo].[VaiTroHeThong] ([VaiTroID], [MaVaiTro], [TenVaiTro], [MoTaVT]) VALUES (2, N'BGH_DUYET_SK_TRUONG', N'Ban Giám hiệu Duyệt sự kiệnnn', N'Duyệt sự kiện cấp Trườnggg')
INSERT [dbo].[VaiTroHeThong] ([VaiTroID], [MaVaiTro], [TenVaiTro], [MoTaVT]) VALUES (3, N'QUAN_LY_CSVC', N'Quản lý Cơ sở Vật chất', N'Duyệt yêu cầu phòng, quản lý phòng')
INSERT [dbo].[VaiTroHeThong] ([VaiTroID], [MaVaiTro], [TenVaiTro], [MoTaVT]) VALUES (4, N'BI_THU_DOAN', N'Bí thư Đoàn các cấp', N'Quản lý hoạt động của đơn vị Đoàn')
INSERT [dbo].[VaiTroHeThong] ([VaiTroID], [MaVaiTro], [TenVaiTro], [MoTaVT]) VALUES (5, N'CB_TO_CHUC_SU_KIEN', N'Cán bộ Tổ chức Sự kiện', N'Người tạo và quản lý sự kiện từ Phòng/Ban')
INSERT [dbo].[VaiTroHeThong] ([VaiTroID], [MaVaiTro], [TenVaiTro], [MoTaVT]) VALUES (6, N'TRUONG_KHOA', N'Trưởng Khoa', N'Quản lý hoạt động của Khoa')
INSERT [dbo].[VaiTroHeThong] ([VaiTroID], [MaVaiTro], [TenVaiTro], [MoTaVT]) VALUES (7, N'TRUONG_CLB', N'Trưởng Câu lạc bộ', N'Quản lý hoạt động của CLB')
SET IDENTITY_INSERT [dbo].[VaiTroHeThong] OFF
GO
SET IDENTITY_INSERT [dbo].[YcMuonPhongChiTiet] ON 

INSERT [dbo].[YcMuonPhongChiTiet] ([YcMuonPhongCtID], [YcMuonPhongID], [MoTaNhomPhong], [SlPhongNhomNay], [LoaiPhongYcID], [SucChuaYc], [ThietBiThemYc], [TgMuonDk], [TgTraDk], [TrangThaiCtID], [GhiChuCtCSVC]) VALUES (1, 1, N'phòng xịn xịn', 1, 1, 100, N'thêm máy chiếu đi', CAST(N'2025-06-03T01:00:00.000' AS DateTime), CAST(N'2025-06-03T10:00:00.000' AS DateTime), 8, N'phòng ko có sẵn theo iu cầu là máy chiếu')
INSERT [dbo].[YcMuonPhongChiTiet] ([YcMuonPhongCtID], [YcMuonPhongID], [MoTaNhomPhong], [SlPhongNhomNay], [LoaiPhongYcID], [SucChuaYc], [ThietBiThemYc], [TgMuonDk], [TgTraDk], [TrangThaiCtID], [GhiChuCtCSVC]) VALUES (2, 2, N'Ádsdsdsdsds', 1, 1, 100, N'sssdsddđssssddđvvvcvcccc', CAST(N'2025-06-07T01:00:00.000' AS DateTime), CAST(N'2025-06-07T10:00:00.000' AS DateTime), 8, N'ok r á')
SET IDENTITY_INSERT [dbo].[YcMuonPhongChiTiet] OFF
GO
SET IDENTITY_INSERT [dbo].[YeuCauDoiPhong] ON 

INSERT [dbo].[YeuCauDoiPhong] ([YcDoiPhongID], [YcMuonPhongCtID], [DatPhongID_Cu], [NguoiYeuCauID], [NgayYeuCauDoi], [LyDoDoiPhong], [YcPhongMoi_LoaiID], [YcPhongMoi_SucChua], [YcPhongMoi_ThietBi], [TrangThaiYcDoiPID], [NguoiDuyetDoiCSVCID], [NgayDuyetDoiCSVC], [DatPhongID_Moi], [LyDoTuChoiDoiCSVC], [GhiChuDoiCSVC]) VALUES (1, 2, 4, 1, CAST(N'2025-06-07T01:03:07.570' AS DateTime), N'phòng nhìn chán quáaaaa', 2, 100, N'rffffff', 3, 1, CAST(N'2025-06-07T11:11:48.597' AS DateTime), NULL, N'assssssssssssssssssssssssssssss', NULL)
INSERT [dbo].[YeuCauDoiPhong] ([YcDoiPhongID], [YcMuonPhongCtID], [DatPhongID_Cu], [NguoiYeuCauID], [NgayYeuCauDoi], [LyDoDoiPhong], [YcPhongMoi_LoaiID], [YcPhongMoi_SucChua], [YcPhongMoi_ThietBi], [TrangThaiYcDoiPID], [NguoiDuyetDoiCSVCID], [NgayDuyetDoiCSVC], [DatPhongID_Moi], [LyDoTuChoiDoiCSVC], [GhiChuDoiCSVC]) VALUES (2, 2, 4, 1, CAST(N'2025-06-07T12:41:21.393' AS DateTime), N'sssssssssssssssssss', NULL, 100, N'sssssssssssssssss', 2, 1, CAST(N'2025-06-07T13:09:13.040' AS DateTime), 6, NULL, N'xxxxxxxxxxxxxxxxxx')
SET IDENTITY_INSERT [dbo].[YeuCauDoiPhong] OFF
GO
SET IDENTITY_INSERT [dbo].[YeuCauHuySK] ON 

INSERT [dbo].[YeuCauHuySK] ([YcHuySkID], [SuKienID], [NguoiYeuCauID], [NgayYeuCauHuy], [LyDoHuy], [TrangThaiYcHuySkID], [NguoiDuyetHuyBGHID], [NgayDuyetHuyBGH], [LyDoTuChoiHuyBGH]) VALUES (1, 3, 1, CAST(N'2025-06-04T17:17:11.530' AS DateTime), N'bây giờ t muốn hủyyyyy', 2, 1, CAST(N'2025-06-04T18:55:47.743' AS DateTime), NULL)
SET IDENTITY_INSERT [dbo].[YeuCauHuySK] OFF
GO
SET IDENTITY_INSERT [dbo].[YeuCauMuonPhong] ON 

INSERT [dbo].[YeuCauMuonPhong] ([YcMuonPhongID], [SuKienID], [NguoiYeuCauID], [NgayYeuCau], [TrangThaiChungID], [NguoiDuyetTongCSVCID], [NgayDuyetTongCSVC], [GhiChuChungYc]) VALUES (1, 3, 1, CAST(N'2025-06-02T22:48:38.147' AS DateTime), 4, 1, CAST(N'2025-06-03T19:35:15.520' AS DateTime), N'sdafdfhht')
INSERT [dbo].[YeuCauMuonPhong] ([YcMuonPhongID], [SuKienID], [NguoiYeuCauID], [NgayYeuCau], [TrangThaiChungID], [NguoiDuyetTongCSVCID], [NgayDuyetTongCSVC], [GhiChuChungYc]) VALUES (2, 6, 1, CAST(N'2025-06-06T18:21:24.527' AS DateTime), 4, 1, CAST(N'2025-06-07T00:51:38.910' AS DateTime), N'ssdsdsdsd')
SET IDENTITY_INSERT [dbo].[YeuCauMuonPhong] OFF
GO
/****** Object:  Index [UQ__ChiTietD__10B0AE82F270F493]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[ChiTietDatPhong] ADD UNIQUE NONCLUSTERED 
(
	[YcMuonPhongCtID] ASC,
	[PhongID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ChuyenNg__20FEA98CDA472F92]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[ChuyenNganh] ADD UNIQUE NONCLUSTERED 
(
	[MaChuyenNganh] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ChuyenNg__63F9C44868AEF783]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[ChuyenNganh] ADD UNIQUE NONCLUSTERED 
(
	[NganhHocID] ASC,
	[TenChuyenNganh] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__DanhGiaS__36787D4643672089]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[DanhGiaSK] ADD UNIQUE NONCLUSTERED 
(
	[SuKienID] ASC,
	[NguoiDanhGiaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__DonVi__9031EA25D9E0C55F]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[DonVi] ADD UNIQUE NONCLUSTERED 
(
	[TenDonVi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__DonVi__DDA5A6CE186CF5AB]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[DonVi] ADD UNIQUE NONCLUSTERED 
(
	[MaDonVi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__LoaiPhon__2508179C0FB843F6]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[LoaiPhong] ADD UNIQUE NONCLUSTERED 
(
	[TenLoaiPhong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__LoaiSuKi__1224CA76145392CE]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[LoaiSuKien] ADD UNIQUE NONCLUSTERED 
(
	[MaLoaiSK] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__LoaiTaiL__F4348CA3BC752400]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[LoaiTaiLieuSK] ADD UNIQUE NONCLUSTERED 
(
	[TenLoaiTL] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__LoaiTang__363345FC1BD49192]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[LoaiTang] ADD UNIQUE NONCLUSTERED 
(
	[MaLoaiTang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__LopHoc__336AF71E5611716E]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[LopHoc] ADD UNIQUE NONCLUSTERED 
(
	[TenLop] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__LopHoc__3B98D27259825A9A]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[LopHoc] ADD UNIQUE NONCLUSTERED 
(
	[MaLop] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__NganhHoc__3EE88D3AA3BD725B]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[NganhHoc] ADD UNIQUE NONCLUSTERED 
(
	[TenNganhHoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__NganhHoc__B9BD626F11F2F3C4]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[NganhHoc] ADD UNIQUE NONCLUSTERED 
(
	[MaNganhHoc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__NguoiDun__0389B7BDDC5D97AC]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED 
(
	[SoDienThoai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__NguoiDun__A9D1053419937D61]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_NguoiDung_MaDinhDanh]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[NguoiDung] ADD  CONSTRAINT [UQ_NguoiDung_MaDinhDanh] UNIQUE NONCLUSTERED 
(
	[MaDinhDanh] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__NguoiDun__93CB84015C7F079C]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[NguoiDung_VaiTro] ADD UNIQUE NONCLUSTERED 
(
	[NguoiDungID] ASC,
	[VaiTroID] ASC,
	[DonViID] ASC,
	[NgayBatDau] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_OtpVaResetToken_Email]    Script Date: 6/16/2025 10:35:21 PM ******/
CREATE NONCLUSTERED INDEX [IX_OtpVaResetToken_Email] ON [dbo].[OtpVaResetToken]
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IX_OtpVaResetToken_ResetToken]    Script Date: 6/16/2025 10:35:21 PM ******/
CREATE NONCLUSTERED INDEX [IX_OtpVaResetToken_ResetToken] ON [dbo].[OtpVaResetToken]
(
	[ResetToken] ASC
)
WHERE ([ResetToken] IS NOT NULL)
WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Phong__20BD5E5A7E7FE0E9]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[Phong] ADD UNIQUE NONCLUSTERED 
(
	[MaPhong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__TaiKhoan__C4BBA4DCE8501E92]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TaiKhoan] ADD UNIQUE NONCLUSTERED 
(
	[NguoiDungID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ_ThanhVienCLB_NguoiDung_CLB]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[ThanhVienCLB] ADD  CONSTRAINT [UQ_ThanhVienCLB_NguoiDung_CLB] UNIQUE NONCLUSTERED 
(
	[NguoiDungID] ASC,
	[DonViID_CLB] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ToaNha__BD2DD160CAF9AE10]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[ToaNha] ADD UNIQUE NONCLUSTERED 
(
	[MaToaNha] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__ToaNha_T__3153382601818A0E]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[ToaNha_Tang] ADD UNIQUE NONCLUSTERED 
(
	[ToaNhaID] ASC,
	[LoaiTangID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TrangTha__9489EF66996B2FB1]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiPhong] ADD UNIQUE NONCLUSTERED 
(
	[TenTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_TrangThaiPhong_MaTrangThai]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiPhong] ADD  CONSTRAINT [UQ_TrangThaiPhong_MaTrangThai] UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TrangTha__AADE41394A49AC30]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiSK] ADD UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_TrangThaiSK_MaTrangThai]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiSK] ADD  CONSTRAINT [UQ_TrangThaiSK_MaTrangThai] UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TrangTha__AADE4139F5BA99DA]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiYeuCauDoiPhong] ADD UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_TrangThaiYeuCauDoiPhong_MaTrangThai]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiYeuCauDoiPhong] ADD  CONSTRAINT [UQ_TrangThaiYeuCauDoiPhong_MaTrangThai] UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TrangTha__AADE4139AB017A7A]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiYeuCauHuySK] ADD UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_TrangThaiYeuCauHuySK_MaTrangThai]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiYeuCauHuySK] ADD  CONSTRAINT [UQ_TrangThaiYeuCauHuySK_MaTrangThai] UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TrangTha__AADE4139CDAA1682]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiYeuCauPhong] ADD UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_TrangThaiYeuCauPhong_MaTrangThai]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThaiYeuCauPhong] ADD  CONSTRAINT [UQ_TrangThaiYeuCauPhong_MaTrangThai] UNIQUE NONCLUSTERED 
(
	[MaTrangThai] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__TrangThi__2D20448CFCA07BB6]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[TrangThietBi] ADD UNIQUE NONCLUSTERED 
(
	[TenThietBi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__VaiTroHe__C24C41CE790B5688]    Script Date: 6/16/2025 10:35:21 PM ******/
ALTER TABLE [dbo].[VaiTroHeThong] ADD UNIQUE NONCLUSTERED 
(
	[MaVaiTro] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[DanhGiaSK] ADD  DEFAULT (getdate()) FOR [TgDanhGia]
GO
ALTER TABLE [dbo].[LoaiSuKien] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[NganhHoc] ADD  DEFAULT ((0)) FOR [CoChuyenNganh]
GO
ALTER TABLE [dbo].[NguoiDung] ADD  DEFAULT (getdate()) FOR [NgayTao]
GO
ALTER TABLE [dbo].[NguoiDung] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [dbo].[NguoiDung_VaiTro] ADD  DEFAULT (getdate()) FOR [NgayBatDau]
GO
ALTER TABLE [dbo].[OtpVaResetToken] ADD  DEFAULT ((0)) FOR [DaSuDung]
GO
ALTER TABLE [dbo].[OtpVaResetToken] ADD  DEFAULT (getdate()) FOR [NgayTao]
GO
ALTER TABLE [dbo].[Phong_ThietBi] ADD  DEFAULT ((1)) FOR [SoLuong]
GO
ALTER TABLE [dbo].[SuKien] ADD  DEFAULT (getdate()) FOR [NgayTaoSK]
GO
ALTER TABLE [dbo].[SuKien] ADD  DEFAULT ((0)) FOR [IsCongKhaiNoiBo]
GO
ALTER TABLE [dbo].[TaiKhoan] ADD  DEFAULT ('Active') FOR [TrangThaiTk]
GO
ALTER TABLE [dbo].[TaiKhoan] ADD  DEFAULT (getdate()) FOR [NgayTaoTk]
GO
ALTER TABLE [dbo].[TaiLieuSK] ADD  DEFAULT (getdate()) FOR [NgayTaiLen]
GO
ALTER TABLE [dbo].[TaiLieuSK] ADD  DEFAULT ((0)) FOR [IsCongKhaiTL]
GO
ALTER TABLE [dbo].[ThanhVienCLB] ADD  DEFAULT (getdate()) FOR [NgayGiaNhap]
GO
ALTER TABLE [dbo].[ThanhVienCLB] ADD  DEFAULT ((1)) FOR [IsActiveInCLB]
GO
ALTER TABLE [dbo].[ThongBao] ADD  DEFAULT (getdate()) FOR [NgayTaoTB]
GO
ALTER TABLE [dbo].[ThongBao] ADD  DEFAULT ((0)) FOR [DaDocTB]
GO
ALTER TABLE [dbo].[YcMuonPhongChiTiet] ADD  DEFAULT ((1)) FOR [SlPhongNhomNay]
GO
ALTER TABLE [dbo].[YeuCauDoiPhong] ADD  DEFAULT (getdate()) FOR [NgayYeuCauDoi]
GO
ALTER TABLE [dbo].[YeuCauHuySK] ADD  DEFAULT (getdate()) FOR [NgayYeuCauHuy]
GO
ALTER TABLE [dbo].[YeuCauMuonPhong] ADD  DEFAULT (getdate()) FOR [NgayYeuCau]
GO
ALTER TABLE [dbo].[ChiTietDatPhong]  WITH CHECK ADD FOREIGN KEY([PhongID])
REFERENCES [dbo].[Phong] ([PhongID])
GO
ALTER TABLE [dbo].[ChiTietDatPhong]  WITH CHECK ADD FOREIGN KEY([YcMuonPhongCtID])
REFERENCES [dbo].[YcMuonPhongChiTiet] ([YcMuonPhongCtID])
GO
ALTER TABLE [dbo].[ChuyenNganh]  WITH CHECK ADD FOREIGN KEY([NganhHocID])
REFERENCES [dbo].[NganhHoc] ([NganhHocID])
GO
ALTER TABLE [dbo].[DanhGiaSK]  WITH CHECK ADD FOREIGN KEY([NguoiDanhGiaID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[DanhGiaSK]  WITH CHECK ADD FOREIGN KEY([SuKienID])
REFERENCES [dbo].[SuKien] ([SuKienID])
GO
ALTER TABLE [dbo].[DonVi]  WITH CHECK ADD FOREIGN KEY([DonViChaID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[LopHoc]  WITH CHECK ADD FOREIGN KEY([ChuyenNganhID])
REFERENCES [dbo].[ChuyenNganh] ([ChuyenNganhID])
GO
ALTER TABLE [dbo].[LopHoc]  WITH CHECK ADD FOREIGN KEY([NganhHocID])
REFERENCES [dbo].[NganhHoc] ([NganhHocID])
GO
ALTER TABLE [dbo].[NganhHoc]  WITH CHECK ADD FOREIGN KEY([KhoaQuanLyID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[NguoiDung_VaiTro]  WITH CHECK ADD FOREIGN KEY([DonViID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[NguoiDung_VaiTro]  WITH CHECK ADD FOREIGN KEY([NguoiDungID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[NguoiDung_VaiTro]  WITH CHECK ADD FOREIGN KEY([VaiTroID])
REFERENCES [dbo].[VaiTroHeThong] ([VaiTroID])
GO
ALTER TABLE [dbo].[Phong]  WITH CHECK ADD FOREIGN KEY([LoaiPhongID])
REFERENCES [dbo].[LoaiPhong] ([LoaiPhongID])
GO
ALTER TABLE [dbo].[Phong]  WITH CHECK ADD FOREIGN KEY([TrangThaiPhongID])
REFERENCES [dbo].[TrangThaiPhong] ([TrangThaiPhongID])
GO
ALTER TABLE [dbo].[Phong]  WITH CHECK ADD  CONSTRAINT [FK_Phong_ToaNhaTang] FOREIGN KEY([ToaNhaTangID])
REFERENCES [dbo].[ToaNha_Tang] ([ToaNhaTangID])
GO
ALTER TABLE [dbo].[Phong] CHECK CONSTRAINT [FK_Phong_ToaNhaTang]
GO
ALTER TABLE [dbo].[Phong_ThietBi]  WITH CHECK ADD FOREIGN KEY([PhongID])
REFERENCES [dbo].[Phong] ([PhongID])
GO
ALTER TABLE [dbo].[Phong_ThietBi]  WITH CHECK ADD FOREIGN KEY([ThietBiID])
REFERENCES [dbo].[TrangThietBi] ([ThietBiID])
GO
ALTER TABLE [dbo].[SK_DonViThamGia]  WITH CHECK ADD FOREIGN KEY([DonViID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[SK_DonViThamGia]  WITH CHECK ADD FOREIGN KEY([SuKienID])
REFERENCES [dbo].[SuKien] ([SuKienID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[SK_MoiThamGia]  WITH CHECK ADD FOREIGN KEY([NguoiDuocMoiID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[SK_MoiThamGia]  WITH CHECK ADD FOREIGN KEY([SuKienID])
REFERENCES [dbo].[SuKien] ([SuKienID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[SuKien]  WITH CHECK ADD FOREIGN KEY([DonViChuTriID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[SuKien]  WITH CHECK ADD FOREIGN KEY([NguoiChuTriID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[SuKien]  WITH CHECK ADD FOREIGN KEY([NguoiDuyetBGHID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[SuKien]  WITH CHECK ADD FOREIGN KEY([NguoiTaoID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[SuKien]  WITH CHECK ADD FOREIGN KEY([TrangThaiSkID])
REFERENCES [dbo].[TrangThaiSK] ([TrangThaiSkID])
GO
ALTER TABLE [dbo].[SuKien]  WITH CHECK ADD  CONSTRAINT [FK_SuKien_LoaiSuKien] FOREIGN KEY([LoaiSuKienID])
REFERENCES [dbo].[LoaiSuKien] ([LoaiSuKienID])
GO
ALTER TABLE [dbo].[SuKien] CHECK CONSTRAINT [FK_SuKien_LoaiSuKien]
GO
ALTER TABLE [dbo].[TaiKhoan]  WITH CHECK ADD FOREIGN KEY([NguoiDungID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TaiLieuSK]  WITH CHECK ADD FOREIGN KEY([LoaiTaiLieuID])
REFERENCES [dbo].[LoaiTaiLieuSK] ([LoaiTaiLieuID])
GO
ALTER TABLE [dbo].[TaiLieuSK]  WITH CHECK ADD FOREIGN KEY([NguoiTaiLenID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[TaiLieuSK]  WITH CHECK ADD FOREIGN KEY([SuKienID])
REFERENCES [dbo].[SuKien] ([SuKienID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ThanhVienCLB]  WITH CHECK ADD  CONSTRAINT [FK_ThanhVienCLB_DonViCLB] FOREIGN KEY([DonViID_CLB])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[ThanhVienCLB] CHECK CONSTRAINT [FK_ThanhVienCLB_DonViCLB]
GO
ALTER TABLE [dbo].[ThanhVienCLB]  WITH CHECK ADD  CONSTRAINT [FK_ThanhVienCLB_NguoiDung] FOREIGN KEY([NguoiDungID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ThanhVienCLB] CHECK CONSTRAINT [FK_ThanhVienCLB_NguoiDung]
GO
ALTER TABLE [dbo].[ThongBao]  WITH CHECK ADD FOREIGN KEY([DonViNhanID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[ThongBao]  WITH CHECK ADD FOREIGN KEY([NguoiNhanID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[ThongBao]  WITH CHECK ADD FOREIGN KEY([SkLienQuanID])
REFERENCES [dbo].[SuKien] ([SuKienID])
GO
ALTER TABLE [dbo].[ThongTinGiangVien]  WITH CHECK ADD FOREIGN KEY([DonViCongTacID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[ThongTinGiangVien]  WITH CHECK ADD FOREIGN KEY([NguoiDungID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ThongTinSinhVien]  WITH CHECK ADD FOREIGN KEY([LopID])
REFERENCES [dbo].[LopHoc] ([LopID])
GO
ALTER TABLE [dbo].[ThongTinSinhVien]  WITH CHECK ADD FOREIGN KEY([NguoiDungID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ToaNha]  WITH CHECK ADD FOREIGN KEY([CoSoID])
REFERENCES [dbo].[DonVi] ([DonViID])
GO
ALTER TABLE [dbo].[ToaNha_Tang]  WITH CHECK ADD FOREIGN KEY([LoaiTangID])
REFERENCES [dbo].[LoaiTang] ([LoaiTangID])
GO
ALTER TABLE [dbo].[ToaNha_Tang]  WITH CHECK ADD FOREIGN KEY([ToaNhaID])
REFERENCES [dbo].[ToaNha] ([ToaNhaID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[YcMuonPhongChiTiet]  WITH CHECK ADD FOREIGN KEY([LoaiPhongYcID])
REFERENCES [dbo].[LoaiPhong] ([LoaiPhongID])
GO
ALTER TABLE [dbo].[YcMuonPhongChiTiet]  WITH CHECK ADD FOREIGN KEY([TrangThaiCtID])
REFERENCES [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID])
GO
ALTER TABLE [dbo].[YcMuonPhongChiTiet]  WITH CHECK ADD FOREIGN KEY([YcMuonPhongID])
REFERENCES [dbo].[YeuCauMuonPhong] ([YcMuonPhongID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[YeuCauDoiPhong]  WITH CHECK ADD FOREIGN KEY([DatPhongID_Cu])
REFERENCES [dbo].[ChiTietDatPhong] ([DatPhongID])
GO
ALTER TABLE [dbo].[YeuCauDoiPhong]  WITH CHECK ADD FOREIGN KEY([DatPhongID_Moi])
REFERENCES [dbo].[ChiTietDatPhong] ([DatPhongID])
GO
ALTER TABLE [dbo].[YeuCauDoiPhong]  WITH CHECK ADD FOREIGN KEY([NguoiYeuCauID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[YeuCauDoiPhong]  WITH CHECK ADD FOREIGN KEY([NguoiDuyetDoiCSVCID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[YeuCauDoiPhong]  WITH CHECK ADD FOREIGN KEY([TrangThaiYcDoiPID])
REFERENCES [dbo].[TrangThaiYeuCauDoiPhong] ([TrangThaiYcDoiPID])
GO
ALTER TABLE [dbo].[YeuCauDoiPhong]  WITH CHECK ADD FOREIGN KEY([YcMuonPhongCtID])
REFERENCES [dbo].[YcMuonPhongChiTiet] ([YcMuonPhongCtID])
GO
ALTER TABLE [dbo].[YeuCauDoiPhong]  WITH CHECK ADD FOREIGN KEY([YcPhongMoi_LoaiID])
REFERENCES [dbo].[LoaiPhong] ([LoaiPhongID])
GO
ALTER TABLE [dbo].[YeuCauHuySK]  WITH CHECK ADD FOREIGN KEY([NguoiYeuCauID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[YeuCauHuySK]  WITH CHECK ADD FOREIGN KEY([NguoiDuyetHuyBGHID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[YeuCauHuySK]  WITH CHECK ADD FOREIGN KEY([SuKienID])
REFERENCES [dbo].[SuKien] ([SuKienID])
GO
ALTER TABLE [dbo].[YeuCauHuySK]  WITH CHECK ADD FOREIGN KEY([TrangThaiYcHuySkID])
REFERENCES [dbo].[TrangThaiYeuCauHuySK] ([TrangThaiYcHuySkID])
GO
ALTER TABLE [dbo].[YeuCauMuonPhong]  WITH CHECK ADD FOREIGN KEY([NguoiYeuCauID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[YeuCauMuonPhong]  WITH CHECK ADD FOREIGN KEY([NguoiDuyetTongCSVCID])
REFERENCES [dbo].[NguoiDung] ([NguoiDungID])
GO
ALTER TABLE [dbo].[YeuCauMuonPhong]  WITH CHECK ADD FOREIGN KEY([SuKienID])
REFERENCES [dbo].[SuKien] ([SuKienID])
GO
ALTER TABLE [dbo].[YeuCauMuonPhong]  WITH CHECK ADD FOREIGN KEY([TrangThaiChungID])
REFERENCES [dbo].[TrangThaiYeuCauPhong] ([TrangThaiYcpID])
GO
ALTER TABLE [dbo].[DanhGiaSK]  WITH CHECK ADD CHECK  (([DiemDiaDiem]>=(1) AND [DiemDiaDiem]<=(5)))
GO
ALTER TABLE [dbo].[DanhGiaSK]  WITH CHECK ADD CHECK  (([DiemNoiDung]>=(1) AND [DiemNoiDung]<=(5)))
GO
ALTER TABLE [dbo].[DanhGiaSK]  WITH CHECK ADD CHECK  (([DiemToChuc]>=(1) AND [DiemToChuc]<=(5)))
GO
ALTER TABLE [dbo].[SuKien]  WITH CHECK ADD  CONSTRAINT [CK_SK_CoChuTri] CHECK  (([NguoiChuTriID] IS NOT NULL OR [TenChuTriNgoai] IS NOT NULL))
GO
ALTER TABLE [dbo].[SuKien] CHECK CONSTRAINT [CK_SK_CoChuTri]
GO
USE [master]
GO
ALTER DATABASE [PTIT_EventRoomBooking] SET  READ_WRITE 
GO
