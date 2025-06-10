/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/excelHelper.ts

import * as XLSX from 'xlsx';
import { UserImportRowPayload } from '@/services/nguoiDung.service'; // Import payload từ service

/**
 * Định nghĩa cấu trúc của một dòng trong file Excel mẫu.
 * Key của object này chính là header hiển thị trong file Excel.
 */
export interface UserImportTemplateRow {
  'Họ Tên': string;
  Email: string;
  'Số Điện Thoại'?: string;
  'Mã Định Danh (Mã SV/GV/NV)': string; // Đã đổi tên để khớp với BE
  'Loại Người Dùng (SINH_VIEN/GIANG_VIEN/NHAN_VIEN_KHAC)': string;
  'ID Đơn Vị (ID Lớp/Khoa/Phòng)': number;
  'Ngày Sinh (dùng để tạo mật khẩu, định dạng YYYY-MM-DD)': string;
  'Khóa Học (cho SV)'?: string;
  'Hệ Đào Tạo (cho SV)'?: string;
  'Ngày Nhập Học (YYYY-MM-DD)'?: string;
  'Trạng Thái Học Tập (cho SV)'?: string;
  'Học Vị (cho GV)'?: string;
  'Học Hàm (cho GV)'?: string;
  'Chức Danh Giảng Dạy (cho GV)'?: string;
  'Chuyên Môn Chính (cho GV)'?: string;
  'Chức Vụ (cho NV)'?: string;
}

/**
 * Tạo và tải xuống file Excel mẫu với các tiêu đề cột đúng chuẩn.
 */
