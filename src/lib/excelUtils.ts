
import * as XLSX from 'xlsx';

export interface UserImportRow {
  name: string;
  email: string;
  userType: string;
  role: string;
  donViId?: string;
  dateOfBirth: string;
}

export const parseExcel = async (file: File): Promise<UserImportRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<UserImportRow>(worksheet, { 
          header: ['name', 'email', 'userType', 'role', 'donViId', 'dateOfBirth'],
          range: 1 // Skip header row
        });
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Format date of birth into password (DDMMYYYY)
export const formatDateOfBirthToPassword = (dateOfBirth: string): string => {
  try {
    // Handle different date formats
    const date = new Date(dateOfBirth);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}${month}${year}`;
  } catch (error) {
    console.error('Invalid date format:', dateOfBirth);
    return 'password123'; // Fallback password
  }
};

// Generate sample Excel template for user import
export const generateExcelTemplate = (): void => {
  const worksheet = XLSX.utils.json_to_sheet([
    {
      name: 'Họ và tên',
      email: 'email@example.com',
      userType: 'SINH_VIEN/GIANG_VIEN/NHAN_VIEN',
      role: 'SINH_VIEN/GIANG_VIEN/TRUONG_KHOA/etc',
      donViId: 'ID đơn vị (nếu có)',
      dateOfBirth: 'YYYY-MM-DD'
    }
  ]);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  XLSX.writeFile(workbook, 'user_import_template.xlsx');
};
