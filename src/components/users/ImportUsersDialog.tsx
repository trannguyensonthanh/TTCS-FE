
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { parseExcel, generateExcelTemplate, UserImportRow, formatDateOfBirthToPassword } from '@/lib/excelUtils';
import { Download, Upload } from 'lucide-react';

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (users: UserImportRow[]) => void;
}

export default function ImportUsersDialog({
  open,
  onOpenChange,
  onImportComplete,
}: ImportUsersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<UserImportRow[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    try {
      setLoading(true);
      const data = await parseExcel(selectedFile);
      setPreview(data.slice(0, 5)); // Preview first 5 rows
      setLoading(false);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file Excel để import.');
      return;
    }

    try {
      setLoading(true);
      const data = await parseExcel(file);
      
      // Process and validate data
      const processedData = data.map(row => ({
        ...row,
        password: formatDateOfBirthToPassword(row.dateOfBirth)
      }));
      
      onImportComplete(processedData);
      setFile(null);
      setPreview([]);
      onOpenChange(false);
      toast.success(`Đã import ${processedData.length} người dùng thành công.`);
    } catch (error) {
      console.error('Error importing users:', error);
      toast.error('Lỗi khi import người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    generateExcelTemplate();
    toast.success('Đã tải xuống file mẫu.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import người dùng từ Excel</DialogTitle>
          <DialogDescription>
            Tải lên file Excel chứa danh sách người dùng để thêm vào hệ thống.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Tải file mẫu
            </Button>
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label
              htmlFor="excel-file"
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="text-sm font-medium">
                  {file ? file.name : 'Chọn file Excel hoặc kéo thả vào đây'}
                </div>
                <div className="text-xs text-gray-500">Chỉ chấp nhận file .xlsx, .xls</div>
              </div>
              <input
                id="excel-file"
                type="file"
                className="sr-only"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>
          
          {preview.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted py-2 px-4 text-sm font-medium">
                Xem trước ({preview.length} dòng đầu tiên)
              </div>
              <div className="p-4 space-y-2 max-h-48 overflow-auto text-sm">
                {preview.map((row, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 border-b pb-2">
                    <div>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-gray-500">{row.email}</div>
                    </div>
                    <div className="text-right">
                      <div>{row.userType} ({row.role})</div>
                      <div className="text-xs text-gray-500">
                        Mật khẩu: {formatDateOfBirthToPassword(row.dateOfBirth)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? 'Đang xử lý...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
