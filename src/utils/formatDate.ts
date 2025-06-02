import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
// --- Helper Functions ---
export const formatDateRangeForDisplay = (
  start?: string,
  end?: string
): string => {
  if (!start) return 'Chưa xác định';
  try {
    const startDate = parseISO(start);
    const endDate = end ? parseISO(end) : null;

    let formatted = format(startDate, 'HH:mm, EEEE, dd/MM/yyyy', {
      locale: vi,
    });

    if (endDate) {
      if (format(startDate, 'yyyyMMdd') === format(endDate, 'yyyyMMdd')) {
        // Cùng ngày, chỉ khác giờ
        formatted = `${format(startDate, 'dd/MM/yyyy')}, ${format(
          startDate,
          'HH:mm',
          { locale: vi }
        )} - ${format(endDate, 'HH:mm', { locale: vi })}`;
      } else {
        // Khác ngày
        formatted = `${format(startDate, 'HH:mm dd/MM/yyyy', {
          locale: vi,
        })} - ${format(endDate, 'HH:mm dd/MM/yyyy', { locale: vi })}`;
      }
    }
    return formatted;
  } catch (e) {
    console.error('Error formatting date range:', e);
    return 'Ngày không hợp lệ';
  }
};
