// /* eslint-disable @typescript-eslint/no-explicit-any */
// // src/pages/Dashboard/components/RoomUsageCalendarOverview.tsx
// import React, { useMemo } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid'; // Cần cho view timeGridWeek/timeGridDay
// import interactionPlugin from '@fullcalendar/interaction'; // Nếu cần tương tác
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from '@/components/ui/card';
// import { Loader2, AlertTriangle, SearchX } from 'lucide-react';
// import { KhungGioPhongBanItem } from '@/services/dashboard.service'; // Hoặc MatDoSuDungPhongTheoGioItem
// import { APIError } from '@/services/apiHelper';
// import { EventInput } from '@fullcalendar/core';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'; // Cho filter
// import { useDonViList } from '@/hooks/queries/donViQueries'; // Để lấy danh sách tòa nhà
// import { Label } from '@/components/ui/label';
// import { useToaNhaList } from '@/hooks/queries/toaNhaQueries';

// interface RoomUsageCalendarOverviewProps {
//   data: KhungGioPhongBanItem[] | undefined; // Hoặc MatDoSuDungPhongTheoGioItem[]
//   isLoading: boolean;
//   isError: boolean;
//   error: APIError | Error | null;
//   selectedToaNhaId?: string; // Props để truyền filter tòa nhà
//   onToaNhaChange: (toaNhaId: string | undefined) => void; // Callback khi thay đổi filter
// }

// const RoomUsageCalendarOverview: React.FC<RoomUsageCalendarOverviewProps> = ({
//   data,
//   isLoading,
//   isError,
//   error,
//   selectedToaNhaId,
//   onToaNhaChange,
// }) => {
//   // Đổi hook sang useToaNhaList thay vì useDonViList
//   const { data: dsToaNha, isLoading: isLoadingToaNha } = useToaNhaList(
//     { limit: 100 }, // Nếu useToaNhaList không cần loaiDonVi
//     { enabled: true }
//   );
//   const toaNhaOptions = useMemo(() => dsToaNha?.items || [], [dsToaNha]);

//   const calendarEvents = useMemo((): EventInput[] => {
//     if (!data || !Array.isArray(data)) return [];

//     // Giả sử data là KhungGioPhongBanItem[]
//     return data.flatMap((phongData) =>
//       phongData.khungGioBan.map((khungGio) => ({
//         // title: 'Bận', // Tiêu đề chung, không lộ tên sự kiện
//         // Hoặc title có thể là tên phòng nếu đang xem theo tòa nhà/phòng cụ thể
//         title: `${phongData.tenPhong || `Phòng ${phongData.phongID}`}`,
//         start: khungGio.batDau,
//         end: khungGio.ketThuc,
//         backgroundColor: 'hsl(var(--destructive))', // Màu đỏ cho bận
//         borderColor: 'hsl(var(--destructive))',
//         display: 'block', // Hoặc 'background' nếu muốn tô nền
//         // resourceId: phongData.phongID.toString() // Nếu dùng resourceTimelineView
//       }))
//     );
//   }, [data]);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-[400px]">
//         <Loader2 className="h-10 w-10 animate-spin text-primary" />
//       </div>
//     );
//   }
//   if (isError) {
//     return (
//       <div className="flex flex-col justify-center items-center h-[400px] text-destructive">
//         <AlertTriangle className="h-10 w-10 mb-2" />
//         <p className="font-semibold">Lỗi tải dữ liệu lịch phòng.</p>
//         <p className="text-xs">
//           {(error as APIError)?.body?.message || (error as Error)?.message}
//         </p>
//       </div>
//     );
//   }

