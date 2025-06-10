import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PTITLogo } from '@/assets/logo';
import { motion } from 'framer-motion';
import {
  HelpCircle, // FAQ
  BookOpen, // Hướng dẫn
  MessageSquarePlus, // Gửi yêu cầu
  PhoneCall, // Liên hệ trực tiếp
  Search,
  ChevronRight,
  LifeBuoy, // Icon chính cho Support
  UserCircle, // Tài khoản
  CalendarDays, // Sự kiện
  Building, // Cơ sở vật chất
  Wrench, // Kỹ thuật
  Lightbulb, // Góp ý
  Mail,
  Phone,
  Clock,
  MapPin,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock FAQ Data
const faqData = [
  {
    category: 'Tài Khoản Người Dùng',
    icon: UserCircle,
    questions: [
      {
        q: 'Làm thế nào để đổi mật khẩu?',
        a: "Bạn có thể đổi mật khẩu trong trang 'Thông tin cá nhân' sau khi đăng nhập. Nếu quên mật khẩu, vui lòng sử dụng chức năng 'Quên mật khẩu' ở trang đăng nhập.",
      },
      {
        q: 'Thông tin cá nhân của tôi có được bảo mật không?',
        a: 'Chúng tôi cam kết bảo mật thông tin cá nhân của bạn theo chính sách bảo mật của Học viện. Dữ liệu được mã hóa và chỉ những người có thẩm quyền mới được truy cập.',
      },
      {
        q: 'Tôi không thể đăng nhập, phải làm sao?',
        a: "Vui lòng kiểm tra lại Tên đăng nhập và Mật khẩu. Nếu vẫn không được, hãy thử chức năng 'Quên mật khẩu'. Nếu vấn đề vẫn tiếp diễn, liên hệ bộ phận hỗ trợ kỹ thuật.",
      },
    ],
  },
  {
    category: 'Tổ Chức Sự Kiện',
    icon: CalendarDays,
    questions: [
      {
        q: 'Quy trình tạo một sự kiện mới như thế nào?',
        a: "Sau khi đăng nhập với vai trò được cấp quyền, bạn vào mục 'Quản lý Sự kiện' > 'Tạo Sự kiện Mới', điền đầy đủ thông tin và gửi yêu cầu duyệt lên Ban Giám Hiệu.",
      },
      {
        q: 'Làm sao để biết sự kiện của tôi đã được duyệt hay chưa?',
        a: "Bạn có thể theo dõi trạng thái sự kiện trong mục 'Danh sách Sự kiện'. Hệ thống cũng sẽ gửi thông báo khi có cập nhật về trạng thái.",
      },
      {
        q: 'Tôi có thể chỉnh sửa thông tin sự kiện sau khi đã gửi yêu cầu không?',
        a: "Bạn có thể chỉnh sửa thông tin sự kiện khi nó đang ở trạng thái 'Chờ duyệt BGH'. Sau khi BGH đã xử lý, việc chỉnh sửa có thể bị hạn chế.",
      },
    ],
  },
  {
    category: 'Mượn Phòng & Cơ Sở Vật Chất',
    icon: Building,
    questions: [
      {
        q: 'Khi nào tôi có thể tạo yêu cầu mượn phòng?',
        a: "Sau khi sự kiện của bạn đã được Ban Giám Hiệu phê duyệt (trạng thái 'Đã duyệt BGH'), bạn có thể tạo yêu cầu mượn phòng chi tiết.",
      },
      {
        q: 'Làm sao để xem lịch sử dụng phòng?',
        a: "Truy cập mục 'Quản lý CSVC' > 'Lịch sử dụng Phòng' để xem tình trạng các phòng theo ngày, tuần.",
      },
      {
        q: 'Tôi muốn đổi phòng đã được duyệt, phải làm gì?',
        a: "Bạn có thể tạo 'Yêu cầu Đổi Phòng' từ mục quản lý CSVC, nêu rõ lý do và yêu cầu cho phòng mới. Yêu cầu này sẽ được bộ phận CSVC xem xét.",
      },
    ],
  },
  {
    category: 'Vấn Đề Kỹ Thuật',
    icon: Wrench,
    questions: [
      {
        q: 'Trang web tải chậm hoặc gặp lỗi, tôi nên làm gì?',
        a: 'Vui lòng thử tải lại trang (Ctrl+R hoặc Cmd+R). Nếu vẫn gặp lỗi, hãy xóa cache trình duyệt hoặc thử sử dụng một trình duyệt khác. Nếu vấn đề nghiêm trọng, liên hệ bộ phận hỗ trợ kỹ thuật.',
      },
      {
        q: 'Làm sao để báo cáo lỗi của hệ thống?',
        a: "Bạn có thể sử dụng form 'Gửi Yêu Cầu Hỗ Trợ' trên trang này và chọn loại yêu cầu là 'Báo lỗi' để thông báo cho chúng tôi.",
      },
    ],
  },
];

const SupportPage = () => {
  const [searchTermFAQ, setSearchTermFAQ] = useState('');
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>(
    []
  );
  // Set isLoading to false since FAQ data is static (not fetched)
  const isLoading = false;

  const fadeInProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  const filteredFaqData = useMemo(() => {
    if (!searchTermFAQ.trim()) return faqData;
    const lowerSearchTerm = searchTermFAQ.toLowerCase();
    return faqData
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(lowerSearchTerm) ||
            q.a.toLowerCase().includes(lowerSearchTerm)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchTermFAQ]);

  // Tự động mở accordion item nếu kết quả tìm kiếm nằm trong đó
  useEffect(() => {
    if (searchTermFAQ.trim()) {
      const openItems: string[] = [];
      filteredFaqData.forEach((category) => {
        if (category.questions.length > 0) {
          openItems.push(category.category);
        }
      });
      setActiveAccordionItems(openItems);
    } else {
      setActiveAccordionItems([]); // Đóng tất cả khi không tìm kiếm
    }
  }, [filteredFaqData, searchTermFAQ]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-foreground">
      {/* Hero Section */}
      <motion.section
        className="relative py-24 md:py-32 text-center bg-gradient-to-br from-primary via-ptit-blue to-sky-600 dark:from-slate-800 dark:via-slate-900 dark:to-gray-800 text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="relative container mx-auto px-6 z-10">
          <motion.div {...fadeInProps} className="mb-8">
            <LifeBuoy className="h-20 w-20 text-white mx-auto opacity-80" />
          </motion.div>
          <motion.h1
            {...fadeInProps}
            transition={{ delay: 0.1, ...fadeInProps.transition }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4"
          >
            Trung Tâm Hỗ Trợ
          </motion.h1>
          <motion.p
            {...fadeInProps}
            transition={{ delay: 0.2, ...fadeInProps.transition }}
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8"
          >
            Tìm kiếm giải đáp cho các câu hỏi của bạn, hướng dẫn sử dụng hệ
            thống hoặc liên hệ trực tiếp với đội ngũ hỗ trợ của PTIT Events.
          </motion.p>
          <motion.div
            {...fadeInProps}
            transition={{ delay: 0.3, ...fadeInProps.transition }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm trong Câu Hỏi Thường Gặp (FAQ)..."
                className="w-full h-14 pl-12 pr-4 rounded-full text-base shadow-lg text-foreground dark:bg-slate-800 dark:border-slate-700 focus:ring-ptit-red dark:focus:ring-ptit-blue"
                value={searchTermFAQ}
                onChange={(e) => setSearchTermFAQ(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      <main className="flex-1">
        {/* Quick Support Options */}
        <section className="py-12 lg:py-16 bg-background dark:bg-slate-900">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                {
                  title: 'Câu Hỏi Thường Gặp',
                  description: 'Giải đáp nhanh các thắc mắc phổ biến.',
                  icon: HelpCircle,
                  href: '#faq-section',
                  color: 'text-sky-500 dark:text-sky-400',
                  bgColor: 'bg-sky-50 dark:bg-sky-900/30',
                },
                {
                  title: 'Hướng Dẫn Sử Dụng',
                  description: 'Tài liệu và video hướng dẫn chi tiết.',
                  icon: BookOpen,
                  href: '/guides',
                  color: 'text-emerald-500 dark:text-emerald-400',
                  bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
                },
                {
                  title: 'Gửi Yêu Cầu Hỗ Trợ',
                  description: 'Gửi ticket cho đội ngũ kỹ thuật.',
                  icon: MessageSquarePlus,
                  href: '/contact?subject=HoTroHeThong',
                  color: 'text-amber-500 dark:text-amber-400',
                  bgColor: 'bg-amber-50 dark:bg-amber-900/30',
                },
                {
                  title: 'Liên Hệ Trực Tiếp',
                  description: 'Thông tin để gọi hoặc email cho chúng tôi.',
                  icon: PhoneCall,
                  href: '#contact-info-section',
                  color: 'text-rose-500 dark:text-rose-400',
                  bgColor: 'bg-rose-50 dark:bg-rose-900/30',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  custom={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: (i) => ({
                      opacity: 1,
                      y: 0,
                      transition: { delay: i * 0.1, duration: 0.5 },
                    }),
                  }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                >
                  <Link
                    to={item.href}
                    className={`block p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full ${item.bgColor} border border-transparent hover:border-current`}
                  >
                    <item.icon className={`h-10 w-10 mb-4 ${item.color}`} />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <ChevronRight
                      className={`mt-3 h-5 w-5 ${item.color} group-hover:translate-x-1 transition-transform`}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq-section"
          className="py-16 lg:py-20 bg-card dark:bg-slate-950/50 border-t border-b dark:border-slate-800"
        >
          <div className="container mx-auto px-6">
            <motion.div
              {...fadeInProps}
              className="text-center max-w-2xl mx-auto mb-12 lg:mb-16"
            >
              <HelpCircle className="h-12 w-12 text-primary dark:text-ptit-red mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                Câu Hỏi Thường Gặp (FAQ)
              </h2>
              <p className="text-muted-foreground">
                Tìm câu trả lời cho những thắc mắc phổ biến nhất về hệ thống.
              </p>
            </motion.div>

            {isLoading ? ( // Giả định isLoading là của việc fetch FAQ
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredFaqData.length > 0 ? (
              <motion.div
                {...fadeInProps}
                transition={{ delay: 0.2, ...fadeInProps.transition }}
              >
                <Accordion
                  type="multiple" // Cho phép mở nhiều mục
                  value={activeAccordionItems}
                  onValueChange={setActiveAccordionItems}
                  className="w-full max-w-3xl mx-auto space-y-3"
                >
                  {filteredFaqData.map((category) => (
                    <AccordionItem
                      value={category.category}
                      key={category.category}
                      className="border dark:border-slate-700 rounded-lg shadow-sm bg-background dark:bg-slate-800/30"
                    >
                      <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline hover:bg-muted/50 dark:hover:bg-slate-700/50 rounded-t-lg [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center gap-3">
                          <category.icon className="h-6 w-6 text-primary dark:text-ptit-red" />
                          {category.category}
                        </div>
                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-2 text-muted-foreground space-y-3 bg-slate-50 dark:bg-slate-800/20 rounded-b-lg">
                        {category.questions.map((item, idx) => (
                          <div key={idx} className="pt-2">
                            <p className="font-medium text-foreground dark:text-slate-200 mb-1">
                              {item.q}
                            </p>
                            <p className="text-sm leading-relaxed">{item.a}</p>
                            {idx < category.questions.length - 1 && (
                              <Separator className="my-3 dark:bg-slate-700" />
                            )}
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ) : (
              <motion.p
                {...fadeInProps}
                className="text-center text-muted-foreground py-8"
              >
                Không tìm thấy câu hỏi nào phù hợp với từ khóa tìm kiếm của bạn.
              </motion.p>
            )}
          </div>
        </section>

        {/* Direct Contact Info Section */}
        <section
          id="contact-info-section"
          className="py-16 lg:py-20 bg-background dark:bg-slate-900"
        >
          <div className="container mx-auto px-6">
            <motion.div
              {...fadeInProps}
              className="text-center max-w-2xl mx-auto mb-12 lg:mb-16"
            >
              <PhoneCall className="h-12 w-12 text-primary dark:text-ptit-red mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                Liên Hệ Hỗ Trợ Trực Tiếp
              </h2>
              <p className="text-muted-foreground">
                Nếu bạn không tìm thấy câu trả lời trong FAQ hoặc cần hỗ trợ
                thêm, vui lòng liên hệ chúng tôi.
              </p>
            </motion.div>
            <motion.div
              {...fadeInProps}
              transition={{ delay: 0.2, ...fadeInProps.transition }}
            >
              <Card className="max-w-lg mx-auto shadow-xl dark:bg-slate-800/50 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Bộ Phận Hỗ Trợ Kỹ Thuật PTIT Events
                  </CardTitle>
                  <CardDescription>
                    Sẵn sàng giải đáp các vấn đề liên quan đến hệ thống.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-primary dark:text-ptit-red" />
                    <a
                      href="mailto:support.events@ptithcm.edu.vn"
                      className="hover:underline"
                    >
                      support.events@ptithcm.edu.vn
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-primary dark:text-ptit-red" />
                    <a href="tel:0283730xxxx" className="hover:underline">
                      (028) 3730 xxxx
                    </a>{' '}
                    (Nhánh: 123)
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-primary dark:text-ptit-red" />
                    <span>Thứ 2 - Thứ 6: 08:00 - 17:00</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-primary dark:text-ptit-red" />
                    <span>Phòng IT, Tòa nhà XYZ, PTITHCM</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-ptit-blue hover:bg-blue-700 dark:bg-ptit-red dark:hover:bg-red-700 text-white"
                    asChild
                  >
                    <Link to="/contact?subject=HoTroHeThongEvents">
                      Gửi Yêu Cầu Qua Form
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SupportPage;
