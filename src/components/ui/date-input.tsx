import * as React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { CalendarIcon } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

interface DateInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = 'dd/MM/yyyy',
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || '');

  React.useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Kiểm tra định dạng dd/MM/yyyy
    const parsed = parse(e.target.value, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      onChange(format(parsed, 'dd/MM/yyyy'));
    } else {
      onChange(null);
    }
  };

  // Tạo danh sách năm, tháng, ngày cho popover
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, 'dd/MM/yyyy', new Date());
      if (isValid(parsed)) {
        setSelectedDay(parsed.getDate());
        setSelectedMonth(parsed.getMonth() + 1);
        setSelectedYear(parsed.getFullYear());
      }
    }
  }, [value]);

  const handleSelect = (d: number, m: number, y: number) => {
    const date = new Date(y, m - 1, d);
    if (isValid(date)) {
      const formatted = format(date, 'dd/MM/yyyy');
      setInputValue(formatted);
      onChange(formatted);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <input
            type="text"
            className="w-full pr-10 border rounded px-2 py-1 focus:outline-none focus:ring"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={10}
            autoComplete="off"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            tabIndex={-1}
            onClick={() => setOpen((o) => !o)}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="z-50 bg-white dark:bg-gray-900 p-4 rounded shadow w-[320px] border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 mb-2">
          <select
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
            value={selectedDay || ''}
            onChange={(e) => {
              const d = Number(e.target.value);
              setSelectedDay(d);
              if (selectedMonth && selectedYear)
                handleSelect(d, selectedMonth, selectedYear);
            }}
          >
            <option value="">Ngày</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
            value={selectedMonth || ''}
            onChange={(e) => {
              const m = Number(e.target.value);
              setSelectedMonth(m);
              if (selectedDay && selectedYear)
                handleSelect(selectedDay, m, selectedYear);
            }}
          >
            <option value="">Tháng</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded px-2 py-1"
            value={selectedYear || ''}
            onChange={(e) => {
              const y = Number(e.target.value);
              setSelectedYear(y);
              if (selectedDay && selectedMonth)
                handleSelect(selectedDay, selectedMonth, y);
            }}
          >
            <option value="">Năm</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-muted-foreground dark:text-gray-400">
          Chọn ngày/tháng/năm hoặc nhập tay theo định dạng dd/MM/yyyy
        </div>
      </PopoverContent>
    </Popover>
  );
};