//   return (
//     <Card className="shadow-lg border-border/60 dark:border-slate-700/60">
//       <CardHeader>
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//           <div>
//             <CardTitle className="text-xl font-semibold flex items-center">
//               Tổng Quan Lịch Sử Dụng Phòng
//             </CardTitle>
//             <CardDescription className="mt-1 text-sm">
//               Xem nhanh các khung giờ bận của phòng trong tuần.
//             </CardDescription>
//           </div>
//           <div className="w-full sm:w-auto">
//             <Label
//               htmlFor="calendar-toanha-filter"
//               className="text-xs font-medium text-muted-foreground sr-only"
//             >
//               Lọc theo Tòa Nhà
//             </Label>
//             <Select
//               value={selectedToaNhaId || 'all'}
//               onValueChange={(value) =>
//                 onToaNhaChange(value === 'all' ? undefined : value)
//               }
//               disabled={isLoadingToaNha}
//             >
//               <SelectTrigger
//                 id="calendar-toanha-filter"
//                 className="h-9 text-xs min-w-[180px]"
//               >
//                 <SelectValue
//                   placeholder={
//                     isLoadingToaNha ? 'Tải tòa nhà...' : 'Tất cả Tòa Nhà'
//                   }
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Tất cả Tòa Nhà</SelectItem>
//                 {toaNhaOptions.map((toaNha) => (
//                   <SelectItem
//                     key={toaNha.tenToaNha}
//                     value={toaNha.toaNhaID.toString()}
//                   >
//                     {toaNha.tenToaNha}{' '}
//                     {toaNha.maToaNha && `(${toaNha.maToaNha})`}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="pt-0 -mx-1 sm:mx-0">
//         {' '}
//         {/* Thêm pt-0 và mx điều chỉnh để calendar sát viền card */}
//         {(!data || calendarEvents.length === 0) && !isLoading ? (
//           <div className="flex flex-col justify-center items-center h-[350px] text-muted-foreground">
//             <SearchX className="h-12 w-12 mb-3 text-gray-400" />
//             <p>Không có dữ liệu lịch sử dụng phòng cho lựa chọn hiện tại.</p>
//           </div>
//         ) : (
//           <div
//             className="fc-theme-ptit"
//             style={{ ['--fc-border-color' as any]: 'hsl(var(--border))' }}
//           >
//             {' '}
//             {/* Apply custom theme and border */}
//             <FullCalendar
//               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//               initialView="timeGridWeek" // Hoặc 'dayGridMonth' nếu muốn xem tháng
//               headerToolbar={{
//                 left: 'prev,next today',
//                 center: 'title',
//                 right: 'timeGridWeek,timeGridDay', // Bỏ 'dayGridMonth' nếu không cần
//               }}
//               events={calendarEvents}
//               locale="vi" // Ngôn ngữ tiếng Việt
//               height="auto" // Để tự điều chỉnh chiều cao hoặc set cố định "450px"
//               slotMinTime="06:00:00" // Giờ bắt đầu hiển thị
//               slotMaxTime="22:00:00" // Giờ kết thúc hiển thị
//               allDaySlot={false} // Ẩn dòng "all-day"
//               eventDisplay="block" // Hiển thị event như block
//               eventColor="hsl(var(--destructive))" // Màu sự kiện bận
//               eventBorderColor="hsl(var(--destructive-foreground))"
//               // eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }} // Định dạng giờ 24h
//               slotLabelFormat={{
//                 hour: 'numeric',
//                 minute: '2-digit',
//                 omitZeroMinute: false,
//                 meridiem: false,
//                 hour12: false,
//               }}
//               nowIndicator={true}
//               editable={false} // Không cho phép kéo thả
//               selectable={false} // Không cho phép chọn ngày/giờ
//               businessHours={{
//                 // (Optional) Đánh dấu giờ làm việc
//                 daysOfWeek: [1, 2, 3, 4, 5], // Thứ 2 - Thứ 6
//                 startTime: '07:00',
//                 endTime: '17:00',
//               }}
//               weekends={true} // Hiển thị cuối tuần
//               buttonText={{
//                 today: 'Hôm nay',
//                 month: 'Tháng',
//                 week: 'Tuần',
//                 day: 'Ngày',
//                 list: 'Danh sách',
//               }}
//               // dayCellClassNames={'dark:bg-slate-800/30'} // Tùy chỉnh class cho cell
//               // viewClassNames={'bg-card text-card-foreground'}
//               // moreLinkClassNames={'text-primary hover:underline'}
//             />
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default RoomUsageCalendarOverview;
