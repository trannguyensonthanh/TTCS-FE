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
