import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Để chọn file
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/sonner';
import { useImportPhongExcel } from '@/hooks/queries/phongQueries'; // Hook đã tạo

import {
  FileUp,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import * as XLSX from 'xlsx'; // Thư viện để xử lý Excel
import { ImportPhongResponse } from '@/services/phong.service';
import { cn } from '@/lib/utils';

interface ImportRoomsExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Callback khi import thành công (để refetch danh sách)
}

const EXCEL_MIME_TYPES = [
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

const ImportRoomsExcelDialog: React.FC<ImportRoomsExcelDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportPhongResponse | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportPhongExcel({
    onSuccess: (data) => {
      setImportResult(data);
      if (data.successCount > 0 && onSuccess) {
        onSuccess(); // Gọi callback để refetch danh sách phòng
      }
      // Không đóng modal ngay để user xem kết quả
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!EXCEL_MIME_TYPES.includes(file.type)) {
        toast.error(
          'Định dạng file không hợp lệ. Vui lòng chọn file Excel (.xls, .xlsx).'
        );
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input file
        return;
      }
      setSelectedFile(file);
      setImportResult(null); // Reset kết quả cũ
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn một file Excel để import.');
      return;
    }
    setIsProcessing(true);
    importMutation.mutate(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const data = [
      [
        'TenPhong*',
        'MaPhong',
        'LoaiPhongID*',
        'SucChua',
        'TrangThaiPhongID*',
        'ToaNhaTangID*',
        'SoThuTuPhong',
        'MoTaChiTietPhong',
        'AnhMinhHoa',
        'ThietBiTrongPhong (JSON)',
      ],
      [
        'Phòng Hội Thảo HT01',
        'P_HT01',
        1,
        100,
        1,
        1,
        '01',
        'Phòng hội thảo lớn có sân khấu',
        'https://example.com/ht01.jpg',
        '[{"ThietBiID":1,"SoLuong":1,"TinhTrang":"Tốt"},{"ThietBiID":2,"SoLuong":2}]',
      ],
      [
        'Phòng Học A.102',
        'A1.102',
        2,
        50,
        1,
        2,
        '102',
        'Phòng học tiêu chuẩn',
        '',
        '',
      ],
      // Thêm các dòng ví dụ khác nếu muốn
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    // Định dạng header
    const headerCellStyle = {
      font: { bold: true, sz: 12 },
      fill: { fgColor: { rgb: 'FFFFAA00' } },
    }; // Vàng
    if (ws['A1']) ws['A1'].s = headerCellStyle;
    if (ws['B1']) ws['B1'].s = headerCellStyle;
    // ... áp dụng cho các header khác ...
    ws['C1'].s = headerCellStyle;
    ws['D1'].s = headerCellStyle;
    ws['E1'].s = headerCellStyle;
    ws['F1'].s = headerCellStyle;
    ws['G1'].s = headerCellStyle;
    ws['H1'].s = headerCellStyle;
    ws['I1'].s = headerCellStyle;
    ws['J1'].s = headerCellStyle;

    // Ghi chú về các trường bắt buộc và ID
    const notes = [
      ['Ghi Chú:'],
      ['Các cột có dấu (*) là bắt buộc.'],
      ['LoaiPhongID: ID của Loại Phòng (tham khảo danh mục Loại Phòng).'],
      [
        'TrangThaiPhongID: ID của Trạng Thái Phòng (tham khảo danh mục Trạng Thái Phòng).',
      ],
      ['ToaNhaTangID: ID của Tầng Vật Lý (tham khảo danh mục Tòa Nhà - Tầng).'],
      [
        'ThietBiTrongPhong: Chuỗi JSON của mảng các đối tượng, mỗi đối tượng có ThietBiID (tham khảo DM Thiết Bị), SoLuong, TinhTrang (tùy chọn). Ví dụ: [{"ThietBiID":1,"SoLuong":2,"TinhTrang":"Tốt"}]',
      ],
    ];
    XLSX.utils.sheet_add_aoa(ws, notes, { origin: `A${data.length + 2}` });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Phong');
    XLSX.writeFile(wb, 'Mau_Import_Phong.xlsx');
    toast.success('Đã tải file mẫu thành công!');
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileUp className="h-6 w-6 text-primary dark:text-ptit-red" />{' '}
            Import Danh Sách Phòng từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel chứa thông tin các phòng cần thêm vào hệ thống.
            Vui lòng sử dụng file mẫu để đảm bảo đúng định dạng.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6 flex-grow overflow-hidden flex flex-col">
          {!importResult ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="excel-file" className="font-semibold text-base">
                  Chọn file Excel
                </Label>
                <Input
                  id="excel-file"
                  type="file"
                  ref={fileInputRef}
                  className="mt-1.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-ptit-red/10 dark:file:text-ptit-red dark:hover:file:bg-ptit-red/20 cursor-pointer"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Đã chọn file:{' '}
                    <span className="font-medium text-foreground">
                      {selectedFile.name}
                    </span>
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="text-sm"
              >
                <Download className="mr-2 h-4 w-4" /> Tải File Mẫu (.xlsx)
              </Button>
            </div>
          ) : (
            // Hiển thị kết quả import
            <div className="space-y-3 flex-grow overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold text-foreground">
                Kết Quả Import:
              </h3>
              <div className="flex gap-4 text-sm">
                <p>
                  Tổng số dòng xử lý:{' '}
                  <span className="font-bold">{importResult.totalRows}</span>
                </p>
                <p className="text-green-600 dark:text-green-400">
                  Thành công:{' '}
                  <span className="font-bold">{importResult.successCount}</span>
                </p>
                <p className="text-destructive">
                  Thất bại:{' '}
                  <span className="font-bold">{importResult.errorCount}</span>
                </p>
              </div>
              {importResult.overallMessage && (
                <p className="text-sm text-muted-foreground">
                  {importResult.overallMessage}
                </p>
              )}

              {importResult.results && importResult.results.length > 0 && (
                <ScrollArea className="flex-grow border rounded-md max-h-[40vh] bg-muted/30 dark:bg-slate-800/30 p-1">
                  <div className="p-2 space-y-2">
                    {importResult.results.map((result, index) => (
                      <div
                        key={index}
                        className={cn(
                          'p-2.5 rounded-md text-xs border',
                          result.status === 'success'
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700'
                            : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700'
                        )}
                      >
                        <div className="flex items-center gap-2 font-medium mb-0.5">
                          {result.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          Dòng {result.rowNumber}:{' '}
                          {result.tenPhong || 'Không có tên phòng'} (
                          {result.maPhong || 'Không có mã'})
                        </div>
                        {result.status === 'error' && (
                          <p className="text-destructive text-xs ml-6">
                            {result.message}
                          </p>
                        )}
                        {result.status === 'success' && result.phongID && (
                          <p className="text-green-700 dark:text-green-400 text-xs ml-6">
                            Đã tạo phòng ID: {result.phongID}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t mt-auto">
          <Button type="button" variant="outline" onClick={handleClose}>
            {importResult ? 'Đóng' : 'Hủy'}
          </Button>
          {!importResult && (
            <Button
              type="button"
              onClick={handleImport}
              disabled={
                !selectedFile || isProcessing || importMutation.isPending
              }
              className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
            >
              {(isProcessing || importMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isProcessing ? 'Đang xử lý...' : 'Bắt đầu Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRoomsExcelDialog;
