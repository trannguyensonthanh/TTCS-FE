// src/components/users/ImportUsersDialog.tsx (Hoặc đường dẫn của bạn)

import React, { useState, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Download, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';

// Giả sử đường dẫn này là đúng
import {
  generateExcelTemplateForUsers,
  parseUsersFromExcel,
} from '@/lib/excelUtils';
import { cn } from '@/lib/utils';
import { LoaiNguoiDungEnum } from '@/enums/loaiNguoiDung.enum'; // Bạn cần tạo file enum này
import {
  ImportUserResultItem,
  UserImportRowPayload,
} from '@/services/nguoiDung.service';
import { useImportUsersBatch } from '@/hooks/queries/nguoiDungQueries';
import { useQueryClient } from '@tanstack/react-query';
import { NGUOI_DUNG_QUERY_KEYS } from '@/hooks/queries/nguoiDungQueries'; // Import key để invalidate
import { APIError } from '@/services/apiHelper';

interface ImportUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Định nghĩa lại UserImportRow để khớp với logic xử lý file Excel
// Dữ liệu đọc từ file Excel
export interface UserImportRow {
  hoTen: string;
  email: string;
  soDienThoai?: string;
  maDinhDanh: string;
  loaiNguoiDung: string;
  donViID: number | null;
  ngaySinh: string | Date; // Excel có thể đọc ra Date object
  khoaHoc?: string;
  heDaoTao?: string;
  ngayNhapHoc?: string | Date;
  trangThaiHocTap?: string;
  hocVi?: string;
  hocHam?: string;
  chucDanhGD?: string;
  chuyenMonChinh?: string;
  chucVuNhanVien?: string;
}

export default function ImportUsersDialog({
  open,
  onOpenChange,
}: ImportUsersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<UserImportRow[]>([]);
  const [processedDataForSubmit, setProcessedDataForSubmit] = useState<
    UserImportRowPayload[]
  >([]);
  const [importResults, setImportResults] = useState<ImportUserResultItem[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);
  const [isParsing, setIsParsing] = useState(false); // Thêm state cho quá trình đọc file

  const queryClient = useQueryClient();

  const importUsersMutation = useImportUsersBatch({
    onSuccess: (data) => {
      toast.success(data.summaryMessage || 'Import hoàn tất!');
      setImportResults(data.results || []);
      setShowResults(true);
      // Invalidate query để làm mới danh sách người dùng ở trang chính
      queryClient.invalidateQueries({
        queryKey: NGUOI_DUNG_QUERY_KEYS.lists(),
      });
    },
    onError: (error: APIError) => {
      // Toast lỗi đã có trong hook
      setImportResults([]);
      setShowResults(false);
    },
  });

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) {
        // Đặt lại tất cả state nếu người dùng hủy chọn file
        setFile(null);
        setPreviewData([]);
        setProcessedDataForSubmit([]);
        setShowResults(false);
        return;
      }

      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setShowResults(false);
      setImportResults([]);
      setIsParsing(true); // Bắt đầu đọc file

      try {
        const rawData = await parseUsersFromExcel(selectedFile);
        if (rawData.length === 0) {
          toast.error('File Excel không có dữ liệu hoặc không đúng định dạng.');
          setIsParsing(false);
          setFile(null);
          return;
        }

        setPreviewData(rawData.slice(0, 10) as UserImportRow[]);

        // Validate và chuẩn bị dữ liệu
        const dataToSubmit: UserImportRowPayload[] = [];
        let validationError = false;

        for (let i = 0; i < rawData.length; i++) {
          const row = rawData[i];
          const rowNum = i + 2; // Dòng số 2 trong Excel

          if (
            !row.hoTen ||
            !row.email ||
            !row.loaiNguoiDung ||
            !row.maDinhDanh ||
            !row.ngaySinh
          ) {
            toast.error(
              `Dòng ${rowNum}: Thiếu thông tin bắt buộc (Họ Tên, Email, Mã Định Danh, Loại Người Dùng, Ngày Sinh).`
            );
            validationError = true;
            continue;
          }

          if (
            !Object.values(LoaiNguoiDungEnum).includes(
              row.loaiNguoiDung as LoaiNguoiDungEnum
            )
          ) {
            toast.error(
              `Dòng ${rowNum}: Loại Người Dùng "${row.loaiNguoiDung}" không hợp lệ.`
            );
            validationError = true;
            continue;
          }

          if (
            (row.loaiNguoiDung === 'SINH_VIEN' ||
              row.loaiNguoiDung === 'GIANG_VIEN') &&
            !row.donViID
          ) {
            toast.error(
              `Dòng ${rowNum}: ID Đơn Vị là bắt buộc cho Sinh viên và Giảng viên.`
            );
            validationError = true;
            continue;
          }

          dataToSubmit.push(row);
        }

        if (validationError) {
          setProcessedDataForSubmit([]);
          toast.info('Vui lòng sửa lỗi trong file Excel và tải lên lại.');
        } else {
          setProcessedDataForSubmit(dataToSubmit);
        }
      } catch (error) {
        toast.error((error as Error).message || 'Lỗi khi đọc file Excel.');
        setPreviewData([]);
        setProcessedDataForSubmit([]);
      } finally {
        setIsParsing(false); // Kết thúc đọc file
      }
    },
    []
  );

  const handleImport = useCallback(() => {
    if (!file || processedDataForSubmit.length === 0) {
      toast.error('Vui lòng chọn file Excel hợp lệ và không có lỗi định dạng.');
      return;
    }
    console.log('Submitting data for import:', processedDataForSubmit);
    importUsersMutation.mutate({ users: processedDataForSubmit });
  }, [file, processedDataForSubmit, importUsersMutation]);

  const handleCloseAndReset = useCallback(() => {
    onOpenChange(false);
    // Reset tất cả state khi đóng dialog hoàn toàn để lần mở sau là mới
    setTimeout(() => {
      setFile(null);
      setPreviewData([]);
      setProcessedDataForSubmit([]);
      setImportResults([]);
      setShowResults(false);
    }, 300); // Đợi animation của dialog
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleCloseAndReset}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Upload className="mr-2 h-6 w-6" /> Import Người Dùng từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel (.xlsx, .xls) chứa danh sách người dùng. Mật khẩu
            ban đầu sẽ được tạo dựa trên ngày sinh (DDMMYYYY).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-hidden flex flex-col space-y-4 py-4">
          {!showResults ? (
            <>
              {/* Phần chọn file và tải mẫu */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-1">
                <Button
                  variant="outline"
                  onClick={generateExcelTemplateForUsers}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" /> Tải File Mẫu
                </Button>
                <div className="text-xs text-muted-foreground w-full sm:w-auto text-center sm:text-right">
                  Đảm bảo file Excel tuân theo đúng định dạng của file mẫu.
                </div>
              </div>
              <div className="grid w-full items-center gap-1.5 px-1">
                <label
                  htmlFor="excel-file-import"
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors',
                    (importUsersMutation.isPending || isParsing) &&
                      'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    {isParsing ? (
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    ) : (
                      <Upload className="h-10 w-10 text-gray-400" />
                    )}
                    <div className="text-md font-medium text-foreground">
                      {file
                        ? file.name
                        : isParsing
                        ? 'Đang đọc file...'
                        : 'Chọn file Excel hoặc kéo thả vào đây'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Chỉ chấp nhận file .xlsx, .xls
                    </div>
                  </div>
                  <Input
                    id="excel-file-import"
                    type="file"
                    className="sr-only"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    disabled={importUsersMutation.isPending || isParsing}
                  />
                </label>
              </div>

              {/* Phần xem trước dữ liệu */}
              {previewData.length > 0 && (
                <div className="border rounded-md overflow-auto mt-4 flex-shrink min-h-0 px-1">
                  <div className="bg-muted py-2 px-4 text-sm font-medium sticky top-0 z-10">
                    Xem trước dữ liệu ({previewData.length} dòng đầu tiên từ
                    file "{file?.name}")
                  </div>
                  <ScrollArea className="max-h-48">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Họ Tên</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Mã Định Danh</TableHead>
                          <TableHead>Loại User</TableHead>
                          <TableHead>ID Đơn Vị</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.hoTen}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell>{row.maDinhDanh}</TableCell>
                            <TableCell>{row.loaiNguoiDung}</TableCell>
                            <TableCell>{row.donViID}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </>
          ) : (
            // Phần hiển thị kết quả import
            <div className="border rounded-md overflow-hidden mt-4 flex-grow flex flex-col px-1">
              <div className="bg-muted py-2 px-4 text-sm font-medium sticky top-0 z-10">
                Kết quả Import (Thành công:{' '}
                {importResults.filter((r) => r.status === 'success').length}/
                {importResults.length})
              </div>
              <ScrollArea className="flex-grow">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8 text-center">#</TableHead>
                      <TableHead>Email / Mã Định Danh</TableHead>
                      <TableHead className="w-24 text-center">
                        Trạng Thái
                      </TableHead>
                      <TableHead>Thông Báo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResults.map((result, index) => (
                      <TableRow
                        key={index}
                        className={
                          result.status === 'error'
                            ? 'bg-destructive/10'
                            : 'bg-green-500/10'
                        }
                      >
                        <TableCell className="text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.email}
                        </TableCell>
                        <TableCell className="text-center">
                          {result.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive mx-auto" />
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            result.status === 'error'
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          )}
                        >
                          {result.message ||
                            (result.status === 'success'
                              ? 'Thành công'
                              : 'Lỗi không xác định')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-1 border-t dark:border-slate-800">
          <Button
            variant="outline"
            onClick={handleCloseAndReset}
            disabled={importUsersMutation.isPending}
          >
            {showResults ? 'Hoàn Tất' : 'Hủy'}
          </Button>
          {!showResults && (
            <Button
              onClick={handleImport}
              disabled={
                !file ||
                processedDataForSubmit.length === 0 ||
                importUsersMutation.isPending ||
                isParsing
              }
              className="min-w-[140px]"
            >
              {importUsersMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Import Dữ Liệu
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
