// src/utils/dateTimeUtils.ts
import { format, parseISO, isValid as isValidDateFn } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDateRangeForDisplay = (
  startISO?: string,
  endISO?: string
): string => {
  if (!startISO) return 'Chưa xác định';
  try {
    const startDate = parseISO(startISO);
    if (!isValidDateFn(startDate)) return 'Ngày bắt đầu không hợp lệ';

    let formattedString = format(startDate, 'dd/MM/yyyy, HH:mm', {
      locale: vi,
    });

    if (endISO) {
      const endDate = parseISO(endISO);
      if (isValidDateFn(endDate)) {
        if (format(startDate, 'yyyyMMdd') === format(endDate, 'yyyyMMdd')) {
          // Cùng ngày
          formattedString = `${format(startDate, 'dd/MM/yyyy')}, ${format(
            startDate,
            'HH:mm'
          )} - ${format(endDate, 'HH:mm')}`;
        } else {
          // Khác ngày
          formattedString = `${format(startDate, 'dd/MM/yy HH:mm')} - ${format(
            endDate,
            'dd/MM/yy HH:mm'
          )}`;
        }
      } else {
        formattedString += ' - (Ngày kết thúc không hợp lệ)';
      }
    }
    return formattedString;
  } catch (e) {
    console.error('Error formatting date range:', e);
    return 'Lỗi định dạng ngày';
  }
};

// Thêm các hàm tiện ích khác về ngày giờ nếu cần
