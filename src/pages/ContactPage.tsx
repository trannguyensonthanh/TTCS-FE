import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { PTITLogo } from '@/assets/logo';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/sonner';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Users,
  Link2,
  MessageSquare,
  User,
  Building,
  Facebook,
  Youtube,
  Linkedin,
  Twitter, // Thêm các icon mạng xã hội
  Loader2,
} from 'lucide-react';

// Component Footer (có thể import từ file chung)
const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 dark:bg-gray-950 dark:text-gray-400 border-t dark:border-slate-800">
    <div className="container mx-auto px-6 py-12 text-center">
      <PTITLogo size={48} className="mx-auto mb-4 text-white" />
      <p className="mb-2">
        Học viện Công nghệ Bưu chính Viễn thông – Cơ sở tại TP. Hồ Chí Minh
        (PTITHCM)
      </p>
      <p className="text-sm text-slate-400 dark:text-gray-500">
        © {new Date().getFullYear()} PTITHCM. Phát triển bởi Nhóm 7 - Chiến
        Thần.
      </p>
    </div>
  </footer>
);

// Zod Schema cho Contact Form
const contactFormSchema = z.object({
  hoTen: z
    .string()
    .min(2, { message: 'Họ tên phải có ít nhất 2 ký tự.' })
    .max(100),
  email: z.string().email({ message: 'Địa chỉ email không hợp lệ.' }),
  soDienThoai: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^\d{10,11}$/.test(val), {
      message: 'Số điện thoại không hợp lệ (10-11 chữ số).',
    }),
  chuDe: z
    .string()
    .min(5, { message: 'Chủ đề phải có ít nhất 5 ký tự.' })
    .max(150),
  noiDung: z
    .string()
    .min(10, { message: 'Nội dung phải có ít nhất 10 ký tự.' })
    .max(2000),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      hoTen: '',
      email: '',
      soDienThoai: '',
      chuDe: '',
      noiDung: '',
    },
  });

  const onSubmitContactForm: SubmitHandler<ContactFormValues> = async (
    data
  ) => {
    setIsSubmitting(true);
    console.log('Contact Form Data:', data);
    // TODO: Gọi API Backend để gửi email hoặc lưu tin nhắn
    // Ví dụ: await contactService.sendContactMessage(data);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Giả lập gọi API

    toast.success(
      'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.'
    );
    contactForm.reset();
    setIsSubmitting(false);
  };

  const fadeInProps = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.7, ease: 'easeOut' },
  };

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://www.facebook.com/ptithcm.official',
      color: 'hover:text-blue-600',
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://www.youtube.com/ptithochiminh',
      color: 'hover:text-red-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: '#',
      color: 'hover:text-sky-700',
    }, // Thay # bằng link LinkedIn thực tế
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-sky-500' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-gray-900 text-foreground">
      {/* Hero Section - Nhỏ gọn hơn */}
      <motion.section
        className="relative py-20 md:py-28 text-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=1740&auto=format&fit=crop')",
        }} // Ảnh nền liên quan đến liên lạc
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-primary/70 dark:bg-primary/80 mix-blend-multiply"></div>
        <div className="relative container mx-auto px-6 z-10">
          <motion.h1
            {...fadeInProps}
            className="text-4xl sm:text-5xl font-extrabold text-white mb-3 drop-shadow-lg"
          >
            Kết Nối Với Chúng Tôi
          </motion.h1>
          <motion.p
            {...fadeInProps}
            transition={{ delay: 0.2, ...fadeInProps.transition }}
            className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto drop-shadow-md"
          >
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Đừng ngần ngại liên
            hệ khi bạn cần giúp đỡ hoặc có bất kỳ thắc mắc nào.
          </motion.p>
        </div>
      </motion.section>

      <main className="flex-1">
        {/* Thông tin liên hệ và Bản đồ */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
              <motion.div {...fadeInProps} className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-primary dark:text-ptit-red">
                    Thông Tin Liên Hệ PTITHCM
                  </h2>
                  <div className="space-y-5 text-muted-foreground">
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 mr-4 mt-1 text-primary dark:text-ptit-red flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          Địa chỉ
                        </h4>
                        <p>
                          97 Man Thiện, Phường Hiệp Phú, Thành phố Thủ Đức,
                          Thành phố Hồ Chí Minh
                        </p>
                        <a
                          href="https://maps.google.com/?q=PTIT+Ho+Chi+Minh+97+Man+Thien"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline dark:text-ptit-red"
                        >
                          Xem trên bản đồ
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-6 w-6 mr-4 mt-1 text-primary dark:text-ptit-red flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          Điện thoại
                        </h4>
                        <p>
                          <a
                            href="tel:02837307979"
                            className="hover:text-primary dark:hover:text-ptit-red"
                          >
                            (028) 3730 7979
                          </a>{' '}
                          - Văn phòng
                        </p>
                        <p>
                          <a
                            href="tel:02838295258"
                            className="hover:text-primary dark:hover:text-ptit-red"
                          >
                            (028) 3829 5258
                          </a>{' '}
                          - Tư vấn Tuyển sinh
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-6 w-6 mr-4 mt-1 text-primary dark:text-ptit-red flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          Email
                        </h4>
                        <p>
                          <a
                            href="mailto:info@ptithcm.edu.vn"
                            className="hover:text-primary dark:hover:text-ptit-red"
                          >
                            info@ptithcm.edu.vn
                          </a>{' '}
                          (Thông tin chung)
                        </p>
                        <p>
                          <a
                            href="mailto:tuyensinh@ptithcm.edu.vn"
                            className="hover:text-primary dark:hover:text-ptit-red"
                          >
                            tuyensinh@ptithcm.edu.vn
                          </a>{' '}
                          (Tuyển sinh)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-6 w-6 mr-4 mt-1 text-primary dark:text-ptit-red flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">
                          Giờ làm việc
                        </h4>
                        <p>Thứ 2 - Thứ 6: 07:30 - 11:30 & 13:30 - 17:00</p>
                        <p>Thứ 7: 07:30 - 11:30</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-primary dark:text-ptit-red">
                    Kết nối qua Mạng Xã Hội
                  </h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.name}
                        className={`text-muted-foreground ${link.color} transition-colors`}
                      >
                        <link.icon className="h-7 w-7" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                {...fadeInProps}
                transition={{ delay: 0.2, ...fadeInProps.transition }}
                className="h-[400px] md:h-full w-full rounded-xl overflow-hidden shadow-2xl"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.520072541681!2d106.78408977476717!3d10.847992257870175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752772b245dff1%3A0xb838977f3d419d!2sPosts%20and%20Telecommunications%20Institute%20of%20Technology%20HCM%20Branch!5e0!3m2!1sen!2s!4v1749003623191!5m2!1sen!2s"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 lg:py-20 bg-card dark:bg-slate-900 border-t dark:border-slate-800">
          <div className="container mx-auto px-6">
            <motion.div
              {...fadeInProps}
              className="text-center max-w-2xl mx-auto mb-12 lg:mb-16"
            >
              <MessageSquare className="h-12 w-12 text-primary dark:text-ptit-red mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                Gửi Tin Nhắn Cho Chúng Tôi
              </h2>
              <p className="text-muted-foreground">
                Có câu hỏi hoặc cần hỗ trợ? Điền vào form dưới đây và chúng tôi
                sẽ liên hệ lại với bạn.
              </p>
            </motion.div>

            <motion.div
              {...fadeInProps}
              transition={{ delay: 0.2, ...fadeInProps.transition }}
              className="max-w-2xl mx-auto"
            >
              <Form {...contactForm}>
                <form
                  onSubmit={contactForm.handleSubmit(onSubmitContactForm)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={contactForm.control}
                      name="hoTen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            Họ và tên{' '}
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nguyễn Văn A" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            Email{' '}
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={contactForm.control}
                      name="soDienThoai"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            Số điện thoại (Tùy chọn)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="09xxxxxxxx"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="chuDe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                            Chủ đề/Đơn vị liên quan{' '}
                            <span className="text-destructive ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="VD: Hỗ trợ kỹ thuật hệ thống sự kiện"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={contactForm.control}
                    name="noiDung"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                          Nội dung tin nhắn{' '}
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập nội dung chi tiết bạn muốn trao đổi..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      className="px-8 bg-ptit-red hover:bg-red-700 dark:bg-ptit-blue dark:hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-5 w-5" />
                      )}
                      Gửi Tin Nhắn
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