export const generateExcelTemplateForUsers = (): void => {
  // Một dòng dữ liệu mẫu để người dùng biết cách điền
  const sampleData: UserImportTemplateRow[] = [
    {
      'Họ Tên': 'Nguyễn Văn A',
      Email: 'anv.b20dccn001@ptit.edu.vn',
      'Số Điện Thoại': '0912345678',
      'Mã Định Danh (Mã SV/GV/NV)': 'N20DCCN001',
      'Loại Người Dùng (SINH_VIEN/GIANG_VIEN/NHAN_VIEN_KHAC)': 'SINH_VIEN',
      'ID Đơn Vị (ID Lớp/Khoa/Phòng)': 101, // ID của lớp D20CNTT01
      'Ngày Sinh (dùng để tạo mật khẩu, định dạng YYYY-MM-DD)': '2002-05-10',
      'Khóa Học (cho SV)': 'K2020',
      'Hệ Đào Tạo (cho SV)': 'Chính quy',
      'Ngày Nhập Học (YYYY-MM-DD)': '2020-09-15',
      'Trạng Thái Học Tập (cho SV)': 'Đang học',
    },
    {
      'Họ Tên': 'Trần Thị B',
      Email: 'btt@ptit.edu.vn',
      'Số Điện Thoại': '0987654321',
      'Mã Định Danh (Mã SV/GV/NV)': 'GV007',
      'Loại Người Dùng (SINH_VIEN/GIANG_VIEN/NHAN_VIEN_KHAC)': 'GIANG_VIEN',
      'ID Đơn Vị (ID Lớp/Khoa/Phòng)': 1, // ID của Khoa CNTT
      'Ngày Sinh (dùng để tạo mật khẩu, định dạng YYYY-MM-DD)': '1985-10-20',
      'Học Vị (cho GV)': 'Tiến sĩ',
      'Học Hàm (cho GV)': 'Phó Giáo sư',
      'Chức Danh Giảng Dạy (cho GV)': 'Giảng viên chính',
      'Chuyên Môn Chính (cho GV)': 'Khoa học dữ liệu',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachNguoiDung');

  // Điều chỉnh độ rộng cột cho dễ nhìn
  worksheet['!cols'] = [
    { wch: 25 }, // Họ Tên
    { wch: 30 }, // Email
    { wch: 15 }, // Số Điện Thoại
    { wch: 25 }, // Mã Định Danh
    { wch: 45 }, // Loại Người Dùng
    { wch: 30 }, // ID Đơn Vị
    { wch: 45 }, // Ngày Sinh
    { wch: 20 }, // Khóa Học
    { wch: 20 }, // Hệ Đào Tạo
    { wch: 25 }, // Ngày Nhập Học
    { wch: 25 }, // Trạng Thái Học Tập
    { wch: 20 }, // Học Vị
    { wch: 20 }, // Học Hàm
    { wch: 30 }, // Chức Danh
    { wch: 30 }, // Chuyên Môn
  ];

  XLSX.writeFile(workbook, 'Mau_Nhap_Nguoi_Dung.xlsx');
};

/**
 * Chuyển đổi ngày sinh thành mật khẩu theo định dạng DDMMYYYY.
 * @param dateInput - Ngày sinh có thể là chuỗi, số (từ Excel), hoặc Date object.
 * @returns Mật khẩu dạng chuỗi hoặc null nếu ngày không hợp lệ.
 */
export const formatDateToPassword = (dateInput: any): string | null => {
  if (!dateInput) return null;

  let date: Date;
  // Excel có thể đọc ngày tháng dưới dạng số (số ngày kể từ 1900).
  // Chúng ta cần xử lý trường hợp này.
  if (typeof dateInput === 'number') {
    // new Date(0) là 1970-01-01. Excel bắt đầu từ 1900-01-01.
    // Cần điều chỉnh cho đúng, (value - 25569) * 86400 * 1000 cho múi giờ UTC.
    date = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
  } else if (typeof dateInput === 'string' || dateInput instanceof Date) {
    date = new Date(dateInput);
  } else {
    return null;
  }

  // Kiểm tra xem date có hợp lệ không
  if (isNaN(date.getTime())) {
    console.error('Invalid date format during password generation:', dateInput);
    return null;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng trong JS bắt đầu từ 0
  const year = date.getFullYear();

  return `${day}${month}${year}`;
};

/**
 * Đọc và phân tích file Excel thành một mảng các đối tượng UserImportRowPayload.
 * @param file - File Excel do người dùng tải lên.
 * @returns Promise chứa mảng payload sẵn sàng gửi lên backend.
 */
export const parseUsersFromExcel = (
  file: File
): Promise<UserImportRowPayload[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true }); // cellDates: true giúp đọc ngày tháng

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // Chuyển sheet thành JSON với header là dòng đầu tiên
        const rawJsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, // Đọc dòng đầu tiên làm header
          defval: null, // Các ô trống sẽ là null
        });

        if (rawJsonData.length < 2) {
          // File không có dữ liệu (chỉ có header hoặc rỗng)
          resolve([]);
          return;
        }

        const headers: string[] = rawJsonData[0];
        // Tạo một map từ header trong file sang key của payload
        const headerToKeyMap: Record<string, keyof UserImportRowPayload> = {
          'Họ Tên': 'hoTen',
          Email: 'email',
          'Số Điện Thoại': 'soDienThoai',
          'Mã Định Danh (Mã SV/GV/NV)': 'maDinhDanh',
          'Loại Người Dùng (SINH_VIEN/GIANG_VIEN/NHAN_VIEN_KHAC)':
            'loaiNguoiDung',
          'ID Đơn Vị (ID Lớp/Khoa/Phòng)': 'donViID',
          'Ngày Sinh (dùng để tạo mật khẩu, định dạng YYYY-MM-DD)': 'ngaySinh', // Key tạm thời, sẽ được xử lý
          'Khóa Học (cho SV)': 'khoaHoc',
          'Hệ Đào Tạo (cho SV)': 'heDaoTao',
          'Ngày Nhập Học (YYYY-MM-DD)': 'ngayNhapHoc',
          'Trạng Thái Học Tập (cho SV)': 'trangThaiHocTap',
          'Học Vị (cho GV)': 'hocVi',
          'Học Hàm (cho GV)': 'hocHam',
          'Chức Danh Giảng Dạy (cho GV)': 'chucDanhGD',
          'Chuyên Môn Chính (cho GV)': 'chuyenMonChinh',
        };

        console.log('Headers found:', headers);

        const dataRows = rawJsonData.slice(1); // Bỏ qua dòng header
        console.log('Data rows found:', dataRows);
        const processedData = dataRows
          .map((row: any[]) => {
            const userObject: Partial<UserImportRowPayload> = {};

            headers.forEach((header, index) => {
              const key = headerToKeyMap[header];
              if (key) {
                (userObject as any)[key] = row[index];
              }
            });

            const ngaySinhRaw = userObject.ngaySinh;
            const matKhau = formatDateToPassword(ngaySinhRaw);
            if (!matKhau) {
              throw new Error(
                `Ngày sinh không hợp lệ ở dòng có email: ${userObject.email}`
              );
            }
            userObject.matKhau = matKhau;

            // Chuyển đổi ngaySinh thành định dạng YYYY-MM-DD
            const ngaySinhDate = new Date(ngaySinhRaw);
            userObject.ngaySinh = !isNaN(ngaySinhDate.getTime())
              ? ngaySinhDate.toISOString().split('T')[0]
              : undefined;

            // Chuyển đổi ngày nhập học sang định dạng ISO string
            if (userObject.ngayNhapHoc) {
              const ngayNhapHocDate = new Date(userObject.ngayNhapHoc);
              if (!isNaN(ngayNhapHocDate.getTime())) {
                userObject.ngayNhapHoc = ngayNhapHocDate
                  .toISOString()
                  .split('T')[0];
              } else {
                userObject.ngayNhapHoc = undefined;
              }
            }

            return userObject as UserImportRowPayload;
          })
          .filter((user) => user.hoTen && user.email && user.maDinhDanh); // Lọc ra các dòng rỗng

        resolve(processedData);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(
          new Error(
            'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file và tiêu đề cột.'
          )
        );
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
